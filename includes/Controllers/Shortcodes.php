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
use FRSUsers\Core\Roles;

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

		// Hub employee directory - hub/development context only.
		$context = Roles::get_site_context();
		if ( in_array( $context, array( 'hub', 'development' ), true ) ) {
			add_shortcode( 'frs_hub_directory', array( __CLASS__, 'render_hub_directory' ) );
			add_action( 'blocksy:content:before', array( __CLASS__, 'render_hub_directory_panel' ) );
		}

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

	/**
	 * Render hub employee directory shortcode.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered shortcode HTML.
	 */
	public static function render_hub_directory( $atts ) {
		$plugin_url = plugin_dir_url( dirname( __DIR__ ) );
		$plugin_dir = plugin_dir_path( dirname( __DIR__ ) );
		$version    = filemtime( $plugin_dir . 'assets/js/hub-directory.js' );

		wp_enqueue_style(
			'frankenstyle-kit',
			$plugin_url . 'assets/css/frankenstyle-kit.min.css',
			array(),
			filemtime( $plugin_dir . 'assets/css/frankenstyle-kit.min.css' )
		);

		wp_enqueue_script(
			'frs-hub-directory',
			$plugin_url . 'assets/js/hub-directory.js',
			array(),
			$version,
			true
		);

		// Build roles list for the filter dropdown.
		$active_roles = Roles::get_active_company_roles();

		wp_localize_script(
			'frs-hub-directory',
			'frsDirectory',
			array(
				'restUrl'   => rest_url( 'frs-users/v1/' ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'roles'     => $active_roles,
				'pluginUrl' => FRS_USERS_URL,
			)
		);

		ob_start();
		include $plugin_dir . 'templates/directory/hub-directory.php';
		return ob_get_clean();
	}

	/**
	 * Render the hub directory slide-out profile panel.
	 *
	 * Hooked to blocksy:content:before so it sits outside page content.
	 */
	public static function render_hub_directory_panel() {
		?>
		<div class="frs-panel" id="frs-panel" aria-hidden="true">
			<div class="frs-panel__inner">
				<button class="frs-panel__close" id="frs-panel-close" type="button" aria-label="<?php esc_attr_e( 'Close', 'frs-users' ); ?>">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
				<div class="frs-panel__body" id="frs-panel-body"></div>
			</div>
		</div>
		<?php
	}
}
