<?php
/**
 * Template Handler (Legacy)
 *
 * Handles legacy /profile/{slug} URLs by redirecting to role-based URLs.
 * The actual template loading is handled by TemplateLoader.php.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 * @deprecated Use TemplateLoader for new implementations.
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Class Template
 *
 * Manages legacy profile URL routing.
 * New role-based URLs (/lo/, /agent/, etc.) are handled by TemplateLoader.
 *
 * @package FRSUsers\Core
 */
class Template {
	use Base;

	/**
	 * Initialize template handling
	 *
	 * @return void
	 */
	public function init() {
		// Add rewrite rules for legacy /profile/{slug} URLs
		add_action( 'init', array( $this, 'add_rewrite_rules' ) );

		// Add query vars
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );

		// Handle legacy URLs - redirect to role-based URLs
		add_action( 'template_redirect', array( $this, 'handle_legacy_redirect' ), 5 );
	}

	/**
	 * Add rewrite rules for legacy profile URLs
	 *
	 * @return void
	 */
	public function add_rewrite_rules() {
		add_rewrite_rule(
			'^profile/([^/]+)/?$',
			'index.php?frs_profile_slug=$matches[1]',
			'top'
		);
	}

	/**
	 * Add custom query vars
	 *
	 * @param array $vars Query vars.
	 * @return array Modified query vars.
	 */
	public function add_query_vars( $vars ) {
		$vars[] = 'frs_profile_slug';
		return $vars;
	}

	/**
	 * Handle legacy /profile/{slug} URLs by redirecting to role-based URLs
	 *
	 * @return void
	 */
	public function handle_legacy_redirect() {
		$profile_slug = get_query_var( 'frs_profile_slug' );

		if ( empty( $profile_slug ) ) {
			return;
		}

		// Get profile by slug
		$profile = Profile::get_by_slug( sanitize_title( $profile_slug ) );

		if ( ! $profile ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			return;
		}

		// Get user to determine role
		$user = get_userdata( $profile->user_id );
		if ( ! $user ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			return;
		}

		// Role to URL prefix mapping
		$role_urls = array(
			'loan_officer'     => 'lo',
			're_agent'         => 'agent',
			'escrow_officer'   => 'escrow',
			'property_manager' => 'pm',
			'dual_license'     => 'lo',
			'staff'            => 'staff',
			'leadership'       => 'leader',
			'assistant'        => 'staff',
		);

		// Find the user's FRS role
		$url_prefix = 'lo'; // Default
		foreach ( $role_urls as $role => $prefix ) {
			if ( in_array( $role, $user->roles, true ) ) {
				$url_prefix = $prefix;
				break;
			}
		}

		// Redirect to role-based URL
		wp_redirect( home_url( "/{$url_prefix}/{$profile_slug}" ), 301 );
		exit;
	}
}
