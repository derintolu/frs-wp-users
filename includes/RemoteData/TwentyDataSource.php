<?php
/**
 * Twenty CRM Data Source
 *
 * Fetches profile data from Twenty CRM via GraphQL for marketing sites.
 *
 * @package FRSUsers
 * @subpackage RemoteData
 * @since 4.1.0
 */

namespace FRSUsers\RemoteData;

/**
 * Class TwentyDataSource
 *
 * Handles fetching and caching of data from Twenty CRM GraphQL API.
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
	 * GraphQL fields to fetch for people.
	 *
	 * @var string
	 */
	private const PERSON_FIELDS = 'id name { firstName lastName } emails { primaryEmail } phones { primaryPhoneNumber } jobTitle avatarUrl headshotUrl nmlsNumber licenseNumber biography { markdown } personRoles status specialties languages linkedinLink { primaryLinkUrl } xLink { primaryLinkUrl } serviceZipCodes city';

	/**
	 * WP role → Twenty CRM enum mapping.
	 *
	 * @var array
	 */
	private const WP_TO_TWENTY_ROLES = array(
		'loan_originator'  => 'MLO',
		'sales_associate'  => 'SALES_ASSOCIATE',
		'broker_associate' => 'BROKER_ASSOCIATE',
		'escrow_officer'   => 'ESCROW_OFFICER',
		'property_manager' => 'PROPERTY_MANAGER',
		'staff'            => 'STAFF',
		'leadership'       => 'LEADERSHIP',
		'admin_staff'      => 'ADMIN',
		'executive'        => 'REGIONAL_MANAGER',
	);

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->api_url   = rtrim( defined( 'FRS_TWENTY_CRM_URL' ) ? FRS_TWENTY_CRM_URL : 'https://data.c21frs.com', '/' );
		$this->api_key   = defined( 'FRS_TWENTY_CRM_API_KEY' ) ? FRS_TWENTY_CRM_API_KEY : '';
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
	 * Execute a GraphQL query against Twenty CRM.
	 *
	 * @param string $query GraphQL query string.
	 * @return array|null Decoded response data or null on error.
	 */
	private function graphql( string $query ): ?array {
		$response = wp_remote_post(
			$this->api_url . '/graphql',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $this->api_key,
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( array( 'query' => $query ) ),
				'timeout' => 30,
			)
		);

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return null;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! empty( $body['errors'] ) ) {
			return null;
		}

		return $body['data'] ?? null;
	}

	/**
	 * Fetch people by Twenty CRM role via GraphQL.
	 *
	 * Uses containsAny filter on personRoles MULTI_SELECT field.
	 * Handles cursor pagination, cached per role.
	 *
	 * @param string $twenty_role Twenty CRM role enum value (e.g. MLO, LEADERSHIP).
	 * @return array People records.
	 */
	public function get_people_by_role( string $twenty_role ): array {
		$cache_key = 'frs_twenty_role_' . strtolower( $twenty_role );
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$all       = array();
		$cursor    = null;
		$max_pages = 5; // 5 * 60 = 300 max per role.

		for ( $page = 0; $page < $max_pages; $page++ ) {
			$after = $cursor ? ', after: "' . $cursor . '"' : '';
			$query = '{ people(filter: { personRoles: { containsAny: [' . $twenty_role . '] } }, first: 60' . $after . ') { totalCount pageInfo { endCursor hasNextPage } edges { node { ' . self::PERSON_FIELDS . ' } } } }';

			$data = $this->graphql( $query );
			if ( ! $data || empty( $data['people']['edges'] ) ) {
				break;
			}

			foreach ( $data['people']['edges'] as $edge ) {
				$all[] = $edge['node'];
			}

			if ( empty( $data['people']['pageInfo']['hasNextPage'] ) ) {
				break;
			}
			$cursor = $data['people']['pageInfo']['endCursor'] ?? null;
			if ( ! $cursor ) {
				break;
			}
		}

		set_transient( $cache_key, $all, $this->cache_ttl );
		update_option( $cache_key . '_stale', $all, false );

		return $all;
	}

	/**
	 * Fetch people by WP company role name.
	 *
	 * Translates WP role to Twenty CRM enum and queries via GraphQL.
	 *
	 * @param string $wp_role WP company role (e.g. loan_originator, leadership).
	 * @return array People records.
	 */
	public function get_people_by_wp_role( string $wp_role ): array {
		$twenty_role = self::WP_TO_TWENTY_ROLES[ $wp_role ] ?? strtoupper( $wp_role );
		return $this->get_people_by_role( $twenty_role );
	}

	/**
	 * Fetch ALL people with any role set (employees only).
	 *
	 * Fetches each role separately and merges, deduplicating by ID.
	 *
	 * @return array All people records with roles.
	 */
	public function get_all_people(): array {
		$cache_key = 'frs_twenty_all_with_roles';
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$seen = array();
		$all  = array();

		foreach ( array_values( self::WP_TO_TWENTY_ROLES ) as $twenty_role ) {
			$people = $this->get_people_by_role( $twenty_role );
			foreach ( $people as $person ) {
				$id = $person['id'] ?? '';
				if ( $id && ! isset( $seen[ $id ] ) ) {
					$seen[ $id ] = true;
					$all[]       = $person;
				}
			}
		}

		set_transient( $cache_key, $all, $this->cache_ttl );
		update_option( $cache_key . '_stale', $all, false );

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

		$query = '{ person(id: "' . esc_attr( $twenty_id ) . '") { ' . self::PERSON_FIELDS . ' } }';
		$data  = $this->graphql( $query );

		if ( ! $data || empty( $data['person'] ) ) {
			$stale = get_option( $cache_key . '_stale' );
			return $stale ?: null;
		}

		$person = $data['person'];
		set_transient( $cache_key, $person, 1800 );
		update_option( $cache_key . '_stale', $person, false );

		return $person;
	}

	/**
	 * Search by name or email via GraphQL.
	 *
	 * @param string $query Search query (email or name).
	 * @return array Matching people records.
	 */
	public function search_people( string $query ): array {
		if ( filter_var( $query, FILTER_VALIDATE_EMAIL ) ) {
			$gql  = '{ people(filter: { emails: { primaryEmail: { eq: "' . esc_attr( $query ) . '" } } }, first: 10) { edges { node { ' . self::PERSON_FIELDS . ' } } } }';
			$data = $this->graphql( $gql );
			if ( ! $data || empty( $data['people']['edges'] ) ) {
				return array();
			}
			return array_map( fn( $e ) => $e['node'], $data['people']['edges'] );
		}

		// Name search: fetch all people with roles and filter client-side.
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
		// Invalidate all role-based and listing caches.
		global $wpdb;
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_frs_twenty_%' OR option_name LIKE '_transient_timeout_frs_twenty_%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	}

	/**
	 * Map Twenty CRM person to FRS profile format.
	 *
	 * @param array $person Twenty CRM person data.
	 * @return array Profile data in FRS format.
	 */
	public static function to_profile_array( array $person ): array {
		$status_value = $person['status'] ?? '';

		// Map Twenty CRM MULTI_SELECT values (uppercase) to WP lowercase.
		$role_map = array(
			'MLO'              => 'loan_originator',
			'SALES_ASSOCIATE'  => 'sales_associate',
			'BROKER_ASSOCIATE' => 'broker_associate',
			'ESCROW_OFFICER'   => 'escrow_officer',
			'PROPERTY_MANAGER' => 'property_manager',
			'STAFF'            => 'staff',
			'LEADERSHIP'       => 'leadership',
			'ADMIN'            => 'admin_staff',
			'REGIONAL_MANAGER' => 'executive',
			'LENDER_AE'        => 'loan_originator',
		);

		$twenty_roles = $person['personRoles'] ?? array();
		$wp_roles     = array();
		foreach ( $twenty_roles as $role ) {
			$wp_roles[] = $role_map[ $role ] ?? strtolower( $role );
		}

		// Extract specialties from MULTI_SELECT (uppercase enum values).
		$twenty_specialties = $person['specialties'] ?? array();
		$wp_specialties     = array_map( function ( $s ) {
			return ucwords( strtolower( str_replace( '_', ' ', $s ) ) );
		}, $twenty_specialties );

		$first = $person['name']['firstName'] ?? '';
		$last  = $person['name']['lastName'] ?? '';
		$full  = trim( $first . ' ' . $last );

		return array(
			'id'                   => $person['id'] ?? '',
			'twenty_crm_id'        => $person['id'] ?? '',
			'user_id'              => 0,
			'first_name'           => $first,
			'last_name'            => $last,
			'display_name'         => $full,
			'full_name'            => $full,
			'email'                => $person['emails']['primaryEmail'] ?? '',
			'phone_number'         => $person['phones']['primaryPhoneNumber'] ?? '',
			'mobile_number'        => '',
			'job_title'            => $person['jobTitle'] ?? '',
			'avatar_url'           => $person['avatarUrl'] ?? '',
			'headshot_url'         => $person['avatarUrl'] ?? '',
			'linkedin_url'         => self::extract_link_url( $person, 'linkedinLink' ),
			'twitter_url'          => self::extract_link_url( $person, 'xLink' ),
			'facebook_url'         => self::extract_link_url( $person, 'facebookUrl' ),
			'instagram_url'        => self::extract_link_url( $person, 'instagramUrl' ),
			'youtube_url'          => self::extract_link_url( $person, 'youtubeUrl' ),
			'nmls'                 => $person['nmlsNumber'] ?? '',
			'license_number'       => $person['licenseNumber'] ?? '',
			'biography'            => $person['biography']['markdown'] ?? '',
			'company_roles'        => $wp_roles,
			'is_active'            => ( strtoupper( $status_value ) === 'ACTIVE' ) ? 1 : 0,
			'specialties'          => $wp_specialties,
			'specialties_lo'       => $wp_specialties,
			'namb_certifications'  => array(),
			'languages'            => array_map( function ( $l ) {
				return ucwords( strtolower( str_replace( '_', ' ', $l ) ) );
			}, $person['languages'] ?? array() ),
			'service_areas'        => $person['serviceZipCodes'] ?? '',
			'city_state'           => $person['city'] ?? '',
			'profile_slug'         => sanitize_title( $first . '-' . $last ),
			'qr_code_data'         => '',
			'arrive'               => '',
			'apply_url'            => '',
			'website'              => '',
			'century21_url'        => self::extract_link_url( $person, 'century21Url' ),
			'zillow_url'           => self::extract_link_url( $person, 'zillowUrl' ),
			'realtor_url'          => self::extract_link_url( $person, 'realtorUrl' ),
			'custom_links'         => array(),
		);
	}

	/**
	 * Extract URL from a Twenty CRM LINKS field.
	 *
	 * @param array  $person Twenty CRM person data.
	 * @param string $field  Field name.
	 * @return string URL or empty string.
	 */
	private static function extract_link_url( array $person, string $field ): string {
		$value = $person[ $field ] ?? null;
		if ( is_array( $value ) && ! empty( $value['primaryLinkUrl'] ) ) {
			return $value['primaryLinkUrl'];
		}
		if ( is_string( $value ) && ! empty( $value ) ) {
			return $value;
		}
		return '';
	}
}
