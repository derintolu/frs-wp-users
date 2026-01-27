<?php
/**
 * WordPress Abilities API Registry
 *
 * Coordinates registration of all abilities for the FRS User Profiles plugin.
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Abilities;

/**
 * Class AbilitiesRegistry
 *
 * Main registry for WordPress Abilities API integration.
 */
class AbilitiesRegistry {

	/**
	 * Initialize the abilities registration
	 *
	 * @return void
	 */
	public static function init(): void {
		// Register categories
		add_action( 'wp_abilities_api_categories_init', array( self::class, 'register_categories' ) );

		// Register abilities
		add_action( 'wp_abilities_api_init', array( self::class, 'register_abilities' ) );
	}

	/**
	 * Register ability categories
	 *
	 * @return void
	 */
	public static function register_categories(): void {
		Categories::register();
	}

	/**
	 * Register all abilities
	 *
	 * @return void
	 */
	public static function register_abilities(): void {
		UserAbilities::register();
		ProfileAbilities::register();
		RoleAbilities::register();
		SyncAbilities::register();
		\FRSUsers\Intranet\IntranetAbilities::register();
	}
}
