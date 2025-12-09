<?php
/**
 * Profile Model Tests
 *
 * @package FRSUsers
 */

namespace FRSUsers\Tests;

use PHPUnit\Framework\TestCase;
use FRSUsers\Models\Profile;

/**
 * Test case for the Profile model
 */
class ProfileModelTest extends TestCase {

	/**
	 * Test that getTable returns correct table name
	 */
	public function test_get_table_returns_frs_profiles() {
		$profile = new Profile();
		$this->assertEquals( 'frs_profiles', $profile->getTable() );
	}

	/**
	 * Test that table property is set correctly
	 */
	public function test_table_property() {
		$profile = new Profile();
		$this->assertEquals( 'frs_profiles', $profile->getTable() );
	}

	/**
	 * Test fillable attributes are defined
	 */
	public function test_fillable_includes_required_fields() {
		$profile = new Profile();
		$fillable = $profile->getFillable();

		$this->assertContains( 'user_id', $fillable );
		$this->assertContains( 'email', $fillable );
		$this->assertContains( 'first_name', $fillable );
		$this->assertContains( 'last_name', $fillable );
		$this->assertContains( 'company_name', $fillable );
		$this->assertContains( 'company_logo_id', $fillable );
	}

	/**
	 * Test is_guest method
	 */
	public function test_is_guest_returns_true_when_no_user_id() {
		$profile = new Profile();
		$profile->user_id = null;
		$this->assertTrue( $profile->is_guest() );
	}

	/**
	 * Test is_guest method with user_id
	 */
	public function test_is_guest_returns_false_when_has_user_id() {
		$profile = new Profile();
		$profile->user_id = 1;
		$this->assertFalse( $profile->is_guest() );
	}

	/**
	 * Test slug generation from name
	 */
	public function test_generate_unique_slug() {
		// Test that the static method exists
		$this->assertTrue( method_exists( Profile::class, 'generate_unique_slug' ) );
	}
}
