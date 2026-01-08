<?php
/**
 * Field Shortcodes Controller
 *
 * Provides field-specific shortcodes for accessing profile data.
 * Designed for use with GreenshiftWP and other page builders.
 *
 * @package FRSUsers
 * @subpackage Controllers
 * @since 1.0.0
 */

namespace FRSUsers\Controllers;

use FRSUsers\Models\Profile;

/**
 * Class FieldShortcodes
 *
 * Handles registration and rendering of field-specific shortcodes.
 *
 * @package FRSUsers\Controllers
 */
class FieldShortcodes {

	/**
	 * Allowed scalar fields that can be accessed via shortcode.
	 *
	 * @var array
	 */
	private const ALLOWED_SCALAR_FIELDS = array(
		'email',
		'first_name',
		'last_name',
		'display_name',
		'phone_number',
		'mobile_number',
		'office',
		'company_name',
		'company_website',
		'job_title',
		'biography',
		'select_person_type',
		'nmls',
		'nmls_number',
		'license_number',
		'dre_license',
		'brand',
		'status',
		'city_state',
		'region',
		'facebook_url',
		'instagram_url',
		'linkedin_url',
		'twitter_url',
		'youtube_url',
		'tiktok_url',
		'arrive',
		'canva_folder_link',
		'niche_bio_content',
		'profile_slug',
		'profile_headline',
		'profile_theme',
		'directory_button_type',
		'headshot_id',
		'company_logo_id',
		'loan_officer_profile',
		'loan_officer_user',
		'frs_agent_id',
	);

	/**
	 * Allowed array/JSON fields that can be accessed via shortcode.
	 *
	 * @var array
	 */
	private const ALLOWED_ARRAY_FIELDS = array(
		'languages',
		'specialties',
		'specialties_lo',
		'awards',
		'nar_designations',
		'namb_certifications',
		'service_areas',
		'custom_links',
		'personal_branding_images',
	);

	/**
	 * Fields that are explicitly excluded (sensitive/internal).
	 *
	 * @var array
	 */
	private const EXCLUDED_FIELDS = array(
		'followupboss_api_key',
		'followupboss_status',
		'notification_settings',
		'privacy_settings',
		'profile_visibility',
		'qr_code_data',
	);

	/**
	 * Initialize shortcodes
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_shortcodes' ) );
	}

	/**
	 * Register all field shortcodes
	 *
	 * @return void
	 */
	public static function register_shortcodes() {
		// Main field shortcode
		add_shortcode( 'frs_field', array( __CLASS__, 'render_field' ) );

		// Convenience shortcodes for common fields
		add_shortcode( 'frs_full_name', array( __CLASS__, 'render_full_name' ) );
		add_shortcode( 'frs_headshot', array( __CLASS__, 'render_headshot' ) );

		// Allow extensions
		do_action( 'frs_users_register_field_shortcodes' );
	}

	/**
	 * Render field shortcode
	 *
	 * Usage:
	 * [frs_field name="first_name"]
	 * [frs_field name="job_title" default="Team Member"]
	 * [frs_field name="languages" format="list"]
	 * [frs_field user_id="123" name="email"]
	 * [frs_field profile_id="456" name="first_name"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Rendered field value.
	 */
	public static function render_field( $atts ) {
		// Parse attributes
		$atts = shortcode_atts(
			array(
				'name'       => '',
				'user_id'    => 'current',
				'profile_id' => null,
				'default'    => '',
				'format'     => 'list', // For arrays: 'list', 'json', 'count'
			),
			$atts,
			'frs_field'
		);

		// Validate field name
		$field_name = sanitize_key( $atts['name'] );
		if ( empty( $field_name ) ) {
			return '';
		}

		// Check if field is allowed
		if ( ! self::is_field_allowed( $field_name ) ) {
			return '';
		}

		// Get profile
		$profile = self::get_profile( $atts );
		if ( ! $profile ) {
			return esc_html( $atts['default'] );
		}

		// Get field value
		$value = self::get_field_value( $profile, $field_name, $atts['format'] );

		// Return default if value is empty
		if ( '' === $value || null === $value ) {
			return esc_html( $atts['default'] );
		}

		return $value;
	}

	/**
	 * Render full name shortcode (convenience)
	 *
	 * Usage: [frs_full_name] or [frs_full_name user_id="123"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Full name.
	 */
	public static function render_full_name( $atts ) {
		$atts = shortcode_atts(
			array(
				'user_id'    => 'current',
				'profile_id' => null,
				'default'    => '',
			),
			$atts,
			'frs_full_name'
		);

		$profile = self::get_profile( $atts );
		if ( ! $profile ) {
			return esc_html( $atts['default'] );
		}

		$full_name = trim( $profile->first_name . ' ' . $profile->last_name );
		return '' !== $full_name ? esc_html( $full_name ) : esc_html( $atts['default'] );
	}

	/**
	 * Render headshot shortcode (convenience)
	 *
	 * Usage:
	 * [frs_headshot] - Returns URL
	 * [frs_headshot format="img"] - Returns img tag
	 * [frs_headshot format="img" class="rounded-full"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Headshot URL or img tag.
	 */
	public static function render_headshot( $atts ) {
		$atts = shortcode_atts(
			array(
				'user_id'    => 'current',
				'profile_id' => null,
				'format'     => 'url', // 'url' or 'img'
				'size'       => 'full',
				'class'      => '',
				'default'    => '',
			),
			$atts,
			'frs_headshot'
		);

		$profile = self::get_profile( $atts );
		if ( ! $profile || ! $profile->headshot_id ) {
			return esc_html( $atts['default'] );
		}

		$url = wp_get_attachment_image_url( $profile->headshot_id, $atts['size'] );
		if ( ! $url ) {
			return esc_html( $atts['default'] );
		}

		if ( 'img' === $atts['format'] ) {
			$alt   = esc_attr( trim( $profile->first_name . ' ' . $profile->last_name ) );
			$class = esc_attr( $atts['class'] );
			return sprintf(
				'<img src="%s" alt="%s" class="%s" />',
				esc_url( $url ),
				$alt,
				$class
			);
		}

		return esc_url( $url );
	}

	/**
	 * Get profile based on shortcode attributes
	 *
	 * Resolution order:
	 * 1. If profile_id provided, use Profile::find()
	 * 2. If user_id='current', use get_current_user_id() then Profile::get_by_user_id()
	 * 3. If user_id is numeric, use Profile::get_by_user_id()
	 *
	 * @param array $atts Shortcode attributes with user_id and profile_id.
	 * @return Profile|null Profile model or null if not found.
	 */
	private static function get_profile( $atts ) {
		// Priority 1: Direct profile ID
		if ( ! empty( $atts['profile_id'] ) ) {
			return Profile::find( absint( $atts['profile_id'] ) );
		}

		// Priority 2: User ID resolution
		$user_id = $atts['user_id'];

		if ( 'current' === $user_id ) {
			$user_id = get_current_user_id();
			if ( ! $user_id ) {
				return null; // Not logged in
			}
		} else {
			$user_id = absint( $user_id );
			if ( ! $user_id ) {
				return null; // Invalid user ID
			}
		}

		return Profile::get_by_user_id( $user_id );
	}

	/**
	 * Check if a field is allowed to be accessed via shortcode
	 *
	 * @param string $field_name Field name to check.
	 * @return bool True if field is allowed.
	 */
	private static function is_field_allowed( $field_name ) {
		// Check if explicitly excluded
		if ( in_array( $field_name, self::EXCLUDED_FIELDS, true ) ) {
			return false;
		}

		// Check if in allowed lists
		return in_array( $field_name, self::ALLOWED_SCALAR_FIELDS, true ) ||
			   in_array( $field_name, self::ALLOWED_ARRAY_FIELDS, true );
	}

	/**
	 * Get field value from profile with appropriate formatting
	 *
	 * @param Profile $profile    Profile model.
	 * @param string  $field_name Field name.
	 * @param string  $format     Output format for arrays.
	 * @return string Formatted field value.
	 */
	private static function get_field_value( $profile, $field_name, $format ) {
		// Get raw value from profile
		$value = $profile->$field_name;

		// Handle null/empty
		if ( null === $value || '' === $value ) {
			return '';
		}

		// Check if this is an array field
		if ( in_array( $field_name, self::ALLOWED_ARRAY_FIELDS, true ) ) {
			return self::format_array_value( $value, $format );
		}

		// Handle special fields
		if ( 'headshot_id' === $field_name || 'company_logo_id' === $field_name ) {
			// Return the ID by default, but could be extended to return URL
			return esc_html( (string) $value );
		}

		// Scalar value - escape and return
		return esc_html( (string) $value );
	}

	/**
	 * Format array value based on requested format
	 *
	 * @param mixed  $value  Array value (may be JSON string or array).
	 * @param string $format Output format: 'list', 'json', 'count'.
	 * @return string Formatted value.
	 */
	private static function format_array_value( $value, $format ) {
		// Ensure we have an array
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value   = is_array( $decoded ) ? $decoded : array();
		}

		if ( ! is_array( $value ) ) {
			$value = array();
		}

		// Handle empty arrays
		if ( empty( $value ) ) {
			return '';
		}

		switch ( $format ) {
			case 'json':
				return wp_json_encode( $value );

			case 'count':
				return (string) count( $value );

			case 'list':
			default:
				// For complex arrays (like custom_links), extract displayable values
				$flat = array();
				foreach ( $value as $item ) {
					if ( is_array( $item ) ) {
						// Try common keys for display value
						if ( isset( $item['label'] ) ) {
							$flat[] = $item['label'];
						} elseif ( isset( $item['name'] ) ) {
							$flat[] = $item['name'];
						} elseif ( isset( $item['title'] ) ) {
							$flat[] = $item['title'];
						} elseif ( isset( $item['value'] ) ) {
							$flat[] = $item['value'];
						}
					} else {
						$flat[] = $item;
					}
				}
				return esc_html( implode( ', ', array_filter( $flat ) ) );
		}
	}

	/**
	 * Get list of all allowed fields
	 *
	 * Useful for documentation and admin interfaces.
	 *
	 * @return array List of allowed field names.
	 */
	public static function get_allowed_fields() {
		return array_merge( self::ALLOWED_SCALAR_FIELDS, self::ALLOWED_ARRAY_FIELDS );
	}

	/**
	 * Get list of array fields
	 *
	 * @return array List of array field names.
	 */
	public static function get_array_fields() {
		return self::ALLOWED_ARRAY_FIELDS;
	}

	/**
	 * Get list of scalar fields
	 *
	 * @return array List of scalar field names.
	 */
	public static function get_scalar_fields() {
		return self::ALLOWED_SCALAR_FIELDS;
	}
}
