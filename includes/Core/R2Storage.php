<?php
/**
 * R2 Storage - Cloudflare R2 CDN Integration
 *
 * Handles uploading, serving, and managing headshot images via
 * the frs-media-cdn Worker at media.frs.works.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 4.1.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;

/**
 * Class R2Storage
 *
 * Manages headshot images in Cloudflare R2 via Worker endpoint.
 */
class R2Storage {

	/**
	 * Option keys for settings.
	 */
	const OPTION_CDN_URL  = 'frs_r2_cdn_url';
	const OPTION_API_KEY  = 'frs_r2_api_key';
	const OPTION_ENABLED  = 'frs_r2_enabled';

	/**
	 * Default CDN URL.
	 */
	const DEFAULT_CDN_URL = 'https://media.frs.works';

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public static function init() {
		// Upload to R2 when headshot changes on hub
		if ( Roles::is_profile_editing_enabled() ) {
			add_action( 'frs_profile_saved', array( __CLASS__, 'maybe_upload_headshot' ), 5, 2 );
		}
	}

	/**
	 * Check if R2 storage is enabled.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return (bool) get_option( self::OPTION_ENABLED, false );
	}

	/**
	 * Get the CDN base URL.
	 *
	 * @return string
	 */
	public static function get_cdn_url() {
		return rtrim( get_option( self::OPTION_CDN_URL, self::DEFAULT_CDN_URL ), '/' );
	}

	/**
	 * Get the API key for authenticated uploads.
	 *
	 * @return string
	 */
	private static function get_api_key() {
		return get_option( self::OPTION_API_KEY, '' );
	}

	/**
	 * Generate the R2 object key for a profile's headshot.
	 *
	 * Pattern: headshots/{firstname-lastname}-{identifier}.{ext}
	 * - MLOs: NMLS number as identifier
	 * - Agents: license number as identifier
	 * - Staff: random hash as identifier
	 *
	 * @param Profile $profile Profile object.
	 * @param string  $extension File extension (default: jpg).
	 * @return string R2 object key.
	 */
	public static function generate_object_key( $profile, $extension = 'jpg' ) {
		$name_part = sanitize_title( trim( $profile->first_name . ' ' . $profile->last_name ) );

		if ( empty( $name_part ) ) {
			$name_part = 'unknown';
		}

		// Determine identifier based on role
		$identifier = '';

		// Try NMLS first (loan officers)
		$nmls = $profile->nmls ?: $profile->nmls_number;
		if ( ! empty( $nmls ) ) {
			$identifier = preg_replace( '/[^0-9]/', '', $nmls );
		}

		// Try license/DRE number (agents)
		if ( empty( $identifier ) ) {
			$license = $profile->license_number ?: $profile->dre_license;
			if ( ! empty( $license ) ) {
				$identifier = preg_replace( '/[^a-zA-Z0-9]/', '', $license );
			}
		}

		// Fallback: random hash (staff without license)
		if ( empty( $identifier ) ) {
			$identifier = substr( wp_hash( $profile->user_id . $profile->email ), 0, 8 );
		}

		$extension = ltrim( strtolower( $extension ), '.' );

		return sprintf( 'headshots/%s-%s.%s', $name_part, $identifier, $extension );
	}

	/**
	 * Build the full CDN URL for an object key.
	 *
	 * @param string $object_key R2 object key.
	 * @return string Full URL.
	 */
	public static function get_url( $object_key ) {
		return self::get_cdn_url() . '/' . ltrim( $object_key, '/' );
	}

	/**
	 * Upload a file to R2 via the Worker endpoint.
	 *
	 * @param string $file_path Local file path.
	 * @param string $object_key R2 object key.
	 * @param string $mime_type MIME type of the file.
	 * @return string|false CDN URL on success, false on failure.
	 */
	public static function upload( $file_path, $object_key, $mime_type = 'image/jpeg' ) {
		if ( ! self::is_enabled() ) {
			return false;
		}

		$api_key = self::get_api_key();
		if ( empty( $api_key ) ) {
			error_log( 'FRS R2: Upload failed - no API key configured.' );
			return false;
		}

		if ( ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			error_log( sprintf( 'FRS R2: Upload failed - file not readable: %s', $file_path ) );
			return false;
		}

		$file_data = file_get_contents( $file_path );
		if ( false === $file_data ) {
			return false;
		}

		$upload_url = self::get_cdn_url() . '/upload';

		$response = wp_remote_post( $upload_url, array(
			'timeout' => 30,
			'headers' => array(
				'X-API-Key'    => $api_key,
				'X-Filename'   => $object_key,
				'Content-Type' => $mime_type,
			),
			'body'    => $file_data,
		) );

		if ( is_wp_error( $response ) ) {
			error_log( sprintf( 'FRS R2: Upload failed - %s', $response->get_error_message() ) );
			return false;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== $code || empty( $body['success'] ) ) {
			error_log( sprintf(
				'FRS R2: Upload failed - HTTP %d: %s',
				$code,
				$body['error'] ?? 'Unknown error'
			) );
			return false;
		}

		return $body['url'] ?? self::get_url( $object_key );
	}

	/**
	 * Upload a WordPress attachment to R2.
	 *
	 * @param int     $attachment_id WordPress attachment ID.
	 * @param Profile $profile Profile to generate key for.
	 * @return string|false CDN URL on success, false on failure.
	 */
	public static function upload_attachment( $attachment_id, $profile ) {
		$file_path = get_attached_file( $attachment_id );
		if ( ! $file_path ) {
			return false;
		}

		$mime_type = get_post_mime_type( $attachment_id ) ?: 'image/jpeg';
		$extension = pathinfo( $file_path, PATHINFO_EXTENSION ) ?: 'jpg';
		$object_key = self::generate_object_key( $profile, $extension );

		return self::upload( $file_path, $object_key, $mime_type );
	}

	/**
	 * Upload from a URL (download then upload to R2).
	 *
	 * @param string  $image_url Remote image URL.
	 * @param Profile $profile Profile to generate key for.
	 * @return string|false CDN URL on success, false on failure.
	 */
	public static function upload_from_url( $image_url, $profile ) {
		if ( empty( $image_url ) || ! self::is_enabled() ) {
			return false;
		}

		// Download to temp file
		$tmp = download_url( $image_url, 30 );
		if ( is_wp_error( $tmp ) ) {
			error_log( sprintf( 'FRS R2: Failed to download %s: %s', $image_url, $tmp->get_error_message() ) );
			return false;
		}

		$extension = pathinfo( wp_parse_url( $image_url, PHP_URL_PATH ), PATHINFO_EXTENSION ) ?: 'jpg';
		$mime_type = wp_check_filetype( $tmp )['type'] ?: 'image/jpeg';
		$object_key = self::generate_object_key( $profile, $extension );

		$cdn_url = self::upload( $tmp, $object_key, $mime_type );

		// Clean up temp file
		@unlink( $tmp );

		return $cdn_url;
	}

	/**
	 * Delete an image from R2 via the Worker endpoint.
	 *
	 * @param string $object_key R2 object key.
	 * @return bool
	 */
	public static function delete( $object_key ) {
		if ( ! self::is_enabled() ) {
			return false;
		}

		$api_key = self::get_api_key();
		if ( empty( $api_key ) ) {
			return false;
		}

		$delete_url = self::get_cdn_url() . '/' . ltrim( $object_key, '/' );

		$response = wp_remote_request( $delete_url, array(
			'method'  => 'DELETE',
			'timeout' => 15,
			'headers' => array(
				'X-API-Key' => $api_key,
			),
		) );

		if ( is_wp_error( $response ) ) {
			error_log( sprintf( 'FRS R2: Delete failed - %s', $response->get_error_message() ) );
			return false;
		}

		return 200 === wp_remote_retrieve_response_code( $response );
	}

	/**
	 * Hook: Upload headshot to R2 when profile is saved.
	 *
	 * Fires on `frs_profile_saved` (priority 5, before avatar sync at 10).
	 *
	 * @param int   $profile_id Profile/user ID.
	 * @param array $profile_data Profile data that was saved.
	 * @return void
	 */
	public static function maybe_upload_headshot( $profile_id, $profile_data ) {
		if ( ! self::is_enabled() ) {
			return;
		}

		$profile = Profile::find( $profile_id );
		if ( ! $profile || ! $profile->headshot_id ) {
			return;
		}

		// Check if headshot has changed by comparing attachment ID
		$stored_headshot_id = (int) get_user_meta( $profile_id, '_frs_r2_last_headshot_id', true );
		if ( $stored_headshot_id === (int) $profile->headshot_id ) {
			// Same attachment, no need to re-upload
			return;
		}

		// Upload to R2
		$cdn_url = self::upload_attachment( $profile->headshot_id, $profile );

		if ( $cdn_url ) {
			// Store the CDN URL and the attachment ID we uploaded
			update_user_meta( $profile_id, 'frs_headshot_url', $cdn_url );
			update_user_meta( $profile_id, '_frs_r2_last_headshot_id', $profile->headshot_id );

			error_log( sprintf(
				'FRS R2: Uploaded headshot for user %d → %s',
				$profile_id,
				$cdn_url
			) );
		}
	}

	/**
	 * Get the R2 CDN URL for a profile, or fall back to local attachment.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return string|null CDN URL, local attachment URL, or null.
	 */
	public static function get_headshot_url( $user_id ) {
		// Prefer CDN URL if available
		if ( self::is_enabled() ) {
			$cdn_url = get_user_meta( $user_id, 'frs_headshot_url', true );
			if ( ! empty( $cdn_url ) ) {
				return $cdn_url;
			}
		}

		// Fallback to local attachment
		$headshot_id = (int) get_user_meta( $user_id, 'frs_headshot_id', true );
		if ( $headshot_id ) {
			return wp_get_attachment_url( $headshot_id );
		}

		return null;
	}
}
