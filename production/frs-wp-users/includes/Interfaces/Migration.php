<?php
/**
 * Migration Interface
 *
 * Defines the contract for database migration operations.
 *
 * @package FRSUsers
 * @subpackage Interfaces
 * @since 1.0.0
 */

namespace FRSUsers\Interfaces;

/**
 * Interface Migration
 *
 * Defines the contract for database migration operations.
 *
 * @package FRSUsers\Interfaces
 */
interface Migration {

	/**
	 * Perform actions when migrating up.
	 *
	 * @return void
	 */
	public static function up();

	/**
	 * Perform actions when migrating down.
	 *
	 * @return void
	 */
	public static function down();
}
