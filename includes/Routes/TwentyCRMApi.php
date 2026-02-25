<?php
/**
 * Twenty CRM API Routes
 *
 * @package FRSUsers
 * @subpackage Routes
 * @since 4.0.0
 */

namespace FRSUsers\Routes;

/**
 * Class TwentyCRMApi
 *
 * REST API endpoints for Twenty CRM settings.
 */
class TwentyCRMApi {

	/**
	 * Register REST routes
	 *
	 * @return void
	 */
	public static function register_routes() {
		// Get settings
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_settings' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			)
		);

		// Save settings
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_settings' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			)
		);

		// Test connection
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'test_connection' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			)
		);

		// Get sync stats
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm/stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_sync_stats' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			)
		);

		// Trigger manual sync for a user
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm/sync/(?P<user_id>\d+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'trigger_sync' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'user_id' => array(
						'required'          => true,
						'validate_callback' => function( $param ) {
							return is_numeric( $param );
						},
					),
				),
			)
		);

		// Bulk sync all eligible users
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm/sync-all',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'bulk_sync' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			)
		);

		// Clear sync log
		register_rest_route(
			'frs-users/v1',
			'/settings/twenty-crm/clear-log',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'clear_log' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	/**
	 * Get Twenty CRM settings
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_settings() {
		return new \WP_REST_Response(
			array(
				'enabled'           => (bool) get_option( 'frs_twenty_crm_enabled', false ),
				'api_url'           => get_option( 'frs_twenty_crm_url', 'https://data.c21frs.com' ),
				'api_key'           => get_option( 'frs_twenty_crm_api_key', '' ),
				'webhook_secret'    => get_option( 'frs_twenty_crm_webhook_secret', '' ),
				'sync_roles'        => get_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) ),
				'available_roles'   => \FRSUsers\Core\Roles::get_company_roles(),
				'r2_enabled'        => (bool) get_option( \FRSUsers\Core\R2Storage::OPTION_ENABLED, false ),
				'r2_cdn_url'        => get_option( \FRSUsers\Core\R2Storage::OPTION_CDN_URL, \FRSUsers\Core\R2Storage::DEFAULT_CDN_URL ),
				'r2_api_key'        => get_option( \FRSUsers\Core\R2Storage::OPTION_API_KEY, '' ),
			),
			200
		);
	}

	/**
	 * Save Twenty CRM settings
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function save_settings( $request ) {
		$enabled        = $request->get_param( 'enabled' );
		$api_url        = $request->get_param( 'api_url' );
		$api_key        = $request->get_param( 'api_key' );
		$webhook_secret = $request->get_param( 'webhook_secret' );
		$sync_roles     = $request->get_param( 'sync_roles' );

		// Validate
		if ( $enabled && ( empty( $api_url ) || empty( $api_key ) ) ) {
			return new \WP_Error(
				'missing_required_fields',
				__( 'API URL and API Key are required when sync is enabled.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Validate sync_roles
		if ( ! is_array( $sync_roles ) ) {
			$sync_roles = array();
		}

		// Save Twenty CRM settings
		update_option( 'frs_twenty_crm_enabled', (bool) $enabled );
		update_option( 'frs_twenty_crm_url', esc_url_raw( $api_url ) );
		update_option( 'frs_twenty_crm_api_key', sanitize_text_field( $api_key ) );
		update_option( 'frs_twenty_crm_webhook_secret', sanitize_text_field( $webhook_secret ) );
		update_option( 'frs_twenty_crm_sync_roles', array_map( 'sanitize_text_field', $sync_roles ) );

		// Save R2 CDN settings
		$r2_enabled = $request->get_param( 'r2_enabled' );
		$r2_cdn_url = $request->get_param( 'r2_cdn_url' );
		$r2_api_key = $request->get_param( 'r2_api_key' );

		if ( null !== $r2_enabled ) {
			update_option( \FRSUsers\Core\R2Storage::OPTION_ENABLED, (bool) $r2_enabled );
		}
		if ( null !== $r2_cdn_url ) {
			update_option( \FRSUsers\Core\R2Storage::OPTION_CDN_URL, esc_url_raw( $r2_cdn_url ) );
		}
		if ( null !== $r2_api_key ) {
			update_option( \FRSUsers\Core\R2Storage::OPTION_API_KEY, sanitize_text_field( $r2_api_key ) );
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Settings saved successfully.', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Get sync stats and synced users
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_sync_stats() {
		global $wpdb;

		// Get users with Twenty CRM ID
		$synced_users = $wpdb->get_results(
			"SELECT u.ID, u.user_email, u.display_name, 
			        um.meta_value as twenty_crm_id,
			        (SELECT meta_value FROM {$wpdb->usermeta} WHERE user_id = u.ID AND meta_key = 'frs_company_role' LIMIT 1) as company_role
			 FROM {$wpdb->users} u
			 INNER JOIN {$wpdb->usermeta} um ON u.ID = um.user_id AND um.meta_key = 'frs_twenty_crm_id'
			 WHERE um.meta_value != ''
			 ORDER BY u.display_name ASC
			 LIMIT 100"
		);

		// Get sync log from options (we'll store recent events)
		$sync_log = get_option( 'frs_twenty_crm_sync_log', array() );

		// Get counts
		$total_synced = $wpdb->get_var(
			"SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta} WHERE meta_key = 'frs_twenty_crm_id' AND meta_value != ''"
		);

		$sync_roles = get_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );
		$eligible_count = 0;

		if ( ! empty( $sync_roles ) ) {
			$placeholders = implode( ',', array_fill( 0, count( $sync_roles ), '%s' ) );
			$eligible_count = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta} WHERE meta_key = 'frs_company_role' AND meta_value IN ($placeholders)",
					...$sync_roles
				)
			);
		}

		return new \WP_REST_Response(
			array(
				'total_synced'   => (int) $total_synced,
				'eligible_count' => $eligible_count,
				'synced_users'   => $synced_users,
				'sync_log'       => array_slice( $sync_log, 0, 50 ), // Last 50 events
				'last_sync'      => get_option( 'frs_twenty_crm_last_sync', null ),
			),
			200
		);
	}

	/**
	 * Trigger manual sync for a user
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function trigger_sync( $request ) {
		$user_id = $request->get_param( 'user_id' );

		if ( empty( $user_id ) ) {
			return new \WP_Error(
				'missing_user_id',
				__( 'User ID is required.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		// Trigger the sync
		$result = \FRSUsers\Integrations\TwentyCRMSync::sync_user_to_twenty( $user_id, $user );

		// Log the event
		self::log_sync_event( $user_id, 'manual_sync', is_wp_error( $result ) ? 'error' : 'success', $result );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => sprintf( __( 'User %s synced successfully.', 'frs-users' ), $user->display_name ),
				'result'  => $result,
			),
			200
		);
	}

	/**
	 * Bulk sync all eligible users
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function bulk_sync() {
		if ( ! \FRSUsers\Integrations\TwentyCRMSync::is_enabled() ) {
			return new \WP_Error(
				'sync_disabled',
				__( 'Twenty CRM sync is not enabled.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		$sync_roles = get_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );

		if ( empty( $sync_roles ) ) {
			return new \WP_Error(
				'no_roles',
				__( 'No sync roles configured.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		global $wpdb;

		// Get all users with eligible company roles
		$placeholders = implode( ',', array_fill( 0, count( $sync_roles ), '%s' ) );
		$user_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT user_id FROM {$wpdb->usermeta} WHERE meta_key = 'frs_company_role' AND meta_value IN ($placeholders)",
				...$sync_roles
			)
		);

		$synced = 0;
		$failed = 0;
		$errors = array();

		foreach ( $user_ids as $user_id ) {
			$user = get_userdata( $user_id );
			if ( ! $user ) {
				continue;
			}

			$result = \FRSUsers\Integrations\TwentyCRMSync::sync_user_to_twenty( $user_id, $user );

			if ( is_wp_error( $result ) ) {
				$failed++;
				$errors[] = sprintf( '%s: %s', $user->display_name, $result->get_error_message() );
			} else {
				$synced++;
			}

			// Small delay to avoid rate limiting
			usleep( 100000 ); // 100ms
		}

		// Log bulk sync event
		self::log_sync_event( 0, 'bulk_sync', 'completed', array(
			'synced' => $synced,
			'failed' => $failed,
		) );

		// Update last sync time
		update_option( 'frs_twenty_crm_last_sync', current_time( 'mysql' ) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'synced'  => $synced,
				'failed'  => $failed,
				'total'   => count( $user_ids ),
				'errors'  => array_slice( $errors, 0, 10 ), // First 10 errors
				'message' => sprintf( __( 'Synced %d users, %d failed.', 'frs-users' ), $synced, $failed ),
			),
			200
		);
	}

	/**
	 * Log a sync event
	 *
	 * @param int    $user_id User ID (0 for bulk operations).
	 * @param string $action  Action type.
	 * @param string $status  Status (success, error).
	 * @param mixed  $details Additional details.
	 * @return void
	 */
	private static function log_sync_event( $user_id, $action, $status, $details = null ) {
		$log = get_option( 'frs_twenty_crm_sync_log', array() );

		$user_name = '';
		if ( $user_id ) {
			$user = get_userdata( $user_id );
			$user_name = $user ? $user->display_name : "User #{$user_id}";
		}

		array_unshift( $log, array(
			'timestamp' => current_time( 'mysql' ),
			'user_id'   => $user_id,
			'user_name' => $user_name,
			'action'    => $action,
			'status'    => $status,
			'details'   => is_wp_error( $details ) ? $details->get_error_message() : $details,
		) );

		// Keep only last 200 events
		$log = array_slice( $log, 0, 200 );

		update_option( 'frs_twenty_crm_sync_log', $log );
	}

	/**
	 * Clear sync log
	 *
	 * @return \WP_REST_Response
	 */
	public static function clear_log() {
		update_option( 'frs_twenty_crm_sync_log', array() );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Sync log cleared.', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Test Twenty CRM connection
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function test_connection( $request ) {
		$api_url = $request->get_param( 'api_url' );
		$api_key = $request->get_param( 'api_key' );

		if ( empty( $api_url ) || empty( $api_key ) ) {
			return new \WP_Error(
				'missing_credentials',
				__( 'API URL and API Key are required.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Test the connection by fetching metadata
		$response = wp_remote_get(
			trailingslashit( $api_url ) . 'rest/people?limit=1',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'timeout' => 10,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'connection_failed',
				$response->get_error_message(),
				array( 'status' => 500 )
			);
		}

		$status = wp_remote_retrieve_response_code( $response );

		if ( $status === 401 ) {
			return new \WP_Error(
				'invalid_credentials',
				__( 'Invalid API key. Please check your credentials.', 'frs-users' ),
				array( 'status' => 401 )
			);
		}

		if ( $status < 200 || $status >= 300 ) {
			return new \WP_Error(
				'api_error',
				sprintf( __( 'API returned HTTP %d', 'frs-users' ), $status ),
				array( 'status' => 500 )
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Connection successful! Your Twenty CRM API is working.', 'frs-users' ),
			),
			200
		);
	}
}
