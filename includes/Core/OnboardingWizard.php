<?php
/**
 * Onboarding Wizard
 *
 * Persistent title bar + modal wizard for new hub agents.
 * Uses WordPress Interactivity API with Intro.js for the guided tour.
 *
 * @package FRSUsers
 * @since 3.3.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\UserProfile;

defined( 'ABSPATH' ) || exit;

class OnboardingWizard {

	/**
	 * @var self|null
	 */
	private static $instance = null;

	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Initialize hooks.
	 */
	public function init() {
		// Only on hub / development contexts.
		$context = Roles::get_site_context();
		if ( ! in_array( $context, array( 'hub', 'development' ), true ) ) {
			return;
		}

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue' ) );
		add_action( 'wp_footer', array( $this, 'render_onboarding_markup' ), 5 );
	}

	// ------------------------------------------------------------------
	// Gating helpers
	// ------------------------------------------------------------------

	/**
	 * Does the current user need the onboarding wizard?
	 */
	public static function needs_onboarding( int $user_id = 0 ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}
		if ( ! $user_id ) {
			return false;
		}
		$complete = get_user_meta( $user_id, '_frs_onboarding_complete', true );
		return empty( $complete );
	}

	/**
	 * Does the current user need the guided tour?
	 */
	public static function needs_tour( int $user_id = 0 ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}
		if ( ! $user_id ) {
			return false;
		}
		$tour = get_user_meta( $user_id, '_frs_tour_complete', true );
		return empty( $tour );
	}

	/**
	 * Is the title bar temporarily dismissed?
	 */
	public static function is_dismissed( int $user_id = 0 ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}
		return (bool) get_user_meta( $user_id, 'frs_onboarding_dismissed', true );
	}

	/**
	 * Whether to show any onboarding UI on this page load.
	 */
	private function should_show(): bool {
		if ( ! is_user_logged_in() || is_admin() ) {
			return false;
		}

		// Allow force-open via query param.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['onboarding'] ) && '1' === $_GET['onboarding'] ) {
			return true;
		}

		$user_id = get_current_user_id();

		// Must have a profile-bearing role.
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}
		$profile_roles = array(
			'loan_officer',
			're_agent',
			'escrow_officer',
			'property_manager',
			'dual_license',
			'staff',
			'leadership',
			'assistant',
		);
		if ( ! array_intersect( $profile_roles, (array) $user->roles ) ) {
			return false;
		}

		return self::needs_onboarding( $user_id ) || self::needs_tour( $user_id );
	}

	// ------------------------------------------------------------------
	// Assets
	// ------------------------------------------------------------------

	public function maybe_enqueue() {
		if ( ! $this->should_show() ) {
			return;
		}

		wp_enqueue_script_module(
			'frs-users-onboarding-view',
			FRS_USERS_URL . 'assets/js/onboarding-view.js',
			array( '@wordpress/interactivity' ),
			FRS_USERS_VERSION
		);

		// Intro.js assets — only when tour is needed.
		if ( self::needs_tour() ) {
			wp_enqueue_style(
				'introjs',
				FRS_USERS_URL . 'assets/css/introjs.min.css',
				array(),
				FRS_USERS_VERSION
			);

			wp_enqueue_script(
				'introjs',
				FRS_USERS_URL . 'assets/js/intro.min.js',
				array(),
				FRS_USERS_VERSION,
				true
			);
		}

		add_action( 'wp_head', array( $this, 'output_styles' ), 100 );
	}

	// ------------------------------------------------------------------
	// Rendering
	// ------------------------------------------------------------------

	public function render_onboarding_markup() {
		if ( ! $this->should_show() ) {
			return;
		}

		$user_id = get_current_user_id();
		$profile = null;
		try {
			$profile = new UserProfile( $user_id );
		} catch ( \Exception $e ) {
			return;
		}

		$items     = $profile->get_profile_completion_items();
		$completed = count( array_filter( $items, fn( $i ) => $i['is_completed'] ) );
		$total     = count( $items );
		$step      = (int) get_user_meta( $user_id, '_frs_onboarding_step', true ) ?: 1;
		$dismissed = self::is_dismissed( $user_id );

		$user        = get_userdata( $user_id );
		$roles       = (array) $user->roles;
		$is_lo       = in_array( 'loan_officer', $roles, true ) || in_array( 'dual_license', $roles, true );
		$is_agent    = in_array( 're_agent', $roles, true );
		$headshot_url = $profile->get_headshot_url();

		// Calendar + FUB status.
		$cal_connected = false;
		if ( class_exists( '\FRSUsers\Integrations\FluentBookingSync' ) ) {
			$cal_connected = \FRSUsers\Integrations\FluentBookingSync::is_user_connected( $user_id );
		}
		$fub_key = get_user_meta( $user_id, 'frs_fub_api_key', true );

		// Force-open modal via query param.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$force_open = isset( $_GET['onboarding'] ) && '1' === $_GET['onboarding'];

		// Build Interactivity API context.
		$context = array(
			// Onboarding state.
			'needsOnboarding'  => self::needs_onboarding( $user_id ),
			'needsTour'        => self::needs_tour( $user_id ),
			'dismissed'        => $dismissed,
			'currentStep'      => $step,
			'modalOpen'        => $force_open,
			'isSaving'         => false,
			'completedCount'   => $completed,
			'totalCount'       => $total,
			'message'          => null,
			'restNonce'        => wp_create_nonce( 'wp_rest' ),
			'restUrl'          => rest_url(),
			'profileId'        => $user_id,

			// Profile fields for wizard.
			'phoneNumber'      => $profile->get_phone_number(),
			'jobTitle'         => $profile->get_job_title(),
			'biography'        => $profile->get_biography(),
			'headshotUrl'      => $headshot_url,
			'headshotFile'     => null,

			// Step 2 — professional.
			'isLoanOfficer'    => $is_lo,
			'isAgent'          => $is_agent,
			'nmlsNumber'       => $is_lo ? $profile->get_nmls() : '',
			'arriveUrl'        => $is_lo ? $profile->get_arrive_url() : '',
			'dreLicense'       => $is_agent ? $profile->get_dre_license() : '',
			'serviceAreas'     => $profile->get_service_areas() ?: array(),
			'specialties'      => $is_lo ? ( $profile->get_specialties_lo() ?: array() ) : ( $profile->get_specialties() ?: array() ),
			'newServiceArea'   => '',
			'newSpecialty'     => '',

			// Step 3 — social.
			'facebookUrl'      => $profile->get_facebook_url(),
			'instagramUrl'     => $profile->get_instagram_url(),
			'linkedinUrl'      => $profile->get_linkedin_url(),
			'twitterUrl'       => $profile->get_twitter_url(),
			'youtubeUrl'       => $profile->get_youtube_url(),
			'tiktokUrl'        => $profile->get_tiktok_url(),

			// Step 4 — integrations.
			'calendarConnected' => $cal_connected,
			'calendarLoading'   => false,
			'calendarSteps'     => array(),
			'fubApiKey'         => '',
			'fubConnected'      => ! empty( $fub_key ),

			// Loader state.
			'loaderSteps'       => array(),
			'loaderActive'      => false,

			// Tour.
			'tourSteps'         => $this->get_tour_steps(),
		);

		$context = apply_filters( 'frs_onboarding_config', $context );

		echo '<div id="frs-onboarding-root" data-wp-interactive="frs-users/onboarding" ';
		echo wp_interactivity_data_wp_context( $context );
		echo ' data-wp-init="callbacks.onInit">';

		$this->render_title_bar();
		$this->render_modal();

		echo '</div>';
	}

	/**
	 * Render the persistent title bar.
	 */
	private function render_title_bar() {
		?>
		<div
			class="frs-ob-bar"
			data-wp-bind--hidden="state.barHidden"
			data-lenis-prevent
		>
			<div class="frs-ob-bar__inner">
				<!-- Progress ring -->
				<svg class="frs-ob-bar__ring" viewBox="0 0 36 36" width="32" height="32">
					<circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" stroke-width="3"></circle>
					<circle
						cx="18" cy="18" r="15.5" fill="none"
						stroke="url(#ob-grad)" stroke-width="3"
						stroke-linecap="round"
						stroke-dasharray="97.4"
						data-wp-bind--stroke-dashoffset="state.ringOffset"
						transform="rotate(-90 18 18)"
					></circle>
					<defs><linearGradient id="ob-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#2dd4da"/></linearGradient></defs>
				</svg>
				<span class="frs-ob-bar__text">
					Complete your profile &mdash;
					<strong data-wp-text="state.progressLabel"></strong>
				</span>
				<button
					class="frs-ob-bar__cta"
					data-wp-on--click="actions.openModal"
					type="button"
				>Continue Setup &#9654;</button>
				<button
					class="frs-ob-bar__close"
					data-wp-on--click="actions.dismissBar"
					type="button"
					aria-label="Dismiss"
				>&times;</button>
			</div>
		</div>
		<?php
	}

	/**
	 * Render the modal wizard.
	 */
	private function render_modal() {
		?>
		<div
			class="frs-ob-backdrop"
			data-wp-bind--hidden="!context.modalOpen"
			data-wp-on--click="actions.backdropClick"
			data-lenis-prevent
		>
			<div class="frs-ob-modal" data-wp-on--click="actions.modalClick">
				<!-- Header -->
				<div class="frs-ob-modal__header">
					<h2 class="frs-ob-modal__title">Set up your profile</h2>
					<button class="frs-ob-modal__close" data-wp-on--click="actions.closeModal" type="button" aria-label="Close">&times;</button>
				</div>

				<!-- Step indicator -->
				<div class="frs-ob-steps">
					<?php for ( $i = 1; $i <= 4; $i++ ) : ?>
						<div
							class="frs-ob-steps__dot"
							data-wp-class--frs-ob-steps__dot--active="state.isStep<?php echo $i; ?>"
							data-wp-class--frs-ob-steps__dot--done="state.isStepDone<?php echo $i; ?>"
						>
							<span class="frs-ob-steps__num"><?php echo $i; ?></span>
						</div>
						<?php if ( $i < 4 ) : ?>
							<div class="frs-ob-steps__line" data-wp-class--frs-ob-steps__line--done="state.isStepDone<?php echo $i; ?>"></div>
						<?php endif; ?>
					<?php endfor; ?>
				</div>

				<!-- Step panels -->
				<div class="frs-ob-body">
					<?php
					$this->render_step1();
					$this->render_step2();
					$this->render_step3();
					$this->render_step4();
					$this->render_loader_panel();
					?>
				</div>

				<!-- Footer -->
				<div class="frs-ob-footer">
					<span class="frs-ob-footer__counter" data-wp-text="state.stepLabel"></span>
					<div class="frs-ob-footer__actions">
						<button
							class="frs-ob-btn frs-ob-btn--ghost"
							data-wp-bind--hidden="state.isStep1"
							data-wp-on--click="actions.prevStep"
							data-wp-bind--disabled="context.isSaving"
							type="button"
						>Back</button>
						<button
							class="frs-ob-btn frs-ob-btn--ghost"
							data-wp-on--click="actions.skipStep"
							data-wp-bind--disabled="context.isSaving"
							type="button"
						>Skip</button>
						<button
							class="frs-ob-btn frs-ob-btn--primary"
							data-wp-on--click="actions.nextStep"
							data-wp-bind--disabled="context.isSaving"
							data-wp-text="state.nextButtonLabel"
							type="button"
						>Next</button>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	// ------------------------------------------------------------------
	// Individual step panels
	// ------------------------------------------------------------------

	private function render_step1() {
		?>
		<div class="frs-ob-step" data-wp-bind--hidden="!state.isStep1">
			<h3 class="frs-ob-step__title">Profile Essentials</h3>
			<p class="frs-ob-step__desc">Let's start with the basics that show up on your public profile.</p>

			<!-- Headshot upload -->
			<div class="frs-ob-upload" data-wp-on--click="actions.triggerUpload" data-wp-on--dragover="actions.dragOver" data-wp-on--dragleave="actions.dragLeave" data-wp-on--drop="actions.dropFile">
				<div data-wp-bind--hidden="context.headshotUrl" class="frs-ob-upload__placeholder">
					<?php echo $this->get_icon( 'camera', 32 ); ?>
					<span>Drag &amp; drop or click to upload</span>
				</div>
				<img data-wp-bind--hidden="!context.headshotUrl" data-wp-bind--src="context.headshotUrl" class="frs-ob-upload__preview" alt="Headshot preview" />
				<input type="file" accept="image/*" class="frs-ob-upload__input" data-wp-on--change="actions.fileSelected" />
			</div>

			<!-- Phone -->
			<div class="frs-ob-field">
				<div class="frs-ob-field__wrapper" data-wp-class--has-value="context.phoneNumber">
					<input type="tel" data-field="phoneNumber" data-wp-bind--value="context.phoneNumber" data-wp-on--input="actions.updateField" class="frs-ob-field__input" placeholder="Phone number" />
					<span class="frs-ob-field__label">Phone Number</span>
				</div>
			</div>

			<!-- Job title -->
			<div class="frs-ob-field">
				<div class="frs-ob-field__wrapper" data-wp-class--has-value="context.jobTitle">
					<input type="text" data-field="jobTitle" data-wp-bind--value="context.jobTitle" data-wp-on--input="actions.updateField" class="frs-ob-field__input" placeholder="Job title" />
					<span class="frs-ob-field__label">Job Title</span>
				</div>
			</div>

			<!-- Biography -->
			<div class="frs-ob-field">
				<div class="frs-ob-field__wrapper frs-ob-field__wrapper--textarea" data-wp-class--has-value="context.biography">
					<textarea data-field="biography" data-wp-bind--value="context.biography" data-wp-on--input="actions.updateField" class="frs-ob-field__input frs-ob-field__input--textarea" rows="3" placeholder="Biography"></textarea>
					<span class="frs-ob-field__label">Biography</span>
				</div>
				<span class="frs-ob-field__hint" data-wp-text="state.bioCharCount"></span>
			</div>
		</div>
		<?php
	}

	private function render_step2() {
		?>
		<div class="frs-ob-step" data-wp-bind--hidden="!state.isStep2">
			<h3 class="frs-ob-step__title">Professional Details</h3>
			<p class="frs-ob-step__desc">Help clients find and verify your credentials.</p>

			<!-- NMLS — loan officers only -->
			<div data-wp-bind--hidden="!context.isLoanOfficer">
				<div class="frs-ob-field">
					<div class="frs-ob-field__wrapper" data-wp-class--has-value="context.nmlsNumber">
						<input type="text" data-field="nmlsNumber" data-wp-bind--value="context.nmlsNumber" data-wp-on--input="actions.updateField" class="frs-ob-field__input" placeholder="NMLS #" />
						<span class="frs-ob-field__label">NMLS Number</span>
					</div>
				</div>
				<div class="frs-ob-field">
					<div class="frs-ob-field__wrapper" data-wp-class--has-value="context.arriveUrl">
						<input type="url" data-field="arriveUrl" data-wp-bind--value="context.arriveUrl" data-wp-on--input="actions.updateField" class="frs-ob-field__input" placeholder="https://..." />
						<span class="frs-ob-field__label">Loan Application URL</span>
					</div>
				</div>
			</div>

			<!-- DRE — agents only -->
			<div data-wp-bind--hidden="!context.isAgent" class="frs-ob-field">
				<div class="frs-ob-field__wrapper" data-wp-class--has-value="context.dreLicense">
					<input type="text" data-field="dreLicense" data-wp-bind--value="context.dreLicense" data-wp-on--input="actions.updateField" class="frs-ob-field__input" placeholder="DRE #" />
					<span class="frs-ob-field__label">DRE License Number</span>
				</div>
			</div>

			<!-- Service areas — pill input -->
			<div class="frs-ob-pills">
				<label class="frs-ob-pills__label">Service Areas</label>
				<div class="frs-ob-pills__list" data-wp-bind--hidden="!state.hasServiceAreas">
					<template data-wp-each="context.serviceAreas">
						<span class="frs-ob-pill">
							<span data-wp-text="context.item"></span>
							<button type="button" class="frs-ob-pill__x" data-wp-on--click="actions.removeServiceArea">&times;</button>
						</span>
					</template>
				</div>
				<div class="frs-ob-pills__add">
					<input type="text" data-field="newServiceArea" data-wp-bind--value="context.newServiceArea" data-wp-on--input="actions.updateField" data-wp-on--keydown="actions.addServiceAreaOnEnter" class="frs-ob-pills__input" placeholder="Add area..." />
					<button type="button" class="frs-ob-btn frs-ob-btn--small" data-wp-on--click="actions.addServiceArea">Add</button>
				</div>
			</div>

			<!-- Specialties — pill input -->
			<div class="frs-ob-pills">
				<label class="frs-ob-pills__label">Specialties</label>
				<div class="frs-ob-pills__list" data-wp-bind--hidden="!state.hasSpecialties">
					<template data-wp-each="context.specialties">
						<span class="frs-ob-pill">
							<span data-wp-text="context.item"></span>
							<button type="button" class="frs-ob-pill__x" data-wp-on--click="actions.removeSpecialty">&times;</button>
						</span>
					</template>
				</div>
				<div class="frs-ob-pills__add">
					<input type="text" data-field="newSpecialty" data-wp-bind--value="context.newSpecialty" data-wp-on--input="actions.updateField" data-wp-on--keydown="actions.addSpecialtyOnEnter" class="frs-ob-pills__input" placeholder="Add specialty..." />
					<button type="button" class="frs-ob-btn frs-ob-btn--small" data-wp-on--click="actions.addSpecialty">Add</button>
				</div>
			</div>
		</div>
		<?php
	}

	private function render_step3() {
		$socials = array(
			array( 'field' => 'linkedinUrl', 'label' => 'LinkedIn', 'icon' => 'linkedin', 'placeholder' => 'https://linkedin.com/in/...' ),
			array( 'field' => 'facebookUrl', 'label' => 'Facebook', 'icon' => 'facebook', 'placeholder' => 'https://facebook.com/...' ),
			array( 'field' => 'instagramUrl', 'label' => 'Instagram', 'icon' => 'instagram', 'placeholder' => 'https://instagram.com/...' ),
			array( 'field' => 'twitterUrl', 'label' => 'X / Twitter', 'icon' => 'twitter', 'placeholder' => 'https://x.com/...' ),
			array( 'field' => 'youtubeUrl', 'label' => 'YouTube', 'icon' => 'youtube', 'placeholder' => 'https://youtube.com/...' ),
			array( 'field' => 'tiktokUrl', 'label' => 'TikTok', 'icon' => 'tiktok', 'placeholder' => 'https://tiktok.com/@...' ),
		);
		?>
		<div class="frs-ob-step" data-wp-bind--hidden="!state.isStep3">
			<h3 class="frs-ob-step__title">Social &amp; Web Presence</h3>
			<p class="frs-ob-step__desc">Add at least one link so clients can find you online.</p>

			<div class="frs-ob-socials">
				<?php foreach ( $socials as $s ) : ?>
					<div class="frs-ob-field">
						<div class="frs-ob-field__wrapper" data-wp-class--has-value="context.<?php echo esc_attr( $s['field'] ); ?>">
							<input
								type="url"
								data-field="<?php echo esc_attr( $s['field'] ); ?>"
								data-wp-bind--value="context.<?php echo esc_attr( $s['field'] ); ?>"
								data-wp-on--input="actions.updateField"
								class="frs-ob-field__input"
								placeholder="<?php echo esc_attr( $s['placeholder'] ); ?>"
							/>
							<span class="frs-ob-field__label"><?php echo esc_html( $s['label'] ); ?></span>
						</div>
					</div>
				<?php endforeach; ?>
			</div>

			<div class="frs-ob-social-indicator">
				<span data-wp-class--frs-ob-social-indicator--ok="state.hasSocialLink">
					<span data-wp-bind--hidden="state.hasSocialLink"><?php echo $this->get_icon( 'alert-circle', 16 ); ?> Add at least one link</span>
					<span data-wp-bind--hidden="!state.hasSocialLink"><?php echo $this->get_icon( 'check-circle', 16 ); ?> Looking good!</span>
				</span>
			</div>
		</div>
		<?php
	}

	private function render_step4() {
		?>
		<div class="frs-ob-step" data-wp-bind--hidden="!state.isStep4">
			<h3 class="frs-ob-step__title">Integrations</h3>
			<p class="frs-ob-step__desc">Connect your tools — all optional, you can set these up later in Settings.</p>

			<div class="frs-ob-integrations">
				<!-- Calendar card -->
				<div class="frs-ob-int-card">
					<div class="frs-ob-int-card__header">
						<?php echo $this->get_icon( 'calendar', 20 ); ?>
						<span>Outlook Calendar</span>
						<span class="frs-ob-badge frs-ob-badge--success" data-wp-bind--hidden="!context.calendarConnected">Connected</span>
					</div>
					<p class="frs-ob-int-card__desc">Sync your availability with your Microsoft calendar.</p>
					<button
						class="frs-ob-btn frs-ob-btn--primary frs-ob-btn--sm"
						data-wp-bind--hidden="context.calendarConnected"
						data-wp-bind--disabled="context.calendarLoading"
						data-wp-on--click="actions.connectCalendar"
						type="button"
					>
						<span data-wp-text="context.calendarLoading ? 'Connecting...' : 'Connect Calendar'"></span>
					</button>
				</div>

				<!-- FUB card -->
				<div class="frs-ob-int-card">
					<div class="frs-ob-int-card__header">
						<?php echo $this->get_icon( 'zap', 20 ); ?>
						<span>Follow Up Boss</span>
						<span class="frs-ob-badge frs-ob-badge--success" data-wp-bind--hidden="!context.fubConnected">Connected</span>
					</div>
					<p class="frs-ob-int-card__desc">Automatically sync your leads with Follow Up Boss CRM.</p>
					<div data-wp-bind--hidden="context.fubConnected" class="frs-ob-int-card__form">
						<input
							type="password"
							data-field="fubApiKey"
							data-wp-bind--value="context.fubApiKey"
							data-wp-on--input="actions.updateField"
							class="frs-ob-field__input"
							placeholder="FUB API Key"
						/>
						<button
							class="frs-ob-btn frs-ob-btn--primary frs-ob-btn--sm"
							data-wp-on--click="actions.connectFub"
							data-wp-bind--disabled="!context.fubApiKey"
							type="button"
						>Connect</button>
					</div>
				</div>

				<!-- Telegram card -->
				<div class="frs-ob-int-card">
					<div class="frs-ob-int-card__header">
						<?php echo $this->get_icon( 'send', 20 ); ?>
						<span>Telegram</span>
					</div>
					<p class="frs-ob-int-card__desc">Receive instant lead notifications on Telegram.</p>
					<a href="<?php echo esc_url( home_url( '/settings/' ) ); ?>" class="frs-ob-btn frs-ob-btn--outline frs-ob-btn--sm" target="_blank" rel="noopener">
						Connect in Settings
					</a>
				</div>
			</div>

			<!-- Aceternity-style loader -->
			<div class="frs-ob-loader" data-wp-bind--hidden="!context.loaderActive">
				<template data-wp-each="context.loaderSteps">
					<div class="frs-ob-loader__row" data-wp-class--frs-ob-loader__row--done="context.item.done" data-wp-class--frs-ob-loader__row--active="context.item.active">
						<span class="frs-ob-loader__icon">
							<svg data-wp-bind--hidden="!context.item.done" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#22c55e"/><path d="M5 8l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
							<span data-wp-bind--hidden="context.item.done || !context.item.active" class="frs-ob-loader__pulse"></span>
							<span data-wp-bind--hidden="context.item.done || context.item.active" class="frs-ob-loader__pending"></span>
						</span>
						<span data-wp-text="context.item.label"></span>
					</div>
				</template>
			</div>
		</div>
		<?php
	}

	private function render_loader_panel() {
		// This is the success state shown briefly after wizard completion.
		?>
		<div class="frs-ob-success" data-wp-bind--hidden="!state.showSuccess">
			<div class="frs-ob-success__icon">
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#22c55e"/><path d="M14 24l7 7 13-13" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</div>
			<h3>You're all set!</h3>
			<p>Your profile is ready. Let's take a quick tour of the hub.</p>
		</div>
		<?php
	}

	// ------------------------------------------------------------------
	// REST API
	// ------------------------------------------------------------------

	public function register_routes() {
		register_rest_route(
			'frs-users/v1',
			'/onboarding/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_status' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/dismiss',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_dismiss' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/complete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_complete' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/skip',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_skip' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/step',
			array(
				'methods'             => 'PUT',
				'callback'            => array( $this, 'rest_update_step' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
				'args'                => array(
					'step' => array(
						'type'              => 'integer',
						'required'          => true,
						'minimum'           => 1,
						'maximum'           => 4,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/upload-headshot',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_upload_headshot' ),
				'permission_callback' => function () {
					return is_user_logged_in() && current_user_can( 'upload_files' );
				},
			)
		);

		register_rest_route(
			'frs-users/v1',
			'/onboarding/tour-complete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_tour_complete' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);
	}

	public function rest_status( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		$items   = array();
		try {
			$profile = new UserProfile( $user_id );
			$items   = $profile->get_profile_completion_items();
		} catch ( \Exception $e ) {
			// No profile yet.
		}

		$completed = count( array_filter( $items, fn( $i ) => $i['is_completed'] ) );

		return new \WP_REST_Response( array(
			'needs_onboarding' => self::needs_onboarding( $user_id ),
			'needs_tour'       => self::needs_tour( $user_id ),
			'dismissed'        => self::is_dismissed( $user_id ),
			'step'             => (int) get_user_meta( $user_id, '_frs_onboarding_step', true ) ?: 1,
			'completed'        => $completed,
			'total'            => count( $items ),
			'items'            => $items,
		) );
	}

	public function rest_dismiss( \WP_REST_Request $request ): \WP_REST_Response {
		update_user_meta( get_current_user_id(), 'frs_onboarding_dismissed', true );
		return new \WP_REST_Response( array( 'success' => true ) );
	}

	public function rest_complete( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		update_user_meta( $user_id, '_frs_onboarding_complete', time() );
		delete_user_meta( $user_id, 'frs_onboarding_dismissed' );
		return new \WP_REST_Response( array( 'success' => true ) );
	}

	public function rest_skip( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		update_user_meta( $user_id, '_frs_onboarding_complete', 'skipped' );
		delete_user_meta( $user_id, 'frs_onboarding_dismissed' );
		return new \WP_REST_Response( array( 'success' => true ) );
	}

	public function rest_update_step( \WP_REST_Request $request ): \WP_REST_Response {
		$step = $request->get_param( 'step' );
		update_user_meta( get_current_user_id(), '_frs_onboarding_step', $step );
		return new \WP_REST_Response( array( 'success' => true, 'step' => $step ) );
	}

	public function rest_upload_headshot( \WP_REST_Request $request ): \WP_REST_Response {
		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new \WP_REST_Response( array( 'success' => false, 'message' => 'No file provided.' ), 400 );
		}

		$file = $files['file'];

		// Validate mime type.
		$allowed = array( 'image/jpeg', 'image/png', 'image/webp', 'image/gif' );
		if ( ! in_array( $file['type'], $allowed, true ) ) {
			return new \WP_REST_Response( array( 'success' => false, 'message' => 'Invalid file type.' ), 400 );
		}

		// Max 5MB.
		if ( $file['size'] > 5 * 1024 * 1024 ) {
			return new \WP_REST_Response( array( 'success' => false, 'message' => 'File too large (max 5MB).' ), 400 );
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_upload( 'file', 0 );
		if ( is_wp_error( $attachment_id ) ) {
			return new \WP_REST_Response( array( 'success' => false, 'message' => $attachment_id->get_error_message() ), 500 );
		}

		$user_id = get_current_user_id();
		update_user_meta( $user_id, 'frs_headshot_id', $attachment_id );

		// Simple Local Avatars integration.
		if ( function_exists( 'simple_local_avatar' ) || class_exists( 'Simple_Local_Avatars' ) ) {
			update_user_meta( $user_id, 'simple_local_avatar', array(
				'media_id' => $attachment_id,
				'full'     => wp_get_attachment_url( $attachment_id ),
			) );
		}

		return new \WP_REST_Response( array(
			'success'       => true,
			'attachment_id' => $attachment_id,
			'url'           => wp_get_attachment_url( $attachment_id ),
		) );
	}

	public function rest_tour_complete( \WP_REST_Request $request ): \WP_REST_Response {
		$user_id = get_current_user_id();
		update_user_meta( $user_id, '_frs_tour_complete', time() );
		return new \WP_REST_Response( array( 'success' => true ) );
	}

	// ------------------------------------------------------------------
	// Tour configuration
	// ------------------------------------------------------------------

	private function get_tour_steps(): array {
		$steps = array(
			array(
				'element'  => '.frs-profile-link, a[href*="/lo/"], a[href*="/agent/"]',
				'title'    => 'Your Profile',
				'intro'    => 'Your public profile lives here. Keep it up to date so clients can find you.',
				'position' => 'bottom',
			),
			array(
				'element'  => '.frs-directory-link, a[href*="/directory"]',
				'title'    => 'Directory',
				'intro'    => 'Browse and connect with other agents and loan officers in the network.',
				'position' => 'bottom',
			),
			array(
				'element'  => '.frs-settings-link, a[href*="/settings"]',
				'title'    => 'Settings',
				'intro'    => 'Manage your account, integrations, and notification preferences anytime.',
				'position' => 'bottom',
			),
			array(
				'element'  => '.frs-booking-link, a[href*="/booking"], a[href*="/calendar"]',
				'title'    => 'Bookings',
				'intro'    => 'Your availability and meeting bookings are managed here.',
				'position' => 'bottom',
			),
		);

		return apply_filters( 'frs_onboarding_tour_steps', $steps );
	}

	// ------------------------------------------------------------------
	// Inline CSS
	// ------------------------------------------------------------------

	public function output_styles() {
		echo '<style id="frs-onboarding-styles">' . $this->get_styles() . '</style>';
	}

	private function get_styles(): string {
		return '
/* ========================================
   Onboarding — Title Bar
   ======================================== */
.frs-ob-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99999;
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	background: rgba(255,255,255,0.88);
	border-bottom: 2px solid;
	border-image: linear-gradient(to right, #2563eb, #2dd4da) 1;
	box-shadow: 0 1px 8px rgba(0,0,0,0.06);
}
.frs-ob-bar[hidden] { display: none !important; }
.frs-ob-bar__inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 16px;
	height: 48px;
}
.frs-ob-bar__ring { flex-shrink: 0; }
.frs-ob-bar__ring circle { transition: stroke-dashoffset 0.6s ease; }
.frs-ob-bar__text {
	flex: 1;
	font-size: 14px;
	color: #374151;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.frs-ob-bar__cta {
	flex-shrink: 0;
	background: linear-gradient(135deg, #2563eb 0%, #2dd4da 100%);
	color: white;
	border: none;
	border-radius: 5px;
	padding: 6px 16px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: box-shadow 0.2s, transform 0.1s;
}
.frs-ob-bar__cta:hover {
	box-shadow: 0 4px 12px rgba(37,99,235,0.35);
	transform: translateY(-1px);
}
.frs-ob-bar__close {
	flex-shrink: 0;
	background: none;
	border: none;
	font-size: 20px;
	color: #9ca3af;
	cursor: pointer;
	padding: 4px 8px;
	line-height: 1;
}
.frs-ob-bar__close:hover { color: #374151; }

/* Push page content below bar */
body:has(.frs-ob-bar:not([hidden])) {
	padding-top: 48px !important;
}

@media (max-width: 600px) {
	.frs-ob-bar__text { display: none; }
}

/* ========================================
   Onboarding — Modal
   ======================================== */
.frs-ob-backdrop {
	position: fixed;
	inset: 0;
	z-index: 100000;
	background: rgba(0,0,0,0.4);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
}
.frs-ob-backdrop[hidden] { display: none !important; }
.frs-ob-modal {
	background: white;
	border-radius: 5px;
	box-shadow: 0 20px 60px rgba(0,0,0,0.15);
	width: 100%;
	max-width: 640px;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	animation: frsObScaleIn 0.25s ease-out;
	overflow: hidden;
}
@keyframes frsObScaleIn {
	from { opacity: 0; transform: scale(0.95) translateY(10px); }
	to { opacity: 1; transform: scale(1) translateY(0); }
}
.frs-ob-modal__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	border-bottom: 1px solid #e5e7eb;
}
.frs-ob-modal__title {
	font-size: 18px;
	font-weight: 700;
	color: #111827;
	margin: 0;
}
.frs-ob-modal__close {
	background: none;
	border: none;
	font-size: 22px;
	color: #9ca3af;
	cursor: pointer;
	padding: 4px;
	line-height: 1;
}
.frs-ob-modal__close:hover { color: #374151; }

/* ========================================
   Step indicator
   ======================================== */
.frs-ob-steps {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px 24px 0;
	gap: 0;
}
.frs-ob-steps__dot {
	width: 28px;
	height: 28px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 600;
	color: #9ca3af;
	background: #f3f4f6;
	border: 2px solid #e5e7eb;
	transition: all 0.3s ease;
	flex-shrink: 0;
}
.frs-ob-steps__dot--active {
	background: linear-gradient(135deg, #2563eb, #2dd4da);
	color: white;
	border-color: transparent;
	box-shadow: 0 2px 8px rgba(37,99,235,0.3);
}
.frs-ob-steps__dot--done {
	background: #22c55e;
	color: white;
	border-color: transparent;
}
.frs-ob-steps__line {
	flex: 1;
	height: 2px;
	background: #e5e7eb;
	max-width: 60px;
	transition: background 0.3s ease;
}
.frs-ob-steps__line--done {
	background: linear-gradient(to right, #22c55e, #2dd4da);
}

/* ========================================
   Step body
   ======================================== */
.frs-ob-body {
	flex: 1;
	overflow-y: auto;
	padding: 20px 24px;
}
.frs-ob-step[hidden] { display: none !important; }
.frs-ob-step__title {
	font-size: 16px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 4px;
}
.frs-ob-step__desc {
	font-size: 14px;
	color: #6b7280;
	margin: 0 0 16px;
}

/* ========================================
   Floating label fields
   ======================================== */
.frs-ob-field { margin-bottom: 12px; }
.frs-ob-field__wrapper {
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 5px;
	background: white;
	padding: 0 12px;
	height: 42px;
	border: 2px solid #d1d5db;
	transition: all 0.2s;
}
.frs-ob-field__wrapper--textarea {
	height: auto;
	padding: 10px 12px;
	align-items: flex-start;
}
.frs-ob-field__wrapper.has-value,
.frs-ob-field__wrapper:focus-within {
	border-color: transparent;
	background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #2563eb, #2dd4da) border-box;
}
.frs-ob-field__label {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	font-size: 14px;
	color: #9ca3af;
	pointer-events: none;
	transition: all 0.2s;
	background: white;
	padding: 0 4px;
}
.frs-ob-field__wrapper--textarea .frs-ob-field__label {
	top: 12px;
	transform: none;
}
.frs-ob-field__wrapper.has-value .frs-ob-field__label,
.frs-ob-field__wrapper:focus-within .frs-ob-field__label {
	top: 0;
	font-size: 11px;
	color: #2563eb;
	font-weight: 500;
	transform: translateY(-50%);
}
.frs-ob-field__input {
	width: 100%;
	border: none !important;
	background: transparent !important;
	font-size: 14px;
	color: #171A1F;
	outline: none !important;
	padding: 0;
	height: 100%;
	box-shadow: none !important;
}
.frs-ob-field__input--textarea {
	height: auto;
	resize: vertical;
	min-height: 60px;
	font-family: inherit;
}
.frs-ob-field__input::placeholder { color: transparent !important; }
.frs-ob-field__hint {
	font-size: 12px;
	color: #9ca3af;
	margin-top: 2px;
	display: block;
}

/* ========================================
   Headshot upload zone
   ======================================== */
.frs-ob-upload {
	border: 2px dashed #d1d5db;
	border-radius: 5px;
	padding: 20px;
	text-align: center;
	cursor: pointer;
	transition: all 0.2s;
	margin-bottom: 16px;
	position: relative;
	min-height: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.frs-ob-upload:hover,
.frs-ob-upload.dragover {
	border-color: #2563eb;
	background: rgba(37,99,235,0.04);
}
.frs-ob-upload__placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	color: #9ca3af;
	font-size: 14px;
}
.frs-ob-upload__placeholder svg { color: #d1d5db; }
.frs-ob-upload__preview {
	max-width: 120px;
	max-height: 120px;
	border-radius: 5px;
	object-fit: cover;
}
.frs-ob-upload__preview[hidden] { display: none !important; }
.frs-ob-upload__input {
	position: absolute;
	inset: 0;
	opacity: 0;
	cursor: pointer;
}

/* ========================================
   Pill tags
   ======================================== */
.frs-ob-pills { margin-bottom: 16px; }
.frs-ob-pills__label {
	display: block;
	font-size: 13px;
	font-weight: 600;
	color: #374151;
	margin-bottom: 6px;
}
.frs-ob-pills__list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 8px;
}
.frs-ob-pills__list[hidden] { display: none !important; }
.frs-ob-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(45,212,218,0.08));
	border: 1px solid rgba(37,99,235,0.2);
	color: #1e40af;
	border-radius: 5px;
	padding: 3px 10px;
	font-size: 13px;
	font-weight: 500;
}
.frs-ob-pill__x {
	background: none;
	border: none;
	color: #6b7280;
	cursor: pointer;
	padding: 0;
	font-size: 14px;
	line-height: 1;
}
.frs-ob-pill__x:hover { color: #ef4444; }
.frs-ob-pills__add {
	display: flex;
	gap: 6px;
}
.frs-ob-pills__input {
	flex: 1;
	height: 34px;
	border: 1px solid #d1d5db;
	border-radius: 5px;
	padding: 0 10px;
	font-size: 13px;
	outline: none;
}
.frs-ob-pills__input:focus {
	border-color: #2563eb;
	box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
}

/* ========================================
   Socials
   ======================================== */
.frs-ob-socials { display: grid; gap: 10px; }
.frs-ob-social-indicator {
	font-size: 13px;
	color: #6b7280;
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 8px;
}
.frs-ob-social-indicator span { display: flex; align-items: center; gap: 4px; }
.frs-ob-social-indicator--ok { color: #22c55e; }

/* ========================================
   Integration cards
   ======================================== */
.frs-ob-integrations { display: grid; gap: 12px; }
.frs-ob-int-card {
	border: 1px solid #e5e7eb;
	border-radius: 5px;
	padding: 16px;
	transition: box-shadow 0.2s, transform 0.15s;
}
.frs-ob-int-card:hover {
	box-shadow: 0 4px 12px rgba(0,0,0,0.06);
	transform: translateY(-1px);
}
.frs-ob-int-card__header {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
	font-size: 14px;
	color: #111827;
	margin-bottom: 4px;
}
.frs-ob-int-card__header svg { color: #6b7280; flex-shrink: 0; }
.frs-ob-int-card__desc {
	font-size: 13px;
	color: #6b7280;
	margin: 0 0 10px;
}
.frs-ob-int-card__form {
	display: flex;
	gap: 8px;
	align-items: center;
}
.frs-ob-int-card__form .frs-ob-field__input {
	height: 34px;
	border: 1px solid #d1d5db !important;
	border-radius: 5px !important;
	padding: 0 10px !important;
	font-size: 13px;
}

/* ========================================
   Badges
   ======================================== */
.frs-ob-badge {
	display: inline-flex;
	align-items: center;
	font-size: 11px;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 5px;
}
.frs-ob-badge--success {
	background: #dcfce7;
	color: #15803d;
}
.frs-ob-badge[hidden] { display: none !important; }

/* ========================================
   Aceternity-style loader
   ======================================== */
.frs-ob-loader { padding: 16px 0; }
.frs-ob-loader[hidden] { display: none !important; }
.frs-ob-loader__row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 0;
	font-size: 14px;
	color: #9ca3af;
	transition: color 0.3s;
}
.frs-ob-loader__row--done { color: #374151; }
.frs-ob-loader__row--active { color: #2563eb; font-weight: 500; }
.frs-ob-loader__icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}
.frs-ob-loader__pulse {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #2563eb;
	animation: frsObPulse 1.2s ease infinite;
}
@keyframes frsObPulse {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.5; transform: scale(0.8); }
}
.frs-ob-loader__pending {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #d1d5db;
}
.frs-ob-loader__row--done svg {
	animation: frsObCheckIn 0.3s ease-out;
}
@keyframes frsObCheckIn {
	from { opacity: 0; transform: scale(0.5); }
	to { opacity: 1; transform: scale(1); }
}

/* ========================================
   Success state
   ======================================== */
.frs-ob-success {
	text-align: center;
	padding: 32px 16px;
}
.frs-ob-success[hidden] { display: none !important; }
.frs-ob-success__icon {
	animation: frsObBounce 0.5s ease;
	margin-bottom: 16px;
}
@keyframes frsObBounce {
	0% { transform: scale(0); }
	60% { transform: scale(1.15); }
	100% { transform: scale(1); }
}
.frs-ob-success h3 {
	font-size: 20px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 4px;
}
.frs-ob-success p {
	font-size: 14px;
	color: #6b7280;
	margin: 0;
}

/* ========================================
   Footer
   ======================================== */
.frs-ob-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	border-top: 1px solid #e5e7eb;
}
.frs-ob-footer__counter {
	font-size: 13px;
	color: #9ca3af;
	font-weight: 500;
}
.frs-ob-footer__actions {
	display: flex;
	gap: 8px;
}

/* ========================================
   Buttons
   ======================================== */
.frs-ob-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	font-size: 14px;
	font-weight: 500;
	border-radius: 5px;
	padding: 8px 16px;
	cursor: pointer;
	transition: all 0.15s;
	border: none;
	text-decoration: none;
	white-space: nowrap;
}
.frs-ob-btn:disabled {
	opacity: 0.5;
	pointer-events: none;
}
.frs-ob-btn--primary {
	background: linear-gradient(135deg, #2563eb 0%, #2dd4da 100%);
	color: white;
}
.frs-ob-btn--primary:hover {
	box-shadow: 0 4px 12px rgba(37,99,235,0.3);
	transform: translateY(-1px);
}
.frs-ob-btn--ghost {
	background: transparent;
	color: #6b7280;
	border: 1px solid #e5e7eb;
}
.frs-ob-btn--ghost:hover {
	background: #f9fafb;
	color: #374151;
}
.frs-ob-btn--outline {
	background: white;
	color: #374151;
	border: 1px solid #d1d5db;
}
.frs-ob-btn--outline:hover {
	background: #f3f4f6;
}
.frs-ob-btn--sm { font-size: 13px; padding: 6px 12px; }
.frs-ob-btn--small { font-size: 12px; padding: 4px 10px; }

/* ========================================
   Responsive
   ======================================== */
@media (max-width: 640px) {
	.frs-ob-modal {
		max-height: 100vh;
		border-radius: 0;
		height: 100%;
	}
	.frs-ob-body { padding: 16px; }
	.frs-ob-modal__header { padding: 12px 16px; }
	.frs-ob-footer { padding: 10px 16px; }
	.frs-ob-int-card__form { flex-direction: column; }
}
		';
	}

	// ------------------------------------------------------------------
	// SVG helper (reuses same pattern as SettingsPage)
	// ------------------------------------------------------------------

	private function get_icon( $name, $size = 20 ) {
		if ( class_exists( 'Lucide_Icons' ) ) {
			return \Lucide_Icons::render( $name, $size );
		}

		$icons = array(
			'camera'       => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
			'check-circle' => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
			'alert-circle' => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
			'calendar'     => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
			'zap'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
			'send'         => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
		);

		if ( isset( $icons[ $name ] ) ) {
			return sprintf( $icons[ $name ], $size, $size );
		}

		return '';
	}
}
