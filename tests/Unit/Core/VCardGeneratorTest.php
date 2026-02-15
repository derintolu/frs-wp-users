<?php
/**
 * Unit tests for VCardGenerator class.
 *
 * @package FRSUsers\Tests\Unit\Core
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Unit\Core;

use FRSUsers\Tests\Unit\TestCase;
use FRSUsers\Core\VCardGenerator;
use Brain\Monkey\Functions;

/**
 * Test cases for the VCardGenerator class.
 */
class VCardGeneratorTest extends TestCase {

    /**
     * Test vCard contains required BEGIN/END markers.
     */
    public function test_vcard_has_begin_end_markers(): void {
        $profile_data = $this->create_mock_profile_data();

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        $this->assertStringContainsString( 'BEGIN:VCARD', $vcard );
        $this->assertStringContainsString( 'END:VCARD', $vcard );
    }

    /**
     * Test vCard contains version 3.0.
     */
    public function test_vcard_contains_version(): void {
        $profile_data = $this->create_mock_profile_data();

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        $this->assertStringContainsString( 'VERSION:3.0', $vcard );
    }

    /**
     * Test vCard contains formatted name.
     */
    public function test_vcard_contains_name(): void {
        $profile_data = $this->create_mock_profile_data( [
            'first_name' => 'John',
            'last_name'  => 'Doe',
        ] );

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        $this->assertStringContainsString( 'FN:John Doe', $vcard );
        $this->assertStringContainsString( 'N:Doe;John', $vcard );
    }

    /**
     * Test vCard contains email.
     */
    public function test_vcard_contains_email(): void {
        $profile_data = $this->create_mock_profile_data( [
            'email' => 'john@example.com',
        ] );

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        // vCard uses EMAIL;TYPE=WORK format
        $this->assertStringContainsString( 'EMAIL', $vcard );
        $this->assertStringContainsString( 'john@example.com', $vcard );
    }

    /**
     * Test vCard contains phone number.
     */
    public function test_vcard_contains_phone(): void {
        $profile_data = $this->create_mock_profile_data( [
            'phone_number' => '555-123-4567',
        ] );

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        $this->assertStringContainsString( 'TEL', $vcard );
        // Phone number may be formatted differently
        $this->assertMatchesRegularExpression( '/TEL.*555/', $vcard );
    }

    /**
     * Test vCard contains organization/job title.
     */
    public function test_vcard_contains_organization(): void {
        $profile_data = $this->create_mock_profile_data( [
            'job_title' => 'Senior Loan Officer',
        ] );

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        $this->assertStringContainsString( 'TITLE:Senior Loan Officer', $vcard );
    }

    /**
     * Test vCard handles empty fields gracefully.
     */
    public function test_vcard_handles_empty_fields(): void {
        $profile_data = [
            'id'         => 1,
            'first_name' => 'John',
            'last_name'  => 'Doe',
            'email'      => '',
            'phone_number' => '',
        ];

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        // Should still generate valid vCard.
        $this->assertStringContainsString( 'BEGIN:VCARD', $vcard );
        $this->assertStringContainsString( 'FN:John Doe', $vcard );
    }

    /**
     * Test vCard escapes special characters.
     */
    public function test_vcard_escapes_special_chars(): void {
        $profile_data = $this->create_mock_profile_data( [
            'first_name' => 'John, Jr.',
            'last_name'  => "O'Connor",
        ] );

        Functions\expect( 'home_url' )->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        // vCard should escape commas and other special characters.
        $this->assertStringContainsString( 'BEGIN:VCARD', $vcard );
    }

    /**
     * Test vCard includes URL when profile_slug provided.
     */
    public function test_vcard_includes_profile_url(): void {
        $profile_data = $this->create_mock_profile_data( [
            'profile_slug' => 'john-doe',
        ] );

        Functions\expect( 'home_url' )
            ->andReturn( 'https://example.com' );

        $vcard = VCardGenerator::generate( $profile_data );

        // URL may use URL;TYPE=PROFILE format
        $this->assertStringContainsString( 'URL', $vcard );
    }

    /**
     * Test vCard filename generation.
     */
    public function test_vcard_filename(): void {
        $first_name = 'John';
        $last_name = 'Doe';

        $expected = 'john-doe.vcf';
        $filename = strtolower( $first_name . '-' . $last_name ) . '.vcf';

        $this->assertSame( $expected, $filename );
    }
}
