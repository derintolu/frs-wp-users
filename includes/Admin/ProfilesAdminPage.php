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
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
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

		add_submenu_page(
			'frs-profiles',
			__( 'Add New', 'frs-users' ),
			__( 'Add New', 'frs-users' ),
			'manage_options',
			'frs-profiles&action=new',
			array( $this, 'render_page' )
		);

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
			FRS_USERS_URL . 'assets/admin/build/index.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// Localize script with data
		wp_localize_script(
			'frs-profiles-admin',
			'frsProfilesAdmin',
			array(
				'apiUrl'    => rest_url( 'frs-users/v1' ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'roles'     => $this->get_frs_roles(),
				'userEditUrl' => admin_url( 'user-edit.php?user_id=' ),
			)
		);
	}

	/**
	 * Get FRS roles configuration.
	 *
	 * @return array
	 */
	protected function get_frs_roles() {
		return array(
			'loan_officer' => array(
				'label' => __( 'Loan Officer', 'frs-users' ),
				'url_prefix' => 'lo',
			),
			'realtor_partner' => array(
				'label' => __( 'Realtor Partner', 'frs-users' ),
				'url_prefix' => 'agent',
			),
			'staff' => array(
				'label' => __( 'Staff', 'frs-users' ),
				'url_prefix' => 'staff',
			),
			'leadership' => array(
				'label' => __( 'Leadership', 'frs-users' ),
				'url_prefix' => 'leader',
			),
			'assistant' => array(
				'label' => __( 'Assistant', 'frs-users' ),
				'url_prefix' => 'staff',
			),
		);
	}
}
