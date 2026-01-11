<?php
/**
 * VCard Generator
 *
 * Generates vCard (.vcf) files from WordPress user profile data.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

declare(strict_types=1);

namespace FRSUsers\Core;

/**
 * Generates vCard format contact files.
 */
class VCardGenerator {

	/**
	 * Generate vCard string from user ID or profile data array.
	 *
	 * @param int|array $user_or_profile User ID or profile data array.
	 * @return string vCard formatted string.
	 */
	public static function generate( $user_or_profile ): string {
		// If user ID passed, get profile data
		if ( is_numeric( $user_or_profile ) ) {
			$profile = self::get_profile_data( (int) $user_or_profile );
		} else {
			$profile = $user_or_profile;
		}

		$lines = array(
			'BEGIN:VCARD',
			'VERSION:3.0',
		);

		// Full name
		$first = $profile['first_name'] ?? '';
		$last  = $profile['last_name'] ?? '';
		$full_name = trim( $first . ' ' . $last );

		$lines[] = 'FN:' . self::escape( $full_name );
		$lines[] = 'N:' . self::escape( $last ) . ';' . self::escape( $first ) . ';;;';

		// Organization
		$org = $profile['company'] ?? $profile['organization'] ?? '21st Century Lending';
		$lines[] = 'ORG:' . self::escape( $org );

		// Job title
		if ( ! empty( $profile['job_title'] ) ) {
			$lines[] = 'TITLE:' . self::escape( $profile['job_title'] );
		}

		// Email
		if ( ! empty( $profile['email'] ) ) {
			$lines[] = 'EMAIL;TYPE=WORK:' . self::escape( $profile['email'] );
		}

		// Phone numbers
		if ( ! empty( $profile['phone_number'] ) ) {
			$lines[] = 'TEL;TYPE=WORK,VOICE:' . self::escape( self::clean_phone( $profile['phone_number'] ) );
		}

		if ( ! empty( $profile['mobile_number'] ) ) {
			$lines[] = 'TEL;TYPE=CELL,VOICE:' . self::escape( self::clean_phone( $profile['mobile_number'] ) );
		}

		if ( ! empty( $profile['office_number'] ) ) {
			$lines[] = 'TEL;TYPE=WORK,VOICE:' . self::escape( self::clean_phone( $profile['office_number'] ) );
		}

		// Address
		if ( ! empty( $profile['city_state'] ) || ! empty( $profile['address'] ) ) {
			$city_state = $profile['city_state'] ?? '';
			$zip        = $profile['zip'] ?? '';
			$street     = $profile['address'] ?? '';

			// Try to parse city and state from city_state
			$city  = '';
			$state = '';
			if ( preg_match( '/^(.+),\s*([A-Z]{2})$/i', $city_state, $matches ) ) {
				$city  = trim( $matches[1] );
				$state = trim( $matches[2] );
			} else {
				$city = $city_state;
			}

			$lines[] = 'ADR;TYPE=WORK:;;' . self::escape( $street ) . ';' . self::escape( $city ) . ';' . self::escape( $state ) . ';' . self::escape( $zip ) . ';USA';
		}

		// Website
		if ( ! empty( $profile['website'] ) ) {
			$lines[] = 'URL:' . self::escape( $profile['website'] );
		}

		// Profile URL
		if ( ! empty( $profile['profile_slug'] ) ) {
			$lines[] = 'URL;TYPE=PROFILE:' . home_url( '/lo/' . $profile['profile_slug'] );
		}

		// Photo (embedded as base64 for better compatibility)
		$headshot_url = $profile['headshot_url'] ?? $profile['avatar_url'] ?? '';
		if ( ! empty( $headshot_url ) ) {
			$photo_data = self::get_photo_base64( $headshot_url );
			if ( $photo_data ) {
				$lines[] = 'PHOTO;ENCODING=b;TYPE=' . $photo_data['type'] . ':' . $photo_data['data'];
			}
		}

		// NMLS number in note
		$notes = array();
		$nmls  = $profile['nmls'] ?? '';
		if ( ! empty( $nmls ) ) {
			$notes[] = 'NMLS# ' . $nmls;
		}

		// DRE license
		if ( ! empty( $profile['dre_license'] ) ) {
			$notes[] = 'DRE# ' . $profile['dre_license'];
		}

		if ( ! empty( $notes ) ) {
			$lines[] = 'NOTE:' . self::escape( implode( ' | ', $notes ) );
		}

		// Social media profiles as X-properties
		$social_fields = array(
			'linkedin_url'  => 'X-SOCIALPROFILE;TYPE=linkedin',
			'facebook_url'  => 'X-SOCIALPROFILE;TYPE=facebook',
			'instagram_url' => 'X-SOCIALPROFILE;TYPE=instagram',
			'twitter_url'   => 'X-SOCIALPROFILE;TYPE=twitter',
			'youtube_url'   => 'X-SOCIALPROFILE;TYPE=youtube',
		);

		foreach ( $social_fields as $field => $property ) {
			if ( ! empty( $profile[ $field ] ) ) {
				$lines[] = $property . ':' . self::escape( $profile[ $field ] );
			}
		}

		// Revision timestamp
		$lines[] = 'REV:' . gmdate( 'Ymd\THis\Z' );

		$lines[] = 'END:VCARD';

		return implode( "\r\n", $lines ) . "\r\n";
	}

	/**
	 * Get profile data from WordPress user.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return array Profile data array.
	 */
	public static function get_profile_data( int $user_id ): array {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return array();
		}

		// Get all FRS meta fields
		$meta_fields = array(
			'first_name', 'last_name', 'job_title', 'phone_number', 'mobile_number',
			'office_number', 'city_state', 'address', 'zip', 'website', 'nmls',
			'dre_license', 'linkedin_url', 'facebook_url', 'instagram_url',
			'twitter_url', 'youtube_url', 'profile_slug', 'headshot_url',
			'company', 'organization', 'biography',
		);

		$profile = array(
			'user_id'    => $user_id,
			'email'      => $user->user_email,
			'first_name' => $user->first_name,
			'last_name'  => $user->last_name,
		);

		foreach ( $meta_fields as $field ) {
			$value = get_user_meta( $user_id, 'frs_' . $field, true );
			if ( $value ) {
				$profile[ $field ] = $value;
			}
		}

		// Get avatar URL
		$avatar_url = get_user_meta( $user_id, 'frs_headshot_url', true );
		if ( ! $avatar_url ) {
			// Try Simple Local Avatars
			$avatar_url = get_user_meta( $user_id, 'simple_local_avatar', true );
			if ( is_array( $avatar_url ) && ! empty( $avatar_url['full'] ) ) {
				$avatar_url = $avatar_url['full'];
			}
		}
		$profile['avatar_url'] = $avatar_url;

		// Get profile slug
		if ( empty( $profile['profile_slug'] ) ) {
			$profile['profile_slug'] = $user->user_nicename;
		}

		return $profile;
	}

	/**
	 * Generate and output vCard as download.
	 *
	 * @param int|array $user_or_profile User ID or profile data.
	 * @param bool      $exit            Whether to exit after output.
	 */
	public static function download( $user_or_profile, bool $exit = true ): void {
		if ( is_numeric( $user_or_profile ) ) {
			$profile = self::get_profile_data( (int) $user_or_profile );
		} else {
			$profile = $user_or_profile;
		}

		$vcard    = self::generate( $profile );
		$filename = sanitize_file_name(
			( $profile['first_name'] ?? 'contact' ) . '-' .
			( $profile['last_name'] ?? 'card' ) . '.vcf'
		);

		header( 'Content-Type: text/vcard; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		header( 'Content-Length: ' . strlen( $vcard ) );
		header( 'Cache-Control: no-cache, no-store, must-revalidate' );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		echo $vcard;

		if ( $exit ) {
			exit;
		}
	}

	/**
	 * Escape special characters for vCard format.
	 *
	 * @param string $str Input string.
	 * @return string Escaped string.
	 */
	private static function escape( string $str ): string {
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
		// Remove all non-digit characters except + for international
		$cleaned = preg_replace( '/[^\d+]/', '', $phone );

		// Format as US number if 10 digits
		if ( strlen( $cleaned ) === 10 ) {
			return '+1' . $cleaned;
		}

		return $cleaned;
	}

	/**
	 * Generate vCard data URL for QR code.
	 *
	 * @param int|array $user_or_profile User ID or profile data.
	 * @return string Data URL containing vCard.
	 */
	public static function get_data_url( $user_or_profile ): string {
		$vcard = self::generate( $user_or_profile );
		return 'data:text/vcard;charset=utf-8,' . rawurlencode( $vcard );
	}

	/**
	 * Get photo as base64 encoded data.
	 *
	 * @param string $url Image URL.
	 * @return array|null Array with 'type' and 'data' keys, or null on failure.
	 */
	private static function get_photo_base64( string $url ): ?array {
		// Handle local WordPress URLs
		$upload_dir = wp_upload_dir();
		$local_path = null;

		if ( strpos( $url, $upload_dir['baseurl'] ) !== false ) {
			$local_path = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $url );
		}

		if ( $local_path && file_exists( $local_path ) ) {
			$image_data = file_get_contents( $local_path );
			$mime       = mime_content_type( $local_path );
		} else {
			// Fetch remote image
			$response = wp_remote_get( $url, array( 'timeout' => 10 ) );
			if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
				return null;
			}
			$image_data = wp_remote_retrieve_body( $response );
			$mime       = wp_remote_retrieve_header( $response, 'content-type' );
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

		return array(
			'type' => $type,
			'data' => base64_encode( $image_data ),
		);
	}

	/**
	 * Save vCard to file.
	 *
	 * @param int|array $user_or_profile User ID or profile data.
	 * @param string    $directory       Directory to save to.
	 * @return string|false File path on success, false on failure.
	 */
	public static function save_to_file( $user_or_profile, string $directory ) {
		if ( is_numeric( $user_or_profile ) ) {
			$profile = self::get_profile_data( (int) $user_or_profile );
		} else {
			$profile = $user_or_profile;
		}

		$vcard    = self::generate( $profile );
		$filename = sanitize_file_name(
			( $profile['first_name'] ?? 'contact' ) . '-' .
			( $profile['last_name'] ?? 'card' ) . '.vcf'
		);

		$filepath = trailingslashit( $directory ) . $filename;

		if ( file_put_contents( $filepath, $vcard ) !== false ) {
			return $filepath;
		}

		return false;
	}
}
