<?php
/**
 * DataKit Integration for FRS User Profiles
 *
 * Provides DataViews for profile management in admin and front-end directory views.
 * Uses DataKit SDK with @wordpress/dataviews component.
 *
 * @package FRSUsers\Core
 * @since   1.0.0
 */

namespace FRSUsers\Core;

use DataKit\DataViews\DataView\DataView;
use FRSUsers\DataKit\ProfilesDataView;
use FRSUsers\Traits\Base;

defined( 'ABSPATH' ) || exit;

/**
 * Class DataKit
 *
 * Main DataKit integration class for FRS Users plugin.
 *
 * Usage:
 * ```php
 * // Render admin profiles DataView
 * echo \FRSUsers\Core\DataKit::get_instance()->render_dataview( ProfilesDataView::admin() );
 *
 * // Render public directory DataView
 * echo \FRSUsers\Core\DataKit::get_instance()->render_dataview( ProfilesDataView::directory() );
 * ```
 *
 * @since 1.0.0
 */
class DataKit {
	use Base;

	/**
	 * REST API namespace for DataKit endpoints.
	 *
	 * @var string
	 */
	private const REST_NAMESPACE = 'frs-users/v1';

	/**
	 * Registered DataViews for the current request.
	 *
	 * @var array<string, DataView>
	 */
	private array $registered_views = [];

	/**
	 * Initialize the DataKit integration
	 *
	 * @return void
	 */
	public function init(): void {
		// Register shortcodes
		add_shortcode( 'frs_profiles_directory', [ $this, 'shortcode_profiles_directory' ] );
		add_shortcode( 'frs_profiles_dataview', [ $this, 'shortcode_profiles_dataview' ] );

		// Register admin page
		add_action( 'admin_menu', [ $this, 'register_admin_pages' ], 20 );

		// Register REST API endpoints for DataKit
		add_action( 'rest_api_init', [ $this, 'register_rest_endpoints' ] );

		// Enqueue DataKit assets
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend_assets' ] );

		// Output DataKit data in footer
		add_action( 'admin_footer', [ $this, 'output_datakit_data' ] );
		add_action( 'wp_footer', [ $this, 'output_datakit_data' ] );
	}

	/**
	 * Register admin menu pages.
	 *
	 * @return void
	 */
	public function register_admin_pages(): void {
		// Add DataView-based profiles page
		add_submenu_page(
			'frs-profiles',
			__( 'Profiles (DataView)', 'frs-users' ),
			__( 'Profiles (DataView)', 'frs-users' ),
			'manage_options',
			'frs-profiles-dataview',
			[ $this, 'render_admin_profiles_page' ]
		);
	}

	/**
	 * Register REST API endpoints for DataKit.
	 *
	 * @return void
	 */
	public function register_rest_endpoints(): void {
		// DataView data endpoint (matches SDK expectation: /views/{id})
		register_rest_route(
			self::REST_NAMESPACE,
			'/views/(?P<id>[a-z0-9-]+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'rest_get_view_data' ],
				'permission_callback' => [ $this, 'check_view_permissions' ],
				'args'                => [
					'id'      => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					],
					'page'    => [
						'type'              => 'integer',
						'default'           => 1,
						'sanitize_callback' => 'absint',
					],
					'perPage' => [
						'type'              => 'integer',
						'default'           => 25,
						'sanitize_callback' => 'absint',
					],
					'search'  => [
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'filters' => [
						'type'    => 'string',
						'default' => '',
					],
					'sort'    => [
						'type'    => 'string',
						'default' => '',
					],
				],
			]
		);

		// Single item view endpoint (for viewable() modal)
		register_rest_route(
			self::REST_NAMESPACE,
			'/views/(?P<id>[a-z0-9-]+)/data/(?P<item_id>\d+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'rest_get_view_item' ],
				'permission_callback' => [ $this, 'check_view_permissions' ],
			]
		);

		// Delete endpoint (for deletable() action)
		register_rest_route(
			self::REST_NAMESPACE,
			'/views/(?P<id>[a-z0-9-]+)/data',
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'rest_delete_view_items' ],
				'permission_callback' => [ $this, 'check_delete_permissions' ],
			]
		);
	}

	/**
	 * Check view permissions for DataView endpoints.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return bool
	 */
	public function check_view_permissions( \WP_REST_Request $request ): bool {
		$view_id = $request->get_param( 'id' );

		// Directory views are public
		if ( strpos( $view_id, 'directory' ) !== false ) {
			return true;
		}

		// Admin views require manage_options
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check delete permissions for DataView endpoints.
	 *
	 * @return bool
	 */
	public function check_delete_permissions(): bool {
		return current_user_can( 'delete_users' );
	}

	/**
	 * REST endpoint: Get DataView data.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function rest_get_view_data( \WP_REST_Request $request ): \WP_REST_Response {
		$view_id  = $request->get_param( 'id' );
		$page     = $request->get_param( 'page' );
		$per_page = $request->get_param( 'perPage' );
		$search   = $request->get_param( 'search' );

		try {
			$dataview = $this->get_dataview_by_id( $view_id );

			if ( ! $dataview ) {
				return new \WP_REST_Response( [ 'error' => 'DataView not found' ], 404 );
			}

			// Apply request parameters
			$dataview->paginate( $per_page, $page );

			if ( ! empty( $search ) ) {
				$dataview->search( $search );
			}

			return new \WP_REST_Response( $dataview->to_array(), 200 );
		} catch ( \Exception $e ) {
			return new \WP_REST_Response( [ 'error' => $e->getMessage() ], 500 );
		}
	}

	/**
	 * REST endpoint: Get single view item.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function rest_get_view_item( \WP_REST_Request $request ): \WP_REST_Response {
		$view_id = $request->get_param( 'id' );
		$item_id = $request->get_param( 'item_id' );

		try {
			$dataview = $this->get_dataview_by_id( $view_id );

			if ( ! $dataview ) {
				return new \WP_REST_Response( [ 'error' => 'DataView not found' ], 404 );
			}

			$item = $dataview->get_view_data_item( (string) $item_id );

			return new \WP_REST_Response( $item->to_array(), 200 );
		} catch ( \Exception $e ) {
			return new \WP_REST_Response( [ 'error' => $e->getMessage() ], 500 );
		}
	}

	/**
	 * REST endpoint: Delete view items.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function rest_delete_view_items( \WP_REST_Request $request ): \WP_REST_Response {
		$view_id = $request->get_param( 'id' );
		$body    = $request->get_json_params();
		$item_id = $body['id'] ?? null;

		if ( ! $item_id ) {
			return new \WP_REST_Response( [ 'error' => 'No item ID provided' ], 400 );
		}

		try {
			$dataview = $this->get_dataview_by_id( $view_id );

			if ( ! $dataview ) {
				return new \WP_REST_Response( [ 'error' => 'DataView not found' ], 404 );
			}

			$data_source = $dataview->data_source();

			if ( ! method_exists( $data_source, 'delete_data_by_id' ) ) {
				return new \WP_REST_Response( [ 'error' => 'Data source does not support deletion' ], 400 );
			}

			$data_source->delete_data_by_id( (string) $item_id );

			return new \WP_REST_Response( [ 'success' => true ], 200 );
		} catch ( \Exception $e ) {
			return new \WP_REST_Response( [ 'error' => $e->getMessage() ], 500 );
		}
	}

	/**
	 * Get a DataView instance by ID.
	 *
	 * @param string $view_id The DataView ID.
	 * @return DataView|null
	 */
	private function get_dataview_by_id( string $view_id ): ?DataView {
		switch ( $view_id ) {
			case 'frs-profiles-admin':
				return ProfilesDataView::admin();
			case 'frs-profiles-directory':
				return ProfilesDataView::directory();
			default:
				return null;
		}
	}

	/**
	 * Enqueue admin assets for DataKit.
	 *
	 * @param string $hook The current admin page hook.
	 * @return void
	 */
	public function enqueue_admin_assets( string $hook ): void {
		// Only load on our DataView pages
		if ( strpos( $hook, 'frs-profiles-dataview' ) === false ) {
			return;
		}

		$this->enqueue_datakit_assets();
	}

	/**
	 * Enqueue frontend assets for DataKit.
	 *
	 * @return void
	 */
	public function enqueue_frontend_assets(): void {
		// Only enqueue if shortcode is used
		global $post;
		if ( $post && ( has_shortcode( $post->post_content, 'frs_profiles_directory' ) || has_shortcode( $post->post_content, 'frs_profiles_dataview' ) ) ) {
			$this->enqueue_datakit_assets();
		}
	}

	/**
	 * Enqueue DataKit SDK JavaScript and CSS.
	 *
	 * @return void
	 */
	private function enqueue_datakit_assets(): void {
		$datakit_path = FRS_USERS_DIR . 'libs/datakit/';
		$datakit_url  = FRS_USERS_URL . 'libs/datakit/';

		// Enqueue DataKit SDK pre-built assets
		if ( file_exists( $datakit_path . 'assets/js/dataview.js' ) ) {
			wp_enqueue_script(
				'datakit',
				$datakit_url . 'assets/js/dataview.js',
				[ 'react', 'react-dom', 'wp-element', 'wp-components', 'wp-data' ],
				filemtime( $datakit_path . 'assets/js/dataview.js' ),
				true
			);
		}

		if ( file_exists( $datakit_path . 'assets/css/dataview.css' ) ) {
			wp_enqueue_style(
				'datakit',
				$datakit_url . 'assets/css/dataview.css',
				[ 'wp-components' ],
				filemtime( $datakit_path . 'assets/css/dataview.css' )
			);
		}

		// Add inline styles for DataView containers
		wp_add_inline_style( 'wp-components', '
			.datakit-container {
				--wp-admin-theme-color: #007cba;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
				background: #fff;
				padding: 16px;
				border-radius: 4px;
				box-shadow: 0 1px 3px rgba(0,0,0,0.1);
			}
			.datakit-container .dataviews-wrapper {
				padding: 0;
			}
			.datakit-container .dataviews-view-table {
				border: 1px solid #ddd;
			}
			.datakit-container .dataviews-filters {
				margin-bottom: 16px;
			}
		' );
	}

	/**
	 * Output DataKit JavaScript data in footer.
	 *
	 * @return void
	 */
	public function output_datakit_data(): void {
		if ( empty( $this->registered_views ) ) {
			return;
		}

		$rest_url = rest_url( self::REST_NAMESPACE );

		// Build JavaScript object using SDK's to_js() method
		$js_parts = [];
		foreach ( $this->registered_views as $id => $dataview ) {
			// Use to_js() which properly handles __RAW__ placeholders for JS functions
			$js_config = $dataview->to_js( false );

			// Replace {REST_ENDPOINT} placeholders with actual REST URL
			$js_config = str_replace( '{REST_ENDPOINT}', $rest_url, $js_config );

			$js_parts[] = wp_json_encode( $id ) . ': ' . $js_config;
		}

		?>
		<script type="text/javascript">
			var datakit_dataviews = {<?php echo implode( ',', $js_parts ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>};
			var datakit_dataviews_rest_endpoint = <?php echo wp_json_encode( $rest_url ); ?>;
		</script>
		<?php
	}

	/**
	 * Recursively replace {REST_ENDPOINT} placeholders in array.
	 *
	 * @param mixed  $data     The data to process.
	 * @param string $rest_url The REST URL.
	 * @return mixed
	 */
	private function replace_rest_endpoint_placeholders( $data, string $rest_url ) {
		if ( is_string( $data ) ) {
			return str_replace( '{REST_ENDPOINT}', $rest_url, $data );
		}

		if ( is_array( $data ) ) {
			foreach ( $data as $key => $value ) {
				$data[ $key ] = $this->replace_rest_endpoint_placeholders( $value, $rest_url );
			}
		}

		return $data;
	}

	/**
	 * Render the admin profiles page.
	 *
	 * @return void
	 */
	public function render_admin_profiles_page(): void {
		// Get query parameters for initial state
		$args = [
			'show_archived' => isset( $_GET['show_archived'] ) && $_GET['show_archived'] === '1',
			'guests_only'   => isset( $_GET['guests_only'] ) && $_GET['guests_only'] === '1',
			'type'          => sanitize_text_field( $_GET['type'] ?? '' ),
			'per_page'      => absint( $_GET['per_page'] ?? 25 ),
		];

		echo '<div class="wrap">';
		echo '<h1 class="wp-heading-inline">' . esc_html__( 'Profiles', 'frs-users' ) . '</h1>';
		echo '<a href="' . esc_url( admin_url( 'admin.php?page=frs-profiles#/profiles/new' ) ) . '" class="page-title-action">' . esc_html__( 'Add New', 'frs-users' ) . '</a>';
		echo '<hr class="wp-header-end">';

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Method returns escaped HTML
		echo $this->render_dataview( ProfilesDataView::admin( $args ) );
		echo '</div>';
	}

	/**
	 * Render a DataView as HTML using DataKit SDK.
	 *
	 * @param DataView $dataview The DataView instance.
	 * @return string HTML output.
	 */
	public function render_dataview( DataView $dataview ): string {
		$this->enqueue_datakit_assets();

		$view_id = $dataview->id();

		// Register the view for footer output
		$this->registered_views[ $view_id ] = $dataview;

		// Return container with data-dataview attribute (SDK expects this)
		return sprintf(
			'<div data-dataview="%s" class="datakit-container" style="min-height: 400px;"></div>',
			esc_attr( $view_id )
		);
	}

	/**
	 * Shortcode: Profiles Directory
	 *
	 * Usage: [frs_profiles_directory type="loan_officer" per_page="24"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function shortcode_profiles_directory( array $atts = [] ): string {
		$atts = shortcode_atts(
			[
				'type'     => '',
				'per_page' => 24,
			],
			$atts,
			'frs_profiles_directory'
		);

		$dataview = ProfilesDataView::directory( [
			'type'     => sanitize_text_field( $atts['type'] ),
			'per_page' => absint( $atts['per_page'] ),
		] );

		return $this->render_dataview( $dataview );
	}

	/**
	 * Shortcode: Profiles DataView (Admin-style)
	 *
	 * Usage: [frs_profiles_dataview show_archived="0" per_page="25"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function shortcode_profiles_dataview( array $atts = [] ): string {
		// Check permissions
		if ( ! current_user_can( 'manage_options' ) ) {
			return '';
		}

		$atts = shortcode_atts(
			[
				'show_archived' => '0',
				'guests_only'   => '0',
				'type'          => '',
				'per_page'      => 25,
			],
			$atts,
			'frs_profiles_dataview'
		);

		$dataview = ProfilesDataView::admin( [
			'show_archived' => $atts['show_archived'] === '1',
			'guests_only'   => $atts['guests_only'] === '1',
			'type'          => sanitize_text_field( $atts['type'] ),
			'per_page'      => absint( $atts['per_page'] ),
		] );

		return $this->render_dataview( $dataview );
	}
}
