<?php
/**
 * Fluent Form Email Routing
 *
 * Routes "Schedule A Call" form (Form 7) email notifications to the
 * loan officer specified in the hidden frs_loan_officer_id field.
 *
 * @package    FRSUsers
 * @subpackage Integrations
 */

namespace FRSUsers\Integrations;

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
	 * Looks for the frs_loan_officer_id field in the submitted data, finds the
	 * corresponding WordPress user, and sends the notification to their email.
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

		$lo_id = self::find_lo_id( $submitted_data );

		if ( ! $lo_id ) {
			return $send_to;
		}

		$user = get_userdata( $lo_id );

		if ( ! $user || ! $user->user_email ) {
			return $send_to;
		}

		return $user->user_email;
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
			if ( strpos( $key, 'loan_officer' ) !== false && ! empty( $value ) ) {
				return absint( $value );
			}
		}

		return 0;
	}
}
