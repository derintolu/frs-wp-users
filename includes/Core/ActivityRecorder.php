<?php
/**
 * Activity Recorder
 *
 * Hooks into WordPress and plugin actions to record activity events
 * into the frs_activity_log table via ActivityLog::log().
 *
 * @package FRSUsers
 * @since 3.2.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\ActivityLog;

defined( 'ABSPATH' ) || exit;

class ActivityRecorder {

	/**
	 * Maximum number of field names to list in profile update summaries.
	 *
	 * @var int
	 */
	private static $max_summary_fields = 5;

	/**
	 * Post types that trigger a post_published event.
	 *
	 * @var array
	 */
	private static $tracked_post_types = array( 'post', 'page', 'lesson', 'courses' );

	/**
	 * Initialize all activity recording hooks.
	 *
	 * @return void
	 */
	public static function init() {
		// Profile updates.
		add_action( 'frs_profile_saved', array( __CLASS__, 'on_profile_saved' ), 10, 2 );

		// Meeting requests.
		add_action( 'frs_meeting_request_submitted', array( __CLASS__, 'on_meeting_request' ), 10, 1 );

		// Post publishing.
		add_action( 'transition_post_status', array( __CLASS__, 'on_post_published' ), 10, 3 );

		// Tutor LMS lesson completion.
		add_action( 'tutor_lesson_completed_after', array( __CLASS__, 'on_lesson_completed' ), 10, 1 );

		// Tutor LMS course enrollment.
		add_action( 'tutor_after_enrolled', array( __CLASS__, 'on_course_enrolled' ), 10, 2 );
	}

	/**
	 * Record a profile update event.
	 *
	 * @param int   $profile_id   The user/profile ID.
	 * @param array $profile_data The fields that were saved.
	 * @return void
	 */
	public static function on_profile_saved( $profile_id, $profile_data ) {
		try {
			$fields  = array_keys( $profile_data );
			$pretty  = array_map( array( __CLASS__, 'pretty_field_name' ), $fields );
			$summary = self::build_fields_summary( $pretty );

			ActivityLog::log(
				$profile_id,
				'profile_updated',
				'profile',
				$summary,
				array( 'fields' => $fields ),
				get_current_user_id() ?: null,
				$profile_id
			);
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Silently fail to avoid breaking the hooked action.
		}
	}

	/**
	 * Record a meeting request event.
	 *
	 * @param array $data Meeting request data.
	 * @return void
	 */
	public static function on_meeting_request( $data ) {
		try {
			$profile_id = isset( $data['profile_id'] ) ? (int) $data['profile_id'] : 0;
			$name       = isset( $data['name'] ) ? $data['name'] : 'Unknown';
			$email      = isset( $data['email'] ) ? $data['email'] : '';

			ActivityLog::log(
				$profile_id,
				'meeting_requested',
				'meeting',
				sprintf( 'Meeting request from %s', $name ),
				array(
					'requester_name'  => $name,
					'requester_email' => $email,
				),
				null,
				null
			);
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Silently fail to avoid breaking the hooked action.
		}
	}

	/**
	 * Record a post published event.
	 *
	 * @param string   $new_status New post status.
	 * @param string   $old_status Old post status.
	 * @param \WP_Post $post       The post object.
	 * @return void
	 */
	public static function on_post_published( $new_status, $old_status, $post ) {
		try {
			if ( 'publish' !== $new_status || 'publish' === $old_status ) {
				return;
			}

			if ( ! in_array( $post->post_type, self::$tracked_post_types, true ) ) {
				return;
			}

			$title = get_the_title( $post->ID );

			ActivityLog::log(
				(int) $post->post_author,
				'post_published',
				'post',
				sprintf( 'Published: %s', $title ),
				array(
					'post_type'  => $post->post_type,
					'post_title' => $title,
				),
				get_current_user_id() ?: null,
				$post->ID
			);
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Silently fail to avoid breaking the hooked action.
		}
	}

	/**
	 * Record a Tutor LMS lesson completion event.
	 *
	 * @param int $lesson_id The completed lesson ID.
	 * @return void
	 */
	public static function on_lesson_completed( $lesson_id ) {
		try {
			$user_id = get_current_user_id();
			$title   = get_the_title( $lesson_id );

			ActivityLog::log(
				$user_id,
				'lesson_completed',
				'course',
				sprintf( 'Completed lesson: %s', $title ),
				array(
					'lesson_id'    => (int) $lesson_id,
					'lesson_title' => $title,
				),
				$user_id,
				(int) $lesson_id
			);
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Silently fail to avoid breaking the hooked action.
		}
	}

	/**
	 * Record a Tutor LMS course enrollment event.
	 *
	 * @param int  $course_id  The course ID.
	 * @param bool $isEnrolled Whether the user was successfully enrolled.
	 * @return void
	 */
	public static function on_course_enrolled( $course_id, $isEnrolled ) {
		try {
			if ( ! $isEnrolled ) {
				return;
			}

			$user_id = get_current_user_id();
			$title   = get_the_title( $course_id );

			ActivityLog::log(
				$user_id,
				'course_enrolled',
				'course',
				sprintf( 'Enrolled in: %s', $title ),
				array(
					'course_id'    => (int) $course_id,
					'course_title' => $title,
				),
				$user_id,
				(int) $course_id
			);
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Silently fail to avoid breaking the hooked action.
		}
	}

	/**
	 * Convert a meta key to a human-readable name.
	 *
	 * Strips the frs_ prefix and replaces underscores with spaces.
	 *
	 * @param string $field_key The raw field key.
	 * @return string
	 */
	private static function pretty_field_name( $field_key ) {
		// Strip common prefix.
		$name = preg_replace( '/^frs_/', '', $field_key );

		return str_replace( '_', ' ', $name );
	}

	/**
	 * Build a summary string from a list of pretty field names.
	 *
	 * Shows up to $max_summary_fields names, then "and X more".
	 *
	 * @param array $names Pretty-printed field names.
	 * @return string
	 */
	private static function build_fields_summary( $names ) {
		$total = count( $names );

		if ( 0 === $total ) {
			return 'Updated profile';
		}

		if ( $total <= self::$max_summary_fields ) {
			return sprintf( 'Updated profile fields: %s', implode( ', ', $names ) );
		}

		$visible   = array_slice( $names, 0, self::$max_summary_fields );
		$remaining = $total - self::$max_summary_fields;

		return sprintf(
			'Updated profile fields: %s and %d more',
			implode( ', ', $visible ),
			$remaining
		);
	}
}
