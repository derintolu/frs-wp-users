<?php
/**
 * SSO Provider Model
 *
 * Represents external OAuth providers (services we can authenticate against)
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

defined( 'ABSPATH' ) || exit;

/**
 * Class SSOProvider
 *
 * @property int    $id
 * @property string $name
 * @property string $provider_type
 * @property string $description
 * @property string $client_id
 * @property string $client_secret
 * @property string $authorization_endpoint
 * @property string $token_endpoint
 * @property string $userinfo_endpoint
 * @property string $scope
 * @property array  $user_mapping
 * @property bool   $sync_on_login
 * @property bool   $auto_create_users
 * @property bool   $is_active
 * @property string $logo_url
 * @property string $button_text
 * @property string $created_at
 * @property string $updated_at
 *
 * @since 1.0.0
 */
class SSOProvider extends Model {

	/**
	 * The table associated with the model.
	 *
	 * @var string
	 */
	protected $table = 'frs_sso_providers';

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
		'provider_type',
		'description',
		'client_id',
		'client_secret',
		'authorization_endpoint',
		'token_endpoint',
		'userinfo_endpoint',
		'scope',
		'user_mapping',
		'sync_on_login',
		'auto_create_users',
		'is_active',
		'logo_url',
		'button_text',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array
	 */
	protected $casts = [
		'user_mapping'       => 'array',
		'sync_on_login'      => 'boolean',
		'auto_create_users'  => 'boolean',
		'is_active'          => 'boolean',
		'created_at'         => 'datetime',
		'updated_at'         => 'datetime',
	];

	/**
	 * Provider type constants
	 */
	const TYPE_GOOGLE          = 'google';
	const TYPE_MICROSOFT       = 'microsoft';
	const TYPE_OKTA            = 'okta';
	const TYPE_AUTH0           = 'auth0';
	const TYPE_GENERIC_OIDC    = 'generic_oidc';
	const TYPE_SAML            = 'saml';

	/**
	 * Scope: Only active providers
	 *
	 * @param \Illuminate\Database\Eloquent\Builder $query Query builder.
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function scopeActive( $query ) {
		return $query->where( 'is_active', 1 );
	}

	/**
	 * Scope: By provider type
	 *
	 * @param \Illuminate\Database\Eloquent\Builder $query Query builder.
	 * @param string                                $type  Provider type.
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function scopeOfType( $query, string $type ) {
		return $query->where( 'provider_type', $type );
	}

	/**
	 * Get available provider types
	 *
	 * @return array
	 */
	public static function getProviderTypes(): array {
		return [
			self::TYPE_GOOGLE       => __( 'Google Workspace', 'frs-users' ),
			self::TYPE_MICROSOFT    => __( 'Microsoft Azure AD', 'frs-users' ),
			self::TYPE_OKTA         => __( 'Okta', 'frs-users' ),
			self::TYPE_AUTH0        => __( 'Auth0', 'frs-users' ),
			self::TYPE_GENERIC_OIDC => __( 'Generic OpenID Connect', 'frs-users' ),
			self::TYPE_SAML         => __( 'SAML 2.0', 'frs-users' ),
		];
	}

	/**
	 * Get default user mapping for provider type
	 *
	 * @param string $type Provider type.
	 * @return array
	 */
	public static function getDefaultMapping( string $type ): array {
		$mappings = [
			self::TYPE_GOOGLE    => [
				'email'      => 'email',
				'first_name' => 'given_name',
				'last_name'  => 'family_name',
				'avatar'     => 'picture',
			],
			self::TYPE_MICROSOFT => [
				'email'      => 'mail',
				'first_name' => 'givenName',
				'last_name'  => 'surname',
				'avatar'     => 'photo',
			],
		];

		return $mappings[ $type ] ?? [
			'email'      => 'email',
			'first_name' => 'given_name',
			'last_name'  => 'family_name',
		];
	}
}
