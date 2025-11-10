<?php
/**
 * Plugin Installation
 *
 * Handles plugin activation tasks like creating database tables.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Database\Migrations\Profiles;
use FRSUsers\Database\Migrations\ProfileTypes;
use FRSUsers\Database\Migrations\AddServiceAreasToProfiles;
use FRSUsers\Traits\Base;

/**
 * Class Install
 *
 * This class is responsible for the functionality
 * which is required to set up after activating the plugin.
 *
 * @package FRSUsers\Core
 */
class Install {

	use Base;

	/**
	 * Initialize the class
	 *
	 * Runs on plugin activation.
	 *
	 * @return void
	 */
	public function init() {
		$this->install_tables();
		$this->setup_capabilities();
		$this->flush_rewrite_rules();
	}

	/**
	 * Install the database tables
	 *
	 * @return void
	 */
	private function install_tables() {
		// Create profiles table
		Profiles::up();

		// Create profile types junction table
		ProfileTypes::up();

		// Add service areas column to profiles table
		AddServiceAreasToProfiles::up();

		// Set installed version
		update_option( 'frs_users_version', \FRS_USERS_VERSION );
		update_option( 'frs_users_installed', time() );
	}

	/**
	 * Setup custom capabilities
	 *
	 * @return void
	 */
	private function setup_capabilities() {
		// Get administrator role
		$admin_role = get_role( 'administrator' );

		if ( $admin_role ) {
			// Add custom capabilities for profile management
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
}
