<?php
/**
 * Intranet Abilities
 *
 * Registers WordPress Abilities API capabilities for intranet features.
 * These abilities are AI/MCP-ready for integration with AI agents.
 *
 * @package FRSUsers
 * @subpackage Intranet
 * @since 2.2.0
 */

namespace FRSUsers\Intranet;

use WP_Error;

/**
 * Class IntranetAbilities
 *
 * Registers abilities for intranet directory, org chart, bookmarks, and profile management.
 */
class IntranetAbilities {

	/**
	 * Register all intranet abilities.
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_search_directory();
		self::register_get_org_chart();
		self::register_get_direct_reports();
		self::register_get_intranet_profile();
		self::register_update_intranet_profile();
		self::register_get_bookmarks();
		self::register_add_bookmark();
		self::register_remove_bookmark();
		self::register_find_colleague();
	}

	/**
	 * Register search-directory ability.
	 *
	 * @return void
	 */
	private static function register_search_directory(): void {
		wp_register_ability(
			'frs-intranet/search-directory',
			array(
				'label'       => __( 'Search Staff Directory', 'frs-users' ),
				'description' => __( 'Search the intranet staff directory by name, department, skills, or office location. Returns matching employee profiles with contact information.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'search' => array(
							'type'        => 'string',
							'description' => __( 'Search query (name, email, or skills).', 'frs-users' ),
						),
						'department' => array(
							'type'        => 'string',
							'description' => __( 'Filter by department name.', 'frs-users' ),
						),
						'office_location' => array(
							'type'        => 'string',
							'description' => __( 'Filter by office location.', 'frs-users' ),
						),
						'limit' => array(
							'type'        => 'integer',
							'description' => __( 'Maximum number of results.', 'frs-users' ),
							'default'     => 20,
						),
						'offset' => array(
							'type'        => 'integer',
							'description' => __( 'Offset for pagination.', 'frs-users' ),
							'default'     => 0,
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'total'   => array( 'type' => 'integer' ),
						'results' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'user_id'         => array( 'type' => 'integer' ),
									'display_name'    => array( 'type' => 'string' ),
									'email'           => array( 'type' => 'string' ),
									'internal_title'  => array( 'type' => 'string' ),
									'department'      => array( 'type' => 'string' ),
									'office_location' => array( 'type' => 'string' ),
									'avatar_url'      => array( 'type' => 'string' ),
								),
							),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_search_directory' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute search-directory ability.
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error
	 */
	public static function execute_search_directory( array $input ) {
		$args = array(
			'search'          => $input['search'] ?? '',
			'department'      => $input['department'] ?? '',
			'office_location' => $input['office_location'] ?? '',
			'limit'           => $input['limit'] ?? 20,
			'offset'          => $input['offset'] ?? 0,
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

		return array(
			'total'   => count( $results ),
			'results' => $results,
		);
	}

	/**
	 * Register get-org-chart ability.
	 *
	 * @return void
	 */
	private static function register_get_org_chart(): void {
		wp_register_ability(
			'frs-intranet/get-org-chart',
			array(
				'label'       => __( 'Get Organization Chart', 'frs-users' ),
				'description' => __( 'Retrieves the reporting chain (management hierarchy) for a user, showing who they report to up to the top of the organization.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to get org chart for. Defaults to current user.', 'frs-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user'            => array(
							'type'       => 'object',
							'properties' => array(
								'user_id'      => array( 'type' => 'integer' ),
								'display_name' => array( 'type' => 'string' ),
								'title'        => array( 'type' => 'string' ),
								'department'   => array( 'type' => 'string' ),
							),
						),
						'reporting_chain' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'user_id'      => array( 'type' => 'integer' ),
									'display_name' => array( 'type' => 'string' ),
									'title'        => array( 'type' => 'string' ),
									'department'   => array( 'type' => 'string' ),
								),
							),
						),
						'direct_reports'  => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'user_id'      => array( 'type' => 'integer' ),
									'display_name' => array( 'type' => 'string' ),
									'title'        => array( 'type' => 'string' ),
								),
							),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_get_org_chart' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute get-org-chart ability.
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error
	 */
	public static function execute_get_org_chart( array $input ) {
		$user_id = $input['user_id'] ?? get_current_user_id();
		$profile = IntranetProfile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		$reporting_chain = array_map(
			function ( $manager ) {
				return array(
					'user_id'      => $manager->user_id,
					'display_name' => $manager->profile->display_name ?? '',
					'title'        => $manager->get_display_title(),
					'department'   => $manager->department,
					'avatar_url'   => $manager->profile->get_avatar_url( 96 ),
				);
			},
			$profile->get_reporting_chain()
		);

		$direct_reports = array_map(
			function ( $report ) {
				return array(
					'user_id'      => $report->user_id,
					'display_name' => $report->profile->display_name ?? '',
					'title'        => $report->get_display_title(),
					'avatar_url'   => $report->profile->get_avatar_url( 96 ),
				);
			},
			IntranetProfile::get_direct_reports( $user_id )
		);

		return array(
			'user'            => array(
				'user_id'      => $profile->user_id,
				'display_name' => $profile->profile->display_name ?? '',
				'title'        => $profile->get_display_title(),
				'department'   => $profile->department,
				'avatar_url'   => $profile->profile->get_avatar_url( 96 ),
			),
			'reporting_chain' => $reporting_chain,
			'direct_reports'  => $direct_reports,
		);
	}

	/**
	 * Register get-direct-reports ability.
	 *
	 * @return void
	 */
	private static function register_get_direct_reports(): void {
		wp_register_ability(
			'frs-intranet/get-direct-reports',
			array(
				'label'       => __( 'Get Direct Reports', 'frs-users' ),
				'description' => __( 'Retrieves all employees who directly report to a manager.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'manager_id' => array(
							'type'        => 'integer',
							'description' => __( 'Manager user ID. Defaults to current user.', 'frs-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'user_id'      => array( 'type' => 'integer' ),
							'display_name' => array( 'type' => 'string' ),
							'title'        => array( 'type' => 'string' ),
							'email'        => array( 'type' => 'string' ),
							'avatar_url'   => array( 'type' => 'string' ),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_get_direct_reports' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute get-direct-reports ability.
	 *
	 * @param array $input Input parameters.
	 * @return array
	 */
	public static function execute_get_direct_reports( array $input ) {
		$manager_id = $input['manager_id'] ?? get_current_user_id();
		$reports    = IntranetProfile::get_direct_reports( $manager_id );

		return array_map(
			function ( $report ) {
				return array(
					'user_id'      => $report->user_id,
					'display_name' => $report->profile->display_name ?? '',
					'title'        => $report->get_display_title(),
					'email'        => $report->profile->email ?? '',
					'department'   => $report->department,
					'avatar_url'   => $report->profile->get_avatar_url( 96 ),
				);
			},
			$reports
		);
	}

	/**
	 * Register get-intranet-profile ability.
	 *
	 * @return void
	 */
	private static function register_get_intranet_profile(): void {
		wp_register_ability(
			'frs-intranet/get-profile',
			array(
				'label'       => __( 'Get Intranet Profile', 'frs-users' ),
				'description' => __( 'Retrieves a user\'s full intranet profile including department, reporting structure, contact info, and skills.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID. Defaults to current user.', 'frs-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id'             => array( 'type' => 'integer' ),
						'display_name'        => array( 'type' => 'string' ),
						'email'               => array( 'type' => 'string' ),
						'internal_title'      => array( 'type' => 'string' ),
						'department'          => array( 'type' => 'string' ),
						'office_location'     => array( 'type' => 'string' ),
						'desk_phone'          => array( 'type' => 'string' ),
						'extension'           => array( 'type' => 'string' ),
						'slack_handle'        => array( 'type' => 'string' ),
						'teams_email'         => array( 'type' => 'string' ),
						'skills'              => array( 'type' => 'array', 'items' => array( 'type' => 'string' ) ),
						'internal_bio'        => array( 'type' => 'string' ),
						'availability_status' => array( 'type' => 'string' ),
						'manager'             => array(
							'type'       => 'object',
							'properties' => array(
								'user_id'      => array( 'type' => 'integer' ),
								'display_name' => array( 'type' => 'string' ),
							),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_get_intranet_profile' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute get-intranet-profile ability.
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error
	 */
	public static function execute_get_intranet_profile( array $input ) {
		$user_id = $input['user_id'] ?? get_current_user_id();
		$profile = IntranetProfile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		return $profile->toArray( true );
	}

	/**
	 * Register update-intranet-profile ability.
	 *
	 * @return void
	 */
	private static function register_update_intranet_profile(): void {
		wp_register_ability(
			'frs-intranet/update-profile',
			array(
				'label'       => __( 'Update Intranet Profile', 'frs-users' ),
				'description' => __( 'Updates a user\'s intranet profile fields like availability status, internal bio, or skills.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id'                => array(
							'type'        => 'integer',
							'description' => __( 'User ID. Defaults to current user.', 'frs-users' ),
						),
						'availability_status'    => array(
							'type'        => 'string',
							'enum'        => array( 'available', 'busy', 'away', 'dnd', 'offline' ),
							'description' => __( 'Availability status.', 'frs-users' ),
						),
						'out_of_office_message'  => array(
							'type'        => 'string',
							'description' => __( 'Out of office message.', 'frs-users' ),
						),
						'internal_bio'           => array(
							'type'        => 'string',
							'description' => __( 'Internal biography.', 'frs-users' ),
						),
						'skills'                 => array(
							'type'        => 'array',
							'items'       => array( 'type' => 'string' ),
							'description' => __( 'List of skills.', 'frs-users' ),
						),
						'slack_handle'           => array(
							'type'        => 'string',
							'description' => __( 'Slack handle.', 'frs-users' ),
						),
						'timezone'               => array(
							'type'        => 'string',
							'description' => __( 'Timezone (e.g., America/Los_Angeles).', 'frs-users' ),
						),
						'notification_preferences' => array(
							'type'        => 'object',
							'description' => __( 'Notification preferences.', 'frs-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'user_id' => array( 'type' => 'integer' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_update_intranet_profile' ),
				'permission_callback' => function( $input ) {
					$user_id = $input['user_id'] ?? get_current_user_id();
					return current_user_can( 'edit_user', $user_id );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => false,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute update-intranet-profile ability.
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error
	 */
	public static function execute_update_intranet_profile( array $input ) {
		$user_id = $input['user_id'] ?? get_current_user_id();
		$profile = IntranetProfile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		// Update fields.
		if ( isset( $input['availability_status'] ) ) {
			$profile->availability_status = sanitize_text_field( $input['availability_status'] );
		}
		if ( isset( $input['out_of_office_message'] ) ) {
			$profile->out_of_office_message = sanitize_textarea_field( $input['out_of_office_message'] );
		}
		if ( isset( $input['internal_bio'] ) ) {
			$profile->internal_bio = wp_kses_post( $input['internal_bio'] );
		}
		if ( isset( $input['skills'] ) ) {
			$profile->skills = array_map( 'sanitize_text_field', $input['skills'] );
		}
		if ( isset( $input['slack_handle'] ) ) {
			$profile->slack_handle = sanitize_text_field( $input['slack_handle'] );
		}
		if ( isset( $input['timezone'] ) ) {
			$profile->timezone = sanitize_text_field( $input['timezone'] );
		}
		if ( isset( $input['notification_preferences'] ) ) {
			$profile->notification_preferences = $input['notification_preferences'];
		}

		$profile->save();

		return array(
			'success' => true,
			'user_id' => $user_id,
		);
	}

	/**
	 * Register get-bookmarks ability.
	 *
	 * @return void
	 */
	private static function register_get_bookmarks(): void {
		wp_register_ability(
			'frs-intranet/get-bookmarks',
			array(
				'label'       => __( 'Get Bookmarks', 'frs-users' ),
				'description' => __( 'Retrieves user\'s saved bookmarks across the network. Can filter by collection or post type.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'collection' => array(
							'type'        => 'string',
							'description' => __( 'Filter by collection/folder name.', 'frs-users' ),
						),
						'post_type' => array(
							'type'        => 'string',
							'description' => __( 'Filter by post type.', 'frs-users' ),
						),
						'limit' => array(
							'type'        => 'integer',
							'description' => __( 'Maximum number of results.', 'frs-users' ),
							'default'     => 20,
						),
						'offset' => array(
							'type'        => 'integer',
							'description' => __( 'Offset for pagination.', 'frs-users' ),
							'default'     => 0,
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'total'      => array( 'type' => 'integer' ),
						'bookmarks'  => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'post_id'    => array( 'type' => 'integer' ),
									'title'      => array( 'type' => 'string' ),
									'url'        => array( 'type' => 'string' ),
									'post_type'  => array( 'type' => 'string' ),
									'collection' => array( 'type' => 'string' ),
									'created_at' => array( 'type' => 'string' ),
								),
							),
						),
						'collections' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'slug'  => array( 'type' => 'string' ),
									'name'  => array( 'type' => 'string' ),
									'count' => array( 'type' => 'integer' ),
								),
							),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_get_bookmarks' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute get-bookmarks ability.
	 *
	 * @param array $input Input parameters.
	 * @return array
	 */
	public static function execute_get_bookmarks( array $input ) {
		$args = array(
			'collection' => $input['collection'] ?? '',
			'post_type'  => $input['post_type'] ?? '',
			'limit'      => $input['limit'] ?? 20,
			'offset'     => $input['offset'] ?? 0,
		);

		$bookmarks   = Bookmarks::get_bookmarks_with_posts( null, $args );
		$collections = Bookmarks::get_collections();
		$all_bookmarks = Bookmarks::get_bookmarks();

		// Count bookmarks per collection.
		$collection_counts = array();
		foreach ( $collections as &$collection ) {
			$count = 0;
			foreach ( $all_bookmarks as $bookmark ) {
				if ( ( $bookmark['collection'] ?? '' ) === $collection['slug'] ) {
					$count++;
				}
			}
			$collection['count'] = $count;
		}

		return array(
			'total'       => count( $bookmarks ),
			'bookmarks'   => array_values( $bookmarks ),
			'collections' => $collections,
		);
	}

	/**
	 * Register add-bookmark ability.
	 *
	 * @return void
	 */
	private static function register_add_bookmark(): void {
		wp_register_ability(
			'frs-intranet/add-bookmark',
			array(
				'label'       => __( 'Add Bookmark', 'frs-users' ),
				'description' => __( 'Saves a post to the user\'s bookmarks. Works with any post type across the network.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'post_id' => array(
							'type'        => 'integer',
							'description' => __( 'Post ID to bookmark.', 'frs-users' ),
						),
						'collection' => array(
							'type'        => 'string',
							'description' => __( 'Collection/folder to add to.', 'frs-users' ),
						),
						'notes' => array(
							'type'        => 'string',
							'description' => __( 'Optional notes about this bookmark.', 'frs-users' ),
						),
					),
					'required'             => array( 'post_id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success'  => array( 'type' => 'boolean' ),
						'bookmark' => array(
							'type'       => 'object',
							'properties' => array(
								'post_id'    => array( 'type' => 'integer' ),
								'title'      => array( 'type' => 'string' ),
								'collection' => array( 'type' => 'string' ),
								'created_at' => array( 'type' => 'string' ),
							),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_add_bookmark' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'    => false,
						'idempotent'  => true,
						'destructive' => false,
					),
				),
			)
		);
	}

	/**
	 * Execute add-bookmark ability.
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error
	 */
	public static function execute_add_bookmark( array $input ) {
		$post_id    = absint( $input['post_id'] );
		$collection = $input['collection'] ?? null;
		$meta       = array();

		if ( ! empty( $input['notes'] ) ) {
			$meta['notes'] = sanitize_textarea_field( $input['notes'] );
		}

		$bookmark = Bookmarks::add_bookmark( $post_id, null, $collection, $meta );

		if ( ! $bookmark ) {
			return new WP_Error(
				'bookmark_failed',
				__( 'Failed to add bookmark.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		return array(
			'success'  => true,
			'bookmark' => $bookmark,
		);
	}

	/**
	 * Register remove-bookmark ability.
	 *
	 * @return void
	 */
	private static function register_remove_bookmark(): void {
		wp_register_ability(
			'frs-intranet/remove-bookmark',
			array(
				'label'       => __( 'Remove Bookmark', 'frs-users' ),
				'description' => __( 'Removes a post from the user\'s bookmarks.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'post_id' => array(
							'type'        => 'integer',
							'description' => __( 'Post ID to remove from bookmarks.', 'frs-users' ),
						),
					),
					'required'             => array( 'post_id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'post_id' => array( 'type' => 'integer' ),
					),
				),
				'execute_callback'    => array( self::class, 'execute_remove_bookmark' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest'  => true,
					'annotations'   => array(
						'readonly'    => false,
						'destructive' => true,
						'idempotent'  => true,
					),
				),
			)
		);
	}

	/**
	 * Execute remove-bookmark ability.
	 *
	 * @param array $input Input parameters.
	 * @return array
	 */
	public static function execute_remove_bookmark( array $input ) {
		$post_id = absint( $input['post_id'] );
		$result  = Bookmarks::remove_bookmark( $post_id );

		return array(
			'success' => $result,
			'post_id' => $post_id,
		);
	}

	/**
	 * Register find-colleague ability (AI-optimized).
	 *
	 * @return void
	 */
	private static function register_find_colleague(): void {
		wp_register_ability(
			'frs-intranet/find-colleague',
			array(
				'label'       => __( 'Find Colleague', 'frs-users' ),
				'description' => __( 'Finds colleagues based on natural language queries like "who knows about mortgages" or "someone in the LA office who speaks Spanish". Optimized for AI assistant queries.', 'frs-users' ),
				'category'    => 'intranet',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'query' => array(
							'type'        => 'string',
							'description' => __( 'Natural language query describing who you are looking for.', 'frs-users' ),
						),
						'skills' => array(
							'type'        => 'array',
							'items'       => array( 'type' => 'string' ),
							'description' => __( 'Skills to match.', 'frs-users' ),
						),
						'department' => array(
							'type'        => 'string',
							'description' => __( 'Department to search in.', 'frs-users' ),
						),
						'office_location' => array(
							'type'        => 'string',
							'description' => __( 'Office location to search in.', 'frs-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'matches' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'user_id'         => array( 'type' => 'integer' ),
									'display_name'    => array( 'type' => 'string' ),
									'email'           => array( 'type' => 'string' ),
									'title'           => array( 'type' => 'string' ),
									'department'      => array( 'type' => 'string' ),
									'office_location' => array( 'type' => 'string' ),
									'skills'          => array( 'type' => 'array', 'items' => array( 'type' => 'string' ) ),
									'match_reason'    => array( 'type' => 'string' ),
								),
							),
						),
						'suggestion' => array(
							'type'        => 'string',
							'description' => __( 'AI-friendly suggestion for presenting results.', 'frs-users' ),
						),
					),
				),
				'execute_callback'    => array( self::class, 'execute_find_colleague' ),
				'permission_callback' => function() {
					return is_user_logged_in();
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute find-colleague ability.
	 *
	 * @param array $input Input parameters.
	 * @return array
	 */
	public static function execute_find_colleague( array $input ) {
		$args = array(
			'search'          => $input['query'] ?? '',
			'department'      => $input['department'] ?? '',
			'office_location' => $input['office_location'] ?? '',
			'limit'           => 10,
		);

		$profiles = IntranetProfile::get_all( $args );
		$skills   = $input['skills'] ?? array();

		// Score and filter by skills if provided.
		$matches = array();
		foreach ( $profiles as $profile ) {
			$match_reason = '';
			$score        = 0;

			// Check skills match.
			if ( ! empty( $skills ) && ! empty( $profile->skills ) ) {
				$matching_skills = array_intersect(
					array_map( 'strtolower', $skills ),
					array_map( 'strtolower', $profile->skills )
				);
				if ( ! empty( $matching_skills ) ) {
					$score       += count( $matching_skills ) * 10;
					$match_reason = sprintf(
						__( 'Has skills: %s', 'frs-users' ),
						implode( ', ', $matching_skills )
					);
				}
			}

			// Check department match.
			if ( ! empty( $input['department'] ) && $profile->department === $input['department'] ) {
				$score       += 5;
				$match_reason = $match_reason ?: __( 'In requested department', 'frs-users' );
			}

			// Check location match.
			if ( ! empty( $input['office_location'] ) && $profile->office_location === $input['office_location'] ) {
				$score       += 5;
				$match_reason = $match_reason ?: __( 'At requested location', 'frs-users' );
			}

			// Always include if no filters or if matched.
			if ( empty( $skills ) || $score > 0 ) {
				$matches[] = array(
					'user_id'         => $profile->user_id,
					'display_name'    => $profile->profile->display_name ?? '',
					'email'           => $profile->profile->email ?? '',
					'title'           => $profile->get_display_title(),
					'department'      => $profile->department,
					'office_location' => $profile->office_location,
					'skills'          => $profile->skills,
					'avatar_url'      => $profile->profile->get_avatar_url( 96 ),
					'match_reason'    => $match_reason ?: __( 'General match', 'frs-users' ),
					'score'           => $score,
				);
			}
		}

		// Sort by score descending.
		usort(
			$matches,
			function ( $a, $b ) {
				return $b['score'] - $a['score'];
			}
		);

		// Remove score from output.
		$matches = array_map(
			function ( $m ) {
				unset( $m['score'] );
				return $m;
			},
			array_slice( $matches, 0, 10 )
		);

		$suggestion = '';
		if ( count( $matches ) === 0 ) {
			$suggestion = __( 'No colleagues found matching your criteria. Try broadening your search.', 'frs-users' );
		} elseif ( count( $matches ) === 1 ) {
			$suggestion = sprintf(
				__( 'I found %s who matches your criteria.', 'frs-users' ),
				$matches[0]['display_name']
			);
		} else {
			$suggestion = sprintf(
				__( 'I found %d colleagues who might help. %s seems like the best match.', 'frs-users' ),
				count( $matches ),
				$matches[0]['display_name']
			);
		}

		return array(
			'matches'    => $matches,
			'suggestion' => $suggestion,
		);
	}
}
