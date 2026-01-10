<?php
/**
 * Migrate Person CPT to Profiles Table
 *
 * Migrates all Person custom post type entries to the new profiles table.
 *
 * @package FRSUsers
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace FRSUsers\Database\Migrations;

use FRSUsers\Interfaces\Migration;
use FRSUsers\Models\Profile;

/**
 * Class MigratePersonCPT
 *
 * Migrates Person CPT data to profiles table.
 *
 * @package FRSUsers\Database\Migrations
 */
class MigratePersonCPT implements Migration {

	/**
	 * Run the migration
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;

		// Get all Person posts
		$args = array(
			'post_type'      => 'person',
			'posts_per_page' => -1,
			'post_status'    => array( 'publish', 'draft', 'pending' ),
		);

		$persons = get_posts( $args );

		if ( empty( $persons ) ) {
			error_log( 'FRS Users: No Person posts found to migrate' );
			return;
		}

		$migrated = 0;
		$skipped  = 0;
		$errors   = 0;

		foreach ( $persons as $person ) {
			try {
				// Get all meta for this person
				$meta = get_post_meta( $person->ID );

				// Map ACF field to our database field
				$field_map = array(
					// Contact
					'primary_business_email' => 'email',
					'phone_number'           => 'phone_number',
					'mobile_number'          => 'mobile_number',
					'office'                 => 'office',

					// Professional
					'headshot'               => 'headshot_id',
					'job_title'              => 'job_title',
					'biography'              => 'biography',
					'date_of_birth'          => 'date_of_birth',
					'nmls'                   => 'nmls',
					'nmls_number'            => 'nmls_number',
					'license_number'         => 'license_number',
					'dre_license'            => 'dre_license',
					'specialties_lo'         => 'specialties_lo',
					'specialties'            => 'specialties',
					'languages'              => 'languages',
					'awards'                 => 'awards',
					'nar_designations'       => 'nar_designations',
					'namb_certifications'    => 'namb_certifications',
					'brand'                  => 'brand',
					'status'                 => 'status',

					// Location
					'city_state'             => 'city_state',
					'region'                 => 'region',

					// Social
					'facebook_url'           => 'facebook_url',
					'instagram_url'          => 'instagram_url',
					'linkedin_url'           => 'linkedin_url',
					'twitter_url'            => 'twitter_url',
					'youtube_url'            => 'youtube_url',
					'tiktok_url'             => 'tiktok_url',

					// Tools
					'arrive'                 => 'arrive',
					'canva_folder_link'      => 'canva_folder_link',
					'niche_bio_content'      => 'niche_bio_content',
					'personal_branding_images' => 'personal_branding_images',
				);

				// Prepare profile data
				$profile_data = array(
					'first_name' => $person->post_title ? explode( ' ', $person->post_title )[0] : '',
					'last_name'  => $person->post_title && count( explode( ' ', $person->post_title ) ) > 1 ? implode( ' ', array_slice( explode( ' ', $person->post_title ), 1 ) ) : '',
				);

				// Map meta fields
				foreach ( $field_map as $acf_field => $db_field ) {
					if ( isset( $meta[ $acf_field ] ) && ! empty( $meta[ $acf_field ][0] ) ) {
						$value = $meta[ $acf_field ][0];

						// Handle serialized data
						if ( is_serialized( $value ) ) {
							$value = maybe_unserialize( $value );
						}

						$profile_data[ $db_field ] = $value;
					}
				}

				// Make sure email exists
				if ( empty( $profile_data['email'] ) ) {
					error_log( sprintf( 'FRS Users: Skipping Person ID %d - No email found', $person->ID ) );
					$skipped++;
					continue;
				}

				// Check if profile already exists
				$existing = Profile::get_by_email( $profile_data['email'] );
				if ( $existing ) {
					error_log( sprintf( 'FRS Users: Skipping Person ID %d - Profile already exists for %s', $person->ID, $profile_data['email'] ) );
					$skipped++;
					continue;
				}

				// Check if Person has associated user
				$user_id = null;
				if ( isset( $meta['_user_id'] ) && ! empty( $meta['_user_id'][0] ) ) {
					$user_id = absint( $meta['_user_id'][0] );
				} else {
					// Try to find user by email
					$user = get_user_by( 'email', $profile_data['email'] );
					if ( $user ) {
						$user_id = $user->ID;
					}
				}

				if ( $user_id ) {
					$profile_data['user_id'] = $user_id;
				}

				// Get profile types from select_person_type
				$profile_types = array();
				if ( isset( $meta['select_person_type'] ) && ! empty( $meta['select_person_type'][0] ) ) {
					$types = maybe_unserialize( $meta['select_person_type'][0] );
					if ( is_array( $types ) ) {
						$profile_types = $types;
					} elseif ( is_string( $types ) ) {
						$profile_types = array( $types );
					}
				}

				// Create profile
				$profile = new Profile();
				$profile_id = $profile->save( $profile_data );

				if ( ! $profile_id ) {
					error_log( sprintf( 'FRS Users: Failed to create profile for Person ID %d', $person->ID ) );
					$errors++;
					continue;
				}

				// Set profile types
				if ( ! empty( $profile_types ) ) {
					$profile = Profile::find( $profile_id );
					$profile->set_types( $profile_types );
				}

				// Store reference to original Person post
				update_post_meta( $person->ID, '_migrated_to_profile_id', $profile_id );

				$migrated++;

			} catch ( \Exception $e ) {
				error_log( sprintf( 'FRS Users: Error migrating Person ID %d - %s', $person->ID, $e->getMessage() ) );
				$errors++;
			}
		}

		error_log( sprintf(
			'FRS Users Migration: %d profiles migrated, %d skipped, %d errors',
			$migrated,
			$skipped,
			$errors
		) );

		// Set migration complete flag
		update_option( 'frs_users_person_cpt_migrated', true );
		update_option( 'frs_users_migration_stats', array(
			'migrated' => $migrated,
			'skipped'  => $skipped,
			'errors'   => $errors,
			'date'     => current_time( 'mysql' ),
		) );
	}

	/**
	 * Reverse the migration
	 *
	 * @return void
	 */
	public static function down() {
		// This is a data migration, reversing it would delete all profiles
		// We don't automatically delete profiles for safety
		error_log( 'FRS Users: Migration rollback not implemented for safety. Profiles must be manually deleted if needed.' );
	}
}
