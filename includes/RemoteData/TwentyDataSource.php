<?php
/**
 * Twenty CRM Data Source
 *
 * Fetches profile data from Twenty CRM's REST API for marketing sites.
 *
 * @package FRSUsers
 * @subpackage RemoteData
 * @since 4.1.0
 */

namespace FRSUsers\RemoteData;

/**
 * Class TwentyDataSource
 *
 * Handles fetching and caching of data from Twenty CRM REST API.
 */
class TwentyDataSource {

	/**
	 * Twenty CRM API URL.
	 *
	 * @var string
	 */
	private string $api_url;

	/**
	 * Twenty CRM API key.
	 *
	 * @var string
	 */
	private string $api_key;

	/**
	 * Cache TTL in seconds.
	 *
	 * @var int
	 */
	private int $cache_ttl;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->api_url   = rtrim( get_option( 'frs_twenty_crm_url', 'https://20.frs.works' ), '/' );
		$this->api_key   = get_option( 'frs_twenty_crm_api_key', '' );
		$this->cache_ttl = (int) get_option( 'frs_remote_cache_ttl', 3600 );
	}

	/**
	 * Check if remote data is configured and available.
	 *
	 * @return bool
	 */
	public function is_available(): bool {
		return ! empty( $this->api_url ) && ! empty( $this->api_key );
	}

	/**
	 * GET /rest/people with filters, cursor pagination, caching.
	 *
	 * Twenty CRM max limit is 60 per request.
	 *
	 * @param array $args Supports: limit, cursor, filter (array), orderBy.
	 * @return array ['data' => array of people, 'cursor' => next cursor or null]
	 */
	public function get_people( array $args = [] ): array {
		$limit        = min( $args['limit'] ?? 60, 60 );
		$query_params = array( 'limit' => $limit );

		if ( ! empty( $args['cursor'] ) ) {
			$query_params['after'] = $args['cursor'];
		}
		if ( ! empty( $args['filter'] ) ) {
			foreach ( $args['filter'] as $key => $value ) {
				$query_params[ "filter[{$key}][eq]" ] = $value;
			}
		}
		if ( ! empty( $args['orderBy'] ) ) {
			$query_params['orderBy'] = $args['orderBy'];
		}

		$cache_key = 'frs_twenty_people_' . md5( wp_json_encode( $query_params ) );
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$url      = $this->api_url . '/rest/people?' . http_build_query( $query_params );
		$response = wp_remote_get(
			$url,
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $this->api_key,
					'Content-Type'  => 'application/json',
				),
				'timeout' => 30,
			)
		);

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			// Return stale cache if available.
			$stale = get_option( $cache_key . '_stale' );
			return $stale ?: array(
				'data'   => array(),
				'cursor' => null,
			);
		}

		$body   = json_decode( wp_remote_retrieve_body( $response ), true );
		$result = array(
			'data'   => $body['data']['people'] ?? array(),
			'cursor' => $body['data']['pageInfo']['endCursor'] ?? null,
		);

		set_transient( $cache_key, $result, $this->cache_ttl );
		update_option( $cache_key . '_stale', $result, false ); // Stale fallback, no autoload.

		return $result;
	}

	/**
	 * Fetch ALL people (handles pagination internally).
	 *
	 * Safety limit: max 600 people (10 pages x 60).
	 *
	 * @param array $args Same as get_people().
	 * @return array All people records.
	 */
	public function get_all_people( array $args = [] ): array {
		$all       = array();
		$cursor    = null;
		$max_pages = 10; // Safety: max 600 people.
		$page      = 0;

		do {
			$args['cursor'] = $cursor;
			$result         = $this->get_people( $args );
			$all            = array_merge( $all, $result['data'] );
			$cursor         = $result['cursor'];
			$page++;
		} while ( $cursor && $page < $max_pages );

		return $all;
	}

	/**
	 * GET /rest/people/{id} with caching.
	 *
	 * @param string $twenty_id Twenty CRM person ID.
	 * @return array|null Person data or null if not found.
	 */
	public function get_person( string $twenty_id ): ?array {
		$cache_key = 'frs_twenty_person_' . $twenty_id;
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$url      = $this->api_url . '/rest/people/' . urlencode( $twenty_id );
		$response = wp_remote_get(
			$url,
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $this->api_key,
					'Content-Type'  => 'application/json',
				),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			$stale = get_option( $cache_key . '_stale' );
			return $stale ?: null;
		}

		$body   = json_decode( wp_remote_retrieve_body( $response ), true );
		$person = $body['data'] ?? null;

		if ( $person ) {
			set_transient( $cache_key, $person, 1800 ); // 30 min.
			update_option( $cache_key . '_stale', $person, false );
		}

		return $person;
	}

	/**
	 * Search by name or email.
	 *
	 * @param string $query Search query (email or name).
	 * @return array Matching people records.
	 */
	public function search_people( string $query ): array {
		// Twenty CRM doesn't have a built-in search -- use filter on email or name.
		// Try email first.
		if ( filter_var( $query, FILTER_VALIDATE_EMAIL ) ) {
			return $this->get_people( array( 'filter' => array( 'emails.primaryEmail' => $query ) ) )['data'];
		}
		// For name search, fetch all and filter client-side (Twenty doesn't support LIKE).
		$all = $this->get_all_people();
		$q   = strtolower( $query );
		return array_filter(
			$all,
			function ( $p ) use ( $q ) {
				$name = strtolower( ( $p['name']['firstName'] ?? '' ) . ' ' . ( $p['name']['lastName'] ?? '' ) );
				return strpos( $name, $q ) !== false;
			}
		);
	}

	/**
	 * Invalidate cache for a specific person or all people listings.
	 *
	 * @param string|null $twenty_id Optional specific person ID to invalidate.
	 * @return void
	 */
	public function invalidate_cache( ?string $twenty_id = null ): void {
		if ( $twenty_id ) {
			delete_transient( 'frs_twenty_person_' . $twenty_id );
		}
		// Invalidate all people listing caches by deleting transients with our prefix.
		global $wpdb;
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_frs_twenty_people_%' OR option_name LIKE '_transient_timeout_frs_twenty_people_%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	}

	/**
	 * Map Twenty CRM person to FRS profile format.
	 *
	 * @param array $person Twenty CRM person data.
	 * @return array Profile data in FRS format.
	 */
	public static function to_profile_array( array $person ): array {
		$status_value = $person['status'] ?? '';
		return array(
			'id'              => $person['id'] ?? '',
			'twenty_crm_id'   => $person['id'] ?? '',
			'user_id'         => 0, // No local user.
			'first_name'      => $person['name']['firstName'] ?? '',
			'last_name'       => $person['name']['lastName'] ?? '',
			'display_name'    => $person['displayName'] ?? trim( ( $person['name']['firstName'] ?? '' ) . ' ' . ( $person['name']['lastName'] ?? '' ) ),
			'email'           => $person['emails']['primaryEmail'] ?? '',
			'phone_number'    => $person['phones']['primaryPhoneNumber'] ?? '',
			'job_title'       => $person['jobTitle'] ?? '',
			'avatar_url'      => $person['avatarUrl'] ?? '',
			'headshot_url'    => $person['headshotUrl'] ?? $person['avatarUrl'] ?? '',
			'linkedin_url'    => $person['linkedinLink']['primaryLinkUrl'] ?? '',
			'twitter_url'     => $person['xLink']['primaryLinkUrl'] ?? '',
			'nmls'            => $person['nmlsNumber'] ?? '',
			'license_number'  => $person['licenseNumber'] ?? '',
			'biography'       => $person['biography']['markdown'] ?? '',
			'company_roles'   => $person['personRoles'] ?? array(),
			'is_active'       => ( strtoupper( $status_value ) === 'ACTIVE' ) ? 1 : 0,
			'specialties'     => $person['specialties'] ?? array(),
			'service_areas'   => $person['serviceAreas'] ?? array(),
			'city_state'      => $person['city'] ?? '',
			'profile_slug'    => sanitize_title( ( $person['name']['firstName'] ?? '' ) . '-' . ( $person['name']['lastName'] ?? '' ) ),
			'qr_code_data'    => '',
			'mobile_number'   => '',
			'facebook_url'    => $person['facebookUrl'] ?? '',
			'instagram_url'   => $person['instagramUrl'] ?? '',
			'custom_links'    => array(),
		);
	}
}
