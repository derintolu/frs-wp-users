<?php
/**
 * Main Plugin Class
 *
 * @package FRSUsers
 * @since 1.0.0
 */

use FRSUsers\Core\ProfileStorage;
use FRSUsers\Core\CLI;
use FRSUsers\Core\ProfileApi;
use FRSUsers\Core\PluginDependencies;
use FRSUsers\Core\Template;
use FRSUsers\Core\TemplateLoader;
use FRSUsers\Core\CORS;
use FRSUsers\Core\EmbeddablePages;
use FRSUsers\Controllers\Shortcodes;
use FRSUsers\Routes\Api;
use FRSUsers\Admin\ProfilesPage;
use FRSUsers\Admin\ProfileEdit;
use FRSUsers\Assets\Admin;
use FRSUsers\Integrations\FRSSync;
use FRSUsers\Integrations\FluentCRMSync;
use FRSUsers\Controllers\Blocks;
use FRSUsers\Abilities\AbilitiesRegistry;
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
		// Run any pending migrations
		$this->maybe_run_migrations();

		// Check plugin dependencies (must run first)
		PluginDependencies::get_instance()->init();

		// Initialize profile storage utilities (avatar sync)
		ProfileStorage::init();

		// Initialize REST API routes
		Api::init();

		// Initialize Profile API with CRUD and webhooks
		ProfileApi::get_instance()->init();

		// Initialize Gutenberg blocks
		Blocks::init();

		// Initialize frontend shortcodes
		Shortcodes::init();

		// Initialize template handler for public profiles (legacy /profile/{slug})
		Template::get_instance()->init();

		// Initialize new template loader for WordPress author pages with URL masking
		TemplateLoader::get_instance()->init();

		// Initialize CORS handler for REST API
		CORS::get_instance()->init();

		// Initialize embeddable pages for Nextcloud integration
		EmbeddablePages::get_instance()->init();


		// Initialize WP-CLI commands
		CLI::init();

		// Initialize FRS Sync integration
		FRSSync::init();

		// Initialize FluentCRM real-time sync integration
		FluentCRMSync::get_instance()->init();

		// Initialize Arrive URL auto-population for loan officers
		\FRSUsers\Integrations\ArriveAutoPopulate::init();

		// Initialize WordPress Abilities API integration
		AbilitiesRegistry::init();

		// Initialize admin interface
		if ( is_admin() ) {
			// New WordPress-native admin pages
			\FRSUsers\Admin\ProfilesAdminPage::get_instance()->init();
			\FRSUsers\Admin\ProfileEditPage::get_instance()->init();
			\FRSUsers\Admin\ProfileAddPage::get_instance()->init();
			\FRSUsers\Admin\UserProfileFields::get_instance()->init();

			// Legacy admin pages (to be removed)
			// ProfilesPage::get_instance()->init();
			// ProfileEdit::get_instance()->init();
			// \FRSUsers\Admin\ProfileMerge::get_instance()->init();
			// Admin::get_instance()->bootstrap();
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

		// Check for FluentCRM (optional)
		if ( !function_exists('FluentCrmApi') ) {
			$missing[] = 'FluentCRM (optional - required for automatic contact sync)';
		}

		// Show notice if optional dependencies are missing
		if ( !empty($missing) ) {
			?>
			<div class="notice notice-info is-dismissible">
				<p>
					<strong>FRS User Profiles</strong> - Optional integrations:
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

	/**
	 * Run any pending database migrations.
	 *
	 * @since 2.1.0
	 * @return void
	 */
	private function maybe_run_migrations() {
		// Run QR code data migration if column doesn't exist
		\FRSUsers\Database\Migrations\AddQRCodeData::up();
	}
}
