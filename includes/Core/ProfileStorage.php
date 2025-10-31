<?php
/**
 * Profile Storage Override for Carbon Fields
 *
 * Intercepts Carbon Fields user meta saves and writes to profiles table instead.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;

/**
 * Class ProfileStorage
 *
 * Handles storage override for Carbon Fields to write to profiles table.
 *
 * @package FRSUsers\Core
 */
class ProfileStorage {

	/**
	 * Initialize storage hooks
	 *
	 * @return void
	 */
	public static function init() {
		// Hook into Carbon Fields save
		add_action( 'carbon_fields_user_meta_container_saved', array( __CLASS__, 'save_to_profile' ), 10, 1 );

		// Hook into Carbon Fields load
		add_filter( 'carbon_fields_should_save_field_value', array( __CLASS__, 'prevent_usermeta_save' ), 10, 3 );
		add_filter( 'carbon_get_user_meta', array( __CLASS__, 'load_from_profile' ), 10, 4 );
	}

	/**
	 * Save Carbon Fields data to profiles table
	 *
	 * @param int $user_id WordPress user ID.
	 * @return void
	 */
	public static function save_to_profile( $user_id ) {
		// Get profile for this user
		$profile = Profile::get_by_user_id( $user_id );

		// If no profile exists, create one
		if ( ! $profile ) {
			$user = get_user_by( 'id', $user_id );
			if ( ! $user ) {
				return;
			}

			$profile = new Profile();
			$profile->user_id = $user_id;
			$profile->email = $user->user_email;
		}

		// Get all field values from Carbon Fields
		$fields_to_save = array();

		// List of all our profile fields
		$field_names = array(
			// Contact
			'first_name', 'last_name', 'email', 'phone_number', 'mobile_number', 'office',
			// Professional
			'headshot_id', 'job_title', 'biography', 'date_of_birth', 'select_person_type',
			'nmls', 'nmls_number', 'license_number', 'dre_license',
			'specialties_lo', 'specialties', 'languages', 'awards',
			'nar_designations', 'namb_certifications', 'brand', 'status',
			// Location
			'city_state', 'region',
			// Social
			'facebook_url', 'instagram_url', 'linkedin_url',
			'twitter_url', 'youtube_url', 'tiktok_url',
			// Tools
			'arrive', 'canva_folder_link', 'niche_bio_content', 'personal_branding_images',
		);

		foreach ( $field_names as $field_name ) {
			$value = carbon_get_user_meta( $user_id, $field_name );

			// Only save if value exists
			if ( $value !== null && $value !== '' ) {
				$fields_to_save[ $field_name ] = $value;
			}
		}

		// Save to profiles table
		if ( ! empty( $fields_to_save ) ) {
			$profile->save( $fields_to_save );
		}
	}

	/**
	 * Prevent Carbon Fields from saving to user meta
	 *
	 * @param bool   $save Whether to save.
	 * @param mixed  $value Field value.
	 * @param object $field Field object.
	 * @return bool
	 */
	public static function prevent_usermeta_save( $save, $value, $field ) {
		// Get field name
		$field_name = $field->get_base_name();

		// List of fields we handle
		$profile_fields = array(
			'first_name', 'last_name', 'email', 'phone_number', 'mobile_number', 'office',
			'headshot_id', 'job_title', 'biography', 'date_of_birth', 'select_person_type',
			'nmls', 'nmls_number', 'license_number', 'dre_license',
			'specialties_lo', 'specialties', 'languages', 'awards',
			'nar_designations', 'namb_certifications', 'brand', 'status',
			'city_state', 'region',
			'facebook_url', 'instagram_url', 'linkedin_url',
			'twitter_url', 'youtube_url', 'tiktok_url',
			'arrive', 'canva_folder_link', 'niche_bio_content', 'personal_branding_images',
		);

		// If this is one of our profile fields, prevent usermeta save
		if ( in_array( $field_name, $profile_fields, true ) ) {
			return false;
		}

		return $save;
	}

	/**
	 * Load field values from profiles table instead of user meta
	 *
	 * @param mixed  $value Current value.
	 * @param int    $object_id User ID.
	 * @param string $field_name Field name.
	 * @param string $field_type Field type.
	 * @return mixed
	 */
	public static function load_from_profile( $value, $object_id, $field_name, $field_type ) {
		// Get profile for this user
		$profile = Profile::get_by_user_id( $object_id );

		if ( ! $profile ) {
			return $value;
		}

		// Get value from profile
		$profile_data = $profile->to_array();

		if ( isset( $profile_data[ $field_name ] ) ) {
			return $profile_data[ $field_name ];
		}

		return $value;
	}

	/**
	 * Sync profile data from Carbon Fields to Profile model
	 * (Alternative method for manual syncing)
	 *
	 * @param int $user_id WordPress user ID.
	 * @return bool
	 */
	public static function sync_from_carbon_fields( $user_id ) {
		self::save_to_profile( $user_id );
		return true;
	}
}
