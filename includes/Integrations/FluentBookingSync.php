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
	 * Get Azure AD credentials from WPO365 config.
	 */
	private static function get_azure_config(): array {
		static $config = null;
		if ( null !== $config ) {
			return $config;
		}

		if ( defined( 'WPO_OVERRIDES_1' ) && is_array( \WPO_OVERRIDES_1 ) ) {
			$wpo_options = \WPO_OVERRIDES_1;
		} else {
			$wpo_options = is_multisite()
				? get_site_option( 'wpo365_options', array() )
				: get_option( 'wpo365_options', array() );
		}

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

		// Temporarily suppress FluentBooking update nags.
		add_filter( 'site_transient_update_plugins', array( __CLASS__, 'hide_update_nag' ) );

		// Add script inside FluentBooking iframe to post OAuth URLs to parent.
		add_action( 'fluent_booking/front_footer', array( __CLASS__, 'output_iframe_oauth_messenger' ) );

	}

	/**
	 * Initialize the parent-side OAuth listener.
	 * This runs on ALL sites (including the portal) to listen for OAuth messages from iframes.
	 * Called separately from init() so it doesn't depend on FluentBooking being active.
	 */
	public static function init_oauth_listener(): void {
		add_action( 'wp_footer', array( __CLASS__, 'output_oauth_parent_listener' ) );
		add_action( 'wp_footer', array( __CLASS__, 'output_oauth_completion_handler' ) );
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

	/**
	 * Hide FluentBooking update notifications temporarily.
	 *
	 * @param object $transient Update transient data.
	 * @return object
	 */
	public static function hide_update_nag( $transient ) {
		if ( ! is_object( $transient ) ) {
			return $transient;
		}

		$plugins_to_hide = array( 'fluent-booking/fluent-booking.php', 'fluent-booking-pro/fluent-booking-pro.php' );
		foreach ( $plugins_to_hide as $plugin ) {
			unset( $transient->response[ $plugin ] );
		}

		return $transient;
	}

	// -------------------------------------------------------------------------
	// OAuth Iframe Escape - Uses postMessage to tell parent to open new tab
	// -------------------------------------------------------------------------

	/**
	 * Output listener on parent page to receive OAuth messages from iframe.
	 * Opens OAuth URL in new tab when message received.
	 */
	public static function output_oauth_parent_listener(): void {
		// Only output on pages that might contain the FluentBooking iframe.
		// Check if we're on the portal calendar page.
		if ( ! is_user_logged_in() ) {
			return;
		}

		?>
		<script>
		(function() {
			// Listen for OAuth open requests from iframe
			window.addEventListener('message', function(e) {
				if (e.data && e.data.type === 'frs-oauth-open' && e.data.url) {
					// Store that we're waiting for OAuth to complete
					sessionStorage.setItem('frs-oauth-pending', '1');
					window.open(e.data.url, '_blank');
				}
				// Listen for OAuth completion from the popup
				if (e.data && e.data.type === 'frs-oauth-complete') {
					sessionStorage.removeItem('frs-oauth-pending');
					// Refresh the iframe
					var iframe = document.querySelector('iframe');
					if (iframe) {
						iframe.src = iframe.src;
					}
				}
			});
		})();
		</script>
		<?php
	}

	/**
	 * Output script on /my-booking page to notify opener and close.
	 * This runs after OAuth completes and user lands on FluentBooking frontend.
	 */
	public static function output_oauth_completion_handler(): void {
		// Only run on /my-booking page
		if ( ! is_user_logged_in() ) {
			return;
		}

		// Check if this is the my-booking page (FluentBooking frontend)
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		if ( strpos( $request_uri, '/my-booking' ) === false ) {
			return;
		}

		?>
		<script>
		(function() {
			// If this window was opened by another window (OAuth popup)
			if (window.opener) {
				// Notify the opener that OAuth is complete
				window.opener.postMessage({ type: 'frs-oauth-complete' }, '*');
				// Close this tab
				window.close();
			}
		})();
		</script>
		<?php
	}

	/**
	 * Output script inside FluentBooking iframe that intercepts OAuth navigation
	 * and posts message to parent window to open in new tab.
	 */
	public static function output_iframe_oauth_messenger(): void {
		// Only output if we're in an iframe.
		?>
		<script>
		(function() {
			// Only run inside iframe
			if (window.self === window.top) return;

			// Patterns for OAuth URLs we need to escape
			function isOAuthUrl(url) {
				if (!url) return false;
				return url.indexOf('login.microsoftonline.com') !== -1 ||
				       url.indexOf('fluentbooking.com/wp-json/fluent-api/google') !== -1 ||
				       url.indexOf('/calendar/oauth-proxy') !== -1;
			}

			// Override location methods to catch OAuth redirects
			var origAssign = window.location.assign.bind(window.location);
			var origReplace = window.location.replace.bind(window.location);

			window.location.assign = function(url) {
				if (isOAuthUrl(url)) {
					window.parent.postMessage({ type: 'frs-oauth-open', url: url }, '*');
					return;
				}
				origAssign(url);
			};

			window.location.replace = function(url) {
				if (isOAuthUrl(url)) {
					window.parent.postMessage({ type: 'frs-oauth-open', url: url }, '*');
					return;
				}
				origReplace(url);
			};

			// Also catch direct href assignment via a proxy
			try {
				var originalHref = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href');
				if (originalHref && originalHref.set) {
					Object.defineProperty(window.location, 'href', {
						set: function(url) {
							if (isOAuthUrl(url)) {
								window.parent.postMessage({ type: 'frs-oauth-open', url: url }, '*');
								return;
							}
							originalHref.set.call(window.location, url);
						},
						get: originalHref.get ? originalHref.get.bind(window.location) : function() { return window.location.toString(); }
					});
				}
			} catch(e) {
				// location.href override not supported, fall back to click interception
			}

			// Fallback: intercept clicks on OAuth links
			document.addEventListener('click', function(e) {
				var el = e.target;
				while (el && el !== document) {
					if (el.tagName === 'A' && el.href && isOAuthUrl(el.href)) {
						e.preventDefault();
						e.stopPropagation();
						window.parent.postMessage({ type: 'frs-oauth-open', url: el.href }, '*');
						return false;
					}
					el = el.parentNode;
				}
			}, true);
		})();
		</script>
		<?php
	}

	// -------------------------------------------------------------------------
	// Auto-Create Hosts on Onboarding Completion (Site 2 only)
	// -------------------------------------------------------------------------

	/**
	 * Site ID where Fluent Booking hosts should be auto-created.
	 */
	const HOST_TARGET_SITE_ID = 2;

	/**
	 * Initialize auto-host creation hooks.
	 *
	 * @return void
	 */
	public static function init_auto_host(): void {
		// Create host when onboarding is completed.
		add_action( 'updated_user_meta', array( __CLASS__, 'maybe_create_host_on_onboarding' ), 10, 4 );
		add_action( 'added_user_meta', array( __CLASS__, 'maybe_create_host_on_onboarding' ), 10, 4 );

		// Also check on login for users who completed onboarding but don't have a host.
		add_action( 'wp_login', array( __CLASS__, 'check_host_on_login' ), 10, 2 );
	}

	/**
	 * Maybe create Fluent Booking host when onboarding meta is updated.
	 *
	 * @param int    $meta_id    Meta ID.
	 * @param int    $user_id    User ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 * @return void
	 */
	public static function maybe_create_host_on_onboarding( $meta_id, $user_id, $meta_key, $meta_value ): void {
		if ( '_frs_onboarding_complete' !== $meta_key ) {
			return;
		}

		if ( empty( $meta_value ) ) {
			return;
		}

		self::create_host_for_user( $user_id );
	}

	/**
	 * Check and create host on user login if onboarding is complete.
	 *
	 * @param string   $user_login Username.
	 * @param \WP_User $user       User object.
	 * @return void
	 */
	public static function check_host_on_login( $user_login, $user ): void {
		$onboarding_complete = get_user_meta( $user->ID, '_frs_onboarding_complete', true );

		if ( ! empty( $onboarding_complete ) ) {
			self::create_host_for_user( $user->ID );
		}
	}

	/**
	 * Create a Fluent Booking calendar/host for a user on site 2.
	 *
	 * @param int $user_id User ID.
	 * @return bool Whether the host was created.
	 */
	public static function create_host_for_user( int $user_id ): bool {
		global $wpdb;

		// Build table name for site 2.
		$table = $wpdb->base_prefix . self::HOST_TARGET_SITE_ID . '_fcal_calendars';

		// Check if Fluent Booking table exists on site 2.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
		if ( $table_exists !== $table ) {
			return false;
		}

		// Check if user already has a calendar on site 2.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$existing = $wpdb->get_var(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT id FROM {$table} WHERE user_id = %d",
				$user_id
			)
		);

		if ( $existing ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$calendar_data = array(
			'hash'              => md5( $user_id . time() . wp_rand() ),
			'user_id'           => $user_id,
			'title'             => $user->display_name . ' - Calendar',
			'slug'              => sanitize_title( $user->display_name . '-' . $user_id ),
			'description'       => 'Booking calendar for ' . $user->display_name,
			'settings'          => maybe_serialize(
				array(
					'event_color'        => '#2563eb',
					'max_book_per_slot'  => 1,
					'buffer_time_before' => 0,
					'buffer_time_after'  => 0,
				)
			),
			'status'            => 'active',
			'type'              => 'simple',
			'event_type'        => 'scheduling',
			'account_type'      => 'free',
			'visibility'        => 'public',
			'author_timezone'   => 'America/Los_Angeles',
			'max_book_per_slot' => 1,
			'created_at'        => current_time( 'mysql' ),
			'updated_at'        => current_time( 'mysql' ),
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$result = $wpdb->insert( $table, $calendar_data );

		if ( $result ) {
			error_log(
				sprintf(
					'FRS: Created Fluent Booking host on site %d for user %d (%s)',
					self::HOST_TARGET_SITE_ID,
					$user_id,
					$user->display_name
				)
			);
			return true;
		}

		return false;
	}

	/**
	 * Bulk create hosts for all users with completed onboarding.
	 *
	 * @return array Results with created and skipped counts.
	 */
	public static function bulk_create_hosts(): array {
		global $wpdb;

		$table = $wpdb->base_prefix . self::HOST_TARGET_SITE_ID . '_fcal_calendars';

		// Get users with completed onboarding who don't have a host on site 2.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$users = $wpdb->get_col(
			"SELECT um.user_id 
			FROM {$wpdb->usermeta} um
			WHERE um.meta_key = '_frs_onboarding_complete'
			AND um.meta_value != ''
			AND um.user_id NOT IN (
				SELECT user_id FROM {$table}
			)"
		);

		$created = 0;
		$failed  = 0;

		foreach ( $users as $user_id ) {
			if ( self::create_host_for_user( (int) $user_id ) ) {
				++$created;
			} else {
				++$failed;
			}
		}

		return array(
			'created' => $created,
			'failed'  => $failed,
			'total'   => count( $users ),
		);
	}
}
