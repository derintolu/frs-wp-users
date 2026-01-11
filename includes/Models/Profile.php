<?php
/**
 * Profile Model
 *
 * Eloquent model for user profiles.
 *
 * @package FRSUsers
 * @subpackage Models
 * @since 1.0.0
 */

namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

/**
 * Class Profile
 *
 * Represents a user profile in the system.
 * Profiles can exist independently (guest) or be linked to WordPress users.
 *
 * @package FRSUsers\Models
 */
class Profile extends Model {

	/**
	 * The base table name (without prefix).
	 *
	 * @var string
	 */
	protected $table = 'frs_profiles';

	/**
	 * Flag to enable WordPress-native mode (reads from wp_users + wp_usermeta)
	 *
	 * @var bool
	 */
	protected static $use_wp_native = true;

	/**
	 * Get the table name.
	 *
	 * In multisite, profiles are stored in a single network-wide table.
	 * The connection is configured with base_prefix in libs/db.php.
	 *
	 * @return string
	 */
	public function getTable() {
		return 'frs_profiles';
	}

	/**
	 * The primary key for the model.
	 *
	 * @var string
	 */
	protected $primaryKey = 'id';

	/**
	 * Indicates if the model should be timestamped.
	 *
	 * @var bool
	 */
	public $timestamps = true;

	/**
	 * The name of the "created at" column.
	 *
	 * @var string
	 */
	const CREATED_AT = 'created_at';

	/**
	 * The name of the "updated at" column.
	 *
	 * @var string
	 */
	const UPDATED_AT = 'updated_at';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
		'user_id',
		'frs_agent_id',
		'email',
		'first_name',
		'last_name',
		'display_name',
		'phone_number',
		'mobile_number',
		'office',
		'company_name',
		'company_logo_id',
		'company_website',
		'headshot_id',
		'job_title',
		'biography',
		'date_of_birth',
		'select_person_type',
		'nmls',
		'nmls_number',
		'license_number',
		'dre_license',
		'specialties_lo',
		'specialties',
		'service_areas',
		'languages',
		'awards',
		'nar_designations',
		'namb_certifications',
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
		'personal_branding_images',
		'loan_officer_profile',
		'loan_officer_user',
		'profile_slug',
		'profile_headline',
		'profile_visibility',
		'profile_theme',
		'custom_links',
		'service_areas',
		'directory_button_type',
		'qr_code_data',
		'is_active',
		'synced_to_fluentcrm_at',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array
	 */
	protected $casts = [
		'user_id'                => 'integer',
		'headshot_id'            => 'integer',
		'company_logo_id'        => 'integer',
		'loan_officer_profile'   => 'integer',
		'loan_officer_user'      => 'integer',
		'is_active'              => 'boolean',
		'specialties_lo'         => 'array',
		'specialties'            => 'array',
		'languages'              => 'array',
		'awards'                 => 'array',
		'nar_designations'       => 'array',
		'namb_certifications'    => 'array',
		'personal_branding_images' => 'array',
		'profile_visibility'     => 'array',
		'custom_links'           => 'array',
		'service_areas'          => 'array',
		'date_of_birth'          => 'date',
		'created_at'             => 'datetime',
		'updated_at'             => 'datetime',
		'synced_to_fluentcrm_at' => 'datetime',
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var array
	 */
	protected $hidden = [];

	/**
	 * Boot the model.
	 *
	 * @return void
	 */
	protected static function boot() {
		parent::boot();

		// Auto-generate slug on create
		static::creating( function ( $profile ) {
			if ( empty( $profile->profile_slug ) && ! empty( $profile->first_name ) && ! empty( $profile->last_name ) ) {
				$profile->profile_slug = static::generate_unique_slug( $profile->first_name, $profile->last_name );
			}
		} );

		// Update slug if name changes
		static::updating( function ( $profile ) {
			// Only auto-update slug if it was never manually set
			// Check if first_name or last_name changed
			if ( $profile->isDirty( 'first_name' ) || $profile->isDirty( 'last_name' ) ) {
				// Only auto-update if slug matches the pattern of old name or is empty
				$old_slug = static::generate_slug_from_name( $profile->getOriginal( 'first_name' ), $profile->getOriginal( 'last_name' ) );
				$current_slug = $profile->profile_slug;

				// If current slug is empty, matches old auto-generated slug, or starts with old slug pattern
				if ( empty( $current_slug ) || $current_slug === $old_slug || strpos( $current_slug, $old_slug ) === 0 ) {
					$profile->profile_slug = static::generate_unique_slug( $profile->first_name, $profile->last_name, $profile->id );
				}
			}
		} );

		// Fire action after profile is saved (created or updated)
		static::saved( function ( $profile ) {
			do_action( 'frs_profile_saved', $profile->id, $profile->toArray() );
		} );
	}

	/**
	 * Generate a unique profile slug.
	 *
	 * @param string $first_name First name.
	 * @param string $last_name Last name.
	 * @param int|null $exclude_id Profile ID to exclude from uniqueness check.
	 * @return string
	 */
	public static function generate_unique_slug( $first_name, $last_name, $exclude_id = null ) {
		$base_slug = static::generate_slug_from_name( $first_name, $last_name );
		$slug = $base_slug;
		$counter = 1;

		// Check for uniqueness
		while ( static::slug_exists( $slug, $exclude_id ) ) {
			$slug = $base_slug . '-' . $counter;
			$counter++;
		}

		return $slug;
	}

	/**
	 * Generate slug from first and last name.
	 *
	 * @param string $first_name First name.
	 * @param string $last_name Last name.
	 * @return string
	 */
	protected static function generate_slug_from_name( $first_name, $last_name ) {
		$full_name = trim( $first_name . ' ' . $last_name );
		return sanitize_title( $full_name );
	}

	/**
	 * Check if a slug exists in the database.
	 *
	 * @param string $slug Slug to check.
	 * @param int|null $exclude_id Profile ID to exclude from check.
	 * @return bool
	 */
	protected static function slug_exists( $slug, $exclude_id = null ) {
		$query = static::where( 'profile_slug', $slug );

		if ( $exclude_id ) {
			$query->where( 'id', '!=', $exclude_id );
		}

		return $query->exists();
	}

	/**
	 * Get all active profiles.
	 *
	 * @param array $args Optional arguments (limit, offset, type).
	 * @return \Illuminate\Database\Eloquent\Collection|array
	 */
	public static function get_all( $args = array() ) {
		if ( static::$use_wp_native ) {
			return static::get_all_from_wp_users( $args );
		}

		$query = static::where( 'is_active', 1 )
			->orderBy( 'first_name', 'asc' );

		// Apply pagination if provided
		if ( isset( $args['limit'] ) ) {
			$query->take( $args['limit'] );
		}
		if ( isset( $args['offset'] ) ) {
			$query->skip( $args['offset'] );
		}

		return $query->get();
	}

	/**
	 * Get all profiles from WordPress users.
	 *
	 * @param array $args Optional arguments.
	 * @return array Array of Profile objects.
	 */
	protected static function get_all_from_wp_users( $args = array() ) {
		$wp_args = array(
			'role__in' => array( 'loan_officer', 'realtor_partner', 'staff', 'leadership', 'assistant' ),
			'orderby'  => 'meta_value',
			'meta_key' => 'first_name',
			'order'    => 'ASC',
		);

		// Handle type filter (map old type to role)
		if ( ! empty( $args['type'] ) ) {
			$wp_args['role__in'] = array( $args['type'] );
		}

		// Pagination
		if ( isset( $args['limit'] ) ) {
			$wp_args['number'] = $args['limit'];
		}
		if ( isset( $args['offset'] ) ) {
			$wp_args['offset'] = $args['offset'];
		}

		$users = get_users( $wp_args );

		return array_map( array( static::class, 'hydrate_from_user' ), $users );
	}

	/**
	 * Get guest profiles (no linked user).
	 *
	 * @param array $args Optional arguments (limit, offset).
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public static function get_guests( $args = array() ) {
		$query = static::whereNull( 'user_id' )
			->where( 'is_active', 1 )
			->orderBy( 'first_name', 'asc' );

		// Apply pagination if provided
		if ( isset( $args['limit'] ) ) {
			$query->take( $args['limit'] );
		}
		if ( isset( $args['offset'] ) ) {
			$query->skip( $args['offset'] );
		}

		return $query->get();
	}

	/**
	 * Get profiles by type.
	 *
	 * @param string $type Profile type.
	 * @param array $args Optional arguments (limit, offset).
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public static function get_by_type( $type, $args = array() ) {
		$query = static::where( 'select_person_type', $type )
			->where( 'is_active', 1 )
			->orderBy( 'first_name', 'asc' );

		// Apply pagination if provided
		if ( isset( $args['limit'] ) ) {
			$query->take( $args['limit'] );
		}
		if ( isset( $args['offset'] ) ) {
			$query->skip( $args['offset'] );
		}

		return $query->get();
	}

	/**
	 * Get profile by user ID.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return Profile|null
	 */
	public static function get_by_user_id( $user_id ) {
		if ( static::$use_wp_native ) {
			return static::find( $user_id );
		}
		return static::where( 'user_id', $user_id )->first();
	}

	/**
	 * Get profile by email.
	 *
	 * @param string $email Email address.
	 * @return Profile|null
	 */
	public static function get_by_email( $email ) {
		if ( static::$use_wp_native ) {
			$user = get_user_by( 'email', $email );
			if ( ! $user ) {
				return null;
			}
			return static::hydrate_from_user( $user );
		}
		return static::where( 'email', $email )->first();
	}

	/**
	 * Get profile by FRS agent ID.
	 *
	 * @param string $frs_agent_id FRS Agent ID.
	 * @return Profile|null
	 */
	public static function get_by_frs_agent_id( $frs_agent_id ) {
		if ( static::$use_wp_native ) {
			$users = get_users( array(
				'meta_key'   => 'frs_frs_agent_id',
				'meta_value' => $frs_agent_id,
				'number'     => 1,
			) );
			if ( empty( $users ) ) {
				return null;
			}
			return static::hydrate_from_user( $users[0] );
		}
		return static::where( 'frs_agent_id', $frs_agent_id )->first();
	}

	/**
	 * Check if profile is a guest (no linked user).
	 *
	 * @return bool
	 */
	public function is_guest() {
		return empty( $this->user_id );
	}

	/**
	 * Save profile to WordPress users.
	 *
	 * In WordPress-native mode, saves to wp_users + wp_usermeta.
	 *
	 * @return bool
	 */
	public function save( array $options = array() ) {
		if ( static::$use_wp_native && $this->user_id ) {
			// Update wp_users core fields
			$user_data = array(
				'ID'           => $this->user_id,
				'user_email'   => $this->email,
				'display_name' => $this->display_name,
			);

			$result = wp_update_user( $user_data );
			if ( is_wp_error( $result ) ) {
				return false;
			}

			// Update all meta fields
			update_user_meta( $this->user_id, 'first_name', $this->first_name );
			update_user_meta( $this->user_id, 'last_name', $this->last_name );
			update_user_meta( $this->user_id, 'frs_phone_number', $this->phone_number );
			update_user_meta( $this->user_id, 'frs_mobile_number', $this->mobile_number );
			update_user_meta( $this->user_id, 'frs_office', $this->office );
			update_user_meta( $this->user_id, 'frs_company_name', $this->company_name );
			update_user_meta( $this->user_id, 'frs_company_logo_id', $this->company_logo_id );
			update_user_meta( $this->user_id, 'frs_company_website', $this->company_website );
			update_user_meta( $this->user_id, 'frs_headshot_id', $this->headshot_id );
			update_user_meta( $this->user_id, 'frs_job_title', $this->job_title );
			update_user_meta( $this->user_id, 'frs_biography', $this->biography );
			update_user_meta( $this->user_id, 'frs_date_of_birth', $this->date_of_birth );
			update_user_meta( $this->user_id, 'frs_nmls', $this->nmls );
			update_user_meta( $this->user_id, 'frs_nmls_number', $this->nmls_number );
			update_user_meta( $this->user_id, 'frs_license_number', $this->license_number );
			update_user_meta( $this->user_id, 'frs_dre_license', $this->dre_license );
			update_user_meta( $this->user_id, 'frs_brand', $this->brand );
			update_user_meta( $this->user_id, 'frs_status', $this->status );
			update_user_meta( $this->user_id, 'frs_city_state', $this->city_state );
			update_user_meta( $this->user_id, 'frs_region', $this->region );
			update_user_meta( $this->user_id, 'frs_facebook_url', $this->facebook_url );
			update_user_meta( $this->user_id, 'frs_instagram_url', $this->instagram_url );
			update_user_meta( $this->user_id, 'frs_linkedin_url', $this->linkedin_url );
			update_user_meta( $this->user_id, 'frs_twitter_url', $this->twitter_url );
			update_user_meta( $this->user_id, 'frs_youtube_url', $this->youtube_url );
			update_user_meta( $this->user_id, 'frs_tiktok_url', $this->tiktok_url );
			update_user_meta( $this->user_id, 'frs_arrive', $this->arrive );
			update_user_meta( $this->user_id, 'frs_canva_folder_link', $this->canva_folder_link );
			update_user_meta( $this->user_id, 'frs_niche_bio_content', $this->niche_bio_content );
			update_user_meta( $this->user_id, 'frs_loan_officer_profile', $this->loan_officer_profile );
			update_user_meta( $this->user_id, 'frs_loan_officer_user', $this->loan_officer_user );
			update_user_meta( $this->user_id, 'frs_profile_headline', $this->profile_headline );
			update_user_meta( $this->user_id, 'frs_profile_theme', $this->profile_theme );
			update_user_meta( $this->user_id, 'frs_directory_button_type', $this->directory_button_type );
			update_user_meta( $this->user_id, 'frs_qr_code_data', $this->qr_code_data );
			update_user_meta( $this->user_id, 'frs_is_active', $this->is_active );
			update_user_meta( $this->user_id, 'frs_frs_agent_id', $this->frs_agent_id );

			// JSON fields - encode to JSON
			update_user_meta( $this->user_id, 'frs_specialties_lo', wp_json_encode( $this->specialties_lo ?: array() ) );
			update_user_meta( $this->user_id, 'frs_specialties', wp_json_encode( $this->specialties ?: array() ) );
			update_user_meta( $this->user_id, 'frs_languages', wp_json_encode( $this->languages ?: array() ) );
			update_user_meta( $this->user_id, 'frs_awards', wp_json_encode( $this->awards ?: array() ) );
			update_user_meta( $this->user_id, 'frs_nar_designations', wp_json_encode( $this->nar_designations ?: array() ) );
			update_user_meta( $this->user_id, 'frs_namb_certifications', wp_json_encode( $this->namb_certifications ?: array() ) );
			update_user_meta( $this->user_id, 'frs_personal_branding_images', wp_json_encode( $this->personal_branding_images ?: array() ) );
			update_user_meta( $this->user_id, 'frs_profile_visibility', wp_json_encode( $this->profile_visibility ?: array() ) );
			update_user_meta( $this->user_id, 'frs_custom_links', wp_json_encode( $this->custom_links ?: array() ) );
			update_user_meta( $this->user_id, 'frs_service_areas', wp_json_encode( $this->service_areas ?: array() ) );

			// Update timestamp
			update_user_meta( $this->user_id, 'frs_updated_at', current_time( 'mysql' ) );
			update_user_meta( $this->user_id, 'frs_synced_to_fluentcrm_at', $this->synced_to_fluentcrm_at );

			// Fire same hooks as before for backwards compatibility
			do_action( 'frs_profile_saved', $this->id, $this->toArray() );

			return true;
		}

		return parent::save( $options );
	}

	/**
	 * Link profile to WordPress user.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return bool
	 */
	public function link_user( $user_id ) {
		$this->user_id = $user_id;
		return $this->save();
	}

	/**
	 * Unlink profile from WordPress user.
	 *
	 * @return bool
	 */
	public function unlink_user() {
		$this->user_id = null;
		return $this->save();
	}

	/**
	 * Get headshot URL.
	 *
	 * @return string|null
	 */
	public function get_headshot_url() {
		if ( ! $this->headshot_id ) {
			return null;
		}

		return wp_get_attachment_url( $this->headshot_id );
	}

	/**
	 * Scope a query to only include active profiles.
	 *
	 * @param \Illuminate\Database\Eloquent\Builder $query
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function scopeActive( $query ) {
		return $query->where( 'is_active', 1 );
	}

	/**
	 * Scope a query to only include guest profiles.
	 *
	 * @param \Illuminate\Database\Eloquent\Builder $query
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function scopeGuests( $query ) {
		return $query->whereNull( 'user_id' );
	}

	/**
	 * Scope a query to only include profiles of a specific type.
	 *
	 * @param \Illuminate\Database\Eloquent\Builder $query
	 * @param string $type Profile type.
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function scopeOfType( $query, $type ) {
		return $query->where( 'select_person_type', $type );
	}

	/**
	 * Get the profile's full name.
	 *
	 * @return string
	 */
	public function getFullNameAttribute() {
		return trim( $this->first_name . ' ' . $this->last_name );
	}

	/**
	 * Get headshot URL attribute.
	 *
	 * @return string|null
	 */
	public function getHeadshotUrlAttribute() {
		return $this->get_headshot_url();
	}

	/**
	 * Get avatar URL for this profile.
	 *
	 * Uses WordPress avatar system (Simple Local Avatars or Gravatar fallback).
	 *
	 * @param int $size Avatar size in pixels.
	 * @return string
	 */
	public function get_avatar_url( $size = 96 ) {
		if ( $this->user_id ) {
			return get_avatar_url( $this->user_id, array( 'size' => $size ) );
		}
		// Fallback to Gravatar for email
		return get_avatar_url( $this->email, array( 'size' => $size ) );
	}

	/**
	 * Convert the model to an array for API responses.
	 *
	 * @return array
	 */
	public function toArray() {
		$array = parent::toArray();

		// Add computed attributes
		$array['full_name'] = $this->full_name;
		$array['headshot_url'] = $this->headshot_url;
		$array['avatar_url'] = $this->get_avatar_url( 96 );
		$array['is_guest'] = $this->is_guest();

		// Add user_nicename for profile URL building
		if ( $this->user_id ) {
			$user = get_userdata( $this->user_id );
			if ( $user ) {
				$array['user_nicename'] = $user->user_nicename;
			}
		}

		return $array;
	}

	/**
	 * Find profile by ID.
	 *
	 * In WordPress-native mode, ID is the user ID.
	 * In legacy mode, checks for legacy profile ID mapping.
	 *
	 * @param int $id Profile or user ID.
	 * @return Profile|null
	 */
	public static function find( $id ) {
		if ( static::$use_wp_native ) {
			// Try as user ID first
			$user = get_userdata( $id );

			// If not found, check if it's a legacy profile ID
			if ( ! $user ) {
				$user_id = get_option( "frs_legacy_profile_{$id}" );
				if ( $user_id ) {
					$user = get_userdata( $user_id );
				}
			}

			if ( ! $user ) {
				return null;
			}

			return static::hydrate_from_user( $user );
		}

		return parent::find( $id );
	}

	/**
	 * Parse states from a region string.
	 *
	 * @param string $region Region string (e.g., "Inland Empire, Texas, Colorado").
	 * @return array Array of state abbreviations.
	 */
	public static function parse_states_from_region( $region ) {
		$states = array();
		$region_lower = strtolower( $region );

		// California regions
		$ca_regions = array( 'greater la', 'los angeles', 'orange county', 'san diego', 'bay area',
			'inland empire', 'inand empire', 'inland empre', 'sacramento', 'central coast',
			'san francisco', 'san jose', 'headquarters', 'california' );
		foreach ( $ca_regions as $ca ) {
			if ( strpos( $region_lower, $ca ) !== false ) {
				$states[] = 'CA';
				break;
			}
		}

		// State name to abbreviation mapping
		$state_map = array(
			'alabama' => 'AL', 'alaska' => 'AK', 'arizona' => 'AZ', 'arkansas' => 'AR',
			'colorado' => 'CO', 'connecticut' => 'CT', 'delaware' => 'DE', 'florida' => 'FL',
			'georgia' => 'GA', 'hawaii' => 'HI', 'idaho' => 'ID', 'illinois' => 'IL',
			'indiana' => 'IN', 'iowa' => 'IA', 'kansas' => 'KS', 'kentucky' => 'KY',
			'louisiana' => 'LA', 'maine' => 'ME', 'maryland' => 'MD', 'massachusetts' => 'MA',
			'michigan' => 'MI', 'minnesota' => 'MN', 'mississippi' => 'MS', 'missouri' => 'MO',
			'montana' => 'MT', 'nebraska' => 'NE', 'nevada' => 'NV', 'new hampshire' => 'NH',
			'new jersey' => 'NJ', 'new mexico' => 'NM', 'new york' => 'NY', 'north carolina' => 'NC',
			'north dakota' => 'ND', 'ohio' => 'OH', 'oklahoma' => 'OK', 'oregon' => 'OR',
			'pennsylvania' => 'PA', 'pennslyvania' => 'PA', 'rhode island' => 'RI',
			'south carolina' => 'SC', 'south dakota' => 'SD', 'tennessee' => 'TN', 'tennesee' => 'TN',
			'texas' => 'TX', 'utah' => 'UT', 'vermont' => 'VT', 'virginia' => 'VA', 'virgina' => 'VA',
			'washington' => 'WA', 'west virginia' => 'WV', 'wisconsin' => 'WI', 'wyoming' => 'WY',
		);

		foreach ( $state_map as $name => $abbr ) {
			// Use word boundary matching to avoid "arkansas" matching "kansas"
			if ( preg_match( '/\b' . preg_quote( $name, '/' ) . '\b/', $region_lower ) && ! in_array( $abbr, $states, true ) ) {
				$states[] = $abbr;
			}
		}

		return array_unique( $states );
	}

	/**
	 * Decode array value from meta - handles both serialized arrays and JSON strings.
	 *
	 * @param mixed $value Meta value (could be array, JSON string, or empty).
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

	/**
	 * Get user meta with fallback to legacy key.
	 *
	 * @param int $user_id User ID.
	 * @param string $key Primary meta key.
	 * @param string|null $fallback_key Fallback meta key (legacy).
	 * @return mixed
	 */
	protected static function get_meta_with_fallback( $user_id, $key, $fallback_key = null ) {
		$value = get_user_meta( $user_id, $key, true );
		if ( empty( $value ) && $fallback_key ) {
			$value = get_user_meta( $user_id, $fallback_key, true );
		}
		return $value;
	}

	/**
	 * Hydrate Profile object from WordPress user.
	 *
	 * Converts WP_User to Profile with same structure as database model.
	 *
	 * @param \WP_User $user WordPress user object.
	 * @return Profile
	 */
	protected static function hydrate_from_user( $user ) {
		$profile = new static();

		// Core fields
		$profile->id = $user->ID;
		$profile->user_id = $user->ID;
		$profile->email = $user->user_email;
		$profile->display_name = $user->display_name;

		// Meta fields - with fallbacks to legacy meta keys
		$profile->first_name = get_user_meta( $user->ID, 'first_name', true );
		$profile->last_name = get_user_meta( $user->ID, 'last_name', true );
		$profile->phone_number = static::get_meta_with_fallback( $user->ID, 'frs_phone_number', 'phone_number' );
		$profile->mobile_number = static::get_meta_with_fallback( $user->ID, 'frs_mobile_number', 'mobile_number' );
		$profile->office = static::get_meta_with_fallback( $user->ID, 'frs_office', 'office' );
		$profile->company_name = static::get_meta_with_fallback( $user->ID, 'frs_company_name', 'company_name' );
		$profile->company_logo_id = (int) static::get_meta_with_fallback( $user->ID, 'frs_company_logo_id', 'company_logo_id' );
		$profile->company_website = static::get_meta_with_fallback( $user->ID, 'frs_company_website', 'company_website' );
		$profile->headshot_id = (int) static::get_meta_with_fallback( $user->ID, 'frs_headshot_id', 'headshot_id' );
		$profile->job_title = static::get_meta_with_fallback( $user->ID, 'frs_job_title', 'job_title' );
		$profile->biography = static::get_meta_with_fallback( $user->ID, 'frs_biography', 'biography' );
		$profile->date_of_birth = static::get_meta_with_fallback( $user->ID, 'frs_date_of_birth', 'date_of_birth' ) ?: null;
		$profile->nmls = static::get_meta_with_fallback( $user->ID, 'frs_nmls', 'nmls_id' );
		$profile->nmls_number = static::get_meta_with_fallback( $user->ID, 'frs_nmls_number', 'nmls_number' );
		$profile->license_number = static::get_meta_with_fallback( $user->ID, 'frs_license_number', 'license_number' );
		$profile->dre_license = static::get_meta_with_fallback( $user->ID, 'frs_dre_license', 'dre_license' );
		$profile->brand = static::get_meta_with_fallback( $user->ID, 'frs_brand', 'brand' );
		$profile->status = static::get_meta_with_fallback( $user->ID, 'frs_status', 'status' );
		$profile->city_state = static::get_meta_with_fallback( $user->ID, 'frs_city_state', 'city_state' );
		$profile->region = static::get_meta_with_fallback( $user->ID, 'frs_region', 'region' );

		// Social media
		$profile->facebook_url = get_user_meta( $user->ID, 'frs_facebook_url', true );
		$profile->instagram_url = get_user_meta( $user->ID, 'frs_instagram_url', true );
		$profile->linkedin_url = get_user_meta( $user->ID, 'frs_linkedin_url', true );
		$profile->twitter_url = get_user_meta( $user->ID, 'frs_twitter_url', true );
		$profile->youtube_url = get_user_meta( $user->ID, 'frs_youtube_url', true );
		$profile->tiktok_url = get_user_meta( $user->ID, 'frs_tiktok_url', true );

		// Additional fields
		$profile->arrive = get_user_meta( $user->ID, 'frs_arrive', true );
		$profile->canva_folder_link = get_user_meta( $user->ID, 'frs_canva_folder_link', true );
		$profile->niche_bio_content = get_user_meta( $user->ID, 'frs_niche_bio_content', true );
		$profile->loan_officer_profile = (int) get_user_meta( $user->ID, 'frs_loan_officer_profile', true );
		$profile->loan_officer_user = (int) get_user_meta( $user->ID, 'frs_loan_officer_user', true );
		$profile->profile_slug = $user->user_nicename;
		$profile->profile_headline = get_user_meta( $user->ID, 'frs_profile_headline', true );
		$profile->profile_theme = get_user_meta( $user->ID, 'frs_profile_theme', true );
		$profile->directory_button_type = get_user_meta( $user->ID, 'frs_directory_button_type', true );
		$profile->qr_code_data = get_user_meta( $user->ID, 'frs_qr_code_data', true );
		$profile->is_active = (bool) get_user_meta( $user->ID, 'frs_is_active', true );
		$profile->frs_agent_id = get_user_meta( $user->ID, 'frs_frs_agent_id', true );

		// JSON/array fields - handle both serialized arrays and JSON strings
		$profile->specialties_lo = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_specialties_lo', true ) );
		$profile->specialties = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_specialties', true ) );
		$profile->languages = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_languages', true ) );
		$profile->awards = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_awards', true ) );
		$profile->nar_designations = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_nar_designations', true ) );
		$profile->namb_certifications = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_namb_certifications', true ) );
		$profile->personal_branding_images = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_personal_branding_images', true ) );
		$profile->profile_visibility = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_profile_visibility', true ) );
		$profile->custom_links = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_custom_links', true ) );
		$profile->service_areas = static::maybe_decode_array( get_user_meta( $user->ID, 'frs_service_areas', true ) );

		// Derive service_areas from region if not set
		if ( empty( $profile->service_areas ) && ! empty( $profile->region ) ) {
			$profile->service_areas = static::parse_states_from_region( $profile->region );
		}

		// Timestamps
		$profile->synced_to_fluentcrm_at = get_user_meta( $user->ID, 'frs_synced_to_fluentcrm_at', true );
		$profile->created_at = $user->user_registered;
		$profile->updated_at = get_user_meta( $user->ID, 'frs_updated_at', true ) ?: $user->user_registered;

		// Determine person type - check frs_select_person_type first, then fall back to WP role
		$stored_type = get_user_meta( $user->ID, 'frs_select_person_type', true );
		if ( ! empty( $stored_type ) ) {
			$profile->select_person_type = $stored_type;
		} else {
			// Fall back to WordPress role mapping
			$roles = $user->roles ?? array();
			if ( in_array( 'loan_originator', $roles, true ) || in_array( 'loan_officer', $roles, true ) ) {
				$profile->select_person_type = 'loan_originator';
			} elseif ( in_array( 'broker_associate', $roles, true ) ) {
				$profile->select_person_type = 'broker_associate';
			} elseif ( in_array( 'sales_associate', $roles, true ) ) {
				$profile->select_person_type = 'sales_associate';
			} elseif ( in_array( 'realtor_partner', $roles, true ) ) {
				$profile->select_person_type = 'broker_associate'; // Map legacy to broker
			} elseif ( in_array( 'dual_license', $roles, true ) ) {
				$profile->select_person_type = 'dual_license';
			} elseif ( in_array( 'leadership', $roles, true ) ) {
				$profile->select_person_type = 'leadership';
			} elseif ( in_array( 'staff', $roles, true ) || in_array( 'assistant', $roles, true ) ) {
				$profile->select_person_type = 'staff';
			}
		}

		$profile->exists = true;
		return $profile;
	}
}
