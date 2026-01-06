<?php
/**
 * Follow Up Boss CRM Integration
 *
 * Centralized FUB integration storing credentials in wp_frs_profiles.
 * Can be used by any plugin via static methods or Profile model.
 *
 * @package FRSUsers
 * @subpackage Integrations
 * @see https://docs.followupboss.com/reference/events-post
 */

namespace FRSUsers\Integrations;

use FRSUsers\Models\Profile;

/**
 * Class FollowUpBoss
 *
 * Provides Follow Up Boss CRM integration with credentials stored in profiles table.
 * This class is the single source of truth for FUB credentials across all plugins.
 */
class FollowUpBoss {

	/**
	 * API base URL
	 */
	const API_URL = 'https://api.followupboss.com/v1';

	/**
	 * Source name for FUB campaigns
	 */
	const SOURCE_NAME = '21st Century Lending';

	/**
	 * Initialize the integration
	 */
	public static function init(): void {
		// Register REST API routes for FUB settings
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
	}

	/**
	 * Register REST API routes
	 */
	public static function register_routes(): void {
		$namespace = 'frs-users/v1';

		// Get FUB status
		register_rest_route(
			$namespace,
			'/profiles/me/integrations/followupboss',
			[
				[
					'methods'             => 'GET',
					'callback'            => [ __CLASS__, 'rest_get_status' ],
					'permission_callback' => [ __CLASS__, 'permission_check' ],
				],
				[
					'methods'             => 'POST',
					'callback'            => [ __CLASS__, 'rest_save_api_key' ],
					'permission_callback' => [ __CLASS__, 'permission_check' ],
					'args'                => [
						'api_key' => [
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						],
					],
				],
				[
					'methods'             => 'DELETE',
					'callback'            => [ __CLASS__, 'rest_disconnect' ],
					'permission_callback' => [ __CLASS__, 'permission_check' ],
				],
			]
		);

		// Test connection
		register_rest_route(
			$namespace,
			'/profiles/me/integrations/followupboss/test',
			[
				'methods'             => 'POST',
				'callback'            => [ __CLASS__, 'rest_test_connection' ],
				'permission_callback' => [ __CLASS__, 'permission_check' ],
			]
		);

		// Get stats
		register_rest_route(
			$namespace,
			'/profiles/me/integrations/followupboss/stats',
			[
				'methods'             => 'GET',
				'callback'            => [ __CLASS__, 'rest_get_stats' ],
				'permission_callback' => [ __CLASS__, 'permission_check' ],
			]
		);
	}

	/**
	 * Permission check for REST endpoints
	 *
	 * @return bool
	 */
	public static function permission_check(): bool {
		return is_user_logged_in();
	}

	/**
	 * Get profile for current user
	 *
	 * @return Profile|null
	 */
	private static function get_current_profile(): ?Profile {
		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return null;
		}

		return Profile::get_by_user_id( $user_id );
	}

	/**
	 * Check if a user has FUB connected
	 *
	 * @param int $user_id WordPress user ID
	 * @return bool
	 */
	public static function is_connected( int $user_id ): bool {
		$api_key = self::get_api_key( $user_id );
		return ! empty( $api_key );
	}

	/**
	 * Check if a profile has FUB connected
	 *
	 * @param int $profile_id Profile ID
	 * @return bool
	 */
	public static function is_profile_connected( int $profile_id ): bool {
		$profile = Profile::find( $profile_id );
		return $profile && ! empty( $profile->followupboss_api_key );
	}

	/**
	 * Get user's API key by user ID
	 *
	 * @param int $user_id WordPress user ID
	 * @return string
	 */
	public static function get_api_key( int $user_id ): string {
		$profile = Profile::get_by_user_id( $user_id );
		if ( ! $profile ) {
			return '';
		}

		return $profile->followupboss_api_key ?? '';
	}

	/**
	 * Get API key by profile ID
	 *
	 * @param int $profile_id Profile ID
	 * @return string
	 */
	public static function get_api_key_by_profile( int $profile_id ): string {
		$profile = Profile::find( $profile_id );
		if ( ! $profile ) {
			return '';
		}

		return $profile->followupboss_api_key ?? '';
	}

	/**
	 * Save user's API key
	 *
	 * @param int    $user_id WordPress user ID
	 * @param string $api_key API key
	 * @return array Result with success status
	 */
	public static function save_api_key( int $user_id, string $api_key ): array {
		$profile = Profile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return [
				'success' => false,
				'message' => 'Profile not found for user',
			];
		}

		if ( empty( $api_key ) ) {
			// Disconnect
			$profile->followupboss_api_key = null;
			$profile->followupboss_status = null;
			$profile->save();

			return [
				'success' => true,
				'message' => 'Disconnected from Follow Up Boss',
			];
		}

		// Validate the API key by testing connection
		$test = self::test_connection( $api_key );

		if ( ! $test['success'] ) {
			return $test;
		}

		// Save validated key and status
		$profile->followupboss_api_key = sanitize_text_field( $api_key );
		$profile->followupboss_status = [
			'connected'      => true,
			'account_name'   => $test['account_name'] ?? '',
			'account_email'  => $test['account_email'] ?? '',
			'connected_at'   => current_time( 'mysql' ),
			'total_synced'   => 0,
			'last_sync'      => null,
			'recent_errors'  => [],
		];
		$profile->save();

		return [
			'success'      => true,
			'message'      => 'Connected to Follow Up Boss successfully!',
			'account_name' => $test['account_name'],
		];
	}

	/**
	 * Get connection status for user
	 *
	 * @param int $user_id WordPress user ID
	 * @return array
	 */
	public static function get_status( int $user_id ): array {
		$profile = Profile::get_by_user_id( $user_id );

		if ( ! $profile || empty( $profile->followupboss_api_key ) ) {
			return [
				'connected'     => false,
				'account_name'  => '',
				'account_email' => '',
				'connected_at'  => null,
			];
		}

		$status = $profile->followupboss_status ?? [];

		return [
			'connected'     => true,
			'account_name'  => $status['account_name'] ?? '',
			'account_email' => $status['account_email'] ?? '',
			'connected_at'  => $status['connected_at'] ?? null,
			'masked_key'    => self::mask_api_key( $profile->followupboss_api_key ),
		];
	}

	/**
	 * Test API connection
	 *
	 * @param string $api_key API key to test
	 * @return array
	 */
	public static function test_connection( string $api_key ): array {
		if ( empty( $api_key ) ) {
			return [
				'success' => false,
				'message' => 'API key is required',
			];
		}

		// Call the /me endpoint to verify credentials
		$response = wp_remote_get(
			self::API_URL . '/me',
			[
				'headers' => [
					'Authorization' => 'Basic ' . base64_encode( $api_key . ':' ),
					'Content-Type'  => 'application/json',
				],
				'timeout' => 15,
			]
		);

		if ( is_wp_error( $response ) ) {
			return [
				'success' => false,
				'message' => 'Connection failed: ' . $response->get_error_message(),
			];
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code === 200 ) {
			return [
				'success'       => true,
				'message'       => 'Connected successfully',
				'account_name'  => $body['name'] ?? $body['email'] ?? 'Follow Up Boss Account',
				'account_email' => $body['email'] ?? '',
			];
		}

		if ( $code === 401 ) {
			return [
				'success' => false,
				'message' => 'Invalid API key. Please check your credentials.',
			];
		}

		return [
			'success' => false,
			'message' => 'Connection failed with status ' . $code,
		];
	}

	/**
	 * Send lead to Follow Up Boss
	 *
	 * @param array $lead_data Lead data
	 * @param int   $user_id   User ID (who owns the FUB account)
	 * @return array Result
	 */
	public static function send_lead( array $lead_data, int $user_id ): array {
		$api_key = self::get_api_key( $user_id );

		if ( empty( $api_key ) ) {
			return [
				'success' => false,
				'message' => 'User has no Follow Up Boss connection',
			];
		}

		return self::send_lead_with_key( $lead_data, $api_key, $user_id );
	}

	/**
	 * Send lead using a specific API key
	 *
	 * @param array  $lead_data Lead data
	 * @param string $api_key   FUB API key
	 * @param int    $user_id   Optional user ID for logging
	 * @return array Result
	 */
	public static function send_lead_with_key( array $lead_data, string $api_key, int $user_id = 0 ): array {
		// Determine event type based on page type
		$event_type = self::get_event_type( $lead_data['page_type'] ?? '' );

		// Build the event payload
		$payload = [
			'source'  => $lead_data['source'] ?? self::SOURCE_NAME,
			'system'  => $lead_data['system'] ?? 'FRS Platform',
			'type'    => $event_type,
			'message' => self::build_message( $lead_data ),
			'person'  => [
				'firstName' => $lead_data['first_name'] ?? '',
				'lastName'  => $lead_data['last_name'] ?? '',
				'emails'    => [ [ 'value' => $lead_data['email'] ?? '' ] ],
				'phones'    => ! empty( $lead_data['phone'] ) ? [ [ 'value' => $lead_data['phone'] ] ] : [],
				'tags'      => self::get_tags( $lead_data ),
			],
		];

		// Add property data if available
		if ( ! empty( $lead_data['property_address'] ) ) {
			$payload['property'] = [
				'street' => $lead_data['property_address'],
				'price'  => $lead_data['property_price'] ?? null,
			];
		}

		// Add source URL
		if ( ! empty( $lead_data['source_url'] ) ) {
			$payload['sourceUrl'] = $lead_data['source_url'];
		}

		// Send to FUB API
		$response = wp_remote_post(
			self::API_URL . '/events',
			[
				'headers' => [
					'Authorization' => 'Basic ' . base64_encode( $api_key . ':' ),
					'Content-Type'  => 'application/json',
				],
				'body'    => wp_json_encode( $payload ),
				'timeout' => 15,
			]
		);

		if ( is_wp_error( $response ) ) {
			if ( $user_id ) {
				self::log_error( 'API Error: ' . $response->get_error_message(), $user_id );
			}
			return [
				'success' => false,
				'message' => 'API Error: ' . $response->get_error_message(),
			];
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( in_array( $code, [ 200, 201 ], true ) ) {
			if ( $user_id ) {
				self::log_success( $lead_data['email'] ?? '', $user_id );
			}
			return [
				'success'   => true,
				'message'   => 'Lead sent to Follow Up Boss',
				'person_id' => $body['id'] ?? null,
			];
		}

		if ( $code === 204 ) {
			// Lead flow archived/ignored
			return [
				'success' => true,
				'message' => 'Lead received but filtered by Follow Up Boss lead flow',
			];
		}

		$error_msg = $body['message'] ?? 'Unknown error';
		if ( $user_id ) {
			self::log_error( "API returned {$code}: {$error_msg}", $user_id );
		}

		return [
			'success' => false,
			'message' => "Failed to send lead: {$error_msg}",
		];
	}

	/**
	 * Get FUB event type based on page type
	 *
	 * @param string $page_type Lead page type
	 * @return string FUB event type
	 */
	private static function get_event_type( string $page_type ): string {
		$type_map = [
			'open_house'          => 'Visited Open House',
			'customer_spotlight'  => 'Property Inquiry',
			'special_event'       => 'Registration',
			'mortgage_calculator' => 'General Inquiry',
			'rate_quote'          => 'General Inquiry',
			'apply_now'           => 'Registration',
			'contact_form'        => 'General Inquiry',
		];

		return $type_map[ $page_type ] ?? 'General Inquiry';
	}

	/**
	 * Build message for FUB event
	 *
	 * @param array $lead_data Lead data
	 * @return string
	 */
	private static function build_message( array $lead_data ): string {
		$parts = [];

		$page_type   = $lead_data['page_type'] ?? 'lead';
		$type_labels = [
			'open_house'          => 'Open House',
			'customer_spotlight'  => 'Customer Spotlight',
			'special_event'       => 'Special Event',
			'mortgage_calculator' => 'Mortgage Calculator',
			'rate_quote'          => 'Rate Quote',
			'apply_now'           => 'Apply Now',
			'contact_form'        => 'Contact Form',
		];

		$parts[] = 'Lead from: ' . ( $type_labels[ $page_type ] ?? ucwords( str_replace( '_', ' ', $page_type ) ) );

		if ( ! empty( $lead_data['property_address'] ) ) {
			$parts[] = 'Property: ' . $lead_data['property_address'];
		}

		if ( ! empty( $lead_data['comments'] ) ) {
			$parts[] = 'Comments: ' . $lead_data['comments'];
		}

		if ( ! empty( $lead_data['pre_approved'] ) ) {
			$parts[] = 'Pre-approved: ' . $lead_data['pre_approved'];
		}

		if ( ! empty( $lead_data['timeframe'] ) ) {
			$parts[] = 'Timeframe: ' . $lead_data['timeframe'];
		}

		if ( ! empty( $lead_data['working_with_agent'] ) ) {
			$parts[] = 'Working with agent: ' . $lead_data['working_with_agent'];
		}

		return implode( "\n", $parts );
	}

	/**
	 * Get tags for lead
	 *
	 * @param array $lead_data Lead data
	 * @return array
	 */
	private static function get_tags( array $lead_data ): array {
		$tags = $lead_data['tags'] ?? [ '21CL' ];

		// Add page type tag
		$page_type = $lead_data['page_type'] ?? '';
		if ( $page_type ) {
			$tags[] = str_replace( '_', ' ', ucfirst( $page_type ) );
		}

		// Add qualifying tags
		if ( ( $lead_data['pre_approved'] ?? '' ) === 'no' && ( $lead_data['interested_in_preapproval'] ?? '' ) === 'yes' ) {
			$tags[] = 'Needs Preapproval';
			$tags[] = 'Hot Lead';
		}

		if ( ( $lead_data['timeframe'] ?? '' ) === 'As soon as possible' ) {
			$tags[] = 'Hot Lead';
		}

		return array_unique( $tags );
	}

	/**
	 * Log successful sync to profile
	 *
	 * @param string $email   Lead email
	 * @param int    $user_id User ID
	 */
	private static function log_success( string $email, int $user_id ): void {
		$profile = Profile::get_by_user_id( $user_id );
		if ( ! $profile ) {
			return;
		}

		$status                 = $profile->followupboss_status ?? [];
		$status['total_synced'] = ( $status['total_synced'] ?? 0 ) + 1;
		$status['last_sync']    = current_time( 'mysql' );

		$profile->followupboss_status = $status;
		$profile->save();
	}

	/**
	 * Log error to profile
	 *
	 * @param string $message  Error message
	 * @param int    $user_id  User ID
	 */
	private static function log_error( string $message, int $user_id ): void {
		$profile = Profile::get_by_user_id( $user_id );
		if ( ! $profile ) {
			return;
		}

		$status                   = $profile->followupboss_status ?? [];
		$errors                   = $status['recent_errors'] ?? [];
		$errors[]                 = [
			'message'   => $message,
			'timestamp' => current_time( 'mysql' ),
		];
		$status['recent_errors']  = array_slice( $errors, -10 ); // Keep last 10

		$profile->followupboss_status = $status;
		$profile->save();
	}

	/**
	 * Get sync stats for user
	 *
	 * @param int $user_id User ID
	 * @return array
	 */
	public static function get_stats( int $user_id ): array {
		$profile = Profile::get_by_user_id( $user_id );
		if ( ! $profile ) {
			return [
				'total_synced'  => 0,
				'last_sync'     => null,
				'recent_errors' => [],
			];
		}

		$status = $profile->followupboss_status ?? [];

		return [
			'total_synced'  => $status['total_synced'] ?? 0,
			'last_sync'     => $status['last_sync'] ?? null,
			'recent_errors' => $status['recent_errors'] ?? [],
		];
	}

	/**
	 * Mask API key for display
	 *
	 * @param string $api_key API key
	 * @return string
	 */
	public static function mask_api_key( string $api_key ): string {
		if ( empty( $api_key ) ) {
			return '';
		}

		$length = strlen( $api_key );
		if ( $length <= 8 ) {
			return str_repeat( '*', $length );
		}

		return substr( $api_key, 0, 4 ) . str_repeat( '*', $length - 8 ) . substr( $api_key, -4 );
	}

	/**
	 * REST: Get FUB status
	 *
	 * @param \WP_REST_Request $request Request object
	 * @return \WP_REST_Response
	 */
	public static function rest_get_status( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$status  = self::get_status( $user_id );

		return new \WP_REST_Response( $status, 200 );
	}

	/**
	 * REST: Save API key
	 *
	 * @param \WP_REST_Request $request Request object
	 * @return \WP_REST_Response
	 */
	public static function rest_save_api_key( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$api_key = $request->get_param( 'api_key' );

		$result = self::save_api_key( $user_id, $api_key );

		$status_code = $result['success'] ? 200 : 400;
		return new \WP_REST_Response( $result, $status_code );
	}

	/**
	 * REST: Test connection
	 *
	 * @param \WP_REST_Request $request Request object
	 * @return \WP_REST_Response
	 */
	public static function rest_test_connection( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$api_key = self::get_api_key( $user_id );

		if ( empty( $api_key ) ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'message' => 'No API key configured',
				],
				400
			);
		}

		$result      = self::test_connection( $api_key );
		$status_code = $result['success'] ? 200 : 400;

		return new \WP_REST_Response( $result, $status_code );
	}

	/**
	 * REST: Disconnect
	 *
	 * @param \WP_REST_Request $request Request object
	 * @return \WP_REST_Response
	 */
	public static function rest_disconnect( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$profile = Profile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'message' => 'Profile not found',
				],
				404
			);
		}

		$profile->followupboss_api_key = null;
		$profile->followupboss_status  = null;
		$profile->save();

		return new \WP_REST_Response(
			[
				'success' => true,
				'message' => 'Disconnected from Follow Up Boss',
			],
			200
		);
	}

	/**
	 * REST: Get stats
	 *
	 * @param \WP_REST_Request $request Request object
	 * @return \WP_REST_Response
	 */
	public static function rest_get_stats( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$stats   = self::get_stats( $user_id );

		return new \WP_REST_Response( $stats, 200 );
	}
}
