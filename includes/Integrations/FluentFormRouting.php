<?php
/**
 * Fluent Form Email Routing
 *
 * Routes "Schedule A Call" form (Form 7) email notifications to the
 * loan officer specified in the hidden frs_loan_officer_id or frs_loan_officer_email field.
 *
 * Supports multiple lookup strategies:
 * 1. Direct email from frs_loan_officer_email field
 * 2. WordPress user ID lookup from frs_loan_officer_id field
 * 3. Slug-based lookup from the referring URL (e.g., /lo/john-smith)
 *
 * @package    FRSUsers
 * @subpackage Integrations
 */

namespace FRSUsers\Integrations;

use FRSUsers\Core\Roles;

defined( 'ABSPATH' ) || exit;

class FluentFormRouting {

	/**
	 * The Fluent Form ID for the "Schedule A Call" form.
	 */
	const FORM_ID = 7;

	/**
	 * Initialize the integration.
	 */
	public static function init() {
		add_filter( 'fluentform/email_to', array( __CLASS__, 'route_to_loan_officer' ), 10, 4 );
	}

	/**
	 * Route email notification to the loan officer specified in the form submission.
	 *
	 * Tries multiple strategies to find the LO email:
	 * 1. Direct email from frs_loan_officer_email hidden field
	 * 2. WordPress user ID lookup from frs_loan_officer_id field
	 * 3. Slug extraction from _wp_http_referer URL
	 *
	 * Falls back to the original sendTo address if no LO is found.
	 *
	 * @param string|array $send_to       The original email recipient(s).
	 * @param array        $notification  The notification settings.
	 * @param array        $submitted_data The form submission data.
	 * @param object       $form          The form object.
	 * @return string|array The modified email recipient(s).
	 */
	public static function route_to_loan_officer( $send_to, $notification, $submitted_data, $form ) {
		if ( ! isset( $form->id ) || (int) $form->id !== self::FORM_ID ) {
			return $send_to;
		}

		// Strategy 1: Direct email from hidden field (most reliable).
		$lo_email = self::find_lo_email( $submitted_data );
		if ( $lo_email && \is_email( $lo_email ) ) {
			return $lo_email;
		}

		// Strategy 2: Look up by WordPress user ID.
		$lo_id = self::find_lo_id( $submitted_data );
		if ( $lo_id ) {
			$user = \get_userdata( $lo_id );
			if ( $user && $user->user_email ) {
				return $user->user_email;
			}
		}

		// Strategy 3: Extract slug from referer URL and look up user.
		$slug = self::extract_slug_from_referer( $submitted_data );
		if ( $slug ) {
			$user = self::find_user_by_slug( $slug );
			if ( $user && $user->user_email ) {
				return $user->user_email;
			}
		}

		return $send_to;
	}

	/**
	 * Find loan officer email directly from form data.
	 *
	 * @param array $data The submitted form data.
	 * @return string|null Email address or null if not found.
	 */
	private static function find_lo_email( $data ) {
		$field_names = array(
			'frs_loan_officer_email',
			'loan_officer_email',
		);

		foreach ( $field_names as $name ) {
			if ( ! empty( $data[ $name ] ) && \is_email( $data[ $name ] ) ) {
				return \sanitize_email( $data[ $name ] );
			}
		}

		return null;
	}

	/**
	 * Find the loan officer ID from submitted form data.
	 *
	 * Searches for common field name patterns that may contain the LO ID.
	 *
	 * @param array $data The submitted form data.
	 * @return int The loan officer user ID, or 0 if not found.
	 */
	private static function find_lo_id( $data ) {
		$field_names = array(
			'frs_loan_officer_id',
			'loan_officer_id',
			'loan_officer',
		);

		foreach ( $field_names as $name ) {
			if ( ! empty( $data[ $name ] ) ) {
				return absint( $data[ $name ] );
			}
		}

		foreach ( $data as $key => $value ) {
			if ( strpos( $key, 'loan_officer' ) !== false && ! empty( $value ) && is_numeric( $value ) ) {
				return absint( $value );
			}
		}

		return 0;
	}

	/**
	 * Extract profile slug from the referer URL.
	 *
	 * Parses URLs like /lo/john-smith or /directory/lo/john-smith.
	 *
	 * @param array $data The submitted form data.
	 * @return string|null The profile slug or null.
	 */
	private static function extract_slug_from_referer( $data ) {
		$referer = $data['_wp_http_referer'] ?? '';
		if ( empty( $referer ) ) {
			return null;
		}

		// Match /lo/{slug}, /agent/{slug}, etc.
		$prefixes = array( 'lo', 'agent', 'escrow', 'pm', 'staff', 'leader' );
		$prefix_pattern = implode( '|', $prefixes );

		if ( preg_match( '#/(?:directory/)?(' . $prefix_pattern . ')/([^/\?]+)#', $referer, $matches ) ) {
			return \sanitize_title( $matches[2] );
		}

		return null;
	}

	/**
	 * Find a WordPress user by profile slug.
	 *
	 * Checks both user_nicename and frs_profile_slug meta.
	 *
	 * @param string $slug The profile slug.
	 * @return \WP_User|null The user or null if not found.
	 */
	private static function find_user_by_slug( $slug ) {
		// Try by user_nicename first (most common).
		$user = \get_user_by( 'slug', $slug );
		if ( $user ) {
			return $user;
		}

		// Try custom profile slug meta.
		$users = \get_users( array(
			'meta_key'   => 'frs_profile_slug',
			'meta_value' => $slug,
			'number'     => 1,
		) );

		return $users ? $users[0] : null;
	}
}
