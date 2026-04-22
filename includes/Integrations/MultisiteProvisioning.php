<?php
/**
 * Multisite Provisioning
 *
 * Ensures every new user is a member of both the hub (main site) and /lending.
 * Without main-site membership, ms_site_check() blocks the post-SSO redirect
 * with "your admin needs to add you to the site" before the login-redirect
 * fluent snippet can forward them to /lending.
 *
 * @package FRSUsers\Integrations
 */

namespace FRSUsers\Integrations;

defined( 'ABSPATH' ) || exit;

class MultisiteProvisioning {

	const MAIN_SITE_ID    = 1;
	const LENDING_SITE_ID = 2;

	const MAIN_SITE_ROLE    = 'subscriber';
	const LENDING_SITE_ROLE = 'loan_officer';

	public static function init(): void {
		if ( ! is_multisite() ) {
			return;
		}

		// Priority 20 — run after WPO365's own user_register handlers (priority 10).
		add_action( 'user_register', array( __CLASS__, 'provision_sites' ), 20, 1 );
	}

	public static function provision_sites( int $user_id ): void {
		if ( ! $user_id || ! get_userdata( $user_id ) ) {
			return;
		}

		self::ensure_membership( $user_id, self::LENDING_SITE_ID, self::LENDING_SITE_ROLE );
		self::ensure_membership( $user_id, self::MAIN_SITE_ID, self::MAIN_SITE_ROLE );
	}

	private static function ensure_membership( int $user_id, int $blog_id, string $role ): void {
		if ( is_user_member_of_blog( $user_id, $blog_id ) ) {
			return;
		}

		$result = add_user_to_blog( $blog_id, $user_id, $role );
		if ( is_wp_error( $result ) ) {
			error_log( sprintf(
				'FRS Users: MultisiteProvisioning failed to add user %d to blog %d as %s — %s',
				$user_id,
				$blog_id,
				$role,
				$result->get_error_message()
			) );
		}
	}
}
