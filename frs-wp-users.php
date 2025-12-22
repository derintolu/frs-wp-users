<?php
/**
 * Plugin Name: FRS User Profiles
 * Description: Advanced user profile management system with guest profiles, Carbon Fields integration, and REST API. Manages profiles for loan officers, real estate agents, staff, leadership, and assistants.
 * Author: 21st Century Lending
 * Author URI: https://hub21loan.com
 * License: GPLv2
 * Version: 2.0.0
 * Text Domain: frs-users
 * Domain Path: /languages
 *
 * @package FRSUsers
 */

use FRSUsers\Core\Install;

defined( 'ABSPATH' ) || exit;

// Define plugin constants
define( 'FRS_USERS_VERSION', '2.0.0' );
define( 'FRS_USERS_PLUGIN_FILE', __FILE__ );
define( 'FRS_USERS_DIR', plugin_dir_path( __FILE__ ) );
define( 'FRS_USERS_URL', plugin_dir_url( __FILE__ ) );
define( 'FRS_USERS_ASSETS_URL', FRS_USERS_URL . 'assets' );

require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';

// Load DataKit SDK if available and not already loaded
if ( ! class_exists( 'DataKit\DataViews\DataView\DataView' ) ) {
	if ( file_exists( plugin_dir_path( __FILE__ ) . 'libs/datakit/vendor/autoload.php' ) ) {
		require_once plugin_dir_path( __FILE__ ) . 'libs/datakit/vendor/autoload.php';
	}
}

require_once plugin_dir_path( __FILE__ ) . 'plugin.php';

/**
 * Initializes the FRS Users plugin when plugins are loaded.
 *
 * @since 1.0.0
 * @return void
 */
function frs_users_init() {
	FRSUsers::get_instance()->init();
}

// Hook for plugin initialization
add_action( 'plugins_loaded', 'frs_users_init' );

// Hook for plugin activation
register_activation_hook( __FILE__, array( Install::get_instance(), 'init' ) );

// Hook for Carbon Fields initialization
add_action( 'after_setup_theme', function() {
	\Carbon_Fields\Carbon_Fields::boot();
} );
