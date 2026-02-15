<?php
/**
 * PHPUnit bootstrap file for FRS User Profiles plugin.
 *
 * @package FRSUsers
 */

declare(strict_types=1);

// Load Composer autoloader.
$composer_autoload = dirname( __DIR__ ) . '/vendor/autoload.php';
if ( file_exists( $composer_autoload ) ) {
    require_once $composer_autoload;
}

// Load WP_Error stub for unit tests.
require_once __DIR__ . '/stubs/WP_Error.php';

// Load Brain\Monkey for WordPress function mocking in unit tests.
if ( class_exists( '\Brain\Monkey' ) ) {
    require_once __DIR__ . '/Unit/TestCase.php';
}

// Check if we're running integration tests (need WordPress).
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Check if WordPress test suite is available for integration tests.
if ( file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    // Load WordPress test functions.
    require_once $_tests_dir . '/includes/functions.php';

    /**
     * Manually load the plugin for integration tests.
     */
    function _manually_load_plugin() {
        require dirname( __DIR__ ) . '/frs-wp-users.php';
    }
    tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

    // Load the WordPress test suite.
    require $_tests_dir . '/includes/bootstrap.php';

    // Load integration test base class.
    require_once __DIR__ . '/Integration/TestCase.php';
}

// Define plugin constants if not already defined.
if ( ! defined( 'FRS_USERS_VERSION' ) ) {
    define( 'FRS_USERS_VERSION', '2.1.0' );
}
if ( ! defined( 'FRS_USERS_PATH' ) ) {
    define( 'FRS_USERS_PATH', dirname( __DIR__ ) . '/' );
}
if ( ! defined( 'FRS_USERS_URL' ) ) {
    define( 'FRS_USERS_URL', 'https://example.com/wp-content/plugins/frs-wp-users/' );
}
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', '/tmp/wordpress/' );
}
