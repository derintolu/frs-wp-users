<?php
/**
 * Profiles Admin Page
 *
 * Handles the profiles management admin page.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;

/**
 * Class ProfilesPage
 *
 * Manages the profiles admin page and AJAX handlers.
 *
 * @package FRSUsers\Admin
 */
class ProfilesPage {

	/**
	 * Initialize the profiles page
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_scripts' ) );
		add_action( 'wp_ajax_frs_create_user_account', array( __CLASS__, 'ajax_create_user_account' ) );
	}

	/**
	 * Add admin menu page
	 *
	 * @return void
	 */
	public static function add_menu_page() {
		add_menu_page(
			__( 'FRS Profiles', 'frs-users' ),
			__( 'FRS Profiles', 'frs-users' ),
			'edit_users',
			'frs-users-profiles',
			array( __CLASS__, 'render_page' ),
			'dashicons-groups',
			30
		);

		add_submenu_page(
			'frs-users-profiles',
			__( 'All Profiles', 'frs-users' ),
			__( 'All Profiles', 'frs-users' ),
			'edit_users',
			'frs-users-profiles',
			array( __CLASS__, 'render_page' )
		);

		add_submenu_page(
			'frs-users-profiles',
			__( 'Profile Only', 'frs-users' ),
			__( 'Profile Only', 'frs-users' ),
			'edit_users',
			'frs-users-guests',
			array( __CLASS__, 'render_guests_page' )
		);

		add_submenu_page(
			'frs-users-profiles',
			__( 'Add New Profile', 'frs-users' ),
			__( 'Add New', 'frs-users' ),
			'edit_users',
			'frs-users-add-profile',
			array( __CLASS__, 'render_add_page' )
		);
	}

	/**
	 * Enqueue admin scripts
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public static function enqueue_scripts( $hook ) {
		if ( strpos( $hook, 'frs-users' ) === false ) {
			return;
		}

		wp_enqueue_style( 'frs-users-admin', plugins_url( 'assets/admin.css', FRS_USERS_PLUGIN_FILE ), array(), FRS_USERS_VERSION );
		wp_enqueue_script( 'frs-users-admin', plugins_url( 'assets/admin.js', FRS_USERS_PLUGIN_FILE ), array( 'jquery' ), FRS_USERS_VERSION, true );

		wp_localize_script(
			'frs-users-admin',
			'frsUsersAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'strings' => array(
					'confirmCreate'  => __( 'Are you sure you want to create a user account for this profile?', 'frs-users' ),
					'creating'       => __( 'Creating user account...', 'frs-users' ),
					'success'        => __( 'User account created successfully!', 'frs-users' ),
					'error'          => __( 'Failed to create user account.', 'frs-users' ),
					'confirmDelete'  => __( 'Are you sure you want to delete this profile?', 'frs-users' ),
				),
			)
		);
	}

	/**
	 * Render the main profiles page
	 *
	 * @return void
	 */
	public static function render_page() {
		$action = isset( $_GET['action'] ) ? sanitize_text_field( $_GET['action'] ) : '';
		$profile_id = isset( $_GET['profile_id'] ) ? absint( $_GET['profile_id'] ) : 0;

		// Handle view action
		if ( $action === 'view' && $profile_id ) {
			ProfileView::render( $profile_id );
			return;
		}

		// Handle edit action
		if ( $action === 'edit' && $profile_id ) {
			ProfileEdit::render_edit_page( $profile_id );
			return;
		}

		// Handle delete action
		if ( $action === 'delete' && $profile_id ) {
			if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'delete_profile_' . $profile_id ) ) {
				wp_die( __( 'Security check failed', 'frs-users' ) );
			}

			$profile = Profile::find( $profile_id );
			if ( $profile ) {
				$profile->delete();
				wp_redirect( add_query_arg( 'deleted', '1', admin_url( 'admin.php?page=frs-users-profiles' ) ) );
				exit;
			}
		}

		$list_table = new ProfilesList();
		$list_table->prepare_items();
		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php _e( 'Profiles', 'frs-users' ); ?></h1>
			<a href="<?php echo admin_url( 'admin.php?page=frs-users-add-profile' ); ?>" class="page-title-action">
				<?php _e( 'Add New', 'frs-users' ); ?>
			</a>
			<hr class="wp-header-end">

			<?php if ( isset( $_GET['deleted'] ) ) : ?>
				<div class="notice notice-success is-dismissible">
					<p><?php _e( 'Profile deleted successfully.', 'frs-users' ); ?></p>
				</div>
			<?php endif; ?>

			<?php settings_errors( 'frs-users' ); ?>

			<form method="get">
				<input type="hidden" name="page" value="frs-users-profiles" />
				<?php $list_table->display(); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render guest profiles page
	 *
	 * @return void
	 */
	public static function render_guests_page() {
		// Automatically filter to guests only
		$_GET['guests_only'] = true;

		$list_table = new ProfilesList();
		$list_table->prepare_items();
		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php _e( 'Profile Only', 'frs-users' ); ?></h1>
			<a href="<?php echo admin_url( 'admin.php?page=frs-users-add-profile' ); ?>" class="page-title-action">
				<?php _e( 'Add New', 'frs-users' ); ?>
			</a>
			<hr class="wp-header-end">

			<div class="notice notice-info inline">
				<p>
					<?php _e( 'Profile Only are profiles without WordPress user accounts. Use the "Create User Account" button to upgrade them to Profile+.', 'frs-users' ); ?>
				</p>
			</div>

			<form method="get">
				<input type="hidden" name="page" value="frs-users-guests" />
				<input type="hidden" name="guests_only" value="1" />
				<?php $list_table->display(); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render add profile page
	 *
	 * @return void
	 */
	public static function render_add_page() {
		ProfileEdit::render_edit_page( 0 );
	}

	/**
	 * AJAX handler for creating user account
	 *
	 * @return void
	 */
	public static function ajax_create_user_account() {
		check_ajax_referer( 'create_user_' . $_POST['profile_id'], 'nonce' );

		if ( ! current_user_can( 'edit_users' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied', 'frs-users' ) ) );
		}

		$profile_id = isset( $_POST['profile_id'] ) ? absint( $_POST['profile_id'] ) : 0;

		if ( ! $profile_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid profile ID', 'frs-users' ) ) );
		}

		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_send_json_error( array( 'message' => __( 'Profile not found', 'frs-users' ) ) );
		}

		if ( ! $profile->is_guest() ) {
			wp_send_json_error( array( 'message' => __( 'Profile is already linked to a user account', 'frs-users' ) ) );
		}

		// Generate username
		$username = sanitize_user( strtolower( $profile->first_name . '.' . $profile->last_name ) );
		$username = str_replace( ' ', '', $username );

		if ( username_exists( $username ) ) {
			$username = $username . wp_rand( 1, 999 );
		}

		// Create user
		$user_data = array(
			'user_login' => $username,
			'user_email' => $profile->email,
			'first_name' => $profile->first_name,
			'last_name'  => $profile->last_name,
			'role'       => 'subscriber',
		);

		$user_id = wp_insert_user( $user_data );

		if ( is_wp_error( $user_id ) ) {
			wp_send_json_error( array( 'message' => $user_id->get_error_message() ) );
		}

		// Add profile types as roles
		$profile_types = $profile->get_types();
		$user = new \WP_User( $user_id );
		foreach ( $profile_types as $type ) {
			$user->add_role( $type );
		}

		// Link profile
		$profile->link_user( $user_id );

		// Send email
		wp_send_new_user_notifications( $user_id, 'user' );

		wp_send_json_success(
			array(
				'message'  => __( 'User account created successfully!', 'frs-users' ),
				'user_id'  => $user_id,
				'username' => $username,
			)
		);
	}
}
