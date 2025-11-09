<?php
/**
 * SSO Client Model
 *
 * Represents OAuth clients (WordPress sites that use hub21 as identity provider)
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

defined( 'ABSPATH' ) || exit;

/**
 * Class SSOClient
 *
 * @property int    $id
 * @property string $name
 * @property string $description
 * @property string $client_id
 * @property string $client_secret
 * @property string $redirect_uris
 * @property string $grant_types
 * @property string $scope
 * @property string $logo_url
 * @property string $website_url
 * @property bool   $is_active
 * @property string $last_used_at
 * @property string $created_at
 * @property string $updated_at
 *
 * @since 1.0.0
 */
class SSOClient extends Model {

	/**
	 * The table associated with the model.
	 *
	 * @var string
	 */
	protected $table = 'frs_sso_clients';

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
		'name',
		'description',
		'client_id',
		'client_secret',
		'redirect_uris',
		'grant_types',
		'scope',
		'logo_url',
		'website_url',
		'is_active',
		'last_used_at',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array
	 */
	protected $casts = [
		'is_active'    => 'boolean',
		'last_used_at' => 'datetime',
		'created_at'   => 'datetime',
		'updated_at'   => 'datetime',
	];

	/**
	 * Scope: Only active clients
	 *
	 * @param \Illuminate\Database\Eloquent\Builder $query Query builder.
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function scopeActive( $query ) {
		return $query->where( 'is_active', 1 );
	}

	/**
	 * Get redirect URIs as array
	 *
	 * @return array
	 */
	public function getRedirectUrisArray(): array {
		return array_filter( explode( "\n", $this->redirect_uris ) );
	}

	/**
	 * Record client usage
	 *
	 * @return bool
	 */
	public function recordUsage(): bool {
		$this->last_used_at = current_time( 'mysql' );
		return $this->save();
	}
}
