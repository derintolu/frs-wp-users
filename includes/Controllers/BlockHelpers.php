<?php
/**
 * Block Helpers
 *
 * Helper functions for block rendering.
 *
 * @package FRSUsers
 * @subpackage Controllers
 */

declare(strict_types=1);

namespace FRSUsers\Controllers;

/**
 * Class BlockHelpers
 *
 * Static helper methods for block render.php files.
 */
class BlockHelpers {

	/**
	 * Get the hub URL for API calls.
	 *
	 * @return string Hub URL or current site URL.
	 */
	public static function get_hub_url(): string {
		// Check multiple possible option names for hub URL
		$hub_url = get_option( 'frs_hub_url', '' );

		if ( empty( $hub_url ) ) {
			$hub_url = get_option( 'frs_directory_hub_url', '' );
		}

		return ! empty( $hub_url ) ? trailingslashit( $hub_url ) : trailingslashit( home_url() );
	}

	/**
	 * Get the video background URL.
	 *
	 * @return string Video URL.
	 */
	public static function get_video_url(): string {
		$video_url = get_option( 'frs_directory_video_url', '' );

		if ( empty( $video_url ) && defined( 'FRS_USERS_VIDEO_BG_URL' ) ) {
			return FRS_USERS_VIDEO_BG_URL;
		}

		if ( empty( $video_url ) ) {
			// Default video path
			$video_path = 'wp-content/plugins/frs-wp-users/assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4';
			return home_url( '/' . $video_path );
		}

		return $video_url;
	}

	/**
	 * Check if this is a spoke site (remote from hub).
	 *
	 * @return bool True if spoke site.
	 */
	public static function is_spoke_site(): bool {
		$hub_url = get_option( 'frs_hub_url', '' );
		return ! empty( $hub_url ) && trailingslashit( $hub_url ) !== trailingslashit( home_url() );
	}

	/**
	 * Normalize state name to abbreviation.
	 *
	 * @param string $state State name or abbreviation.
	 * @return string State abbreviation.
	 */
	public static function normalize_state( string $state ): string {
		$state_map = array(
			'Alabama'              => 'AL',
			'Alaska'               => 'AK',
			'Arizona'              => 'AZ',
			'Arkansas'             => 'AR',
			'California'           => 'CA',
			'Colorado'             => 'CO',
			'Connecticut'          => 'CT',
			'Delaware'             => 'DE',
			'Florida'              => 'FL',
			'Georgia'              => 'GA',
			'Hawaii'               => 'HI',
			'Idaho'                => 'ID',
			'Illinois'             => 'IL',
			'Indiana'              => 'IN',
			'Iowa'                 => 'IA',
			'Kansas'               => 'KS',
			'Kentucky'             => 'KY',
			'Louisiana'            => 'LA',
			'Maine'                => 'ME',
			'Maryland'             => 'MD',
			'Massachusetts'        => 'MA',
			'Michigan'             => 'MI',
			'Minnesota'            => 'MN',
			'Mississippi'          => 'MS',
			'Missouri'             => 'MO',
			'Montana'              => 'MT',
			'Nebraska'             => 'NE',
			'Nevada'               => 'NV',
			'New Hampshire'        => 'NH',
			'New Jersey'           => 'NJ',
			'New Mexico'           => 'NM',
			'New York'             => 'NY',
			'North Carolina'       => 'NC',
			'North Dakota'         => 'ND',
			'Ohio'                 => 'OH',
			'Oklahoma'             => 'OK',
			'Oregon'               => 'OR',
			'Pennsylvania'         => 'PA',
			'Rhode Island'         => 'RI',
			'South Carolina'       => 'SC',
			'South Dakota'         => 'SD',
			'Tennessee'            => 'TN',
			'Texas'                => 'TX',
			'Utah'                 => 'UT',
			'Vermont'              => 'VT',
			'Virginia'             => 'VA',
			'Washington'           => 'WA',
			'West Virginia'        => 'WV',
			'Wisconsin'            => 'WI',
			'Wyoming'              => 'WY',
			'District of Columbia' => 'DC',
		);

		// If already an abbreviation
		if ( strlen( $state ) === 2 && ctype_alpha( $state ) ) {
			return strtoupper( $state );
		}

		return $state_map[ $state ] ?? strtoupper( $state );
	}
}
