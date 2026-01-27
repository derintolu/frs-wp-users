<?php
/**
 * Intranet REST API Routes
 *
 * @package FRSUsers
 * @subpackage Intranet
 * @since 2.2.0
 */

namespace FRSUsers\Intranet;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Class Routes
 *
 * Registers REST API endpoints for intranet features.
 */
class Routes {

	/**
	 * API namespace.
	 *
	 * @var string
	 */
	const NAMESPACE = 'frs-users/v1';

	/**
	 * Initialize routes.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'rest_api_init', array( self::class, 'register_routes' ) );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public static function register_routes(): void {
		// Directory endpoints.
		register_rest_route(
			self::NAMESPACE,
			'/intranet/directory',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_directory' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
				'args'                => array(
					'search'          => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'department'      => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'office_location' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit'           => array(
						'type'              => 'integer',
						'default'           => 20,
						'sanitize_callback' => 'absint',
					),
					'offset'          => array(
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/directory/departments',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_departments' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/directory/locations',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_locations' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
			)
		);

		// Profile endpoints.
		register_rest_route(
			self::NAMESPACE,
			'/intranet/profile',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::class, 'get_profile' ),
					'permission_callback' => array( self::class, 'check_authenticated' ),
					'args'                => array(
						'user_id' => array(
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( self::class, 'update_profile' ),
					'permission_callback' => array( self::class, 'check_can_edit_profile' ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/profile/(?P<user_id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_profile' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
				'args'                => array(
					'user_id' => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Org chart endpoints.
		register_rest_route(
			self::NAMESPACE,
			'/intranet/org-chart',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_org_chart' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
				'args'                => array(
					'user_id' => array(
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/direct-reports',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_direct_reports' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
				'args'                => array(
					'manager_id' => array(
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Bookmark endpoints.
		register_rest_route(
			self::NAMESPACE,
			'/intranet/bookmarks',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::class, 'get_bookmarks' ),
					'permission_callback' => array( self::class, 'check_authenticated' ),
					'args'                => array(
						'collection' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'post_type'  => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'limit'      => array(
							'type'              => 'integer',
							'default'           => 20,
							'sanitize_callback' => 'absint',
						),
						'offset'     => array(
							'type'              => 'integer',
							'default'           => 0,
							'sanitize_callback' => 'absint',
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( self::class, 'add_bookmark' ),
					'permission_callback' => array( self::class, 'check_authenticated' ),
					'args'                => array(
						'post_id'    => array(
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						),
						'collection' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'notes'      => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_textarea_field',
						),
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/bookmarks/(?P<post_id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( self::class, 'remove_bookmark' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
				'args'                => array(
					'post_id' => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/bookmarks/check/(?P<post_id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'check_bookmark' ),
				'permission_callback' => array( self::class, 'check_authenticated' ),
				'args'                => array(
					'post_id' => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/intranet/bookmarks/collections',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::class, 'get_collections' ),
					'permission_callback' => array( self::class, 'check_authenticated' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( self::class, 'create_collection' ),
					'permission_callback' => array( self::class, 'check_authenticated' ),
					'args'                => array(
						'name'  => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'icon'  => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'color' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_hex_color',
						),
					),
				),
			)
		);
	}

	/**
	 * Check if user is authenticated.
	 *
	 * @return bool|WP_Error
	 */
	public static function check_authenticated() {
		if ( ! is_user_logged_in() ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You must be logged in to access intranet features.', 'frs-users' ),
				array( 'status' => 401 )
			);
		}
		return true;
	}

	/**
	 * Check if user can edit profile.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public static function check_can_edit_profile( WP_REST_Request $request ) {
		if ( ! is_user_logged_in() ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You must be logged in.', 'frs-users' ),
				array( 'status' => 401 )
			);
		}

		$user_id = $request->get_param( 'user_id' ) ?: get_current_user_id();
		if ( ! current_user_can( 'edit_user', $user_id ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to edit this profile.', 'frs-users' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Get directory listing.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function get_directory( WP_REST_Request $request ): WP_REST_Response {
		$args = array(
			'search'          => $request->get_param( 'search' ),
			'department'      => $request->get_param( 'department' ),
			'office_location' => $request->get_param( 'office_location' ),
			'limit'           => $request->get_param( 'limit' ),
			'offset'          => $request->get_param( 'offset' ),
		);

		$profiles = IntranetProfile::get_all( $args );

		$results = array_map(
			function ( $profile ) {
				return array(
					'user_id'         => $profile->user_id,
					'display_name'    => $profile->profile->display_name ?? '',
					'email'           => $profile->profile->email ?? '',
					'internal_title'  => $profile->get_display_title(),
					'department'      => $profile->department,
					'office_location' => $profile->office_location,
					'avatar_url'      => $profile->profile->get_avatar_url( 96 ),
					'skills'          => $profile->skills,
				);
			},
			$profiles
		);

		return new WP_REST_Response(
			array(
				'success' => true,
				'total'   => count( $results ),
				'results' => $results,
			),
			200
		);
	}

	/**
	 * Get departments.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_departments(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'success'     => true,
				'departments' => IntranetProfile::get_departments(),
			),
			200
		);
	}

	/**
	 * Get office locations.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_locations(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'success'   => true,
				'locations' => IntranetProfile::get_office_locations(),
			),
			200
		);
	}

	/**
	 * Get intranet profile.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_profile( WP_REST_Request $request ) {
		$user_id = $request->get_param( 'user_id' ) ?: get_current_user_id();
		$profile = IntranetProfile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'profile' => $profile->toArray( true ),
			),
			200
		);
	}

	/**
	 * Update intranet profile.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_profile( WP_REST_Request $request ) {
		$user_id = $request->get_param( 'user_id' ) ?: get_current_user_id();
		$profile = IntranetProfile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		$params = $request->get_json_params();

		// Update allowed fields.
		$allowed = array(
			'availability_status',
			'out_of_office_message',
			'internal_bio',
			'skills',
			'slack_handle',
			'teams_email',
			'timezone',
			'notification_preferences',
		);

		foreach ( $allowed as $field ) {
			if ( isset( $params[ $field ] ) ) {
				$profile->$field = $params[ $field ];
			}
		}

		$profile->save();

		return new WP_REST_Response(
			array(
				'success' => true,
				'profile' => $profile->toArray( false ),
			),
			200
		);
	}

	/**
	 * Get org chart.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_org_chart( WP_REST_Request $request ) {
		$user_id = $request->get_param( 'user_id' ) ?: get_current_user_id();
		$result  = IntranetAbilities::execute_get_org_chart( array( 'user_id' => $user_id ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $result,
			),
			200
		);
	}

	/**
	 * Get direct reports.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function get_direct_reports( WP_REST_Request $request ): WP_REST_Response {
		$manager_id = $request->get_param( 'manager_id' ) ?: get_current_user_id();
		$result     = IntranetAbilities::execute_get_direct_reports( array( 'manager_id' => $manager_id ) );

		return new WP_REST_Response(
			array(
				'success' => true,
				'reports' => $result,
			),
			200
		);
	}

	/**
	 * Get bookmarks.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function get_bookmarks( WP_REST_Request $request ): WP_REST_Response {
		$args = array(
			'collection' => $request->get_param( 'collection' ),
			'post_type'  => $request->get_param( 'post_type' ),
			'limit'      => $request->get_param( 'limit' ),
			'offset'     => $request->get_param( 'offset' ),
		);

		$result = IntranetAbilities::execute_get_bookmarks( $args );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $result,
			),
			200
		);
	}

	/**
	 * Add bookmark.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function add_bookmark( WP_REST_Request $request ) {
		$result = IntranetAbilities::execute_add_bookmark(
			array(
				'post_id'    => $request->get_param( 'post_id' ),
				'collection' => $request->get_param( 'collection' ),
				'notes'      => $request->get_param( 'notes' ),
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( $result, 201 );
	}

	/**
	 * Remove bookmark.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function remove_bookmark( WP_REST_Request $request ): WP_REST_Response {
		$result = IntranetAbilities::execute_remove_bookmark(
			array( 'post_id' => $request->get_param( 'post_id' ) )
		);

		return new WP_REST_Response( $result, 200 );
	}

	/**
	 * Check if post is bookmarked.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function check_bookmark( WP_REST_Request $request ): WP_REST_Response {
		$post_id      = $request->get_param( 'post_id' );
		$is_bookmarked = Bookmarks::is_bookmarked( $post_id );

		return new WP_REST_Response(
			array(
				'success'      => true,
				'post_id'      => $post_id,
				'is_bookmarked' => $is_bookmarked,
			),
			200
		);
	}

	/**
	 * Get collections.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_collections(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'success'     => true,
				'collections' => Bookmarks::get_collections(),
			),
			200
		);
	}

	/**
	 * Create collection.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_collection( WP_REST_Request $request ) {
		$collection = Bookmarks::create_collection(
			$request->get_param( 'name' ),
			array(
				'icon'  => $request->get_param( 'icon' ),
				'color' => $request->get_param( 'color' ),
			)
		);

		if ( ! $collection ) {
			return new WP_Error(
				'collection_exists',
				__( 'A collection with this name already exists.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		return new WP_REST_Response(
			array(
				'success'    => true,
				'collection' => $collection,
			),
			201
		);
	}
}
