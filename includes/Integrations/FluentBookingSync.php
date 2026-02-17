<?php
/**
 * FluentBooking Calendar Integration
 *
 * Provisions FluentBooking's Outlook calendar connections using wpo365's
 * existing Microsoft 365 auth, eliminating the need for a separate consent prompt.
 *
 * @package FRSUsers\Integrations
 */

namespace FRSUsers\Integrations;

defined( 'ABSPATH' ) || exit;

class FluentBookingSync {

	const REDIRECT_URL = 'https://myhub21.com/';

	/**
	 * Get Azure AD credentials from wpo365 network config.
	 *
	 * @return array{tenant_id: string, app_id: string, app_secret: string}
	 */
	private static function get_azure_config(): array {
		static $config = null;
		if ( null !== $config ) {
			return $config;
		}

		// wpo365 stores config in network-level sitemeta on multisite.
		$wpo_options = is_multisite()
			? get_site_option( 'wpo365_options', array() )
			: get_option( 'wpo365_options', array() );

		$config = array(
			'tenant_id'  => $wpo_options['tenant_id'] ?? '',
			'app_id'     => $wpo_options['application_id'] ?? '',
			'app_secret' => $wpo_options['application_secret'] ?? '',
		);

		return $config;
	}

	/**
	 * Initialize hooks and filters.
	 */
	public static function init(): void {
		if ( ! self::is_fluent_booking_active() ) {
			return;
		}

		// Override FluentBooking's Outlook OAuth credentials to use the hub21 wpo365 app.
		add_filter( 'fluent_booking/outlook_app_credentials', array( __CLASS__, 'filter_outlook_credentials' ) );
		add_filter( 'fluent_booking/outlook_app_redirect_url', array( __CLASS__, 'filter_redirect_url' ) );
		add_filter( 'fluent_booking/outlook_token_url', array( __CLASS__, 'filter_token_url' ) );
		add_filter( 'fluent_booking/outlook_refresh_token_url', array( __CLASS__, 'filter_token_url' ) );
		add_filter( 'fluent_booking/outlook_revoke_url', array( __CLASS__, 'filter_revoke_url' ) );

		// REST API endpoints for frontend calendar provisioning.
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Check if FluentBooking Pro is active (has the Outlook integration).
	 */
	private static function is_fluent_booking_active(): bool {
		return class_exists( '\FluentBookingPro\App\Services\Integrations\Calendars\Outlook\OutlookHelper' );
	}

	// -------------------------------------------------------------------------
	// Filters — Override FluentBooking's Outlook OAuth config
	// -------------------------------------------------------------------------

	public static function filter_outlook_credentials( array $config ): array {
		$azure                       = self::get_azure_config();
		$config['client_id']         = $azure['app_id'];
		$config['client_secret']     = $azure['app_secret'];
		$config['constant_defined']  = true;
		$config['is_system_defined'] = 'yes';
		return $config;
	}

	public static function filter_redirect_url(): string {
		return self::REDIRECT_URL;
	}

	public static function filter_token_url(): string {
		$azure = self::get_azure_config();
		return 'https://login.microsoftonline.com/' . $azure['tenant_id'] . '/oauth2/v2.0/token';
	}

	public static function filter_revoke_url(): string {
		$azure = self::get_azure_config();
		return 'https://login.microsoftonline.com/' . $azure['tenant_id'] . '/oauth2/v2.0/logout';
	}

	// -------------------------------------------------------------------------
	// REST API
	// -------------------------------------------------------------------------

	public static function register_routes(): void {
		register_rest_route(
			'frs-users/v1',
			'/calendar/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_status' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/calendar/provision',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_provision' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/calendar/disconnect',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_disconnect' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/calendar/dismiss',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_dismiss' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);
	}

	/**
	 * GET /calendar/status — Check connection state for current user.
	 */
	public static function rest_status( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id   = get_current_user_id();
		$dismissed = (bool) get_user_meta( $user_id, 'frs_booking_calendar_dismissed', true );
		$meta      = self::get_outlook_meta( $user_id );

		if ( $meta ) {
			$settings = maybe_unserialize( $meta->value );
			if ( is_string( $settings ) ) {
				$settings = json_decode( $settings, true );
			}

			return new \WP_REST_Response(
				array(
					'connected'      => true,
					'dismissed'      => false,
					'email'          => $settings['remote_email'] ?? '',
					'calendar_lists' => $settings['calendar_lists'] ?? array(),
					'last_error'     => $settings['last_error'] ?? '',
				)
			);
		}

		return new \WP_REST_Response(
			array(
				'connected' => false,
				'dismissed' => $dismissed,
				'email'     => '',
			)
		);
	}

	/**
	 * POST /calendar/provision — Exchange wpo365 token for calendar access and store in FluentBooking.
	 */
	public static function rest_provision( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();

		// Already connected?
		if ( self::get_outlook_meta( $user_id ) ) {
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'Calendar already connected.',
				)
			);
		}

		// Get access token via wpo365.
		$token_result = self::get_wpo365_calendar_token();

		if ( is_wp_error( $token_result ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => $token_result->get_error_message(),
				),
				400
			);
		}

		$access_token  = $token_result['access_token'];
		$refresh_token = $token_result['refresh_token'] ?? '';
		$expires_in    = $token_result['expires_in'] ?? 3600;

		// Get user email.
		$user  = get_userdata( $user_id );
		$email = $user->user_email;

		// Fetch calendar list from Microsoft Graph.
		$calendars = self::fetch_calendar_list( $access_token );

		// Encrypt tokens using FluentBooking's helper.
		$encrypt = array( '\FluentBooking\App\Services\Helper', 'encryptKey' );
		$encrypted_access  = is_callable( $encrypt ) ? call_user_func( $encrypt, $access_token ) : $access_token;
		$encrypted_refresh = is_callable( $encrypt ) ? call_user_func( $encrypt, $refresh_token ) : $refresh_token;

		// Build meta value in FluentBooking's expected format.
		$meta_value = array(
			'access_token'        => $encrypted_access,
			'refresh_token'       => $encrypted_refresh,
			'expires_in'          => time() + intval( $expires_in ),
			'token_type'          => 'Bearer',
			'remote_email'        => $email,
			'calendar_lists'      => $calendars,
			'conflict_check_ids'  => array(),
			'additional_settings' => array( 'teams_enabled' => 'no' ),
			'last_error'          => '',
		);

		// Insert into FluentBooking's meta table.
		self::store_outlook_meta( $user_id, $email, $meta_value );

		// Clear dismissed flag.
		delete_user_meta( $user_id, 'frs_booking_calendar_dismissed' );

		return new \WP_REST_Response(
			array(
				'success'        => true,
				'message'        => 'Calendar connected successfully!',
				'email'          => $email,
				'calendar_lists' => $calendars,
			)
		);
	}

	/**
	 * POST /calendar/disconnect — Remove the calendar connection.
	 */
	public static function rest_disconnect( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$meta    = self::get_outlook_meta( $user_id );

		if ( ! $meta ) {
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'No calendar connection found.',
				)
			);
		}

		global $wpdb;
		$table = $wpdb->prefix . 'fcal_meta';
		$wpdb->delete( $table, array( 'id' => $meta->id ), array( '%d' ) );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => 'Calendar disconnected.',
			)
		);
	}

	/**
	 * POST /calendar/dismiss — Hide the onboarding prompt.
	 */
	public static function rest_dismiss( \WP_REST_Request $request ): \WP_REST_Response {
		update_user_meta( get_current_user_id(), 'frs_booking_calendar_dismissed', true );
		return new \WP_REST_Response( array( 'success' => true ) );
	}

	// -------------------------------------------------------------------------
	// Token acquisition
	// -------------------------------------------------------------------------

	/**
	 * Get a calendar access token using wpo365's token service.
	 *
	 * @return array{access_token: string, refresh_token: string, expires_in: int}|\WP_Error
	 */
	private static function get_wpo365_calendar_token() {
		// Try wpo365 Access_Token_Service first.
		if ( class_exists( '\Wpo\Services\Access_Token_Service' ) ) {
			$scope  = 'https://graph.microsoft.com/Calendars.ReadWrite';
			$result = \Wpo\Services\Access_Token_Service::get_access_token( $scope );

			if ( ! is_wp_error( $result ) && ! empty( $result->access_token ) ) {
				return array(
					'access_token'  => $result->access_token,
					'refresh_token' => $result->refresh_token ?? '',
					'expires_in'    => $result->expires_in ?? 3600,
				);
			}
		}

		// Fallback: exchange the stored auth code directly.
		return self::exchange_auth_code_for_tokens();
	}

	/**
	 * Fallback: exchange the WPO365_AUTH_CODE for calendar tokens directly via Microsoft.
	 *
	 * @return array|\WP_Error
	 */
	private static function exchange_auth_code_for_tokens() {
		$user_id   = get_current_user_id();
		$auth_code = get_user_meta( $user_id, 'WPO365_AUTH_CODE', true );

		if ( empty( $auth_code ) ) {
			return new \WP_Error(
				'no_auth_code',
				'No Microsoft authorization code found. Please log out and log back in, then try again.'
			);
		}

		// The auth code may be stored as JSON.
		if ( is_string( $auth_code ) ) {
			$decoded = json_decode( $auth_code );
			if ( $decoded && isset( $decoded->code ) ) {
				$auth_code = $decoded->code;
			}
		}

		$azure = self::get_azure_config();
		$body  = array(
			'client_id'     => $azure['app_id'],
			'client_secret' => $azure['app_secret'],
			'redirect_uri'  => self::REDIRECT_URL,
			'scope'         => 'offline_access https://graph.microsoft.com/Calendars.ReadWrite',
			'grant_type'    => 'authorization_code',
			'code'          => $auth_code,
		);

		$response = wp_remote_post(
			'https://login.microsoftonline.com/' . $azure['tenant_id'] . '/oauth2/v2.0/token',
			array(
				'body'    => $body,
				'timeout' => 20,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! empty( $data['error'] ) ) {
			return new \WP_Error(
				'token_exchange_failed',
				$data['error_description'] ?? $data['error']
			);
		}

		return array(
			'access_token'  => $data['access_token'] ?? '',
			'refresh_token' => $data['refresh_token'] ?? '',
			'expires_in'    => $data['expires_in'] ?? 3600,
		);
	}

	// -------------------------------------------------------------------------
	// Microsoft Graph helpers
	// -------------------------------------------------------------------------

	/**
	 * Fetch the user's calendar list from Microsoft Graph.
	 */
	private static function fetch_calendar_list( string $access_token ): array {
		$response = wp_remote_get(
			'https://graph.microsoft.com/v1.0/me/calendars?$top=25',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
					'Content-Type'  => 'application/json',
				),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			return array();
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $data['value'] ) ) {
			return array();
		}

		$calendars = array();
		foreach ( $data['value'] as $item ) {
			$calendars[] = array(
				'id'        => $item['id'],
				'title'     => $item['name'] . ' (' . ( $item['owner']['address'] ?? '' ) . ')',
				'can_write' => ! empty( $item['canEdit'] ) ? 'yes' : 'no',
			);
		}

		return $calendars;
	}

	// -------------------------------------------------------------------------
	// FluentBooking meta table helpers
	// -------------------------------------------------------------------------

	/**
	 * Get the Outlook token meta entry for a user from FluentBooking's table.
	 */
	private static function get_outlook_meta( int $user_id ): ?object {
		global $wpdb;
		$table = $wpdb->prefix . 'fcal_meta';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		return $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE object_type = '_outlook_user_token' AND object_id = %d LIMIT 1",
				$user_id
			)
		);
	}

	/**
	 * Store an Outlook token entry in FluentBooking's meta table.
	 */
	private static function store_outlook_meta( int $user_id, string $email, array $value ): void {
		global $wpdb;
		$table = $wpdb->prefix . 'fcal_meta';

		// Check for existing entry.
		$existing = self::get_outlook_meta( $user_id );

		if ( $existing ) {
			$wpdb->update(
				$table,
				array(
					'key'   => $email,
					'value' => maybe_serialize( $value ),
				),
				array( 'id' => $existing->id ),
				array( '%s', '%s' ),
				array( '%d' )
			);
		} else {
			$wpdb->insert(
				$table,
				array(
					'object_type' => '_outlook_user_token',
					'object_id'   => $user_id,
					'key'         => $email,
					'value'       => maybe_serialize( $value ),
				),
				array( '%s', '%d', '%s', '%s' )
			);
		}
	}

	/**
	 * Check if a user has an Outlook calendar connected in FluentBooking.
	 */
	public static function is_user_connected( int $user_id ): bool {
		return null !== self::get_outlook_meta( $user_id );
	}

	/**
	 * Check if a user dismissed the calendar onboarding.
	 */
	public static function is_dismissed( int $user_id ): bool {
		return (bool) get_user_meta( $user_id, 'frs_booking_calendar_dismissed', true );
	}
}
