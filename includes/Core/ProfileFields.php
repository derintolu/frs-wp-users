<?php
/**
 * Profile Fields Definition using Carbon Fields
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use Carbon_Fields\Container;
use Carbon_Fields\Field;

/**
 * Class ProfileFields
 *
 * Defines all profile fields using Carbon Fields.
 * Fields are attached to user meta but storage is overridden to profiles table.
 *
 * @package FRSUsers\Core
 */
class ProfileFields {

	/**
	 * Initialize profile fields
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'carbon_fields_register_fields', array( __CLASS__, 'register_fields' ) );
	}

	/**
	 * Register all profile fields
	 *
	 * @return void
	 */
	public static function register_fields() {
		Container::make( 'user_meta', __( 'Profile Information', 'frs-users' ) )
			->add_tab( __( 'Contact', 'frs-users' ), self::get_contact_fields() )
			->add_tab( __( 'Professional', 'frs-users' ), self::get_professional_fields() )
			->add_tab( __( 'Location', 'frs-users' ), self::get_location_fields() )
			->add_tab( __( 'Social Media', 'frs-users' ), self::get_social_fields() )
			->add_tab( __( 'Tools & Platforms', 'frs-users' ), self::get_tools_fields() );
	}

	/**
	 * Get contact information fields
	 *
	 * @return array
	 */
	private static function get_contact_fields() {
		return array(
			Field::make( 'text', 'first_name', __( 'First Name', 'frs-users' ) )
				->set_required( true ),

			Field::make( 'text', 'last_name', __( 'Last Name', 'frs-users' ) )
				->set_required( true ),

			Field::make( 'text', 'email', __( 'Email', 'frs-users' ) )
				->set_required( true )
				->set_attribute( 'type', 'email' )
				->set_help_text( __( 'Primary business email address', 'frs-users' ) ),

			Field::make( 'text', 'phone_number', __( 'Phone Number', 'frs-users' ) )
				->set_attribute( 'type', 'tel' )
				->set_help_text( __( 'Primary phone number', 'frs-users' ) ),

			Field::make( 'text', 'mobile_number', __( 'Mobile Number', 'frs-users' ) )
				->set_attribute( 'type', 'tel' )
				->set_help_text( __( 'Mobile phone number', 'frs-users' ) ),

			Field::make( 'text', 'office', __( 'Office', 'frs-users' ) )
				->set_help_text( __( 'Office location or name', 'frs-users' ) ),
		);
	}

	/**
	 * Get professional fields
	 *
	 * @return array
	 */
	private static function get_professional_fields() {
		return array(
			Field::make( 'image', 'headshot_id', __( 'Headshot', 'frs-users' ) )
				->set_value_type( 'id' )
				->set_help_text( __( 'Profile photo/headshot', 'frs-users' ) ),

			Field::make( 'text', 'job_title', __( 'Job Title', 'frs-users' ) )
				->set_help_text( __( 'Professional title or position', 'frs-users' ) ),

			Field::make( 'textarea', 'biography', __( 'Biography', 'frs-users' ) )
				->set_rows( 5 )
				->set_help_text( __( 'Professional biography', 'frs-users' ) ),

			Field::make( 'date', 'date_of_birth', __( 'Date of Birth', 'frs-users' ) )
				->set_storage_format( 'Y-m-d' ),

			Field::make( 'select', 'select_person_type', __( 'Person Type', 'frs-users' ) )
				->add_options( array(
					'loan_officer' => __( 'Loan Officer', 'frs-users' ),
					'agent'        => __( 'Real Estate Agent', 'frs-users' ),
				) ),

			Field::make( 'text', 'nmls', __( 'NMLS Number', 'frs-users' ) )
				->set_help_text( __( 'NMLS license number', 'frs-users' ) ),

			Field::make( 'text', 'nmls_number', __( 'NMLS Number (Alt)', 'frs-users' ) )
				->set_help_text( __( 'Alternative NMLS field', 'frs-users' ) ),

			Field::make( 'text', 'license_number', __( 'License Number', 'frs-users' ) )
				->set_help_text( __( 'Professional license number', 'frs-users' ) ),

			Field::make( 'text', 'dre_license', __( 'DRE License', 'frs-users' ) )
				->set_help_text( __( 'California DRE license number', 'frs-users' ) ),

			Field::make( 'multiselect', 'specialties_lo', __( 'Loan Officer Specialties', 'frs-users' ) )
				->add_options( array(
					'conventional' => __( 'Conventional', 'frs-users' ),
					'fha'          => __( 'FHA', 'frs-users' ),
					'va'           => __( 'VA', 'frs-users' ),
					'usda'         => __( 'USDA', 'frs-users' ),
					'jumbo'        => __( 'Jumbo', 'frs-users' ),
					'renovation'   => __( 'Renovation Loans', 'frs-users' ),
					'first_time'   => __( 'First Time Home Buyers', 'frs-users' ),
				) )
				->set_help_text( __( 'Select all that apply', 'frs-users' ) ),

			Field::make( 'multiselect', 'specialties', __( 'Real Estate Specialties', 'frs-users' ) )
				->add_options( array(
					'buyers_agent'  => __( 'Buyer\'s Agent', 'frs-users' ),
					'listing_agent' => __( 'Listing Agent', 'frs-users' ),
					'relocation'    => __( 'Relocation', 'frs-users' ),
					'luxury'        => __( 'Luxury Homes', 'frs-users' ),
					'investment'    => __( 'Investment Properties', 'frs-users' ),
					'commercial'    => __( 'Commercial', 'frs-users' ),
				) )
				->set_help_text( __( 'Select all that apply', 'frs-users' ) ),

			Field::make( 'multiselect', 'languages', __( 'Languages', 'frs-users' ) )
				->add_options( array(
					'english'  => __( 'English', 'frs-users' ),
					'spanish'  => __( 'Spanish', 'frs-users' ),
					'chinese'  => __( 'Chinese', 'frs-users' ),
					'tagalog'  => __( 'Tagalog', 'frs-users' ),
					'vietnamese' => __( 'Vietnamese', 'frs-users' ),
					'korean'   => __( 'Korean', 'frs-users' ),
					'french'   => __( 'French', 'frs-users' ),
				) )
				->set_help_text( __( 'Languages spoken', 'frs-users' ) ),

			Field::make( 'complex', 'awards', __( 'Awards & Recognition', 'frs-users' ) )
				->add_fields( array(
					Field::make( 'text', 'title', __( 'Award Title', 'frs-users' ) ),
					Field::make( 'text', 'year', __( 'Year', 'frs-users' ) ),
					Field::make( 'text', 'issuer', __( 'Issued By', 'frs-users' ) ),
				) )
				->set_help_text( __( 'Professional awards and recognition', 'frs-users' ) ),

			Field::make( 'multiselect', 'nar_designations', __( 'NAR Designations', 'frs-users' ) )
				->add_options( array(
					'abr'  => __( 'ABR - Accredited Buyer\'s Representative', 'frs-users' ),
					'gri'  => __( 'GRI - Graduate, REALTOR® Institute', 'frs-users' ),
					'crs'  => __( 'CRS - Certified Residential Specialist', 'frs-users' ),
					'sres' => __( 'SRES - Seniors Real Estate Specialist', 'frs-users' ),
				) )
				->set_help_text( __( 'National Association of Realtors designations', 'frs-users' ) ),

			Field::make( 'multiselect', 'namb_certifications', __( 'NAMB Certifications', 'frs-users' ) )
				->add_options( array(
					'cmps' => __( 'CMPS - Certified Mortgage Planning Specialist', 'frs-users' ),
					'crms' => __( 'CRMS - Certified Residential Mortgage Specialist', 'frs-users' ),
				) )
				->set_help_text( __( 'National Association of Mortgage Brokers certifications', 'frs-users' ) ),

			Field::make( 'text', 'brand', __( 'Brand', 'frs-users' ) )
				->set_help_text( __( 'Company or personal brand', 'frs-users' ) ),

			Field::make( 'select', 'status', __( 'Status', 'frs-users' ) )
				->add_options( array(
					'active'   => __( 'Active', 'frs-users' ),
					'inactive' => __( 'Inactive', 'frs-users' ),
				) )
				->set_default_value( 'active' ),
		);
	}

	/**
	 * Get location fields
	 *
	 * @return array
	 */
	private static function get_location_fields() {
		return array(
			Field::make( 'text', 'city_state', __( 'City, State', 'frs-users' ) )
				->set_help_text( __( 'Primary city and state', 'frs-users' ) ),

			Field::make( 'text', 'region', __( 'Region', 'frs-users' ) )
				->set_help_text( __( 'Service region or area', 'frs-users' ) ),
		);
	}

	/**
	 * Get social media fields
	 *
	 * @return array
	 */
	private static function get_social_fields() {
		return array(
			Field::make( 'text', 'facebook_url', __( 'Facebook URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'Facebook profile or page URL', 'frs-users' ) ),

			Field::make( 'text', 'instagram_url', __( 'Instagram URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'Instagram profile URL', 'frs-users' ) ),

			Field::make( 'text', 'linkedin_url', __( 'LinkedIn URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'LinkedIn profile URL', 'frs-users' ) ),

			Field::make( 'text', 'twitter_url', __( 'Twitter URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'Twitter/X profile URL', 'frs-users' ) ),

			Field::make( 'text', 'youtube_url', __( 'YouTube URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'YouTube channel URL', 'frs-users' ) ),

			Field::make( 'text', 'tiktok_url', __( 'TikTok URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'TikTok profile URL', 'frs-users' ) ),
		);
	}

	/**
	 * Get tools and platforms fields
	 *
	 * @return array
	 */
	private static function get_tools_fields() {
		return array(
			Field::make( 'text', 'arrive', __( 'ARRIVE URL', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'ARRIVE platform registration URL', 'frs-users' ) ),

			Field::make( 'text', 'canva_folder_link', __( 'Canva Folder', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'Link to Canva marketing materials', 'frs-users' ) ),

			Field::make( 'rich_text', 'niche_bio_content', __( 'Niche Bio Content', 'frs-users' ) )
				->set_help_text( __( 'Specialized bio content for niche marketing', 'frs-users' ) ),

			Field::make( 'media_gallery', 'personal_branding_images', __( 'Personal Branding Images', 'frs-users' ) )
				->set_type( 'image' )
				->set_help_text( __( 'Collection of professional photos and branding images', 'frs-users' ) ),
		);
	}
}
