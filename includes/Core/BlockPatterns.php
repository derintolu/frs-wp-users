<?php
/**
 * Block Patterns
 *
 * Registers Greenshift block patterns for the hub site:
 * - Hub Directory: Team member grid with user repeater
 * - Hub Profile: Tabbed author profile with activity feed
 *
 * @package FRSUsers
 * @since 2.2.0
 */

namespace FRSUsers\Core;

defined( 'ABSPATH' ) || exit;

class BlockPatterns {

	/**
	 * Initialize block pattern registration.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_patterns' ) );
	}

	/**
	 * Register block patterns and pattern category.
	 *
	 * @return void
	 */
	public static function register_patterns() {
		// Only register on hub/development contexts
		$site_context = Roles::get_site_context();
		if ( ! in_array( $site_context, array( 'hub', 'development' ), true ) ) {
			return;
		}

		// Register pattern category
		register_block_pattern_category( 'frs-hub', array(
			'label' => 'Hub21',
		) );

		// Register directory pattern
		$directory_content = self::get_directory_pattern();
		if ( $directory_content ) {
			register_block_pattern( 'frs-hub/directory', array(
				'title'       => 'Hub Directory',
				'description' => 'Team member directory grid with avatars, job titles, and contact info',
				'categories'  => array( 'frs-hub' ),
				'content'     => $directory_content,
			) );
		}

		// Register profile pattern
		$profile_content = self::get_profile_pattern();
		if ( $profile_content ) {
			register_block_pattern( 'frs-hub/profile', array(
				'title'       => 'Hub Profile',
				'description' => 'Tabbed user profile with contact info, biography, and activity feed',
				'categories'  => array( 'frs-hub' ),
				'content'     => $profile_content,
			) );
		}
	}

	/**
	 * Get the directory pattern content.
	 *
	 * @return string Block pattern content.
	 */
	private static function get_directory_pattern() {
		$pattern_file = FRS_USERS_DIR . 'patterns/hub-directory.php';
		if ( file_exists( $pattern_file ) ) {
			ob_start();
			include $pattern_file;
			return ob_get_clean();
		}
		return '';
	}

	/**
	 * Get the profile pattern content.
	 *
	 * @return string Block pattern content.
	 */
	private static function get_profile_pattern() {
		$pattern_file = FRS_USERS_DIR . 'patterns/hub-profile.php';
		if ( file_exists( $pattern_file ) ) {
			ob_start();
			include $pattern_file;
			return ob_get_clean();
		}
		return '';
	}
}
