<?php
/**
 * Onboarding Wizard
 *
 * Renders a multi-step setup wizard for loan officers on first login.
 * Steps: Welcome → Calendar → Template → Done
 *
 * Uses WordPress Interactivity API (same pattern as SettingsPage).
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 3.3.0
 */

namespace FRSUsers\Core;

defined( 'ABSPATH' ) || exit;

class OnboardingWizard {

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return self
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public function init() {
		$context = Roles::get_site_context();
		if ( ! in_array( $context, array( 'hub', 'development' ), true ) ) {
			return;
		}

		add_shortcode( 'frs_onboarding_wizard', array( $this, 'render_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'template_redirect', array( $this, 'maybe_redirect_to_wizard' ) );
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Redirect loan officers to wizard on first login.
	 *
	 * @return void
	 */
	public function maybe_redirect_to_wizard() {
		if ( ! is_user_logged_in() ) {
			return;
		}

		// Skip non-frontend requests
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || defined( 'REST_REQUEST' ) ) {
			return;
		}

		$user = wp_get_current_user();

		// Only loan officers
		if ( ! in_array( 'loan_officer', $user->roles, true ) ) {
			return;
		}

		// Skip if already completed
		if ( get_user_meta( $user->ID, 'frs_onboarding_completed', true ) ) {
			return;
		}

		// Skip if user already has a FluentBooking calendar
		if ( CalendarProvisioner::user_has_calendar( $user->ID ) ) {
			return;
		}

		// Skip if already on the wizard page
		$wizard_page = $this->get_wizard_page_url();
		if ( $wizard_page && trailingslashit( $this->get_current_url() ) === trailingslashit( $wizard_page ) ) {
			return;
		}

		// Redirect to wizard
		if ( $wizard_page ) {
			wp_safe_redirect( $wizard_page );
			exit;
		}
	}

	/**
	 * Get the wizard page URL.
	 *
	 * @return string|false
	 */
	private function get_wizard_page_url() {
		$page = get_page_by_path( 'get-started' );
		if ( $page ) {
			return get_permalink( $page );
		}
		return false;
	}

	/**
	 * Get the current request URL (path only, no query string).
	 *
	 * @return string
	 */
	private function get_current_url() {
		return home_url( wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			'frs-users/v1',
			'/onboarding/create-calendar',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_create_calendar' ),
				'permission_callback' => function () {
					return current_user_can( 'read' ) && in_array( 'loan_officer', wp_get_current_user()->roles, true );
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/complete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_complete' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/calendar-status',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'handle_calendar_status' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);
	}

	/**
	 * Handle create calendar REST request.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function handle_create_calendar( \WP_REST_Request $request ) {
		$template_key = sanitize_text_field( $request->get_param( 'template' ) ?: 'consultation' );
		$user_id      = get_current_user_id();

		$result = CalendarProvisioner::provision_calendar( $user_id, $template_key );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response(
			array(
				'success'     => true,
				'calendar_id' => $result['calendar_id'],
				'event_id'    => $result['event_id'],
				'booking_url' => $result['booking_url'],
			),
			200
		);
	}

	/**
	 * Handle onboarding complete REST request.
	 *
	 * @return \WP_REST_Response
	 */
	public function handle_complete() {
		$user_id = get_current_user_id();
		update_user_meta( $user_id, 'frs_onboarding_completed', current_time( 'mysql' ) );

		return new \WP_REST_Response( array( 'success' => true ), 200 );
	}

	/**
	 * Handle calendar status check (polling after OAuth return).
	 *
	 * @return \WP_REST_Response
	 */
	public function handle_calendar_status() {
		$user_id   = get_current_user_id();
		$connected = false;

		// Check if FluentBooking has a connected Outlook calendar for this user
		if ( class_exists( '\\FluentBookingPro\\App\\Services\\Integrations\\Calendars\\Outlook\\OutlookHelper' ) ) {
			$outlook_helper = new \FluentBookingPro\App\Services\Integrations\Calendars\Outlook\OutlookHelper();
			if ( method_exists( $outlook_helper, 'getAccessToken' ) ) {
				$token = $outlook_helper->getAccessToken( $user_id );
				$connected = ! empty( $token );
			}
		}

		return new \WP_REST_Response(
			array(
				'connected' => $connected,
			),
			200
		);
	}

	/**
	 * Enqueue assets.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( ! $this->is_wizard_page() ) {
			return;
		}

		wp_enqueue_script_module(
			'frs-users-onboarding-view',
			FRS_USERS_URL . 'assets/js/onboarding-view.js',
			array( '@wordpress/interactivity' ),
			FRS_USERS_VERSION
		);

		add_action( 'wp_head', array( $this, 'output_styles' ), 100 );
	}

	/**
	 * Output styles in head.
	 *
	 * @return void
	 */
	public function output_styles() {
		echo '<style id="frs-onboarding-styles">' . $this->get_styles() . '</style>';
	}

	/**
	 * Check if current page has the wizard shortcode.
	 *
	 * @return bool
	 */
	private function is_wizard_page() {
		global $post;
		if ( ! $post ) {
			return false;
		}
		return has_shortcode( $post->post_content, 'frs_onboarding_wizard' );
	}

	/**
	 * Render the wizard shortcode.
	 *
	 * @return string
	 */
	public function render_shortcode() {
		if ( ! is_user_logged_in() ) {
			return '<div class="onb-alert onb-alert--error"><p>You must be logged in to access this page.</p></div>';
		}

		$user = wp_get_current_user();
		$fluent_booking_active = class_exists( '\\FluentBooking\\App\\Models\\Calendar' );
		$templates = CalendarProvisioner::get_templates();

		// Build template data for context
		$template_data = array();
		foreach ( $templates as $key => $tmpl ) {
			$template_data[] = array(
				'key'         => $key,
				'title'       => $tmpl['title'],
				'duration'    => $tmpl['duration'],
				'type'        => 'ms_teams' === $tmpl['location_type'] ? 'MS Teams' : 'Phone',
				'description' => $tmpl['description'],
			);
		}

		// Check if user already has a connected calendar
		$calendar_connected = false;
		if ( class_exists( '\\FluentBookingPro\\App\\Services\\Integrations\\Calendars\\Outlook\\OutlookHelper' ) ) {
			$outlook_helper = new \FluentBookingPro\App\Services\Integrations\Calendars\Outlook\OutlookHelper();
			if ( method_exists( $outlook_helper, 'getAccessToken' ) ) {
				$token = $outlook_helper->getAccessToken( $user->ID );
				$calendar_connected = ! empty( $token );
			}
		}

		$context = array(
			'currentStep'         => 1,
			'totalSteps'          => 4,
			'isProcessing'        => false,
			'message'             => null,
			'restNonce'           => wp_create_nonce( 'wp_rest' ),
			'restUrl'             => rest_url(),
			'firstName'           => $user->first_name,
			'lastName'            => $user->last_name,
			'email'               => $user->user_email,
			'calendarConnected'   => $calendar_connected,
			'calendarSkipped'     => false,
			'fluentBookingActive' => $fluent_booking_active,
			'selectedTemplate'    => '',
			'templates'           => $template_data,
			'bookingUrl'          => '',
			'calendarCreated'     => false,
			'adminUrl'            => admin_url(),
			'homeUrl'             => home_url( '/' ),
		);

		ob_start();
		?>
		<div
			class="onb-wizard"
			data-wp-interactive="frs-users/onboarding"
			<?php echo wp_interactivity_data_wp_context( $context ); ?>
			data-wp-init="callbacks.onInit"
		>
			<!-- Progress Bar -->
			<div class="onb-progress">
				<div class="onb-progress__bar" data-wp-style--width="state.progressWidth"></div>
			</div>
			<div class="onb-progress__steps">
				<span class="onb-progress__step" data-wp-class--onb-progress__step--active="state.isStep1OrBeyond">1</span>
				<span class="onb-progress__step" data-wp-class--onb-progress__step--active="state.isStep2OrBeyond">2</span>
				<span class="onb-progress__step" data-wp-class--onb-progress__step--active="state.isStep3OrBeyond">3</span>
				<span class="onb-progress__step" data-wp-class--onb-progress__step--active="state.isStep4">4</span>
			</div>

			<!-- Message Alert -->
			<div data-wp-bind--hidden="!state.hasMessage" class="onb-alert" data-wp-class--onb-alert--error="state.isErrorMessage" data-wp-class--onb-alert--success="state.isSuccessMessage">
				<span data-wp-text="state.messageText"></span>
			</div>

			<!-- Step 1: Welcome -->
			<div data-wp-bind--hidden="!state.isStep1" class="onb-step">
				<div class="onb-card">
					<div class="onb-card__icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
							<circle cx="12" cy="7" r="4"/>
						</svg>
					</div>
					<h1 class="onb-card__title">Welcome to Hub21</h1>
					<p class="onb-card__subtitle">Let's get your profile set up. First, confirm your name.</p>

					<div class="onb-form-group">
						<div class="onb-form-row">
							<div class="onb-field">
								<label class="onb-label">First Name</label>
								<input
									type="text"
									class="onb-input"
									data-field="firstName"
									data-wp-bind--value="context.firstName"
									data-wp-on--input="actions.updateField"
								/>
							</div>
							<div class="onb-field">
								<label class="onb-label">Last Name</label>
								<input
									type="text"
									class="onb-input"
									data-field="lastName"
									data-wp-bind--value="context.lastName"
									data-wp-on--input="actions.updateField"
								/>
							</div>
						</div>
						<div class="onb-field">
							<label class="onb-label">Email</label>
							<div class="onb-input-readonly" data-wp-text="context.email"></div>
							<p class="onb-hint">Email is managed through your Microsoft account</p>
						</div>
					</div>

					<div class="onb-actions">
						<button
							type="button"
							class="onb-btn onb-btn--primary"
							data-wp-on--click="actions.nextStep"
							data-wp-bind--disabled="!state.canProceedStep1"
						>
							Continue
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Step 2: Calendar Connection -->
			<div data-wp-bind--hidden="!state.isStep2" class="onb-step">
				<div class="onb-card">
					<div class="onb-card__icon onb-card__icon--calendar">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
					</div>
					<h1 class="onb-card__title">Connect Your Calendar</h1>
					<p class="onb-card__subtitle">Connect your Outlook calendar to sync availability and automatically add meetings.</p>

					<!-- Not connected state -->
					<div data-wp-bind--hidden="context.calendarConnected">
						<div data-wp-bind--hidden="!context.fluentBookingActive" class="onb-calendar-actions">
							<button
								type="button"
								class="onb-btn onb-btn--outlook"
								data-wp-on--click="actions.connectOutlook"
							>
								<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
									<path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.33.75.1.43.1.87zm-5.69 3.27V8.68l-2.19.31v6.01l2.19.31zm15.81-8.56v13.5l-7.31 1.03V2.72l7.31 1.03zM8.74 8.11l1.08-.12v7.92l-1.08-.12V8.11zm2.25-.26l1.08-.12v8.44l-1.08-.12V7.85zm2.25-.27l1.08-.12v8.98l-1.08-.12V7.58z"/>
								</svg>
								Connect Outlook Calendar
							</button>
							<p class="onb-hint onb-hint--center">You'll be redirected to Microsoft to authorize access</p>
						</div>
						<div data-wp-bind--hidden="context.fluentBookingActive" class="onb-alert onb-alert--info">
							<p>Calendar integration is not available yet. You can set this up later from your settings.</p>
						</div>
					</div>

					<!-- Connected state -->
					<div data-wp-bind--hidden="!context.calendarConnected" class="onb-success-box">
						<svg viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" width="24" height="24">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
							<polyline points="22 4 12 14.01 9 11.01"/>
						</svg>
						<span>Outlook calendar connected successfully!</span>
					</div>

					<div class="onb-actions onb-actions--split">
						<button
							type="button"
							class="onb-btn onb-btn--ghost"
							data-wp-on--click="actions.prevStep"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
							Back
						</button>
						<div class="onb-actions__right">
							<button
								type="button"
								class="onb-btn onb-btn--secondary"
								data-wp-on--click="actions.skipCalendar"
								data-wp-bind--hidden="context.calendarConnected"
							>
								Skip for now
							</button>
							<button
								type="button"
								class="onb-btn onb-btn--primary"
								data-wp-on--click="actions.nextStep"
							>
								Continue
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Step 3: Template Selection -->
			<div data-wp-bind--hidden="!state.isStep3" class="onb-step">
				<div class="onb-card">
					<div class="onb-card__icon onb-card__icon--template">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
							<rect x="3" y="3" width="7" height="7"/>
							<rect x="14" y="3" width="7" height="7"/>
							<rect x="14" y="14" width="7" height="7"/>
							<rect x="3" y="14" width="7" height="7"/>
						</svg>
					</div>
					<h1 class="onb-card__title">Choose Your Booking Page</h1>
					<p class="onb-card__subtitle">Select a meeting type for your booking page. You can add more later.</p>

					<div class="onb-templates">
						<?php foreach ( $template_data as $tmpl ) : ?>
						<button
							type="button"
							class="onb-template-card"
							data-template="<?php echo esc_attr( $tmpl['key'] ); ?>"
							data-wp-on--click="actions.selectTemplate"
							data-wp-class--onb-template-card--selected="state.isTemplate_<?php echo esc_attr( $tmpl['key'] ); ?>"
						>
							<div class="onb-template-card__header">
								<span class="onb-template-card__duration"><?php echo esc_html( $tmpl['duration'] ); ?> min</span>
								<span class="onb-template-card__type"><?php echo esc_html( $tmpl['type'] ); ?></span>
							</div>
							<h3 class="onb-template-card__title"><?php echo esc_html( $tmpl['title'] ); ?></h3>
							<p class="onb-template-card__desc"><?php echo esc_html( $tmpl['description'] ); ?></p>
						</button>
						<?php endforeach; ?>
					</div>

					<div class="onb-actions onb-actions--split">
						<button
							type="button"
							class="onb-btn onb-btn--ghost"
							data-wp-on--click="actions.prevStep"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
							Back
						</button>
						<button
							type="button"
							class="onb-btn onb-btn--primary"
							data-wp-on--click="actions.nextStep"
							data-wp-bind--disabled="!state.canProceedStep3"
						>
							<span data-wp-text="context.isProcessing ? 'Creating...' : 'Create Booking Page'"></span>
							<svg data-wp-bind--hidden="context.isProcessing" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Step 4: Done -->
			<div data-wp-bind--hidden="!state.isStep4" class="onb-step">
				<div class="onb-card onb-card--done">
					<div class="onb-card__icon onb-card__icon--done">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
							<polyline points="22 4 12 14.01 9 11.01"/>
						</svg>
					</div>
					<h1 class="onb-card__title">You're All Set!</h1>
					<p class="onb-card__subtitle">Your booking page is live and a "Book a Meeting" button has been added to your profile.</p>

					<!-- Booking URL -->
					<div data-wp-bind--hidden="!context.bookingUrl" class="onb-url-box">
						<label class="onb-label">Your Booking URL</label>
						<div class="onb-url-row">
							<input
								type="text"
								class="onb-input onb-input--url"
								data-wp-bind--value="context.bookingUrl"
								readonly
							/>
							<button
								type="button"
								class="onb-btn onb-btn--secondary"
								data-wp-on--click="actions.copyBookingUrl"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
								</svg>
								Copy
							</button>
						</div>
					</div>

					<div class="onb-actions">
						<button
							type="button"
							class="onb-btn onb-btn--primary onb-btn--lg"
							data-wp-on--click="actions.finishWizard"
						>
							Go to Hub21
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</button>
					</div>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get component styles.
	 *
	 * @return string
	 */
	private function get_styles() {
		return '
			.onb-wizard {
				--brand-blue: #2563EB;
				--brand-cyan: #2DD4DA;
				--brand-navy: #171A1F;
				--brand-text: #374151;
				--brand-text-light: #6b7280;
				--brand-border: #e5e7eb;
				--brand-bg: #f9fafb;
				--brand-gradient: linear-gradient(135deg, #2563EB 0%, #2DD4DA 100%);
				max-width: 640px;
				margin: 2rem auto;
				padding: 1.5rem;
			}
			.onb-wizard [hidden] { display: none !important; }

			/* Progress */
			.onb-progress {
				height: 4px;
				background: var(--brand-border);
				border-radius: 2px;
				margin-bottom: 0.75rem;
				overflow: hidden;
			}
			.onb-progress__bar {
				height: 100%;
				background: var(--brand-gradient);
				border-radius: 2px;
				transition: width 0.4s ease;
			}
			.onb-progress__steps {
				display: flex;
				justify-content: space-between;
				margin-bottom: 2rem;
			}
			.onb-progress__step {
				width: 28px;
				height: 28px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 0.75rem;
				font-weight: 600;
				background: var(--brand-border);
				color: var(--brand-text-light);
				transition: all 0.3s;
			}
			.onb-progress__step--active {
				background: var(--brand-gradient);
				color: white;
			}

			/* Alerts */
			.onb-alert {
				padding: 0.75rem 1rem;
				border-radius: 8px;
				font-size: 0.875rem;
				margin-bottom: 1rem;
				border: 1px solid var(--brand-border);
			}
			.onb-alert--error { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
			.onb-alert--success { background: #dcfce7; border-color: #bbf7d0; color: #15803d; }
			.onb-alert--info { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
			.onb-alert p { margin: 0; }

			/* Cards */
			.onb-step { animation: onb-fade-in 0.3s ease; }
			@keyframes onb-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

			.onb-card {
				background: white;
				border: 1px solid var(--brand-border);
				border-radius: 12px;
				padding: 2rem;
				box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
			}
			.onb-card__icon {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 80px;
				height: 80px;
				margin: 0 auto 1.5rem;
				border-radius: 50%;
				background: linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(45,212,218,0.1) 100%);
				color: var(--brand-blue);
			}
			.onb-card__icon--done { color: #15803d; background: #dcfce7; }
			.onb-card__title {
				font-size: 1.5rem;
				font-weight: 700;
				color: var(--brand-navy);
				text-align: center;
				margin: 0 0 0.5rem;
			}
			.onb-card__subtitle {
				font-size: 0.9375rem;
				color: var(--brand-text-light);
				text-align: center;
				margin: 0 0 2rem;
				line-height: 1.5;
			}

			/* Form */
			.onb-form-group { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
			.onb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
			.onb-field { display: flex; flex-direction: column; gap: 0.25rem; }
			.onb-label { font-size: 0.875rem; font-weight: 500; color: var(--brand-navy); }
			.onb-input {
				height: 40px;
				padding: 0 12px;
				border: 2px solid var(--brand-border);
				border-radius: 8px;
				font-size: 0.875rem;
				color: var(--brand-navy);
				transition: border-color 0.2s;
				outline: none;
				background: white;
			}
			.onb-input:focus {
				border-color: transparent;
				background: linear-gradient(white, white) padding-box, var(--brand-gradient) border-box;
			}
			.onb-input-readonly {
				height: 40px;
				padding: 0 12px;
				display: flex;
				align-items: center;
				background: #f3f4f6;
				border: 1px solid var(--brand-border);
				border-radius: 8px;
				color: var(--brand-text-light);
				font-size: 0.875rem;
			}
			.onb-hint { font-size: 0.75rem; color: var(--brand-text-light); margin: 0.25rem 0 0; }
			.onb-hint--center { text-align: center; }

			/* Buttons */
			.onb-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; }
			.onb-actions--split { justify-content: space-between; }
			.onb-actions__right { display: flex; gap: 0.75rem; }

			.onb-btn {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;
				padding: 0.625rem 1.25rem;
				border-radius: 8px;
				font-size: 0.875rem;
				font-weight: 500;
				cursor: pointer;
				border: none;
				transition: all 0.15s;
				white-space: nowrap;
			}
			.onb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
			.onb-btn--primary {
				background: var(--brand-gradient);
				color: white;
				box-shadow: 0 2px 8px rgba(37,99,235,0.3);
			}
			.onb-btn--primary:hover:not(:disabled) {
				box-shadow: 0 4px 12px rgba(37,99,235,0.4);
			}
			.onb-btn--secondary {
				background: #f3f4f6;
				color: var(--brand-navy);
				border: 1px solid var(--brand-border);
			}
			.onb-btn--secondary:hover { background: #e5e7eb; }
			.onb-btn--ghost {
				background: transparent;
				color: var(--brand-text-light);
			}
			.onb-btn--ghost:hover { color: var(--brand-navy); }
			.onb-btn--outlook {
				background: #0078d4;
				color: white;
				padding: 0.75rem 1.5rem;
				font-size: 1rem;
				width: 100%;
			}
			.onb-btn--outlook:hover { background: #106ebe; }
			.onb-btn--lg { padding: 0.75rem 2rem; font-size: 1rem; }

			/* Calendar connect section */
			.onb-calendar-actions {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.75rem;
				margin-bottom: 1rem;
			}
			.onb-success-box {
				display: flex;
				align-items: center;
				gap: 0.75rem;
				padding: 1rem;
				background: #dcfce7;
				border: 1px solid #bbf7d0;
				border-radius: 8px;
				color: #15803d;
				font-weight: 500;
				font-size: 0.875rem;
				margin-bottom: 1rem;
			}

			/* Template cards */
			.onb-templates {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				margin-bottom: 1rem;
			}
			.onb-template-card {
				text-align: left;
				padding: 1rem 1.25rem;
				border: 2px solid var(--brand-border);
				border-radius: 10px;
				background: white;
				cursor: pointer;
				transition: all 0.2s;
			}
			.onb-template-card:hover {
				border-color: #93c5fd;
				background: #f0f7ff;
			}
			.onb-template-card--selected {
				border-color: var(--brand-blue) !important;
				background: linear-gradient(white, white) padding-box, var(--brand-gradient) border-box !important;
				box-shadow: 0 0 0 1px var(--brand-blue), 0 2px 8px rgba(37,99,235,0.15);
			}
			.onb-template-card__header {
				display: flex;
				gap: 0.5rem;
				margin-bottom: 0.5rem;
			}
			.onb-template-card__duration {
				font-size: 0.75rem;
				font-weight: 600;
				padding: 0.125rem 0.5rem;
				border-radius: 4px;
				background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(45,212,218,0.1));
				color: var(--brand-blue);
			}
			.onb-template-card__type {
				font-size: 0.75rem;
				font-weight: 500;
				padding: 0.125rem 0.5rem;
				border-radius: 4px;
				background: #f3f4f6;
				color: var(--brand-text-light);
			}
			.onb-template-card__title {
				font-size: 0.9375rem;
				font-weight: 600;
				color: var(--brand-navy);
				margin: 0 0 0.25rem;
			}
			.onb-template-card__desc {
				font-size: 0.8125rem;
				color: var(--brand-text-light);
				margin: 0;
				line-height: 1.4;
			}

			/* Done step */
			.onb-url-box {
				margin-bottom: 1.5rem;
			}
			.onb-url-row {
				display: flex;
				gap: 0.5rem;
				margin-top: 0.375rem;
			}
			.onb-input--url {
				flex: 1;
				font-family: ui-monospace, monospace;
				font-size: 0.8125rem;
				color: var(--brand-text-light);
				background: #f9fafb;
			}

			/* Mobile */
			@media (max-width: 640px) {
				.onb-wizard { padding: 1rem; margin: 1rem auto; }
				.onb-card { padding: 1.5rem; }
				.onb-form-row { grid-template-columns: 1fr; }
				.onb-actions--split { flex-direction: column; }
				.onb-actions__right { width: 100%; }
				.onb-btn { width: 100%; }
			}
		';
	}
}
