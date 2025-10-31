<?php
/**
 * Profile Model
 *
 * @package FRSUsers
 * @subpackage Models
 * @since 1.0.0
 */

namespace FRSUsers\Models;

/**
 * Class Profile
 *
 * Represents a user profile in the system.
 * Profiles can exist independently (guest) or be linked to WordPress users.
 *
 * @package FRSUsers\Models
 */
class Profile {

	/**
	 * Profile ID
	 *
	 * @var int
	 */
	public $id;

	/**
	 * Linked WordPress user ID (NULL for guest profiles)
	 *
	 * @var int|null
	 */
	public $user_id;

	/**
	 * FRS Agent ID from API sync
	 *
	 * @var string|null
	 */
	public $frs_agent_id;

	/**
	 * Profile data
	 *
	 * @var array
	 */
	private $data = array();

	/**
	 * Profile types
	 *
	 * @var array
	 */
	private $profile_types = array();

	/**
	 * Table name
	 *
	 * @var string
	 */
	private static $table = 'frs_profiles';

	/**
	 * Profile types table name
	 *
	 * @var string
	 */
	private static $types_table = 'frs_profile_types';

	/**
	 * Constructor
	 *
	 * @param array|object $data Profile data.
	 */
	public function __construct( $data = array() ) {
		if ( is_object( $data ) ) {
			$data = (array) $data;
		}

		foreach ( $data as $key => $value ) {
			$this->$key = $value;
			$this->data[ $key ] = $value;
		}
	}

	/**
	 * Get profile by ID
	 *
	 * @param int $id Profile ID.
	 * @return Profile|null
	 */
	public static function find( $id ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;
		$row   = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id )
		);

		if ( ! $row ) {
			return null;
		}

		$profile = new self( $row );
		$profile->load_types();

		return $profile;
	}

	/**
	 * Get profile by user ID
	 *
	 * @param int $user_id WordPress user ID.
	 * @return Profile|null
	 */
	public static function get_by_user_id( $user_id ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;
		$row   = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE user_id = %d", $user_id )
		);

		if ( ! $row ) {
			return null;
		}

		$profile = new self( $row );
		$profile->load_types();

		return $profile;
	}

	/**
	 * Get profile by email
	 *
	 * @param string $email Email address.
	 * @return Profile|null
	 */
	public static function get_by_email( $email ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;
		$row   = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE email = %s", $email )
		);

		if ( ! $row ) {
			return null;
		}

		$profile = new self( $row );
		$profile->load_types();

		return $profile;
	}

	/**
	 * Get profile by FRS agent ID
	 *
	 * @param string $frs_agent_id FRS Agent ID.
	 * @return Profile|null
	 */
	public static function get_by_frs_agent_id( $frs_agent_id ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;
		$row   = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE frs_agent_id = %s", $frs_agent_id )
		);

		if ( ! $row ) {
			return null;
		}

		$profile = new self( $row );
		$profile->load_types();

		return $profile;
	}

	/**
	 * Get all profiles with a specific type
	 *
	 * @param string $type Profile type (loan_officer, realtor_partner, etc.).
	 * @param array  $args Query arguments.
	 * @return array Array of Profile objects.
	 */
	public static function get_by_type( $type, $args = array() ) {
		global $wpdb;

		$table       = $wpdb->prefix . self::$table;
		$types_table = $wpdb->prefix . self::$types_table;

		$defaults = array(
			'limit'   => 50,
			'offset'  => 0,
			'orderby' => 'created_at',
			'order'   => 'DESC',
		);

		$args = wp_parse_args( $args, $defaults );

		$query = $wpdb->prepare(
			"SELECT p.* FROM {$table} p
			INNER JOIN {$types_table} pt ON p.id = pt.profile_id
			WHERE pt.profile_type = %s
			AND p.is_active = 1
			ORDER BY {$args['orderby']} {$args['order']}
			LIMIT %d OFFSET %d",
			$type,
			$args['limit'],
			$args['offset']
		);

		$results = $wpdb->get_results( $query );

		$profiles = array();
		foreach ( $results as $row ) {
			$profile = new self( $row );
			$profile->load_types();
			$profiles[] = $profile;
		}

		return $profiles;
	}

	/**
	 * Get guest profiles (no linked user)
	 *
	 * @param array $args Query arguments.
	 * @return array Array of Profile objects.
	 */
	public static function get_guests( $args = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;

		$defaults = array(
			'limit'   => 50,
			'offset'  => 0,
			'orderby' => 'created_at',
			'order'   => 'DESC',
		);

		$args = wp_parse_args( $args, $defaults );

		$query = $wpdb->prepare(
			"SELECT * FROM {$table}
			WHERE user_id IS NULL
			AND is_active = 1
			ORDER BY {$args['orderby']} {$args['order']}
			LIMIT %d OFFSET %d",
			$args['limit'],
			$args['offset']
		);

		$results = $wpdb->get_results( $query );

		$profiles = array();
		foreach ( $results as $row ) {
			$profile = new self( $row );
			$profile->load_types();
			$profiles[] = $profile;
		}

		return $profiles;
	}

	/**
	 * Get all profiles
	 *
	 * @param array $args Query arguments.
	 * @return array Array of Profile objects.
	 */
	public static function get_all( $args = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;

		$defaults = array(
			'limit'   => 50,
			'offset'  => 0,
			'orderby' => 'last_name',
			'order'   => 'ASC',
		);

		$args = wp_parse_args( $args, $defaults );

		$query = $wpdb->prepare(
			"SELECT * FROM {$table}
			WHERE is_active = 1
			ORDER BY {$args['orderby']} {$args['order']}
			LIMIT %d OFFSET %d",
			$args['limit'],
			$args['offset']
		);

		$results = $wpdb->get_results( $query );

		$profiles = array();
		foreach ( $results as $row ) {
			$profile = new self( $row );
			$profile->load_types();
			$profiles[] = $profile;
		}

		return $profiles;
	}

	/**
	 * Get total count of profiles
	 *
	 * @return int Total number of active profiles.
	 */
	public static function count() {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;

		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE is_active = 1" );
	}

	/**
	 * Save profile
	 *
	 * @param array $data Profile data to save.
	 * @return bool|int Profile ID on success, false on failure.
	 */
	public function save( $data = array() ) {
		global $wpdb;

		$table = $wpdb->prefix . self::$table;

		// Merge with existing data
		$save_data = array_merge( $this->data, $data );

		// Handle JSON fields
		$json_fields = array( 'specialties_lo', 'specialties', 'languages', 'awards', 'nar_designations', 'namb_certifications', 'personal_branding_images' );
		foreach ( $json_fields as $field ) {
			if ( isset( $save_data[ $field ] ) && is_array( $save_data[ $field ] ) ) {
				$save_data[ $field ] = wp_json_encode( $save_data[ $field ] );
			}
		}

		// Set updated_at
		$save_data['updated_at'] = current_time( 'mysql' );

		if ( $this->id ) {
			// Update existing
			$result = $wpdb->update(
				$table,
				$save_data,
				array( 'id' => $this->id ),
				null,
				array( '%d' )
			);

			return $result !== false;
		} else {
			// Insert new
			$save_data['created_at'] = current_time( 'mysql' );

			$result = $wpdb->insert( $table, $save_data );

			if ( $result ) {
				$this->id = $wpdb->insert_id;
				return $this->id;
			}

			return false;
		}
	}

	/**
	 * Delete profile
	 *
	 * @return bool
	 */
	public function delete() {
		global $wpdb;

		if ( ! $this->id ) {
			return false;
		}

		$table = $wpdb->prefix . self::$table;

		// Delete profile types
		$this->remove_all_types();

		// Delete profile
		$result = $wpdb->delete(
			$table,
			array( 'id' => $this->id ),
			array( '%d' )
		);

		return $result !== false;
	}

	/**
	 * Load profile types
	 *
	 * @return void
	 */
	private function load_types() {
		global $wpdb;

		if ( ! $this->id ) {
			return;
		}

		$types_table = $wpdb->prefix . self::$types_table;

		$types = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT profile_type FROM {$types_table} WHERE profile_id = %d",
				$this->id
			)
		);

		$this->profile_types = $types;
	}

	/**
	 * Get profile types
	 *
	 * @return array
	 */
	public function get_types() {
		if ( empty( $this->profile_types ) ) {
			$this->load_types();
		}

		return $this->profile_types;
	}

	/**
	 * Add profile type
	 *
	 * @param string $type Profile type.
	 * @return bool
	 */
	public function add_type( $type ) {
		global $wpdb;

		if ( ! $this->id ) {
			return false;
		}

		$types_table = $wpdb->prefix . self::$types_table;

		$result = $wpdb->insert(
			$types_table,
			array(
				'profile_id'   => $this->id,
				'profile_type' => $type,
			),
			array( '%d', '%s' )
		);

		if ( $result ) {
			$this->profile_types[] = $type;
			return true;
		}

		return false;
	}

	/**
	 * Remove profile type
	 *
	 * @param string $type Profile type.
	 * @return bool
	 */
	public function remove_type( $type ) {
		global $wpdb;

		if ( ! $this->id ) {
			return false;
		}

		$types_table = $wpdb->prefix . self::$types_table;

		$result = $wpdb->delete(
			$types_table,
			array(
				'profile_id'   => $this->id,
				'profile_type' => $type,
			),
			array( '%d', '%s' )
		);

		if ( $result !== false ) {
			$this->profile_types = array_diff( $this->profile_types, array( $type ) );
			return true;
		}

		return false;
	}

	/**
	 * Remove all profile types
	 *
	 * @return bool
	 */
	public function remove_all_types() {
		global $wpdb;

		if ( ! $this->id ) {
			return false;
		}

		$types_table = $wpdb->prefix . self::$types_table;

		$result = $wpdb->delete(
			$types_table,
			array( 'profile_id' => $this->id ),
			array( '%d' )
		);

		if ( $result !== false ) {
			$this->profile_types = array();
			return true;
		}

		return false;
	}

	/**
	 * Set profile types (replaces all existing)
	 *
	 * @param array $types Array of profile types.
	 * @return bool
	 */
	public function set_types( $types ) {
		$this->remove_all_types();

		foreach ( $types as $type ) {
			$this->add_type( $type );
		}

		return true;
	}

	/**
	 * Check if profile has a specific type
	 *
	 * @param string $type Profile type.
	 * @return bool
	 */
	public function has_type( $type ) {
		return in_array( $type, $this->get_types(), true );
	}

	/**
	 * Check if profile is a guest (no linked user)
	 *
	 * @return bool
	 */
	public function is_guest() {
		return empty( $this->user_id );
	}

	/**
	 * Link profile to WordPress user
	 *
	 * @param int $user_id WordPress user ID.
	 * @return bool
	 */
	public function link_user( $user_id ) {
		$this->user_id = $user_id;
		return $this->save( array( 'user_id' => $user_id ) );
	}

	/**
	 * Unlink profile from WordPress user
	 *
	 * @return bool
	 */
	public function unlink_user() {
		$this->user_id = null;
		return $this->save( array( 'user_id' => null ) );
	}

	/**
	 * Get profile data as array
	 *
	 * @return array
	 */
	public function to_array() {
		$data = $this->data;
		$data['profile_types'] = $this->get_types();
		$data['is_guest'] = $this->is_guest();

		// Parse JSON fields
		$json_fields = array( 'specialties_lo', 'specialties', 'languages', 'awards', 'nar_designations', 'namb_certifications', 'personal_branding_images' );
		foreach ( $json_fields as $field ) {
			if ( isset( $data[ $field ] ) && is_string( $data[ $field ] ) ) {
				$data[ $field ] = json_decode( $data[ $field ], true );
			}
		}

		return $data;
	}

	/**
	 * Magic getter
	 *
	 * @param string $name Property name.
	 * @return mixed
	 */
	public function __get( $name ) {
		return $this->data[ $name ] ?? null;
	}

	/**
	 * Magic setter
	 *
	 * @param string $name Property name.
	 * @param mixed  $value Property value.
	 * @return void
	 */
	public function __set( $name, $value ) {
		$this->data[ $name ] = $value;
	}

	/**
	 * Magic isset
	 *
	 * @param string $name Property name.
	 * @return bool
	 */
	public function __isset( $name ) {
		return isset( $this->data[ $name ] );
	}
}
