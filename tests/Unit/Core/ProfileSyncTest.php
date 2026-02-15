<?php
/**
 * Unit tests for ProfileSync class.
 *
 * @package FRSUsers\Tests\Unit\Core
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Unit\Core;

use FRSUsers\Tests\Unit\TestCase;
use FRSUsers\Core\ProfileSync;
use Brain\Monkey\Functions;
use Mockery;

/**
 * Test cases for the ProfileSync class.
 */
class ProfileSyncTest extends TestCase {

    /**
     * Test verify_webhook_signature returns error when no secret configured.
     */
    public function test_verify_signature_fails_without_secret(): void {
        Functions\expect( 'get_option' )
            ->with( 'frs_webhook_secret', '' )
            ->andReturn( '' );

        $request = Mockery::mock( 'WP_REST_Request' );

        $result = ProfileSync::verify_webhook_signature( $request );

        $this->assertInstanceOf( 'WP_Error', $result );
        $this->assertSame( 'webhook_not_configured', $result->get_error_code() );
    }

    /**
     * Test verify_webhook_signature returns error when signature missing.
     */
    public function test_verify_signature_fails_without_signature_header(): void {
        // Override the default get_option stub
        Functions\when( 'get_option' )->alias( function( $key, $default = false ) {
            if ( $key === 'frs_webhook_secret' ) {
                return 'test_secret_123';
            }
            return $default;
        });

        $request = Mockery::mock( 'WP_REST_Request' );
        $request->shouldReceive( 'get_header' )
            ->with( 'X-FRS-Signature' )
            ->andReturn( null );

        $result = ProfileSync::verify_webhook_signature( $request );

        $this->assertInstanceOf( 'WP_Error', $result );
        $this->assertSame( 'missing_signature', $result->get_error_code() );
    }

    /**
     * Test verify_webhook_signature returns error for invalid signature.
     */
    public function test_verify_signature_fails_with_invalid_signature(): void {
        $secret = 'test_secret_123';
        $body = '{"event":"profile_updated"}';

        Functions\when( 'get_option' )->alias( function( $key, $default = false ) use ( $secret ) {
            if ( $key === 'frs_webhook_secret' ) {
                return $secret;
            }
            return $default;
        });

        $request = Mockery::mock( 'WP_REST_Request' );
        $request->shouldReceive( 'get_header' )
            ->with( 'X-FRS-Signature' )
            ->andReturn( 'invalid_signature' );
        $request->shouldReceive( 'get_body' )
            ->andReturn( $body );

        $result = ProfileSync::verify_webhook_signature( $request );

        $this->assertInstanceOf( 'WP_Error', $result );
        $this->assertSame( 'invalid_signature', $result->get_error_code() );
    }

    /**
     * Test verify_webhook_signature returns true for valid signature.
     */
    public function test_verify_signature_succeeds_with_valid_signature(): void {
        $secret = 'test_secret_123';
        $body = '{"event":"profile_updated"}';
        $valid_signature = hash_hmac( 'sha256', $body, $secret );

        Functions\when( 'get_option' )->alias( function( $key, $default = false ) use ( $secret ) {
            if ( $key === 'frs_webhook_secret' ) {
                return $secret;
            }
            return $default;
        });

        $request = Mockery::mock( 'WP_REST_Request' );
        $request->shouldReceive( 'get_header' )
            ->with( 'X-FRS-Signature' )
            ->andReturn( $valid_signature );
        $request->shouldReceive( 'get_body' )
            ->andReturn( $body );

        $result = ProfileSync::verify_webhook_signature( $request );

        $this->assertTrue( $result );
    }

    /**
     * Test handle_webhook returns error for invalid payload.
     */
    public function test_handle_webhook_fails_with_missing_event(): void {
        $request = Mockery::mock( 'WP_REST_Request' );
        $request->shouldReceive( 'get_json_params' )
            ->andReturn( [] );

        $result = ProfileSync::handle_webhook( $request );

        $this->assertInstanceOf( 'WP_Error', $result );
        $this->assertSame( 'invalid_payload', $result->get_error_code() );
    }

    /**
     * Test handle_webhook returns error for unknown event.
     */
    public function test_handle_webhook_fails_with_unknown_event(): void {
        $request = Mockery::mock( 'WP_REST_Request' );
        $request->shouldReceive( 'get_json_params' )
            ->andReturn( [ 'event' => 'unknown_event' ] );

        $result = ProfileSync::handle_webhook( $request );

        $this->assertInstanceOf( 'WP_Error', $result );
        $this->assertSame( 'unknown_event', $result->get_error_code() );
    }

    /**
     * Test HMAC signature generation.
     */
    public function test_hmac_signature_generation(): void {
        $secret = 'my_webhook_secret';
        $payload = '{"event":"profile_updated","profile":{"id":1}}';

        $signature = hash_hmac( 'sha256', $payload, $secret );

        // Verify it's a 64-character hex string (SHA256).
        $this->assertSame( 64, strlen( $signature ) );
        $this->assertMatchesRegularExpression( '/^[a-f0-9]{64}$/', $signature );
    }

    /**
     * Test hash_equals prevents timing attacks.
     */
    public function test_hash_equals_comparison(): void {
        $secret = 'test_secret';
        $body = '{"test":"data"}';
        $valid_sig = hash_hmac( 'sha256', $body, $secret );

        // Valid comparison.
        $this->assertTrue( hash_equals( $valid_sig, $valid_sig ) );

        // Invalid comparison.
        $this->assertFalse( hash_equals( $valid_sig, 'wrong_signature' ) );

        // Close but not equal.
        $wrong_sig = hash_hmac( 'sha256', $body . 'x', $secret );
        $this->assertFalse( hash_equals( $valid_sig, $wrong_sig ) );
    }

    /**
     * Test signature is case sensitive.
     */
    public function test_signature_is_case_sensitive(): void {
        $secret = 'test_secret';
        $body = '{"test":"data"}';
        $signature = hash_hmac( 'sha256', $body, $secret );
        $upper_sig = strtoupper( $signature );

        // Signature should be lowercase hex.
        $this->assertNotEquals( $signature, $upper_sig );
        $this->assertFalse( hash_equals( $signature, $upper_sig ) );
    }

    /**
     * Test webhook payload structure.
     */
    public function test_webhook_payload_structure(): void {
        $payload = [
            'event'     => 'profile_updated',
            'timestamp' => time(),
            'profile'   => [
                'id'          => 123,
                'email'       => 'test@example.com',
                'first_name'  => 'Test',
                'last_name'   => 'User',
                'phone_number' => '555-123-4567',
            ],
        ];

        $this->assertArrayHasKey( 'event', $payload );
        $this->assertArrayHasKey( 'timestamp', $payload );
        $this->assertArrayHasKey( 'profile', $payload );
        $this->assertIsArray( $payload['profile'] );
    }
}

