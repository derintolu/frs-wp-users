<?php
/**
 * OpenID Connect Integration
 *
 * Integrates frs-wp-users profile data with OpenID Connect Server plugin
 * to provide SSO with rich user profile claims.
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Integrations;

use FRSUsers\Models\Profile;

defined( 'ABSPATH' ) || exit;

/**
 * Class OpenIDConnect
 *
 * Adds frs-wp-users profile data to OpenID Connect user claims.
 *
 * @since 1.0.0
 */
class OpenIDConnect {

	/**
	 * Initialize OpenID Connect integration
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function init(): void {
		// Only run if OpenID Connect Server is active
		if ( ! self::is_oidc_server_active() ) {
			return;
		}

		// Add profile data to OpenID Connect claims
		add_filter( 'oidc_user_claims', [ self::class, 'add_profile_claims' ], 10, 2 );

		// Add custom scopes
		add_filter( 'oidc_scopes', [ self::class, 'add_custom_scopes' ] );
	}

	/**
	 * Check if OpenID Connect Server plugin is active
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	private static function is_oidc_server_active(): bool {
		return function_exists( 'openid_connect_server_instance' );
	}

	/**
	 * Add frs-wp-users profile data to OpenID Connect claims
	 *
	 * @since 1.0.0
	 * @param array    $claims User claims.
	 * @param \WP_User $user   WordPress user object.
	 * @return array Modified claims with profile data.
	 */
	public static function add_profile_claims( array $claims, \WP_User $user ): array {
		// Get profile for this user
		$profile = Profile::where( 'user_id', $user->ID )->first();

		if ( ! $profile ) {
			return $claims;
		}

		// Add basic profile fields (always included)
		$claims['profile_id']   = $profile->id;
		$claims['person_type']  = $profile->select_person_type ?? '';
		$claims['phone_number'] = $profile->phone_number ?? '';
		$claims['given_name']   = $profile->first_name ?? $user->first_name;
		$claims['family_name']  = $profile->last_name ?? $user->last_name;
		$claims['email']        = $profile->email ?? $user->user_email;

		// Get requested scopes
		$scopes = isset( $claims['scope'] ) ? explode( ' ', $claims['scope'] ) : [];

		// Add profile scope data
		if ( in_array( 'profile', $scopes, true ) || in_array( 'profile_full', $scopes, true ) ) {
			$claims['job_title']    = $profile->job_title ?? '';
			$claims['office']       = $profile->office ?? '';
			$claims['city_state']   = $profile->city_state ?? '';
			$claims['headshot_url'] = $profile->headshot_url ?? '';
		}

		// Add professional scope data
		if ( in_array( 'profile_professional', $scopes, true ) || in_array( 'profile_full', $scopes, true ) ) {
			$claims['nmls']           = $profile->nmls ?? '';
			$claims['license_number'] = $profile->license_number ?? '';
			$claims['dre_license']    = $profile->dre_license ?? '';
			$claims['specialties']    = json_decode( $profile->specialties_lo ?? '[]', true );
			$claims['languages']      = json_decode( $profile->languages ?? '[]', true );
		}

		// Add contact scope data
		if ( in_array( 'profile_contact', $scopes, true ) || in_array( 'profile_full', $scopes, true ) ) {
			$claims['mobile_number'] = $profile->mobile_number ?? '';
			$claims['facebook_url']  = $profile->facebook_url ?? '';
			$claims['instagram_url'] = $profile->instagram_url ?? '';
			$claims['linkedin_url']  = $profile->linkedin_url ?? '';
			$claims['twitter_url']   = $profile->twitter_url ?? '';
		}

		return $claims;
	}

	/**
	 * Add custom scopes for frs-wp-users profile data
	 *
	 * @since 1.0.0
	 * @param array $scopes Available scopes.
	 * @return array Modified scopes.
	 */
	public static function add_custom_scopes( array $scopes ): array {
		$scopes['profile_professional'] = [
			'name'        => __( 'Professional Profile', 'frs-users' ),
			'description' => __( 'Access to professional information (NMLS, licenses, specialties)', 'frs-users' ),
			'claims'      => [ 'nmls', 'license_number', 'dre_license', 'specialties', 'languages' ],
		];

		$scopes['profile_contact'] = [
			'name'        => __( 'Contact Information', 'frs-users' ),
			'description' => __( 'Access to contact details and social media profiles', 'frs-users' ),
			'claims'      => [ 'mobile_number', 'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url' ],
		];

		$scopes['profile_full'] = [
			'name'        => __( 'Full Profile', 'frs-users' ),
			'description' => __( 'Complete access to all profile information', 'frs-users' ),
			'claims'      => [ 'job_title', 'office', 'city_state', 'headshot_url', 'nmls', 'license_number', 'dre_license', 'specialties', 'languages', 'mobile_number', 'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url' ],
		];

		return $scopes;
	}
}
