<?php
/**
 * Add QR Code Data Column Migration
 *
 * Adds qr_code_data column to store pre-generated QR codes as base64/SVG data.
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 2.1.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

/**
 * Class AddQRCodeData
 *
 * Adds qr_code_data LONGTEXT column to profiles table.
 *
 * @package FRSUsers\Database\Migrations
 */
class AddQRCodeData implements Migration {

	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;

		$table_name = $wpdb->base_prefix . 'frs_profiles';

		// Check if column already exists
		$column_exists = $wpdb->get_results(
			$wpdb->prepare(
				"SHOW COLUMNS FROM {$table_name} LIKE %s",
				'qr_code_data'
			)
		);

		if ( empty( $column_exists ) ) {
			$wpdb->query(
				"ALTER TABLE {$table_name} ADD COLUMN qr_code_data LONGTEXT NULL"
			);
		}
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public static function down() {
		global $wpdb;

		$table_name = $wpdb->base_prefix . 'frs_profiles';

		$wpdb->query(
			"ALTER TABLE {$table_name} DROP COLUMN IF EXISTS qr_code_data"
		);
	}
}
