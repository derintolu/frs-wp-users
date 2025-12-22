<?php
/**
 * Uninstall the plugin
 *
 * @package FRSUsers
 * @subpackage Database
 */

use FRSUsers\Database\Migrations\Profiles;
use FRSUsers\Database\Migrations\ProfileTypes;

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

require_once __DIR__ . '/vendor/autoload.php';

// Delete tables from database which are created by this plugin.
// Note: MigratePersonCPT is not included as it's a one-time migration, not a table creation
Profiles::down();
ProfileTypes::down();
