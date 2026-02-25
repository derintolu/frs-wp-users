<?php
/**
 * Network Sync Control Panel
 *
 * Network-level admin page for managing Twenty CRM sync across all subsites.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 4.1.0
 */

namespace FRSUsers\Admin;

/**
 * Class NetworkSyncPage
 *
 * Network admin page for Twenty CRM integration and multisite sync control.
 */
class NetworkSyncPage {

	/**
	 * Initialize the network admin page
	 *
	 * @return void
	 */
	public static function init() {
		if ( ! is_multisite() ) {
			return;
		}

		add_action( 'network_admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
	}

	/**
	 * Register network admin menu
	 *
	 * @return void
	 */
	public static function register_menu() {
		add_menu_page(
			__( 'User Sync Control', 'frs-users' ),
			__( 'User Sync', 'frs-users' ),
			'manage_network_options',
			'frs-network-sync',
			array( __CLASS__, 'render' ),
			'dashicons-admin-multisite',
			30
		);
	}

	/**
	 * Enqueue assets for the network admin page
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public static function enqueue_assets( $hook ) {
		// Only load on our network admin page
		if ( 'toplevel_page_frs-network-sync' !== $hook ) {
			return;
		}

		$asset_file = FRS_USERS_DIR . 'assets/admin/build/network-sync.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			// Fallback if not built yet
			wp_enqueue_style( 'wp-components' );
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'frs-network-sync',
			FRS_USERS_URL . 'assets/admin/build/network-sync.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'frs-network-sync',
			FRS_USERS_URL . 'assets/admin/build/network-sync.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// Get all sites in the network
		$sites = get_sites( array(
			'number' => 0,
			'fields' => 'ids',
		) );

		$sites_data = array();
		foreach ( $sites as $site_id ) {
			$details = get_blog_details( $site_id );
			if ( $details ) {
				switch_to_blog( $site_id );
				$sites_data[] = array(
					'id'           => $site_id,
					'name'         => $details->blogname,
					'url'          => $details->siteurl,
					'path'         => $details->path,
					'sync_enabled' => (bool) get_option( 'frs_twenty_crm_enabled', false ),
					'user_count'   => count_users()['total_users'] ?? 0,
				);
				restore_current_blog();
			}
		}

		// Localize script with network data
		wp_localize_script(
			'frs-network-sync',
			'frsNetworkSync',
			array(
				'nonce'        => wp_create_nonce( 'wp_rest' ),
				'restUrl'      => rest_url(),
				'networkUrl'   => network_admin_url(),
				'sites'        => $sites_data,
				'mainSiteId'   => get_main_site_id(),
				'twentyCRM'    => array(
					'enabled'    => (bool) get_site_option( 'frs_twenty_crm_network_enabled', false ),
					'api_url'    => get_site_option( 'frs_twenty_crm_url', 'https://data.c21frs.com' ),
					'api_key'    => get_site_option( 'frs_twenty_crm_api_key', '' ),
					'sync_roles' => get_site_option( 'frs_twenty_crm_sync_roles', array( 'loan_originator' ) ),
				),
				'availableRoles' => \FRSUsers\Core\Roles::get_company_roles(),
			)
		);
	}

	/**
	 * Render the network admin page
	 *
	 * @return void
	 */
	public static function render() {
		if ( ! current_user_can( 'manage_network_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Network User Sync Control', 'frs-users' ); ?></h1>
			<div id="frs-network-sync-root">
				<p><?php esc_html_e( 'Loading...', 'frs-users' ); ?></p>
			</div>
		</div>
		<?php
	}
}
