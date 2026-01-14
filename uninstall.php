<?php
/**
 * Uninstall the plugin
 *
 * @package FRSUsers
 * @subpackage Database
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// No custom tables to drop - data stored in wp_users + wp_usermeta
// User meta with frs_ prefix will remain unless explicitly deleted
