<?php
/**
 * Shortcodes Controller
 *
 * Registers frontend shortcodes for profile display.
 *
 * @package FRSUsers
 * @subpackage Controllers
 * @since 1.0.0
 */

namespace FRSUsers\Controllers;

use FRSUsers\Models\Profile;

/**
 * Class Shortcodes
 *
 * Handles registration of custom shortcodes.
 *
 * @package FRSUsers\Controllers
 */
class Shortcodes {

	/**
	 * Initialize shortcodes
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_shortcodes' ) );
	}

	/**
	 * Register all custom shortcodes
	 *
	 * @return void
	 */
	public static function register_shortcodes() {
		// My Profile - uses frs/profile-editor block
		add_shortcode( 'frs_my_profile', array( __CLASS__, 'render_my_profile_content' ) );

		// Directory - uses frs/lo-directory block
		add_shortcode( 'frs_profile_directory', array( __CLASS__, 'render_directory' ) );

		// Allow other plugins to register additional FRS shortcodes
		do_action( 'frs_users_register_shortcodes' );
	}

	/**
	 * Render My Profile content
	 *
	 * Uses the frs/profile-editor block for PHP-rendered profile.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_my_profile_content( $atts ) {
		if ( ! is_user_logged_in() ) {
			return '<div class="frs-profile-error"><p>' . esc_html__( 'Please log in to access your profile.', 'frs-users' ) . '</p></div>';
		}

		return do_blocks( '<!-- wp:frs/profile-editor {"contentOnly":true} /-->' );
	}

	/**
	 * Render directory shortcode
	 *
	 * Uses the frs/lo-directory block for PHP-rendered directory.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_directory( $atts ) {
		$atts = shortcode_atts(
			array(
				'class' => '',
			),
			$atts,
			'frs_profile_directory'
		);

		$class = ! empty( $atts['class'] ) ? ' class="' . esc_attr( $atts['class'] ) . '"' : '';

		return do_blocks( '<!-- wp:frs/lo-directory' . $class . ' /-->' );
	}
}
