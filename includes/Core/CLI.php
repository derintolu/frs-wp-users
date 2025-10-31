<?php
/**
 * WP-CLI Commands
 *
 * Provides WP-CLI commands for FRS Users plugin.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Database\Migrations\MigratePersonCPT;
use FRSUsers\Models\Profile;

/**
 * Class CLI
 *
 * WP-CLI commands for profile management and migrations.
 *
 * @package FRSUsers\Core
 */
class CLI {

	/**
	 * Initialize CLI commands
	 *
	 * @return void
	 */
	public static function init() {
		if ( ! class_exists( 'WP_CLI' ) ) {
			return;
		}

		\WP_CLI::add_command( 'frs-users migrate-person-cpt', array( __CLASS__, 'migrate_person_cpt' ) );
		\WP_CLI::add_command( 'frs-users list-profiles', array( __CLASS__, 'list_profiles' ) );
		\WP_CLI::add_command( 'frs-users list-guests', array( __CLASS__, 'list_guests' ) );
		\WP_CLI::add_command( 'frs-users create-user', array( __CLASS__, 'create_user_account' ) );
	}

	/**
	 * Migrate Person CPT to profiles table
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users migrate-person-cpt
	 *
	 * @when after_wp_load
	 */
	public static function migrate_person_cpt( $args, $assoc_args ) {
		\WP_CLI::line( 'Starting Person CPT migration...' );

		// Check if already migrated
		if ( get_option( 'frs_users_person_cpt_migrated' ) ) {
			\WP_CLI::confirm( 'Migration has already been run. Do you want to run it again? (This may create duplicates)' );
		}

		MigratePersonCPT::up();

		$stats = get_option( 'frs_users_migration_stats', array() );

		\WP_CLI::success( sprintf(
			'Migration complete! Migrated: %d, Skipped: %d, Errors: %d',
			$stats['migrated'] ?? 0,
			$stats['skipped'] ?? 0,
			$stats['errors'] ?? 0
		) );
	}

	/**
	 * List all profiles
	 *
	 * ## OPTIONS
	 *
	 * [--type=<type>]
	 * : Filter by profile type (loan_officer, realtor_partner, staff, leadership, assistant)
	 *
	 * [--format=<format>]
	 * : Output format (table, json, csv). Default: table
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users list-profiles
	 *     wp frs-users list-profiles --type=loan_officer
	 *     wp frs-users list-profiles --format=json
	 *
	 * @when after_wp_load
	 */
	public static function list_profiles( $args, $assoc_args ) {
		$type   = $assoc_args['type'] ?? '';
		$format = $assoc_args['format'] ?? 'table';

		if ( $type ) {
			$profiles = Profile::get_by_type( $type, array( 'limit' => 9999 ) );
		} else {
			$profiles = Profile::get_guests( array( 'limit' => 9999 ) );
		}

		if ( empty( $profiles ) ) {
			\WP_CLI::warning( 'No profiles found' );
			return;
		}

		$data = array_map( function( $profile ) {
			return array(
				'ID'           => $profile->id,
				'Name'         => $profile->first_name . ' ' . $profile->last_name,
				'Email'        => $profile->email,
				'User ID'      => $profile->user_id ?? 'Guest',
				'Types'        => implode( ', ', $profile->get_types() ),
				'Created'      => $profile->created_at,
			);
		}, $profiles );

		\WP_CLI\Utils\format_items( $format, $data, array( 'ID', 'Name', 'Email', 'User ID', 'Types', 'Created' ) );
	}

	/**
	 * List Profile Only profiles (no user account)
	 *
	 * ## OPTIONS
	 *
	 * [--format=<format>]
	 * : Output format (table, json, csv). Default: table
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users list-guests
	 *     wp frs-users list-guests --format=json
	 *
	 * @when after_wp_load
	 */
	public static function list_guests( $args, $assoc_args ) {
		$format = $assoc_args['format'] ?? 'table';

		$profiles = Profile::get_guests( array( 'limit' => 9999 ) );

		if ( empty( $profiles ) ) {
			\WP_CLI::warning( 'No Profile Only profiles found' );
			return;
		}

		$data = array_map( function( $profile ) {
			return array(
				'ID'      => $profile->id,
				'Name'    => $profile->first_name . ' ' . $profile->last_name,
				'Email'   => $profile->email,
				'Types'   => implode( ', ', $profile->get_types() ),
				'Created' => $profile->created_at,
			);
		}, $profiles );

		\WP_CLI\Utils\format_items( $format, $data, array( 'ID', 'Name', 'Email', 'Types', 'Created' ) );
	}

	/**
	 * Create user account for a Profile Only profile (upgrade to Profile+)
	 *
	 * ## OPTIONS
	 *
	 * <profile_id>
	 * : Profile ID
	 *
	 * [--username=<username>]
	 * : Custom username (auto-generated if not provided)
	 *
	 * [--send-email]
	 * : Send password reset email to the user
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users create-user 123
	 *     wp frs-users create-user 123 --username=john.doe --send-email
	 *
	 * @when after_wp_load
	 */
	public static function create_user_account( $args, $assoc_args ) {
		$profile_id = absint( $args[0] );
		$username   = $assoc_args['username'] ?? '';
		$send_email = isset( $assoc_args['send-email'] );

		if ( ! $profile_id ) {
			\WP_CLI::error( 'Invalid profile ID' );
		}

		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			\WP_CLI::error( 'Profile not found' );
		}

		if ( ! $profile->is_guest() ) {
			\WP_CLI::error( sprintf( 'Profile is already linked to user ID %d', $profile->user_id ) );
		}

		// Generate username if not provided
		if ( empty( $username ) ) {
			$username = sanitize_user( strtolower( $profile->first_name . '.' . $profile->last_name ) );
			$username = str_replace( ' ', '', $username );
		}

		// Check if username exists
		if ( username_exists( $username ) ) {
			$username = $username . wp_rand( 1, 999 );
			\WP_CLI::warning( sprintf( 'Username already exists, using: %s', $username ) );
		}

		// Create user
		$user_data = array(
			'user_login' => $username,
			'user_email' => $profile->email,
			'first_name' => $profile->first_name,
			'last_name'  => $profile->last_name,
			'role'       => 'subscriber',
		);

		$user_id = wp_insert_user( $user_data );

		if ( is_wp_error( $user_id ) ) {
			\WP_CLI::error( $user_id->get_error_message() );
		}

		// Add profile types as roles
		$profile_types = $profile->get_types();
		$user = new \WP_User( $user_id );
		foreach ( $profile_types as $type ) {
			$user->add_role( $type );
		}

		// Link profile
		$profile->link_user( $user_id );

		// Send email
		if ( $send_email ) {
			wp_send_new_user_notifications( $user_id, 'user' );
			\WP_CLI::success( sprintf( 'User account created (ID: %d, Username: %s) and password reset email sent', $user_id, $username ) );
		} else {
			\WP_CLI::success( sprintf( 'User account created (ID: %d, Username: %s)', $user_id, $username ) );
		}
	}
}
