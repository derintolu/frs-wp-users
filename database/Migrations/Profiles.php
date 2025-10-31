<?php
/**
 * Profiles Table Migration
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

/**
 * Class Profiles
 *
 * Creates the profiles table for storing user profile data.
 * Supports both linked users (user_id) and guest profiles (user_id = NULL).
 *
 * @package FRSUsers\Database\Migrations
 */
class Profiles implements Migration {

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

		$table_name      = $wpdb->prefix . self::$table;
		$charset_collate = $wpdb->get_charset_collate();

		// Check if table already exists
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name ) {
			return;
		}

		$sql = "CREATE TABLE {$table_name} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NULL,
			frs_agent_id VARCHAR(100) NULL,

			-- Contact Information
			email VARCHAR(255) NOT NULL,
			first_name VARCHAR(255) NULL,
			last_name VARCHAR(255) NULL,
			phone_number VARCHAR(50) NULL,
			mobile_number VARCHAR(50) NULL,
			office VARCHAR(255) NULL,

			-- Profile
			headshot_id BIGINT UNSIGNED NULL,
			job_title VARCHAR(255) NULL,
			biography TEXT NULL,
			date_of_birth DATE NULL,
			select_person_type VARCHAR(50) NULL,

			-- Professional Details
			nmls VARCHAR(50) NULL,
			nmls_number VARCHAR(50) NULL,
			license_number VARCHAR(50) NULL,
			dre_license VARCHAR(50) NULL,
			specialties_lo JSON NULL,
			specialties JSON NULL,
			languages JSON NULL,
			awards JSON NULL,
			nar_designations JSON NULL,
			namb_certifications JSON NULL,
			brand VARCHAR(255) NULL,
			status VARCHAR(50) DEFAULT 'active',

			-- Location
			city_state VARCHAR(255) NULL,
			region VARCHAR(255) NULL,

			-- Social Media
			facebook_url VARCHAR(500) NULL,
			instagram_url VARCHAR(500) NULL,
			linkedin_url VARCHAR(500) NULL,
			twitter_url VARCHAR(500) NULL,
			youtube_url VARCHAR(500) NULL,
			tiktok_url VARCHAR(500) NULL,

			-- Tools & Platforms
			arrive VARCHAR(500) NULL,
			canva_folder_link VARCHAR(500) NULL,
			niche_bio_content LONGTEXT NULL,
			personal_branding_images JSON NULL,

			-- Additional Fields
			loan_officer_profile BIGINT UNSIGNED NULL,
			loan_officer_user BIGINT UNSIGNED NULL,

			-- Metadata
			is_active BOOLEAN DEFAULT 1,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
			synced_to_fluentcrm_at DATETIME NULL,

			PRIMARY KEY (id),
			UNIQUE KEY email (email),
			KEY user_id (user_id),
			KEY frs_agent_id (frs_agent_id),
			KEY is_active (is_active),
			KEY created_at (created_at)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		// Verify table was created
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
			error_log( 'FRS Users: Failed to create profiles table' );
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public static function down() {
		global $wpdb;

		$table_name = $wpdb->prefix . self::$table;
		$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );
	}
}
