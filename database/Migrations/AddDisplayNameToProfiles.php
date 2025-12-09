<?php
/**
 * Add display_name Column to Profiles Table Migration
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

/**
 * Class AddDisplayNameToProfiles
 *
 * Adds display_name column to the profiles table.
 * This column stores the public display name for the profile.
 *
 * @package FRSUsers\Database\Migrations
 */
class AddDisplayNameToProfiles implements Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public static function up(): void {
		global $wpdb;

		$table_name = $wpdb->base_prefix . 'frs_profiles';

		// Check if table exists
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
			error_log( 'FRS Users: Profiles table does not exist, cannot add display_name column' );
			return;
		}

		// Check if column already exists
		$column_exists = $wpdb->get_results(
			$wpdb->prepare(
				"SHOW COLUMNS FROM `{$table_name}` LIKE %s",
				'display_name'
			)
		);

		if ( ! empty( $column_exists ) ) {
			return; // Column already exists, skip
		}

		// Add the column after last_name
		$sql = "ALTER TABLE `{$table_name}` ADD COLUMN display_name VARCHAR(255) NULL AFTER last_name";

		$result = $wpdb->query( $sql );

		if ( false === $result ) {
			error_log( 'FRS Users: Failed to add display_name column to profiles table' );
		} else {
			error_log( 'FRS Users: Successfully added display_name column to profiles table' );
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public static function down(): void {
		global $wpdb;

		$table_name = $wpdb->base_prefix . 'frs_profiles';

		$sql = "ALTER TABLE `{$table_name}` DROP COLUMN IF EXISTS display_name";

		$wpdb->query( $sql );

		error_log( 'FRS Users: Removed display_name column from profiles table' );
	}
}
