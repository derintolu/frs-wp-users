<?php
/**
 * Base test case for unit tests.
 *
 * Uses Brain\Monkey to mock WordPress functions without loading WordPress.
 *
 * @package FRSUsers\Tests\Unit
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Unit;

use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

/**
 * Abstract base class for unit tests.
 */
abstract class TestCase extends PHPUnitTestCase {

    use MockeryPHPUnitIntegration;

    /**
     * Set up test fixtures.
     */
    protected function setUp(): void {
        parent::setUp();
        Monkey\setUp();

        // Mock common WordPress functions.
        $this->mock_common_wp_functions();
    }

    /**
     * Tear down test fixtures.
     */
    protected function tearDown(): void {
        Monkey\tearDown();
        parent::tearDown();
    }

    /**
     * Mock common WordPress functions used throughout the plugin.
     */
    protected function mock_common_wp_functions(): void {
        // Translation functions - return string as-is.
        Functions\stubs([
            '__'           => function ( $text, $domain = 'default' ) {
                return $text;
            },
            '_e'           => function ( $text, $domain = 'default' ) {
                echo $text;
            },
            '_n'           => function ( $single, $plural, $number, $domain = 'default' ) {
                return $number === 1 ? $single : $plural;
            },
            'esc_html'     => function ( $text ) {
                return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
            },
            'esc_html__'   => function ( $text, $domain = 'default' ) {
                return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
            },
            'esc_attr'     => function ( $text ) {
                return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
            },
            'esc_attr__'   => function ( $text, $domain = 'default' ) {
                return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
            },
            'esc_url'      => function ( $url ) {
                return filter_var( $url, FILTER_SANITIZE_URL );
            },
            'wp_kses_post' => function ( $text ) {
                return $text;
            },
            'sanitize_text_field' => function ( $str ) {
                return trim( strip_tags( $str ) );
            },
            'sanitize_email' => function ( $email ) {
                return filter_var( $email, FILTER_SANITIZE_EMAIL );
            },
            'absint'       => function ( $maybeint ) {
                return abs( (int) $maybeint );
            },
        ]);

        // Hook functions - do nothing by default.
        Functions\stubs([
            'add_action'      => null,
            'add_filter'      => null,
            'do_action'       => null,
            'apply_filters'   => function ( $hook, $value, ...$args ) {
                return $value;
            },
            'has_action'      => false,
            'has_filter'      => false,
            'remove_action'   => true,
            'remove_filter'   => true,
        ]);

        // Option functions.
        Functions\stubs([
            'get_option'    => function ( $option, $default = false ) {
                return $default;
            },
            'update_option' => true,
            'delete_option' => true,
        ]);

        // User functions.
        Functions\stubs([
            'get_current_user_id' => 0,
            'is_user_logged_in'   => false,
            'current_user_can'    => false,
            'wp_get_current_user' => function () {
                return (object) [ 'ID' => 0 ];
            },
        ]);

        // Path/URL functions.
        Functions\stubs([
            'plugin_dir_path' => function ( $file ) {
                return dirname( $file ) . '/';
            },
            'plugin_dir_url'  => function ( $file ) {
                return 'https://example.com/wp-content/plugins/' . basename( dirname( $file ) ) . '/';
            },
            'plugins_url'     => function ( $path = '', $plugin = '' ) {
                return 'https://example.com/wp-content/plugins/' . ltrim( $path, '/' );
            },
            'home_url'        => function ( $path = '' ) {
                return 'https://example.com' . $path;
            },
            'rest_url'        => function ( $path = '' ) {
                return 'https://example.com/wp-json/' . ltrim( $path, '/' );
            },
            'admin_url'       => function ( $path = '' ) {
                return 'https://example.com/wp-admin/' . ltrim( $path, '/' );
            },
        ]);

        // Nonce functions.
        Functions\stubs([
            'wp_create_nonce'  => 'test_nonce_12345',
            'wp_verify_nonce'  => 1,
            'check_ajax_referer' => true,
        ]);

        // JSON functions.
        Functions\stubs([
            'wp_json_encode' => function ( $data, $flags = 0 ) {
                return json_encode( $data, $flags );
            },
        ]);

        // Error handling.
        Functions\when( 'is_wp_error' )->alias( function ( $thing ) {
            return $thing instanceof \WP_Error;
        });
    }

    /**
     * Create a mock WP_User object.
     *
     * @param array $args User data.
     * @return object Mock user object.
     */
    protected function create_mock_user( array $args = [] ): object {
        $defaults = [
            'ID'            => 1,
            'user_login'    => 'testuser',
            'user_email'    => 'test@example.com',
            'user_nicename' => 'testuser',
            'display_name'  => 'Test User',
            'first_name'    => 'Test',
            'last_name'     => 'User',
            'roles'         => [ 'loan_officer' ],
        ];

        return (object) array_merge( $defaults, $args );
    }

    /**
     * Create mock profile data.
     *
     * @param array $args Profile data overrides.
     * @return array Profile data array.
     */
    protected function create_mock_profile_data( array $args = [] ): array {
        $defaults = [
            'id'              => 1,
            'user_id'         => 1,
            'email'           => 'john.doe@example.com',
            'first_name'      => 'John',
            'last_name'       => 'Doe',
            'display_name'    => 'John Doe',
            'phone_number'    => '555-123-4567',
            'mobile_number'   => '555-987-6543',
            'job_title'       => 'Senior Loan Officer',
            'nmls'            => '123456',
            'city_state'      => 'Los Angeles, CA',
            'biography'       => 'Experienced loan officer with 10+ years in the industry.',
            'profile_slug'    => 'john-doe',
            'is_active'       => true,
            'company_role'    => [ 'loan_originator' ],
            'service_areas'   => [ 'CA', 'NV', 'AZ' ],
            'specialties_lo'  => [ 'Residential Mortgages', 'VA Loans' ],
            'facebook_url'    => 'https://facebook.com/johndoe',
            'linkedin_url'    => 'https://linkedin.com/in/johndoe',
            'custom_links'    => [
                [ 'title' => 'My Website', 'url' => 'https://johndoe.com' ],
            ],
        ];

        return array_merge( $defaults, $args );
    }
}
