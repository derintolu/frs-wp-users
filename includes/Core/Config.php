<?php
/**
 * Configuration Handler
 *
 * Handles plugin configuration for Primary vs Remote mode
 *
 * @package FRSUsers\Core
 */

namespace FRSUsers\Core;

/**
 * Class Config
 *
 * Manages plugin configuration settings
 */
class Config {

	/**
	 * Get plugin mode (primary or remote)
	 *
	 * @return string 'primary' or 'remote'
	 */
	public static function get_mode(): string {
		// Check for constant in wp-config.php
		if ( defined( 'FRS_USERS_MODE' ) ) {
			return strtolower( FRS_USERS_MODE ) === 'remote' ? 'remote' : 'primary';
		}

		// Check option in database
		$mode = get_option( 'frs_users_mode', 'primary' );
		return $mode === 'remote' ? 'remote' : 'primary';
	}

	/**
	 * Check if plugin is in primary mode
	 *
	 * @return bool
	 */
	public static function is_primary(): bool {
		return self::get_mode() === 'primary';
	}

	/**
	 * Check if plugin is in remote mode
	 *
	 * @return bool
	 */
	public static function is_remote(): bool {
		return self::get_mode() === 'remote';
	}

	/**
	 * Get primary site API URL
	 *
	 * @return string|null API URL or null if not configured
	 */
	public static function get_primary_api_url(): ?string {
		// Check for constant in wp-config.php
		if ( defined( 'FRS_USERS_PRIMARY_API_URL' ) ) {
			return trailingslashit( FRS_USERS_PRIMARY_API_URL );
		}

		// Check option in database
		$api_url = get_option( 'frs_users_primary_api_url', '' );
		return ! empty( $api_url ) ? trailingslashit( $api_url ) : null;
	}

	/**
	 * Set plugin mode
	 *
	 * @param string $mode 'primary' or 'remote'
	 * @return bool Success
	 */
	public static function set_mode( string $mode ): bool {
		$mode = $mode === 'remote' ? 'remote' : 'primary';
		return update_option( 'frs_users_mode', $mode );
	}

	/**
	 * Set primary site API URL
	 *
	 * @param string $url API URL
	 * @return bool Success
	 */
	public static function set_primary_api_url( string $url ): bool {
		return update_option( 'frs_users_primary_api_url', esc_url_raw( $url ) );
	}

	/**
	 * Get configuration array
	 *
	 * @return array Configuration settings
	 */
	public static function get_all(): array {
		return array(
			'mode'             => self::get_mode(),
			'is_primary'       => self::is_primary(),
			'is_remote'        => self::is_remote(),
			'primary_api_url'  => self::get_primary_api_url(),
		);
	}
}
