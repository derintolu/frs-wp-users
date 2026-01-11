<?php
/**
 * Auto-populate Arrive (Apply Now) URL for Loan Officers
 *
 * Automatically sets the arrive field to the 1003 app registration URL
 * using the loan officer's NMLS number.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Integrations;

/**
 * Class ArriveAutoPopulate
 */
class ArriveAutoPopulate {

	/**
	 * The URL pattern for the 1003 app.
	 */
	const URL_PATTERN = 'https://21stcenturylending.my1003app.com/{nmls}/register';

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public static function init() {
		// Hook into profile save events
		add_action( 'frs_profile_saved', array( __CLASS__, 'maybe_set_arrive_url' ), 10, 2 );
		add_action( 'frs_user_profile_updated', array( __CLASS__, 'maybe_set_arrive_url_by_user_id' ), 10, 1 );

		// Also hook into user meta updates for NMLS changes
		add_action( 'updated_user_meta', array( __CLASS__, 'on_nmls_updated' ), 10, 4 );
		add_action( 'added_user_meta', array( __CLASS__, 'on_nmls_updated' ), 10, 4 );
	}

	/**
	 * Generate the arrive URL for a given NMLS number.
	 *
	 * @param string $nmls The NMLS number.
	 * @return string The arrive URL.
	 */
	public static function generate_arrive_url( $nmls ) {
		if ( empty( $nmls ) ) {
			return '';
		}
		return str_replace( '{nmls}', $nmls, self::URL_PATTERN );
	}

	/**
	 * Maybe set the arrive URL when a profile is saved.
	 *
	 * @param int   $profile_id The profile/user ID.
	 * @param array $data       The profile data.
	 * @return void
	 */
	public static function maybe_set_arrive_url( $profile_id, $data ) {
		self::maybe_set_arrive_url_by_user_id( $profile_id );
	}

	/**
	 * Maybe set the arrive URL by user ID.
	 *
	 * @param int $user_id The user ID.
	 * @return void
	 */
	public static function maybe_set_arrive_url_by_user_id( $user_id ) {
		// Get current arrive value
		$arrive = get_user_meta( $user_id, 'frs_arrive', true );

		// If arrive is already set, don't overwrite
		if ( ! empty( $arrive ) ) {
			return;
		}

		// Get NMLS number
		$nmls = get_user_meta( $user_id, 'frs_nmls', true );

		// If no NMLS, can't generate URL
		if ( empty( $nmls ) ) {
			return;
		}

		// Check if user is a loan officer type
		$person_type = get_user_meta( $user_id, 'frs_select_person_type', true );
		$lo_types = array( 'loan_officer', 'leadership', 'staff' );

		// Also check WordPress role
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		$is_lo = in_array( $person_type, $lo_types, true ) ||
		         in_array( 'loan_officer', (array) $user->roles, true ) ||
		         in_array( 'frs_loan_officer', (array) $user->roles, true );

		if ( ! $is_lo ) {
			return;
		}

		// Generate and save the arrive URL
		$arrive_url = self::generate_arrive_url( $nmls );
		update_user_meta( $user_id, 'frs_arrive', $arrive_url );
	}

	/**
	 * When NMLS is updated, check if we need to set arrive URL.
	 *
	 * @param int    $meta_id    The meta ID.
	 * @param int    $user_id    The user ID.
	 * @param string $meta_key   The meta key.
	 * @param mixed  $meta_value The meta value.
	 * @return void
	 */
	public static function on_nmls_updated( $meta_id, $user_id, $meta_key, $meta_value ) {
		if ( $meta_key !== 'frs_nmls' ) {
			return;
		}

		// Only proceed if NMLS was just set/updated to a non-empty value
		if ( empty( $meta_value ) ) {
			return;
		}

		// Check if arrive is empty
		$arrive = get_user_meta( $user_id, 'frs_arrive', true );
		if ( ! empty( $arrive ) ) {
			return;
		}

		// Generate and save the arrive URL
		$arrive_url = self::generate_arrive_url( $meta_value );
		update_user_meta( $user_id, 'frs_arrive', $arrive_url );
	}

	/**
	 * Backfill arrive URLs for all loan officers missing them.
	 * Can be called manually or via WP-CLI.
	 *
	 * @return array Results with counts.
	 */
	public static function backfill_all() {
		$updated = 0;
		$skipped = 0;

		// Get all users with NMLS but no arrive
		$users = get_users( array(
			'meta_query' => array(
				'relation' => 'AND',
				array(
					'key'     => 'frs_nmls',
					'value'   => '',
					'compare' => '!=',
				),
				array(
					'relation' => 'OR',
					array(
						'key'     => 'frs_arrive',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => 'frs_arrive',
						'value'   => '',
						'compare' => '=',
					),
				),
			),
			'number' => -1,
		) );

		foreach ( $users as $user ) {
			$nmls = get_user_meta( $user->ID, 'frs_nmls', true );
			if ( empty( $nmls ) ) {
				$skipped++;
				continue;
			}

			$arrive_url = self::generate_arrive_url( $nmls );
			update_user_meta( $user->ID, 'frs_arrive', $arrive_url );
			$updated++;
		}

		return array(
			'updated' => $updated,
			'skipped' => $skipped,
		);
	}
}
