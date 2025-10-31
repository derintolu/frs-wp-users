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
		// User meta container (for WordPress users)
		Container::make( 'user_meta', __( 'Profile Information', 'frs-users' ) )
			->add_tab( __( 'Contact', 'frs-users' ), self::get_contact_fields() )
			->add_tab( __( 'Professional', 'frs-users' ), self::get_professional_fields() )
			->add_tab( __( 'Location', 'frs-users' ), self::get_location_fields() )
			->add_tab( __( 'Social Media', 'frs-users' ), self::get_social_fields() )
			->add_tab( __( 'Tools & Platforms', 'frs-users' ), self::get_tools_fields() );
	}

	/**
	 * Get all fields for custom admin page rendering
	 *
	 * @return array
	 */
	public static function get_all_fields() {
		return array_merge(
			self::get_contact_fields(),
			self::get_professional_fields(),
			self::get_location_fields(),
			self::get_social_fields(),
			self::get_tools_fields()
		);
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

			Field::make( 'rich_text', 'biography', __( 'Biography', 'frs-users' ) )
				->set_help_text( __( 'Professional biography', 'frs-users' ) ),

			Field::make( 'date', 'date_of_birth', __( 'Date of Birth', 'frs-users' ) )
				->set_storage_format( 'F j' ),

			Field::make( 'text', 'license_number', __( 'DRE License Number', 'frs-users' ) )
				->set_help_text( __( 'California DRE license number', 'frs-users' ) ),

			Field::make( 'text', 'nmls', __( 'NMLS #', 'frs-users' ) )
				->set_help_text( __( 'NMLS license number', 'frs-users' ) ),

			Field::make( 'multiselect', 'specialties', __( 'Specialties - Real Estate Agent', 'frs-users' ) )
				->add_options( array(
					'Residential'           => __( 'Residential', 'frs-users' ),
					'Commercial'            => __( 'Commercial', 'frs-users' ),
					'Luxury'                => __( 'Luxury', 'frs-users' ),
					'Investment'            => __( 'Investment', 'frs-users' ),
					'New Construction'      => __( 'New Construction', 'frs-users' ),
					'Condos/Townhouses'     => __( 'Condos/Townhouses', 'frs-users' ),
					'Multi-Family'          => __( 'Multi-Family', 'frs-users' ),
					'Land Sales'            => __( 'Land Sales', 'frs-users' ),
					'Vacation Homes'        => __( 'Vacation Homes', 'frs-users' ),
					'First-Time Buyers'     => __( 'First-Time Buyers', 'frs-users' ),
					'Military/Veterans'     => __( 'Military/Veterans', 'frs-users' ),
					'Seniors'               => __( 'Seniors', 'frs-users' ),
					'International'         => __( 'International', 'frs-users' ),
					'Relocation'            => __( 'Relocation', 'frs-users' ),
					'Foreclosures'          => __( 'Foreclosures', 'frs-users' ),
					'Green/Eco'             => __( 'Green/Eco', 'frs-users' ),
					'Historic Properties'   => __( 'Historic Properties', 'frs-users' ),
					'Waterfront'            => __( 'Waterfront', 'frs-users' ),
					'Rural'                 => __( 'Rural', 'frs-users' ),
					'Urban'                 => __( 'Urban', 'frs-users' ),
					'Distressed Sales'      => __( 'Distressed Sales', 'frs-users' ),
					'Fix-and-Flip'          => __( 'Fix-and-Flip', 'frs-users' ),
				) )
				->set_help_text( __( 'Select all that apply', 'frs-users' ) ),

			Field::make( 'multiselect', 'specialties_lo', __( 'Specialties - Loan Officer', 'frs-users' ) )
				->add_options( array(
					'Residential Mortgages' => __( 'Residential Mortgages', 'frs-users' ),
					'Consumer Loans'        => __( 'Consumer Loans', 'frs-users' ),
					'VA Loans'              => __( 'VA Loans', 'frs-users' ),
					'FHA Loans'             => __( 'FHA Loans', 'frs-users' ),
					'Jumbo Loans'           => __( 'Jumbo Loans', 'frs-users' ),
					'Construction Loans'    => __( 'Construction Loans', 'frs-users' ),
					'Investment Property'   => __( 'Investment Property', 'frs-users' ),
					'Reverse Mortgages'     => __( 'Reverse Mortgages', 'frs-users' ),
					'USDA Rural Loans'      => __( 'USDA Rural Loans', 'frs-users' ),
					'Bridge Loans'          => __( 'Bridge Loans', 'frs-users' ),
				) )
				->set_help_text( __( 'Select all that apply', 'frs-users' ) ),

			Field::make( 'multiselect', 'nar_designations', __( 'NAR Designations', 'frs-users' ) )
				->add_options( array(
					"ABR - Accredited Buyer's Representative"     => __( "ABR - Accredited Buyer's Representative", 'frs-users' ),
					'CRS - Certified Residential Specialist'      => __( 'CRS - Certified Residential Specialist', 'frs-users' ),
					'SRES - Seniors Real Estate Specialist'       => __( 'SRES - Seniors Real Estate Specialist', 'frs-users' ),
					'SRS - Seller Representative Specialist'      => __( 'SRS - Seller Representative Specialist', 'frs-users' ),
					'GRI - Graduate REALTOR® Institute'           => __( 'GRI - Graduate REALTOR® Institute', 'frs-users' ),
					'CRB - Certified Real Estate Brokerage Manager' => __( 'CRB - Certified Real Estate Brokerage Manager', 'frs-users' ),
					'CCIM - Certified Commercial Investment Member' => __( 'CCIM - Certified Commercial Investment Member', 'frs-users' ),
					'CIPS - Certified International Property Specialist' => __( 'CIPS - Certified International Property Specialist', 'frs-users' ),
					'CPM - Certified Property Manager'            => __( 'CPM - Certified Property Manager', 'frs-users' ),
					'CRE - Counselor of Real Estate'              => __( 'CRE - Counselor of Real Estate', 'frs-users' ),
					'ALC - Accredited Land Consultant'            => __( 'ALC - Accredited Land Consultant', 'frs-users' ),
					'MRP - Military Relocation Professional'      => __( 'MRP - Military Relocation Professional', 'frs-users' ),
					'RSPS - Resort & Second-Home Property Specialist' => __( 'RSPS - Resort & Second-Home Property Specialist', 'frs-users' ),
				) )
				->set_help_text( __( 'National Association of Realtors designations', 'frs-users' ) ),

			Field::make( 'multiselect', 'namb_certifications', __( 'NAMB Certifications', 'frs-users' ) )
				->add_options( array(
					'CMC - Certified Mortgage Consultant'           => __( 'CMC - Certified Mortgage Consultant', 'frs-users' ),
					'CRMS - Certified Residential Mortgage Specialist' => __( 'CRMS - Certified Residential Mortgage Specialist', 'frs-users' ),
					'GMA - General Mortgage Associate'              => __( 'GMA - General Mortgage Associate', 'frs-users' ),
					'CVLS - Certified Veterans Lending Specialist'  => __( 'CVLS - Certified Veterans Lending Specialist', 'frs-users' ),
				) )
				->set_help_text( __( 'National Association of Mortgage Brokers certifications', 'frs-users' ) ),

			Field::make( 'complex', 'awards', __( 'Awards & Recognition', 'frs-users' ) )
				->add_fields( array(
					Field::make( 'text', 'year', __( 'Year', 'frs-users' ) )
						->set_attribute( 'maxLength', 4 ),
					Field::make( 'select', 'award', __( 'Award', 'frs-users' ) )
						->add_options( array(
							'GRAND CENTURION®'                  => 'GRAND CENTURION®',
							'Double CENTURION®'                 => 'Double CENTURION®',
							'CENTURION®'                        => 'CENTURION®',
							'CENTURION® Team'                   => 'CENTURION® Team',
							'CENTURION® Honor Society'          => 'CENTURION® Honor Society',
							'Masters Diamond'                   => 'Masters Diamond',
							'Masters Emerald'                   => 'Masters Emerald',
							'Masters Ruby'                      => 'Masters Ruby',
							'Masters Team'                      => 'Masters Team',
							'Quality Service Pinnacle Producer' => 'Quality Service Pinnacle Producer',
							'Quality Service Producer'          => 'Quality Service Producer',
							"President's Producer"              => "President's Producer",
							'Agent of the Year'                 => 'Agent of the Year',
						) ),
					Field::make( 'image', 'award_logo', __( 'Award Logo', 'frs-users' ) )
						->set_value_type( 'url' ),
				) )
				->set_help_text( __( 'Professional awards and recognition', 'frs-users' ) ),

			Field::make( 'multiselect', 'languages', __( 'Languages', 'frs-users' ) )
				->add_options( array(
					'English'   => __( 'English', 'frs-users' ),
					'Spanish'   => __( 'Spanish', 'frs-users' ),
					'Mandarin'  => __( 'Mandarin', 'frs-users' ),
					'Cantonese' => __( 'Cantonese', 'frs-users' ),
					'Turkish'   => __( 'Turkish', 'frs-users' ),
					'French'    => __( 'French', 'frs-users' ),
					'German'    => __( 'German', 'frs-users' ),
					'Russian'   => __( 'Russian', 'frs-users' ),
					'Arabic'    => __( 'Arabic', 'frs-users' ),
				) )
				->set_help_text( __( 'Languages spoken', 'frs-users' ) ),

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
			Field::make( 'text', 'arrive', __( 'Arrive', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'ARRIVE platform registration URL', 'frs-users' ) ),

			Field::make( 'text', 'canva_folder_link', __( 'Canva Folder Link', 'frs-users' ) )
				->set_attribute( 'type', 'url' )
				->set_help_text( __( 'Link to Canva marketing materials', 'frs-users' ) ),

			Field::make( 'complex', 'niche_bio_content', __( 'Add Niche Bio Content', 'frs-users' ) )
				->add_fields( array(
					Field::make( 'text', 'title', __( 'Title', 'frs-users' ) ),
					Field::make( 'rich_text', 'bio_content', __( 'Bio Content', 'frs-users' ) ),
				) )
				->set_help_text( __( 'If you operate in more than one specialty or niche, add different bios here', 'frs-users' ) ),

			Field::make( 'media_gallery', 'personal_branding_images', __( 'Personal Branding Images', 'frs-users' ) )
				->set_type( 'image' )
				->set_help_text( __( 'Add any personal branding that you would like to be used', 'frs-users' ) ),
		);
	}
}
