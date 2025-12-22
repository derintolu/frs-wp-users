<?php
/**
 * Add Service Areas to Profiles Table Migration
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Class AddServiceAreasToProfiles
 *
 * Adds service_areas JSON column to the profiles table
 *
 * @package FRSUsers\Database\Migrations
 */
class AddServiceAreasToProfiles implements Migration {

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
			error_log( 'FRS Users: Profiles table does not exist, cannot add service_areas column' );
			return;
		}

		// Check if column already exists
		$column_exists = $wpdb->get_results(
			"SHOW COLUMNS FROM `{$table_name}` LIKE 'service_areas'"
		);

		if ( ! empty( $column_exists ) ) {
			// Column already exists, skip
			return;
		}

		// Add the service_areas column after specialties
		$sql = "ALTER TABLE `{$table_name}` ADD COLUMN service_areas JSON NULL AFTER specialties";

		$result = $wpdb->query( $sql );

		if ( false === $result ) {
			error_log( 'FRS Users: Failed to add service_areas column to profiles table: ' . $wpdb->last_error );
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

		// Drop the service_areas column
		$sql = "ALTER TABLE `{$table_name}` DROP COLUMN IF EXISTS service_areas";

		$wpdb->query( $sql );
	}
}
