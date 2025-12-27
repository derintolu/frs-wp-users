<?php
/**
 * Shortcodes Controller
 *
 * Registers frontend shortcodes for profile display and editing.
 *
 * @package FRSUsers
 * @subpackage Controllers
 * @since 1.0.0
 */

namespace FRSUsers\Controllers;

use FRSUsers\Models\Profile;

/**
 * Class Shortcodes
 *
 * Handles registration of custom shortcodes.
 *
 * @package FRSUsers\Controllers
 */
class Shortcodes {

	/**
	 * Initialize shortcodes
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_shortcodes' ) );
	}

	/**
	 * Register all custom shortcodes
	 *
	 * @return void
	 */
	public static function register_shortcodes() {
		// Full portal with sidebar
		add_shortcode( 'frs_profile', array( __CLASS__, 'render_profile' ) );

		// Content-only shortcodes (no sidebar) for SureDash integration
		add_shortcode( 'frs_my_profile', array( __CLASS__, 'render_my_profile_content' ) );
		add_shortcode( 'frs_profile_settings', array( __CLASS__, 'render_settings_content' ) );
		add_shortcode( 'frs_welcome', array( __CLASS__, 'render_welcome_content' ) );

		// Directory
		add_shortcode( 'frs_profile_directory', array( __CLASS__, 'render_directory' ) );

		// Allow other plugins to register additional FRS shortcodes
		do_action( 'frs_users_register_shortcodes' );
	}

	/**
	 * Render profile editor shortcode
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_profile_editor( $atts ) {
		// Parse attributes
		$atts = shortcode_atts(
			array(
				'profile_id' => null,
				'user_id'    => 'current',
			),
			$atts,
			'frs_profile_editor'
		);

		// Get user ID
		$user_id = $atts['user_id'] === 'current' ? get_current_user_id() : absint( $atts['user_id'] );

		// Check if user is logged in
		if ( ! $user_id ) {
			return '<div class="frs-profile-editor-error"><p>' . esc_html__( 'Please log in to edit your profile.', 'frs-users' ) . '</p></div>';
		}

		// Get profile
		if ( $atts['profile_id'] ) {
			$profile = Profile::find( absint( $atts['profile_id'] ) );
		} else {
			$profile = Profile::where( 'user_id', $user_id )->first();
		}

		// Create guest profile if none exists
		if ( ! $profile ) {
			$user = get_user_by( 'ID', $user_id );
			if ( $user ) {
				$profile = Profile::create(
					array(
						'user_id'    => $user_id,
						'email'      => $user->user_email,
						'first_name' => $user->first_name ?: $user->display_name,
						'last_name'  => $user->last_name,
					)
				);
			}
		}

		if ( ! $profile ) {
			return '<div class="frs-profile-editor-error"><p>' . esc_html__( 'Profile not found.', 'frs-users' ) . '</p></div>';
		}

		// Enqueue assets
		self::enqueue_profile_editor_assets();

		// Output React mount point
		return sprintf(
			'<div class="frs-profile-editor-root" data-profile-id="%s" data-user-id="%s"></div>',
			esc_attr( $profile->id ),
			esc_attr( $user_id )
		);
	}

	/**
	 * Render profile view shortcode
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_profile_view( $atts ) {
		// Parse attributes
		$atts = shortcode_atts(
			array(
				'profile_id' => null,
				'slug'       => null,
				'user_id'    => null,
			),
			$atts,
			'frs_profile_view'
		);

		// Get profile
		if ( $atts['slug'] ) {
			$profile = Profile::where( 'profile_slug', sanitize_title( $atts['slug'] ) )->first();
		} elseif ( $atts['user_id'] ) {
			$profile = Profile::where( 'user_id', absint( $atts['user_id'] ) )->first();
		} elseif ( $atts['profile_id'] ) {
			$profile = Profile::find( absint( $atts['profile_id'] ) );
		} else {
			return '<div class="frs-profile-view-error"><p>' . esc_html__( 'No profile specified.', 'frs-users' ) . '</p></div>';
		}

		if ( ! $profile ) {
			return '<div class="frs-profile-view-error"><p>' . esc_html__( 'Profile not found.', 'frs-users' ) . '</p></div>';
		}

		// Enqueue assets
		self::enqueue_profile_view_assets();

		// Output React mount point
		return sprintf(
			'<div class="frs-profile-view-root" data-profile-id="%s"></div>',
			esc_attr( $profile->id )
		);
	}

	/**
	 * Render directory shortcode
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_directory( $atts ) {
		// Parse attributes
		$atts = shortcode_atts(
			array(
				'class' => '',
			),
			$atts,
			'frs_profile_directory'
		);

		// Enqueue assets
		self::enqueue_directory_assets();

		// Output React mount point
		return sprintf(
			'<div id="frs-directory-root" class="frs-directory-wrapper %s"></div>',
			esc_attr( $atts['class'] )
		);
	}

	/**
	 * Render profile shortcode (unified portal with sidebar and routing)
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_profile( $atts ) {
		// Parse attributes
		$atts = shortcode_atts(
			array(
				'contentOnly' => 'false',
				'workspace'   => '', // Workspace slug for dynamic sidebar menu
			),
			$atts,
			'frs_profile'
		);

		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return '<div class="frs-profile-error"><p>' . esc_html__( 'Please log in to access your profile.', 'frs-users' ) . '</p></div>';
		}

		// Get current user
		$user = wp_get_current_user();

		// Convert string boolean to actual boolean
		$content_only = filter_var( $atts['contentOnly'], FILTER_VALIDATE_BOOLEAN );

		// Determine workspace slug
		$workspace_slug = self::get_current_workspace_slug( $atts['workspace'] );

		// Enqueue assets
		self::enqueue_portal_assets();

		// Localize script with user data and settings
		wp_localize_script(
			'frs-profile-portal',
			'frsPortalConfig',
			array(
				'restNonce'     => wp_create_nonce( 'wp_rest' ),
				'userName'      => $user->display_name,
				'userEmail'     => $user->user_email,
				'userAvatar'    => get_avatar_url( $user->ID ),
				'userRole'      => 'loan_officer', // TODO: Get from user meta
				'siteName'      => get_bloginfo( 'name' ),
				'siteLogo'      => '', // TODO: Get site logo
				'apiUrl'        => rest_url( 'frs-users/v1' ),
				'userId'        => $user->ID,
				'gradientUrl'   => FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4',
				'contentOnly'   => $content_only,
				'workspaceSlug' => $workspace_slug, // For dynamic sidebar menu
				'currentUser'   => array(
					'id'    => $user->ID,
					'name'  => $user->display_name,
					'email' => $user->user_email,
					'roles' => (array) $user->roles,
				),
			)
		);

		// Output React mount point
		return '<div id="frs-users-portal-root"></div>';
	}

	/**
	 * Get current workspace slug from various sources
	 *
	 * @param string $attr_workspace Workspace from shortcode attribute.
	 * @return string Workspace slug or empty string.
	 */
	private static function get_current_workspace_slug( $attr_workspace = '' ) {
		// 1. Check shortcode attribute
		if ( ! empty( $attr_workspace ) ) {
			return sanitize_text_field( $attr_workspace );
		}

		// 2. Check query parameter
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! empty( $_GET['workspace'] ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return sanitize_text_field( wp_unslash( $_GET['workspace'] ) );
		}

		// 3. Check if current post is a workspace_object and get its workspace
		global $post;
		if ( $post && 'workspace_object' === $post->post_type ) {
			$workspaces = get_post_meta( $post->ID, '_object_workspaces', true );
			if ( is_array( $workspaces ) && ! empty( $workspaces ) ) {
				$workspace_term = get_term( $workspaces[0], 'workspace' );
				if ( $workspace_term && ! is_wp_error( $workspace_term ) ) {
					return $workspace_term->slug;
				}
			}
			// Fallback to legacy single workspace
			$single_workspace = get_post_meta( $post->ID, '_object_workspace', true );
			if ( $single_workspace ) {
				$workspace_term = get_term( $single_workspace, 'workspace' );
				if ( $workspace_term && ! is_wp_error( $workspace_term ) ) {
					return $workspace_term->slug;
				}
			}
		}

		// 4. Check if viewing a workspace taxonomy archive
		if ( is_tax( 'workspace' ) ) {
			$term = get_queried_object();
			if ( $term && ! is_wp_error( $term ) ) {
				return $term->slug;
			}
		}

		return '';
	}

	/**
	 * Enqueue profile editor assets
	 *
	 * @return void
	 */
	private static function enqueue_profile_editor_assets() {
		\FRSUsers\Libs\Assets\enqueue_asset(
			FRS_USERS_DIR . '/assets/profile-editor/dist',
			'src/frontend/profile-editor/main.tsx',
			array(
				'handle'       => 'frs-profile-editor',
				'dependencies' => array( 'react', 'react-dom' ),
				'in-footer'    => true,
			)
		);

		// Localize script with WordPress API settings
		wp_localize_script(
			'frs-profile-editor',
			'wpApiSettings',
			array(
				'root'  => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			)
		);
	}

	/**
	 * Enqueue profile view assets
	 *
	 * @return void
	 */
	private static function enqueue_profile_view_assets() {
		// TODO: Implement profile view assets
		// Will be implemented when profile view component is created
	}

	/**
	 * Enqueue directory assets
	 *
	 * @return void
	 */
	private static function enqueue_directory_assets() {
		\FRSUsers\Libs\Assets\enqueue_asset(
			FRS_USERS_DIR . '/assets/directory/dist',
			'src/frontend/directory/index.tsx',
			array(
				'handle'       => 'frs-directory',
				'dependencies' => array( 'react', 'react-dom' ),
				'in-footer'    => true,
			)
		);

		// Localize script with WordPress API settings
		wp_localize_script(
			'frs-directory',
			'wpApiSettings',
			array(
				'root'  => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			)
		);

		// Localize script with portal config for video background
		wp_localize_script(
			'frs-directory',
			'frsPortalConfig',
			array(
				'gradientUrl' => FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4',
				'contentUrl'  => WP_CONTENT_URL,
			)
		);
	}

	/**
	 * Enqueue portal assets
	 *
	 * @param array $config Configuration data to localize.
	 * @return void
	 */
	private static function enqueue_portal_assets( $config = array() ) {
		\FRSUsers\Libs\Assets\enqueue_asset(
			FRS_USERS_DIR . '/assets/portal/dist',
			'src/frontend/portal/main.tsx',
			array(
				'handle'       => 'frs-profile-portal',
				'dependencies' => array( 'react', 'react-dom' ),
				'in-footer'    => true,
			)
		);

		// Output config as inline script BEFORE the module loads
		if ( ! empty( $config ) ) {
			wp_add_inline_script(
				'frs-profile-portal',
				'window.frsPortalConfig = ' . wp_json_encode( $config ) . ';',
				'before'
			);
		}

		// Ensure script is loaded as module
		add_filter( 'script_loader_tag', function( $tag, $handle ) {
			if ( 'frs-profile-portal' === $handle ) {
				$tag = str_replace( '<script ', '<script type="module" ', $tag );
			}
			return $tag;
		}, 10, 2 );
	}

	/**
	 * Render My Profile content only (no sidebar)
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_my_profile_content( $atts ) {
		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return '<div class="frs-profile-error"><p>' . esc_html__( 'Please log in to access your profile.', 'frs-users' ) . '</p></div>';
		}

		$user = wp_get_current_user();

		// Prepare config
		$config = array(
			'restNonce'   => wp_create_nonce( 'wp_rest' ),
			'userName'    => $user->display_name,
			'userEmail'   => $user->user_email,
			'userAvatar'  => get_avatar_url( $user->ID ),
			'userRole'    => 'loan_officer',
			'siteName'    => get_bloginfo( 'name' ),
			'apiUrl'      => rest_url( 'frs-users/v1' ),
			'userId'      => $user->ID,
			'gradientUrl' => FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4',
			'contentOnly' => true, // Flag for content-only mode
			'initialRoute' => '/my-profile',
			'currentUser' => array(
				'id'    => $user->ID,
				'name'  => $user->display_name,
				'email' => $user->user_email,
				'roles' => (array) $user->roles,
			),
		);

		// Enqueue assets with config
		self::enqueue_portal_assets( $config );

		return '<div id="frs-users-portal-root" class="frs-content-only"></div>';
	}

	/**
	 * Render Settings content only (no sidebar)
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_settings_content( $atts ) {
		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return '<div class="frs-profile-error"><p>' . esc_html__( 'Please log in to access settings.', 'frs-users' ) . '</p></div>';
		}

		$user = wp_get_current_user();

		// Prepare config
		$config = array(
			'restNonce'   => wp_create_nonce( 'wp_rest' ),
			'userName'    => $user->display_name,
			'userEmail'   => $user->user_email,
			'userAvatar'  => get_avatar_url( $user->ID ),
			'userRole'    => 'loan_officer',
			'siteName'    => get_bloginfo( 'name' ),
			'apiUrl'      => rest_url( 'frs-users/v1' ),
			'userId'      => $user->ID,
			'gradientUrl' => FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4',
			'contentOnly' => true,
			'initialRoute' => '/settings',
			'currentUser' => array(
				'id'    => $user->ID,
				'name'  => $user->display_name,
				'email' => $user->user_email,
				'roles' => (array) $user->roles,
			),
		);

		// Enqueue assets with config
		self::enqueue_portal_assets( $config );

		return '<div id="frs-users-portal-root" class="frs-content-only"></div>';
	}

	/**
	 * Render Welcome content only (no sidebar)
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_welcome_content( $atts ) {
		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return '<div class="frs-profile-error"><p>' . esc_html__( 'Please log in to view this content.', 'frs-users' ) . '</p></div>';
		}

		$user = wp_get_current_user();

		// Prepare config
		$config = array(
			'restNonce'   => wp_create_nonce( 'wp_rest' ),
			'userName'    => $user->display_name,
			'userEmail'   => $user->user_email,
			'userAvatar'  => get_avatar_url( $user->ID ),
			'userRole'    => 'loan_officer',
			'siteName'    => get_bloginfo( 'name' ),
			'apiUrl'      => rest_url( 'frs-users/v1' ),
			'userId'      => $user->ID,
			'gradientUrl' => FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4',
			'contentOnly' => true,
			'initialRoute' => '/welcome',
			'currentUser' => array(
				'id'    => $user->ID,
				'name'  => $user->display_name,
				'email' => $user->user_email,
				'roles' => (array) $user->roles,
			),
		);

		// Enqueue assets with config
		self::enqueue_portal_assets( $config );

		return '<div id="frs-users-portal-root" class="frs-content-only"></div>';
	}
}
