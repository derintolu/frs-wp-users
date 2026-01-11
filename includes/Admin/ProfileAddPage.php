<?php
/**
 * FRS Profile Add Page
 *
 * Gutenberg-style page for adding new profiles.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Core\Roles;
use FRSUsers\Traits\Base;

/**
 * Class ProfileAddPage
 */
class ProfileAddPage {

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
	 * Add admin menu page (hidden submenu).
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'frs-profiles',
			__( 'Add New Profile', 'frs-users' ),
			__( 'Add New', 'frs-users' ),
			'edit_users',
			'frs-profile-add',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the admin page.
	 *
	 * @return void
	 */
	public function render_page() {
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( __( 'You do not have permission to add users.', 'frs-users' ) );
		}
		?>
		<div class="wrap">
			<div id="frs-profile-add-root"></div>
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
		if ( strpos( $hook, 'frs-profile-add' ) === false ) {
			return;
		}

		$asset_file = FRS_USERS_DIR . 'assets/admin/build/profile-add.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			add_action( 'admin_notices', function() {
				?>
				<div class="notice notice-error">
					<p><?php esc_html_e( 'FRS Profile Add assets not built. Run: npm run build', 'frs-users' ); ?></p>
				</div>
				<?php
			} );
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'frs-profile-add',
			FRS_USERS_URL . 'assets/admin/build/profile-add.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'frs-profile-add',
			FRS_USERS_URL . 'assets/admin/build/profile-add.css',
			array( 'wp-components' ),
			$asset['version']
		);

		wp_localize_script(
			'frs-profile-add',
			'frsProfileAdd',
			array(
				'apiUrl'         => rest_url( 'frs-users/v1' ),
				'nonce'          => wp_create_nonce( 'wp_rest' ),
				'roles'          => $this->get_frs_roles(),
				'listUrl'        => admin_url( 'admin.php?page=frs-profiles' ),
				'profileEditUrl' => admin_url( 'admin.php?page=frs-profile-edit&user_id=' ),
				'states'         => $this->get_us_states(),
			)
		);
	}

	/**
	 * Get FRS roles.
	 *
	 * @return array
	 */
	protected function get_frs_roles() {
		return Roles::get_company_roles();
	}

	/**
	 * Get US states.
	 *
	 * @return array
	 */
	protected function get_us_states() {
		return array(
			'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas',
			'CA' => 'California', 'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware',
			'FL' => 'Florida', 'GA' => 'Georgia', 'HI' => 'Hawaii', 'ID' => 'Idaho',
			'IL' => 'Illinois', 'IN' => 'Indiana', 'IA' => 'Iowa', 'KS' => 'Kansas',
			'KY' => 'Kentucky', 'LA' => 'Louisiana', 'ME' => 'Maine', 'MD' => 'Maryland',
			'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota', 'MS' => 'Mississippi',
			'MO' => 'Missouri', 'MT' => 'Montana', 'NE' => 'Nebraska', 'NV' => 'Nevada',
			'NH' => 'New Hampshire', 'NJ' => 'New Jersey', 'NM' => 'New Mexico', 'NY' => 'New York',
			'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio', 'OK' => 'Oklahoma',
			'OR' => 'Oregon', 'PA' => 'Pennsylvania', 'RI' => 'Rhode Island', 'SC' => 'South Carolina',
			'SD' => 'South Dakota', 'TN' => 'Tennessee', 'TX' => 'Texas', 'UT' => 'Utah',
			'VT' => 'Vermont', 'VA' => 'Virginia', 'WA' => 'Washington', 'WV' => 'West Virginia',
			'WI' => 'Wisconsin', 'WY' => 'Wyoming', 'DC' => 'District of Columbia',
		);
	}
}
