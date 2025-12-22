<?php
/**
 * PHPUnit bootstrap file
 */

// Composer autoloader
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// WordPress test suite
if ( ! defined( 'WP_TESTS_DIR' ) ) {
	define( 'WP_TESTS_DIR', '/tmp/wordpress-tests-lib' );
}

// Give access to tests_add_filter() function
if ( file_exists( WP_TESTS_DIR . '/includes/functions.php' ) ) {
	require_once WP_TESTS_DIR . '/includes/functions.php';
}

// Mock WordPress functions for unit tests if WP test suite not installed
if ( ! function_exists( 'tests_add_filter' ) ) {
	function tests_add_filter( $hook, $callback ) {
		// Mock implementation
	}
}

