<?php
/**
 * Network Sync API Routes
 *
 * REST API endpoints for network-level Twenty CRM sync management.
 *
 * @package FRSUsers
 * @subpackage Routes
 * @since 4.1.0
 */

namespace FRSUsers\Routes;

/**
 * Class NetworkSyncApi
 *
 * REST API endpoints for network-level sync control.
 */
class NetworkSyncApi {

	/**
	 * Register REST routes
	 *
	 * @return void
	 */
	public static function register_routes() {
		if ( ! is_multisite() ) {
			return;
		}

		// Get network sync settings
		register_rest_route(
			'frs-users/v1',
			'/network/sync/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_settings' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Save network sync settings
		register_rest_route(
			'frs-users/v1',
			'/network/sync/settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_settings' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Get sync stats across all sites
		register_rest_route(
			'frs-users/v1',
			'/network/sync/stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_stats' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Get synced users list
		register_rest_route(
			'frs-users/v1',
			'/network/sync/users',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_synced_users' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Get sync log
		register_rest_route(
			'frs-users/v1',
			'/network/sync/log',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_sync_log' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Trigger sync for a single user
		register_rest_route(
			'frs-users/v1',
			'/network/sync/user/(?P<user_id>\d+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'sync_user' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Bulk sync all eligible users
		register_rest_route(
			'frs-users/v1',
			'/network/sync/bulk',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'bulk_sync' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Enable/disable sync for a subsite
		register_rest_route(
			'frs-users/v1',
			'/network/sync/site/(?P<site_id>\d+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'update_site_sync' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Clear sync log
		register_rest_route(
			'frs-users/v1',
			'/network/sync/log/clear',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'clear_log' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);

		// Test Twenty CRM connection
		register_rest_route(
			'frs-users/v1',
			'/network/sync/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'test_connection' ),
				'permission_callback' => array( __CLASS__, 'check_network_admin' ),
			)
		);
	}

	/**
	 * Check if user is network admin
	 *
	 * @return bool
	 */
	public static function check_network_admin() {
		return current_user_can( 'manage_network_options' );
	}

	/**
	 * Get network sync settings
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_settings() {
		return new \WP_REST_Response(
			array(
				'enabled'         => (bool) get_site_option( 'frs_twenty_crm_network_enabled', false ),
				'api_url'         => get_site_option( 'frs_twenty_crm_url', 'https://data.c21frs.com' ),
				'api_key'         => get_site_option( 'frs_twenty_crm_api_key', '' ) ? '••••••••' : '',
				'api_key_set'     => ! empty( get_site_option( 'frs_twenty_crm_api_key', '' ) ),
				'webhook_secret'  => get_site_option( 'frs_twenty_crm_webhook_secret', '' ) ? '••••••••' : '',
				'sync_roles'      => get_site_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) ),
				'available_roles' => \FRSUsers\Core\Roles::get_company_roles(),
				'webhook_url'     => rest_url( 'frs-users/v1/webhook/twenty-crm' ),
			),
			200
		);
	}

	/**
	 * Save network sync settings
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

		// Save to network options
		update_site_option( 'frs_twenty_crm_network_enabled', (bool) $enabled );

		if ( $api_url ) {
			update_site_option( 'frs_twenty_crm_url', esc_url_raw( $api_url ) );
		}

		// Only update API key if a new one is provided (not masked)
		if ( $api_key && strpos( $api_key, '••••' ) === false ) {
			update_site_option( 'frs_twenty_crm_api_key', sanitize_text_field( $api_key ) );
		}

		if ( $webhook_secret && strpos( $webhook_secret, '••••' ) === false ) {
			update_site_option( 'frs_twenty_crm_webhook_secret', sanitize_text_field( $webhook_secret ) );
		}

		if ( is_array( $sync_roles ) ) {
			update_site_option( 'frs_twenty_crm_sync_roles', array_map( 'sanitize_text_field', $sync_roles ) );
		}

		// Also update the main site's settings for backward compatibility
		switch_to_blog( get_main_site_id() );
		update_option( 'frs_twenty_crm_enabled', (bool) $enabled );
		if ( $api_url ) {
			update_option( 'frs_twenty_crm_url', esc_url_raw( $api_url ) );
		}
		if ( $api_key && strpos( $api_key, '••••' ) === false ) {
			update_option( 'frs_twenty_crm_api_key', sanitize_text_field( $api_key ) );
		}
		restore_current_blog();

		// Log settings change
		self::log_event( 0, 'settings_updated', 'success', array(
			'enabled'    => $enabled,
			'sync_roles' => $sync_roles,
		) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Network sync settings saved.', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Get sync stats across the network
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_stats() {
		global $wpdb;

		// Get all users with Twenty CRM ID from the main site's usermeta
		switch_to_blog( get_main_site_id() );

		$total_synced = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta} WHERE meta_key = 'frs_twenty_crm_id' AND meta_value != ''"
		);

		$sync_roles = get_site_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );
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

		// Get recent sync activity
		$recent_syncs = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->usermeta} 
				 WHERE meta_key = 'frs_twenty_crm_last_sync' 
				 AND meta_value > %s",
				gmdate( 'Y-m-d H:i:s', strtotime( '-24 hours' ) )
			)
		);

		restore_current_blog();

		// Get sites info
		$sites = get_sites( array( 'number' => 0 ) );
		$sites_with_sync = 0;

		foreach ( $sites as $site ) {
			switch_to_blog( $site->blog_id );
			if ( get_option( 'frs_twenty_crm_enabled', false ) ) {
				$sites_with_sync++;
			}
			restore_current_blog();
		}

		return new \WP_REST_Response(
			array(
				'total_synced'     => $total_synced,
				'eligible_count'   => $eligible_count,
				'recent_syncs'     => $recent_syncs,
				'total_sites'      => count( $sites ),
				'sites_with_sync'  => $sites_with_sync,
				'last_bulk_sync'   => get_site_option( 'frs_twenty_crm_last_bulk_sync', null ),
				'sync_enabled'     => (bool) get_site_option( 'frs_twenty_crm_network_enabled', false ),
			),
			200
		);
	}

	/**
	 * Get list of synced users
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public static function get_synced_users( $request ) {
		global $wpdb;

		$page     = (int) $request->get_param( 'page' ) ?: 1;
		$per_page = (int) $request->get_param( 'per_page' ) ?: 50;
		$offset   = ( $page - 1 ) * $per_page;

		switch_to_blog( get_main_site_id() );

		$users = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT u.ID, u.user_email, u.display_name,
				        (SELECT meta_value FROM {$wpdb->usermeta} WHERE user_id = u.ID AND meta_key = 'frs_twenty_crm_id' LIMIT 1) as twenty_crm_id,
				        (SELECT meta_value FROM {$wpdb->usermeta} WHERE user_id = u.ID AND meta_key = 'frs_company_role' LIMIT 1) as company_role,
				        (SELECT meta_value FROM {$wpdb->usermeta} WHERE user_id = u.ID AND meta_key = 'frs_twenty_crm_last_sync' LIMIT 1) as last_sync
				 FROM {$wpdb->users} u
				 INNER JOIN {$wpdb->usermeta} um ON u.ID = um.user_id AND um.meta_key = 'frs_twenty_crm_id' AND um.meta_value != ''
				 ORDER BY u.display_name ASC
				 LIMIT %d OFFSET %d",
				$per_page,
				$offset
			)
		);

		$total = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta} WHERE meta_key = 'frs_twenty_crm_id' AND meta_value != ''"
		);

		restore_current_blog();

		return new \WP_REST_Response(
			array(
				'users'      => $users,
				'total'      => $total,
				'page'       => $page,
				'per_page'   => $per_page,
				'total_pages' => ceil( $total / $per_page ),
			),
			200
		);
	}

	/**
	 * Get sync log
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public static function get_sync_log( $request ) {
		$limit = (int) $request->get_param( 'limit' ) ?: 100;
		$log   = get_site_option( 'frs_twenty_crm_network_sync_log', array() );

		return new \WP_REST_Response(
			array(
				'log'   => array_slice( $log, 0, $limit ),
				'total' => count( $log ),
			),
			200
		);
	}

	/**
	 * Sync a single user to Twenty CRM
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function sync_user( $request ) {
		$user_id = (int) $request->get_param( 'user_id' );

		if ( ! $user_id ) {
			return new \WP_Error( 'invalid_user', __( 'Invalid user ID.', 'frs-users' ), array( 'status' => 400 ) );
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return new \WP_Error( 'user_not_found', __( 'User not found.', 'frs-users' ), array( 'status' => 404 ) );
		}

		// Trigger the sync (need to call it from main site context)
		switch_to_blog( get_main_site_id() );

		// Manually trigger the sync
		do_action( 'frs_profile_saved', $user_id, array() );

		// Update last sync timestamp
		update_user_meta( $user_id, 'frs_twenty_crm_last_sync', current_time( 'mysql' ) );

		restore_current_blog();

		// Log the event
		self::log_event( $user_id, 'manual_sync', 'success', array(
			'user_email' => $user->user_email,
		) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => sprintf( __( 'Synced user: %s', 'frs-users' ), $user->display_name ),
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
		if ( ! get_site_option( 'frs_twenty_crm_network_enabled', false ) ) {
			return new \WP_Error( 'sync_disabled', __( 'Network sync is not enabled.', 'frs-users' ), array( 'status' => 400 ) );
		}

		global $wpdb;

		$sync_roles = get_site_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) );

		if ( empty( $sync_roles ) ) {
			return new \WP_Error( 'no_roles', __( 'No sync roles configured.', 'frs-users' ), array( 'status' => 400 ) );
		}

		switch_to_blog( get_main_site_id() );

		// Get eligible users
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

			try {
				// Trigger sync action
				do_action( 'frs_profile_saved', $user_id, array() );
				update_user_meta( $user_id, 'frs_twenty_crm_last_sync', current_time( 'mysql' ) );
				$synced++;
			} catch ( \Exception $e ) {
				$failed++;
				$errors[] = sprintf( '%s: %s', $user->display_name, $e->getMessage() );
			}

			// Small delay to avoid rate limiting
			usleep( 100000 ); // 100ms
		}

		restore_current_blog();

		// Update last bulk sync time
		update_site_option( 'frs_twenty_crm_last_bulk_sync', current_time( 'mysql' ) );

		// Log the event
		self::log_event( 0, 'bulk_sync', 'completed', array(
			'synced' => $synced,
			'failed' => $failed,
			'total'  => count( $user_ids ),
		) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'synced'  => $synced,
				'failed'  => $failed,
				'total'   => count( $user_ids ),
				'errors'  => array_slice( $errors, 0, 10 ),
				'message' => sprintf( __( 'Synced %d users, %d failed.', 'frs-users' ), $synced, $failed ),
			),
			200
		);
	}

	/**
	 * Update sync settings for a specific site
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function update_site_sync( $request ) {
		$site_id = (int) $request->get_param( 'site_id' );
		$enabled = (bool) $request->get_param( 'enabled' );

		if ( ! get_blog_details( $site_id ) ) {
			return new \WP_Error( 'invalid_site', __( 'Site not found.', 'frs-users' ), array( 'status' => 404 ) );
		}

		switch_to_blog( $site_id );
		update_option( 'frs_twenty_crm_enabled', $enabled );

		// Copy network settings to site if enabling
		if ( $enabled ) {
			update_option( 'frs_twenty_crm_url', get_site_option( 'frs_twenty_crm_url', 'https://data.c21frs.com' ) );
			update_option( 'frs_twenty_crm_api_key', get_site_option( 'frs_twenty_crm_api_key', '' ) );
			update_option( 'frs_twenty_crm_sync_roles', get_site_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) ) );
		}

		$site_name = get_bloginfo( 'name' );
		restore_current_blog();

		// Log the event
		self::log_event( 0, 'site_sync_' . ( $enabled ? 'enabled' : 'disabled' ), 'success', array(
			'site_id'   => $site_id,
			'site_name' => $site_name,
		) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => sprintf(
					$enabled ? __( 'Sync enabled for %s', 'frs-users' ) : __( 'Sync disabled for %s', 'frs-users' ),
					$site_name
				),
			),
			200
		);
	}

	/**
	 * Clear sync log
	 *
	 * @return \WP_REST_Response
	 */
	public static function clear_log() {
		update_site_option( 'frs_twenty_crm_network_sync_log', array() );

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
		$api_url = $request->get_param( 'api_url' ) ?: get_site_option( 'frs_twenty_crm_url', '' );
		$api_key = $request->get_param( 'api_key' );

		// If API key is masked, use the stored one
		if ( ! $api_key || strpos( $api_key, '••••' ) !== false ) {
			$api_key = get_site_option( 'frs_twenty_crm_api_key', '' );
		}

		if ( empty( $api_url ) || empty( $api_key ) ) {
			return new \WP_Error( 'missing_config', __( 'API URL and key are required.', 'frs-users' ), array( 'status' => 400 ) );
		}

		// Test connection to Twenty CRM
		$response = wp_remote_get(
			trailingslashit( $api_url ) . 'rest/people?limit=1',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			self::log_event( 0, 'connection_test', 'failed', $response->get_error_message() );
			return new \WP_Error( 'connection_failed', $response->get_error_message(), array( 'status' => 500 ) );
		}

		$status = wp_remote_retrieve_response_code( $response );

		if ( $status === 401 || $status === 403 ) {
			self::log_event( 0, 'connection_test', 'failed', 'Invalid API key' );
			return new \WP_Error( 'auth_failed', __( 'Invalid API key.', 'frs-users' ), array( 'status' => 401 ) );
		}

		if ( $status >= 200 && $status < 300 ) {
			self::log_event( 0, 'connection_test', 'success', array( 'status' => $status ) );
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => __( 'Connection successful!', 'frs-users' ),
					'status'  => $status,
				),
				200
			);
		}

		return new \WP_Error( 'api_error', sprintf( __( 'API returned HTTP %d', 'frs-users' ), $status ), array( 'status' => 500 ) );
	}

	/**
	 * Log a sync event to network options
	 *
	 * @param int    $user_id  User ID (0 for system events).
	 * @param string $action   Action type.
	 * @param string $status   Status (success, failed, etc.).
	 * @param mixed  $details  Additional details.
	 * @return void
	 */
	private static function log_event( $user_id, $action, $status, $details = null ) {
		$log = get_site_option( 'frs_twenty_crm_network_sync_log', array() );

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
			'details'   => $details,
		) );

		// Keep last 500 events
		$log = array_slice( $log, 0, 500 );

		update_site_option( 'frs_twenty_crm_network_sync_log', $log );
	}
}
