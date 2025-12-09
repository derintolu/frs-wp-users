<?php
/**
 * Add profile_slug column migration
 *
 * Adds profile_slug column to existing installations.
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

/**
 * Class AddProfileSlug
 *
 * Migration to add profile_slug column.
 *
 * @package FRSUsers\Database\Migrations
 */
class AddProfileSlug {

	/**
	 * Run the migration
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;

		$table_name = $wpdb->base_prefix . 'frs_profiles';

		// Check if column already exists
		$column_exists = $wpdb->get_results(
			$wpdb->prepare(
				"SHOW COLUMNS FROM `{$table_name}` LIKE %s",
				'profile_slug'
			)
		);

		if ( empty( $column_exists ) ) {
			// Add the column
			$wpdb->query(
				"ALTER TABLE `{$table_name}`
				ADD COLUMN `profile_slug` VARCHAR(255) NULL AFTER `loan_officer_user`,
				ADD UNIQUE KEY `profile_slug` (`profile_slug`)"
			);

			error_log( 'FRS Users: Added profile_slug column to frs_profiles table' );
		} else {
			error_log( 'FRS Users: profile_slug column already exists' );
		}
	}

	/**
	 * Reverse the migration
	 *
	 * @return void
	 */
	public static function down() {
		global $wpdb;

		$table_name = $wpdb->base_prefix . 'frs_profiles';

		$wpdb->query(
			"ALTER TABLE `{$table_name}`
			DROP INDEX IF EXISTS `profile_slug`,
			DROP COLUMN IF EXISTS `profile_slug`"
		);

		error_log( 'FRS Users: Removed profile_slug column from frs_profiles table' );
	}
}
