<?php
/**
 * Intranet Profile Extension
 *
 * Extends the base Profile model with intranet-specific fields
 * for org chart, hierarchy, and internal-only information.
 *
 * @package FRSUsers
 * @subpackage Intranet
 * @since 2.2.0
 */

namespace FRSUsers\Intranet;

use FRSUsers\Models\Profile;

/**
 * Class IntranetProfile
 *
 * Handles intranet-specific profile fields separate from consumer-facing profiles.
 * Uses frs_intranet_ prefix for meta keys to distinguish from consumer fields.
 */
class IntranetProfile {

	/**
	 * Meta key prefix for intranet fields.
	 */
	const META_PREFIX = 'frs_intranet_';

	/**
	 * User ID.
	 *
	 * @var int
	 */
	public $user_id;

	/**
	 * Base profile object.
	 *
	 * @var Profile
	 */
	public $profile;

	/**
	 * Internal job title (may differ from consumer-facing).
	 *
	 * @var string
	 */
	public $internal_title;

	/**
	 * Department.
	 *
	 * @var string
	 */
	public $department;

	/**
	 * Reports to user ID.
	 *
	 * @var int
	 */
	public $reports_to;

	/**
	 * Office location.
	 *
	 * @var string
	 */
	public $office_location;

	/**
	 * Desk phone.
	 *
	 * @var string
	 */
	public $desk_phone;

	/**
	 * Extension.
	 *
	 * @var string
	 */
	public $extension;

	/**
	 * Start date.
	 *
	 * @var string
	 */
	public $start_date;

	/**
	 * Employee ID.
	 *
	 * @var string
	 */
	public $employee_id;

	/**
	 * Internal bio (intranet-only).
	 *
	 * @var string
	 */
	public $internal_bio;

	/**
	 * Skills and expertise.
	 *
	 * @var array
	 */
	public $skills = array();

	/**
	 * Slack handle.
	 *
	 * @var string
	 */
	public $slack_handle;

	/**
	 * Teams email.
	 *
	 * @var string
	 */
	public $teams_email;

	/**
	 * Timezone.
	 *
	 * @var string
	 */
	public $timezone;

	/**
	 * Availability status.
	 *
	 * @var string
	 */
	public $availability_status;

	/**
	 * Working hours.
	 *
	 * @var array
	 */
	public $working_hours = array();

	/**
	 * Out of office message.
	 *
	 * @var string
	 */
	public $out_of_office_message;

	/**
	 * Profile visibility on intranet.
	 *
	 * @var bool
	 */
	public $is_visible = true;

	/**
	 * Notification preferences.
	 *
	 * @var array
	 */
	public $notification_preferences = array();

	/**
	 * Get intranet profile by user ID.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return IntranetProfile|null
	 */
	public static function get_by_user_id( $user_id ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return null;
		}
		return static::hydrate_from_user( $user );
	}

	/**
	 * Get intranet profile for current user.
	 *
	 * @return IntranetProfile|null
	 */
	public static function get_current() {
		if ( ! is_user_logged_in() ) {
			return null;
		}
		return static::get_by_user_id( get_current_user_id() );
	}

	/**
	 * Get all intranet profiles.
	 *
	 * @param array $args Query arguments.
	 * @return array Array of IntranetProfile objects.
	 */
	public static function get_all( $args = array() ) {
		$defaults = array(
			'role__not_in' => array( 'subscriber' ),
			'orderby'      => 'meta_value',
			'meta_key'     => 'first_name',
			'order'        => 'ASC',
			'number'       => -1,
		);

		$meta_query = array();

		// Filter by department.
		if ( ! empty( $args['department'] ) ) {
			$meta_query[] = array(
				'key'   => self::META_PREFIX . 'department',
				'value' => $args['department'],
			);
		}

		// Filter by office location.
		if ( ! empty( $args['office_location'] ) ) {
			$meta_query[] = array(
				'key'   => self::META_PREFIX . 'office_location',
				'value' => $args['office_location'],
			);
		}

		// Filter by visibility.
		if ( ! isset( $args['include_hidden'] ) || ! $args['include_hidden'] ) {
			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'     => self::META_PREFIX . 'is_visible',
					'value'   => '1',
					'compare' => '=',
				),
				array(
					'key'     => self::META_PREFIX . 'is_visible',
					'compare' => 'NOT EXISTS',
				),
			);
		}

		if ( ! empty( $meta_query ) ) {
			$defaults['meta_query'] = $meta_query;
		}

		// Pagination.
		if ( isset( $args['limit'] ) ) {
			$defaults['number'] = $args['limit'];
		}
		if ( isset( $args['offset'] ) ) {
			$defaults['offset'] = $args['offset'];
		}

		// Search.
		if ( ! empty( $args['search'] ) ) {
			$defaults['search']         = '*' . $args['search'] . '*';
			$defaults['search_columns'] = array( 'user_login', 'user_email', 'user_nicename', 'display_name' );
		}

		$users = get_users( $defaults );

		return array_map( array( static::class, 'hydrate_from_user' ), $users );
	}

	/**
	 * Get direct reports for a user.
	 *
	 * @param int $user_id Manager user ID.
	 * @return array Array of IntranetProfile objects.
	 */
	public static function get_direct_reports( $user_id ) {
		$users = get_users(
			array(
				'meta_key'   => self::META_PREFIX . 'reports_to',
				'meta_value' => $user_id,
				'orderby'    => 'display_name',
				'order'      => 'ASC',
			)
		);

		return array_map( array( static::class, 'hydrate_from_user' ), $users );
	}

	/**
	 * Get all departments.
	 *
	 * @return array Array of unique department names.
	 */
	public static function get_departments() {
		global $wpdb;

		$departments = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT meta_value FROM {$wpdb->usermeta}
				WHERE meta_key = %s AND meta_value != ''
				ORDER BY meta_value ASC",
				self::META_PREFIX . 'department'
			)
		);

		return $departments ?: array();
	}

	/**
	 * Get all office locations.
	 *
	 * @return array Array of unique office locations.
	 */
	public static function get_office_locations() {
		global $wpdb;

		$locations = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT meta_value FROM {$wpdb->usermeta}
				WHERE meta_key = %s AND meta_value != ''
				ORDER BY meta_value ASC",
				self::META_PREFIX . 'office_location'
			)
		);

		return $locations ?: array();
	}

	/**
	 * Hydrate IntranetProfile from WordPress user.
	 *
	 * @param \WP_User $user WordPress user object.
	 * @return IntranetProfile
	 */
	public static function hydrate_from_user( $user ) {
		$intranet          = new static();
		$intranet->user_id = $user->ID;

		// Get base profile.
		$intranet->profile = Profile::hydrate_from_user( $user );

		// Intranet-specific fields.
		$intranet->internal_title        = get_user_meta( $user->ID, self::META_PREFIX . 'internal_title', true );
		$intranet->department            = get_user_meta( $user->ID, self::META_PREFIX . 'department', true );
		$intranet->reports_to            = (int) get_user_meta( $user->ID, self::META_PREFIX . 'reports_to', true );
		$intranet->office_location       = get_user_meta( $user->ID, self::META_PREFIX . 'office_location', true );
		$intranet->desk_phone            = get_user_meta( $user->ID, self::META_PREFIX . 'desk_phone', true );
		$intranet->extension             = get_user_meta( $user->ID, self::META_PREFIX . 'extension', true );
		$intranet->start_date            = get_user_meta( $user->ID, self::META_PREFIX . 'start_date', true );
		$intranet->employee_id           = get_user_meta( $user->ID, self::META_PREFIX . 'employee_id', true );
		$intranet->internal_bio          = get_user_meta( $user->ID, self::META_PREFIX . 'internal_bio', true );
		$intranet->slack_handle          = get_user_meta( $user->ID, self::META_PREFIX . 'slack_handle', true );
		$intranet->teams_email           = get_user_meta( $user->ID, self::META_PREFIX . 'teams_email', true );
		$intranet->timezone              = get_user_meta( $user->ID, self::META_PREFIX . 'timezone', true );
		$intranet->availability_status   = get_user_meta( $user->ID, self::META_PREFIX . 'availability_status', true );
		$intranet->out_of_office_message = get_user_meta( $user->ID, self::META_PREFIX . 'out_of_office_message', true );

		// Boolean.
		$is_visible           = get_user_meta( $user->ID, self::META_PREFIX . 'is_visible', true );
		$intranet->is_visible = $is_visible === '' || $is_visible === '1';

		// JSON arrays.
		$intranet->skills                   = static::maybe_decode_array( get_user_meta( $user->ID, self::META_PREFIX . 'skills', true ) );
		$intranet->working_hours            = static::maybe_decode_array( get_user_meta( $user->ID, self::META_PREFIX . 'working_hours', true ) );
		$intranet->notification_preferences = static::maybe_decode_array( get_user_meta( $user->ID, self::META_PREFIX . 'notification_preferences', true ) );

		return $intranet;
	}

	/**
	 * Save intranet profile.
	 *
	 * @return bool
	 */
	public function save() {
		if ( ! $this->user_id ) {
			return false;
		}

		// String fields.
		update_user_meta( $this->user_id, self::META_PREFIX . 'internal_title', $this->internal_title );
		update_user_meta( $this->user_id, self::META_PREFIX . 'department', $this->department );
		update_user_meta( $this->user_id, self::META_PREFIX . 'reports_to', $this->reports_to );
		update_user_meta( $this->user_id, self::META_PREFIX . 'office_location', $this->office_location );
		update_user_meta( $this->user_id, self::META_PREFIX . 'desk_phone', $this->desk_phone );
		update_user_meta( $this->user_id, self::META_PREFIX . 'extension', $this->extension );
		update_user_meta( $this->user_id, self::META_PREFIX . 'start_date', $this->start_date );
		update_user_meta( $this->user_id, self::META_PREFIX . 'employee_id', $this->employee_id );
		update_user_meta( $this->user_id, self::META_PREFIX . 'internal_bio', $this->internal_bio );
		update_user_meta( $this->user_id, self::META_PREFIX . 'slack_handle', $this->slack_handle );
		update_user_meta( $this->user_id, self::META_PREFIX . 'teams_email', $this->teams_email );
		update_user_meta( $this->user_id, self::META_PREFIX . 'timezone', $this->timezone );
		update_user_meta( $this->user_id, self::META_PREFIX . 'availability_status', $this->availability_status );
		update_user_meta( $this->user_id, self::META_PREFIX . 'out_of_office_message', $this->out_of_office_message );
		update_user_meta( $this->user_id, self::META_PREFIX . 'is_visible', $this->is_visible ? '1' : '0' );

		// JSON fields.
		update_user_meta( $this->user_id, self::META_PREFIX . 'skills', wp_json_encode( $this->skills ?: array() ) );
		update_user_meta( $this->user_id, self::META_PREFIX . 'working_hours', wp_json_encode( $this->working_hours ?: array() ) );
		update_user_meta( $this->user_id, self::META_PREFIX . 'notification_preferences', wp_json_encode( $this->notification_preferences ?: array() ) );

		// Update timestamp.
		update_user_meta( $this->user_id, self::META_PREFIX . 'updated_at', current_time( 'mysql' ) );

		/**
		 * Fires after intranet profile is saved.
		 *
		 * @param int             $user_id User ID.
		 * @param IntranetProfile $profile The profile object.
		 */
		do_action( 'frs_intranet_profile_saved', $this->user_id, $this );

		return true;
	}

	/**
	 * Get the manager's profile.
	 *
	 * @return IntranetProfile|null
	 */
	public function get_manager() {
		if ( ! $this->reports_to ) {
			return null;
		}
		return static::get_by_user_id( $this->reports_to );
	}

	/**
	 * Get the org chart path up to the top.
	 *
	 * @return array Array of IntranetProfile objects from current to top.
	 */
	public function get_reporting_chain() {
		$chain   = array();
		$current = $this;
		$seen    = array( $this->user_id );

		while ( $current->reports_to && ! in_array( $current->reports_to, $seen, true ) ) {
			$manager = static::get_by_user_id( $current->reports_to );
			if ( ! $manager ) {
				break;
			}
			$chain[] = $manager;
			$seen[]  = $manager->user_id;
			$current = $manager;
		}

		return $chain;
	}

	/**
	 * Get display title (internal or fallback to profile job_title).
	 *
	 * @return string
	 */
	public function get_display_title() {
		return $this->internal_title ?: ( $this->profile->job_title ?? '' );
	}

	/**
	 * Convert to array for API responses.
	 *
	 * @param bool $include_base Whether to include base profile data.
	 * @return array
	 */
	public function toArray( $include_base = true ) {
		$data = array(
			'user_id'                  => $this->user_id,
			'internal_title'           => $this->internal_title,
			'department'               => $this->department,
			'reports_to'               => $this->reports_to,
			'office_location'          => $this->office_location,
			'desk_phone'               => $this->desk_phone,
			'extension'                => $this->extension,
			'start_date'               => $this->start_date,
			'employee_id'              => $this->employee_id,
			'internal_bio'             => $this->internal_bio,
			'skills'                   => $this->skills,
			'slack_handle'             => $this->slack_handle,
			'teams_email'              => $this->teams_email,
			'timezone'                 => $this->timezone,
			'availability_status'      => $this->availability_status,
			'working_hours'            => $this->working_hours,
			'out_of_office_message'    => $this->out_of_office_message,
			'is_visible'               => $this->is_visible,
			'notification_preferences' => $this->notification_preferences,
		);

		// Computed fields.
		$data['display_title'] = $this->get_display_title();

		// Add manager info if available.
		if ( $this->reports_to ) {
			$manager = $this->get_manager();
			if ( $manager ) {
				$data['manager'] = array(
					'user_id'      => $manager->user_id,
					'display_name' => $manager->profile->display_name ?? '',
					'avatar_url'   => $manager->profile->get_avatar_url( 96 ),
				);
			}
		}

		// Include base profile if requested.
		if ( $include_base && $this->profile ) {
			$data['profile'] = $this->profile->toArray();
		}

		return $data;
	}

	/**
	 * Decode array value from meta.
	 *
	 * @param mixed $value Meta value.
	 * @return array
	 */
	protected static function maybe_decode_array( $value ) {
		if ( is_array( $value ) ) {
			return $value;
		}
		if ( empty( $value ) ) {
			return array();
		}
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			return is_array( $decoded ) ? $decoded : array();
		}
		return array();
	}
}
