<?php
/**
 * Unit tests for Profile model.
 *
 * @package FRSUsers\Tests\Unit\Models
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Unit\Models;

use FRSUsers\Tests\Unit\TestCase;
use FRSUsers\Models\Profile;

/**
 * Test cases for the Profile model.
 */
class ProfileTest extends TestCase {

    /**
     * Test that Profile class exists and has expected properties.
     */
    public function test_profile_has_expected_properties(): void {
        $profile = new Profile();

        $this->assertObjectHasProperty( 'id', $profile );
        $this->assertObjectHasProperty( 'user_id', $profile );
        $this->assertObjectHasProperty( 'email', $profile );
        $this->assertObjectHasProperty( 'first_name', $profile );
        $this->assertObjectHasProperty( 'last_name', $profile );
        $this->assertObjectHasProperty( 'display_name', $profile );
        $this->assertObjectHasProperty( 'phone_number', $profile );
        $this->assertObjectHasProperty( 'job_title', $profile );
        $this->assertObjectHasProperty( 'nmls', $profile );
        $this->assertObjectHasProperty( 'biography', $profile );
        $this->assertObjectHasProperty( 'profile_slug', $profile );
        $this->assertObjectHasProperty( 'service_areas', $profile );
        $this->assertObjectHasProperty( 'specialties_lo', $profile );
        $this->assertObjectHasProperty( 'is_active', $profile );
    }

    /**
     * Test that array properties default to empty arrays.
     */
    public function test_array_properties_default_to_empty_arrays(): void {
        $profile = new Profile();

        $this->assertIsArray( $profile->specialties_lo );
        $this->assertIsArray( $profile->specialties );
        $this->assertIsArray( $profile->service_areas );
        $this->assertIsArray( $profile->languages );
        $this->assertIsArray( $profile->awards );
        $this->assertIsArray( $profile->custom_links );
        $this->assertEmpty( $profile->specialties_lo );
        $this->assertEmpty( $profile->service_areas );
    }

    /**
     * Test is_active defaults to true.
     */
    public function test_is_active_defaults_to_true(): void {
        $profile = new Profile();

        $this->assertTrue( $profile->is_active );
    }

    /**
     * Test get_full_name returns combined first and last name.
     */
    public function test_get_full_name_returns_combined_name(): void {
        $profile = new Profile();
        $profile->first_name = 'John';
        $profile->last_name = 'Doe';

        $this->assertSame( 'John Doe', $profile->get_full_name() );
    }

    /**
     * Test get_full_name with whitespace in names.
     */
    public function test_get_full_name_with_whitespace(): void {
        $profile = new Profile();
        $profile->first_name = '  John  ';
        $profile->last_name = '  Doe  ';

        // The method just trims the concatenated result, not individual names
        $this->assertStringContainsString( 'John', $profile->get_full_name() );
        $this->assertStringContainsString( 'Doe', $profile->get_full_name() );
    }

    /**
     * Test get_full_name with only first name.
     */
    public function test_get_full_name_with_only_first_name(): void {
        $profile = new Profile();
        $profile->first_name = 'John';
        $profile->last_name = '';

        $this->assertSame( 'John', $profile->get_full_name() );
    }

    /**
     * Test magic getter for full_name.
     */
    public function test_magic_getter_for_full_name(): void {
        $profile = new Profile();
        $profile->first_name = 'Jane';
        $profile->last_name = 'Smith';

        $this->assertSame( 'Jane Smith', $profile->full_name );
    }

    /**
     * Test save returns false when no user_id.
     */
    public function test_save_returns_false_without_user_id(): void {
        $profile = new Profile();
        $profile->user_id = 0;

        $this->assertFalse( $profile->save() );
    }

    /**
     * Test parse_states_from_region identifies California regions.
     */
    public function test_parse_states_from_region_identifies_california(): void {
        $result = Profile::parse_states_from_region( 'Greater LA' );
        $this->assertContains( 'CA', $result );

        $result = Profile::parse_states_from_region( 'Orange County' );
        $this->assertContains( 'CA', $result );

        $result = Profile::parse_states_from_region( 'Bay Area' );
        $this->assertContains( 'CA', $result );

        $result = Profile::parse_states_from_region( 'Inland Empire' );
        $this->assertContains( 'CA', $result );
    }

    /**
     * Test parse_states_from_region identifies state names.
     */
    public function test_parse_states_from_region_identifies_state_names(): void {
        $result = Profile::parse_states_from_region( 'Arizona' );
        $this->assertContains( 'AZ', $result );

        $result = Profile::parse_states_from_region( 'Nevada' );
        $this->assertContains( 'NV', $result );

        $result = Profile::parse_states_from_region( 'Texas' );
        $this->assertContains( 'TX', $result );
    }

    /**
     * Test parse_states_from_region handles multiple states.
     */
    public function test_parse_states_from_region_handles_multiple_states(): void {
        $result = Profile::parse_states_from_region( 'California, Nevada, Arizona' );

        $this->assertContains( 'NV', $result );
        $this->assertContains( 'AZ', $result );
    }

    /**
     * Test parse_states_from_region returns unique values.
     */
    public function test_parse_states_from_region_returns_unique_values(): void {
        $result = Profile::parse_states_from_region( 'Greater LA California Los Angeles' );

        // Should only have CA once
        $this->assertCount( 1, array_filter( $result, fn( $s ) => $s === 'CA' ) );
    }

    /**
     * Test get_headshot_url returns null when no headshot_id.
     */
    public function test_get_headshot_url_returns_null_without_headshot(): void {
        $profile = new Profile();
        $profile->headshot_id = 0;

        $this->assertNull( $profile->get_headshot_url() );
    }

    /**
     * Test exists property defaults to false.
     */
    public function test_exists_defaults_to_false(): void {
        $profile = new Profile();

        $this->assertFalse( $profile->exists );
    }

    /**
     * Test profile properties can be set.
     */
    public function test_profile_properties_can_be_set(): void {
        $profile = new Profile();

        $profile->id = 123;
        $profile->email = 'test@example.com';
        $profile->first_name = 'Test';
        $profile->last_name = 'User';
        $profile->phone_number = '555-1234';
        $profile->nmls = '123456';
        $profile->service_areas = ['CA', 'NV'];
        $profile->specialties_lo = ['VA Loans'];

        $this->assertSame( 123, $profile->id );
        $this->assertSame( 'test@example.com', $profile->email );
        $this->assertSame( 'Test', $profile->first_name );
        $this->assertSame( 'User', $profile->last_name );
        $this->assertSame( '555-1234', $profile->phone_number );
        $this->assertSame( '123456', $profile->nmls );
        $this->assertSame( ['CA', 'NV'], $profile->service_areas );
        $this->assertSame( ['VA Loans'], $profile->specialties_lo );
    }

    /**
     * Test social URL properties.
     */
    public function test_social_url_properties(): void {
        $profile = new Profile();

        $profile->facebook_url = 'https://facebook.com/test';
        $profile->linkedin_url = 'https://linkedin.com/in/test';
        $profile->instagram_url = 'https://instagram.com/test';
        $profile->twitter_url = 'https://twitter.com/test';

        $this->assertSame( 'https://facebook.com/test', $profile->facebook_url );
        $this->assertSame( 'https://linkedin.com/in/test', $profile->linkedin_url );
        $this->assertSame( 'https://instagram.com/test', $profile->instagram_url );
        $this->assertSame( 'https://twitter.com/test', $profile->twitter_url );
    }

    /**
     * Test company_roles property.
     */
    public function test_company_roles_property(): void {
        $profile = new Profile();

        $this->assertIsArray( $profile->company_roles );
        $this->assertEmpty( $profile->company_roles );

        $profile->company_roles = ['loan_originator', 'leadership'];
        $this->assertCount( 2, $profile->company_roles );
        $this->assertContains( 'loan_originator', $profile->company_roles );
    }
}
