<?php
/**
 * FRS Profiles Admin Page
 *
 * WordPress-native admin page for managing FRS profiles.
 * Uses Gutenberg components via @wordpress/scripts.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Core\Roles;
use FRSUsers\Traits\Base;

/**
 * Class ProfilesAdminPage
 *
 * Registers and renders the FRS Profiles admin page.
 *
 * @package FRSUsers\Admin
 */
class ProfilesAdminPage {

	use Base;

	/**
	 * Initialize the admin page.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Register settings.
	 *
	 * @return void
	 */
	public function register_settings() {
		register_setting( 'frs_profiles_settings', 'frs_site_context' );
		register_setting( 'frs_profiles_settings', 'frs_lending_site_url' );
		register_setting( 'frs_profiles_settings', 'frs_realestate_site_url' );
		register_setting( 'frs_profiles_settings', 'frs_directory_headline' );
		register_setting( 'frs_profiles_settings', 'frs_directory_subheadline' );
		register_setting( 'frs_profiles_settings', 'frs_directory_video_url' );

		// Site Context Section.
		add_settings_section(
			'frs_site_context_section',
			__( 'Site Context', 'frs-users' ),
			function() {
				echo '<p>' . esc_html__( 'Configure which site this plugin instance serves. This controls which profiles appear in directories and whether editing is enabled.', 'frs-users' ) . '</p>';
			},
			'frs_profiles_settings'
		);

		add_settings_field(
			'frs_site_context',
			__( 'Site Context', 'frs-users' ),
			array( $this, 'render_site_context_field' ),
			'frs_profiles_settings',
			'frs_site_context_section'
		);

		add_settings_field(
			'frs_lending_site_url',
			__( 'Lending Site URL', 'frs-users' ),
			function() {
				$value = get_option( 'frs_lending_site_url', '' );
				echo '<input type="url" name="frs_lending_site_url" value="' . esc_attr( $value ) . '" class="regular-text" placeholder="https://21stcenturylending.com">';
				echo '<p class="description">' . esc_html__( 'URL for loan officer profiles (loan_originator role).', 'frs-users' ) . '</p>';
			},
			'frs_profiles_settings',
			'frs_site_context_section'
		);

		add_settings_field(
			'frs_realestate_site_url',
			__( 'Real Estate Site URL', 'frs-users' ),
			function() {
				$value = get_option( 'frs_realestate_site_url', '' );
				echo '<input type="url" name="frs_realestate_site_url" value="' . esc_attr( $value ) . '" class="regular-text" placeholder="https://c21masters.com">';
				echo '<p class="description">' . esc_html__( 'URL for real estate agent profiles (broker_associate, sales_associate roles).', 'frs-users' ) . '</p>';
			},
			'frs_profiles_settings',
			'frs_site_context_section'
		);

		// Directory Section.
		add_settings_section(
			'frs_directory_section',
			__( 'Directory Settings', 'frs-users' ),
			function() {
				echo '<p>' . esc_html__( 'Configure the loan officer directory display.', 'frs-users' ) . '</p>';
			},
			'frs_profiles_settings'
		);

		add_settings_field(
			'frs_directory_headline',
			__( 'Directory Headline', 'frs-users' ),
			function() {
				$value = get_option( 'frs_directory_headline', 'Find Your Loan Officer' );
				echo '<input type="text" name="frs_directory_headline" value="' . esc_attr( $value ) . '" class="regular-text">';
			},
			'frs_profiles_settings',
			'frs_directory_section'
		);

		add_settings_field(
			'frs_directory_subheadline',
			__( 'Directory Subheadline', 'frs-users' ),
			function() {
				$value = get_option( 'frs_directory_subheadline', 'Connect with a mortgage professional in your area' );
				echo '<input type="text" name="frs_directory_subheadline" value="' . esc_attr( $value ) . '" class="regular-text">';
			},
			'frs_profiles_settings',
			'frs_directory_section'
		);

		add_settings_field(
			'frs_directory_video_url',
			__( 'Background Video URL', 'frs-users' ),
			function() {
				$value = get_option( 'frs_directory_video_url', '' );
				echo '<input type="url" name="frs_directory_video_url" value="' . esc_attr( $value ) . '" class="regular-text">';
				echo '<p class="description">' . esc_html__( 'MP4 video URL for card backgrounds.', 'frs-users' ) . '</p>';
			},
			'frs_profiles_settings',
			'frs_directory_section'
		);
	}

	/**
	 * Render the site context field.
	 *
	 * @return void
	 */
	public function render_site_context_field() {
		$contexts        = Roles::get_site_contexts();
		$current_context = Roles::get_site_context();
		$is_locked       = Roles::is_context_locked();

		if ( $is_locked ) {
			$config = Roles::get_site_context_config();
			echo '<p><strong>' . esc_html( $config['label'] ) . '</strong></p>';
			echo '<p class="description">' . esc_html__( 'Site context is locked via FRS_SITE_CONTEXT constant in wp-config.php', 'frs-users' ) . '</p>';
			return;
		}

		echo '<select name="frs_site_context" id="frs_site_context">';
		foreach ( $contexts as $slug => $config ) {
			printf(
				'<option value="%s" %s>%s</option>',
				esc_attr( $slug ),
				selected( $current_context, $slug, false ),
				esc_html( $config['label'] )
			);
		}
		echo '</select>';

		$config = Roles::get_site_context_config( $current_context );
		echo '<p class="description">' . esc_html( $config['description'] ) . '</p>';

		// Show what roles are active.
		$active_roles = Roles::get_active_company_roles();
		echo '<p class="description"><strong>' . esc_html__( 'Active company roles:', 'frs-users' ) . '</strong> ';
		echo esc_html( implode( ', ', $active_roles ) );
		echo '</p>';

		// Show editing status.
		$editing_status = Roles::is_profile_editing_enabled()
			? __( 'Enabled', 'frs-users' )
			: __( 'Disabled (read-only)', 'frs-users' );
		echo '<p class="description"><strong>' . esc_html__( 'Profile editing:', 'frs-users' ) . '</strong> ';
		echo esc_html( $editing_status );
		echo '</p>';
	}

	/**
	 * Add admin menu page.
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'FRS Profiles', 'frs-users' ),
			__( 'FRS Profiles', 'frs-users' ),
			'manage_options',
			'frs-profiles',
			array( $this, 'render_page' ),
			'dashicons-groups',
			30
		);

		add_submenu_page(
			'frs-profiles',
			__( 'All Profiles', 'frs-users' ),
			__( 'All Profiles', 'frs-users' ),
			'manage_options',
			'frs-profiles',
			array( $this, 'render_page' )
		);

		// Note: "Add New" is handled by ProfileAddPage.php
		// Note: "Edit Profile" is handled by ProfileEditPage.php (hidden page)

		add_submenu_page(
			'frs-profiles',
			__( 'Settings', 'frs-users' ),
			__( 'Settings', 'frs-users' ),
			'manage_options',
			'frs-profiles-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Render the admin page.
	 *
	 * @return void
	 */
	public function render_page() {
		?>
		<div class="wrap">
			<div id="frs-profiles-admin-root"></div>
		</div>
		<?php
	}

	/**
	 * Render settings page.
	 *
	 * @return void
	 */
	public function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'FRS Profiles Settings', 'frs-users' ); ?></h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( 'frs_profiles_settings' );
				do_settings_sections( 'frs_profiles_settings' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook Admin page hook.
	 * @return void
	 */
	public function enqueue_assets( $hook ) {
		if ( strpos( $hook, 'frs-profiles' ) === false ) {
			return;
		}

		// Check if built assets exist
		$asset_file = FRS_USERS_DIR . 'assets/admin/build/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			// Show admin notice if assets not built
			add_action( 'admin_notices', function() {
				?>
				<div class="notice notice-error">
					<p><?php esc_html_e( 'FRS Profiles admin assets not built. Run: npm run build', 'frs-users' ); ?></p>
				</div>
				<?php
			} );
			return;
		}

		$asset = include $asset_file;

		// Enqueue the admin app
		wp_enqueue_script(
			'frs-profiles-admin',
			FRS_USERS_URL . 'assets/admin/build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'frs-profiles-admin',
			FRS_USERS_URL . 'assets/admin/build/style-index.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// Get marketing site URLs (fallback to current site)
		$lending_site_url = get_option( 'frs_lending_site_url', '' );
		$realestate_site_url = get_option( 'frs_realestate_site_url', '' );
		$local_site_url = home_url();

		// Localize script with data
		wp_localize_script(
			'frs-profiles-admin',
			'frsProfilesAdmin',
			array(
				'apiUrl'              => rest_url( 'frs-users/v1' ),
				'nonce'               => wp_create_nonce( 'wp_rest' ),
				'roles'               => $this->get_frs_roles(),
				'profileEditUrl'      => admin_url( 'admin.php?page=frs-profile-edit&user_id=' ),
				'addNewUrl'           => admin_url( 'admin.php?page=frs-profile-add' ),
				'siteContext'         => Roles::get_site_context(),
				'siteContextConfig'   => Roles::get_site_context_config(),
				'activeCompanyRoles'  => Roles::get_active_company_roles(),
				'isEditingEnabled'    => Roles::is_profile_editing_enabled(),
				'lendingSiteUrl'      => $lending_site_url ? trailingslashit( $lending_site_url ) : '',
				'realestateSiteUrl'   => $realestate_site_url ? trailingslashit( $realestate_site_url ) : '',
				'localSiteUrl'        => trailingslashit( $local_site_url ),
			)
		);
	}

	/**
	 * Get FRS roles configuration.
	 *
	 * Returns WordPress roles with URL prefixes for admin interface.
	 *
	 * @return array
	 */
	protected function get_frs_roles() {
		return Roles::get_wp_roles_for_admin();
	}
}
