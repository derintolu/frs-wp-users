<?php
/**
 * SSO Connections Migration
 *
 * Manages both OAuth clients (sites that use us as provider)
 * and OAuth providers (external services we authenticate against)
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Class SSOConnections
 *
 * Creates tables for managing SSO connections
 *
 * @since 1.0.0
 */
class SSOConnections implements Migration {

	/**
	 * Run the migration
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function up(): void {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		// Table for OAuth clients (sites that use hub21 as identity provider)
		$clients_table = $wpdb->base_prefix . 'frs_sso_clients';
		$clients_sql   = "CREATE TABLE IF NOT EXISTS {$clients_table} (
			id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			description text DEFAULT NULL,
			client_id varchar(255) NOT NULL,
			client_secret varchar(255) NOT NULL,
			redirect_uris text NOT NULL,
			grant_types varchar(255) DEFAULT 'authorization_code',
			scope varchar(500) DEFAULT 'openid profile email',
			logo_url varchar(500) DEFAULT NULL,
			website_url varchar(500) DEFAULT NULL,
			is_active tinyint(1) DEFAULT 1,
			last_used_at datetime DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY client_id (client_id),
			KEY is_active (is_active),
			KEY created_at (created_at)
		) {$charset_collate};";

		// Table for OAuth providers (external services we can authenticate against)
		$providers_table = $wpdb->base_prefix . 'frs_sso_providers';
		$providers_sql   = "CREATE TABLE IF NOT EXISTS {$providers_table} (
			id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			provider_type varchar(50) NOT NULL,
			description text DEFAULT NULL,
			client_id varchar(255) NOT NULL,
			client_secret varchar(255) NOT NULL,
			authorization_endpoint varchar(500) NOT NULL,
			token_endpoint varchar(500) NOT NULL,
			userinfo_endpoint varchar(500) DEFAULT NULL,
			scope varchar(500) DEFAULT 'openid profile email',
			user_mapping json DEFAULT NULL,
			sync_on_login tinyint(1) DEFAULT 1,
			auto_create_users tinyint(1) DEFAULT 1,
			is_active tinyint(1) DEFAULT 1,
			logo_url varchar(500) DEFAULT NULL,
			button_text varchar(100) DEFAULT 'Login with SSO',
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY provider_type (provider_type),
			KEY is_active (is_active)
		) {$charset_collate};";

		// Table for SSO sessions/activity log
		$sessions_table = $wpdb->base_prefix . 'frs_sso_sessions';
		$sessions_sql   = "CREATE TABLE IF NOT EXISTS {$sessions_table} (
			id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id bigint(20) UNSIGNED NOT NULL,
			connection_id bigint(20) UNSIGNED NOT NULL,
			connection_type enum('client','provider') NOT NULL,
			session_token varchar(255) DEFAULT NULL,
			ip_address varchar(45) DEFAULT NULL,
			user_agent text DEFAULT NULL,
			login_at datetime DEFAULT CURRENT_TIMESTAMP,
			logout_at datetime DEFAULT NULL,
			is_active tinyint(1) DEFAULT 1,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY connection_id (connection_id),
			KEY connection_type (connection_type),
			KEY is_active (is_active),
			KEY login_at (login_at)
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $clients_sql );
		dbDelta( $providers_sql );
		dbDelta( $sessions_sql );
	}

	/**
	 * Reverse the migration
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function down(): void {
		global $wpdb;
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->base_prefix}frs_sso_clients" );
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->base_prefix}frs_sso_providers" );
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->base_prefix}frs_sso_sessions" );
	}
}
