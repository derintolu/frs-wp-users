<?php
/**
 * Base test case for integration tests.
 *
 * Extends WP_UnitTestCase to run tests with a real WordPress installation.
 *
 * @package FRSUsers\Tests\Integration
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Integration;

use WP_UnitTestCase;

/**
 * Abstract base class for integration tests.
 */
abstract class TestCase extends WP_UnitTestCase {

    /**
     * Set up test fixtures.
     */
    public function set_up(): void {
        parent::set_up();

        // Ensure plugin is loaded.
        if ( ! class_exists( '\FRSUsers\FRSUsers' ) ) {
            require_once FRS_USERS_PATH . 'frs-wp-users.php';
        }
    }

    /**
     * Tear down test fixtures.
     */
    public function tear_down(): void {
        parent::tear_down();
    }

    /**
     * Create a test user with FRS profile data.
     *
     * @param array $user_args     User arguments for wp_insert_user.
     * @param array $profile_meta  FRS profile meta to set.
     * @return int User ID.
     */
    protected function create_test_user( array $user_args = [], array $profile_meta = [] ): int {
        $defaults = [
            'user_login' => 'testuser_' . wp_generate_uuid4(),
            'user_email' => 'test_' . wp_generate_uuid4() . '@example.com',
            'user_pass'  => 'password123',
            'role'       => 'loan_officer',
            'first_name' => 'Test',
            'last_name'  => 'User',
        ];

        $user_id = wp_insert_user( array_merge( $defaults, $user_args ) );

        if ( is_wp_error( $user_id ) ) {
            $this->fail( 'Failed to create test user: ' . $user_id->get_error_message() );
        }

        // Set profile meta.
        $default_meta = [
            'frs_phone_number'   => '555-123-4567',
            'frs_job_title'      => 'Loan Officer',
            'frs_nmls'           => '123456',
            'frs_city_state'     => 'Los Angeles, CA',
            'frs_is_active'      => '1',
            'frs_profile_slug'   => sanitize_title( $defaults['first_name'] . '-' . $defaults['last_name'] ),
            'frs_service_areas'  => wp_json_encode( [ 'CA', 'NV' ] ),
            'frs_specialties_lo' => wp_json_encode( [ 'Residential Mortgages' ] ),
        ];

        foreach ( array_merge( $default_meta, $profile_meta ) as $key => $value ) {
            update_user_meta( $user_id, $key, $value );
        }

        return $user_id;
    }

    /**
     * Create multiple test users.
     *
     * @param int   $count Number of users to create.
     * @param array $args  Common arguments for all users.
     * @return array Array of user IDs.
     */
    protected function create_test_users( int $count, array $args = [] ): array {
        $user_ids = [];

        for ( $i = 1; $i <= $count; $i++ ) {
            $user_args = array_merge( $args, [
                'first_name' => 'Test' . $i,
                'last_name'  => 'User' . $i,
            ] );

            $user_ids[] = $this->create_test_user( $user_args );
        }

        return $user_ids;
    }

    /**
     * Make a REST API request.
     *
     * @param string $method   HTTP method.
     * @param string $route    API route (without /wp-json/ prefix).
     * @param array  $params   Request parameters.
     * @param int    $user_id  User ID to authenticate as (0 for anonymous).
     * @return WP_REST_Response|WP_Error Response object.
     */
    protected function make_rest_request( string $method, string $route, array $params = [], int $user_id = 0 ) {
        $request = new \WP_REST_Request( $method, $route );

        if ( ! empty( $params ) ) {
            if ( in_array( $method, [ 'POST', 'PUT', 'PATCH' ], true ) ) {
                $request->set_body_params( $params );
            } else {
                $request->set_query_params( $params );
            }
        }

        if ( $user_id > 0 ) {
            wp_set_current_user( $user_id );
        }

        return rest_do_request( $request );
    }

    /**
     * Assert that a REST response has a specific status code.
     *
     * @param int                         $expected Expected status code.
     * @param WP_REST_Response|WP_Error   $response Response object.
     * @param string                      $message  Optional message.
     */
    protected function assertRestStatus( int $expected, $response, string $message = '' ): void {
        if ( is_wp_error( $response ) ) {
            $this->fail( 'REST request returned error: ' . $response->get_error_message() );
        }

        $this->assertSame(
            $expected,
            $response->get_status(),
            $message ?: "Expected REST status {$expected}, got {$response->get_status()}"
        );
    }

    /**
     * Assert that a REST response contains expected data keys.
     *
     * @param array            $keys     Expected keys.
     * @param WP_REST_Response $response Response object.
     */
    protected function assertRestDataHasKeys( array $keys, $response ): void {
        $data = $response->get_data();

        foreach ( $keys as $key ) {
            $this->assertArrayHasKey( $key, $data, "Response missing expected key: {$key}" );
        }
    }
}
