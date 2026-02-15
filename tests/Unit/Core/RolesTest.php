<?php
/**
 * Unit tests for Roles class.
 *
 * @package FRSUsers\Tests\Unit\Core
 */

declare(strict_types=1);

namespace FRSUsers\Tests\Unit\Core;

use FRSUsers\Tests\Unit\TestCase;
use FRSUsers\Core\Roles;
use Brain\Monkey\Functions;

/**
 * Test cases for the Roles class.
 */
class RolesTest extends TestCase {

    /**
     * Test get_wp_roles returns expected roles.
     */
    public function test_get_wp_roles_returns_expected_roles(): void {
        $roles = Roles::get_wp_roles();

        $this->assertIsArray( $roles );
        $this->assertArrayHasKey( 'loan_officer', $roles );
        $this->assertArrayHasKey( 're_agent', $roles );
        $this->assertArrayHasKey( 'escrow_officer', $roles );
        $this->assertArrayHasKey( 'property_manager', $roles );
        $this->assertArrayHasKey( 'dual_license', $roles );
        $this->assertArrayHasKey( 'partner', $roles );
        $this->assertArrayHasKey( 'staff', $roles );
        $this->assertArrayHasKey( 'leadership', $roles );
        $this->assertArrayHasKey( 'assistant', $roles );
    }

    /**
     * Test get_wp_roles includes label and url_prefix for each role.
     */
    public function test_get_wp_roles_includes_required_fields(): void {
        $roles = Roles::get_wp_roles();

        foreach ( $roles as $slug => $config ) {
            $this->assertArrayHasKey( 'label', $config, "Role {$slug} missing 'label'" );
            $this->assertArrayHasKey( 'url_prefix', $config, "Role {$slug} missing 'url_prefix'" );
            $this->assertArrayHasKey( 'public', $config, "Role {$slug} missing 'public'" );
        }
    }

    /**
     * Test get_company_roles returns expected roles.
     */
    public function test_get_company_roles_returns_expected_roles(): void {
        $roles = Roles::get_company_roles();

        $this->assertIsArray( $roles );
        $this->assertArrayHasKey( 'loan_originator', $roles );
        $this->assertArrayHasKey( 'broker_associate', $roles );
        $this->assertArrayHasKey( 'sales_associate', $roles );
        $this->assertArrayHasKey( 'escrow_officer', $roles );
        $this->assertArrayHasKey( 'property_manager', $roles );
        $this->assertArrayHasKey( 'partner', $roles );
        $this->assertArrayHasKey( 'leadership', $roles );
        $this->assertArrayHasKey( 'staff', $roles );
    }

    /**
     * Test get_wp_role_slugs returns array of slug strings.
     */
    public function test_get_wp_role_slugs_returns_slugs(): void {
        $slugs = Roles::get_wp_role_slugs();

        $this->assertIsArray( $slugs );
        $this->assertContains( 'loan_officer', $slugs );
        $this->assertContains( 're_agent', $slugs );
        $this->assertContains( 'leadership', $slugs );
    }

    /**
     * Test get_url_prefix returns correct prefix for loan_officer.
     */
    public function test_get_url_prefix_returns_lo_for_loan_officer(): void {
        $prefix = Roles::get_url_prefix( 'loan_officer' );

        $this->assertSame( 'lo', $prefix );
    }

    /**
     * Test get_url_prefix returns correct prefix for re_agent.
     */
    public function test_get_url_prefix_returns_agent_for_re_agent(): void {
        $prefix = Roles::get_url_prefix( 're_agent' );

        $this->assertSame( 'agent', $prefix );
    }

    /**
     * Test get_url_prefix returns null for partner (no public URL).
     */
    public function test_get_url_prefix_returns_null_for_partner(): void {
        $prefix = Roles::get_url_prefix( 'partner' );

        $this->assertNull( $prefix );
    }

    /**
     * Test get_url_prefix returns null for unknown role.
     */
    public function test_get_url_prefix_returns_null_for_unknown_role(): void {
        $prefix = Roles::get_url_prefix( 'nonexistent_role' );

        $this->assertNull( $prefix );
    }

    /**
     * Test get_role_label returns WP role label.
     */
    public function test_get_role_label_returns_wp_role_label(): void {
        $label = Roles::get_role_label( 'loan_officer' );

        $this->assertSame( 'Loan Officer', $label );
    }

    /**
     * Test get_role_label returns company role label.
     */
    public function test_get_role_label_returns_company_role_label(): void {
        $label = Roles::get_role_label( 'loan_originator' );

        $this->assertSame( 'Loan Originator', $label );
    }

    /**
     * Test get_role_label returns slug for unknown role.
     */
    public function test_get_role_label_returns_slug_for_unknown(): void {
        $label = Roles::get_role_label( 'unknown_role' );

        $this->assertSame( 'unknown_role', $label );
    }

    /**
     * Test is_public_role returns true for loan_officer.
     */
    public function test_is_public_role_returns_true_for_public_roles(): void {
        $this->assertTrue( Roles::is_public_role( 'loan_officer' ) );
        $this->assertTrue( Roles::is_public_role( 're_agent' ) );
        $this->assertTrue( Roles::is_public_role( 'leadership' ) );
    }

    /**
     * Test is_public_role returns false for partner.
     */
    public function test_is_public_role_returns_false_for_partner(): void {
        $this->assertFalse( Roles::is_public_role( 'partner' ) );
    }

    /**
     * Test is_public_role returns false for unknown role.
     */
    public function test_is_public_role_returns_false_for_unknown(): void {
        $this->assertFalse( Roles::is_public_role( 'nonexistent_role' ) );
    }

    /**
     * Test get_company_roles_for_site returns limited roles for 21stcenturylending.
     */
    public function test_get_company_roles_for_21stcenturylending(): void {
        $roles = Roles::get_company_roles_for_site( '21stcenturylending' );

        $this->assertArrayHasKey( 'loan_originator', $roles );
        $this->assertArrayHasKey( 'leadership', $roles );
        $this->assertCount( 2, $roles );
        $this->assertArrayNotHasKey( 'broker_associate', $roles );
    }

    /**
     * Test get_company_roles_for_site returns limited roles for c21masters.
     */
    public function test_get_company_roles_for_c21masters(): void {
        $roles = Roles::get_company_roles_for_site( 'c21masters' );

        $this->assertArrayHasKey( 'broker_associate', $roles );
        $this->assertArrayHasKey( 'sales_associate', $roles );
        $this->assertArrayHasKey( 'leadership', $roles );
        $this->assertCount( 3, $roles );
        $this->assertArrayNotHasKey( 'loan_originator', $roles );
    }

    /**
     * Test get_company_roles_for_site returns most roles for hub (excluding partner).
     */
    public function test_get_company_roles_for_hub(): void {
        $roles = Roles::get_company_roles_for_site( 'hub' );

        $this->assertArrayHasKey( 'loan_originator', $roles );
        $this->assertArrayHasKey( 'broker_associate', $roles );
        $this->assertArrayHasKey( 'leadership', $roles );
        $this->assertArrayNotHasKey( 'partner', $roles );
    }

    /**
     * Test get_company_roles_for_site returns all roles for unknown context.
     */
    public function test_get_company_roles_for_unknown_context(): void {
        $roles = Roles::get_company_roles_for_site( 'unknown_site' );
        $all_roles = Roles::get_company_roles();

        $this->assertEquals( $all_roles, $roles );
    }

    /**
     * Test get_default_company_role maps loan_officer to loan_originator.
     */
    public function test_get_default_company_role_for_loan_officer(): void {
        $role = Roles::get_default_company_role( 'loan_officer' );

        $this->assertSame( 'loan_originator', $role );
    }

    /**
     * Test get_default_company_role maps re_agent to broker_associate.
     */
    public function test_get_default_company_role_for_re_agent(): void {
        $role = Roles::get_default_company_role( 're_agent' );

        $this->assertSame( 'broker_associate', $role );
    }

    /**
     * Test get_default_company_role maps assistant to staff.
     */
    public function test_get_default_company_role_for_assistant(): void {
        $role = Roles::get_default_company_role( 'assistant' );

        $this->assertSame( 'staff', $role );
    }

    /**
     * Test get_default_company_role returns null for unknown role.
     */
    public function test_get_default_company_role_returns_null_for_unknown(): void {
        $role = Roles::get_default_company_role( 'unknown_role' );

        $this->assertNull( $role );
    }

    /**
     * Test get_wp_roles_for_dropdown returns slug => label pairs.
     */
    public function test_get_wp_roles_for_dropdown_format(): void {
        $dropdown = Roles::get_wp_roles_for_dropdown();

        $this->assertIsArray( $dropdown );
        $this->assertArrayHasKey( 'loan_officer', $dropdown );
        $this->assertSame( 'Loan Officer', $dropdown['loan_officer'] );
    }

    /**
     * Test get_site_contexts returns expected contexts.
     */
    public function test_get_site_contexts_returns_expected_contexts(): void {
        $contexts = Roles::get_site_contexts();

        $this->assertArrayHasKey( 'development', $contexts );
        $this->assertArrayHasKey( '21stcenturylending', $contexts );
        $this->assertArrayHasKey( 'c21masters', $contexts );
        $this->assertArrayHasKey( 'hub', $contexts );
    }

    /**
     * Test site contexts have required configuration fields.
     */
    public function test_site_contexts_have_required_fields(): void {
        $contexts = Roles::get_site_contexts();

        foreach ( $contexts as $slug => $config ) {
            $this->assertArrayHasKey( 'label', $config, "Context {$slug} missing 'label'" );
            $this->assertArrayHasKey( 'company_roles', $config, "Context {$slug} missing 'company_roles'" );
            $this->assertArrayHasKey( 'profile_editing', $config, "Context {$slug} missing 'profile_editing'" );
            $this->assertArrayHasKey( 'url_prefixes', $config, "Context {$slug} missing 'url_prefixes'" );
            $this->assertIsArray( $config['company_roles'] );
            $this->assertIsBool( $config['profile_editing'] );
            $this->assertIsArray( $config['url_prefixes'] );
        }
    }

    /**
     * Test get_site_context returns constant when defined.
     */
    public function test_get_site_context_returns_constant_when_defined(): void {
        // Define the constant for this test
        if ( ! defined( 'FRS_SITE_CONTEXT' ) ) {
            define( 'FRS_SITE_CONTEXT', 'hub' );
        }

        $context = Roles::get_site_context();

        $this->assertSame( 'hub', $context );
    }

    /**
     * Test get_site_context_config returns correct config.
     */
    public function test_get_site_context_config_for_21stcenturylending(): void {
        $config = Roles::get_site_context_config( '21stcenturylending' );

        $this->assertSame( '21st Century Lending (Marketing)', $config['label'] );
        $this->assertFalse( $config['profile_editing'] );
        $this->assertContains( 'loan_originator', $config['company_roles'] );
    }

    /**
     * Test get_site_context_config falls back to development for unknown context.
     */
    public function test_get_site_context_config_falls_back_to_development(): void {
        $config = Roles::get_site_context_config( 'unknown_context' );
        $dev_config = Roles::get_site_context_config( 'development' );

        $this->assertEquals( $dev_config, $config );
    }

    /**
     * Test is_profile_editing_enabled returns false for marketing sites.
     */
    public function test_is_profile_editing_enabled_false_for_marketing(): void {
        // This tests the config, not the actual method (which depends on context)
        $config = Roles::get_site_context_config( '21stcenturylending' );
        $this->assertFalse( $config['profile_editing'] );

        $config = Roles::get_site_context_config( 'c21masters' );
        $this->assertFalse( $config['profile_editing'] );
    }

    /**
     * Test is_profile_editing_enabled returns true for hub and development.
     */
    public function test_is_profile_editing_enabled_true_for_hub(): void {
        $config = Roles::get_site_context_config( 'hub' );
        $this->assertTrue( $config['profile_editing'] );

        $config = Roles::get_site_context_config( 'development' );
        $this->assertTrue( $config['profile_editing'] );
    }

    /**
     * Test is_company_role_active checks against context config.
     */
    public function test_is_company_role_active(): void {
        // For 21stcenturylending context
        $config = Roles::get_site_context_config( '21stcenturylending' );

        $this->assertContains( 'loan_originator', $config['company_roles'] );
        $this->assertNotContains( 'broker_associate', $config['company_roles'] );
    }

    /**
     * Test get_wp_role_for_company_role maps correctly.
     */
    public function test_get_wp_role_for_company_role(): void {
        $this->assertSame( 'loan_officer', Roles::get_wp_role_for_company_role( 'loan_originator' ) );
        $this->assertSame( 're_agent', Roles::get_wp_role_for_company_role( 'broker_associate' ) );
        $this->assertSame( 're_agent', Roles::get_wp_role_for_company_role( 'sales_associate' ) );
        $this->assertSame( 'leadership', Roles::get_wp_role_for_company_role( 'leadership' ) );
    }

    /**
     * Test development context has all company roles.
     */
    public function test_development_context_has_all_roles(): void {
        $config = Roles::get_site_context_config( 'development' );
        $all_roles = array_keys( Roles::get_company_roles() );

        foreach ( $all_roles as $role ) {
            $this->assertContains( $role, $config['company_roles'], "Development missing {$role}" );
        }
    }

    /**
     * Test URL prefixes are consistent with WP roles.
     */
    public function test_url_prefixes_match_wp_roles(): void {
        $wp_roles = Roles::get_wp_roles();
        $prefixes = [];

        foreach ( $wp_roles as $config ) {
            if ( $config['url_prefix'] ) {
                $prefixes[] = $config['url_prefix'];
            }
        }

        // All contexts should only use prefixes that exist in WP roles
        $contexts = Roles::get_site_contexts();
        foreach ( $contexts as $slug => $config ) {
            foreach ( $config['url_prefixes'] as $prefix ) {
                $this->assertContains(
                    $prefix,
                    $prefixes,
                    "Context {$slug} has invalid URL prefix: {$prefix}"
                );
            }
        }
    }
}
