<?php
/**
 * Twenty CRM Integration
 *
 * Bidirectional sync between WordPress and Twenty CRM.
 *
 * @package FRSUsers
 * @subpackage Integrations
 * @since 4.0.0
 */

namespace FRSUsers\Integrations;

use FRSUsers\Models\Profile;

/**
 * Class TwentyCRMSync
 *
 * Handles synchronization with Twenty CRM.
 */
class TwentyCRMSync {

	/**
	 * Initialize Twenty CRM sync hooks
	 *
	 * @return void
	 */
	public static function init() {
		// Send updates to Twenty CRM when profiles change
		add_action( 'frs_profile_saved', array( __CLASS__, 'sync_to_twenty' ), 10, 2 );
		add_action( 'profile_update', array( __CLASS__, 'sync_user_to_twenty' ), 10, 2 );

		// Register Twenty CRM webhook receiver
		add_action( 'rest_api_init', array( __CLASS__, 'register_webhook_endpoint' ) );
	}

	/**
	 * Check if Twenty CRM sync is enabled
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return (bool) get_option( 'frs_twenty_crm_enabled', false );
	}

	/**
	 * Check if user should be synced based on company roles
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	private static function should_sync_user( $user_id ) {
		$sync_roles = get_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );

		if ( empty( $sync_roles ) ) {
			return false;
		}

		$user_roles = get_user_meta( $user_id, 'frs_company_role', false );

		if ( empty( $user_roles ) ) {
			return false;
		}

		// Check if user has any of the selected sync roles
		$has_sync_role = array_intersect( $user_roles, $sync_roles );

		return ! empty( $has_sync_role );
	}

	/**
	 * Get Twenty CRM API URL
	 *
	 * @return string
	 */
	private static function get_api_url() {
		return get_option( 'frs_twenty_crm_url', 'https://20.frs.works' );
	}

	/**
	 * Get Twenty CRM API key
	 *
	 * @return string
	 */
	private static function get_api_key() {
		return get_option( 'frs_twenty_crm_api_key', '' );
	}

	/**
	 * Get webhook secret
	 *
	 * @return string
	 */
	private static function get_webhook_secret() {
		return get_option( 'frs_twenty_crm_webhook_secret', '' );
	}

	/**
	 * Register webhook receiver endpoint
	 *
	 * @return void
	 */
	public static function register_webhook_endpoint() {
		register_rest_route(
			'frs-users/v1',
			'/webhook/twenty-crm',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_webhook' ),
				'permission_callback' => array( __CLASS__, 'verify_webhook_signature' ),
			)
		);
	}

	/**
	 * Sync profile to Twenty CRM when saved
	 *
	 * @param int   $profile_id Profile/User ID.
	 * @param array $profile_data Profile data that was saved.
	 * @return void
	 */
	public static function sync_to_twenty( $profile_id, $profile_data ) {
		if ( ! self::is_enabled() ) {
			return;
		}

		if ( ! self::should_sync_user( $profile_id ) ) {
			return;
		}

		$user = get_userdata( $profile_id );
		if ( ! $user ) {
			return;
		}

		self::send_to_twenty( $user );
	}

	/**
	 * Sync user to Twenty CRM on profile update
	 *
	 * @param int      $user_id User ID.
	 * @param \WP_User $old_user_data Old user data.
	 * @return void
	 */
	public static function sync_user_to_twenty( $user_id, $old_user_data ) {
		if ( ! self::is_enabled() ) {
			return;
		}

		if ( ! self::should_sync_user( $user_id ) ) {
			return;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		self::send_to_twenty( $user );
	}

	/**
	 * Send user data to Twenty CRM
	 *
	 * @param \WP_User $user User object.
	 * @return array|\WP_Error Result or error.
	 */
	private static function send_to_twenty( $user ) {
		$api_url = self::get_api_url();
		$api_key = self::get_api_key();

		if ( empty( $api_url ) || empty( $api_key ) ) {
			return new \WP_Error(
				'twenty_not_configured',
				__( 'Twenty CRM API not configured.', 'frs-users' )
			);
		}

		// Get Twenty CRM ID if already synced
		$twenty_id = get_user_meta( $user->ID, 'frs_twenty_crm_id', true );

		// Build Twenty CRM payload
		$payload = array(
			'name' => array(
				'firstName' => $user->first_name,
				'lastName'  => $user->last_name,
			),
			'emails' => array(
				'primaryEmail' => $user->user_email,
			),
		);

		// Add optional fields
		$phone = get_user_meta( $user->ID, 'frs_phone_number', true );
		if ( $phone ) {
			$payload['phones'] = array(
				'primaryPhoneNumber' => $phone,
			);
		}

		$job_title = get_user_meta( $user->ID, 'frs_job_title', true );
		if ( $job_title ) {
			$payload['jobTitle'] = $job_title;
		}

		$nmls = get_user_meta( $user->ID, 'frs_nmls', true );
		if ( $nmls ) {
			$payload['nmlsNumber'] = $nmls;
		}

		$license = get_user_meta( $user->ID, 'frs_license_number', true );
		if ( $license ) {
			$payload['licenseNumber'] = $license;
		}

		$bio = get_user_meta( $user->ID, 'frs_biography', true );
		if ( $bio ) {
			$payload['biography'] = array(
				'markdown' => $bio,
			);
		}

		// Sync headshot CDN URL to Twenty CRM
		$headshot_url = get_user_meta( $user->ID, 'frs_headshot_url', true );
		if ( $headshot_url ) {
			$payload['headshotUrl'] = $headshot_url;
		}

		// Add social links
		$social_fields = array(
			'linkedin_url'  => 'linkedinLink',
			'facebook_url'  => 'facebookUrl',
			'instagram_url' => 'instagramUrl',
			'twitter_url'   => 'twitterUrl',
			'youtube_url'   => 'youtubeUrl',
			'tiktok_url'    => 'tiktokUrl',
			'century21_url' => 'century21Url',
			'zillow_url'    => 'zillowUrl',
		);

		foreach ( $social_fields as $meta_key => $twenty_field ) {
			$url = get_user_meta( $user->ID, 'frs_' . $meta_key, true );
			if ( $url ) {
				$payload[ $twenty_field ] = array(
					'primaryLinkUrl' => $url,
				);
			}
		}

		// Add arrays
		$array_fields = array(
			'specialties' => 'specialties',
			'languages'   => 'languages',
		);

		foreach ( $array_fields as $meta_key => $twenty_field ) {
			$value = get_user_meta( $user->ID, 'frs_' . $meta_key, true );
			if ( $value && is_array( $value ) ) {
				$payload[ $twenty_field ] = $value;
			}
		}

		// Add person roles
		$company_roles = get_user_meta( $user->ID, 'frs_company_role', false );
		if ( $company_roles ) {
			$payload['personRoles'] = $company_roles;
		}

		// Determine endpoint and method
		if ( $twenty_id ) {
			// Update existing
			$endpoint = "/rest/people/{$twenty_id}";
			$method   = 'PATCH';
		} else {
			// Search by email first
			$search_url = add_query_arg(
				array(
					'filter[emails.primaryEmail][eq]' => urlencode( $user->user_email ),
				),
				trailingslashit( $api_url ) . 'rest/people'
			);

			$search_response = wp_remote_get(
				$search_url,
				array(
					'headers' => array(
						'Authorization' => 'Bearer ' . $api_key,
						'Content-Type'  => 'application/json',
					),
					'timeout' => 30,
				)
			);

			if ( ! is_wp_error( $search_response ) ) {
				$search_body = json_decode( wp_remote_retrieve_body( $search_response ), true );
				if ( ! empty( $search_body['data']['people'][0]['id'] ) ) {
					// Found existing person
					$twenty_id = $search_body['data']['people'][0]['id'];
					update_user_meta( $user->ID, 'frs_twenty_crm_id', $twenty_id );
					$endpoint = "/rest/people/{$twenty_id}";
					$method   = 'PATCH';
				}
			}

			// If still no ID, create new
			if ( ! $twenty_id ) {
				$endpoint = '/rest/people';
				$method   = 'POST';
			}
		}

		// Send to Twenty CRM
		$url = trailingslashit( $api_url ) . ltrim( $endpoint, '/' );

		$response = wp_remote_request(
			$url,
			array(
				'method'  => $method,
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 30,
			)
		);

		if ( is_wp_error( $response ) ) {
			error_log( sprintf(
				'[Twenty CRM Sync] Failed to sync user %d: %s',
				$user->ID,
				$response->get_error_message()
			) );
			return $response;
		}

		$status = wp_remote_retrieve_response_code( $response );
		$body   = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $status < 200 || $status >= 300 ) {
			error_log( sprintf(
				'[Twenty CRM Sync] HTTP %d for user %d: %s',
				$status,
				$user->ID,
				wp_remote_retrieve_body( $response )
			) );
			return new \WP_Error( 'twenty_api_error', "HTTP {$status}" );
		}

		// Save Twenty CRM ID
		if ( ! empty( $body['data']['people']['id'] ) ) {
			update_user_meta( $user->ID, 'frs_twenty_crm_id', $body['data']['people']['id'] );
		} elseif ( ! empty( $body['data']['id'] ) ) {
			update_user_meta( $user->ID, 'frs_twenty_crm_id', $body['data']['id'] );
		}

		return array(
			'success' => true,
			'status'  => $status,
			'body'    => $body,
		);
	}

	/**
	 * Verify webhook signature from Twenty CRM
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool|\WP_Error True if valid, WP_Error if not.
	 */
	public static function verify_webhook_signature( $request ) {
		$secret = self::get_webhook_secret();

		if ( empty( $secret ) ) {
			return new \WP_Error(
				'webhook_not_configured',
				__( 'Twenty CRM webhook secret not configured.', 'frs-users' ),
				array( 'status' => 403 )
			);
		}

		$signature = $request->get_header( 'X-FRS-Signature' );

		if ( empty( $signature ) ) {
			return new \WP_Error(
				'missing_signature',
				__( 'Missing webhook signature.', 'frs-users' ),
				array( 'status' => 401 )
			);
		}

		$body     = $request->get_body();
		$expected = hash_hmac( 'sha256', $body, $secret );

		if ( ! hash_equals( $expected, $signature ) ) {
			return new \WP_Error(
				'invalid_signature',
				__( 'Invalid webhook signature.', 'frs-users' ),
				array( 'status' => 401 )
			);
		}

		return true;
	}

	/**
	 * Handle incoming webhook from Twenty CRM
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error Response.
	 */
	public static function handle_webhook( $request ) {
		$payload = $request->get_json_params();

		if ( empty( $payload['event'] ) ) {
			return new \WP_Error(
				'invalid_payload',
				__( 'Invalid webhook payload.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		switch ( $payload['event'] ) {
			case 'profile_updated':
			case 'record.updated':
				return self::handle_person_updated( $payload );

			case 'profile_deleted':
			case 'record.deleted':
				return self::handle_person_deleted( $payload );

			default:
				return new \WP_Error(
					'unknown_event',
					__( 'Unknown webhook event.', 'frs-users' ),
					array( 'status' => 400 )
				);
		}
	}

	/**
	 * Handle person updated from Twenty CRM
	 *
	 * @param array $payload Webhook payload.
	 * @return \WP_REST_Response|\WP_Error Response.
	 */
	private static function handle_person_updated( $payload ) {
		$person = $payload['profile'] ?? $payload['record'] ?? null;

		if ( empty( $person ) || empty( $person['emails']['primaryEmail'] ?? $person['email'] ) ) {
			return new \WP_Error(
				'missing_person_data',
				__( 'Missing person data in webhook.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Check if person has any of the sync roles
		$sync_roles = get_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );
		$person_roles = $person['personRoles'] ?? array();

		if ( ! empty( $sync_roles ) && ! empty( $person_roles ) ) {
			$has_sync_role = array_intersect( $person_roles, $sync_roles );
			if ( empty( $has_sync_role ) ) {
				return new \WP_REST_Response(
					array(
						'success' => true,
						'message' => 'Person does not have any sync roles. Skipped.',
					),
					200
				);
			}
		}

		$email      = $person['emails']['primaryEmail'] ?? $person['email'];
		$first_name = $person['name']['firstName'] ?? $person['first_name'] ?? '';
		$last_name  = $person['name']['lastName'] ?? $person['last_name'] ?? '';
		$twenty_id  = $person['id'] ?? '';

		// Find or create user
		$user = get_user_by( 'email', $email );

		if ( $user ) {
			$user_id = $user->ID;

			// Update user data
			wp_update_user( array(
				'ID'         => $user_id,
				'first_name' => $first_name,
				'last_name'  => $last_name,
			) );

			$action = 'updated';
		} else {
			// Create new user
			$username = sanitize_user( strtolower( $first_name . '.' . $last_name ) );
			$username = str_replace( ' ', '', $username );

			if ( username_exists( $username ) ) {
				$username .= wp_rand( 1, 999 );
			}

			$user_id = wp_insert_user( array(
				'user_login'   => $username,
				'user_email'   => $email,
				'first_name'   => $first_name,
				'last_name'    => $last_name,
				'display_name' => trim( $first_name . ' ' . $last_name ),
				'user_pass'    => wp_generate_password(),
				'role'         => 'subscriber',
			) );

			if ( is_wp_error( $user_id ) ) {
				return $user_id;
			}

			$action = 'created';
		}

		// Store Twenty CRM ID
		if ( $twenty_id ) {
			update_user_meta( $user_id, 'frs_twenty_crm_id', $twenty_id );
		}

		// Sync meta fields
		$meta_mapping = array(
			'jobTitle'      => 'frs_job_title',
			'nmlsNumber'    => 'frs_nmls',
			'licenseNumber' => 'frs_license_number',
			'city'          => 'frs_city_state',
			'personRoles'   => 'frs_company_role',
			'specialties'   => 'frs_specialties',
			'languages'     => 'frs_languages',
			'frsId'         => 'frs_agent_id',
		);

		foreach ( $meta_mapping as $twenty_field => $wp_meta ) {
			if ( isset( $person[ $twenty_field ] ) ) {
				update_user_meta( $user_id, $wp_meta, $person[ $twenty_field ] );
			}
		}

		// Sync phone
		if ( ! empty( $person['phones']['primaryPhoneNumber'] ) ) {
			update_user_meta( $user_id, 'frs_phone_number', $person['phones']['primaryPhoneNumber'] );
		}

		// Sync biography
		if ( ! empty( $person['biography']['markdown'] ) ) {
			update_user_meta( $user_id, 'frs_biography', $person['biography']['markdown'] );
		}

		// Sync social links
		$social_mapping = array(
			'linkedinLink'  => 'frs_linkedin_url',
			'facebookUrl'   => 'frs_facebook_url',
			'instagramUrl'  => 'frs_instagram_url',
			'twitterUrl'    => 'frs_twitter_url',
			'youtubeUrl'    => 'frs_youtube_url',
			'tiktokUrl'     => 'frs_tiktok_url',
			'century21Url'  => 'frs_century21_url',
			'zillowUrl'     => 'frs_zillow_url',
		);

		foreach ( $social_mapping as $twenty_field => $wp_meta ) {
			if ( ! empty( $person[ $twenty_field ]['primaryLinkUrl'] ) ) {
				update_user_meta( $user_id, $wp_meta, $person[ $twenty_field ]['primaryLinkUrl'] );
			}
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'action'  => $action,
				'user_id' => $user_id,
				'message' => sprintf( 'User %s successfully.', $action ),
			),
			200
		);
	}

	/**
	 * Handle person deleted from Twenty CRM
	 *
	 * @param array $payload Webhook payload.
	 * @return \WP_REST_Response Response.
	 */
	private static function handle_person_deleted( $payload ) {
		$email = $payload['email'] ?? '';

		if ( empty( $email ) ) {
			return new \WP_Error(
				'missing_email',
				__( 'Missing email in delete webhook.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		$user = get_user_by( 'email', $email );

		if ( ! $user ) {
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'User not found (already deleted or never existed).',
				),
				200
			);
		}

		// Deactivate instead of delete
		update_user_meta( $user->ID, 'frs_is_active', 0 );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => 'User deactivated.',
				'user_id' => $user->ID,
			),
			200
		);
	}
}
