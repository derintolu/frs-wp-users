<?php
/**
 * Field Migration Script
 *
 * Consolidates redundant user meta fields to canonical frs_ prefixed keys.
 *
 * @package FRSUsers
 * @since 2.2.0
 */

namespace FRSUsers\Core;

/**
 * Class Migration
 *
 * Handles migration of legacy fields to frs_ prefixed fields.
 */
class Migration {

	/**
	 * Field mappings: legacy key => frs_ canonical key
	 *
	 * @var array
	 */
	private static $field_mappings = array(
		// Job Title
		'title'       => 'frs_job_title',
		'job_title'   => 'frs_job_title',
		'_job_title'  => 'frs_job_title',
		'psb_title'   => 'frs_job_title',

		// Phone
		'phone'         => 'frs_phone_number',
		'phone_number'  => 'frs_phone_number',
		'_phone_number' => 'frs_phone_number',
		'psb_phone'     => 'frs_phone_number',

		// NMLS
		'nmls'             => 'frs_nmls',
		'_nmls'            => 'frs_nmls',
		'nmls_id'          => 'frs_nmls',
		'psb_nmls_id'      => 'frs_nmls',
		'frs_nmls_number'  => 'frs_nmls', // Consolidate duplicate

		// License
		'license_number'     => 'frs_dre_license',
		'_license_number'    => 'frs_dre_license',
		'psb_license_number' => 'frs_dre_license',
		'frs_license_number' => 'frs_dre_license',

		// Location
		'city_state'  => 'frs_city_state',
		'_city_state' => 'frs_city_state',
		'location'    => 'frs_city_state',

		// Biography
		'bio'              => 'frs_biography',
		'biography'        => 'frs_biography',
		'_biography'       => 'frs_biography',
		'niche_bio_content'  => 'frs_niche_bio_content',
		'_niche_bio_content' => 'frs_niche_bio_content',

		// Arrive/Apply Link
		'arrive'          => 'frs_arrive',
		'_arrive'         => 'frs_arrive',
		'frs_arrive_link' => 'frs_arrive', // Consolidate duplicate

		// Social - LinkedIn
		'linkedin'      => 'frs_linkedin_url',
		'linkedin_url'  => 'frs_linkedin_url',
		'_linkedin_url' => 'frs_linkedin_url',

		// Social - Facebook
		'facebook'      => 'frs_facebook_url',
		'facebook_url'  => 'frs_facebook_url',
		'_facebook_url' => 'frs_facebook_url',

		// Social - Instagram
		'instagram'      => 'frs_instagram_url',
		'instagram_url'  => 'frs_instagram_url',
		'_instagram_url' => 'frs_instagram_url',

		// Social - Twitter
		'twitter'      => 'frs_twitter_url',
		'twitter_url'  => 'frs_twitter_url',
		'_twitter_url' => 'frs_twitter_url',

		// Social - YouTube
		'youtube'      => 'frs_youtube_url',
		'youtube_url'  => 'frs_youtube_url',
		'_youtube_url' => 'frs_youtube_url',

		// Social - TikTok
		'tiktok'      => 'frs_tiktok_url',
		'tiktok_url'  => 'frs_tiktok_url',
		'_tiktok_url' => 'frs_tiktok_url',

		// Specialties
		'specialties_lo'     => 'frs_specialties',
		'_specialties_lo'    => 'frs_specialties',
		'frs_specialties_lo' => 'frs_specialties',

		// Awards
		'awards'  => 'frs_awards',
		'_awards' => 'frs_awards',

		// Certifications
		'namb_certifications'  => 'frs_namb_certifications',
		'_namb_certifications' => 'frs_namb_certifications',

		// Date of Birth
		'date_of_birth'  => 'frs_date_of_birth',
		'_date_of_birth' => 'frs_date_of_birth',

		// Languages
		'languages'  => 'frs_languages',
		'_languages' => 'frs_languages',

		// Canva
		'canva_folder_link'  => 'frs_canva_folder_link',
		'_canva_folder_link' => 'frs_canva_folder_link',

		// Headshot (to ID if numeric)
		'headshot'  => 'frs_headshot_id',
		'_headshot' => 'frs_headshot_id',

		// Profile type
		'select_person_type' => 'frs_company_role',
	);

	/**
	 * WordPress role to default company role mapping
	 *
	 * Maps WP roles (capabilities) to default FRS company roles (directory categorization).
	 *
	 * @var array
	 */
	private static $role_to_type = array(
		'loan_officer'     => 'loan_originator',
		're_agent'         => 'broker_associate',
		'escrow_officer'   => 'escrow_officer',
		'property_manager' => 'property_manager',
		'dual_license'     => 'loan_originator', // Default to LO, can have multiple.
		'partner'          => 'partner',
		'leadership'       => 'leadership',
		'staff'            => 'staff',
		'assistant'        => 'staff',
	);

	/**
	 * Unused BuddyBoss/Jetrail fields to delete
	 *
	 * @var array
	 */
	private static $fields_to_delete = array(
		'dribbble',
		'github',
		'mastodon',
		'medium',
		'odnoklassniki',
		'pinterest',
		'vimeo',
		'vkontakte',
		'wordpress',
	);

	/**
	 * Run the full migration
	 *
	 * @param bool $dry_run If true, only report what would be done.
	 * @return array Migration results.
	 */
	public static function run( $dry_run = false ) {
		$results = array(
			'fields_migrated'    => 0,
			'roles_updated'      => 0,
			'types_set'          => 0,
			'fields_deleted'     => 0,
			'users_processed'    => 0,
			'errors'             => array(),
			'details'            => array(),
		);

		$users = get_users( array( 'fields' => 'ID' ) );
		$results['users_processed'] = count( $users );

		foreach ( $users as $user_id ) {
			// 1. Migrate legacy fields to frs_ prefixed
			$migrated = self::migrate_user_fields( $user_id, $dry_run );
			$results['fields_migrated'] += $migrated;

			// 2. Update WordPress role from loan_officer to loan_originator
			$role_updated = self::update_user_role( $user_id, $dry_run );
			if ( $role_updated ) {
				$results['roles_updated']++;
			}

			// 3. Set frs_company_role from WordPress role
			$type_set = self::set_person_type_from_role( $user_id, $dry_run );
			if ( $type_set ) {
				$results['types_set']++;
			}

			// 4. Delete unused fields
			$deleted = self::delete_unused_fields( $user_id, $dry_run );
			$results['fields_deleted'] += $deleted;
		}

		return $results;
	}

	/**
	 * Migrate legacy fields for a user
	 *
	 * @param int  $user_id User ID.
	 * @param bool $dry_run Dry run mode.
	 * @return int Number of fields migrated.
	 */
	private static function migrate_user_fields( $user_id, $dry_run ) {
		$migrated = 0;

		foreach ( self::$field_mappings as $legacy_key => $frs_key ) {
			$legacy_value = get_user_meta( $user_id, $legacy_key, true );

			// Skip if legacy field is empty
			if ( empty( $legacy_value ) ) {
				continue;
			}

			// Skip if it's an ACF field reference (starts with field_)
			if ( is_string( $legacy_value ) && strpos( $legacy_value, 'field_' ) === 0 ) {
				continue;
			}

			$current_frs_value = get_user_meta( $user_id, $frs_key, true );

			// Only migrate if frs_ field is empty
			if ( empty( $current_frs_value ) ) {
				if ( ! $dry_run ) {
					update_user_meta( $user_id, $frs_key, $legacy_value );
				}
				$migrated++;
			}
		}

		return $migrated;
	}

	/**
	 * Update WordPress role from loan_officer to loan_originator
	 *
	 * @param int  $user_id User ID.
	 * @param bool $dry_run Dry run mode.
	 * @return bool Whether role was updated.
	 */
	private static function update_user_role( $user_id, $dry_run ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$roles = $user->roles;

		// Check if user has loan_officer role
		if ( in_array( 'loan_officer', $roles, true ) ) {
			if ( ! $dry_run ) {
				$user->remove_role( 'loan_officer' );
				$user->add_role( 'loan_originator' );
			}
			return true;
		}

		return false;
	}

	/**
	 * Set frs_company_role based on WordPress role
	 *
	 * @param int  $user_id User ID.
	 * @param bool $dry_run Dry run mode.
	 * @return bool Whether type was set.
	 */
	private static function set_person_type_from_role( $user_id, $dry_run ) {
		// Check if already set
		$current_type = get_user_meta( $user_id, 'frs_company_role', true );
		if ( ! empty( $current_type ) ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$roles = $user->roles;
		$profile_type = null;

		// Find matching profile type from roles
		foreach ( self::$role_to_type as $role => $type ) {
			if ( in_array( $role, $roles, true ) ) {
				$profile_type = $type;
				break;
			}
		}

		if ( $profile_type ) {
			if ( ! $dry_run ) {
				update_user_meta( $user_id, 'frs_company_role', $profile_type );
			}
			return true;
		}

		return false;
	}

	/**
	 * Delete unused BuddyBoss/Jetrail fields
	 *
	 * @param int  $user_id User ID.
	 * @param bool $dry_run Dry run mode.
	 * @return int Number of fields deleted.
	 */
	private static function delete_unused_fields( $user_id, $dry_run ) {
		$deleted = 0;

		foreach ( self::$fields_to_delete as $field ) {
			$value = get_user_meta( $user_id, $field, true );
			if ( $value !== '' ) {
				if ( ! $dry_run ) {
					delete_user_meta( $user_id, $field );
				}
				$deleted++;
			}
		}

		return $deleted;
	}

	/**
	 * Clean up legacy fields after migration (optional second pass)
	 *
	 * @param bool $dry_run Dry run mode.
	 * @return int Number of fields cleaned.
	 */
	public static function cleanup_legacy_fields( $dry_run = false ) {
		global $wpdb;
		$cleaned = 0;

		$legacy_keys = array_keys( self::$field_mappings );

		foreach ( $legacy_keys as $key ) {
			// Skip keys that are the same as target (frs_ duplicates)
			if ( strpos( $key, 'frs_' ) === 0 ) {
				continue;
			}

			if ( ! $dry_run ) {
				$deleted = $wpdb->delete(
					$wpdb->usermeta,
					array( 'meta_key' => $key ),
					array( '%s' )
				);
				$cleaned += $deleted ? $deleted : 0;
			} else {
				$count = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT COUNT(*) FROM $wpdb->usermeta WHERE meta_key = %s",
						$key
					)
				);
				$cleaned += (int) $count;
			}
		}

		return $cleaned;
	}

	/**
	 * Register WordPress roles for FRS users.
	 *
	 * These are WordPress roles (capabilities), NOT company roles (directory categorization).
	 */
	public static function register_roles() {
		// All WordPress roles that need to be registered.
		$wp_roles = array(
			'loan_officer'     => __( 'Loan Officer', 'frs-users' ),
			're_agent'         => __( 'Real Estate Agent', 'frs-users' ),
			'escrow_officer'   => __( 'Escrow Officer', 'frs-users' ),
			'property_manager' => __( 'Property Manager', 'frs-users' ),
			'dual_license'     => __( 'Dual License', 'frs-users' ),
			'partner'          => __( 'Partner', 'frs-users' ),
			'staff'            => __( 'Staff', 'frs-users' ),
			'leadership'       => __( 'Leadership', 'frs-users' ),
			'assistant'        => __( 'Assistant', 'frs-users' ),
		);

		foreach ( $wp_roles as $role_slug => $role_name ) {
			if ( ! get_role( $role_slug ) ) {
				add_role( $role_slug, $role_name, array( 'read' => true ) );
			}
		}
	}
}
