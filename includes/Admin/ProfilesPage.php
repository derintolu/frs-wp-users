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
use FRSUsers\Traits\Base;
use FRSUsers\Admin\ProfileImportExport;

/**
 * Class ProfilesPage
 *
 * Manages the profiles admin page routing.
 *
 * @package FRSUsers\Admin
 */
class ProfilesPage {
	use Base;

	/**
	 * Initialize
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_menu_pages' ) );
		add_action( 'admin_post_frs_delete_profile', array( $this, 'handle_delete' ) );
		add_action( 'admin_post_frs_archive_profile', array( $this, 'handle_archive' ) );
		add_action( 'admin_post_frs_unarchive_profile', array( $this, 'handle_unarchive' ) );
		add_action( 'wp_ajax_frs_create_user_account', array( $this, 'ajax_create_user_account' ) );

		// Process bulk actions early, before any output
		add_action( 'admin_init', array( $this, 'handle_bulk_actions' ) );
	}

	/**
	 * Add admin menu pages
	 *
	 * @return void
	 */
	public function add_menu_pages() {
		// Main menu
		add_menu_page(
			__( 'FRS Profiles', 'frs-users' ),
			__( 'FRS Profiles', 'frs-users' ),
			'edit_users',
			'frs-profiles',
			array( $this, 'render_list_page' ),
			'dashicons-groups',
			30
		);

		// List page (duplicate of main for submenu)
		add_submenu_page(
			'frs-profiles',
			__( 'All Profiles', 'frs-users' ),
			__( 'All Profiles', 'frs-users' ),
			'edit_users',
			'frs-profiles',
			array( $this, 'render_list_page' )
		);

		// Add New (uses edit page with no ID)
		add_submenu_page(
			'frs-profiles',
			__( 'Add New Profile', 'frs-users' ),
			__( 'Add New', 'frs-users' ),
			'edit_users',
			'frs-profile-edit',
			array( $this, 'render_edit_page' )
		);

		// View page (hidden from menu)
		add_submenu_page(
			null,
			__( 'View Profile', 'frs-users' ),
			__( 'View Profile', 'frs-users' ),
			'edit_users',
			'frs-profile-view',
			array( $this, 'render_view_page' )
		);

		// Merge page (hidden from menu)
		add_submenu_page(
			null,
			__( 'Merge Profiles', 'frs-users' ),
			__( 'Merge Profiles', 'frs-users' ),
			'edit_users',
			'frs-profile-merge',
			array( $this, 'render_merge_page' )
		);

		// Merge selection page (hidden from menu)
		add_submenu_page(
			null,
			__( 'Select Profile to Merge', 'frs-users' ),
			__( 'Select Profile to Merge', 'frs-users' ),
			'edit_users',
			'frs-profile-merge-select',
			array( $this, 'render_merge_select_page' )
		);

		// Import/Export page
		add_submenu_page(
			'frs-profiles',
			__( 'Import / Export', 'frs-users' ),
			__( 'Import / Export', 'frs-users' ),
			'edit_users',
			'frs-profile-import-export',
			array( $this, 'render_import_export_page' )
		);
	}

	/**
	 * Handle bulk actions early (before any output)
	 *
	 * @return void
	 */
	public function handle_bulk_actions() {
		// Only process on our page
		if ( ! isset( $_GET['page'] ) || $_GET['page'] !== 'frs-profiles' ) {
			return;
		}

		// Only process POST requests
		if ( $_SERVER['REQUEST_METHOD'] !== 'POST' ) {
			return;
		}

		// Check if bulk action is set
		$action = isset( $_POST['action'] ) && $_POST['action'] !== '-1' ? $_POST['action'] : '';
		if ( empty( $action ) ) {
			$action = isset( $_POST['action2'] ) && $_POST['action2'] !== '-1' ? $_POST['action2'] : '';
		}

		if ( empty( $action ) ) {
			return;
		}

		// Handle bulk_generate_pages
		if ( $action === 'bulk_generate_pages' ) {
			// Check nonce
			check_admin_referer( 'bulk-profiles' );

			if ( ! isset( $_POST['profile'] ) || ! is_array( $_POST['profile'] ) ) {
				wp_redirect( add_query_arg( 'message', 'no_profiles_selected', admin_url( 'admin.php?page=frs-profiles' ) ) );
				exit;
			}

			$profile_ids = array_map( 'absint', $_POST['profile'] );
			$stats       = $this->generate_pages_for_profiles( $profile_ids, false );

			wp_redirect(
				add_query_arg(
					array(
						'message'      => 'pages_generated',
						'pages_created' => $stats['created'],
						'pages_skipped' => $stats['skipped'],
						'pages_failed'  => $stats['failed'],
					),
					admin_url( 'admin.php?page=frs-profiles' )
				)
			);
			exit;
		}

		// Handle bulk_regenerate_pages
		if ( $action === 'bulk_regenerate_pages' ) {
			// Check nonce
			check_admin_referer( 'bulk-profiles' );

			if ( ! isset( $_POST['profile'] ) || ! is_array( $_POST['profile'] ) ) {
				wp_redirect( add_query_arg( 'message', 'no_profiles_selected', admin_url( 'admin.php?page=frs-profiles' ) ) );
				exit;
			}

			$profile_ids = array_map( 'absint', $_POST['profile'] );
			$stats       = $this->generate_pages_for_profiles( $profile_ids, true );

			wp_redirect(
				add_query_arg(
					array(
						'message'      => 'pages_regenerated',
						'pages_created' => $stats['created'],
						'pages_skipped' => $stats['skipped'],
						'pages_failed'  => $stats['failed'],
					),
					admin_url( 'admin.php?page=frs-profiles' )
				)
			);
			exit;
		}

		// Handle bulk_merge specifically
		if ( $action === 'bulk_merge' ) {
			// Check nonce
			check_admin_referer( 'bulk-profiles' );

			if ( ! isset( $_POST['profile'] ) || ! is_array( $_POST['profile'] ) ) {
				return;
			}

			$profile_ids = array_map( 'absint', $_POST['profile'] );

			if ( count( $profile_ids ) < 2 ) {
				wp_redirect( add_query_arg( 'error', 'merge_min_2', admin_url( 'admin.php?page=frs-profiles' ) ) );
				exit;
			}

			// Redirect to merge page
			wp_safe_redirect(
				add_query_arg(
					array(
						'page'        => 'frs-profile-merge',
						'profile_ids' => implode( ',', $profile_ids ),
					),
					admin_url( 'admin.php' )
				)
			);
			exit;
		}
	}

	/**
	 * Generate profile pages for selected profiles.
	 *
	 * @param array $profile_ids Array of profile IDs.
	 * @param bool  $force_regenerate Whether to force regeneration (delete existing first).
	 * @return array Stats array with created, skipped, failed counts.
	 */
	private function generate_pages_for_profiles( $profile_ids, $force_regenerate = false ) {
		$stats = array(
			'created' => 0,
			'skipped' => 0,
			'failed'  => 0,
		);

		if ( ! class_exists( 'FRSUsers\\Models\\Profile' ) || ! class_exists( 'FRSUsers\\Controllers\\PostTypes' ) ) {
			return $stats;
		}

		$post_types = \FRSUsers\Controllers\PostTypes::get_instance();

		foreach ( $profile_ids as $profile_id ) {
			$profile = \FRSUsers\Models\Profile::find( $profile_id );

			if ( ! $profile ) {
				$stats['failed']++;
				continue;
			}

			// Check if pages already exist
			$existing_pages = get_posts(
				array(
					'post_type'   => 'frs_user_profile',
					'post_status' => 'any',
					'numberposts' => -1,
					'meta_query'  => array(
						array(
							'key'   => '_profile_id',
							'value' => $profile_id,
						),
					),
				)
			);

			// If regenerating, delete existing pages first
			if ( $force_regenerate && ! empty( $existing_pages ) ) {
				foreach ( $existing_pages as $page ) {
					wp_delete_post( $page->ID, true );
				}
				$existing_pages = array();
			}

			// Skip if pages already exist and not forcing regeneration
			if ( ! empty( $existing_pages ) && ! $force_regenerate ) {
				$stats['skipped']++;
				continue;
			}

			// Use reflection to call private method
			try {
				$method = new \ReflectionMethod( $post_types, 'generate_profile_pages_for_profile' );
				$method->setAccessible( true );
				$method->invoke( $post_types, $profile_id, $profile->full_name );
				$stats['created']++;
			} catch ( \Exception $e ) {
				error_log( 'FRS Users: Failed to generate pages for profile ' . $profile_id . ': ' . $e->getMessage() );
				$stats['failed']++;
			}
		}

		return $stats;
	}

	/**
	 * Render profiles list page
	 *
	 * @return void
	 */
	public function render_list_page() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		// Create list table instance
		$list_table = new ProfilesList();
		$list_table->prepare_items();

		// Load template
		include FRS_USERS_DIR . 'views/admin/profiles-list.php';
	}

	/**
	 * Render profile view page
	 *
	 * @return void
	 */
	public function render_view_page() {
		$profile_id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

		if ( ! $profile_id ) {
			wp_die( esc_html__( 'Invalid profile ID.', 'frs-users' ) );
		}

		ProfileView::render( $profile_id );
	}

	/**
	 * Render profile edit/add page
	 *
	 * @return void
	 */
	public function render_edit_page() {
		$profile_id = isset( $_GET['id'] ) ? $_GET['id'] : null;

		// Convert 'new' string to null
		if ( 'new' === $profile_id ) {
			$profile_id = null;
		}

		ProfileEdit::render( $profile_id );
	}

	/**
	 * Render profile merge page
	 *
	 * @return void
	 */
	public function render_merge_page() {
		error_log( 'ProfilesPage::render_merge_page() called' );
		error_log( 'Current user can edit_users: ' . ( current_user_can( 'edit_users' ) ? 'YES' : 'NO' ) );
		ProfileMerge::render();
	}

	/**
	 * Render profile merge selection page
	 *
	 * @return void
	 */
	public function render_merge_select_page() {
		ProfileMergeSelect::render();
	}

	/**
	 * Render import/export page
	 *
	 * @return void
	 */
	public function render_import_export_page() {
		ProfileImportExport::render();
	}

	/**
	 * Handle profile deletion
	 *
	 * @return void
	 */
	public function handle_delete() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to perform this action.', 'frs-users' ) );
		}

		// Get profile ID
		$profile_id = isset( $_GET['profile_id'] ) ? absint( $_GET['profile_id'] ) : 0;

		if ( ! $profile_id ) {
			wp_die( esc_html__( 'Invalid profile ID.', 'frs-users' ) );
		}

		// Verify nonce
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'delete_profile_' . $profile_id ) ) {
			wp_die( esc_html__( 'Security check failed.', 'frs-users' ) );
		}

		// Delete profile
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
		}

		try {
			$profile->delete();

			// Redirect with success message
			wp_safe_redirect(
				add_query_arg(
					array(
						'page'    => 'frs-profiles',
						'message' => 'deleted',
					),
					admin_url( 'admin.php' )
				)
			);
			exit;

		} catch ( \Exception $e ) {
			wp_die( esc_html__( 'Error deleting profile.', 'frs-users' ) );
		}
	}

	/**
	 * Handle profile archiving
	 *
	 * @return void
	 */
	public function handle_archive() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to perform this action.', 'frs-users' ) );
		}

		// Get profile ID
		$profile_id = isset( $_GET['profile_id'] ) ? absint( $_GET['profile_id'] ) : 0;

		if ( ! $profile_id ) {
			wp_die( esc_html__( 'Invalid profile ID.', 'frs-users' ) );
		}

		// Verify nonce
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'archive_profile_' . $profile_id ) ) {
			wp_die( esc_html__( 'Security check failed.', 'frs-users' ) );
		}

		// Archive profile
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
		}

		$profile->is_active = 0;
		$profile->save();

		// Redirect with success message
		wp_safe_redirect(
			add_query_arg(
				array(
					'page'    => 'frs-profiles',
					'message' => 'archived',
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * Handle profile unarchiving
	 *
	 * @return void
	 */
	public function handle_unarchive() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to perform this action.', 'frs-users' ) );
		}

		// Get profile ID
		$profile_id = isset( $_GET['profile_id'] ) ? absint( $_GET['profile_id'] ) : 0;

		if ( ! $profile_id ) {
			wp_die( esc_html__( 'Invalid profile ID.', 'frs-users' ) );
		}

		// Verify nonce
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'unarchive_profile_' . $profile_id ) ) {
			wp_die( esc_html__( 'Security check failed.', 'frs-users' ) );
		}

		// Unarchive profile
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
		}

		$profile->is_active = 1;
		$profile->save();

		// Redirect with success message
		wp_safe_redirect(
			add_query_arg(
				array(
					'page'    => 'frs-profiles',
					'message' => 'unarchived',
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * AJAX handler for creating user account
	 *
	 * @return void
	 */
	public function ajax_create_user_account() {
		// Verify nonce
		if ( ! isset( $_POST['nonce'] ) || ! isset( $_POST['profile_id'] ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid request', 'frs-users' ) ) );
		}

		$profile_id = absint( $_POST['profile_id'] );
		check_ajax_referer( 'create_user_' . $profile_id, 'nonce' );

		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied', 'frs-users' ) ) );
		}

		// Get profile
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_send_json_error( array( 'message' => __( 'Profile not found', 'frs-users' ) ) );
		}

		if ( ! $profile->is_guest() ) {
			wp_send_json_error( array( 'message' => __( 'Profile is already linked to a user account', 'frs-users' ) ) );
		}

		// Validate required fields for user creation
		if ( empty( $profile->first_name ) ) {
			wp_send_json_error( array( 'message' => __( 'Profile is missing first name', 'frs-users' ) ) );
		}

		if ( empty( $profile->last_name ) ) {
			wp_send_json_error( array( 'message' => __( 'Profile is missing last name', 'frs-users' ) ) );
		}

		if ( empty( $profile->email ) ) {
			wp_send_json_error( array( 'message' => __( 'Profile is missing email', 'frs-users' ) ) );
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

		// Add profile type as role
		if ( ! empty( $profile->select_person_type ) ) {
			$user = new \WP_User( $user_id );
			$user->add_role( $profile->select_person_type );
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
