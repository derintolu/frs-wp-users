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
	}

	/**
	 * Get Twenty CRM settings
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_settings() {
		return new \WP_REST_Response(
			array(
				'enabled'        => (bool) get_option( 'frs_twenty_crm_enabled', false ),
				'api_url'        => get_option( 'frs_twenty_crm_url', 'https://20.frs.works' ),
				'api_key'        => get_option( 'frs_twenty_crm_api_key', '' ),
				'webhook_secret' => get_option( 'frs_twenty_crm_webhook_secret', '' ),
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

		// Validate
		if ( $enabled && ( empty( $api_url ) || empty( $api_key ) ) ) {
			return new \WP_Error(
				'missing_required_fields',
				__( 'API URL and API Key are required when sync is enabled.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Save
		update_option( 'frs_twenty_crm_enabled', (bool) $enabled );
		update_option( 'frs_twenty_crm_url', esc_url_raw( $api_url ) );
		update_option( 'frs_twenty_crm_api_key', sanitize_text_field( $api_key ) );
		update_option( 'frs_twenty_crm_webhook_secret', sanitize_text_field( $webhook_secret ) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Settings saved successfully.', 'frs-users' ),
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
