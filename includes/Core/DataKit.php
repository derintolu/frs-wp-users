<?php
/**
 * DataKit Integration Helper for FRS User Profiles
 *
 * Provides DataViews for profile management in admin and front-end directory views.
 * Wraps existing Profile model and REST API endpoints with DataKit for enhanced UI.
 *
 * @package FRSUsers\Core
 * @since   1.0.0
 */

namespace FRSUsers\Core;

use DataKit\DataViews\Data\ArrayDataSource;
use DataKit\DataViews\DataView\DataView;
use DataKit\DataViews\Field\TextField;
use DataKit\DataViews\Field\EnumField;
use DataKit\DataViews\Field\ImageField;
use DataKit\DataViews\DataView\Sort;
use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

defined( 'ABSPATH' ) || exit;

/**
 * DataKit Integration Helper Class
 *
 * Creates DataViews for profile management and directory displays.
 *
 * Usage:
 * ```php
 * // Admin: Full profile management table
 * $profiles_dataview = \FRSUsers\Core\DataKit::get_instance()->create_profiles_admin_dataview();
 * echo \FRSUsers\Core\DataKit::get_instance()->render_dataview( $profiles_dataview );
 *
 * // Frontend: Public directory (active profiles only)
 * $directory_dataview = \FRSUsers\Core\DataKit::get_instance()->create_profiles_directory_dataview();
 * echo \FRSUsers\Core\DataKit::get_instance()->render_dataview( $directory_dataview );
 * ```
 *
 * @since 1.0.0
 */
class DataKit {
	use Base;

	/**
	 * Cached DataView instances
	 *
	 * @var array<string, DataView>
	 */
	private array $dataviews = [];

	/**
	 * Initialize the DataKit integration
	 *
	 * @return void
	 */
	public function init(): void {
		// Register shortcodes
		add_shortcode( 'frs_profiles_directory', array( $this, 'shortcode_profiles_directory' ) );
		add_shortcode( 'frs_profiles_admin', array( $this, 'shortcode_profiles_admin' ) );
	}

	/**
	 * Create DataView for Admin Profile Management
	 *
	 * Shows ALL profiles (active + inactive, guest + WordPress users) with:
	 * - Filtering by person type (LO, Agent, Staff, etc.)
	 * - Filtering by active/inactive status
	 * - Search across name, email, phone
	 * - Bulk actions (activate, deactivate, delete)
	 *
	 * @return DataView
	 */
	public function create_profiles_admin_dataview(): DataView {
		if ( isset( $this->dataviews['profiles-admin'] ) ) {
			return $this->dataviews['profiles-admin'];
		}

		// Fetch all profiles using Eloquent
		$profiles_data = $this->get_profiles_data( array( 'include_inactive' => true ) );

		// Create data source
		$data_source = new ArrayDataSource( 'frs-profiles-admin', $profiles_data );

		// Define fields
		$fields = array(
			$avatar_field = ImageField::create( 'avatar_url', __( 'Avatar', 'frs-users' ) ),
			$name_field = TextField::create( 'display_name', __( 'Name', 'frs-users' ) ),
			TextField::create( 'email', __( 'Email', 'frs-users' ) ),
			TextField::create( 'phone', __( 'Phone', 'frs-users' ) ),
			EnumField::create(
				'select_person_type',
				__( 'Type', 'frs-users' ),
				array(
					'loan_officer' => __( 'Loan Officer', 'frs-users' ),
					'agent' => __( 'Real Estate Agent', 'frs-users' ),
					'staff' => __( 'Staff', 'frs-users' ),
					'leadership' => __( 'Leadership', 'frs-users' ),
					'assistant' => __( 'Assistant', 'frs-users' ),
				)
			),
			EnumField::create(
				'is_active',
				__( 'Status', 'frs-users' ),
				array(
					'1' => __( 'Active', 'frs-users' ),
					'0' => __( 'Inactive', 'frs-users' ),
				)
			),
			TextField::create( 'nmls', __( 'NMLS', 'frs-users' ) ),
		);

		// Create table DataView
		$dataview = DataView::table( 'frs-profiles-admin', $data_source, $fields )
			->primary_field( $name_field )
			->media_field( $avatar_field )
			->sort( Sort::asc( 'display_name' ) )
			->paginate( 50 )
			->search( '' );

		$this->dataviews['profiles-admin'] = $dataview;
		return $dataview;
	}

	/**
	 * Create DataView for Public Profile Directory
	 *
	 * Shows ONLY active profiles with public visibility:
	 * - Grid or list layout (user can switch)
	 * - Filtering by person type
	 * - Search by name
	 * - Click to view full profile
	 *
	 * @return DataView
	 */
	public function create_profiles_directory_dataview(): DataView {
		if ( isset( $this->dataviews['profiles-directory'] ) ) {
			return $this->dataviews['profiles-directory'];
		}

		// Fetch only active, public profiles
		$profiles_data = $this->get_profiles_data( array(
			'active_only' => true,
			'public_only' => true,
		) );

		$data_source = new ArrayDataSource( 'frs-profiles-directory', $profiles_data );

		// Fields for directory view
		$fields = array(
			$avatar_field = ImageField::create( 'avatar_url', __( 'Photo', 'frs-users' ) ),
			$name_field = TextField::create( 'display_name', __( 'Name', 'frs-users' ) ),
			TextField::create( 'job_title', __( 'Title', 'frs-users' ) ),
			EnumField::create(
				'select_person_type',
				__( 'Type', 'frs-users' ),
				array(
					'loan_officer' => __( 'Loan Officer', 'frs-users' ),
					'agent' => __( 'Real Estate Agent', 'frs-users' ),
				)
			),
			TextField::create( 'city_state', __( 'Location', 'frs-users' ) ),
		);

		// Create grid DataView (better for public directory)
		$dataview = DataView::grid( 'frs-profiles-directory', $data_source, $fields )
			->primary_field( $name_field )
			->media_field( $avatar_field )
			->sort( Sort::asc( 'display_name' ) )
			->paginate( 24 ) // 24 works well for grid (4x6)
			->search( '' );

		$this->dataviews['profiles-directory'] = $dataview;
		return $dataview;
	}

	/**
	 * Get profiles data formatted for DataKit
	 *
	 * @param array $args Query arguments.
	 * @return array<string, array<string, string>>
	 */
	private function get_profiles_data( array $args = array() ): array {
		$defaults = array(
			'include_inactive' => false,
			'active_only' => false,
			'public_only' => false,
		);
		$args = wp_parse_args( $args, $defaults );

		// Query using Eloquent
		$query = Profile::query();

		// Apply filters
		if ( $args['active_only'] ) {
			$query->where( 'is_active', 1 );
		}

		if ( $args['public_only'] ) {
			// TODO: Add profile_visibility JSON filtering when implemented
			// For now, just active profiles
			$query->where( 'is_active', 1 );
		}

		// Get results
		$profiles = $query->orderBy( 'last_name' )->get();

		// Transform to DataKit format (id => array of fields)
		$data = array();
		foreach ( $profiles as $profile ) {
			$data[ (string) $profile->id ] = array(
				'id' => (string) $profile->id,
				'display_name' => $profile->first_name . ' ' . $profile->last_name,
				'email' => $profile->email ?? '',
				'phone' => $profile->phone ?? '',
				'select_person_type' => $profile->select_person_type ?? '',
				'is_active' => $profile->is_active ? '1' : '0',
				'nmls' => $profile->nmls ?? '',
				'job_title' => $profile->job_title ?? '',
				'city_state' => $this->format_location( $profile ),
				'avatar_url' => $profile->headshot_photo_url ?? get_avatar_url( $profile->user_id ),
			);
		}

		return $data;
	}

	/**
	 * Format profile location as "City, State"
	 *
	 * @param Profile $profile Profile model instance.
	 * @return string
	 */
	private function format_location( Profile $profile ): string {
		$parts = array_filter( array(
			$profile->city ?? '',
			$profile->state ?? '',
		) );
		return implode( ', ', $parts );
	}

	/**
	 * Render a DataView
	 *
	 * @param DataView $dataview The DataView instance to render.
	 * @return string HTML markup for the DataView
	 */
	public function render_dataview( DataView $dataview ): string {
		$this->enqueue_datakit_assets();

		$dataview_config = $dataview->to_js( true );
		$container_id = 'datakit-' . $dataview->id();

		ob_start();
		?>
		<div id="<?php echo esc_attr( $container_id ); ?>" class="datakit-container"></div>
		<script type="text/javascript">
		( function() {
			if ( typeof datakit !== 'undefined' ) {
				datakit.init( '<?php echo esc_js( $container_id ); ?>', <?php echo $dataview_config; ?> );
			}
		} )();
		</script>
		<?php
		return ob_get_clean();
	}

	/**
	 * Enqueue DataKit assets
	 *
	 * @return void
	 */
	private function enqueue_datakit_assets(): void {
		$datakit_path = FRS_USERS_DIR . 'libs/datakit/';
		$datakit_url = FRS_USERS_URL . 'libs/datakit/';

		if ( ! file_exists( $datakit_path . 'assets/datakit.js' ) ) {
			return;
		}

		wp_enqueue_script(
			'datakit',
			$datakit_url . 'assets/datakit.js',
			array( 'wp-element', 'wp-components', 'wp-dataviews' ),
			'1.0.0',
			true
		);

		wp_enqueue_style(
			'datakit',
			$datakit_url . 'assets/datakit.css',
			array( 'wp-components' ),
			'1.0.0'
		);
	}

	/**
	 * Shortcode for profiles directory
	 *
	 * Usage: [frs_profiles_directory]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function shortcode_profiles_directory( array $atts ): string {
		$dataview = $this->create_profiles_directory_dataview();
		return $this->render_dataview( $dataview );
	}

	/**
	 * Shortcode for profiles admin
	 *
	 * Usage: [frs_profiles_admin]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function shortcode_profiles_admin( array $atts ): string {
		// Check permissions
		if ( ! current_user_can( 'manage_options' ) ) {
			return '';
		}

		$dataview = $this->create_profiles_admin_dataview();
		return $this->render_dataview( $dataview );
	}
}
