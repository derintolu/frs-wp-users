<?php
/**
 * Database configuration using Eloquent ORM.
 *
 * Uses base_prefix for network-wide tables in multisite.
 *
 * @package FRSUsers
 * @subpackage Database
 * @since 1.0.0
 */

namespace FRSUsers\Libs\DatabaseConnection;

use Prappo\WpEloquent\Application;

// Boot with base_prefix for multisite network-wide tables
global $wpdb;

$connection = array(
	'driver'    => 'wp', // Use WordPress $wpdb wrapper
	'host'      => defined( 'DB_HOST' ) ? DB_HOST : '',
	'database'  => defined( 'DB_NAME' ) ? DB_NAME : '',
	'username'  => defined( 'DB_USER' ) ? DB_USER : '',
	'password'  => defined( 'DB_PASSWORD' ) ? DB_PASSWORD : '',
	'charset'   => $wpdb->charset ?: 'utf8mb4',
	'collation' => $wpdb->collate ?: 'utf8mb4_unicode_ci',
	'prefix'    => $wpdb->base_prefix, // Use base_prefix for network-wide tables
);

Application::boot( $connection );
