<?php
/**
 * Plugin Dependencies Check
 *
 * Ensures required plugins are installed and activated before frs-wp-users runs.
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Traits\Base;

defined( 'ABSPATH' ) || exit;

/**
 * Class PluginDependencies
 *
 * Checks for required plugin dependencies and displays admin notices.
 *
 * @since 1.0.0
 */
class PluginDependencies {

	use Base;

	/**
	 * Required plugins
	 *
	 * @var array
	 */
	private array $required_plugins = [
		'openid-connect-server/openid-connect-server.php' => [
			'name'        => 'OpenID Connect Server',
			'slug'        => 'openid-connect-server',
			'required'    => true,
			'description' => 'Provides SSO (Single Sign-On) capabilities for company-wide authentication.',
		],
	];

	/**
	 * Missing plugins
	 *
	 * @var array
	 */
	private array $missing_plugins = [];

	/**
	 * Initialize dependency checks
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init(): void {
		add_action( 'admin_init', [ $this, 'check_dependencies' ] );
		add_action( 'admin_notices', [ $this, 'display_admin_notices' ] );
	}

	/**
	 * Check if required plugins are active
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function check_dependencies(): void {
		$this->missing_plugins = [];

		foreach ( $this->required_plugins as $plugin_file => $plugin_data ) {
			if ( ! $plugin_data['required'] ) {
				continue;
			}

			if ( ! $this->is_plugin_active( $plugin_file ) ) {
				$this->missing_plugins[ $plugin_file ] = $plugin_data;
			}
		}

		// If critical plugins are missing, deactivate frs-wp-users
		if ( ! empty( $this->missing_plugins ) ) {
			add_action( 'admin_init', [ $this, 'deactivate_plugin' ] );
		}
	}

	/**
	 * Check if a plugin is active
	 *
	 * @since 1.0.0
	 * @param string $plugin_file Plugin file path.
	 * @return bool
	 */
	private function is_plugin_active( string $plugin_file ): bool {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return is_plugin_active( $plugin_file );
	}

	/**
	 * Display admin notices for missing plugins
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function display_admin_notices(): void {
		if ( empty( $this->missing_plugins ) ) {
			return;
		}

		foreach ( $this->missing_plugins as $plugin_file => $plugin_data ) {
			$this->display_missing_plugin_notice( $plugin_data );
		}
	}

	/**
	 * Display notice for a single missing plugin
	 *
	 * @since 1.0.0
	 * @param array $plugin_data Plugin data.
	 * @return void
	 */
	private function display_missing_plugin_notice( array $plugin_data ): void {
		$plugin_name = esc_html( $plugin_data['name'] );
		$description = esc_html( $plugin_data['description'] );
		$install_url = wp_nonce_url(
			self_admin_url( 'update.php?action=install-plugin&plugin=' . $plugin_data['slug'] ),
			'install-plugin_' . $plugin_data['slug']
		);

		?>
		<div class="notice notice-error">
			<p>
				<strong><?php esc_html_e( 'FRS User Profiles:', 'frs-users' ); ?></strong>
				<?php
				printf(
					/* translators: %s: plugin name */
					esc_html__( 'Required plugin "%s" is not installed or activated.', 'frs-users' ),
					$plugin_name
				);
				?>
			</p>
			<p><?php echo esc_html( $description ); ?></p>
			<p>
				<a href="<?php echo esc_url( $install_url ); ?>" class="button button-primary">
					<?php
					printf(
						/* translators: %s: plugin name */
						esc_html__( 'Install %s', 'frs-users' ),
						$plugin_name
					);
					?>
				</a>
			</p>
		</div>
		<?php
	}

	/**
	 * Deactivate frs-wp-users if dependencies are missing
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function deactivate_plugin(): void {
		deactivate_plugins( plugin_basename( FRS_USERS_PLUGIN_FILE ) );

		if ( isset( $_GET['activate'] ) ) {
			unset( $_GET['activate'] );
		}
	}

	/**
	 * Get list of required plugins
	 *
	 * @since 1.0.0
	 * @return array
	 */
	public function get_required_plugins(): array {
		return $this->required_plugins;
	}

	/**
	 * Get list of missing plugins
	 *
	 * @since 1.0.0
	 * @return array
	 */
	public function get_missing_plugins(): array {
		return $this->missing_plugins;
	}
}
