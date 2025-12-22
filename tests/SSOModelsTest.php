<?php
/**
 * SSO Models Tests
 *
 * @package FRSUsers
 */

namespace FRSUsers\Tests;

use PHPUnit\Framework\TestCase;
use FRSUsers\Models\SSOClient;
use FRSUsers\Models\SSOProvider;

/**
 * Test case for SSO models
 */
class SSOModelsTest extends TestCase {

	/**
	 * Test SSOClient getTable returns correct table name
	 */
	public function test_sso_client_get_table() {
		$client = new SSOClient();
		$this->assertEquals( 'frs_sso_clients', $client->getTable() );
	}

	/**
	 * Test SSOProvider getTable returns correct table name
	 */
	public function test_sso_provider_get_table() {
		$provider = new SSOProvider();
		$this->assertEquals( 'frs_sso_providers', $provider->getTable() );
	}

	/**
	 * Test SSOClient table property
	 */
	public function test_sso_client_table_property() {
		$client = new SSOClient();
		// Table name should not include prefix
		$this->assertStringNotContainsString( 'wp_', $client->getTable() );
	}

	/**
	 * Test SSOProvider table property
	 */
	public function test_sso_provider_table_property() {
		$provider = new SSOProvider();
		// Table name should not include prefix
		$this->assertStringNotContainsString( 'wp_', $provider->getTable() );
	}
}
