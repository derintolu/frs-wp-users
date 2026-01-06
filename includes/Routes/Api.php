<?php
/**
 * FRS Users REST API Routes
 *
 * Registers REST API routes for profile management.
 *
 * @package FRSUsers
 * @subpackage Routes
 * @since 1.0.0
 */

namespace FRSUsers\Routes;

use FRSUsers\Controllers\Profiles\Actions;

/**
 * Class Api
 *
 * Handles REST API route registration for profiles.
 *
 * @package FRSUsers\Routes
 */
class Api {

	/**
	 * API namespace
	 *
	 * @var string
	 */
	private static $namespace = 'frs-users/v1';

	/**
	 * Actions controller instance
	 *
	 * @var Actions
	 */
	private static $actions;

	/**
	 * Initialize API routes
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		self::$actions = new Actions();
	}

	/**
	 * Register all REST API routes
	 *
	 * @return void
	 */
	public static function register_routes() {
		// Get all profiles
		register_rest_route(
			self::$namespace,
			'/profiles',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_profiles' ),
				'permission_callback' => array( self::$actions, 'check_read_permissions' ),
				'args'                => array(
					'type'        => array(
						'description' => 'Filter by profile type',
						'type'        => 'string',
						'required'    => false,
					),
					'guests_only' => array(
						'description' => 'Get only guest profiles',
						'type'        => 'boolean',
						'required'    => false,
					),
					'per_page'    => array(
						'description'       => 'Number of profiles per page',
						'type'              => 'integer',
						'default'           => 50,
						'minimum'           => 1,
						'maximum'           => 1000,
						'sanitize_callback' => 'absint',
					),
					'page'        => array(
						'description'       => 'Page number',
						'type'              => 'integer',
						'default'           => 1,
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Create profile
		register_rest_route(
			self::$namespace,
			'/profiles',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::$actions, 'create_profile' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
			)
		);

		// Get single profile
		register_rest_route(
			self::$namespace,
			'/profiles/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_profile' ),
				'permission_callback' => array( self::$actions, 'check_read_permissions' ),
				'args'                => array(
					'id' => array(
						'description'       => 'Profile ID',
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Update profile
		register_rest_route(
			self::$namespace,
			'/profiles/(?P<id>\d+)',
			array(
				'methods'             => 'PUT',
				'callback'            => array( self::$actions, 'update_profile' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
				'args'                => array(
					'id' => array(
						'description'       => 'Profile ID',
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Delete profile
		register_rest_route(
			self::$namespace,
			'/profiles/(?P<id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( self::$actions, 'delete_profile' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
				'args'                => array(
					'id' => array(
						'description'       => 'Profile ID',
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Get profile by user ID
		register_rest_route(
			self::$namespace,
			'/profiles/user/(?P<user_id>[\w-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_profile_by_user' ),
				'permission_callback' => array( self::$actions, 'check_read_permissions' ),
				'args'                => array(
					'user_id' => array(
						'description' => 'WordPress user ID or "me" for current user',
						'type'        => 'string',
						'required'    => true,
					),
				),
			)
		);

		// Get profile by slug (public endpoint)
		register_rest_route(
			self::$namespace,
			'/profiles/slug/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_profile_by_slug' ),
				'permission_callback' => '__return_true', // Public endpoint
				'args'                => array(
					'slug' => array(
						'description'       => 'Profile slug',
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_title',
					),
				),
			)
		);

		// Create user account for guest profile
		register_rest_route(
			self::$namespace,
			'/profiles/(?P<id>\d+)/create-user',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::$actions, 'create_user_account' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
				'args'                => array(
					'id'         => array(
						'description'       => 'Profile ID',
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
					'username'   => array(
						'description'       => 'Username for new user (auto-generated if not provided)',
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_user',
					),
					'send_email' => array(
						'description' => 'Send password reset email to new user',
						'type'        => 'boolean',
						'default'     => true,
					),
					'roles'      => array(
						'description' => 'Additional WordPress roles to assign',
						'type'        => 'array',
						'default'     => array(),
						'items'       => array(
							'type' => 'string',
						),
					),
				),
			)
		);

		// Bulk create user accounts
		register_rest_route(
			self::$namespace,
			'/profiles/bulk-create-users',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::$actions, 'bulk_create_users' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
				'args'                => array(
					'profile_ids' => array(
						'description' => 'Array of profile IDs to create users for',
						'type'        => 'array',
						'required'    => true,
						'items'       => array(
							'type' => 'integer',
						),
					),
					'send_email'  => array(
						'description' => 'Send password reset emails to new users',
						'type'        => 'boolean',
						'default'     => true,
					),
				),
			)
		);

		// Get sync settings
		register_rest_route(
			self::$namespace,
			'/sync-settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_sync_settings' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
			)
		);

		// Save sync settings
		register_rest_route(
			self::$namespace,
			'/sync-settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::$actions, 'save_sync_settings' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
			)
		);

		// Get sync statistics
		register_rest_route(
			self::$namespace,
			'/sync-stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_sync_stats' ),
				'permission_callback' => array( self::$actions, 'check_read_permissions' ),
			)
		);

		// Trigger manual sync
		register_rest_route(
			self::$namespace,
			'/trigger-sync',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::$actions, 'trigger_sync' ),
				'permission_callback' => array( self::$actions, 'check_write_permissions' ),
			)
		);

		// Meeting request (public endpoint for contact form)
		register_rest_route(
			self::$namespace,
			'/meeting-request',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::$actions, 'submit_meeting_request' ),
				'permission_callback' => '__return_true', // Public endpoint
				'args'                => array(
					'profile_id'    => array(
						'description'       => 'Profile ID to send request to',
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
					'profile_email' => array(
						'description'       => 'Profile email address',
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_email',
					),
					'profile_name'  => array(
						'description'       => 'Profile owner name',
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'name'          => array(
						'description'       => 'Requester name',
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'email'         => array(
						'description'       => 'Requester email',
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_email',
					),
					'phone'         => array(
						'description'       => 'Requester phone',
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'message'       => array(
						'description'       => 'Meeting request message',
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_textarea_field',
					),
				),
			)
		);

		// Get all unique service areas (public endpoint for directory filtering)
		register_rest_route(
			self::$namespace,
			'/service-areas',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_service_areas' ),
				'permission_callback' => '__return_true', // Public endpoint
			)
		);

		// Get all user settings for current user
		register_rest_route(
			self::$namespace,
			'/profiles/me/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::$actions, 'get_user_settings' ),
					'permission_callback' => array( self::$actions, 'check_authenticated' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( self::$actions, 'update_user_settings' ),
					'permission_callback' => array( self::$actions, 'check_authenticated' ),
				),
			)
		);

		// Notification settings
		register_rest_route(
			self::$namespace,
			'/profiles/me/settings/notifications',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::$actions, 'get_notification_settings' ),
					'permission_callback' => array( self::$actions, 'check_authenticated' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( self::$actions, 'update_notification_settings' ),
					'permission_callback' => array( self::$actions, 'check_authenticated' ),
				),
			)
		);

		// Privacy settings
		register_rest_route(
			self::$namespace,
			'/profiles/me/settings/privacy',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::$actions, 'get_privacy_settings' ),
					'permission_callback' => array( self::$actions, 'check_authenticated' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( self::$actions, 'update_privacy_settings' ),
					'permission_callback' => array( self::$actions, 'check_authenticated' ),
				),
			)
		);

		// Get integrations overview for current user
		register_rest_route(
			self::$namespace,
			'/profiles/me/integrations',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::$actions, 'get_integrations' ),
				'permission_callback' => array( self::$actions, 'check_authenticated' ),
			)
		);

		// Allow hooks to add more custom API routes
		do_action( 'frs_users_api_routes', self::$namespace );
	}
}
