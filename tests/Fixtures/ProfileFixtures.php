<?php
/**
 * Test fixtures for profile data.
 *
 * @package FRSUsers\Tests\Fixtures
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Fixtures;

/**
 * Class ProfileFixtures
 *
 * Provides sample data for testing.
 */
class ProfileFixtures {

    /**
     * Get a sample loan officer profile.
     *
     * @return array Profile data.
     */
    public static function loan_officer(): array {
        return [
            'id'                => 1,
            'user_id'           => 1,
            'email'             => 'john.smith@21stcenturylending.com',
            'first_name'        => 'John',
            'last_name'         => 'Smith',
            'display_name'      => 'John Smith',
            'phone_number'      => '(310) 555-1234',
            'mobile_number'     => '(310) 555-5678',
            'job_title'         => 'Senior Loan Officer',
            'nmls'              => '123456',
            'nmls_number'       => '123456',
            'city_state'        => 'Los Angeles, CA',
            'region'            => 'Greater LA',
            'biography'         => 'John has over 15 years of experience helping families achieve their dream of homeownership.',
            'profile_slug'      => 'john-smith',
            'is_active'         => true,
            'company_role'      => ['loan_originator'],
            'select_person_type' => 'loan_originator',
            'service_areas'     => ['CA', 'NV', 'AZ'],
            'specialties_lo'    => [
                'Residential Mortgages',
                'VA Loans',
                'FHA Loans',
                'Jumbo Loans',
            ],
            'namb_certifications' => [
                'CMC - Certified Mortgage Consultant',
            ],
            'languages'         => ['English', 'Spanish'],
            'facebook_url'      => 'https://facebook.com/johnsmithloans',
            'linkedin_url'      => 'https://linkedin.com/in/johnsmithloans',
            'instagram_url'     => '',
            'twitter_url'       => '',
            'arrive'            => 'https://apply.21stcenturylending.com/john-smith',
            'custom_links'      => [
                ['title' => 'My Reviews', 'url' => 'https://zillow.com/lender/john-smith'],
                ['title' => 'Schedule Meeting', 'url' => 'https://calendly.com/john-smith'],
            ],
        ];
    }

    /**
     * Get a sample real estate agent profile.
     *
     * @return array Profile data.
     */
    public static function real_estate_agent(): array {
        return [
            'id'                => 2,
            'user_id'           => 2,
            'email'             => 'jane.doe@c21masters.com',
            'first_name'        => 'Jane',
            'last_name'         => 'Doe',
            'display_name'      => 'Jane Doe',
            'phone_number'      => '(949) 555-9876',
            'mobile_number'     => '(949) 555-6543',
            'job_title'         => 'Broker Associate',
            'dre_license'       => '01234567',
            'city_state'        => 'Irvine, CA',
            'region'            => 'Orange County',
            'biography'         => 'Jane specializes in luxury properties in Orange County with over 20 years of experience.',
            'profile_slug'      => 'jane-doe',
            'is_active'         => true,
            'company_role'      => ['broker_associate'],
            'select_person_type' => 'broker_associate',
            'service_areas'     => ['CA'],
            'specialties'       => [
                'Luxury Homes',
                'Investment Properties',
                'First-Time Buyers',
            ],
            'nar_designations'  => [
                'CRS - Certified Residential Specialist',
                'ABR - Accredited Buyer Representative',
            ],
            'languages'         => ['English', 'Mandarin'],
            'facebook_url'      => 'https://facebook.com/janedoerealty',
            'linkedin_url'      => 'https://linkedin.com/in/janedoerealty',
            'instagram_url'     => 'https://instagram.com/janedoerealty',
            'century21_url'     => 'https://century21.com/agent/jane-doe',
            'zillow_url'        => 'https://zillow.com/profile/jane-doe',
            'custom_links'      => [
                ['title' => 'Featured Listings', 'url' => 'https://janedoe.c21masters.com/listings'],
            ],
        ];
    }

    /**
     * Get a sample leadership profile.
     *
     * @return array Profile data.
     */
    public static function leadership(): array {
        return [
            'id'                => 3,
            'user_id'           => 3,
            'email'             => 'bob.wilson@21stcenturylending.com',
            'first_name'        => 'Bob',
            'last_name'         => 'Wilson',
            'display_name'      => 'Bob Wilson',
            'phone_number'      => '(323) 555-0001',
            'job_title'         => 'Vice President of Sales',
            'city_state'        => 'Los Angeles, CA',
            'biography'         => 'Bob leads our sales team with a focus on growth and customer satisfaction.',
            'profile_slug'      => 'bob-wilson',
            'is_active'         => true,
            'company_role'      => ['leadership'],
            'select_person_type' => 'leadership',
            'service_areas'     => ['CA', 'NV', 'AZ', 'TX', 'FL'],
            'linkedin_url'      => 'https://linkedin.com/in/bobwilson',
        ];
    }

    /**
     * Get a sample staff profile.
     *
     * @return array Profile data.
     */
    public static function staff(): array {
        return [
            'id'                => 4,
            'user_id'           => 4,
            'email'             => 'sarah.jones@21stcenturylending.com',
            'first_name'        => 'Sarah',
            'last_name'         => 'Jones',
            'display_name'      => 'Sarah Jones',
            'phone_number'      => '(323) 555-0002',
            'job_title'         => 'Loan Processor',
            'city_state'        => 'Los Angeles, CA',
            'biography'         => 'Sarah ensures smooth loan processing with attention to detail.',
            'profile_slug'      => 'sarah-jones',
            'is_active'         => true,
            'company_role'      => ['staff'],
            'select_person_type' => 'staff',
            'service_areas'     => [],
        ];
    }

    /**
     * Get sample webhook payload for profile_updated event.
     *
     * @return array Webhook payload.
     */
    public static function webhook_profile_updated(): array {
        return [
            'event'     => 'profile_updated',
            'timestamp' => 1704931200, // 2024-01-11 00:00:00 UTC
            'profile'   => self::loan_officer(),
        ];
    }

    /**
     * Get sample webhook payload for profile_deleted event.
     *
     * @return array Webhook payload.
     */
    public static function webhook_profile_deleted(): array {
        return [
            'event'     => 'profile_deleted',
            'timestamp' => 1704931200,
            'email'     => 'john.smith@21stcenturylending.com',
            'user_id'   => 1,
        ];
    }

    /**
     * Get all state abbreviations.
     *
     * @return array State abbreviations.
     */
    public static function all_states(): array {
        return [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
            'DC',
        ];
    }

    /**
     * Get sample CSV import data.
     *
     * @return array Array of profile arrays for CSV import.
     */
    public static function csv_import_data(): array {
        return [
            [
                'first_name'   => 'Alice',
                'last_name'    => 'Johnson',
                'email'        => 'alice.johnson@example.com',
                'phone_number' => '555-111-1111',
                'job_title'    => 'Loan Officer',
                'nmls'         => '111111',
                'city_state'   => 'San Diego, CA',
                'company_role' => 'loan_originator',
            ],
            [
                'first_name'   => 'Bob',
                'last_name'    => 'Martinez',
                'email'        => 'bob.martinez@example.com',
                'phone_number' => '555-222-2222',
                'job_title'    => 'Broker Associate',
                'dre_license'  => '02222222',
                'city_state'   => 'Newport Beach, CA',
                'company_role' => 'broker_associate',
            ],
            [
                'first_name'   => 'Carol',
                'last_name'    => 'Lee',
                'email'        => 'carol.lee@example.com',
                'phone_number' => '555-333-3333',
                'job_title'    => 'Sales Associate',
                'dre_license'  => '03333333',
                'city_state'   => 'Pasadena, CA',
                'company_role' => 'sales_associate',
            ],
        ];
    }
}
