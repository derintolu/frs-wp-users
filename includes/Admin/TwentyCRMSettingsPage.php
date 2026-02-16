<?php
/**
 * Twenty CRM Settings Page
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 4.0.0
 */

namespace FRSUsers\Admin;

/**
 * Class TwentyCRMSettingsPage
 *
 * Admin page for Twenty CRM integration settings.
 */
class TwentyCRMSettingsPage {

	/**
	 * Initialize the settings page
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ), 20 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
	}

	/**
	 * Register admin menu
	 *
	 * @return void
	 */
	public static function register_menu() {
		add_submenu_page(
			'frs-profiles',
			__( 'Twenty CRM Settings', 'frs-users' ),
			__( 'Twenty CRM', 'frs-users' ),
			'manage_options',
			'frs-twenty-crm-settings',
			array( __CLASS__, 'render' )
		);
	}

	/**
	 * Enqueue assets for the settings page
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public static function enqueue_assets( $hook ) {
		// Only load on our settings page
		if ( 'profiles_page_frs-twenty-crm-settings' !== $hook ) {
			return;
		}

		$asset_file = FRS_USERS_DIR . 'assets/admin/build/twenty-crm-settings.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'frs-twenty-crm-settings',
			FRS_USERS_URL . 'assets/admin/build/twenty-crm-settings.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'frs-twenty-crm-settings',
			FRS_USERS_URL . 'assets/admin/build/twenty-crm-settings.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// Localize script with initial data
		wp_localize_script(
			'frs-twenty-crm-settings',
			'frsTwentyCRM',
			array(
				'nonce'      => wp_create_nonce( 'wp_rest' ),
				'restUrl'    => rest_url(),
				'webhookUrl' => rest_url( 'frs-users/v1/webhook/twenty-crm' ),
			)
		);
	}

	/**
	 * Render the settings page
	 *
	 * @return void
	 */
	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}
		?>
		<div class="wrap">
			<div id="frs-twenty-crm-settings-root"></div>
		</div>
		<?php
	}
}
