<?php
/**
 * QR Code Generator
 *
 * Generates QR codes for profiles and uploads to R2 CDN for global sync.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;

/**
 * Class QRCode
 *
 * Handles QR code generation and CDN storage.
 * QR codes are generated on the hub and synced globally via webhook.
 *
 * @package FRSUsers\Core
 */
class QRCode {

	/**
	 * Meta key for QR code CDN URL.
	 *
	 * @var string
	 */
	const META_KEY = 'frs_qr_code_data';

	/**
	 * R2 object key prefix.
	 *
	 * @var string
	 */
	const R2_PREFIX = 'qrcodes';

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public static function init() {
		// Auto-generate QR codes when profiles are saved on the hub
		if ( Roles::is_profile_editing_enabled() ) {
			add_action( 'frs_profile_saved', array( __CLASS__, 'maybe_generate_qr_code' ), 15, 2 );
		}
	}

	/**
	 * Generate QR code for a user and upload to CDN.
	 *
	 * @param int         $user_id User ID.
	 * @param string|null $slug    Profile slug. If null, will be fetched from user meta.
	 * @param bool        $force   Force regeneration even if exists.
	 * @return string|false CDN URL on success, false on failure.
	 */
	public static function generate( $user_id, $slug = null, $force = false ) {
		// Check for existing QR code unless forcing
		if ( ! $force ) {
			$existing = get_user_meta( $user_id, self::META_KEY, true );
			if ( $existing && self::is_cdn_url( $existing ) ) {
				return $existing;
			}
		}

		// Get profile slug
		if ( ! $slug ) {
			$slug = get_user_meta( $user_id, 'frs_profile_slug', true );
			if ( ! $slug ) {
				$user = get_userdata( $user_id );
				$slug = $user ? $user->user_nicename : null;
			}
		}

		if ( ! $slug ) {
			error_log( sprintf( 'FRS QRCode: Cannot generate for user %d - no slug', $user_id ) );
			return false;
		}

		// Build QR content URL - always use hub domain for global consistency
		$qr_content_url = self::get_qr_landing_url( $slug );

		// Generate SVG using Node.js script
		$svg = self::generate_svg( $qr_content_url );
		if ( ! $svg ) {
			return false;
		}

		// Upload to R2 CDN if enabled
		if ( R2Storage::is_enabled() ) {
			$cdn_url = self::upload_to_cdn( $slug, $svg );
			if ( $cdn_url ) {
				update_user_meta( $user_id, self::META_KEY, $cdn_url );
				return $cdn_url;
			}
		}

		// Fallback: save locally
		$local_url = self::save_locally( $slug, $svg );
		if ( $local_url ) {
			update_user_meta( $user_id, self::META_KEY, $local_url );
			return $local_url;
		}

		return false;
	}

	/**
	 * Generate SVG QR code using Node.js script.
	 *
	 * @param string $content URL or text to encode in QR.
	 * @return string|false SVG content or false on failure.
	 */
	private static function generate_svg( $content ) {
		// Check Node.js availability
		$node_check = shell_exec( 'which node 2>/dev/null' );
		if ( empty( $node_check ) ) {
			error_log( 'FRS QRCode: Node.js not available' );
			return false;
		}

		$script_path = FRS_USERS_DIR . 'scripts/generate-qr.js';
		if ( ! file_exists( $script_path ) ) {
			error_log( sprintf( 'FRS QRCode: Script not found at %s', $script_path ) );
			return false;
		}

		// Ensure node_modules are installed
		$node_modules = FRS_USERS_DIR . 'scripts/node_modules';
		if ( ! file_exists( $node_modules ) ) {
			$scripts_dir = FRS_USERS_DIR . 'scripts';
			shell_exec( sprintf( 'cd %s && npm install 2>&1', escapeshellarg( $scripts_dir ) ) );
		}

		$cmd = sprintf(
			'node %s %s 2>&1',
			escapeshellarg( $script_path ),
			escapeshellarg( $content )
		);

		$output = shell_exec( $cmd );

		if ( $output && strpos( $output, '<svg' ) !== false ) {
			return $output;
		}

		error_log( sprintf( 'FRS QRCode: Generation failed for %s: %s', $content, substr( $output ?? '', 0, 200 ) ) );
		return false;
	}

	/**
	 * Upload QR code SVG to R2 CDN.
	 *
	 * @param string $slug Profile slug.
	 * @param string $svg  SVG content.
	 * @return string|false CDN URL or false on failure.
	 */
	private static function upload_to_cdn( $slug, $svg ) {
		$api_key = get_option( R2Storage::OPTION_API_KEY, '' );
		if ( empty( $api_key ) ) {
			return false;
		}

		$object_key = self::R2_PREFIX . '/' . sanitize_file_name( $slug ) . '.svg';
		$upload_url = R2Storage::get_cdn_url() . '/upload';

		$response = wp_remote_post( $upload_url, array(
			'timeout' => 30,
			'headers' => array(
				'X-API-Key'    => $api_key,
				'X-Filename'   => $object_key,
				'Content-Type' => 'image/svg+xml',
			),
			'body'    => $svg,
		) );

		if ( is_wp_error( $response ) ) {
			error_log( sprintf( 'FRS QRCode: Upload failed - %s', $response->get_error_message() ) );
			return false;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== $code || empty( $body['success'] ) ) {
			error_log( sprintf( 'FRS QRCode: Upload failed - HTTP %d', $code ) );
			return false;
		}

		return $body['url'] ?? R2Storage::get_url( $object_key );
	}

	/**
	 * Save QR code SVG locally as fallback.
	 *
	 * @param string $slug Profile slug.
	 * @param string $svg  SVG content.
	 * @return string|false Local URL or false on failure.
	 */
	private static function save_locally( $slug, $svg ) {
		$upload_dir  = wp_upload_dir();
		$qr_dir      = $upload_dir['basedir'] . '/frs-qr-codes';
		$qr_url_base = $upload_dir['baseurl'] . '/frs-qr-codes';

		if ( ! file_exists( $qr_dir ) ) {
			wp_mkdir_p( $qr_dir );
		}

		$filename = sanitize_file_name( $slug ) . '.svg';
		$filepath = $qr_dir . '/' . $filename;

		if ( file_put_contents( $filepath, $svg ) ) {
			return $qr_url_base . '/' . $filename;
		}

		return false;
	}

	/**
	 * Get the QR landing page URL for a profile.
	 *
	 * Always uses the hub domain for consistency across all sites.
	 *
	 * @param string $slug Profile slug.
	 * @return string QR landing URL.
	 */
	public static function get_qr_landing_url( $slug ) {
		// On hub, use home_url; on marketing sites, use hub URL
		if ( Roles::is_profile_editing_enabled() ) {
			return home_url( '/qr/' . $slug );
		}

		// Marketing sites use hub URL for QR landing
		$hub_url = get_option( 'frs_hub_url', 'https://myhub21.com' );
		return rtrim( $hub_url, '/' ) . '/qr/' . $slug;
	}

	/**
	 * Check if URL is a CDN URL.
	 *
	 * @param string $url URL to check.
	 * @return bool
	 */
	private static function is_cdn_url( $url ) {
		$cdn_url = R2Storage::get_cdn_url();
		return $cdn_url && strpos( $url, $cdn_url ) === 0;
	}

	/**
	 * Hook: Auto-generate QR code when profile is saved on hub.
	 *
	 * @param int   $profile_id   Profile/user ID.
	 * @param array $profile_data Profile data that was saved.
	 * @return void
	 */
	public static function maybe_generate_qr_code( $profile_id, $profile_data ) {
		// Only auto-generate if R2 is enabled (centralized storage)
		if ( ! R2Storage::is_enabled() ) {
			return;
		}

		$profile = Profile::find( $profile_id );
		if ( ! $profile || ! $profile->is_active ) {
			return;
		}

		// Get profile slug
		$slug = $profile->profile_slug;
		if ( ! $slug && $profile->user_id ) {
			$user = get_userdata( $profile->user_id );
			$slug = $user ? $user->user_nicename : null;
		}

		if ( ! $slug ) {
			return;
		}

		// Check if QR code already exists on CDN
		$existing = get_user_meta( $profile_id, self::META_KEY, true );
		if ( $existing && self::is_cdn_url( $existing ) ) {
			// Check if slug changed (QR needs regeneration)
			$existing_slug = self::extract_slug_from_url( $existing );
			if ( $existing_slug === $slug ) {
				return; // No change needed
			}
		}

		// Generate and upload
		$cdn_url = self::generate( $profile_id, $slug, true );

		if ( $cdn_url ) {
			error_log( sprintf(
				'FRS QRCode: Generated QR for user %d (%s) → %s',
				$profile_id,
				$slug,
				$cdn_url
			) );
		}
	}

	/**
	 * Extract profile slug from QR code URL.
	 *
	 * @param string $url QR code URL.
	 * @return string|null Slug or null.
	 */
	private static function extract_slug_from_url( $url ) {
		$path = wp_parse_url( $url, PHP_URL_PATH );
		if ( $path ) {
			$filename = basename( $path );
			return pathinfo( $filename, PATHINFO_FILENAME );
		}
		return null;
	}

	/**
	 * Bulk generate QR codes for multiple users.
	 *
	 * @param array $user_ids Array of user IDs.
	 * @param bool  $force    Force regeneration.
	 * @return array Results with 'success', 'failed', 'skipped' counts.
	 */
	public static function bulk_generate( $user_ids, $force = false ) {
		$results = array(
			'success' => 0,
			'failed'  => 0,
			'skipped' => 0,
		);

		foreach ( $user_ids as $user_id ) {
			$existing = get_user_meta( $user_id, self::META_KEY, true );

			if ( ! $force && $existing && self::is_cdn_url( $existing ) ) {
				++$results['skipped'];
				continue;
			}

			$cdn_url = self::generate( $user_id, null, $force );

			if ( $cdn_url ) {
				++$results['success'];
			} else {
				++$results['failed'];
			}
		}

		return $results;
	}

	/**
	 * Get QR code URL for a user.
	 *
	 * @param int $user_id User ID.
	 * @return string|null QR code URL or null.
	 */
	public static function get_url( $user_id ) {
		return get_user_meta( $user_id, self::META_KEY, true ) ?: null;
	}

	/**
	 * Delete QR code for a user (from CDN and meta).
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function delete( $user_id ) {
		$existing = get_user_meta( $user_id, self::META_KEY, true );

		if ( $existing && self::is_cdn_url( $existing ) ) {
			// Extract object key and delete from R2
			$cdn_base = R2Storage::get_cdn_url();
			$object_key = str_replace( $cdn_base . '/', '', $existing );
			R2Storage::delete( $object_key );
		}

		return delete_user_meta( $user_id, self::META_KEY );
	}
}
