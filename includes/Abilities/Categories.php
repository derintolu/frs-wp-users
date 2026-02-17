<?php
/**
 * Ability Categories Registration
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Abilities;

/**
 * Class Categories
 *
 * Registers all ability categories for the FRS User Profiles plugin.
 */
class Categories {

	/**
	 * Register all categories
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_user_management();
		self::register_profile_management();
		self::register_role_management();
		self::register_sync_operations();
	}

	/**
	 * Register user-management category
	 *
	 * @return void
	 */
	private static function register_user_management(): void {
		wp_register_ability_category(
			'user-management',
			array(
				'label'       => __( 'User Management', 'frs-wp-users' ),
				'description' => __( 'Abilities for creating, reading, updating, and deleting user accounts with support for loan officers, realtors, and guest profiles.', 'frs-wp-users' ),
			)
		);
	}

	/**
	 * Register profile-management category
	 *
	 * @return void
	 */
	private static function register_profile_management(): void {
		wp_register_ability_category(
			'profile-management',
			array(
				'label'       => __( 'Profile Management', 'frs-wp-users' ),
				'description' => __( 'Abilities for managing user profiles including public profiles, guest profiles, custom fields via Carbon Fields, and avatar management.', 'frs-wp-users' ),
			)
		);
	}

	/**
	 * Register role-management category
	 *
	 * @return void
	 */
	private static function register_role_management(): void {
		wp_register_ability_category(
			'role-management',
			array(
				'label'       => __( 'Role Management', 'frs-wp-users' ),
				'description' => __( 'Abilities for managing user roles and capabilities including loan_officer, partner, and custom role assignments.', 'frs-wp-users' ),
			)
		);
	}

	/**
	 * Register sync-operations category
	 *
	 * @return void
	 */
	private static function register_sync_operations(): void {
		wp_register_ability_category(
			'sync-operations',
			array(
				'label'       => __( 'Sync Operations', 'frs-wp-users' ),
				'description' => __( 'Abilities for triggering webhook-based synchronization operations with external systems and monitoring sync status.', 'frs-wp-users' ),
			)
		);
	}
}
