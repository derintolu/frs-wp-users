<?php
/**
 * Role Abilities
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Abilities;

use WP_Error;
use WP_User;

/**
 * Class RoleAbilities
 *
 * Registers abilities for role management operations.
 */
class RoleAbilities {

	/**
	 * Register all role abilities
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_get_user_roles();
		self::register_assign_role();
		self::register_remove_role();
	}

	/**
	 * Register get-user-roles ability
	 *
	 * @return void
	 */
	private static function register_get_user_roles(): void {
		wp_register_ability(
			'frs-users/get-user-roles',
			array(
				'label'       => __( 'Get User Roles', 'frs-wp-users' ),
				'description' => __( 'Retrieves all roles assigned to a specific user.', 'frs-wp-users' ),
				'category'    => 'role-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to get roles for.', 'frs-wp-users' ),
						),
					),
					'required'             => array( 'user_id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array( 'type' => 'integer' ),
						'roles'   => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
					),
				),
				'execute_callback' => array( self::class, 'execute_get_user_roles' ),
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
	 * Execute get-user-roles ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error User roles or error.
	 */
	public static function execute_get_user_roles( array $input ) {
		$user = get_user_by( 'id', absint( $input['user_id'] ) );

		if ( ! $user ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		return array(
			'user_id' => $user->ID,
			'roles'   => $user->roles,
		);
	}

	/**
	 * Register assign-role ability
	 *
	 * @return void
	 */
	private static function register_assign_role(): void {
		wp_register_ability(
			'frs-users/assign-role',
			array(
				'label'       => __( 'Assign Role', 'frs-wp-users' ),
				'description' => __( 'Assigns a role to a user. Supports loan_officer, partner, and other WordPress roles.', 'frs-wp-users' ),
				'category'    => 'role-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to assign role to.', 'frs-wp-users' ),
						),
						'role' => array(
							'type'        => 'string',
							'description' => __( 'Role to assign.', 'frs-wp-users' ),
							'enum'        => array( 'loan_officer', 're_agent', 'escrow_officer', 'property_manager', 'dual_license', 'partner', 'staff', 'leadership', 'assistant', 'subscriber', 'administrator' ),
						),
					),
					'required'             => array( 'user_id', 'role' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'user_id' => array( 'type' => 'integer' ),
						'role'    => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_assign_role' ),
				'permission_callback' => function() {
					return current_user_can( 'promote_users' );
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
	 * Execute assign-role ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Result or error.
	 */
	public static function execute_assign_role( array $input ) {
		$user_id = absint( $input['user_id'] );
		$role = sanitize_text_field( $input['role'] );

		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		// Check if role exists
		if ( ! get_role( $role ) ) {
			return new WP_Error(
				'role_not_found',
				__( 'Role does not exist.', 'frs-wp-users' ),
				array( 'status' => 400 )
			);
		}

		$user->add_role( $role );

		return array(
			'success' => true,
			'user_id' => $user_id,
			'role'    => $role,
		);
	}

	/**
	 * Register remove-role ability
	 *
	 * @return void
	 */
	private static function register_remove_role(): void {
		wp_register_ability(
			'frs-users/remove-role',
			array(
				'label'       => __( 'Remove Role', 'frs-wp-users' ),
				'description' => __( 'Removes a role from a user. Users must have at least one role.', 'frs-wp-users' ),
				'category'    => 'role-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to remove role from.', 'frs-wp-users' ),
						),
						'role' => array(
							'type'        => 'string',
							'description' => __( 'Role to remove.', 'frs-wp-users' ),
						),
					),
					'required'             => array( 'user_id', 'role' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'user_id' => array( 'type' => 'integer' ),
						'role'    => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_remove_role' ),
				'permission_callback' => function() {
					return current_user_can( 'promote_users' );
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
	 * Execute remove-role ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Result or error.
	 */
	public static function execute_remove_role( array $input ) {
		$user_id = absint( $input['user_id'] );
		$role = sanitize_text_field( $input['role'] );

		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		// Check if user has the role
		if ( ! in_array( $role, $user->roles, true ) ) {
			return new WP_Error(
				'role_not_assigned',
				__( 'User does not have this role.', 'frs-wp-users' ),
				array( 'status' => 400 )
			);
		}

		// Prevent removing last role
		if ( count( $user->roles ) <= 1 ) {
			return new WP_Error(
				'cannot_remove_last_role',
				__( 'Cannot remove the last role. Users must have at least one role.', 'frs-wp-users' ),
				array( 'status' => 400 )
			);
		}

		$user->remove_role( $role );

		return array(
			'success' => true,
			'user_id' => $user_id,
			'role'    => $role,
		);
	}
}
