<?php
/**
 * Main Plugin Class
 *
 * @package FRSUsers
 * @since 1.0.0
 */

use FRSUsers\Core\ProfileFields;
use FRSUsers\Core\ProfileStorage;
use FRSUsers\Core\CLI;
use FRSUsers\Routes\Api;
use FRSUsers\Admin\ProfilesPage;
use FRSUsers\Admin\ProfileEdit;
use FRSUsers\Assets\Admin;
use FRSUsers\Integrations\FRSSync;
use FRSUsers\Traits\Base;

defined( 'ABSPATH' ) || exit;

/**
 * Class FRSUsers
 *
 * The main class for the FRS Users plugin, responsible for initialization and setup.
 *
 * @since 1.0.0
 */
final class FRSUsers {

	use Base;

	/**
	 * Class constructor.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __construct() {
		// Constants are defined in main plugin file
	}

	/**
	 * Main execution point where the plugin will fire up.
	 *
	 * Initializes necessary components for both admin and frontend.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init() {
		// Initialize Carbon Fields profile fields
		ProfileFields::init();

		// Initialize profile storage override
		ProfileStorage::init();

		// Initialize REST API routes
		Api::init();

		// Initialize WP-CLI commands
		CLI::init();

		// Initialize FRS Sync integration
		FRSSync::init();

		// Initialize admin interface
		if ( is_admin() ) {
			ProfilesPage::get_instance()->init();
			ProfileEdit::get_instance()->init();
			\FRSUsers\Admin\ProfileMerge::get_instance()->init();
			Admin::get_instance()->bootstrap();
		}

		// Initialize internationalization
		add_action( 'init', array( $this, 'i18n' ) );

		// Allow other plugins to hook into FRS Users
		do_action( 'frs_users_loaded' );
	}

	/**
	 * Internationalization setup for language translations.
	 *
	 * Loads the plugin text domain for localization.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function i18n() {
		load_plugin_textdomain( 'frs-users', false, dirname( plugin_basename( FRS_USERS_PLUGIN_FILE ) ) . '/languages/' );
	}
}
