<?php
/**
 * Calendar Provisioner
 *
 * Creates FluentBooking calendars and event types programmatically
 * for loan officer onboarding.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 3.3.0
 */

namespace FRSUsers\Core;

use FluentBooking\App\Models\Calendar;
use FluentBooking\App\Models\CalendarSlot;
use FluentBooking\App\Services\AvailabilityService;
use FluentBooking\App\Services\Helper;

defined( 'ABSPATH' ) || exit;

class CalendarProvisioner {

	/**
	 * Booking page templates available for selection.
	 *
	 * @return array
	 */
	public static function get_templates(): array {
		return array(
			'consultation' => array(
				'title'         => '30-Minute Loan Consultation',
				'duration'      => 30,
				'location_type' => 'ms_teams',
				'description'   => 'Schedule a consultation to discuss your lending needs and explore your options.',
			),
			'preapproval'  => array(
				'title'         => '45-Minute Pre-Approval Review',
				'duration'      => 45,
				'location_type' => 'ms_teams',
				'description'   => 'Walk through the pre-approval process together and get you on the path to homeownership.',
			),
			'quick_call'   => array(
				'title'         => '15-Minute Quick Call',
				'duration'      => 15,
				'location_type' => 'phone_call',
				'description'   => 'A quick call to answer your questions or get started.',
			),
		);
	}

	/**
	 * Provision a FluentBooking calendar + event slot for a user.
	 *
	 * @param int    $user_id      WordPress user ID.
	 * @param string $template_key Template key (consultation, preapproval, quick_call).
	 * @return array|WP_Error Result with calendar_id, event_id, booking_url.
	 */
	public static function provision_calendar( int $user_id, string $template_key ) {
		if ( ! class_exists( '\\FluentBooking\\App\\Models\\Calendar' ) ) {
			return new \WP_Error( 'fluent_booking_missing', 'FluentBooking is not active.' );
		}

		$templates = self::get_templates();
		if ( ! isset( $templates[ $template_key ] ) ) {
			return new \WP_Error( 'invalid_template', 'Invalid template key: ' . $template_key );
		}

		$template = $templates[ $template_key ];
		$user     = get_userdata( $user_id );
		if ( ! $user ) {
			return new \WP_Error( 'invalid_user', 'User not found.' );
		}

		$first_name = $user->first_name ?: $user->display_name;
		$last_name  = $user->last_name ?: '';
		$full_name  = trim( $first_name . ' ' . $last_name );

		// Check if user already has a calendar
		$existing = Calendar::where( 'user_id', $user_id )
			->where( 'type', 'simple' )
			->first();

		if ( $existing ) {
			// User already has a calendar — find the booking URL
			$slot = CalendarSlot::where( 'calendar_id', $existing->id )->first();
			$booking_url = self::build_booking_url( $existing );
			update_user_meta( $user_id, 'frs_booking_url', $booking_url );

			return array(
				'calendar_id' => $existing->id,
				'event_id'    => $slot ? $slot->id : null,
				'booking_url' => $booking_url,
				'existing'    => true,
			);
		}

		// Generate a unique slug
		$base_slug = sanitize_title( $full_name );
		$slug      = $base_slug;
		if ( class_exists( '\\FluentBooking\\App\\Services\\Helper' ) && method_exists( Helper::class, 'generateSlotSlug' ) ) {
			$slug = Helper::generateSlotSlug( $base_slug );
		}

		// Get user's timezone (fall back to site timezone)
		$timezone = get_user_meta( $user_id, 'frs_timezone', true );
		if ( empty( $timezone ) ) {
			$timezone = wp_timezone_string();
		}

		// Create the calendar
		$calendar = Calendar::create(
			array(
				'user_id'     => $user_id,
				'title'       => $full_name,
				'slug'        => $slug,
				'type'        => 'simple',
				'description' => "Book a meeting with {$full_name}",
				'status'      => 'active',
			)
		);

		if ( ! $calendar || ! $calendar->id ) {
			return new \WP_Error( 'calendar_create_failed', 'Failed to create FluentBooking calendar.' );
		}

		// Create default availability (Mon-Fri, 9am-5pm)
		if ( class_exists( '\\FluentBooking\\App\\Services\\AvailabilityService' ) ) {
			AvailabilityService::maybeCreateAvailability( $calendar );
		}

		// Build location settings based on template
		$location = array();
		if ( 'ms_teams' === $template['location_type'] ) {
			$location = array(
				array(
					'type'  => 'online_meeting',
					'title' => 'Microsoft Teams',
				),
			);
		} elseif ( 'phone_call' === $template['location_type'] ) {
			$location = array(
				array(
					'type'  => 'phone_call',
					'title' => 'Phone Call',
				),
			);
		}

		// Generate a slot slug
		$slot_slug = sanitize_title( $template['title'] );
		if ( class_exists( '\\FluentBooking\\App\\Services\\Helper' ) && method_exists( Helper::class, 'generateSlotSlug' ) ) {
			$slot_slug = Helper::generateSlotSlug( $slot_slug );
		}

		// Create the event/slot
		$slot = CalendarSlot::create(
			array(
				'calendar_id' => $calendar->id,
				'title'       => $template['title'],
				'slug'        => $slot_slug,
				'duration'    => $template['duration'],
				'description' => $template['description'],
				'status'      => 'active',
				'color_schema' => '#2563eb',
				'settings'    => array(
					'schedule_type'         => 'weekly_schedules',
					'weekly_schedules'      => self::get_default_weekly_schedules(),
					'slot_duration'         => $template['duration'],
					'buffer_time_before'    => 0,
					'buffer_time_after'     => 10,
					'max_bookings_per_day'  => 0,
					'min_booking_notice'    => 60,
					'max_booking_per_slot'  => 1,
					'range_type'            => 'range_days',
					'range_days'            => 60,
					'timezone'              => $timezone,
					'location'              => $location,
				),
			)
		);

		// Enable sharing/public visibility
		$calendar->updateMeta( 'sharing_settings', array(
			'enabled'   => 'yes',
			'show_type' => 'all',
		) );

		// Build the booking URL
		$booking_url = self::build_booking_url( $calendar );

		// Store booking URL in user meta
		update_user_meta( $user_id, 'frs_booking_url', $booking_url );

		return array(
			'calendar_id' => $calendar->id,
			'event_id'    => $slot ? $slot->id : null,
			'booking_url' => $booking_url,
			'existing'    => false,
		);
	}

	/**
	 * Check if a user already has a FluentBooking calendar.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return bool
	 */
	public static function user_has_calendar( int $user_id ): bool {
		if ( ! class_exists( '\\FluentBooking\\App\\Models\\Calendar' ) ) {
			return false;
		}

		return Calendar::where( 'user_id', $user_id )
			->where( 'type', 'simple' )
			->exists();
	}

	/**
	 * Build the public booking URL for a calendar.
	 *
	 * @param Calendar $calendar FluentBooking calendar.
	 * @return string
	 */
	private static function build_booking_url( $calendar ): string {
		$hub_url = defined( 'FRS_HUB_URL' ) ? FRS_HUB_URL : home_url();
		return trailingslashit( $hub_url ) . '?fluent-booking=calendar&host=' . $calendar->slug;
	}

	/**
	 * Get default Mon-Fri 9am-5pm weekly schedule structure.
	 *
	 * @return array
	 */
	private static function get_default_weekly_schedules(): array {
		$weekdays = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday' );
		$schedule = array();

		foreach ( $weekdays as $day ) {
			$schedule[ $day ] = array(
				'enabled' => true,
				'slots'   => array(
					array(
						'start' => '09:00',
						'end'   => '17:00',
					),
				),
			);
		}

		$schedule['saturday'] = array( 'enabled' => false, 'slots' => array() );
		$schedule['sunday']   = array( 'enabled' => false, 'slots' => array() );

		return $schedule;
	}
}
