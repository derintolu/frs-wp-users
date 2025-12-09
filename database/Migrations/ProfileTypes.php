<?php
/**
 * Profile Types Junction Table Migration
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

/**
 * Class ProfileTypes
 *
 * Creates the profile_types junction table for many-to-many relationship
 * between profiles and their types (loan_officer, realtor_partner, etc.)
 *
 * @package FRSUsers\Database\Migrations
 */
class ProfileTypes implements Migration {

	/**
	 * Table name for the migration.
	 *
	 * @var string
	 */
	private static $table = 'frs_profile_types';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;

		// Use base_prefix for network-wide table
		$table_name      = $wpdb->base_prefix . self::$table;
		$charset_collate = $wpdb->get_charset_collate();

		// Check if table already exists
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name ) {
			return;
		}

		$sql = "CREATE TABLE {$table_name} (
			profile_id BIGINT UNSIGNED NOT NULL,
			profile_type VARCHAR(50) NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

			PRIMARY KEY (profile_id, profile_type),
			KEY profile_type (profile_type)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		// Verify table was created
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
			error_log( 'FRS Users: Failed to create profile_types table' );
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public static function down() {
		global $wpdb;

		$table_name = $wpdb->base_prefix . self::$table;
		$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );
	}
}
