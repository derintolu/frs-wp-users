<?php
/**
 * Plugin Installation
 *
 * Handles plugin activation tasks like creating database tables.
 * Supports both single-site and multisite network activation.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Database\Migrations\Profiles;
use FRSUsers\Database\Migrations\ProfileTypes;
use FRSUsers\Database\Migrations\AddServiceAreasToProfiles;
use FRSUsers\Database\Migrations\AddDisplayNameToProfiles;
use FRSUsers\Database\Migrations\AddProfileSlug;
use FRSUsers\Database\Migrations\AddCompanyAndLogo;
use FRSUsers\Database\Migrations\AddQRCodeData;
use FRSUsers\Traits\Base;

/**
 * Class Install
 *
 * This class is responsible for the functionality
 * which is required to set up after activating the plugin.
 *
 * In multisite, this plugin uses network-wide tables (wp_frs_profiles)
 * so profiles are shared across all sites in the network.
 *
 * @package FRSUsers\Core
 */
class Install {

	use Base;

	/**
	 * Initialize the class
	 *
	 * Runs on plugin activation (single-site or network).
	 *
	 * @param bool $network_wide Whether plugin is network activated.
	 * @return void
	 */
	public function init( $network_wide = false ) {
		// Tables are always network-wide in multisite
		$this->install_tables();
		$this->setup_capabilities( $network_wide );
		$this->flush_rewrite_rules();

		// Store version in network options for multisite
		if ( is_multisite() ) {
			update_network_option( get_current_network_id(), 'frs_users_version', \FRS_USERS_VERSION );
			update_network_option( get_current_network_id(), 'frs_users_installed', time() );
		} else {
			update_option( 'frs_users_version', \FRS_USERS_VERSION );
			update_option( 'frs_users_installed', time() );
		}
	}

	/**
	 * Install the database tables
	 *
	 * Tables are created on the main site (using base_prefix) so they're
	 * shared across all sites in the network.
	 *
	 * @return void
	 */
	private function install_tables() {
		// Create profiles table (network-wide)
		Profiles::up();

		// Create profile types junction table (network-wide)
		ProfileTypes::up();

		// Run column migrations
		AddServiceAreasToProfiles::up();
		AddDisplayNameToProfiles::up();
		AddProfileSlug::up();
		AddCompanyAndLogo::up();
		AddQRCodeData::up();
	}

	/**
	 * Setup custom capabilities
	 *
	 * @param bool $network_wide Whether this is network activation.
	 * @return void
	 */
	private function setup_capabilities( $network_wide = false ) {
		if ( $network_wide && is_multisite() ) {
			// For network activation, add caps on all sites
			$sites = get_sites( array( 'number' => 0 ) );
			foreach ( $sites as $site ) {
				switch_to_blog( $site->blog_id );
				$this->add_caps_to_admin();
				restore_current_blog();
			}
		} else {
			$this->add_caps_to_admin();
		}
	}

	/**
	 * Add capabilities to administrator role
	 *
	 * @return void
	 */
	private function add_caps_to_admin() {
		$admin_role = get_role( 'administrator' );

		if ( $admin_role ) {
			$admin_role->add_cap( 'manage_frs_profiles' );
			$admin_role->add_cap( 'edit_frs_profiles' );
			$admin_role->add_cap( 'delete_frs_profiles' );
		}
	}

	/**
	 * Flush rewrite rules
	 *
	 * @return void
	 */
	private function flush_rewrite_rules() {
		flush_rewrite_rules();
	}

	/**
	 * Migrate data from per-site tables to network table
	 *
	 * Call this once to consolidate existing per-site profiles
	 * into the single network-wide table.
	 *
	 * @return array Migration results
	 */
	public static function migrate_to_network_table() {
		global $wpdb;

		$results = array(
			'migrated' => 0,
			'skipped'  => 0,
			'errors'   => array(),
		);

		if ( ! is_multisite() ) {
			return $results;
		}

		$base_table = $wpdb->base_prefix . 'frs_profiles';
		$sites      = get_sites( array( 'number' => 0 ) );

		foreach ( $sites as $site ) {
			// Skip main site (already using base table)
			if ( $site->blog_id == 1 ) {
				continue;
			}

			$site_table = $wpdb->base_prefix . $site->blog_id . '_frs_profiles';

			// Check if site-specific table exists
			if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $site_table ) ) !== $site_table ) {
				continue;
			}

			// Get all profiles from site table
			$profiles = $wpdb->get_results( "SELECT * FROM {$site_table}" );

			foreach ( $profiles as $profile ) {
				// Check if profile already exists in network table (by email or user_id)
				$existing = null;

				if ( ! empty( $profile->user_id ) ) {
					$existing = $wpdb->get_row( $wpdb->prepare(
						"SELECT id FROM {$base_table} WHERE user_id = %d",
						$profile->user_id
					) );
				}

				if ( ! $existing && ! empty( $profile->email ) ) {
					$existing = $wpdb->get_row( $wpdb->prepare(
						"SELECT id FROM {$base_table} WHERE email = %s",
						$profile->email
					) );
				}

				if ( $existing ) {
					$results['skipped']++;
					continue;
				}

				// Insert into network table
				$data = (array) $profile;
				unset( $data['id'] ); // Let it auto-increment

				$inserted = $wpdb->insert( $base_table, $data );

				if ( $inserted ) {
					$results['migrated']++;
				} else {
					$results['errors'][] = sprintf(
						'Failed to migrate profile %d from site %d: %s',
						$profile->id,
						$site->blog_id,
						$wpdb->last_error
					);
				}
			}
		}

		return $results;
	}
}
