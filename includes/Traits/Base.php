<?php
/**
 * Base Trait
 *
 * Provides a trait with a singleton pattern for obtaining an instance.
 *
 * @package FRSUsers
 * @subpackage Traits
 * @since 1.0.0
 */

namespace FRSUsers\Traits;

/**
 * Trait Base
 *
 * Provides a trait with a singleton pattern for obtaining an instance.
 *
 * @package FRSUsers\Traits
 */
trait Base {

	/**
	 * The singleton instance.
	 *
	 * @var mixed
	 */
	private static $instance;

	/**
	 * Retrieves the singleton instance. If it does not exist, creates a new instance.
	 *
	 * @return mixed The singleton instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
