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
		return rtrim( get_option( 'frs_twenty_crm_url', 'https://data.c21frs.com' ), '/' );
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

		// Sync headshot URL to Twenty CRM as avatarUrl (Twenty's built-in field).
		$headshot_url = \FRSUsers\Core\Avatar::get_url( $user->ID );
		if ( $headshot_url ) {
			$payload['avatarUrl'] = $headshot_url;
		}

		// Add social links
		// All social URL fields in Twenty CRM are LINKS type: { primaryLinkUrl: url }
		$link_fields = array(
			'linkedin_url'  => 'linkedinLink',
			'twitter_url'   => 'xLink',
			'facebook_url'  => 'facebookUrl',
			'instagram_url' => 'instagramUrl',
			'youtube_url'   => 'youtubeUrl',
			'century21_url' => 'century21Url',
			'zillow_url'    => 'zillowUrl',
			'realtor_url'   => 'realtorUrl',
		);

		foreach ( $link_fields as $meta_key => $twenty_field ) {
			$url = get_user_meta( $user->ID, 'frs_' . $meta_key, true );
			if ( $url ) {
				$payload[ $twenty_field ] = array(
					'primaryLinkUrl' => $url,
				);
			}
		}

		// Sync active status — Twenty CRM uses SELECT with uppercase values.
		$is_active = get_user_meta( $user->ID, 'frs_is_active', true );
		if ( $is_active !== '' ) {
			$payload['status'] = ( (int) $is_active === 1 ) ? 'ACTIVE' : 'INACTIVE';
		}

		// Sync service areas.
		$service_areas = get_user_meta( $user->ID, 'frs_service_areas', true );
		if ( $service_areas ) {
			$payload['serviceZipCodes'] = $service_areas;
		}

		// Add MULTI_SELECT arrays — Twenty CRM expects uppercase enum values.
		$specialties = get_user_meta( $user->ID, 'frs_specialties', true );
		if ( $specialties && is_array( $specialties ) ) {
			$payload['specialties'] = array_map( function ( $s ) {
				return strtoupper( str_replace( ' ', '_', $s ) );
			}, $specialties );
		}

		$languages = get_user_meta( $user->ID, 'frs_languages', true );
		if ( $languages && is_array( $languages ) ) {
			$payload['languages'] = array_map( function ( $l ) {
				return strtoupper( str_replace( ' ', '_', $l ) );
			}, $languages );
		}

		// Add person roles — map WP lowercase to Twenty CRM uppercase MULTI_SELECT.
		$wp_to_twenty_roles = array(
			'loan_originator'  => 'MLO',
			'broker_associate' => 'BROKER_ASSOCIATE',
			'sales_associate'  => 'SALES_ASSOCIATE',
			'escrow_officer'   => 'ESCROW_OFFICER',
			'property_manager' => 'PROPERTY_MANAGER',
			'staff'            => 'STAFF',
			'admin_staff'      => 'ADMIN',
			'leadership'       => 'LEADERSHIP',
			'executive'        => 'REGIONAL_MANAGER',
		);
		$company_roles = get_user_meta( $user->ID, 'frs_company_role', false );
		if ( $company_roles ) {
			$twenty_roles = array();
			foreach ( $company_roles as $role ) {
				$twenty_roles[] = $wp_to_twenty_roles[ $role ] ?? strtoupper( str_replace( ' ', '_', $role ) );
			}
			$payload['personRoles'] = $twenty_roles;
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
					'filter[emails.primaryEmail][eq]' => $user->user_email,
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

		// Save Twenty CRM ID — POST /rest/people returns { data: { id: "..." } }
		if ( ! empty( $body['data']['id'] ) ) {
			update_user_meta( $user->ID, 'frs_twenty_crm_id', $body['data']['id'] );
		} elseif ( ! empty( $body['data']['people']['id'] ) ) {
			update_user_meta( $user->ID, 'frs_twenty_crm_id', $body['data']['people']['id'] );
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

		// Map Twenty CRM uppercase MULTI_SELECT roles to WP lowercase.
		$twenty_to_wp_roles = array(
			'MLO'              => 'loan_originator',
			'SALES_ASSOCIATE'  => 'sales_associate',
			'BROKER_ASSOCIATE' => 'broker_associate',
			'ESCROW_OFFICER'   => 'escrow_officer',
			'PROPERTY_MANAGER' => 'property_manager',
			'STAFF'            => 'staff',
			'ADMIN'            => 'admin_staff',
			'LEADERSHIP'       => 'leadership',
			'REGIONAL_MANAGER' => 'executive',
			'LENDER_AE'        => 'loan_originator',
		);

		$person_roles_raw = $person['personRoles'] ?? array();
		$person_roles_wp  = array();
		foreach ( $person_roles_raw as $role ) {
			$person_roles_wp[] = $twenty_to_wp_roles[ $role ] ?? strtolower( $role );
		}

		// Check if person has any of the sync roles
		$sync_roles = get_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );

		if ( ! empty( $sync_roles ) && ! empty( $person_roles_wp ) ) {
			$has_sync_role = array_intersect( $person_roles_wp, $sync_roles );
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

		// On marketing sites (no profile editing), just invalidate cache instead of creating users.
		if ( ! \FRSUsers\Core\Roles::is_profile_editing_enabled() ) {
			$twenty_id = $person['id'] ?? '';
			$source    = new \FRSUsers\RemoteData\TwentyDataSource();
			$source->invalidate_cache( $twenty_id ?: null );
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'Cache invalidated on marketing site.',
				),
				200
			);
		}

		$email      = $person['emails']['primaryEmail'] ?? $person['email'];
		$first_name = $person['name']['firstName'] ?? $person['first_name'] ?? '';
		$last_name  = $person['name']['lastName'] ?? $person['last_name'] ?? '';
		$twenty_id  = $person['id'] ?? '';

		// Find existing user - do NOT create new users on marketing sites
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
			// On marketing sites (non-editing contexts), don't create users.
			// Profiles are fetched remotely from Twenty CRM instead.
			if ( ! \FRSUsers\Core\Roles::is_profile_editing_enabled() ) {
				return new \WP_Error(
					'user_creation_skipped',
					'Marketing site does not create local users.',
					array( 'status' => 200 )
				);
			}

			// Create new user (hub/development only)
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

		// Sync simple meta fields
		$meta_mapping = array(
			'jobTitle'      => 'frs_job_title',
			'nmlsNumber'    => 'frs_nmls',
			'licenseNumber' => 'frs_license_number',
			'city'          => 'frs_city_state',
			'frsId'         => 'frs_agent_id',
		);

		foreach ( $meta_mapping as $twenty_field => $wp_meta ) {
			if ( isset( $person[ $twenty_field ] ) ) {
				update_user_meta( $user_id, $wp_meta, $person[ $twenty_field ] );
			}
		}

		// Sync company roles — store as WP lowercase multi-value meta.
		// Delete existing then re-add each role.
		delete_user_meta( $user_id, 'frs_company_role' );
		foreach ( $person_roles_wp as $wp_role ) {
			add_user_meta( $user_id, 'frs_company_role', $wp_role );
		}

		// Sync specialties — convert from uppercase MULTI_SELECT to human-readable.
		if ( isset( $person['specialties'] ) && is_array( $person['specialties'] ) ) {
			$wp_specialties = array_map( function ( $s ) {
				return ucwords( strtolower( str_replace( '_', ' ', $s ) ) );
			}, $person['specialties'] );
			update_user_meta( $user_id, 'frs_specialties', $wp_specialties );
		}

		// Sync languages — convert from uppercase MULTI_SELECT to human-readable.
		if ( isset( $person['languages'] ) && is_array( $person['languages'] ) ) {
			$wp_languages = array_map( function ( $l ) {
				return ucwords( strtolower( str_replace( '_', ' ', $l ) ) );
			}, $person['languages'] );
			update_user_meta( $user_id, 'frs_languages', $wp_languages );
		}

		// Sync status — SELECT field, plain string.
		if ( isset( $person['status'] ) ) {
			$is_active = ( strtoupper( $person['status'] ) === 'ACTIVE' ) ? 1 : 0;
			update_user_meta( $user_id, 'frs_is_active', $is_active );
		}

		// Sync avatar from Twenty CRM - download and store as local attachment.
		if ( ! empty( $person['avatarUrl'] ) ) {
			$attachment_id = \FRSUsers\Core\ProfileSync::sync_remote_image( $person['avatarUrl'] );
			if ( $attachment_id ) {
				\FRSUsers\Core\Avatar::set( $user_id, $attachment_id );
			}
		}

		// Sync service areas.
		if ( isset( $person['serviceZipCodes'] ) ) {
			update_user_meta( $user_id, 'frs_service_areas', $person['serviceZipCodes'] );
		}

		// Sync phone
		if ( ! empty( $person['phones']['primaryPhoneNumber'] ) ) {
			update_user_meta( $user_id, 'frs_phone_number', $person['phones']['primaryPhoneNumber'] );
		}

		// Sync biography — RICH_TEXT_V2 has { markdown: "..." }
		if ( ! empty( $person['biography']['markdown'] ) ) {
			update_user_meta( $user_id, 'frs_biography', $person['biography']['markdown'] );
		}

		// Sync social links — all are LINKS type in Twenty: { primaryLinkUrl: url }
		$social_mapping = array(
			'linkedinLink'  => 'frs_linkedin_url',
			'xLink'         => 'frs_twitter_url',
			'facebookUrl'   => 'frs_facebook_url',
			'instagramUrl'  => 'frs_instagram_url',
			'youtubeUrl'    => 'frs_youtube_url',
			'century21Url'  => 'frs_century21_url',
			'zillowUrl'     => 'frs_zillow_url',
			'realtorUrl'    => 'frs_realtor_url',
		);

		foreach ( $social_mapping as $twenty_field => $wp_meta ) {
			if ( isset( $person[ $twenty_field ] ) ) {
				// Extract URL from LINKS format { primaryLinkUrl: url }
				if ( is_array( $person[ $twenty_field ] ) && ! empty( $person[ $twenty_field ]['primaryLinkUrl'] ) ) {
					update_user_meta( $user_id, $wp_meta, $person[ $twenty_field ]['primaryLinkUrl'] );
				} elseif ( is_string( $person[ $twenty_field ] ) && ! empty( $person[ $twenty_field ] ) ) {
					update_user_meta( $user_id, $wp_meta, $person[ $twenty_field ] );
				}
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
