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
use FRSUsers\Core\ProfileApi;
use FRSUsers\Core\PluginDependencies;
use FRSUsers\Core\Template;
use FRSUsers\Core\CORS;
use FRSUsers\Core\DataKit;
use FRSUsers\Controllers\Shortcodes;
use FRSUsers\Routes\Api;
use FRSUsers\Admin\ProfilesPage;
use FRSUsers\Admin\ProfileEdit;
use FRSUsers\Assets\Admin;
use FRSUsers\Integrations\FRSSync;
use FRSUsers\Integrations\FluentCRMSync;
use FRSUsers\Controllers\Blocks;
use FRSUsers\Traits\Base;
use Prappo\WpEloquent\Application;

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
		// Initialize Eloquent ORM (must run first)
		Application::bootWp();

		// Check plugin dependencies
		PluginDependencies::get_instance()->init();

		// Initialize Carbon Fields profile fields
		ProfileFields::init();

		// Initialize profile storage override
		ProfileStorage::init();

		// Initialize REST API routes
		Api::init();

		// Initialize Profile API with CRUD and webhooks
		ProfileApi::get_instance()->init();

		// Initialize Gutenberg blocks
		Blocks::init();

		// Initialize frontend shortcodes
		Shortcodes::init();

		// Initialize template handler for public profiles
		Template::get_instance()->init();

		// Initialize CORS handler for REST API
		CORS::get_instance()->init();

		// Initialize DataKit integration if SDK is available
		if ( class_exists( 'DataKit\DataViews\DataView\DataView' ) ) {
			DataKit::get_instance()->init();
		}

		// Initialize WP-CLI commands
		CLI::init();

		// Initialize FRS Sync integration
		FRSSync::init();

		// Initialize FluentCRM real-time sync integration
		FluentCRMSync::get_instance()->init();

		// Initialize admin interface
		if ( is_admin() ) {
			ProfilesPage::get_instance()->init();
			ProfileEdit::get_instance()->init();
			\FRSUsers\Admin\ProfileMerge::get_instance()->init();
			Admin::get_instance()->bootstrap();
		}

		// Initialize internationalization
		add_action( 'init', array( $this, 'i18n' ) );

		// Check dependencies and show admin notices
		add_action( 'admin_notices', array( $this, 'check_dependencies' ) );

		// Allow other plugins to hook into FRS Users
		do_action( 'frs_users_loaded' );
	}

	/**
	 * Check plugin dependencies and show admin notices
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function check_dependencies() {
		$missing = array();

		// Check for Carbon Fields
		if ( !class_exists('\\Carbon_Fields\\Carbon_Fields') ) {
			$missing[] = 'Carbon Fields';
		}

		// Check for FluentCRM (optional)
		if ( !function_exists('FluentCrmApi') ) {
			$missing[] = 'FluentCRM (optional - required for automatic contact sync)';
		}

		// Show notice if dependencies are missing
		if ( !empty($missing) ) {
			?>
			<div class="notice notice-warning">
				<p>
					<strong>FRS User Profiles</strong> requires the following plugins to function properly:
				</p>
				<ul style="list-style: disc; margin-left: 20px;">
					<?php foreach ($missing as $plugin): ?>
						<li><?php echo esc_html($plugin); ?></li>
					<?php endforeach; ?>
				</ul>
			</div>
			<?php
		}
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
