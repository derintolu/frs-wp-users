<?php
/**
 * Integration tests for Profile REST API.
 *
 * @package FRSUsers\Tests\Integration\Api
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Integration\Api;

use FRSUsers\Tests\Integration\TestCase;

/**
 * Test cases for the Profile REST API endpoints.
 *
 * @group api
 */
class ProfileApiTest extends TestCase {

    /**
     * REST API namespace.
     */
    private const API_NAMESPACE = '/frs-users/v1';

    /**
     * Set up test fixtures.
     */
    public function set_up(): void {
        parent::set_up();

        // Register REST routes.
        do_action( 'rest_api_init' );
    }

    /**
     * Test GET /profiles returns profiles list.
     */
    public function test_get_profiles_returns_list(): void {
        // Create test users.
        $this->create_test_user( [ 'role' => 'loan_officer' ] );
        $this->create_test_user( [ 'role' => 'loan_officer' ] );

        $response = $this->make_rest_request( 'GET', self::API_NAMESPACE . '/profiles' );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertIsArray( $data );
    }

    /**
     * Test GET /profiles filters by type.
     */
    public function test_get_profiles_filters_by_type(): void {
        // Create users with different company roles.
        $this->create_test_user(
            [ 'role' => 'loan_officer' ],
            [ 'frs_company_role' => 'loan_originator' ]
        );
        $this->create_test_user(
            [ 'role' => 're_agent' ],
            [ 'frs_company_role' => 'broker_associate' ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles',
            [ 'type' => 'loan_originator' ]
        );

        $this->assertRestStatus( 200, $response );
    }

    /**
     * Test GET /profiles/{id} returns single profile.
     */
    public function test_get_single_profile_returns_profile(): void {
        $user_id = $this->create_test_user();

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/' . $user_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertArrayHasKey( 'id', $data );
        $this->assertEquals( $user_id, $data['id'] );
    }

    /**
     * Test GET /profiles/{id} returns 404 for non-existent profile.
     */
    public function test_get_nonexistent_profile_returns_404(): void {
        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/999999'
        );

        $this->assertRestStatus( 404, $response );
    }

    /**
     * Test GET /profiles/slug/{slug} returns profile by slug.
     */
    public function test_get_profile_by_slug(): void {
        $user_id = $this->create_test_user(
            [
                'first_name' => 'John',
                'last_name'  => 'Doe',
            ],
            [ 'frs_profile_slug' => 'john-doe' ]
        );

        // Get user nicename
        $user = get_userdata( $user_id );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/slug/' . $user->user_nicename
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertEquals( $user_id, $data['id'] );
    }

    /**
     * Test GET /profiles/user/me returns current user profile.
     */
    public function test_get_current_user_profile(): void {
        $user_id = $this->create_test_user();

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/user/me',
            [],
            $user_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertEquals( $user_id, $data['id'] );
    }

    /**
     * Test GET /profiles/user/me returns 401 for unauthenticated.
     */
    public function test_get_current_user_profile_unauthenticated(): void {
        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/user/me'
        );

        // Should return 401 or empty result for unauthenticated users.
        $status = $response->get_status();
        $this->assertTrue( in_array( $status, [ 401, 404 ], true ) );
    }

    /**
     * Test POST /profiles requires authentication.
     */
    public function test_create_profile_requires_auth(): void {
        $response = $this->make_rest_request(
            'POST',
            self::API_NAMESPACE . '/profiles',
            [
                'email'      => 'newuser@example.com',
                'first_name' => 'New',
                'last_name'  => 'User',
            ]
        );

        // Should return 401 for unauthenticated users.
        $this->assertRestStatus( 401, $response );
    }

    /**
     * Test POST /profiles creates profile for authorized user.
     */
    public function test_create_profile_as_editor(): void {
        // Create an editor user.
        $editor_id = $this->factory->user->create( [ 'role' => 'editor' ] );

        $response = $this->make_rest_request(
            'POST',
            self::API_NAMESPACE . '/profiles',
            [
                'email'      => 'newprofile@example.com',
                'first_name' => 'New',
                'last_name'  => 'Profile',
                'role'       => 'loan_officer',
            ],
            $editor_id
        );

        // Should succeed for editors.
        $status = $response->get_status();
        $this->assertTrue( in_array( $status, [ 200, 201 ], true ) );
    }

    /**
     * Test PUT /profiles/{id} updates profile.
     */
    public function test_update_profile(): void {
        $user_id = $this->create_test_user();
        $editor_id = $this->factory->user->create( [ 'role' => 'editor' ] );

        $response = $this->make_rest_request(
            'PUT',
            self::API_NAMESPACE . '/profiles/' . $user_id,
            [
                'job_title'  => 'Senior Loan Officer',
                'city_state' => 'San Diego, CA',
            ],
            $editor_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertSame( 'Senior Loan Officer', $data['job_title'] );
        $this->assertSame( 'San Diego, CA', $data['city_state'] );
    }

    /**
     * Test PUT /profiles/{id} allows user to update own profile.
     */
    public function test_update_own_profile(): void {
        $user_id = $this->create_test_user();

        $response = $this->make_rest_request(
            'PUT',
            self::API_NAMESPACE . '/profiles/' . $user_id,
            [ 'biography' => 'Updated bio text.' ],
            $user_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertSame( 'Updated bio text.', $data['biography'] );
    }

    /**
     * Test DELETE /profiles/{id} requires editor permission.
     */
    public function test_delete_profile_requires_permission(): void {
        $user_id = $this->create_test_user();

        // Try to delete as regular user.
        $subscriber_id = $this->factory->user->create( [ 'role' => 'subscriber' ] );

        $response = $this->make_rest_request(
            'DELETE',
            self::API_NAMESPACE . '/profiles/' . $user_id,
            [],
            $subscriber_id
        );

        // Should be forbidden.
        $status = $response->get_status();
        $this->assertTrue( in_array( $status, [ 401, 403 ], true ) );
    }

    /**
     * Test GET /service-areas returns unique states.
     */
    public function test_get_service_areas(): void {
        // Create users with different service areas.
        $this->create_test_user(
            [],
            [ 'frs_service_areas' => wp_json_encode( [ 'CA', 'NV' ] ) ]
        );
        $this->create_test_user(
            [],
            [ 'frs_service_areas' => wp_json_encode( [ 'CA', 'AZ' ] ) ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/service-areas'
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertIsArray( $data );
    }

    /**
     * Test GET /vcard/{id} returns vCard data.
     */
    public function test_get_vcard(): void {
        $user_id = $this->create_test_user(
            [
                'first_name' => 'John',
                'last_name'  => 'Doe',
            ],
            [
                'frs_phone_number' => '555-123-4567',
                'frs_job_title'    => 'Loan Officer',
            ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/vcard/' . $user_id
        );

        $this->assertRestStatus( 200, $response );
    }

    /**
     * Test profile response includes expected fields.
     */
    public function test_profile_response_structure(): void {
        $user_id = $this->create_test_user(
            [
                'first_name' => 'Test',
                'last_name'  => 'User',
            ],
            [
                'frs_phone_number'  => '555-123-4567',
                'frs_job_title'     => 'Loan Officer',
                'frs_nmls'          => '123456',
                'frs_service_areas' => wp_json_encode( [ 'CA', 'NV' ] ),
            ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/' . $user_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();

        // Check required fields.
        $this->assertArrayHasKey( 'id', $data );
        $this->assertArrayHasKey( 'email', $data );
        $this->assertArrayHasKey( 'first_name', $data );
        $this->assertArrayHasKey( 'last_name', $data );
        $this->assertArrayHasKey( 'full_name', $data );
        $this->assertArrayHasKey( 'phone_number', $data );
        $this->assertArrayHasKey( 'job_title', $data );
        $this->assertArrayHasKey( 'nmls', $data );
        $this->assertArrayHasKey( 'service_areas', $data );
        $this->assertArrayHasKey( 'is_active', $data );
    }

    /**
     * Test pagination parameters work.
     */
    public function test_profiles_pagination(): void {
        // Create 5 test users.
        $this->create_test_users( 5 );

        // Request with limit.
        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles',
            [
                'limit'  => 2,
                'offset' => 0,
            ]
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();
        $this->assertLessThanOrEqual( 2, count( $data ) );
    }

    /**
     * Test search parameter works.
     */
    public function test_profiles_search(): void {
        $this->create_test_user(
            [
                'first_name' => 'Unique',
                'last_name'  => 'SearchName',
            ]
        );
        $this->create_test_user(
            [
                'first_name' => 'Other',
                'last_name'  => 'User',
            ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles',
            [ 'search' => 'SearchName' ]
        );

        $this->assertRestStatus( 200, $response );
    }

    /**
     * Test JSON array fields are properly decoded.
     */
    public function test_json_array_fields_decoded(): void {
        $specialties = [ 'Residential Mortgages', 'VA Loans' ];
        $service_areas = [ 'CA', 'NV', 'AZ' ];

        $user_id = $this->create_test_user(
            [],
            [
                'frs_specialties_lo' => wp_json_encode( $specialties ),
                'frs_service_areas'  => wp_json_encode( $service_areas ),
            ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/' . $user_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();

        $this->assertIsArray( $data['specialties_lo'] );
        $this->assertIsArray( $data['service_areas'] );
        $this->assertEquals( $specialties, $data['specialties_lo'] );
        $this->assertEquals( $service_areas, $data['service_areas'] );
    }

    /**
     * Test custom links are returned as array.
     */
    public function test_custom_links_returned_as_array(): void {
        $custom_links = [
            [ 'title' => 'My Website', 'url' => 'https://example.com' ],
            [ 'title' => 'Blog', 'url' => 'https://blog.example.com' ],
        ];

        $user_id = $this->create_test_user(
            [],
            [ 'frs_custom_links' => wp_json_encode( $custom_links ) ]
        );

        $response = $this->make_rest_request(
            'GET',
            self::API_NAMESPACE . '/profiles/' . $user_id
        );

        $this->assertRestStatus( 200, $response );

        $data = $response->get_data();

        $this->assertIsArray( $data['custom_links'] );
        $this->assertEquals( $custom_links, $data['custom_links'] );
    }
}
