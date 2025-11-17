<?php
/**
 * CORS Handler
 *
 * Handles Cross-Origin Resource Sharing for REST API.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Traits\Base;

/**
 * Class CORS
 *
 * Manages CORS headers for cross-site profile access.
 *
 * @package FRSUsers\Core
 */
class CORS {
	use Base;

	/**
	 * Initialize CORS handling
	 *
	 * @return void
	 */
	public function init() {
		add_filter( 'rest_pre_serve_request', array( $this, 'add_cors_headers' ), 10, 4 );
	}

	/**
	 * Add CORS headers to REST API responses
	 *
	 * @param bool             $served  Whether the request has already been served.
	 * @param mixed            $result  Result to send to the client.
	 * @param \WP_REST_Request $request Request object.
	 * @param \WP_REST_Server  $server  Server instance.
	 * @return bool
	 */
	public function add_cors_headers( $served, $result, $request, $server ) {
		$route = $request->get_route();

		// Only apply CORS to frs-users endpoints
		if ( strpos( $route, '/frs-users/v1/' ) !== 0 ) {
			return $served;
		}

		// Get allowed origins from settings
		$allowed_origins = $this->get_allowed_origins();

		// Get the origin header from the request
		$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';

		// Check if origin is allowed
		if ( in_array( $origin, $allowed_origins, true ) || in_array( '*', $allowed_origins, true ) ) {
			header( 'Access-Control-Allow-Origin: ' . $origin );
			header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
			header( 'Access-Control-Allow-Credentials: true' );
			header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
		}

		return $served;
	}

	/**
	 * Get allowed origins from WordPress options
	 *
	 * @return array
	 */
	private function get_allowed_origins() {
		$origins = get_option( 'frs_allowed_origins', array() );

		// Default: allow all origins for now (can be configured later)
		if ( empty( $origins ) ) {
			return array( '*' );
		}

		return $origins;
	}
}
