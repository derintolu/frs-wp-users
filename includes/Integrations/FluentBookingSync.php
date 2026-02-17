<?php
/**
 * FluentBooking Calendar Integration
 *
 * Replaces FluentBooking's fluentbooking.com OAuth proxy with a direct
 * Microsoft OAuth flow using the hub's own Azure AD app (wpo365).
 *
 * Flow:
 * 1. FluentBooking's getAuthUrl() sends user to our proxy endpoint with client_id + redirect_uri
 * 2. Our proxy stores the redirect_uri, redirects to Microsoft authorize with itself as redirect_uri
 * 3. Microsoft redirects back to our proxy with ?code=
 * 4. Our proxy forwards the code to FluentBooking's admin-ajax handler
 * 5. FluentBooking's generateAuthCode() exchanges the code, using our proxy URL as redirect_uri (matches step 2)
 *
 * @package FRSUsers\Integrations
 */

namespace FRSUsers\Integrations;

defined( 'ABSPATH' ) || exit;

class FluentBookingSync {

	const PROXY_ROUTE_NS = 'frs-users/v1';
	const PROXY_ROUTE    = '/calendar/oauth-proxy';

	/**
	 * Get Azure AD credentials from wpo365 network config.
	 */
	private static function get_azure_config(): array {
		static $config = null;
		if ( null !== $config ) {
			return $config;
		}

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
	 * Get the full URL of our OAuth proxy endpoint.
	 */
	private static function get_proxy_url(): string {
		return rest_url( self::PROXY_ROUTE_NS . self::PROXY_ROUTE );
	}

	/**
	 * Initialize hooks and filters.
	 */
	public static function init(): void {
		if ( ! self::is_fluent_booking_active() ) {
			return;
		}

		$azure = self::get_azure_config();
		if ( empty( $azure['tenant_id'] ) || empty( $azure['app_id'] ) || empty( $azure['app_secret'] ) ) {
			return;
		}

		// Override FluentBooking's Outlook OAuth to use our Azure app + proxy.
		add_filter( 'fluent_booking/outlook_app_credentials', array( __CLASS__, 'filter_outlook_credentials' ) );
		add_filter( 'fluent_booking/outlook_app_redirect_url', array( __CLASS__, 'filter_redirect_url' ) );
		add_filter( 'fluent_booking/outlook_token_url', array( __CLASS__, 'filter_token_url' ) );
		add_filter( 'fluent_booking/outlook_refresh_token_url', array( __CLASS__, 'filter_token_url' ) );
		add_filter( 'fluent_booking/outlook_revoke_url', array( __CLASS__, 'filter_revoke_url' ) );

		// Register the OAuth proxy endpoint.
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Check if FluentBooking Pro is active (has the Outlook integration).
	 */
	private static function is_fluent_booking_active(): bool {
		return class_exists( '\\FluentBookingPro\\App\\Services\\Integrations\\Calendars\\Outlook\\OutlookHelper' );
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

	/**
	 * Replace fluentbooking.com proxy URL with our own proxy endpoint.
	 *
	 * This URL is used in two places by FluentBooking's Client class:
	 * 1. getAuthUrl() — as the base URL to navigate the user to
	 * 2. generateAuthCode() — as the redirect_uri in the token exchange
	 *
	 * Both must point to our proxy for the flow to work.
	 */
	public static function filter_redirect_url(): string {
		return self::get_proxy_url();
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
	// OAuth Proxy Endpoint
	// -------------------------------------------------------------------------

	public static function register_routes(): void {
		register_rest_route(
			self::PROXY_ROUTE_NS,
			self::PROXY_ROUTE,
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'handle_oauth_proxy' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * OAuth proxy endpoint handler.
	 *
	 * Two-phase flow:
	 * Phase 1 (initial request from FluentBooking):
	 *   - Receives ?client_id=...&redirect_uri=...  (from getAuthUrl)
	 *   - Stores redirect_uri in a transient
	 *   - Redirects to Microsoft authorize endpoint
	 *
	 * Phase 2 (callback from Microsoft):
	 *   - Receives ?code=...&state=...&session_state=...
	 *   - Reads stored redirect_uri from transient
	 *   - Forwards user to admin-ajax.php with the code
	 */
	public static function handle_oauth_proxy( \WP_REST_Request $request ): void {
		// Phase 2: Microsoft is redirecting back with an auth code.
		$code = $request->get_param( 'code' );
		if ( $code ) {
			self::handle_oauth_callback( $request );
			return;
		}

		// Check for OAuth error from Microsoft.
		$error = $request->get_param( 'error' );
		if ( $error ) {
			$desc = $request->get_param( 'error_description' ) ?: $error;
			wp_die(
				esc_html( 'Microsoft OAuth error: ' . $desc ),
				'OAuth Error',
				array( 'response' => 400, 'back_link' => true )
			);
			return;
		}

		// Phase 1: FluentBooking is sending the user here to start OAuth.
		$client_id    = $request->get_param( 'client_id' );
		$redirect_uri = $request->get_param( 'redirect_uri' );

		if ( ! $client_id || ! $redirect_uri ) {
			wp_die(
				'Missing required OAuth parameters.',
				'OAuth Error',
				array( 'response' => 400, 'back_link' => true )
			);
			return;
		}

		// Store the redirect_uri (admin-ajax.php callback) so we can forward the code later.
		$state_key = wp_generate_password( 20, false );
		set_transient(
			'frs_oauth_' . $state_key,
			array(
				'redirect_uri' => $redirect_uri,
				'user_id'      => get_current_user_id(),
			),
			600 // 10 minutes
		);

		$azure = self::get_azure_config();

		// Build the Microsoft authorize URL.
		$authorize_url = add_query_arg(
			array(
				'client_id'     => $azure['app_id'],
				'response_type' => 'code',
				'redirect_uri'  => self::get_proxy_url(),
				'response_mode' => 'query',
				'scope'         => 'Calendars.ReadWrite offline_access openid',
				'state'         => $state_key,
			),
			'https://login.microsoftonline.com/' . $azure['tenant_id'] . '/oauth2/v2.0/authorize'
		);

		// Redirect user to Microsoft.
		wp_redirect( $authorize_url );
		exit;
	}

	/**
	 * Phase 2: Handle the callback from Microsoft and forward to FluentBooking.
	 */
	private static function handle_oauth_callback( \WP_REST_Request $request ): void {
		$code      = $request->get_param( 'code' );
		$state_key = $request->get_param( 'state' );

		if ( ! $state_key ) {
			wp_die(
				'Missing state parameter in OAuth callback.',
				'OAuth Error',
				array( 'response' => 400, 'back_link' => true )
			);
			return;
		}

		// Retrieve the stored redirect info.
		$stored = get_transient( 'frs_oauth_' . $state_key );
		delete_transient( 'frs_oauth_' . $state_key );

		if ( ! $stored || empty( $stored['redirect_uri'] ) ) {
			wp_die(
				'OAuth session expired or invalid. Please try again.',
				'OAuth Error',
				array( 'response' => 400, 'back_link' => true )
			);
			return;
		}

		// Forward the auth code to FluentBooking's admin-ajax handler.
		// The redirect_uri contains the full admin-ajax.php URL with action and state (user ID).
		$callback_url = add_query_arg(
			array(
				'code'          => $code,
				'session_state' => $request->get_param( 'session_state' ) ?: '',
			),
			$stored['redirect_uri']
		);

		wp_redirect( $callback_url );
		exit;
	}
}
