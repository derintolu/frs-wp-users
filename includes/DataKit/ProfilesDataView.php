<?php
/**
 * Profiles DataView Configuration
 *
 * Creates DataKit DataViews for profile management in admin and frontend.
 *
 * @package FRSUsers\DataKit
 * @since   1.0.0
 */

namespace FRSUsers\DataKit;

use DataKit\DataViews\DataView\DataView;
use DataKit\DataViews\DataView\View;
use DataKit\DataViews\DataView\Sort;
use DataKit\DataViews\DataView\Actions;
use DataKit\DataViews\DataView\Action;
use DataKit\DataViews\DataView\Operator;
use DataKit\DataViews\Field\TextField;
use DataKit\DataViews\Field\EnumField;
use DataKit\DataViews\Field\ImageField;
use FRSUsers\Models\Profile;

defined( 'ABSPATH' ) || exit;

/**
 * Class ProfilesDataView
 *
 * Factory class for creating profile-related DataViews.
 *
 * @since 1.0.0
 */
class ProfilesDataView {

	/**
	 * Person type options for filtering.
	 *
	 * @var array<string, string>
	 */
	private const PERSON_TYPES = [
		'loan_officer' => 'Loan Officer',
		'agent'        => 'Real Estate Agent',
		'staff'        => 'Staff',
		'leadership'   => 'Leadership',
		'assistant'    => 'Assistant',
	];

	/**
	 * Status options for filtering.
	 *
	 * @var array<string, string>
	 */
	private const STATUS_OPTIONS = [
		'active'   => 'Active',
		'guest'    => 'Guest (No Account)',
		'has_user' => 'Has User Account',
		'archived' => 'Archived',
	];

	/**
	 * Create the admin profiles DataView.
	 *
	 * Shows all profiles with full management capabilities:
	 * - Table, Grid, and List views
	 * - Filtering by type, status
	 * - Search across name, email, NMLS
	 * - Actions: View, Edit, Delete, Archive, Create User
	 *
	 * @param array $args Optional arguments.
	 * @return DataView
	 */
	public static function admin( array $args = [] ): DataView {
		$defaults = [
			'show_archived' => false,
			'guests_only'   => false,
			'type'          => '',
			'per_page'      => 25,
		];
		$args = wp_parse_args( $args, $defaults );

		// Create Eloquent data source
		$data_source = new EloquentDataSource(
			'frs-profiles-admin',
			Profile::class,
			[ self::class, 'transform_profile_admin' ],
			function ( $query ) use ( $args ) {
				// Apply base filters
				if ( ! $args['show_archived'] ) {
					$query->where( 'is_active', 1 );
				}
				if ( $args['guests_only'] ) {
					$query->whereNull( 'user_id' );
				}
				if ( ! empty( $args['type'] ) ) {
					$query->where( 'select_person_type', $args['type'] );
				}
				return $query;
			}
		);

		// Configure data source
		$data_source->set_field_mappings( [
			'display_name'       => 'first_name',
			'email'              => 'email',
			'phone'              => 'phone_number',
			'select_person_type' => 'select_person_type',
			'is_active'          => 'is_active',
			'nmls'               => 'nmls',
			'city_state'         => 'city_state',
		] );

		$data_source->set_searchable_fields( [
			'first_name',
			'last_name',
			'email',
			'nmls',
			'nmls_number',
			'phone_number',
		] );

		$data_source->allow_delete( current_user_can( 'delete_users' ) );

		// Define fields
		$avatar_field = ImageField::create( 'avatar_url', __( 'Photo', 'frs-users' ) )
			->always_visible();

		$name_field = TextField::create( 'display_name', __( 'Name', 'frs-users' ) )
			->always_visible();

		$email_field = TextField::create( 'email', __( 'Email', 'frs-users' ) );

		$phone_field = TextField::create( 'phone', __( 'Phone', 'frs-users' ) );

		$nmls_field = TextField::create( 'nmls', __( 'NMLS', 'frs-users' ) );

		// EnumField with filterable options
		$type_field = EnumField::create( 'select_person_type', __( 'Type', 'frs-users' ), self::PERSON_TYPES )
			->filterable_by( Operator::isAny() )
			->primary();

		$status_field = EnumField::create( 'status_display', __( 'Status', 'frs-users' ), self::STATUS_OPTIONS )
			->filterable_by( Operator::isAny() );

		$location_field = TextField::create( 'city_state', __( 'Location', 'frs-users' ) );

		$fields = [
			$avatar_field,
			$name_field,
			$email_field,
			$phone_field,
			$nmls_field,
			$type_field,
			$status_field,
			$location_field,
		];

		// Create DataView
		$dataview = DataView::table( 'frs-profiles-admin', $data_source, $fields, Sort::asc( 'display_name' ) )
			->supports( View::Grid(), View::List() )
			->primary_field( $name_field )
			->media_field( $avatar_field )
			->paginate( $args['per_page'] )
			->search( '' );

		// Add view action with detail fields
		$view_fields = self::get_profile_view_fields();
		$dataview->viewable( $view_fields, __( 'View Details', 'frs-users' ) );

		// Add delete action if allowed
		if ( current_user_can( 'delete_users' ) ) {
			$dataview->deletable( __( 'Delete', 'frs-users' ) );
		}

		return $dataview;
	}

	/**
	 * Create the public directory DataView.
	 *
	 * Shows only active, public profiles with limited fields:
	 * - Grid and List views (no table)
	 * - Filtering by type only
	 * - Search by name
	 * - Click to view profile
	 *
	 * @param array $args Optional arguments.
	 * @return DataView
	 */
	public static function directory( array $args = [] ): DataView {
		$defaults = [
			'type'     => '',
			'per_page' => 24,
		];
		$args = wp_parse_args( $args, $defaults );

		// Create Eloquent data source (active profiles only)
		$data_source = new EloquentDataSource(
			'frs-profiles-directory',
			Profile::class,
			[ self::class, 'transform_profile_directory' ],
			function ( $query ) use ( $args ) {
				$query->where( 'is_active', 1 );
				if ( ! empty( $args['type'] ) ) {
					$query->where( 'select_person_type', $args['type'] );
				}
				return $query;
			}
		);

		$data_source->set_field_mappings( [
			'display_name'       => 'first_name',
			'select_person_type' => 'select_person_type',
			'city_state'         => 'city_state',
		] );

		$data_source->set_searchable_fields( [
			'first_name',
			'last_name',
		] );

		// Define fields (limited for public view)
		$avatar_field = ImageField::create( 'avatar_url', __( 'Photo', 'frs-users' ) )
			->always_visible();

		$name_field = TextField::create( 'display_name', __( 'Name', 'frs-users' ) )
			->always_visible();

		$title_field = TextField::create( 'job_title', __( 'Title', 'frs-users' ) );

		$type_field = EnumField::create( 'select_person_type', __( 'Type', 'frs-users' ), [
			'loan_officer' => __( 'Loan Officer', 'frs-users' ),
			'agent'        => __( 'Real Estate Agent', 'frs-users' ),
		] )
			->filterable_by( Operator::isAny() )
			->primary();

		$location_field = TextField::create( 'city_state', __( 'Location', 'frs-users' ) );

		$fields = [
			$avatar_field,
			$name_field,
			$title_field,
			$type_field,
			$location_field,
		];

		// Create Grid DataView
		$dataview = DataView::grid( 'frs-profiles-directory', $data_source, $fields, Sort::asc( 'display_name' ) )
			->supports( View::List() )
			->primary_field( $name_field )
			->media_field( $avatar_field )
			->paginate( $args['per_page'] )
			->search( '' );

		return $dataview;
	}

	/**
	 * Transform a Profile model for admin DataView.
	 *
	 * @param Profile $profile The profile model.
	 * @return array
	 */
	public static function transform_profile_admin( Profile $profile ): array {
		// Determine status display
		$status_display = 'active';
		if ( ! $profile->is_active ) {
			$status_display = 'archived';
		} elseif ( empty( $profile->user_id ) ) {
			$status_display = 'guest';
		} else {
			$status_display = 'has_user';
		}

		return [
			'id'                 => (string) $profile->id,
			'display_name'       => trim( ( $profile->first_name ?? '' ) . ' ' . ( $profile->last_name ?? '' ) ) ?: ( $profile->display_name ?? $profile->email ),
			'first_name'         => $profile->first_name ?? '',
			'last_name'          => $profile->last_name ?? '',
			'email'              => $profile->email ?? '',
			'phone'              => $profile->phone_number ?? $profile->mobile_number ?? '',
			'select_person_type' => $profile->select_person_type ?? '',
			'is_active'          => $profile->is_active ? '1' : '0',
			'status_display'     => $status_display,
			'user_id'            => $profile->user_id,
			'nmls'               => $profile->nmls ?? $profile->nmls_number ?? '',
			'job_title'          => $profile->job_title ?? '',
			'city_state'         => $profile->city_state ?? '',
			'avatar_url'         => self::get_avatar_url( $profile ),
			'profile_slug'       => $profile->profile_slug ?? '',
			'biography'          => $profile->biography ?? '',
		];
	}

	/**
	 * Transform a Profile model for directory DataView.
	 *
	 * @param Profile $profile The profile model.
	 * @return array
	 */
	public static function transform_profile_directory( Profile $profile ): array {
		return [
			'id'                 => (string) $profile->id,
			'display_name'       => trim( ( $profile->first_name ?? '' ) . ' ' . ( $profile->last_name ?? '' ) ) ?: ( $profile->display_name ?? '' ),
			'email'              => $profile->email ?? '',
			'select_person_type' => $profile->select_person_type ?? '',
			'job_title'          => $profile->job_title ?? '',
			'city_state'         => $profile->city_state ?? '',
			'avatar_url'         => self::get_avatar_url( $profile ),
			'profile_slug'       => $profile->profile_slug ?? '',
			'phone'              => $profile->phone_number ?? '',
		];
	}

	/**
	 * Get avatar URL for a profile.
	 *
	 * @param Profile $profile The profile model.
	 * @return string
	 */
	private static function get_avatar_url( Profile $profile ): string {
		if ( ! empty( $profile->headshot_id ) ) {
			$url = wp_get_attachment_url( $profile->headshot_id );
			if ( $url ) {
				return $url;
			}
		}

		if ( ! empty( $profile->email ) ) {
			return get_avatar_url( $profile->email, [ 'size' => 150 ] );
		}

		if ( ! empty( $profile->user_id ) ) {
			return get_avatar_url( $profile->user_id, [ 'size' => 150 ] );
		}

		return '';
	}

	/**
	 * Get fields for profile detail view.
	 *
	 * @return array
	 */
	private static function get_profile_view_fields(): array {
		return [
			ImageField::create( 'avatar_url', __( 'Photo', 'frs-users' ) ),
			TextField::create( 'display_name', __( 'Name', 'frs-users' ) ),
			TextField::create( 'email', __( 'Email', 'frs-users' ) ),
			TextField::create( 'phone', __( 'Phone', 'frs-users' ) ),
			TextField::create( 'job_title', __( 'Job Title', 'frs-users' ) ),
			TextField::create( 'nmls', __( 'NMLS', 'frs-users' ) ),
			EnumField::create( 'select_person_type', __( 'Type', 'frs-users' ), self::PERSON_TYPES ),
			TextField::create( 'city_state', __( 'Location', 'frs-users' ) ),
			TextField::create( 'biography', __( 'Biography', 'frs-users' ) )->break(),
		];
	}
}
