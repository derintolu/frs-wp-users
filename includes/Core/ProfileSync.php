<?php
/**
 * Profile Sync
 *
 * Handles synchronization of profiles between hub and marketing sites.
 * - Hub sends webhooks when profiles are updated
 * - Marketing sites receive webhooks and update local users
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 3.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;

/**
 * Class ProfileSync
 *
 * Manages profile synchronization via webhooks.
 */
class ProfileSync {

	/**
	 * Initialize sync hooks
	 *
	 * @return void
	 */
	public static function init() {
		// Only send webhooks if this is the hub (editing enabled)
		if ( Roles::is_profile_editing_enabled() ) {
			add_action( 'frs_profile_saved', array( __CLASS__, 'send_webhook_on_save' ), 10, 2 );
			add_action( 'profile_update', array( __CLASS__, 'send_webhook_on_user_update' ), 10, 2 );
		}

		// Register webhook receiver endpoint
		add_action( 'rest_api_init', array( __CLASS__, 'register_webhook_endpoint' ) );
	}

	/**
	 * Register webhook receiver REST endpoint
	 *
	 * @return void
	 */
	public static function register_webhook_endpoint() {
		register_rest_route(
			'frs-users/v1',
			'/webhook/profile-updated',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_webhook' ),
				'permission_callback' => array( __CLASS__, 'verify_webhook_signature' ),
			)
		);
	}

	/**
	 * Send webhook when profile is saved via FRS
	 *
	 * @param int   $profile_id Profile/User ID.
	 * @param array $profile_data Profile data that was saved.
	 * @return void
	 */
	public static function send_webhook_on_save( $profile_id, $profile_data ) {
		self::send_profile_webhook( $profile_id );
	}

	/**
	 * Send webhook when WordPress user profile is updated
	 *
	 * @param int      $user_id User ID.
	 * @param \WP_User $old_user_data Old user data.
	 * @return void
	 */
	public static function send_webhook_on_user_update( $user_id, $old_user_data ) {
		// Only send for users with FRS roles
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		$frs_roles = Roles::get_wp_role_slugs();
		$user_roles = (array) $user->roles;

		if ( ! array_intersect( $frs_roles, $user_roles ) ) {
			return;
		}

		self::send_profile_webhook( $user_id );
	}

	/**
	 * Send profile data to all configured webhook endpoints
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	private static function send_profile_webhook( $user_id ) {
		$endpoints = get_option( 'frs_webhook_endpoints', array() );

		if ( empty( $endpoints ) ) {
			return;
		}

		// Get full profile data
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		$profile = Profile::hydrate_from_user( $user );
		$payload = array(
			'event'     => 'profile_updated',
			'timestamp' => time(),
			'profile'   => $profile->toArray(),
		);

		$secret = get_option( 'frs_webhook_secret', '' );

		foreach ( $endpoints as $endpoint ) {
			self::send_webhook( $endpoint, $payload, $secret );
		}
	}

	/**
	 * Send webhook to a single endpoint
	 *
	 * @param string $url     Endpoint URL.
	 * @param array  $payload Data to send.
	 * @param string $secret  Webhook secret for signing.
	 * @return bool Success or failure.
	 */
	private static function send_webhook( $url, $payload, $secret ) {
		$body = wp_json_encode( $payload );

		$headers = array(
			'Content-Type' => 'application/json',
		);

		// Sign the payload
		if ( $secret ) {
			$signature = hash_hmac( 'sha256', $body, $secret );
			$headers['X-FRS-Signature'] = $signature;
		}

		$response = wp_remote_post( $url, array(
			'timeout' => 30,
			'headers' => $headers,
			'body'    => $body,
		) );

		if ( is_wp_error( $response ) ) {
			error_log( sprintf(
				'[FRS Sync] Webhook failed to %s: %s',
				$url,
				$response->get_error_message()
			) );
			return false;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( $status < 200 || $status >= 300 ) {
			error_log( sprintf(
				'[FRS Sync] Webhook to %s returned HTTP %d',
				$url,
				$status
			) );
			return false;
		}

		return true;
	}

	/**
	 * Verify webhook signature
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool|\WP_Error True if valid, WP_Error if not.
	 */
	public static function verify_webhook_signature( $request ) {
		$secret = get_option( 'frs_webhook_secret', '' );

		// If no secret configured, reject all webhooks
		if ( empty( $secret ) ) {
			return new \WP_Error(
				'webhook_not_configured',
				__( 'Webhook secret not configured on this site.', 'frs-users' ),
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

		$body = $request->get_body();
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
	 * Handle incoming webhook
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
				return self::handle_profile_updated( $payload );

			case 'profile_deleted':
				return self::handle_profile_deleted( $payload );

			default:
				return new \WP_Error(
					'unknown_event',
					__( 'Unknown webhook event.', 'frs-users' ),
					array( 'status' => 400 )
				);
		}
	}

	/**
	 * Handle profile_updated webhook event
	 *
	 * @param array $payload Webhook payload.
	 * @return \WP_REST_Response|\WP_Error Response.
	 */
	private static function handle_profile_updated( $payload ) {
		if ( empty( $payload['profile'] ) || empty( $payload['profile']['email'] ) ) {
			return new \WP_Error(
				'missing_profile_data',
				__( 'Missing profile data in webhook.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		$profile_data = $payload['profile'];
		$email = $profile_data['email'];

		// Check if this profile's company role is active for this site
		$company_role = $profile_data['select_person_type'] ?? '';
		if ( $company_role && ! Roles::is_company_role_active( $company_role ) ) {
			// Skip profiles not relevant to this site
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'Profile skipped (company role not active for this site).',
				),
				200
			);
		}

		// Find or create user
		$user = get_user_by( 'email', $email );

		if ( $user ) {
			$user_id = $user->ID;

			// Update user data
			wp_update_user( array(
				'ID'           => $user_id,
				'first_name'   => $profile_data['first_name'] ?? '',
				'last_name'    => $profile_data['last_name'] ?? '',
				'display_name' => $profile_data['display_name'] ?? '',
			) );

			$action = 'updated';
		} else {
			// Create new user
			$first_name = $profile_data['first_name'] ?? '';
			$last_name  = $profile_data['last_name'] ?? '';
			$username   = sanitize_user( strtolower( $first_name . '.' . $last_name ) );
			$username   = str_replace( ' ', '', $username );

			if ( username_exists( $username ) ) {
				$username .= wp_rand( 1, 999 );
			}

			$user_id = wp_insert_user( array(
				'user_login'   => $username,
				'user_email'   => $email,
				'first_name'   => $first_name,
				'last_name'    => $last_name,
				'display_name' => $profile_data['display_name'] ?? trim( $first_name . ' ' . $last_name ),
				'user_pass'    => wp_generate_password(),
				'role'         => 'subscriber',
			) );

			if ( is_wp_error( $user_id ) ) {
				return new \WP_Error(
					'user_creation_failed',
					$user_id->get_error_message(),
					array( 'status' => 500 )
				);
			}

			$action = 'created';
		}

		// Sync FRS meta fields
		$meta_fields = array(
			'phone_number',
			'mobile_number',
			'job_title',
			'nmls',
			'dre_license',
			'biography',
			'city_state',
			'region',
			'office',
			'linkedin_url',
			'facebook_url',
			'instagram_url',
			'twitter_url',
			'youtube_url',
			'tiktok_url',
			'century21_url',
			'zillow_url',
			'is_active',
			'select_person_type',
			'profile_slug',
			'arrive',
			'service_areas',
			'specialties',
			'languages',
			'company_roles',
		);

		foreach ( $meta_fields as $field ) {
			if ( isset( $profile_data[ $field ] ) ) {
				update_user_meta( $user_id, 'frs_' . $field, $profile_data[ $field ] );
			}
		}

		// Set WordPress role
		if ( ! empty( $profile_data['select_person_type'] ) ) {
			$wp_role = Roles::get_wp_role_for_company_role( $profile_data['select_person_type'] );
			if ( $wp_role ) {
				$user_obj = new \WP_User( $user_id );
				$user_obj->set_role( $wp_role );
			}
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'action'  => $action,
				'user_id' => $user_id,
				'message' => sprintf( 'Profile %s successfully.', $action ),
			),
			200
		);
	}

	/**
	 * Handle profile_deleted webhook event
	 *
	 * @param array $payload Webhook payload.
	 * @return \WP_REST_Response Response.
	 */
	private static function handle_profile_deleted( $payload ) {
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

		// Instead of deleting, just deactivate
		update_user_meta( $user->ID, 'frs_is_active', 0 );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => 'Profile deactivated.',
				'user_id' => $user->ID,
			),
			200
		);
	}

	/**
	 * Add a webhook endpoint to the list
	 *
	 * @param string $url Endpoint URL.
	 * @return bool Success.
	 */
	public static function add_webhook_endpoint( $url ) {
		$endpoints = get_option( 'frs_webhook_endpoints', array() );

		if ( ! in_array( $url, $endpoints, true ) ) {
			$endpoints[] = esc_url_raw( $url );
			return update_option( 'frs_webhook_endpoints', $endpoints );
		}

		return true;
	}

	/**
	 * Remove a webhook endpoint from the list
	 *
	 * @param string $url Endpoint URL.
	 * @return bool Success.
	 */
	public static function remove_webhook_endpoint( $url ) {
		$endpoints = get_option( 'frs_webhook_endpoints', array() );
		$endpoints = array_filter( $endpoints, function( $ep ) use ( $url ) {
			return $ep !== $url;
		} );

		return update_option( 'frs_webhook_endpoints', array_values( $endpoints ) );
	}

	/**
	 * Get all configured webhook endpoints
	 *
	 * @return array Endpoint URLs.
	 */
	public static function get_webhook_endpoints() {
		return get_option( 'frs_webhook_endpoints', array() );
	}
}
