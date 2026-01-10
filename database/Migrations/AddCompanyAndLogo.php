<?php
/**
 * Add Company and Logo Fields Migration
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 2.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

/**
 * Class AddCompanyAndLogo
 *
 * Adds company_name and logo_id columns to profiles table.
 *
 * @package FRSUsers\Database\Migrations
 */
class AddCompanyAndLogo implements Migration {

	/**
	 * Table name for the migration.
	 *
	 * @var string
	 */
	private static $table = 'frs_profiles';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;

		$table_name = $wpdb->base_prefix . self::$table;

		// Check if columns already exist
		$columns = $wpdb->get_results( "SHOW COLUMNS FROM {$table_name}" );
		$existing = array_column( $columns, 'Field' );

		// Add company_name if not exists
		if ( ! in_array( 'company_name', $existing, true ) ) {
			$wpdb->query( "ALTER TABLE {$table_name} ADD COLUMN company_name VARCHAR(255) NULL AFTER office" );
		}

		// Add company_logo_id if not exists
		if ( ! in_array( 'company_logo_id', $existing, true ) ) {
			$wpdb->query( "ALTER TABLE {$table_name} ADD COLUMN company_logo_id BIGINT UNSIGNED NULL AFTER company_name" );
		}

		// Add company_website if not exists
		if ( ! in_array( 'company_website', $existing, true ) ) {
			$wpdb->query( "ALTER TABLE {$table_name} ADD COLUMN company_website VARCHAR(500) NULL AFTER company_logo_id" );
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

		$wpdb->query( "ALTER TABLE {$table_name} DROP COLUMN IF EXISTS company_name" );
		$wpdb->query( "ALTER TABLE {$table_name} DROP COLUMN IF EXISTS company_logo_id" );
		$wpdb->query( "ALTER TABLE {$table_name} DROP COLUMN IF EXISTS company_website" );
	}
}
