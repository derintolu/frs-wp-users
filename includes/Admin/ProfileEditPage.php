<?php
/**
 * FRS Profile Edit Page
 *
 * Gutenberg-style profile editor using @wordpress/components.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

/**
 * Class ProfileEditPage
 *
 * Registers and renders the FRS Profile Edit page.
 *
 * @package FRSUsers\Admin
 */
class ProfileEditPage {

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
	 * Add admin menu page (hidden - not visible in menu).
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		// Use empty string for parent to hide from menu
		add_submenu_page(
			'',
			__( 'Edit Profile', 'frs-users' ),
			__( 'Edit Profile', 'frs-users' ),
			'edit_users',
			'frs-profile-edit',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the admin page.
	 *
	 * @return void
	 */
	public function render_page() {
		$user_id = isset( $_GET['user_id'] ) ? absint( $_GET['user_id'] ) : 0;

		if ( ! $user_id ) {
			wp_die( __( 'Invalid user ID.', 'frs-users' ) );
		}

		// Check permissions
		if ( ! current_user_can( 'edit_user', $user_id ) ) {
			wp_die( __( 'You do not have permission to edit this user.', 'frs-users' ) );
		}
		?>
		<div class="wrap">
			<div id="frs-profile-edit-root"></div>
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
		if ( strpos( $hook, 'frs-profile-edit' ) === false ) {
			return;
		}

		$user_id = isset( $_GET['user_id'] ) ? absint( $_GET['user_id'] ) : 0;
		if ( ! $user_id ) {
			return;
		}

		// Check if built assets exist
		$asset_file = FRS_USERS_DIR . 'assets/admin/build/profile-edit.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			add_action( 'admin_notices', function() {
				?>
				<div class="notice notice-error">
					<p><?php esc_html_e( 'FRS Profile Edit assets not built. Run: npm run build', 'frs-users' ); ?></p>
				</div>
				<?php
			} );
			return;
		}

		$asset = include $asset_file;

		// Enqueue media for image uploads
		wp_enqueue_media();

		// Enqueue the profile edit app
		wp_enqueue_script(
			'frs-profile-edit',
			FRS_USERS_URL . 'assets/admin/build/profile-edit.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'frs-profile-edit',
			FRS_USERS_URL . 'assets/admin/build/profile-edit.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// Get profile data
		$profile = $this->get_profile_data( $user_id );

		// Localize script with data
		wp_localize_script(
			'frs-profile-edit',
			'frsProfileEdit',
			array(
				'apiUrl'      => rest_url( 'frs-users/v1' ),
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'userId'      => $user_id,
				'profile'     => $profile,
				'roles'       => $this->get_frs_roles(),
				'listUrl'     => admin_url( 'admin.php?page=frs-profiles' ),
				'states'      => $this->get_us_states(),
			)
		);
	}

	/**
	 * Get profile data for a user.
	 *
	 * @param int $user_id User ID.
	 * @return array
	 */
	protected function get_profile_data( $user_id ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return array();
		}

		$profile = Profile::hydrate_from_user( $user );

		return array(
			'user_id'            => $user_id,
			'email'              => $user->user_email,
			'display_name'       => $user->display_name,
			'first_name'         => $profile->first_name,
			'last_name'          => $profile->last_name,
			'phone_number'       => $profile->phone_number,
			'mobile_number'      => $profile->mobile_number,
			'office'             => $profile->office,
			'job_title'          => $profile->job_title,
			'nmls'               => $profile->nmls,
			'dre_license'        => $profile->dre_license,
			'biography'          => $profile->biography,
			'headshot_id'        => $profile->headshot_id,
			'headshot_url'       => $profile->headshot_id ? wp_get_attachment_image_url( $profile->headshot_id, 'thumbnail' ) : '',
			'city_state'         => $profile->city_state,
			'region'             => $profile->region,
			'service_areas'      => $profile->service_areas ?: array(),
			'linkedin_url'       => $profile->linkedin_url,
			'facebook_url'       => $profile->facebook_url,
			'instagram_url'      => $profile->instagram_url,
			'twitter_url'        => $profile->twitter_url,
			'youtube_url'        => $profile->youtube_url,
			'tiktok_url'         => $profile->tiktok_url,
			'is_active'          => (bool) $profile->is_active,
			'select_person_type' => $profile->select_person_type,
			'profile_slug'       => $profile->profile_slug,
			'arrive'             => $profile->arrive,
			'specialties'        => $profile->specialties ?: array(),
			'languages'          => $profile->languages ?: array(),
			'avatar_url'         => get_avatar_url( $user_id, array( 'size' => 96 ) ),
		);
	}

	/**
	 * Get FRS roles configuration.
	 *
	 * @return array
	 */
	protected function get_frs_roles() {
		return array(
			'loan_officer' => __( 'Loan Officer', 'frs-users' ),
			'realtor_partner' => __( 'Realtor Partner', 'frs-users' ),
			'staff' => __( 'Staff', 'frs-users' ),
			'leadership' => __( 'Leadership', 'frs-users' ),
			'assistant' => __( 'Assistant', 'frs-users' ),
		);
	}

	/**
	 * Get US states list.
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
