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

		\WP_CLI::add_command( 'frs-users list-profiles', array( __CLASS__, 'list_profiles' ) );
		\WP_CLI::add_command( 'frs-users generate-slugs', array( __CLASS__, 'generate_profile_slugs' ) );
		\WP_CLI::add_command( 'frs-users sync-suredash-avatars', array( __CLASS__, 'sync_suredash_avatars' ) );
		\WP_CLI::add_command( 'frs-users generate-qr-codes', array( __CLASS__, 'generate_qr_codes' ) );
		\WP_CLI::add_command( 'frs-users generate-vcards', array( __CLASS__, 'generate_vcards' ) );
		\WP_CLI::add_command( 'frs-users migrate-fields', array( __CLASS__, 'migrate_fields' ) );
		\WP_CLI::add_command( 'frs-users cleanup-fields', array( __CLASS__, 'cleanup_fields' ) );
		\WP_CLI::add_command( 'frs-users site-context', array( __CLASS__, 'site_context' ) );
		\WP_CLI::add_command( 'frs-users sync-from-hub', array( __CLASS__, 'sync_from_hub' ) );
		\WP_CLI::add_command( 'frs-users setup-sync', array( __CLASS__, 'setup_sync' ) );
	}

	/**
	 * List all profiles
	 *
	 * ## OPTIONS
	 *
	 * [--type=<type>]
	 * : Filter by company role (loan_originator, broker_associate, staff, leadership, etc.)
	 *
	 * [--format=<format>]
	 * : Output format (table, json, csv). Default: table
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users list-profiles
	 *     wp frs-users list-profiles --type=loan_originator
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
			$profiles = Profile::get_all( array( 'number' => 9999 ) );
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
				'User ID'      => $profile->user_id,
				'Types'        => implode( ', ', $profile->get_types() ),
			);
		}, $profiles );

		\WP_CLI\Utils\format_items( $format, $data, array( 'ID', 'Name', 'Email', 'User ID', 'Types' ) );
	}

	/**
	 * Generate profile slugs for profiles that don't have one
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users generate-slugs
	 *
	 * @when after_wp_load
	 */
	public static function generate_profile_slugs( $args, $assoc_args ) {
		\WP_CLI::line( 'Generating profile slugs...' );

		// Get all users with FRS roles that don't have profile slugs
		$users = get_users( array(
			'role__in'   => Roles::get_all_wp_roles(),
			'number'     => 500,
			'meta_query' => array(
				'relation' => 'OR',
				array(
					'key'     => 'frs_profile_slug',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => 'frs_profile_slug',
					'value'   => '',
					'compare' => '=',
				),
			),
		) );

		$total = count( $users );

		if ( $total === 0 ) {
			\WP_CLI::success( 'All profiles already have slugs!' );
			return;
		}

		\WP_CLI::line( sprintf( 'Found %d profiles without slugs.', $total ) );

		$generated = 0;
		$errors = 0;

		foreach ( $users as $user ) {
			$first_name = $user->first_name;
			$last_name  = $user->last_name;

			if ( empty( $first_name ) || empty( $last_name ) ) {
				\WP_CLI::warning( sprintf( 'Skipping user ID %d - missing first/last name', $user->ID ) );
				$errors++;
				continue;
			}

			// Generate unique slug
			$slug = Profile::generate_unique_slug( $first_name, $last_name, $user->ID );
			update_user_meta( $user->ID, 'frs_profile_slug', $slug );

			\WP_CLI::line( sprintf( 'Generated slug for %s %s: %s', $first_name, $last_name, $slug ) );
			$generated++;
		}

		\WP_CLI::success( sprintf( 'Generated %d slugs. Errors: %d', $generated, $errors ) );
	}

	/**
	 * Sync FRS profile headshots to SureDash avatars
	 *
	 * Copies headshot from FRS profiles to user_profile_photo user meta
	 * so SureDash displays the correct avatar instead of initials.
	 *
	 * ## OPTIONS
	 *
	 * [--force]
	 * : Overwrite existing SureDash avatars
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users sync-suredash-avatars
	 *     wp frs-users sync-suredash-avatars --force
	 *
	 * @when after_wp_load
	 */
	public static function sync_suredash_avatars( $args, $assoc_args ) {
		if ( ! function_exists( 'sd_update_user_meta' ) ) {
			\WP_CLI::error( 'SureDash plugin is not active. Please activate SureDash first.' );
		}

		$force = isset( $assoc_args['force'] );

		\WP_CLI::line( 'Syncing FRS profile headshots to SureDash avatars...' );

		// Get all users with FRS roles that have headshots
		$users = get_users( array(
			'role__in'   => Roles::get_all_wp_roles(),
			'number'     => 500,
			'meta_query' => array(
				array(
					'key'     => 'frs_headshot_id',
					'compare' => 'EXISTS',
				),
			),
		) );

		$total = count( $users );

		if ( $total === 0 ) {
			\WP_CLI::warning( 'No profiles with headshots found.' );
			return;
		}

		\WP_CLI::line( sprintf( 'Found %d profiles with headshots.', $total ) );

		$synced   = 0;
		$skipped  = 0;
		$errors   = 0;

		$progress = \WP_CLI\Utils\make_progress_bar( 'Syncing avatars', $total );

		foreach ( $users as $user ) {
			$headshot_id = get_user_meta( $user->ID, 'frs_headshot_id', true );

			// Check if profile has headshot
			if ( empty( $headshot_id ) ) {
				$skipped++;
				$progress->tick();
				continue;
			}

			$headshot_url = wp_get_attachment_url( $headshot_id );
			if ( empty( $headshot_url ) ) {
				$skipped++;
				$progress->tick();
				continue;
			}

			// Check if user already has SureDash avatar (unless --force)
			if ( ! $force ) {
				$existing_avatar = get_user_meta( $user->ID, 'user_profile_photo', true );
				if ( ! empty( $existing_avatar ) ) {
					$skipped++;
					$progress->tick();
					continue;
				}
			}

			// Sync avatar
			$result = update_user_meta( $user->ID, 'user_profile_photo', $headshot_url );

			if ( $result !== false ) {
				$synced++;
			} else {
				\WP_CLI::warning( sprintf( 'Failed to sync avatar for %s %s (User ID: %d)', $user->first_name, $user->last_name, $user->ID ) );
				$errors++;
			}

			$progress->tick();
		}

		$progress->finish();

		\WP_CLI::success( sprintf(
			'Avatar sync complete! Synced: %d, Skipped: %d, Errors: %d',
			$synced,
			$skipped,
			$errors
		) );

		if ( $skipped > 0 && ! $force ) {
			\WP_CLI::line( 'Tip: Use --force to overwrite existing SureDash avatars.' );
		}
	}

	/**
	 * Generate QR codes for all profiles
	 *
	 * Generates styled QR codes linking to /qr/{slug} and saves them
	 * as SVG files in wp-content/uploads/frs-qr-codes/. Stores the URL in user meta.
	 *
	 * ## OPTIONS
	 *
	 * [--force]
	 * : Regenerate QR codes even if they already exist
	 *
	 * [--id=<user_id>]
	 * : Generate for a specific user ID only
	 *
	 * [--type=<type>]
	 * : Profile type to generate for (loan_officer, partner, staff, leadership). Default: all active users
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users generate-qr-codes
	 *     wp frs-users generate-qr-codes --force
	 *     wp frs-users generate-qr-codes --id=123
	 *     wp frs-users generate-qr-codes --type=loan_officer
	 *
	 * @when after_wp_load
	 */
	public static function generate_qr_codes( $args, $assoc_args ) {
		$force   = isset( $assoc_args['force'] );
		$user_id = isset( $assoc_args['id'] ) ? intval( $assoc_args['id'] ) : null;
		$type    = isset( $assoc_args['type'] ) ? sanitize_text_field( $assoc_args['type'] ) : null;

		\WP_CLI::line( 'Generating QR codes for user profiles...' );

		// Check if Node.js is available
		$node_check = shell_exec( 'which node' );
		if ( empty( $node_check ) ) {
			\WP_CLI::error( 'Node.js is required to generate styled QR codes. Please install Node.js.' );
		}

		// Setup QR codes directory in uploads
		$upload_dir  = wp_upload_dir();
		$qr_dir      = $upload_dir['basedir'] . '/frs-qr-codes';
		$qr_url_base = $upload_dir['baseurl'] . '/frs-qr-codes';

		if ( ! file_exists( $qr_dir ) ) {
			wp_mkdir_p( $qr_dir );
		}

		// Build user query args
		$user_args = array(
			'meta_query' => array(
				array(
					'key'     => 'frs_is_active',
					'value'   => '1',
					'compare' => '=',
				),
			),
			'number' => 500,
		);

		// Filter by specific user
		if ( $user_id ) {
			$user_args['include'] = array( $user_id );
			unset( $user_args['meta_query'] );
		}

		// Filter by type
		if ( $type ) {
			$user_args['meta_query'][] = array(
				'key'     => 'frs_company_role',
				'value'   => $type,
				'compare' => '=',
			);
		}

		// Only get users without QR codes unless force is set
		if ( ! $force && ! $user_id ) {
			$user_args['meta_query']['relation'] = 'AND';
			$user_args['meta_query'][]           = array(
				'relation' => 'OR',
				array(
					'key'     => 'frs_qr_code_data',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => 'frs_qr_code_data',
					'value'   => '',
					'compare' => '=',
				),
			);
		}

		$users = get_users( $user_args );
		$total = count( $users );

		if ( $total === 0 ) {
			\WP_CLI::success( 'No users need QR codes generated.' );
			return;
		}

		\WP_CLI::line( sprintf( 'Found %d users to process.', $total ) );

		// Path to the QR generator script
		$script_path = FRS_USERS_DIR . 'scripts/generate-qr.js';

		if ( ! file_exists( $script_path ) ) {
			\WP_CLI::error( sprintf( 'QR generator script not found at: %s', $script_path ) );
		}

		// Make sure node_modules are installed
		$node_modules = FRS_USERS_DIR . 'scripts/node_modules';
		if ( ! file_exists( $node_modules ) ) {
			\WP_CLI::line( 'Installing Node.js dependencies...' );
			$install_cmd = sprintf( 'cd %s && npm install 2>&1', escapeshellarg( FRS_USERS_DIR . 'scripts' ) );
			shell_exec( $install_cmd );
		}

		$generated = 0;
		$errors    = 0;

		$progress = \WP_CLI\Utils\make_progress_bar( 'Generating QR codes', $total );

		foreach ( $users as $user ) {
			// Get profile slug (custom or nicename)
			$profile_slug = get_user_meta( $user->ID, 'frs_profile_slug', true );
			if ( empty( $profile_slug ) ) {
				$profile_slug = $user->user_nicename;
			}

			if ( empty( $profile_slug ) ) {
				$errors++;
				$progress->tick();
				continue;
			}

			// Build URL for QR code content - points to /qr/{slug} landing page
			$qr_content_url = home_url( '/qr/' . $profile_slug );

			// Call Node.js script to generate QR code SVG
			$cmd = sprintf(
				'node %s %s 2>&1',
				escapeshellarg( $script_path ),
				escapeshellarg( $qr_content_url )
			);

			$svg_output = shell_exec( $cmd );

			if ( $svg_output && strpos( $svg_output, '<svg' ) !== false ) {
				// Save SVG to file
				$filename = $profile_slug . '.svg';
				$filepath = $qr_dir . '/' . $filename;
				$file_url = $qr_url_base . '/' . $filename;

				if ( file_put_contents( $filepath, $svg_output ) ) {
					// Store URL in user meta
					update_user_meta( $user->ID, 'frs_qr_code_data', $file_url );
					$generated++;
				} else {
					\WP_CLI::warning( sprintf( 'Failed to save QR file for %s', $profile_slug ) );
					$errors++;
				}
			} else {
				\WP_CLI::warning( sprintf( 'Failed to generate QR for %s: %s', $profile_slug, substr( $svg_output ?? '', 0, 100 ) ) );
				$errors++;
			}

			$progress->tick();
		}

		$progress->finish();

		\WP_CLI::success( sprintf( 'QR code generation complete! Generated: %d, Errors: %d', $generated, $errors ) );
		\WP_CLI::line( sprintf( 'QR codes saved to: %s', $qr_dir ) );
	}

	/**
	 * Generate vCards for all loan officer profiles
	 *
	 * Creates vCard (.vcf) files with all profile data including embedded photos
	 * and saves them to a folder in wp-content/uploads.
	 *
	 * ## OPTIONS
	 *
	 * [--type=<type>]
	 * : Company role to generate for. Default: loan_originator
	 *
	 * [--output=<path>]
	 * : Custom output directory path
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users generate-vcards
	 *     wp frs-users generate-vcards --type=loan_originator
	 *     wp frs-users generate-vcards --output=/path/to/folder
	 *
	 * @when after_wp_load
	 */
	public static function generate_vcards( $args, $assoc_args ) {
		$type = $assoc_args['type'] ?? 'loan_originator';

		\WP_CLI::line( sprintf( 'Generating vCards for %s profiles...', $type ) );

		// Setup output directory
		if ( isset( $assoc_args['output'] ) ) {
			$output_dir = rtrim( $assoc_args['output'], '/' );
		} else {
			$upload_dir = wp_upload_dir();
			$output_dir = $upload_dir['basedir'] . '/frs-vcards';
		}

		if ( ! file_exists( $output_dir ) ) {
			if ( ! wp_mkdir_p( $output_dir ) ) {
				\WP_CLI::error( sprintf( 'Could not create output directory: %s', $output_dir ) );
			}
		}

		// Exclude executives
		$exclude_names = [
			'Blake Anthony Corkill',
			'Matthew Thompson',
			'Keith Thompson',
		];

		// Get profiles by company role
		$profiles = Profile::get_by_type( $type, array( 'limit' => 500 ) );

		$total = count( $profiles );

		if ( $total === 0 ) {
			\WP_CLI::warning( sprintf( 'No %s profiles found.', $type ) );
			return;
		}

		\WP_CLI::line( sprintf( 'Found %d profiles to process.', $total ) );

		$generated = 0;
		$skipped   = 0;
		$errors    = 0;

		$progress = \WP_CLI\Utils\make_progress_bar( 'Generating vCards', $total );

		foreach ( $profiles as $profile ) {
			// Skip profiles without names
			if ( empty( $profile->first_name ) || empty( $profile->last_name ) ) {
				$skipped++;
				$progress->tick();
				continue;
			}

			// Check if excluded
			$full_name = trim( $profile->first_name . ' ' . $profile->last_name );
			if ( in_array( $full_name, $exclude_names, true ) ) {
				$skipped++;
				$progress->tick();
				continue;
			}

			// Get headshot URL from attachment ID
			$headshot_url = '';
			if ( ! empty( $profile->headshot_id ) ) {
				$headshot_url = wp_get_attachment_url( $profile->headshot_id );
			}

			// Build profile data array for vCard generator
			$profile_data = [
				'first_name'     => $profile->first_name,
				'last_name'      => $profile->last_name,
				'email'          => $profile->email,
				'phone_number'   => $profile->phone_number,
				'mobile_number'  => $profile->mobile_number,
				'office_number'  => $profile->office ?? '',
				'job_title'      => $profile->job_title,
				'company'        => $profile->company_name ?? 'uMortgage',
				'address'        => '',
				'city_state'     => $profile->city_state,
				'zip'            => '',
				'website'        => $profile->company_website ?? '',
				'profile_slug'   => $profile->profile_slug,
				'nmls'           => $profile->nmls,
				'dre_license'    => $profile->dre_license ?? '',
				'linkedin_url'   => $profile->linkedin_url,
				'facebook_url'   => $profile->facebook_url,
				'instagram_url'  => $profile->instagram_url,
				'twitter_url'    => $profile->twitter_url,
				'youtube_url'    => $profile->youtube_url ?? '',
				'headshot_url'   => $headshot_url,
			];

			// Generate filename
			$filename = sanitize_file_name(
				strtolower( $profile->first_name . '-' . $profile->last_name ) . '.vcf'
			);
			$filepath = $output_dir . '/' . $filename;

			// Generate vCard content
			$vcard = self::generate_vcard_content( $profile_data );

			if ( file_put_contents( $filepath, $vcard ) !== false ) {
				$generated++;
			} else {
				\WP_CLI::warning( sprintf( 'Failed to save vCard for %s', $full_name ) );
				$errors++;
			}

			$progress->tick();
		}

		$progress->finish();

		\WP_CLI::success( sprintf(
			'vCard generation complete! Generated: %d, Skipped: %d, Errors: %d',
			$generated,
			$skipped,
			$errors
		) );
		\WP_CLI::line( sprintf( 'vCards saved to: %s', $output_dir ) );
	}

	/**
	 * Generate vCard content from profile data
	 *
	 * @param array $profile Profile data array.
	 * @return string vCard formatted string.
	 */
	private static function generate_vcard_content( array $profile ): string {
		$lines = [
			'BEGIN:VCARD',
			'VERSION:3.0',
		];

		// Full name
		$first = $profile['first_name'] ?? '';
		$last  = $profile['last_name'] ?? '';
		$full_name = trim( $first . ' ' . $last );

		$lines[] = 'FN:' . self::vcard_escape( $full_name );
		$lines[] = 'N:' . self::vcard_escape( $last ) . ';' . self::vcard_escape( $first ) . ';;;';

		// Organization
		if ( ! empty( $profile['company'] ) ) {
			$lines[] = 'ORG:' . self::vcard_escape( $profile['company'] );
		}

		// Job title
		if ( ! empty( $profile['job_title'] ) ) {
			$lines[] = 'TITLE:' . self::vcard_escape( $profile['job_title'] );
		}

		// Email
		if ( ! empty( $profile['email'] ) ) {
			$lines[] = 'EMAIL;TYPE=WORK:' . self::vcard_escape( $profile['email'] );
		}

		// Phone numbers
		if ( ! empty( $profile['phone_number'] ) ) {
			$lines[] = 'TEL;TYPE=WORK,VOICE:' . self::vcard_escape( self::clean_phone( $profile['phone_number'] ) );
		}

		if ( ! empty( $profile['mobile_number'] ) ) {
			$lines[] = 'TEL;TYPE=CELL,VOICE:' . self::vcard_escape( self::clean_phone( $profile['mobile_number'] ) );
		}

		// Address
		if ( ! empty( $profile['city_state'] ) ) {
			$city_state = $profile['city_state'];
			$city  = '';
			$state = '';
			if ( preg_match( '/^(.+),\s*([A-Z]{2})$/i', $city_state, $matches ) ) {
				$city  = trim( $matches[1] );
				$state = trim( $matches[2] );
			} else {
				$city = $city_state;
			}
			$lines[] = 'ADR;TYPE=WORK:;;' . self::vcard_escape( $profile['address'] ?? '' ) . ';' . self::vcard_escape( $city ) . ';' . self::vcard_escape( $state ) . ';;USA';
		}

		// Website
		if ( ! empty( $profile['website'] ) ) {
			$lines[] = 'URL:' . self::vcard_escape( $profile['website'] );
		}

		// Profile URL
		if ( ! empty( $profile['profile_slug'] ) ) {
			$lines[] = 'URL;TYPE=PROFILE:' . home_url( '/directory/lo/' . $profile['profile_slug'] );
		}

		// Photo (embedded as base64)
		if ( ! empty( $profile['headshot_url'] ) ) {
			$photo_data = self::get_photo_base64( $profile['headshot_url'] );
			if ( $photo_data ) {
				$lines[] = 'PHOTO;ENCODING=b;TYPE=' . $photo_data['type'] . ':' . $photo_data['data'];
			}
		}

		// Notes (NMLS, DRE)
		$notes = [];
		if ( ! empty( $profile['nmls'] ) ) {
			$notes[] = 'NMLS# ' . $profile['nmls'];
		}
		if ( ! empty( $profile['dre_license'] ) ) {
			$notes[] = 'DRE# ' . $profile['dre_license'];
		}
		if ( ! empty( $notes ) ) {
			$lines[] = 'NOTE:' . self::vcard_escape( implode( ' | ', $notes ) );
		}

		// Social media
		$social_fields = [
			'linkedin_url'  => 'X-SOCIALPROFILE;TYPE=linkedin',
			'facebook_url'  => 'X-SOCIALPROFILE;TYPE=facebook',
			'instagram_url' => 'X-SOCIALPROFILE;TYPE=instagram',
			'twitter_url'   => 'X-SOCIALPROFILE;TYPE=twitter',
			'youtube_url'   => 'X-SOCIALPROFILE;TYPE=youtube',
		];

		foreach ( $social_fields as $field => $property ) {
			if ( ! empty( $profile[ $field ] ) ) {
				$lines[] = $property . ':' . self::vcard_escape( $profile[ $field ] );
			}
		}

		// Revision timestamp
		$lines[] = 'REV:' . gmdate( 'Ymd\THis\Z' );
		$lines[] = 'END:VCARD';

		return implode( "\r\n", $lines ) . "\r\n";
	}

	/**
	 * Escape special characters for vCard format.
	 *
	 * @param string $str Input string.
	 * @return string Escaped string.
	 */
	private static function vcard_escape( string $str ): string {
		$str = str_replace( '\\', '\\\\', $str );
		$str = str_replace( "\n", '\\n', $str );
		$str = str_replace( "\r", '', $str );
		$str = str_replace( ';', '\\;', $str );
		$str = str_replace( ',', '\\,', $str );
		return $str;
	}

	/**
	 * Clean phone number for vCard format.
	 *
	 * @param string $phone Phone number.
	 * @return string Cleaned phone number.
	 */
	private static function clean_phone( string $phone ): string {
		$cleaned = preg_replace( '/[^\d+]/', '', $phone );
		if ( strlen( $cleaned ) === 10 ) {
			return '+1' . $cleaned;
		}
		return $cleaned;
	}

	/**
	 * Get photo as base64 encoded data.
	 *
	 * @param string $url Image URL.
	 * @return array|null Array with 'type' and 'data' keys, or null on failure.
	 */
	private static function get_photo_base64( string $url ): ?array {
		$upload_dir = wp_upload_dir();
		$local_path = null;

		// Check if it's a local file
		if ( strpos( $url, $upload_dir['baseurl'] ) !== false ) {
			$local_path = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $url );
		}

		if ( $local_path && file_exists( $local_path ) ) {
			$image_data = file_get_contents( $local_path );
			$mime = mime_content_type( $local_path );
		} else {
			// Fetch remote image
			$response = wp_remote_get( $url, [ 'timeout' => 15 ] );
			if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
				return null;
			}
			$image_data = wp_remote_retrieve_body( $response );
			$mime = wp_remote_retrieve_header( $response, 'content-type' );
		}

		if ( empty( $image_data ) ) {
			return null;
		}

		// Determine image type
		$type = 'JPEG';
		if ( strpos( $mime, 'png' ) !== false ) {
			$type = 'PNG';
		} elseif ( strpos( $mime, 'gif' ) !== false ) {
			$type = 'GIF';
		}

		return [
			'type' => $type,
			'data' => base64_encode( $image_data ),
		];
	}

	/**
	 * Migrate legacy fields to frs_ prefixed fields
	 *
	 * Consolidates redundant user meta fields and updates WordPress roles.
	 *
	 * ## OPTIONS
	 *
	 * [--dry-run]
	 * : Run without making changes, just report what would be done.
	 *
	 * ## EXAMPLES
	 *
	 *     # Preview migration
	 *     wp frs-users migrate-fields --dry-run
	 *
	 *     # Run migration
	 *     wp frs-users migrate-fields
	 *
	 * @param array $args       Positional arguments.
	 * @param array $assoc_args Associative arguments.
	 */
	public static function migrate_fields( $args, $assoc_args ) {
		$dry_run = isset( $assoc_args['dry-run'] );

		if ( $dry_run ) {
			\WP_CLI::log( '=== DRY RUN MODE - No changes will be made ===' );
		}

		\WP_CLI::log( '' );
		\WP_CLI::log( 'Starting field migration...' );
		\WP_CLI::log( '' );

		// Register new roles first
		\WP_CLI::log( 'Registering new WordPress roles...' );
		Migration::register_roles();
		\WP_CLI::success( 'Roles registered: loan_originator, broker_associate, sales_associate, dual_license' );
		\WP_CLI::log( '' );

		// Run the migration
		$results = Migration::run( $dry_run );

		\WP_CLI::log( '=== MIGRATION RESULTS ===' );
		\WP_CLI::log( '' );
		\WP_CLI::log( sprintf( 'Users processed:      %d', $results['users_processed'] ) );
		\WP_CLI::log( sprintf( 'Fields migrated:      %d', $results['fields_migrated'] ) );
		\WP_CLI::log( sprintf( 'Roles updated:        %d (loan_officer -> loan_originator)', $results['roles_updated'] ) );
		\WP_CLI::log( sprintf( 'Profile types set:    %d', $results['types_set'] ) );
		\WP_CLI::log( sprintf( 'Unused fields deleted: %d', $results['fields_deleted'] ) );
		\WP_CLI::log( '' );

		if ( ! empty( $results['errors'] ) ) {
			\WP_CLI::warning( 'Errors encountered:' );
			foreach ( $results['errors'] as $error ) {
				\WP_CLI::log( '  - ' . $error );
			}
		}

		if ( $dry_run ) {
			\WP_CLI::log( '' );
			\WP_CLI::log( 'This was a dry run. Run without --dry-run to apply changes.' );
		} else {
			\WP_CLI::success( 'Migration complete!' );
			\WP_CLI::log( '' );
			\WP_CLI::log( 'Next step: Run "wp frs-users cleanup-fields" to remove legacy fields.' );
		}
	}

	/**
	 * Clean up legacy fields after migration
	 *
	 * Removes legacy meta keys after data has been migrated to frs_ keys.
	 * WARNING: Only run this after verifying the migration was successful!
	 *
	 * ## OPTIONS
	 *
	 * [--dry-run]
	 * : Run without making changes, just report what would be done.
	 *
	 * [--yes]
	 * : Skip confirmation prompt.
	 *
	 * ## EXAMPLES
	 *
	 *     # Preview cleanup
	 *     wp frs-users cleanup-fields --dry-run
	 *
	 *     # Run cleanup
	 *     wp frs-users cleanup-fields --yes
	 *
	 * @param array $args       Positional arguments.
	 * @param array $assoc_args Associative arguments.
	 */
	public static function cleanup_fields( $args, $assoc_args ) {
		$dry_run = isset( $assoc_args['dry-run'] );

		if ( $dry_run ) {
			\WP_CLI::log( '=== DRY RUN MODE - No changes will be made ===' );
			\WP_CLI::log( '' );
		} else {
			\WP_CLI::warning( 'This will permanently delete legacy meta fields!' );
			\WP_CLI::warning( 'Make sure you have run "wp frs-users migrate-fields" first.' );
			\WP_CLI::log( '' );

			if ( ! isset( $assoc_args['yes'] ) ) {
				\WP_CLI::confirm( 'Are you sure you want to proceed?' );
			}
		}

		\WP_CLI::log( 'Cleaning up legacy fields...' );
		\WP_CLI::log( '' );

		$cleaned = Migration::cleanup_legacy_fields( $dry_run );

		\WP_CLI::log( sprintf( 'Legacy field records %s: %d', $dry_run ? 'to delete' : 'deleted', $cleaned ) );
		\WP_CLI::log( '' );

		if ( $dry_run ) {
			\WP_CLI::log( 'This was a dry run. Run without --dry-run to apply changes.' );
		} else {
			\WP_CLI::success( 'Cleanup complete!' );
		}
	}

	/**
	 * Display current site context configuration
	 *
	 * ## EXAMPLES
	 *
	 *     wp frs-users site-context
	 *
	 * @when after_wp_load
	 */
	public static function site_context( $args, $assoc_args ) {
		$context = Roles::get_site_context();
		$config  = Roles::get_site_context_config();
		$locked  = Roles::is_context_locked();

		\WP_CLI::log( '' );
		\WP_CLI::log( '=== FRS Site Context ===' );
		\WP_CLI::log( '' );
		\WP_CLI::log( sprintf( 'Current Context:    %s', $context ) );
		\WP_CLI::log( sprintf( 'Label:              %s', $config['label'] ) );
		\WP_CLI::log( sprintf( 'Locked by constant: %s', $locked ? 'Yes (FRS_SITE_CONTEXT)' : 'No' ) );
		\WP_CLI::log( sprintf( 'Profile Editing:    %s', $config['profile_editing'] ? 'Enabled' : 'Disabled (read-only)' ) );
		\WP_CLI::log( '' );
		\WP_CLI::log( 'Active Company Roles:' );
		foreach ( $config['company_roles'] as $role ) {
			\WP_CLI::log( sprintf( '  - %s', $role ) );
		}
		\WP_CLI::log( '' );
		\WP_CLI::log( 'Active URL Prefixes:' );
		foreach ( $config['url_prefixes'] as $prefix ) {
			\WP_CLI::log( sprintf( '  - /%s/', $prefix ) );
		}
		\WP_CLI::log( '' );

		// Show sync settings
		$hub_url = get_option( 'frs_hub_url', '' );
		$webhook_secret = get_option( 'frs_webhook_secret', '' );

		\WP_CLI::log( '=== Sync Settings ===' );
		\WP_CLI::log( '' );
		\WP_CLI::log( sprintf( 'Hub URL:        %s', $hub_url ?: '(not configured)' ) );
		\WP_CLI::log( sprintf( 'Webhook Secret: %s', $webhook_secret ? '****' . substr( $webhook_secret, -4 ) : '(not configured)' ) );
		\WP_CLI::log( '' );
	}

	/**
	 * Sync profiles from the hub site
	 *
	 * Pulls profile data from the hub's REST API and creates/updates local users.
	 * Use this in development to sync data without webhooks.
	 *
	 * ## OPTIONS
	 *
	 * [--hub-url=<url>]
	 * : Hub site URL. Uses saved option if not provided.
	 *
	 * [--type=<type>]
	 * : Only sync profiles of this company role type.
	 *
	 * [--limit=<number>]
	 * : Maximum profiles to sync. Default: all.
	 *
	 * [--dry-run]
	 * : Preview changes without making them.
	 *
	 * ## EXAMPLES
	 *
	 *     # Sync all profiles from hub
	 *     wp frs-users sync-from-hub --hub-url=https://myhub21.com
	 *
	 *     # Sync only loan originators
	 *     wp frs-users sync-from-hub --type=loan_originator
	 *
	 *     # Preview what would be synced
	 *     wp frs-users sync-from-hub --dry-run
	 *
	 * @when after_wp_load
	 */
	public static function sync_from_hub( $args, $assoc_args ) {
		$hub_url = $assoc_args['hub-url'] ?? get_option( 'frs_hub_url', '' );
		$type    = $assoc_args['type'] ?? '';
		$limit   = isset( $assoc_args['limit'] ) ? intval( $assoc_args['limit'] ) : 0;
		$dry_run = isset( $assoc_args['dry-run'] );

		if ( empty( $hub_url ) ) {
			\WP_CLI::error( 'Hub URL not configured. Use --hub-url or run: wp frs-users setup-sync' );
		}

		// Save hub URL for future use
		if ( ! empty( $assoc_args['hub-url'] ) ) {
			update_option( 'frs_hub_url', $hub_url );
		}

		if ( $dry_run ) {
			\WP_CLI::log( '=== DRY RUN MODE ===' );
		}

		\WP_CLI::log( '' );
		\WP_CLI::log( sprintf( 'Syncing profiles from: %s', $hub_url ) );
		\WP_CLI::log( '' );

		// Build API URL
		$api_url = trailingslashit( $hub_url ) . 'wp-json/frs-users/v1/profiles';
		$query_args = array( 'per_page' => 1000 );
		if ( $type ) {
			$query_args['type'] = $type;
		}
		$api_url = add_query_arg( $query_args, $api_url );

		\WP_CLI::log( sprintf( 'Fetching from: %s', $api_url ) );

		// Fetch profiles from hub
		$response = wp_remote_get( $api_url, array(
			'timeout' => 60,
			'headers' => array(
				'Accept' => 'application/json',
			),
		) );

		if ( is_wp_error( $response ) ) {
			\WP_CLI::error( sprintf( 'Failed to fetch from hub: %s', $response->get_error_message() ) );
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( $status_code !== 200 ) {
			\WP_CLI::error( sprintf( 'Hub returned HTTP %d', $status_code ) );
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( ! isset( $data['data'] ) || ! is_array( $data['data'] ) ) {
			\WP_CLI::error( 'Invalid response from hub API' );
		}

		$profiles = $data['data'];
		$total    = count( $profiles );

		if ( $limit > 0 && $total > $limit ) {
			$profiles = array_slice( $profiles, 0, $limit );
			$total    = count( $profiles );
		}

		\WP_CLI::log( sprintf( 'Found %d profiles to sync', $total ) );
		\WP_CLI::log( '' );

		if ( $total === 0 ) {
			\WP_CLI::success( 'No profiles to sync.' );
			return;
		}

		$created  = 0;
		$updated  = 0;
		$skipped  = 0;
		$errors   = 0;

		$progress = \WP_CLI\Utils\make_progress_bar( 'Syncing profiles', $total );

		foreach ( $profiles as $profile ) {
			$result = self::sync_single_profile( $profile, $dry_run );

			switch ( $result ) {
				case 'created':
					$created++;
					break;
				case 'updated':
					$updated++;
					break;
				case 'skipped':
					$skipped++;
					break;
				case 'error':
					$errors++;
					break;
			}

			$progress->tick();
		}

		$progress->finish();

		\WP_CLI::log( '' );
		\WP_CLI::log( '=== SYNC RESULTS ===' );
		\WP_CLI::log( sprintf( 'Created: %d', $created ) );
		\WP_CLI::log( sprintf( 'Updated: %d', $updated ) );
		\WP_CLI::log( sprintf( 'Skipped: %d', $skipped ) );
		\WP_CLI::log( sprintf( 'Errors:  %d', $errors ) );
		\WP_CLI::log( '' );

		if ( $dry_run ) {
			\WP_CLI::log( 'This was a dry run. Run without --dry-run to apply changes.' );
		} else {
			\WP_CLI::success( 'Sync complete!' );
		}
	}

	/**
	 * Sync a single profile from hub data
	 *
	 * @param array $profile Profile data from hub API.
	 * @param bool  $dry_run Whether this is a dry run.
	 * @return string Result: 'created', 'updated', 'skipped', or 'error'.
	 */
	private static function sync_single_profile( array $profile, bool $dry_run ): string {
		$email = $profile['email'] ?? '';

		if ( empty( $email ) ) {
			return 'skipped';
		}

		// Check if user exists by email
		$existing_user = get_user_by( 'email', $email );

		if ( $dry_run ) {
			return $existing_user ? 'updated' : 'created';
		}

		// Prepare user data
		$first_name   = $profile['first_name'] ?? '';
		$last_name    = $profile['last_name'] ?? '';
		$display_name = $profile['display_name'] ?? trim( $first_name . ' ' . $last_name );

		if ( $existing_user ) {
			// Update existing user
			$user_id = $existing_user->ID;

			wp_update_user( array(
				'ID'           => $user_id,
				'first_name'   => $first_name,
				'last_name'    => $last_name,
				'display_name' => $display_name,
			) );

			$result = 'updated';
		} else {
			// Create new user
			$username = sanitize_user( strtolower( $first_name . '.' . $last_name ) );
			$username = str_replace( ' ', '', $username );

			if ( username_exists( $username ) ) {
				$username .= wp_rand( 1, 999 );
			}

			$user_id = wp_insert_user( array(
				'user_login'   => $username,
				'user_email'   => $email,
				'first_name'   => $first_name,
				'last_name'    => $last_name,
				'display_name' => $display_name,
				'user_pass'    => wp_generate_password(),
				'role'         => 'subscriber',
			) );

			if ( is_wp_error( $user_id ) ) {
				return 'error';
			}

			$result = 'created';
		}

		// Sync FRS meta fields
		$meta_fields = array(
			'phone_number',
			'mobile_number',
			'job_title',
			'nmls',
			'dre_license',
			'biography',
			'city_state',
			'region',
			'office',
			'linkedin_url',
			'facebook_url',
			'instagram_url',
			'twitter_url',
			'youtube_url',
			'tiktok_url',
			'is_active',
			'select_person_type',
			'profile_slug',
			'arrive',
			'service_areas',
			'specialties',
			'languages',
			'company_roles',
		);

		foreach ( $meta_fields as $field ) {
			if ( isset( $profile[ $field ] ) ) {
				$value = $profile[ $field ];

				// Handle arrays
				if ( is_array( $value ) ) {
					$value = $value;
				}

				update_user_meta( $user_id, 'frs_' . $field, $value );
			}
		}

		// Set WordPress role (add_role preserves existing roles like subscriber)
		if ( ! empty( $profile['select_person_type'] ) ) {
			$wp_role = Roles::get_wp_role_for_company_role( $profile['select_person_type'] );
			if ( $wp_role ) {
				$user = new \WP_User( $user_id );
				// Remove any existing FRS roles first
				$frs_roles = array_keys( Roles::get_wp_roles() );
				foreach ( $frs_roles as $frs_role ) {
					$user->remove_role( $frs_role );
				}
				$user->add_role( $wp_role );
			}
		}

		return $result;
	}

	/**
	 * Configure sync settings for this site
	 *
	 * ## OPTIONS
	 *
	 * [--hub-url=<url>]
	 * : Set the hub URL to sync from.
	 *
	 * [--webhook-secret=<secret>]
	 * : Set the webhook secret for authentication.
	 *
	 * [--generate-secret]
	 * : Generate a new webhook secret.
	 *
	 * ## EXAMPLES
	 *
	 *     # Configure hub URL
	 *     wp frs-users setup-sync --hub-url=https://myhub21.com
	 *
	 *     # Generate webhook secret
	 *     wp frs-users setup-sync --generate-secret
	 *
	 *     # Full setup
	 *     wp frs-users setup-sync --hub-url=https://myhub21.com --generate-secret
	 *
	 * @when after_wp_load
	 */
	public static function setup_sync( $args, $assoc_args ) {
		\WP_CLI::log( '' );
		\WP_CLI::log( '=== FRS Sync Setup ===' );
		\WP_CLI::log( '' );

		// Hub URL
		if ( isset( $assoc_args['hub-url'] ) ) {
			$hub_url = esc_url_raw( $assoc_args['hub-url'] );
			update_option( 'frs_hub_url', $hub_url );
			\WP_CLI::success( sprintf( 'Hub URL set to: %s', $hub_url ) );
		}

		// Webhook secret
		if ( isset( $assoc_args['generate-secret'] ) ) {
			$secret = wp_generate_password( 32, false );
			update_option( 'frs_webhook_secret', $secret );
			\WP_CLI::success( 'Generated new webhook secret.' );
			\WP_CLI::log( '' );
			\WP_CLI::log( 'Add this secret to your hub site\'s webhook configuration:' );
			\WP_CLI::log( sprintf( '  Secret: %s', $secret ) );
			\WP_CLI::log( '' );
		} elseif ( isset( $assoc_args['webhook-secret'] ) ) {
			$secret = sanitize_text_field( $assoc_args['webhook-secret'] );
			update_option( 'frs_webhook_secret', $secret );
			\WP_CLI::success( 'Webhook secret saved.' );
		}

		// Show current settings
		\WP_CLI::log( '' );
		\WP_CLI::log( 'Current Settings:' );
		\WP_CLI::log( sprintf( '  Hub URL:        %s', get_option( 'frs_hub_url', '(not set)' ) ) );
		\WP_CLI::log( sprintf( '  Webhook Secret: %s', get_option( 'frs_webhook_secret' ) ? '(configured)' : '(not set)' ) );
		\WP_CLI::log( '' );

		// Show webhook endpoint for this site
		\WP_CLI::log( 'Webhook Endpoint (for hub to send updates to this site):' );
		\WP_CLI::log( sprintf( '  %s', rest_url( 'frs-users/v1/webhook/profile-updated' ) ) );
		\WP_CLI::log( '' );
	}
}
