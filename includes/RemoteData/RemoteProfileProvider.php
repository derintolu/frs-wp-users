<?php
/**
 * Remote Profile Provider
 *
 * Provides profile data from Twenty CRM for marketing sites
 * that don't maintain local user copies.
 *
 * @package FRSUsers
 * @subpackage RemoteData
 * @since 4.1.0
 */

namespace FRSUsers\RemoteData;

use FRSUsers\Core\Roles;

/**
 * Class RemoteProfileProvider
 *
 * Bridges Twenty CRM data into the FRS profile format for directory blocks.
 */
class RemoteProfileProvider {

	/**
	 * Twenty CRM data source.
	 *
	 * @var TwentyDataSource
	 */
	private TwentyDataSource $source;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->source = new TwentyDataSource();
	}

	/**
	 * Check if remote profiles should be used.
	 *
	 * Returns true on marketing sites with Twenty CRM configured.
	 * Hub/dev sites always use local data.
	 *
	 * @return bool
	 */
	public function should_use_remote(): bool {
		if ( Roles::is_profile_editing_enabled() ) {
			return false; // Hub/dev sites use local data.
		}
		return $this->source->is_available();
	}

	/**
	 * Get all profiles for directory listing, mapped to FRS format.
	 *
	 * @param string $type Optional company role type to filter by.
	 * @return array Profiles in FRS format, active only.
	 */
	public function get_directory_profiles( string $type = '' ): array {
		// Fetch all people (MULTI_SELECT filters don't work with eq operator).
		$people = $this->source->get_all_people();

		$profiles = array_map( array( TwentyDataSource::class, 'to_profile_array' ), $people );

		// Filter to active only.
		$profiles = array_filter( $profiles, fn( $p ) => $p['is_active'] );

		// Filter by company role type if specified.
		if ( $type ) {
			$profiles = array_filter( $profiles, fn( $p ) => in_array( $type, $p['company_roles'] ?? array(), true ) );
		}

		return array_values( $profiles );
	}

	/**
	 * Get a single profile by slug.
	 *
	 * @param string $slug Profile slug.
	 * @return array|null Profile data or null if not found.
	 */
	public function get_profile_by_slug( string $slug ): ?array {
		// Search all people and match by generated slug.
		$people = $this->source->get_all_people();
		foreach ( $people as $person ) {
			$profile = TwentyDataSource::to_profile_array( $person );
			if ( $profile['profile_slug'] === $slug ) {
				return $profile;
			}
		}
		return null;
	}

	/**
	 * Get a single profile by Twenty CRM ID.
	 *
	 * @param string $twenty_id Twenty CRM person ID.
	 * @return array|null Profile data or null if not found.
	 */
	public function get_profile_by_id( string $twenty_id ): ?array {
		$person = $this->source->get_person( $twenty_id );
		if ( ! $person ) {
			return null;
		}
		return TwentyDataSource::to_profile_array( $person );
	}

	/**
	 * Invalidate cache (called from webhook).
	 *
	 * @param string|null $twenty_id Optional specific person ID.
	 * @return void
	 */
	public function invalidate( ?string $twenty_id = null ): void {
		$this->source->invalidate_cache( $twenty_id );
	}
}
