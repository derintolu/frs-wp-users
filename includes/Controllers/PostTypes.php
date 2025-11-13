<?php
/**
 * Custom Post Types Registration
 *
 * Registers all custom post types for FRS Users.
 *
 * @package FRSUsers\Controllers
 * @since 1.0.0
 */

namespace FRSUsers\Controllers;

use FRSUsers\Traits\Base;

/**
 * Class PostTypes
 *
 * Handles registration of custom post types.
 *
 * @package FRSUsers\Controllers
 */
class PostTypes {

	use Base;

	/**
	 * Initialize post types.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_post_types' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );
		add_action( 'init', array( $this, 'maybe_create_default_templates' ) );
		add_action( 'init', array( $this, 'maybe_generate_missing_profile_pages' ) );
		add_action( 'frs_profile_created', array( $this, 'generate_pages_on_profile_creation' ), 10, 1 );
		add_action( 'save_post_frs_user_profile', array( $this, 'create_profile_templates' ), 10, 3 );
		add_action( 'save_post_frs_profile_template', array( $this, 'sync_template_to_pages' ), 10, 3 );
		add_filter( 'rest_pre_dispatch', array( $this, 'lock_profile_pages' ), 10, 3 );
		add_action( 'admin_notices', array( $this, 'show_template_notice' ) );
	}

	/**
	 * Register custom post types.
	 *
	 * @return void
	 */
	public function register_post_types() {
		// User Profile Pages (hidden from main menu, accessed via user profile tabs only)
		register_post_type(
			'frs_user_profile',
			array(
				'labels'        => array(
					'name'          => __( 'Profile Pages', 'frs-users' ),
					'singular_name' => __( 'Profile Page', 'frs-users' ),
					'menu_name'     => __( 'Profile Pages', 'frs-users' ),
					'add_new'       => __( 'Add Profile Page', 'frs-users' ),
					'edit_item'     => __( 'Edit Profile Page', 'frs-users' ),
					'view_item'     => __( 'View Page', 'frs-users' ),
					'all_items'     => __( 'All Pages', 'frs-users' ),
				),
				'public'        => true,
				'publicly_queryable' => true,
				'show_ui'       => true,
				'show_in_menu'  => false, // Hidden from main menu
				'show_in_rest'  => true,
				'supports'      => array( 'title', 'editor', 'author', 'custom-fields', 'thumbnail' ),
				'has_archive'   => false,
				'rewrite'       => array(
					'slug'       => 'agent-profile',
					'with_front' => false,
				),
				'capability_type' => 'post',
				'map_meta_cap'  => true,
			)
		);

		// Profile Template post type (block editor templates)
		register_post_type(
			'frs_profile_template',
			array(
				'labels'        => array(
					'name'          => __( 'Profile Templates', 'frs-users' ),
					'singular_name' => __( 'Profile Template', 'frs-users' ),
					'add_new'       => __( 'Add New Template', 'frs-users' ),
					'add_new_item'  => __( 'Add New Template', 'frs-users' ),
					'edit_item'     => __( 'Edit Template', 'frs-users' ),
					'new_item'      => __( 'New Template', 'frs-users' ),
					'view_item'     => __( 'View Template', 'frs-users' ),
					'all_items'     => __( 'Templates', 'frs-users' ),
					'search_items'  => __( 'Search Templates', 'frs-users' ),
				),
				'public'        => false,
				'show_ui'       => true,
				'show_in_menu'  => false, // Added to frs-profiles menu via ProfilePagesAdmin
				'show_in_rest'  => true, // Enable block editor
				'supports'      => array( 'title', 'editor' ),
				'has_archive'   => false,
				'capability_type' => 'post',
				'map_meta_cap'  => true,
				'menu_icon'     => 'dashicons-layout',
			)
		);
	}

	/**
	 * Create default templates if none exist.
	 * Runs once using transient locking.
	 *
	 * @return void
	 */
	public function maybe_create_default_templates() {
		// Check if we've already created default templates
		if ( get_transient( 'frs_default_templates_created' ) ) {
			return;
		}

		// Check if any templates already exist
		$existing_templates = get_posts(
			array(
				'post_type'      => 'frs_profile_template',
				'post_status'    => 'any',
				'posts_per_page' => 1,
			)
		);

		if ( ! empty( $existing_templates ) ) {
			// Templates already exist, mark as created
			set_transient( 'frs_default_templates_created', true, YEAR_IN_SECONDS );
			return;
		}

		// Create default template
		$default_template_content = '<!-- wp:frs/profile-page {"profile_id":0} /-->';

		$default_templates = array(
			array(
				'title'   => 'Default Profile Page',
				'content' => $default_template_content,
			),
		);

		foreach ( $default_templates as $template_data ) {
			$template_id = wp_insert_post(
				array(
					'post_type'    => 'frs_profile_template',
					'post_title'   => $template_data['title'],
					'post_content' => $template_data['content'],
					'post_status'  => 'publish',
				)
			);

			if ( is_wp_error( $template_id ) ) {
				error_log( 'FRS Users: Failed to create default template: ' . $template_data['title'] );
			}
		}

		// Mark as created
		set_transient( 'frs_default_templates_created', true, YEAR_IN_SECONDS );
	}

	/**
	 * Register taxonomies.
	 *
	 * @return void
	 */
	public function register_taxonomies() {
		// Register profile_template taxonomy for user profiles
		register_taxonomy(
			'profile_template',
			'frs_user_profile',
			array(
				'labels'            => array(
					'name'          => __( 'Profile Templates', 'frs-users' ),
					'singular_name' => __( 'Profile Template', 'frs-users' ),
					'menu_name'     => __( 'Templates', 'frs-users' ),
					'all_items'     => __( 'All Templates', 'frs-users' ),
					'edit_item'     => __( 'Edit Template', 'frs-users' ),
					'add_new_item'  => __( 'Add New Template', 'frs-users' ),
				),
				'hierarchical'      => true,
				'show_ui'           => true,
				'show_in_menu'      => true,
				'show_in_rest'      => true,
				'show_admin_column' => true,
				'query_var'         => true,
				'rewrite'           => array( 'slug' => 'profile-template' ),
			)
		);
	}

	/**
	 * Create profile template pages for new user profiles.
	 *
	 * When a new user profile is created, automatically create one page
	 * for each available template.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 * @param bool    $update  Whether this is an existing post being updated.
	 * @return void
	 */
	public function create_profile_templates( $post_id, $post, $update ) {
		// Only run for new profiles (not updates)
		if ( $update ) {
			return;
		}

		// Avoid infinite loops
		remove_action( 'save_post_frs_user_profile', array( $this, 'create_profile_templates' ), 10 );

		// Get profile ID from post meta
		$profile_id = get_post_meta( $post_id, '_profile_id', true );

		if ( $profile_id && class_exists( 'FRSUsers\\Models\\Profile' ) ) {
			$profile = \FRSUsers\Models\Profile::find( $profile_id );
			if ( $profile ) {
				$this->generate_profile_pages_for_profile( $profile_id, $profile->full_name );
			}
		}

		// Re-add the action for future saves
		add_action( 'save_post_frs_user_profile', array( $this, 'create_profile_templates' ), 10, 3 );
	}

	/**
	 * Generate profile pages when a new profile is created.
	 *
	 * @param int $profile_id The newly created profile ID.
	 * @return void
	 */
	public function generate_pages_on_profile_creation( $profile_id ) {
		if ( ! $profile_id || ! class_exists( 'FRSUsers\\Models\\Profile' ) ) {
			return;
		}

		$profile = \FRSUsers\Models\Profile::find( $profile_id );
		if ( ! $profile ) {
			return;
		}

		// Generate profile pages for this new profile
		$this->generate_profile_pages_for_profile( $profile_id, $profile->full_name );
	}

	/**
	 * Generate profile pages for all existing profiles that don't have them.
	 * Runs once per profile using transient locking.
	 *
	 * @return void
	 */
	public function maybe_generate_missing_profile_pages() {
		// Only run for admins
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Get all profiles from the Profile model
		if ( ! class_exists( 'FRSUsers\\Models\\Profile' ) ) {
			return;
		}

		$profiles = \FRSUsers\Models\Profile::all();

		foreach ( $profiles as $profile ) {
			$profile_id = $profile->id;

			// Check if this profile already has pages generated
			$transient_key = 'frs_profile_pages_generated_' . $profile_id;
			if ( get_transient( $transient_key ) ) {
				continue;
			}

			// Check if pages already exist for this profile
			$existing_pages = get_posts(
				array(
					'post_type'   => 'frs_user_profile',
					'post_status' => 'any',
					'numberposts' => 1,
					'meta_query'  => array(
						array(
							'key'   => '_profile_id',
							'value' => $profile_id,
						),
					),
				)
			);

			if ( ! empty( $existing_pages ) ) {
				// Pages exist, mark as generated
				set_transient( $transient_key, true, YEAR_IN_SECONDS );
				continue;
			}

			// Generate profile pages for this profile
			$this->generate_profile_pages_for_profile( $profile_id, $profile->full_name );

			// Mark as generated
			set_transient( $transient_key, true, YEAR_IN_SECONDS );
		}
	}

	/**
	 * Generate profile pages for a specific profile.
	 *
	 * @param int    $profile_id Profile ID.
	 * @param string $profile_name Profile's full name.
	 * @return void
	 */
	private function generate_profile_pages_for_profile( $profile_id, $profile_name ) {
		// Get available template posts
		$templates = get_posts(
			array(
				'post_type'      => 'frs_profile_template',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
			)
		);

		// If no templates exist, default templates should have been created on init
		// But double-check just in case
		if ( empty( $templates ) ) {
			error_log( 'FRS Users: No templates found when generating profile pages for profile ' . $profile_id );
			return;
		}

		// Get the profile to check if it has a user_id
		$profile = null;
		if ( class_exists( 'FRSUsers\\Models\\Profile' ) ) {
			$profile = \FRSUsers\Models\Profile::find( $profile_id );
		}

		$user_id = $profile && $profile->user_id ? $profile->user_id : 0;

		// Create one page for each template
		foreach ( $templates as $template ) {
			$page_title = $profile_name;

			// Parse template content to get blocks
			$blocks = parse_blocks( $template->post_content );

			// Update profile_id attribute in all frs/profile-page blocks
			foreach ( $blocks as &$block ) {
				if ( $block['blockName'] === 'frs/profile-page' ) {
					if ( ! isset( $block['attrs'] ) ) {
						$block['attrs'] = array();
					}
					$block['attrs']['profile_id'] = $profile_id;
				}
			}

			// Serialize blocks back to content
			$page_content = serialize_blocks( $blocks );

			// Copy template content to new page
			$template_page_id = wp_insert_post(
				array(
					'post_type'    => 'frs_user_profile',
					'post_title'   => $page_title,
					'post_name'    => 'team/' . sanitize_title( $profile_name ),
					'post_content' => $page_content,
					'post_status'  => 'publish',
					'post_author'  => $user_id, // May be 0 if no user linked
					'meta_input'   => array(
						'_template_id' => $template->ID,
						'_profile_id'  => $profile_id,
					),
				)
			);

			if ( is_wp_error( $template_page_id ) ) {
				error_log( 'FRS Users: Failed to create profile page for profile ' . $profile_id . ' from template ' . $template->ID );
			} else {
				error_log( 'FRS Users: Created profile page ' . $template_page_id . ' for profile ' . $profile_id . ' with content: ' . substr( $page_content, 0, 200 ) );
			}
		}
	}

	/**
	 * Sync template content to all profile pages using that template.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 * @param bool    $update  Whether this is an existing post being updated.
	 * @return void
	 */
	public function sync_template_to_pages( $post_id, $post, $update ) {
		// Only sync published templates
		if ( $post->post_status !== 'publish' ) {
			return;
		}

		// Avoid infinite loops
		remove_action( 'save_post_frs_user_profile', array( $this, 'create_profile_templates' ), 10 );

		// Find all profile pages using this template
		$profile_pages = get_posts(
			array(
				'post_type'      => 'frs_user_profile',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'meta_key'       => '_template_id',
				'meta_value'     => $post_id,
			)
		);

		// Update each page with the template content
		foreach ( $profile_pages as $page ) {
			// Get the profile_id from post meta
			$profile_id = get_post_meta( $page->ID, '_profile_id', true );

			// Parse template content to get blocks
			$blocks = parse_blocks( $post->post_content );

			// Update profile_id attribute in all frs/profile-page blocks
			foreach ( $blocks as &$block ) {
				if ( $block['blockName'] === 'frs/profile-page' ) {
					if ( ! isset( $block['attrs'] ) ) {
						$block['attrs'] = array();
					}
					$block['attrs']['profile_id'] = intval( $profile_id );
				}
			}

			// Serialize blocks back to content
			$page_content = serialize_blocks( $blocks );

			wp_update_post(
				array(
					'ID'           => $page->ID,
					'post_content' => $page_content,
				)
			);
		}

		// Re-add the action
		add_action( 'save_post_frs_user_profile', array( $this, 'create_profile_templates' ), 10, 3 );
	}

	/**
	 * Lock profile pages from being edited - they should sync from templates.
	 *
	 * @param mixed           $result  Response to replace the requested version with.
	 * @param WP_REST_Server  $server  Server instance.
	 * @param WP_REST_Request $request Request used to generate the response.
	 * @return mixed
	 */
	public function lock_profile_pages( $result, $server, $request ) {
		$route = $request->get_route();

		// Check if this is a POST/PUT/PATCH request to frs_user_profile
		if ( strpos( $route, '/wp/v2/frs_user_profile' ) !== false ) {
			$method = $request->get_method();

			// Allow GET requests (viewing)
			if ( $method === 'GET' ) {
				return $result;
			}

			// Get the post ID from the route
			preg_match( '/\/frs_user_profile\/(\d+)/', $route, $matches );
			if ( ! empty( $matches[1] ) ) {
				$post_id = intval( $matches[1] );
				$template_id = get_post_meta( $post_id, '_template_id', true );

				// If this page was generated from a template, block edits
				if ( $template_id ) {
					return new \WP_Error(
						'profile_page_locked',
						__( 'This profile page is generated from a template and cannot be edited directly. Please edit the template instead.', 'frs-users' ),
						array( 'status' => 403 )
					);
				}
			}
		}

		return $result;
	}

	/**
	 * Show admin notice on profile page editor.
	 *
	 * @return void
	 */
	public function show_template_notice() {
		global $post;

		if ( ! $post || $post->post_type !== 'frs_user_profile' ) {
			return;
		}

		$template_id = get_post_meta( $post->ID, '_template_id', true );

		if ( $template_id ) {
			$template = get_post( $template_id );
			$edit_url = admin_url( 'post.php?post=' . $template_id . '&action=edit' );
			?>
			<div class="notice notice-info">
				<p>
					<strong><?php esc_html_e( 'This profile page is dynamically generated from a template.', 'frs-users' ); ?></strong>
				</p>
				<p>
					<?php
					printf(
						/* translators: %s: Template edit link */
						esc_html__( 'Content is synced from the "%s" template. To make changes, edit the template instead.', 'frs-users' ),
						'<a href="' . esc_url( $edit_url ) . '">' . esc_html( $template->post_title ?? __( 'Template', 'frs-users' ) ) . '</a>'
					);
					?>
				</p>
			</div>
			<?php
		}
	}
}
