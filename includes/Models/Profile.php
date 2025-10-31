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
	 * The table associated with the model.
	 *
	 * @var string
	 */
	protected $table = 'frs_profiles';

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
		'phone_number',
		'mobile_number',
		'office',
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
	 * Get all active profiles.
	 *
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public static function get_all() {
		return static::where( 'is_active', 1 )
			->orderBy( 'last_name', 'asc' )
			->get();
	}

	/**
	 * Get guest profiles (no linked user).
	 *
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public static function get_guests() {
		return static::whereNull( 'user_id' )
			->where( 'is_active', 1 )
			->orderBy( 'last_name', 'asc' )
			->get();
	}

	/**
	 * Get profiles by type.
	 *
	 * @param string $type Profile type.
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public static function get_by_type( $type ) {
		return static::where( 'select_person_type', $type )
			->where( 'is_active', 1 )
			->orderBy( 'last_name', 'asc' )
			->get();
	}

	/**
	 * Get profile by user ID.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return Profile|null
	 */
	public static function get_by_user_id( $user_id ) {
		return static::where( 'user_id', $user_id )->first();
	}

	/**
	 * Get profile by email.
	 *
	 * @param string $email Email address.
	 * @return Profile|null
	 */
	public static function get_by_email( $email ) {
		return static::where( 'email', $email )->first();
	}

	/**
	 * Get profile by FRS agent ID.
	 *
	 * @param string $frs_agent_id FRS Agent ID.
	 * @return Profile|null
	 */
	public static function get_by_frs_agent_id( $frs_agent_id ) {
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
	 * Convert the model to an array for API responses.
	 *
	 * @return array
	 */
	public function toArray() {
		$array = parent::toArray();

		// Add computed attributes
		$array['full_name'] = $this->full_name;
		$array['headshot_url'] = $this->headshot_url;
		$array['is_guest'] = $this->is_guest();

		return $array;
	}
}
