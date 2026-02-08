<?php
/**
 * Settings Page - Interactivity API Version
 *
 * Renders frontend user settings page using PHP templates with WordPress Interactivity API.
 * Moved from the Workspaces plugin to live alongside profile management.
 *
 * @package FRSUsers
 * @since 2.2.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;

defined( 'ABSPATH' ) || exit;

/**
 * Settings Page Class
 */
class SettingsPage {

	/**
	 * Singleton instance
	 *
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance
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
	 * Initialize the settings page.
	 *
	 * @return void
	 */
	public function init() {
		add_shortcode( 'frs_user_settings', array( $this, 'render_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueue assets
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( ! $this->is_settings_page() ) {
			return;
		}

		wp_enqueue_script_module(
			'frs-users-settings-view',
			FRS_USERS_URL . 'assets/js/settings-view.js',
			array( '@wordpress/interactivity' ),
			FRS_USERS_VERSION
		);

		add_action( 'wp_head', array( $this, 'output_styles' ), 100 );
	}

	/**
	 * Output styles directly in head
	 *
	 * @return void
	 */
	public function output_styles() {
		echo '<style id="frs-settings-styles">' . $this->get_component_styles() . '</style>';
	}

	/**
	 * Get component styles (Hub21 brand)
	 *
	 * @return string
	 */
	private function get_component_styles() {
		return '
			.settings-page {
				--brand-dark-navy: #171A1F;
				--brand-medium-navy: #263042;
				--brand-slate: #444B57;
				--brand-steel-blue: #405C7A;
				--brand-electric-blue: #2563EB;
				--brand-cyan: #2DD4DA;
				--brand-light-blue: #7DB3E8;
				--brand-powder-blue: #B6C7D9;
				--brand-pale-blue: #C3D9F1;
				--brand-light-gray: #DADEE3;
				--brand-off-white: #F8F7F9;
				--brand-page-background: #FAFAFA;
				--brand-pure-white: #FFFFFF;
				--gradient-hero: linear-gradient(135deg, #2563EB 0%, #2DD4DA 100%);
				--muted: hsl(270 22% 97%);
				--muted-foreground: hsl(225 6% 33%);
				--primary: hsl(217 91% 60%);
				--input-border: #d1d5db;
				--border: hsl(214 32% 91%);
				--ring: hsl(217 91% 60%);
			}
			.settings-page {
				max-width: 56rem;
				margin: 0 auto;
				padding: 1.5rem;
				background: transparent;
			}
			.settings-page [hidden] { display: none !important; }
			.settings-tabs-list {
				display: inline-flex !important;
				height: 2.25rem !important;
				align-items: center !important;
				justify-content: center !important;
				border-radius: 0.5rem !important;
				background: var(--brand-light-gray) !important;
				padding: 0.25rem !important;
				color: var(--brand-slate) !important;
				width: 100% !important;
				margin-bottom: 1.5rem !important;
			}
			.settings-tab-trigger {
				display: inline-flex !important;
				align-items: center !important;
				justify-content: center !important;
				white-space: nowrap !important;
				border-radius: 0.375rem !important;
				padding: 0.25rem 0.75rem !important;
				font-size: 0.875rem !important;
				font-weight: 500 !important;
				background: transparent;
				border: none !important;
				cursor: pointer !important;
				transition: all 150ms !important;
				color: #565659;
				flex: 1 !important;
				gap: 0.5rem !important;
			}
			.settings-tab-trigger:focus-visible {
				outline: none !important;
				box-shadow: 0 0 0 2px #3b82f6 !important;
			}
			.settings-tab-trigger[aria-selected="true"],
			.settings-tab-trigger[data-active="true"],
			.settings-tab-trigger.active {
				background: linear-gradient(135deg, #2563eb 0%, #2dd4da 100%) !important;
				color: white !important;
				box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3) !important;
			}
			.settings-tab-trigger svg { width: 1rem !important; height: 1rem !important; }
			.settings-tab-trigger .tab-label { display: none !important; }
			@media (min-width: 640px) {
				.settings-tab-trigger .tab-label { display: inline !important; }
			}
			.settings-card {
				border-radius: 0.75rem !important;
				border: 1px solid var(--border) !important;
				background: white !important;
				box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
			}
			.settings-card-header {
				display: flex !important;
				flex-direction: column !important;
				gap: 0.375rem !important;
				padding: 1.5rem !important;
			}
			.settings-card-title {
				font-weight: 600 !important;
				line-height: 1 !important;
				letter-spacing: -0.025em !important;
				color: var(--brand-dark-navy) !important;
				margin: 0 !important;
				display: flex !important;
				align-items: center !important;
				gap: 0.5rem !important;
			}
			.settings-card-description {
				font-size: 0.875rem !important;
				color: var(--muted-foreground) !important;
			}
			.settings-card-content {
				padding: 1.5rem !important;
				padding-top: 0 !important;
			}
			.settings-floating-field {
				position: relative;
				margin-bottom: 0.75rem;
			}
			.settings-floating-wrapper {
				position: relative;
				display: flex;
				align-items: center;
				border-radius: 8px;
				background: white;
				padding: 0 12px;
				height: 40px;
				border: 2px solid #d1d5db;
				transition: all 0.2s;
			}
			.settings-floating-wrapper.has-value,
			.settings-floating-wrapper:focus-within {
				border-color: transparent;
				background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #2563eb, #2dd4da) border-box;
			}
			.settings-floating-label {
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
			.settings-floating-wrapper.has-value .settings-floating-label,
			.settings-floating-wrapper:focus-within .settings-floating-label {
				top: 0;
				font-size: 12px;
				color: #2563eb;
				font-weight: 500;
			}
			.settings-floating-input {
				width: 100%;
				border: none !important;
				background: transparent !important;
				font-size: 14px;
				color: #171A1F;
				outline: none !important;
				padding: 0;
				height: 100%;
			}
			.settings-floating-input::placeholder {
				color: transparent !important;
				opacity: 0 !important;
			}
			.settings-label {
				font-size: 14px;
				font-weight: 500;
				color: #171A1F;
				display: block;
				margin-bottom: 4px;
			}
			.settings-input-readonly {
				height: 40px;
				padding: 0 12px;
				display: flex;
				align-items: center;
				background: #F8F7F9;
				border: 1px solid #e5e7eb;
				border-radius: 8px;
				color: #6b7280;
				font-size: 14px;
			}
			.settings-hint {
				font-size: 12px;
				color: #6b7280;
				margin-top: 4px;
			}
			.settings-hint a { color: #2563EB; text-decoration: none; }
			.settings-hint a:hover { text-decoration: underline; }
			.settings-btn {
				display: inline-flex !important;
				align-items: center !important;
				justify-content: center !important;
				gap: 0.5rem !important;
				white-space: nowrap !important;
				border-radius: 0.375rem !important;
				font-size: 0.875rem !important;
				font-weight: 500 !important;
				height: 2.25rem !important;
				padding: 0.5rem 1rem !important;
				transition: all 150ms !important;
				cursor: pointer !important;
				border: none !important;
			}
			.settings-btn:focus-visible {
				outline: none !important;
				box-shadow: 0 0 0 1px var(--ring) !important;
			}
			.settings-btn:disabled {
				pointer-events: none !important;
				opacity: 0.5 !important;
			}
			.settings-btn-primary {
				background: linear-gradient(135deg, #2563eb 0%, #2dd4da 100%) !important;
				color: white !important;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
			}
			.settings-btn-primary:hover {
				background: linear-gradient(135deg, #1d4ed8 0%, #22d3ee 100%) !important;
				box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
			}
			.settings-btn-secondary {
				background: var(--brand-pale-blue) !important;
				color: var(--brand-dark-navy) !important;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
			}
			.settings-btn-secondary:hover {
				background: hsl(214 50% 75%) !important;
			}
			.settings-btn-outline {
				border: 1px solid #d1d5db !important;
				background: white !important;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
				color: var(--brand-dark-navy) !important;
			}
			.settings-btn-outline:hover {
				background: var(--muted) !important;
			}
			.settings-btn-destructive {
				background: hsl(0 84% 60%) !important;
				color: white !important;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
			}
			.settings-btn-destructive:hover {
				background: hsl(0 84% 54%) !important;
			}
			.settings-btn-link {
				color: var(--primary) !important;
				text-decoration-line: underline !important;
				text-underline-offset: 4px !important;
				background: transparent !important;
				padding: 0 !important;
				height: auto !important;
			}
			.settings-btn-link:hover { text-decoration: underline !important; }
			.settings-btn svg { width: 1rem !important; height: 1rem !important; }
			.settings-badge {
				display: inline-flex;
				align-items: center;
				border-radius: 0.375rem;
				border: 1px solid transparent;
				padding: 0.125rem 0.625rem;
				font-size: 0.75rem;
				font-weight: 600;
				transition: colors 150ms;
			}
			.settings-badge-secondary {
				background: var(--brand-pale-blue);
				color: var(--brand-dark-navy);
			}
			.settings-badge-success {
				background: #dcfce7;
				color: #15803d;
			}
			.settings-alert {
				position: relative;
				width: 100%;
				border-radius: 0.5rem;
				border: 1px solid var(--border);
				padding: 0.75rem 1rem;
				font-size: 0.875rem;
				margin-bottom: 1rem;
				display: flex;
				align-items: flex-start;
				gap: 0.75rem;
			}
			.settings-alert-success {
				background: #dcfce7;
				border-color: #bbf7d0;
			}
			.settings-alert-error {
				border-color: hsl(0 84% 60% / 0.5);
				color: hsl(0 84% 60%);
			}
			.settings-alert svg {
				width: 1rem;
				height: 1rem;
				flex-shrink: 0;
			}
			.settings-alert-success svg { color: #15803d; }
			.settings-alert-error svg { color: hsl(0 84% 60%); }
			.settings-alert-content {
				flex: 1;
				font-size: 0.875rem;
			}
			.settings-switch-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 0.75rem 0;
				border-bottom: 1px solid var(--border);
			}
			.settings-switch-row:last-of-type { border-bottom: none; }
			.settings-switch-label {
				font-size: 0.875rem;
				font-weight: 500;
				color: var(--brand-dark-navy);
			}
			.settings-switch-description {
				font-size: 0.875rem;
				color: var(--muted-foreground);
				margin-top: 0.125rem;
			}
			.settings-switch {
				display: inline-flex;
				height: 1.25rem;
				width: 2.25rem;
				flex-shrink: 0;
				cursor: pointer;
				align-items: center;
				border-radius: 9999px;
				border: 2px solid transparent;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
				transition: all 150ms;
				background: hsl(214 32% 91%);
				position: relative;
			}
			.settings-switch:has(input:checked) {
				background: var(--primary);
			}
			.settings-switch input {
				position: absolute;
				opacity: 0;
				width: 100%;
				height: 100%;
				cursor: pointer;
				margin: 0;
			}
			.settings-switch-thumb {
				pointer-events: none;
				display: block;
				width: 1rem;
				height: 1rem;
				border-radius: 9999px;
				background: white;
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
				transition: transform 150ms;
			}
			.settings-switch:has(input:checked) .settings-switch-thumb {
				transform: translateX(1rem);
			}
			.settings-separator {
				flex-shrink: 0;
				background: var(--border);
				height: 1px;
				width: 100%;
			}
			.settings-fub-status {
				padding: 1rem;
				background: var(--brand-off-white);
				border-radius: 0.5rem;
				border: 1px solid var(--brand-powder-blue);
			}
			.settings-fub-status-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 0.875rem;
				padding: 0.25rem 0;
			}
			.settings-fub-status-row span:first-child { color: var(--muted-foreground); }
			.settings-fub-status-row span:last-child { color: var(--brand-dark-navy); }
			.settings-fub-status-row .font-mono { font-family: ui-monospace, monospace; }
			@keyframes settings-skeleton-pulse {
				0%, 100% { opacity: 1; }
				50% { opacity: 0.5; }
			}
			.settings-skeleton {
				background: var(--brand-light-gray);
				border-radius: 0.375rem;
				animation: settings-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
			}
			.settings-skeleton-text { height: 1rem; width: 100%; }
			.settings-skeleton-text-sm { height: 0.75rem; width: 60%; }
			.settings-skeleton-input { height: 40px; width: 100%; }
			.settings-skeleton-label { height: 0.875rem; width: 80px; margin-bottom: 0.5rem; }
			.settings-space-y-4 > * + * { margin-top: 1rem; }
			.settings-space-y-6 > * + * { margin-top: 1.5rem; }
			.settings-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
			.settings-pt-4 { padding-top: 1rem; }
			.settings-border-t { border-top: 1px solid var(--border); }
			.settings-gap-3 { display: flex; gap: 0.75rem; }
			.settings-text-right { text-align: right; }
			.settings-text-sm { font-size: 0.875rem; }
			.settings-text-gray-500 { color: var(--muted-foreground); }
			.settings-text-gray-700 { color: var(--brand-dark-navy); }
			.settings-font-medium { font-weight: 500; }
			.settings-hidden { display: none !important; }
		';
	}

	/**
	 * Check if current page has the settings shortcode
	 *
	 * @return bool
	 */
	private function is_settings_page() {
		global $post;
		if ( ! $post ) {
			return false;
		}
		return has_shortcode( $post->post_content, 'frs_user_settings' );
	}

	/**
	 * Render shortcode
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function render_shortcode( $atts ) {
		if ( ! is_user_logged_in() ) {
			return '<div class="settings-alert settings-alert-error"><p>You must be logged in to access settings.</p></div>';
		}

		$current_user = wp_get_current_user();

		// Load the user's profile for frs-specific fields
		$profile    = Profile::find( $current_user->ID );
		$profile_id = $profile ? $profile->user_id : 0;

		// Telegram integration status
		$telegram_user_id  = get_user_meta( $current_user->ID, 'wptelegram_user_id', true );
		$telegram_username = $profile ? ( $profile->telegram_username ?: '' ) : '';
		$telegram_active   = function_exists( 'wptelegram_login' );

		// Build initial context for Interactivity API
		$context = array(
			'activeTab'            => 'account',
			'isLoading'            => false,
			'isSaving'             => false,
			'message'              => null,
			'restNonce'            => wp_create_nonce( 'wp_rest' ),
			'restUrl'              => rest_url(),
			'profileId'            => $profile_id,

			// Account fields
			'email'                => $current_user->user_email,
			'firstName'            => $current_user->first_name,
			'lastName'             => $current_user->last_name,
			'displayName'          => $current_user->display_name,
			'username'             => $current_user->user_login,
			'isMicrosoftUser'      => false,
			'newPassword'          => '',
			'confirmPassword'      => '',

			// Notification settings
			'leadNotifications'    => true,
			'meetingNotifications' => true,
			'marketingEmails'      => true,
			'systemUpdates'        => true,
			'weeklyDigest'         => false,

			// Telegram integration
			'telegramInstalled'    => $telegram_active,
			'telegramConnected'    => ! empty( $telegram_user_id ),
			'telegramUsername'     => $telegram_username,
			'telegramUserId'      => $telegram_user_id ?: '',

			// FUB integration
			'fubConnected'         => false,
			'fubAccountName'       => '',
			'fubMaskedKey'         => '',
			'fubApiKey'            => '',
			'fubLoading'           => true,
			'fubTotalSynced'       => 0,
			'fubLastSync'          => null,
			'fubConnectedAt'       => null,
		);

		ob_start();
		?>
		<div
			class="settings-page"
			data-wp-interactive="frs-users/settings"
			<?php echo wp_interactivity_data_wp_context( $context ); ?>
			data-wp-init="callbacks.onInit"
		>
			<!-- Tabs -->
			<div role="tablist" class="settings-tabs-list">
				<?php
				$tabs = array(
					'account'       => array( 'icon' => 'user', 'label' => 'Account' ),
					'notifications' => array( 'icon' => 'bell', 'label' => 'Notifications' ),
					'integrations'  => array( 'icon' => 'zap', 'label' => 'Integrations' ),
				);

				foreach ( $tabs as $tab_id => $tab ) :
					$is_default   = ( $tab_id === 'account' );
					$state_getter = 'state.is' . ucfirst( $tab_id ) . 'Tab';
					?>
					<button
						type="button"
						role="tab"
						data-tab="<?php echo esc_attr( $tab_id ); ?>"
						data-wp-on--click="actions.setTab"
						data-wp-bind--aria-selected="<?php echo esc_attr( $state_getter ); ?>"
						data-wp-class--active="<?php echo esc_attr( $state_getter ); ?>"
						class="settings-tab-trigger<?php echo $is_default ? ' active' : ''; ?>"
						<?php echo $is_default ? 'aria-selected="true"' : ''; ?>
					>
						<?php echo $this->get_icon( $tab['icon'], 16 ); ?>
						<span class="tab-label"><?php echo esc_html( $tab['label'] ); ?></span>
					</button>
					<?php
				endforeach;
				?>
			</div>

			<!-- Tab Panels -->
			<?php $this->render_account_tab(); ?>
			<?php $this->render_notifications_tab(); ?>
			<?php $this->render_integrations_tab(); ?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Render message alert
	 *
	 * @return void
	 */
	private function render_message_alert() {
		?>
		<div
			data-wp-bind--hidden="!state.hasMessage"
			data-wp-class--settings-alert-success="state.isSuccessMessage"
			data-wp-class--settings-alert-error="state.isErrorMessage"
			class="settings-alert"
		>
			<span data-wp-bind--hidden="!state.isSuccessMessage"><?php echo $this->get_icon( 'check-circle', 16 ); ?></span>
			<span data-wp-bind--hidden="!state.isErrorMessage"><?php echo $this->get_icon( 'alert-circle', 16 ); ?></span>
			<div class="settings-alert-content" data-wp-text="state.messageText"></div>
		</div>
		<?php
	}

	/**
	 * Render Account Tab
	 *
	 * @return void
	 */
	private function render_account_tab() {
		?>
		<div role="tabpanel" data-wp-bind--hidden="!state.isAccountTab" class="settings-space-y-6">
			<?php $this->render_message_alert(); ?>

			<!-- Account Details Card -->
			<div class="settings-card">
				<div class="settings-card-header">
					<h2 class="settings-card-title">
						Account Details
						<span data-wp-bind--hidden="!context.isMicrosoftUser" class="settings-badge settings-badge-secondary">
							Microsoft Account
						</span>
					</h2>
					<p class="settings-card-description" data-wp-text="context.isMicrosoftUser ? 'Your account is managed through Microsoft 365' : 'Manage your account information'"></p>
				</div>
				<div class="settings-card-content settings-space-y-4">
					<!-- Loading State -->
					<div data-wp-bind--hidden="!context.isLoading" class="settings-space-y-4">
						<div>
							<div class="settings-skeleton settings-skeleton-label"></div>
							<div class="settings-skeleton settings-skeleton-input"></div>
						</div>
						<div>
							<div class="settings-skeleton settings-skeleton-input"></div>
						</div>
						<div class="settings-grid-2">
							<div class="settings-skeleton settings-skeleton-input"></div>
							<div class="settings-skeleton settings-skeleton-input"></div>
						</div>
						<div>
							<div class="settings-skeleton settings-skeleton-input"></div>
						</div>
						<div class="settings-pt-4">
							<div class="settings-skeleton" style="height: 36px; width: 160px;"></div>
						</div>
					</div>

					<!-- Form -->
					<div data-wp-bind--hidden="context.isLoading" class="settings-space-y-4">
						<!-- Microsoft Notice -->
						<div data-wp-bind--hidden="!context.isMicrosoftUser" class="settings-alert">
							<div class="settings-alert-content">
								Your account uses Microsoft 365 authentication. Some settings are managed through your Microsoft account.
							</div>
						</div>

						<!-- Username -->
						<div>
							<label class="settings-label">Username</label>
							<div class="settings-input-readonly" data-wp-text="context.username"></div>
							<p class="settings-hint">Usernames cannot be changed</p>
						</div>

						<!-- Email -->
						<div class="settings-floating-field">
							<div class="settings-floating-wrapper" data-wp-class--has-value="context.email">
								<input
									type="email"
									data-field="email"
									data-wp-bind--value="context.email"
									data-wp-bind--disabled="context.isMicrosoftUser"
									data-wp-on--input="actions.updateField"
									class="settings-floating-input"
									placeholder="Enter email"
								/>
								<span class="settings-floating-label">Email Address</span>
							</div>
							<p data-wp-bind--hidden="!context.isMicrosoftUser" class="settings-hint">
								Email is managed through your Microsoft account
							</p>
						</div>

						<!-- Name Fields -->
						<div class="settings-grid-2">
							<div class="settings-floating-field">
								<div class="settings-floating-wrapper" data-wp-class--has-value="context.firstName">
									<input
										type="text"
										data-field="firstName"
										data-wp-bind--value="context.firstName"
										data-wp-on--input="actions.updateField"
										class="settings-floating-input"
										placeholder="Enter first name"
									/>
									<span class="settings-floating-label">First Name</span>
								</div>
							</div>
							<div class="settings-floating-field">
								<div class="settings-floating-wrapper" data-wp-class--has-value="context.lastName">
									<input
										type="text"
										data-field="lastName"
										data-wp-bind--value="context.lastName"
										data-wp-on--input="actions.updateField"
										class="settings-floating-input"
										placeholder="Enter last name"
									/>
									<span class="settings-floating-label">Last Name</span>
								</div>
							</div>
						</div>

						<!-- Display Name -->
						<div class="settings-floating-field">
							<div class="settings-floating-wrapper" data-wp-class--has-value="context.displayName">
								<input
									type="text"
									data-field="displayName"
									data-wp-bind--value="context.displayName"
									data-wp-on--input="actions.updateField"
									class="settings-floating-input"
									placeholder="Enter display name"
								/>
								<span class="settings-floating-label">Display Name</span>
							</div>
						</div>

						<!-- Save Button -->
						<div class="settings-pt-4">
							<button
								type="button"
								data-wp-on--click="actions.saveAccount"
								data-wp-bind--disabled="context.isSaving"
								class="settings-btn settings-btn-primary"
							>
								<?php echo $this->get_icon( 'save', 16 ); ?>
								Save
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Password Card -->
			<div class="settings-card">
				<div class="settings-card-header">
					<h2 class="settings-card-title">
						<?php echo $this->get_icon( 'lock', 20 ); ?>
						Change Password
					</h2>
					<p class="settings-card-description" data-wp-text="context.isMicrosoftUser ? 'Password is managed through Microsoft 365' : 'Update your account password'"></p>
				</div>
				<div class="settings-card-content settings-space-y-4">
					<!-- Microsoft User Notice -->
					<div data-wp-bind--hidden="!context.isMicrosoftUser" class="settings-alert">
						<div class="settings-alert-content">
							<p>Your password is managed through Microsoft 365. To change your password, please visit your Microsoft account settings.</p>
							<a href="https://account.microsoft.com/security" target="_blank" rel="noopener noreferrer" class="settings-btn-link" style="margin-top: 0.75rem;">
								Manage Microsoft Account Security
								<?php echo $this->get_icon( 'external-link', 14 ); ?>
							</a>
						</div>
					</div>

					<!-- Password Form -->
					<form data-wp-bind--hidden="context.isMicrosoftUser" class="settings-space-y-4" onsubmit="return false" autocomplete="off">
						<div class="settings-floating-field">
							<div class="settings-floating-wrapper" data-wp-class--has-value="context.newPassword">
								<input
									type="password"
									data-field="newPassword"
									data-wp-bind--value="context.newPassword"
									data-wp-on--input="actions.updateField"
									class="settings-floating-input"
									placeholder="Enter new password"
									autocomplete="new-password"
								/>
								<span class="settings-floating-label">New Password</span>
							</div>
						</div>
						<div class="settings-floating-field">
							<div class="settings-floating-wrapper" data-wp-class--has-value="context.confirmPassword">
								<input
									type="password"
									data-field="confirmPassword"
									data-wp-bind--value="context.confirmPassword"
									data-wp-on--input="actions.updateField"
									class="settings-floating-input"
									placeholder="Confirm password"
									autocomplete="new-password"
								/>
								<span class="settings-floating-label">Confirm New Password</span>
							</div>
						</div>
						<p class="settings-hint">Password must be at least 8 characters long</p>

						<div class="settings-pt-4">
							<button
								type="button"
								data-wp-on--click="actions.savePassword"
								data-wp-bind--disabled="!state.canSavePassword || context.isSaving"
								class="settings-btn settings-btn-secondary"
							>
								<?php echo $this->get_icon( 'save', 16 ); ?>
								Save Password
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render Notifications Tab
	 *
	 * @return void
	 */
	private function render_notifications_tab() {
		$notifications = array(
			array( 'field' => 'leadNotifications', 'label' => 'Lead Notifications', 'desc' => 'Get notified when you receive new leads' ),
			array( 'field' => 'meetingNotifications', 'label' => 'Meeting Notifications', 'desc' => 'Get notified about meeting requests and updates' ),
			array( 'field' => 'marketingEmails', 'label' => 'Marketing Emails', 'desc' => 'Receive emails about new features and updates' ),
			array( 'field' => 'systemUpdates', 'label' => 'System Updates', 'desc' => 'Get notified about system updates and maintenance' ),
			array( 'field' => 'weeklyDigest', 'label' => 'Weekly Digest', 'desc' => 'Receive a weekly summary of your activity' ),
		);
		?>
		<div role="tabpanel" data-wp-bind--hidden="!state.isNotificationsTab">
			<div class="settings-card">
				<div class="settings-card-header">
					<h2 class="settings-card-title">Notification Preferences</h2>
					<p class="settings-card-description">Choose which notifications you want to receive</p>
				</div>
				<div class="settings-card-content settings-space-y-4">
					<?php $this->render_message_alert(); ?>

					<?php foreach ( $notifications as $item ) : ?>
						<div class="settings-switch-row">
							<div>
								<span class="settings-switch-label"><?php echo esc_html( $item['label'] ); ?></span>
								<p class="settings-switch-description"><?php echo esc_html( $item['desc'] ); ?></p>
							</div>
							<label class="settings-switch">
								<input
									type="checkbox"
									data-field="<?php echo esc_attr( $item['field'] ); ?>"
									data-wp-on--change="actions.toggleSwitch"
									data-wp-bind--checked="context.<?php echo esc_attr( $item['field'] ); ?>"
								/>
								<span class="settings-switch-thumb"></span>
							</label>
						</div>
					<?php endforeach; ?>

					<div class="settings-pt-4 settings-border-t">
						<button
							type="button"
							data-wp-on--click="actions.saveNotifications"
							data-wp-bind--disabled="context.isSaving"
							class="settings-btn settings-btn-primary"
						>
							<?php echo $this->get_icon( 'save', 16 ); ?>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render Integrations Tab
	 *
	 * @return void
	 */
	private function render_integrations_tab() {
		?>
		<div role="tabpanel" data-wp-bind--hidden="!state.isIntegrationsTab" class="settings-space-y-6">
			<?php $this->render_message_alert(); ?>

			<!-- Telegram Card -->
			<div class="settings-card">
				<div class="settings-card-header">
					<div style="display: flex; align-items: flex-start; justify-content: space-between;">
						<div>
							<h2 class="settings-card-title">
								<?php echo $this->get_icon( 'send', 24 ); ?>
								Telegram
								<span data-wp-bind--hidden="!context.telegramConnected" class="settings-badge settings-badge-success">
									Connected
								</span>
							</h2>
							<p class="settings-card-description">Connect your Telegram account to receive notifications and display your profile link</p>
						</div>
						<div data-wp-bind--hidden="!context.telegramConnected" class="settings-text-right settings-text-sm settings-text-gray-500">
							<p class="settings-font-medium settings-text-gray-700" data-wp-text="context.telegramUsername ? '@' + context.telegramUsername : ''"></p>
						</div>
					</div>
				</div>
				<div class="settings-card-content settings-space-y-4">
					<?php if ( ! function_exists( 'wptelegram_login' ) ) : ?>
						<!-- Plugin Not Installed -->
						<div class="settings-alert">
							<?php echo $this->get_icon( 'alert-circle', 16 ); ?>
							<div class="settings-alert-content">
								<p>The <strong>WP Telegram Login</strong> plugin is required to connect your Telegram account.</p>
								<p style="margin-top: 0.5rem;">Please ask an administrator to install and configure the plugin.</p>
							</div>
						</div>
					<?php else : ?>
						<!-- Connected State -->
						<div data-wp-bind--hidden="!context.telegramConnected" class="settings-space-y-4">
							<div class="settings-fub-status">
								<div class="settings-fub-status-row">
									<span>Status</span>
									<span class="settings-badge settings-badge-success">Active</span>
								</div>
								<div data-wp-bind--hidden="!context.telegramUserId" class="settings-fub-status-row">
									<span>Telegram ID</span>
									<span class="font-mono" data-wp-text="context.telegramUserId"></span>
								</div>
								<div data-wp-bind--hidden="!context.telegramUsername" class="settings-fub-status-row">
									<span>Username</span>
									<span>
										<a data-wp-bind--href="'https://t.me/' + context.telegramUsername" target="_blank" rel="noopener noreferrer" style="color: #2563EB; text-decoration: none;">
											@<span data-wp-text="context.telegramUsername"></span>
										</a>
									</span>
								</div>
							</div>

							<div class="settings-gap-3">
								<button
									type="button"
									data-wp-on--click="actions.disconnectTelegram"
									data-wp-bind--disabled="context.isSaving"
									class="settings-btn settings-btn-destructive"
								>
									<?php echo $this->get_icon( 'trash-2', 16 ); ?>
									Disconnect
								</button>
							</div>
						</div>

						<!-- Not Connected State -->
						<div data-wp-bind--hidden="context.telegramConnected" class="settings-space-y-4">
							<p class="settings-text-sm settings-text-gray-500">
								Click the button below to connect your Telegram account. You'll be redirected to Telegram to authorize the connection.
							</p>
							<div>
								<?php
								wptelegram_login(
									array(
										'show_user_photo' => false,
										'corner_radius'   => 8,
										'button_style'    => 'large',
										'show_if_user_is' => 'logged_in',
									)
								);
								?>
							</div>
						</div>
					<?php endif; ?>
				</div>
			</div>

			<!-- Follow Up Boss Card -->
			<div class="settings-card">
				<div class="settings-card-header">
					<div style="display: flex; align-items: flex-start; justify-content: space-between;">
						<div>
							<h2 class="settings-card-title">
								<img src="<?php echo esc_url( FRS_USERS_URL . 'assets/images/follow-up-boss-logo.png' ); ?>" alt="Follow Up Boss" style="height: 48px; width: auto;" />
								Follow Up Boss
								<span data-wp-bind--hidden="!state.showFubConnected" class="settings-badge settings-badge-success">
									Connected
								</span>
							</h2>
							<p class="settings-card-description">Connect your Follow Up Boss CRM to automatically sync leads</p>
						</div>
						<div data-wp-bind--hidden="!state.showFubConnected" class="settings-text-right settings-text-sm settings-text-gray-500">
							<p class="settings-font-medium settings-text-gray-700" data-wp-text="context.fubAccountName"></p>
							<p data-wp-bind--hidden="!context.fubTotalSynced"><span data-wp-text="context.fubTotalSynced"></span> leads synced</p>
						</div>
					</div>
				</div>
				<div class="settings-card-content settings-space-y-4">
					<!-- Loading Skeleton -->
					<div data-wp-bind--hidden="!state.showFubSkeleton" class="settings-space-y-4">
						<div class="settings-skeleton settings-skeleton-input"></div>
						<div class="settings-skeleton" style="height: 36px; width: 200px;"></div>
					</div>
					<!-- Connected State -->
					<div data-wp-bind--hidden="!state.showFubConnected" class="settings-space-y-4">
						<div class="settings-fub-status">
							<div class="settings-fub-status-row">
								<span>Status</span>
								<span class="settings-badge settings-badge-success">Active</span>
							</div>
							<div data-wp-bind--hidden="!context.fubMaskedKey" class="settings-fub-status-row">
								<span>API Key</span>
								<span class="font-mono" data-wp-text="context.fubMaskedKey"></span>
							</div>
							<div data-wp-bind--hidden="!context.fubConnectedAt" class="settings-fub-status-row">
								<span>Connected</span>
								<span data-wp-text="context.fubConnectedAt"></span>
							</div>
							<div data-wp-bind--hidden="!context.fubLastSync" class="settings-fub-status-row">
								<span>Last Sync</span>
								<span data-wp-text="context.fubLastSync"></span>
							</div>
						</div>

						<div class="settings-gap-3">
							<button
								type="button"
								data-wp-on--click="actions.testFub"
								data-wp-bind--disabled="context.fubLoading"
								class="settings-btn settings-btn-outline"
							>
								<?php echo $this->get_icon( 'refresh-cw', 16 ); ?>
								Test Connection
							</button>
							<button
								type="button"
								data-wp-on--click="actions.disconnectFub"
								data-wp-bind--disabled="context.fubLoading"
								class="settings-btn settings-btn-destructive"
							>
								<?php echo $this->get_icon( 'trash-2', 16 ); ?>
								Disconnect
							</button>
						</div>
					</div>

					<!-- Not Connected State -->
					<div data-wp-bind--hidden="!state.showFubNotConnected" class="settings-space-y-4">
						<div class="settings-floating-field">
							<div class="settings-floating-wrapper" data-wp-class--has-value="context.fubApiKey">
								<input
									type="password"
									data-field="fubApiKey"
									data-wp-bind--value="context.fubApiKey"
									data-wp-on--input="actions.updateField"
									placeholder="Enter your API key"
									class="settings-floating-input"
								/>
								<span class="settings-floating-label">Follow Up Boss API Key</span>
							</div>
							<p class="settings-hint">
								Find your API key in Follow Up Boss under Admin &gt; API.
								<a href="https://app.followupboss.com/2/api" target="_blank" rel="noopener noreferrer" style="color: #2563EB;">
									Get your API key
								</a>
							</p>
						</div>

						<button
							type="button"
							data-wp-on--click="actions.connectFub"
							data-wp-bind--disabled="context.fubLoading || !context.fubApiKey"
							class="settings-btn settings-btn-primary"
							style="height: 2.75rem; padding: 0.5rem 1.5rem; font-size: 1rem;"
						>
							<?php echo $this->get_icon( 'plug', 20 ); ?>
							<span data-wp-text="context.fubLoading ? 'Connecting...' : 'Integrate'"></span>
						</button>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Get SVG icon by name
	 *
	 * @param string $name Icon name.
	 * @param int    $size Icon size in pixels.
	 * @return string SVG markup.
	 */
	private function get_icon( $name, $size = 20 ) {
		if ( class_exists( 'Lucide_Icons' ) ) {
			return \Lucide_Icons::render( $name, $size );
		}

		$icons = array(
			'user'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
			'bell'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
			'shield'        => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
			'plug'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
			'save'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
			'lock'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
			'external-link' => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>',
			'refresh-cw'    => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
			'trash-2'       => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
			'check-circle'  => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
			'alert-circle'  => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
			'zap'           => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
			'send'          => '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
		);

		if ( isset( $icons[ $name ] ) ) {
			return sprintf( $icons[ $name ], $size, $size );
		}

		return '';
	}
}
