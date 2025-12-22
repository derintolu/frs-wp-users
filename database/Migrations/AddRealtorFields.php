<?php
/**
 * Add Realtor Partner Fields Migration
 *
 * Adds additional fields for realtor partners:
 * - office_address (separate from office name)
 * - company_name (brokerage/company)
 * - credentials (general credentials field)
 *
 * @package FRSUsers\Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Traits\Base;

defined( 'ABSPATH' ) || exit;

/**
 * Class AddRealtorFields
 *
 * Migration to add realtor-specific profile fields.
 *
 * @package FRSUsers\Database\Migrations
 */
class AddRealtorFields {

	use Base;

	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;

		$table_name      = $wpdb->base_prefix . 'frs_profiles';
		$charset_collate = $wpdb->get_charset_collate();

		// Check if columns already exist before adding
		$columns_to_add = array();

		// Check office_address
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$office_address_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$table_name,
				'office_address'
			)
		);

		if ( empty( $office_address_exists ) ) {
			$columns_to_add[] = 'ADD COLUMN `office_address` TEXT NULL AFTER `office`';
		}

		// Check company_name
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$company_name_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$table_name,
				'company_name'
			)
		);

		if ( empty( $company_name_exists ) ) {
			$columns_to_add[] = 'ADD COLUMN `company_name` VARCHAR(255) NULL AFTER `office_address`';
		}

		// Check credentials
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$credentials_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$table_name,
				'credentials'
			)
		);

		if ( empty( $credentials_exists ) ) {
			$columns_to_add[] = 'ADD COLUMN `credentials` TEXT NULL AFTER `nar_designations`';
		}

		// Execute ALTER TABLE if there are columns to add
		if ( ! empty( $columns_to_add ) ) {
			$sql = sprintf(
				'ALTER TABLE %s %s',
				$table_name,
				implode( ', ', $columns_to_add )
			);

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			$wpdb->query( $sql );
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

		$columns_to_drop = array();

		// Check if columns exist before dropping
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$office_address_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$table_name,
				'office_address'
			)
		);

		if ( ! empty( $office_address_exists ) ) {
			$columns_to_drop[] = 'DROP COLUMN `office_address`';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$company_name_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$table_name,
				'company_name'
			)
		);

		if ( ! empty( $company_name_exists ) ) {
			$columns_to_drop[] = 'DROP COLUMN `company_name`';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$credentials_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$table_name,
				'credentials'
			)
		);

		if ( ! empty( $credentials_exists ) ) {
			$columns_to_drop[] = 'DROP COLUMN `credentials`';
		}

		// Execute ALTER TABLE if there are columns to drop
		if ( ! empty( $columns_to_drop ) ) {
			$sql = sprintf(
				'ALTER TABLE %s %s',
				$table_name,
				implode( ', ', $columns_to_drop )
			);

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			$wpdb->query( $sql );
		}
	}
}
