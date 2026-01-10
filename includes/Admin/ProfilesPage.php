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
		// Add menu to both site admin and network admin
		add_action( 'admin_menu', array( $this, 'add_menu_pages' ) );
		add_action( 'network_admin_menu', array( $this, 'add_network_menu_pages' ) );

		add_action( 'admin_post_frs_delete_profile', array( $this, 'handle_delete' ) );
		add_action( 'admin_post_frs_archive_profile', array( $this, 'handle_archive' ) );
		add_action( 'admin_post_frs_unarchive_profile', array( $this, 'handle_unarchive' ) );
		add_action( 'wp_ajax_frs_create_user_account', array( $this, 'ajax_create_user_account' ) );

		// Process bulk actions early, before any output
		add_action( 'admin_init', array( $this, 'handle_bulk_actions' ) );
	}

	/**
	 * Add network admin menu pages
	 *
	 * In multisite, profiles are managed network-wide from Network Admin.
	 *
	 * @return void
	 */
	public function add_network_menu_pages() {
		// Main network menu under Users
		add_submenu_page(
			'users.php',
			__( 'FRS Profiles', 'frs-users' ),
			__( 'FRS Profiles', 'frs-users' ),
			'manage_network_users',
			'frs-profiles',
			array( $this, 'render_list_page' )
		);

		// Also add as top-level menu for visibility
		add_menu_page(
			__( 'FRS Profiles', 'frs-users' ),
			__( 'FRS Profiles', 'frs-users' ),
			'manage_network_users',
			'frs-network-profiles',
			array( $this, 'render_list_page' ),
			'dashicons-groups',
			6
		);

		// Submenus under top-level
		add_submenu_page(
			'frs-network-profiles',
			__( 'All Profiles', 'frs-users' ),
			__( 'All Profiles', 'frs-users' ),
			'manage_network_users',
			'frs-network-profiles',
			array( $this, 'render_list_page' )
		);

		add_submenu_page(
			'frs-network-profiles',
			__( 'Add New Profile', 'frs-users' ),
			__( 'Add New', 'frs-users' ),
			'manage_network_users',
			'frs-network-profile-edit',
			array( $this, 'render_edit_page' )
		);
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

		// View page (hidden from menu - use empty string for PHP 8.1+ compatibility)
		add_submenu_page(
			'',
			__( 'View Profile', 'frs-users' ),
			__( 'View Profile', 'frs-users' ),
			'edit_users',
			'frs-profile-view',
			array( $this, 'render_view_page' )
		);

		// Merge page (hidden from menu - use empty string for PHP 8.1+ compatibility)
		add_submenu_page(
			'',
			__( 'Merge Profiles', 'frs-users' ),
			__( 'Merge Profiles', 'frs-users' ),
			'edit_users',
			'frs-profile-merge',
			array( $this, 'render_merge_page' )
		);

		// Merge selection page (hidden from menu - use empty string for PHP 8.1+ compatibility)
		add_submenu_page(
			'',
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
			'frs-profiles#/profiles/import-export', // React route
			array( $this, 'render_react_app' )
		);

		// Shortcodes documentation page
		add_submenu_page(
			'frs-profiles',
			__( 'Shortcodes', 'frs-users' ),
			__( 'Shortcodes', 'frs-users' ),
			'edit_users',
			'frs-profiles-shortcodes',
			array( $this, 'render_shortcodes_page' )
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
	 * Render profiles list page
	 *
	 * @return void
	 */
	public function render_list_page() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		// Render React app container
		?>
		<div class="wrap" style="padding: 20px 20px 20px 0;">
			<div id="frs-users-admin-root" data-route="/profiles"></div>
		</div>
		<?php
	}

	/**
	 * Render profile view page
	 *
	 * @return void
	 */
	public function render_view_page() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		$profile_id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

		if ( ! $profile_id ) {
			wp_die( esc_html__( 'Invalid profile ID.', 'frs-users' ) );
		}

		// Render React app container
		?>
		<div class="wrap" style="padding: 20px 20px 20px 0;">
			<div id="frs-users-admin-root" data-route="/profiles/<?php echo esc_attr( $profile_id ); ?>"></div>
		</div>
		<?php
	}

	/**
	 * Render profile edit/add page
	 *
	 * @return void
	 */
	public function render_edit_page() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		$profile_id = isset( $_GET['id'] ) ? $_GET['id'] : null;

		// Convert 'new' string to null for new profiles
		if ( 'new' === $profile_id || empty( $profile_id ) ) {
			$route = '/profiles/new';
		} else {
			$route = '/profiles/' . absint( $profile_id ) . '/edit';
		}

		// Render React app container
		?>
		<div class="wrap" style="padding: 20px 20px 20px 0;">
			<div id="frs-users-admin-root" data-route="<?php echo esc_attr( $route ); ?>"></div>
		</div>
		<?php
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

	/**
	 * Render shortcodes documentation page
	 *
	 * @return void
	 */
	public function render_shortcodes_page() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'FRS Profiles - Shortcodes', 'frs-users' ); ?></h1>

			<div class="card" style="max-width: none;">
				<h2>Available Shortcodes</h2>
				<p>Use these shortcodes to display profile content on your pages.</p>

				<hr>

				<!-- Profile Directory -->
				<h3>📂 Profile Directory</h3>
				<p>Display a full searchable directory with sidebar filters, pagination, and individual profile pages.</p>
				<pre><code>[frs_profile_directory]</code></pre>
				<p><strong>Features:</strong></p>
				<ul>
					<li>Search functionality</li>
					<li>Pagination (9 profiles per page)</li>
					<li>Sidebar with filters</li>
					<li>Individual profile detail pages</li>
					<li>Routes: /lo/:slug, /agent/:slug, /staff/:slug</li>
				</ul>
				<p><strong>Optional Parameters:</strong></p>
				<pre><code>[frs_profile_directory class="my-custom-class"]</code></pre>

				<hr>

				<!-- Full Profile Portal -->
				<h3>👤 Full Profile Portal</h3>
				<p>Display the complete profile management portal with sidebar navigation (requires login).</p>
				<pre><code>[frs_profile]</code></pre>
				<p><strong>Features:</strong></p>
				<ul>
					<li>Full portal with sidebar navigation</li>
					<li>Profile editing</li>
					<li>Settings management</li>
					<li>Welcome dashboard</li>
				</ul>

				<hr>

				<!-- My Profile Content -->
				<h3>✏️ My Profile (Content Only)</h3>
				<p>Display only the profile editing form without sidebar (for SureDash integration).</p>
				<pre><code>[frs_my_profile]</code></pre>
				<p><strong>Use Case:</strong> Embed in custom dashboards or portals that have their own navigation.</p>

				<hr>

				<!-- Profile Settings Content -->
				<h3>⚙️ Profile Settings (Content Only)</h3>
				<p>Display only the settings form without sidebar.</p>
				<pre><code>[frs_profile_settings]</code></pre>
				<p><strong>Use Case:</strong> Embed in custom settings pages.</p>

				<hr>

				<!-- Welcome Content -->
				<h3>👋 Welcome Dashboard (Content Only)</h3>
				<p>Display only the welcome dashboard content without sidebar.</p>
				<pre><code>[frs_welcome]</code></pre>
				<p><strong>Use Case:</strong> Embed in custom onboarding or dashboard pages.</p>

				<hr>

				<!-- DataKit Directory -->
				<h3>📊 Profiles Directory (DataKit)</h3>
				<p>Display profiles using WordPress DataKit with advanced filtering.</p>
				<pre><code>[frs_profiles_directory]</code></pre>
				<p><strong>Features:</strong> Advanced admin-style table with sorting and filtering.</p>

				<hr>

				<!-- DataView -->
				<h3>📋 Profiles DataView</h3>
				<p>Display profiles in a DataView format with customizable columns.</p>
				<pre><code>[frs_profiles_dataview]</code></pre>

				<hr>

				<h2>Tips</h2>
				<ul>
					<li><strong>Directory Pages:</strong> Use <code>[frs_profile_directory]</code> for public-facing team/staff directories</li>
					<li><strong>Portal Pages:</strong> Use <code>[frs_profile]</code> for full portal experience with navigation</li>
					<li><strong>Content-Only:</strong> Use <code>[frs_my_profile]</code>, <code>[frs_profile_settings]</code>, or <code>[frs_welcome]</code> when embedding in custom dashboards</li>
					<li><strong>Custom Styling:</strong> Add the <code>class</code> parameter to apply custom CSS classes</li>
				</ul>

				<h2>Example Page Setup</h2>
				<h4>Public Directory Page:</h4>
				<pre><code>&lt;!-- Page Title: Team Directory --&gt;
[frs_profile_directory]</code></pre>

				<h4>User Profile Portal Page:</h4>
				<pre><code>&lt;!-- Page Title: My Profile --&gt;
[frs_profile]</code></pre>

				<h4>Custom Dashboard Integration:</h4>
				<pre><code>&lt;!-- Using custom dashboard with own navigation --&gt;
&lt;h2&gt;Edit Your Profile&lt;/h2&gt;
[frs_my_profile]</code></pre>
			</div>
		</div>

		<style>
			.card {
				background: white;
				padding: 20px;
				margin-top: 20px;
			}
			pre {
				background: #f5f5f5;
				padding: 10px;
				border-left: 3px solid #0073aa;
				overflow-x: auto;
			}
			pre code {
				color: #d63384;
				font-size: 14px;
			}
			hr {
				margin: 30px 0;
				border: none;
				border-top: 1px solid #ddd;
			}
		</style>
		<?php
	}
}
