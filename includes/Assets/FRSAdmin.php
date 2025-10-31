<?php
/**
 * FRS Admin Assets
 *
 * Handles asset loading for the FRS Profiles admin interface.
 *
 * @package FRSUsers
 * @subpackage Assets
 * @since 1.0.0
 */

namespace FRSUsers\Assets;

use FRSUsers\Traits\Base;

/**
 * Class FRSAdmin
 *
 * Loads React admin app assets for FRS profile pages.
 *
 * @package FRSUsers\Assets
 */
class FRSAdmin {

	use Base;

	/**
	 * Script handle for FRS admin.
	 */
	const HANDLE = 'frs-users-admin';

	/**
	 * JS Object name for FRS admin.
	 */
	const OBJ_NAME = 'frsUsersAdmin';

	/**
	 * List of allowed screens for script enqueue.
	 *
	 * @var array
	 */
	private $allowed_screens = array(
		'toplevel_page_frs-users-profiles',
		'frs-users_page_frs-users-guests',
		'frs-users_page_frs-users-add-profile',
	);

	/**
	 * Initialize admin assets.
	 *
	 * @return void
	 */
	public function init() {
		error_log( 'FRSAdmin: init() called' );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public function enqueue_assets( $hook ) {
		// Debug: Log the hook
		error_log( 'FRSAdmin: Hook = ' . $hook );

		// Only load on FRS profile pages
		if ( strpos( $hook, 'frs-users' ) === false ) {
			error_log( 'FRSAdmin: Hook does not contain frs-users, skipping' );
			return;
		}

		error_log( 'FRSAdmin: Loading assets' );
		$this->enqueue_vite_assets();
		$this->localize_script();
	}

	/**
	 * Enqueue Vite-built assets.
	 *
	 * @return void
	 */
	private function enqueue_vite_assets() {
		$assets_dir = FRS_USERS_DIR . 'assets/admin/dist';
		$assets_url = FRS_USERS_URL . 'assets/admin/dist';

		// Production mode - load built assets
		$manifest_path = $assets_dir . '/manifest.json';

		if ( file_exists( $manifest_path ) ) {
			$manifest = json_decode( file_get_contents( $manifest_path ), true );

			// Enqueue main JS
			if ( isset( $manifest['src/admin/main.jsx'] ) ) {
				$main_js = $manifest['src/admin/main.jsx'];

				wp_enqueue_script(
					self::HANDLE,
					$assets_url . '/' . $main_js['file'],
					array(),
					FRS_USERS_VERSION,
					true
				);
				wp_script_add_data( self::HANDLE, 'type', 'module' );

				// Enqueue CSS if exists
				if ( isset( $main_js['css'] ) && is_array( $main_js['css'] ) ) {
					foreach ( $main_js['css'] as $index => $css_file ) {
						wp_enqueue_style(
							self::HANDLE . '-css-' . $index,
							$assets_url . '/' . $css_file,
							array(),
							FRS_USERS_VERSION
						);
					}
				}
			}
		}
	}

	/**
	 * Localize script with data.
	 *
	 * @return void
	 */
	private function localize_script() {
		wp_localize_script(
			self::HANDLE,
			self::OBJ_NAME,
			array(
				'apiUrl'       => rest_url( 'frs-users/v1' ),
				'baseUrl'      => admin_url( 'admin.php?page=frs-users-profiles' ),
				'nonce'        => wp_create_nonce( 'wp_rest' ),
				'isAdmin'      => is_admin(),
				'currentUser'  => $this->get_current_user_data(),
				'strings'      => array(
					'confirmDelete' => __( 'Are you sure you want to delete this profile?', 'frs-users' ),
					'deleteSuccess' => __( 'Profile deleted successfully', 'frs-users' ),
					'deleteError'   => __( 'Failed to delete profile', 'frs-users' ),
					'saveSuccess'   => __( 'Profile saved successfully', 'frs-users' ),
					'saveError'     => __( 'Failed to save profile', 'frs-users' ),
				),
			)
		);
	}

	/**
	 * Get current user data.
	 *
	 * @return array
	 */
	private function get_current_user_data() {
		if ( ! is_user_logged_in() ) {
			return array();
		}

		$current_user = wp_get_current_user();

		return array(
			'id'       => $current_user->ID,
			'username' => $current_user->user_login,
			'email'    => $current_user->user_email,
			'name'     => $current_user->display_name,
			'avatar'   => get_avatar_url( $current_user->ID ),
		);
	}

}
