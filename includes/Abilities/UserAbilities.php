<?php
/**
 * User Abilities
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Abilities;

use WP_Error;
use WP_User;

/**
 * Class UserAbilities
 *
 * Registers abilities for user management operations.
 */
class UserAbilities {

	/**
	 * Register all user abilities
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_get_users();
		self::register_get_user();
		self::register_create_user();
		self::register_update_user();
		self::register_delete_user();
	}

	/**
	 * Register get-users ability
	 *
	 * @return void
	 */
	private static function register_get_users(): void {
		wp_register_ability(
			'frs-users/get-users',
			array(
				'label'       => __( 'Get Users', 'frs-wp-users' ),
				'description' => __( 'Retrieves a list of users with optional filtering by role, search term, or custom fields.', 'frs-wp-users' ),
				'category'    => 'user-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'role' => array(
							'type'        => 'string',
							'description' => __( 'Filter by user role.', 'frs-wp-users' ),
							'enum'        => array( 'loan_officer', 're_agent', 'escrow_officer', 'property_manager', 'dual_license', 'partner', 'staff', 'leadership', 'assistant', 'administrator', 'subscriber' ),
						),
						'search' => array(
							'type'        => 'string',
							'description' => __( 'Search users by name or email.', 'frs-wp-users' ),
						),
						'limit' => array(
							'type'        => 'integer',
							'description' => __( 'Maximum number of results to return.', 'frs-wp-users' ),
							'default'     => 20,
							'minimum'     => 1,
							'maximum'     => 100,
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'id'         => array( 'type' => 'integer' ),
							'username'   => array( 'type' => 'string' ),
							'email'      => array( 'type' => 'string' ),
							'first_name' => array( 'type' => 'string' ),
							'last_name'  => array( 'type' => 'string' ),
							'roles'      => array(
								'type'  => 'array',
								'items' => array( 'type' => 'string' ),
							),
							'registered' => array( 'type' => 'string' ),
						),
					),
				),
				'execute_callback' => array( self::class, 'execute_get_users' ),
				'permission_callback' => function() {
					return current_user_can( 'list_users' );
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
	 * Execute get-users ability
	 *
	 * @param array $input Input parameters.
	 * @return array List of users.
	 */
	public static function execute_get_users( array $input ): array {
		$args = array(
			'number' => isset( $input['limit'] ) ? absint( $input['limit'] ) : 20,
		);

		if ( isset( $input['role'] ) ) {
			$args['role'] = sanitize_text_field( $input['role'] );
		}

		if ( isset( $input['search'] ) ) {
			$args['search'] = '*' . sanitize_text_field( $input['search'] ) . '*';
			$args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
		}

		$users = get_users( $args );

		return array_map( function( WP_User $user ) {
			return array(
				'id'         => $user->ID,
				'username'   => $user->user_login,
				'email'      => $user->user_email,
				'first_name' => get_user_meta( $user->ID, 'first_name', true ),
				'last_name'  => get_user_meta( $user->ID, 'last_name', true ),
				'roles'      => $user->roles,
				'registered' => $user->user_registered,
			);
		}, $users );
	}

	/**
	 * Register get-user ability
	 *
	 * @return void
	 */
	private static function register_get_user(): void {
		wp_register_ability(
			'frs-users/get-user',
			array(
				'label'       => __( 'Get User', 'frs-wp-users' ),
				'description' => __( 'Retrieves detailed information about a specific user by ID.', 'frs-wp-users' ),
				'category'    => 'user-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'id' => array(
							'type'        => 'integer',
							'description' => __( 'The user ID.', 'frs-wp-users' ),
						),
					),
					'required'             => array( 'id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'id'           => array( 'type' => 'integer' ),
						'username'     => array( 'type' => 'string' ),
						'email'        => array( 'type' => 'string' ),
						'first_name'   => array( 'type' => 'string' ),
						'last_name'    => array( 'type' => 'string' ),
						'display_name' => array( 'type' => 'string' ),
						'roles'        => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
						'registered'   => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_get_user' ),
				'permission_callback' => function() {
					return current_user_can( 'list_users' );
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
	 * Execute get-user ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error User details or error.
	 */
	public static function execute_get_user( array $input ) {
		$user = get_user_by( 'id', absint( $input['id'] ) );

		if ( ! $user ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		return array(
			'id'           => $user->ID,
			'username'     => $user->user_login,
			'email'        => $user->user_email,
			'first_name'   => get_user_meta( $user->ID, 'first_name', true ),
			'last_name'    => get_user_meta( $user->ID, 'last_name', true ),
			'display_name' => $user->display_name,
			'roles'        => $user->roles,
			'registered'   => $user->user_registered,
		);
	}

	/**
	 * Register create-user ability
	 *
	 * @return void
	 */
	private static function register_create_user(): void {
		wp_register_ability(
			'frs-users/create-user',
			array(
				'label'       => __( 'Create User', 'frs-wp-users' ),
				'description' => __( 'Creates a new user account with specified role and profile information.', 'frs-wp-users' ),
				'category'    => 'user-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'username' => array(
							'type'        => 'string',
							'description' => __( 'Username for the new user.', 'frs-wp-users' ),
						),
						'email' => array(
							'type'        => 'string',
							'description' => __( 'Email address for the new user.', 'frs-wp-users' ),
							'format'      => 'email',
						),
						'password' => array(
							'type'        => 'string',
							'description' => __( 'Password for the new user. If omitted, a random password will be generated.', 'frs-wp-users' ),
						),
						'first_name' => array(
							'type'        => 'string',
							'description' => __( 'User first name.', 'frs-wp-users' ),
						),
						'last_name' => array(
							'type'        => 'string',
							'description' => __( 'User last name.', 'frs-wp-users' ),
						),
						'role' => array(
							'type'        => 'string',
							'description' => __( 'User role.', 'frs-wp-users' ),
							'enum'        => array( 'loan_officer', 're_agent', 'escrow_officer', 'property_manager', 'dual_license', 'partner', 'staff', 'leadership', 'assistant', 'subscriber' ),
							'default'     => 'subscriber',
						),
					),
					'required'             => array( 'username', 'email' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'id'       => array( 'type' => 'integer' ),
						'username' => array( 'type' => 'string' ),
						'email'    => array( 'type' => 'string' ),
						'role'     => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_create_user' ),
				'permission_callback' => function() {
					return current_user_can( 'create_users' );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => false,
						'idempotent' => false,
					),
				),
			)
		);
	}

	/**
	 * Execute create-user ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Created user or error.
	 */
	public static function execute_create_user( array $input ) {
		$username = sanitize_user( $input['username'] );
		$email = sanitize_email( $input['email'] );
		$password = isset( $input['password'] ) ? $input['password'] : wp_generate_password();
		$role = isset( $input['role'] ) ? sanitize_text_field( $input['role'] ) : 'subscriber';

		$user_id = wp_create_user( $username, $password, $email );

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		// Update role
		$user = new WP_User( $user_id );
		$user->set_role( $role );

		// Update name fields
		if ( isset( $input['first_name'] ) ) {
			update_user_meta( $user_id, 'first_name', sanitize_text_field( $input['first_name'] ) );
		}
		if ( isset( $input['last_name'] ) ) {
			update_user_meta( $user_id, 'last_name', sanitize_text_field( $input['last_name'] ) );
		}

		return array(
			'id'       => $user_id,
			'username' => $username,
			'email'    => $email,
			'role'     => $role,
		);
	}

	/**
	 * Register update-user ability
	 *
	 * @return void
	 */
	private static function register_update_user(): void {
		wp_register_ability(
			'frs-users/update-user',
			array(
				'label'       => __( 'Update User', 'frs-wp-users' ),
				'description' => __( 'Updates an existing user account including email, name, or other profile fields.', 'frs-wp-users' ),
				'category'    => 'user-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'id' => array(
							'type'        => 'integer',
							'description' => __( 'The user ID to update.', 'frs-wp-users' ),
						),
						'email' => array(
							'type'        => 'string',
							'description' => __( 'Update email address.', 'frs-wp-users' ),
							'format'      => 'email',
						),
						'first_name' => array(
							'type'        => 'string',
							'description' => __( 'Update first name.', 'frs-wp-users' ),
						),
						'last_name' => array(
							'type'        => 'string',
							'description' => __( 'Update last name.', 'frs-wp-users' ),
						),
					),
					'required'             => array( 'id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'id'         => array( 'type' => 'integer' ),
						'email'      => array( 'type' => 'string' ),
						'first_name' => array( 'type' => 'string' ),
						'last_name'  => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_update_user' ),
				'permission_callback' => function() {
					return current_user_can( 'edit_users' );
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
	 * Execute update-user ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Updated user or error.
	 */
	public static function execute_update_user( array $input ) {
		$user_id = absint( $input['id'] );

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		$update_data = array( 'ID' => $user_id );

		if ( isset( $input['email'] ) ) {
			$update_data['user_email'] = sanitize_email( $input['email'] );
		}

		// Update user
		$result = wp_update_user( $update_data );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Update meta fields
		if ( isset( $input['first_name'] ) ) {
			update_user_meta( $user_id, 'first_name', sanitize_text_field( $input['first_name'] ) );
		}
		if ( isset( $input['last_name'] ) ) {
			update_user_meta( $user_id, 'last_name', sanitize_text_field( $input['last_name'] ) );
		}

		return array(
			'id'         => $user_id,
			'email'      => isset( $input['email'] ) ? sanitize_email( $input['email'] ) : '',
			'first_name' => isset( $input['first_name'] ) ? sanitize_text_field( $input['first_name'] ) : '',
			'last_name'  => isset( $input['last_name'] ) ? sanitize_text_field( $input['last_name'] ) : '',
		);
	}

	/**
	 * Register delete-user ability
	 *
	 * @return void
	 */
	private static function register_delete_user(): void {
		wp_register_ability(
			'frs-users/delete-user',
			array(
				'label'       => __( 'Delete User', 'frs-wp-users' ),
				'description' => __( 'Permanently deletes a user account. This action cannot be undone.', 'frs-wp-users' ),
				'category'    => 'user-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'id' => array(
							'type'        => 'integer',
							'description' => __( 'The user ID to delete.', 'frs-wp-users' ),
						),
						'reassign' => array(
							'type'        => 'integer',
							'description' => __( 'Reassign posts to this user ID.', 'frs-wp-users' ),
						),
					),
					'required'             => array( 'id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'id'      => array( 'type' => 'integer' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_delete_user' ),
				'permission_callback' => function() {
					return current_user_can( 'delete_users' );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'    => false,
						'destructive' => true,
						'idempotent'  => true,
					),
				),
			)
		);
	}

	/**
	 * Execute delete-user ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Result or error.
	 */
	public static function execute_delete_user( array $input ) {
		$user_id = absint( $input['id'] );

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		// Prevent deleting current user
		if ( $user_id === get_current_user_id() ) {
			return new WP_Error(
				'cannot_delete_self',
				__( 'You cannot delete your own user account.', 'frs-wp-users' ),
				array( 'status' => 403 )
			);
		}

		$reassign = isset( $input['reassign'] ) ? absint( $input['reassign'] ) : null;

		require_once( ABSPATH . 'wp-admin/includes/user.php' );
		$result = wp_delete_user( $user_id, $reassign );

		if ( ! $result ) {
			return new WP_Error(
				'user_deletion_failed',
				__( 'Failed to delete user.', 'frs-wp-users' ),
				array( 'status' => 500 )
			);
		}

		return array(
			'success' => true,
			'id'      => $user_id,
		);
	}
}
