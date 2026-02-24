<?php
/**
 * FluentCRM Notifications
 *
 * Applies FluentCRM tags/lists and sends admin emails
 * based on FRS event notification settings.
 *
 * @package FRSUsers
 * @subpackage Integrations
 * @since 4.2.0
 */

namespace FRSUsers\Integrations;

use FRSUsers\Admin\NotificationsPage;
use FRSUsers\Core\Roles;
use FRSUsers\Models\Profile;

/**
 * Class FluentCRMNotifications
 *
 * Listens for FRS events and triggers FluentCRM tag/list assignments
 * and optional admin email alerts.
 */
class FluentCRMNotifications {

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public static function init() {
		if ( ! function_exists( 'FluentCrmApi' ) ) {
			return;
		}

		// New employee (user_register fires with user_id).
		add_action( 'user_register', array( __CLASS__, 'handle_new_employee' ), 20, 1 );

		// Profile updated via REST API.
		add_action( 'frs_profile_saved', array( __CLASS__, 'handle_profile_updated' ), 20, 2 );

		// Role changed.
		add_action( 'set_user_role', array( __CLASS__, 'handle_role_changed' ), 20, 3 );

		// Status changes — fired from profile save when is_active meta changes.
		add_action( 'frs_profile_status_active', array( __CLASS__, 'handle_status_active' ), 10, 1 );
		add_action( 'frs_profile_status_inactive', array( __CLASS__, 'handle_status_inactive' ), 10, 1 );

		// Hook into profile meta updates to detect status changes.
		add_action( 'updated_user_meta', array( __CLASS__, 'detect_status_change' ), 10, 4 );
		add_action( 'added_user_meta', array( __CLASS__, 'detect_status_added' ), 10, 4 );
	}

	/**
	 * Detect status change from user meta update.
	 *
	 * @param int    $meta_id    Meta ID.
	 * @param int    $user_id    User ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value New meta value.
	 * @return void
	 */
	public static function detect_status_change( int $meta_id, int $user_id, string $meta_key, $meta_value ): void {
		if ( 'frs_is_active' !== $meta_key ) {
			return;
		}

		if ( (int) $meta_value === 1 ) {
			do_action( 'frs_profile_status_active', $user_id );
		} else {
			do_action( 'frs_profile_status_inactive', $user_id );
		}
	}

	/**
	 * Detect status added for new meta entries.
	 *
	 * @param int    $meta_id    Meta ID.
	 * @param int    $user_id    User ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 * @return void
	 */
	public static function detect_status_added( int $meta_id, int $user_id, string $meta_key, $meta_value ): void {
		if ( 'frs_is_active' !== $meta_key ) {
			return;
		}

		if ( (int) $meta_value === 1 ) {
			do_action( 'frs_profile_status_active', $user_id );
		}
	}

	/**
	 * Handle new employee event.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function handle_new_employee( int $user_id ): void {
		if ( ! self::is_frs_user( $user_id ) ) {
			return;
		}

		$event = NotificationsPage::get_event_settings( 'new_employee' );
		if ( ! $event || empty( $event['enabled'] ) ) {
			return;
		}

		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			return;
		}

		self::apply_fluentcrm_actions( $user->user_email, $event );

		if ( ! empty( $event['admin_notify'] ) ) {
			$name = trim( $user->first_name . ' ' . $user->last_name ) ?: $user->display_name;
			self::send_admin_email(
				$event,
				sprintf( 'New Employee Onboarded: %s', $name ),
				sprintf(
					"A new employee has been added to the system.\n\nName: %s\nEmail: %s\nRole: %s\n\nEdit profile: %s",
					$name,
					$user->user_email,
					implode( ', ', $user->roles ),
					admin_url( 'user-edit.php?user_id=' . $user_id )
				)
			);
		}
	}

	/**
	 * Handle profile updated event.
	 *
	 * @param int   $profile_id   Profile ID.
	 * @param array $profile_data Profile data.
	 * @return void
	 */
	public static function handle_profile_updated( int $profile_id, array $profile_data ): void {
		$profile = Profile::find( $profile_id );
		if ( ! $profile || ! $profile->user_id ) {
			return;
		}

		$event = NotificationsPage::get_event_settings( 'profile_updated' );
		if ( ! $event || empty( $event['enabled'] ) ) {
			return;
		}

		$user = get_user_by( 'ID', $profile->user_id );
		if ( ! $user ) {
			return;
		}

		self::apply_fluentcrm_actions( $user->user_email, $event );

		if ( ! empty( $event['admin_notify'] ) ) {
			$name = trim( $user->first_name . ' ' . $user->last_name ) ?: $user->display_name;
			$changed = array_keys( $profile_data );
			self::send_admin_email(
				$event,
				sprintf( 'Profile Updated: %s', $name ),
				sprintf(
					"An employee has updated their profile.\n\nName: %s\nEmail: %s\nFields changed: %s\n\nView profile: %s",
					$name,
					$user->user_email,
					implode( ', ', array_slice( $changed, 0, 10 ) ),
					admin_url( 'admin.php?page=frs-profile-edit&user_id=' . $profile->user_id )
				)
			);
		}
	}

	/**
	 * Handle role changed event.
	 *
	 * @param int    $user_id   User ID.
	 * @param string $role      New role.
	 * @param array  $old_roles Old roles.
	 * @return void
	 */
	public static function handle_role_changed( int $user_id, string $role, array $old_roles ): void {
		if ( ! self::is_frs_user( $user_id ) ) {
			return;
		}

		$event = NotificationsPage::get_event_settings( 'role_changed' );
		if ( ! $event || empty( $event['enabled'] ) ) {
			return;
		}

		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			return;
		}

		self::apply_fluentcrm_actions( $user->user_email, $event );

		if ( ! empty( $event['admin_notify'] ) ) {
			$name = trim( $user->first_name . ' ' . $user->last_name ) ?: $user->display_name;
			self::send_admin_email(
				$event,
				sprintf( 'Role Changed: %s', $name ),
				sprintf(
					"An employee's role has changed.\n\nName: %s\nEmail: %s\nOld role: %s\nNew role: %s",
					$name,
					$user->user_email,
					implode( ', ', $old_roles ),
					$role
				)
			);
		}
	}

	/**
	 * Handle status changed to active.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function handle_status_active( int $user_id ): void {
		$event = NotificationsPage::get_event_settings( 'status_active' );
		if ( ! $event || empty( $event['enabled'] ) ) {
			return;
		}

		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			return;
		}

		self::apply_fluentcrm_actions( $user->user_email, $event );

		if ( ! empty( $event['admin_notify'] ) ) {
			$name = trim( $user->first_name . ' ' . $user->last_name ) ?: $user->display_name;
			self::send_admin_email(
				$event,
				sprintf( 'Employee Activated: %s', $name ),
				sprintf(
					"An employee profile has been activated.\n\nName: %s\nEmail: %s",
					$name,
					$user->user_email
				)
			);
		}
	}

	/**
	 * Handle status changed to inactive.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function handle_status_inactive( int $user_id ): void {
		$event = NotificationsPage::get_event_settings( 'status_inactive' );
		if ( ! $event || empty( $event['enabled'] ) ) {
			return;
		}

		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			return;
		}

		self::apply_fluentcrm_actions( $user->user_email, $event );

		if ( ! empty( $event['admin_notify'] ) ) {
			$name = trim( $user->first_name . ' ' . $user->last_name ) ?: $user->display_name;
			self::send_admin_email(
				$event,
				sprintf( 'Employee Deactivated: %s', $name ),
				sprintf(
					"An employee profile has been deactivated.\n\nName: %s\nEmail: %s",
					$name,
					$user->user_email
				)
			);
		}
	}

	/**
	 * Apply FluentCRM tags and lists to a contact.
	 *
	 * @param string $email Contact email.
	 * @param array  $event Event settings.
	 * @return void
	 */
	private static function apply_fluentcrm_actions( string $email, array $event ): void {
		try {
			$api     = FluentCrmApi( 'contacts' );
			$contact = $api->getContactByUserRef( $email );

			if ( ! $contact ) {
				// Contact doesn't exist yet — FluentCRMSync should create it.
				// Give it a moment then try again.
				return;
			}

			if ( ! empty( $event['tags'] ) ) {
				$contact->attachTags( $event['tags'] );
			}

			if ( ! empty( $event['lists'] ) ) {
				$contact->attachLists( $event['lists'] );
			}
		} catch ( \Exception $e ) {
			error_log( 'FRS Notifications: Failed to apply FluentCRM actions - ' . $e->getMessage() );
		}
	}

	/**
	 * Send admin email notification.
	 *
	 * @param array  $event   Event settings.
	 * @param string $subject Email subject.
	 * @param string $body    Email body.
	 * @return void
	 */
	private static function send_admin_email( array $event, string $subject, string $body ): void {
		$to = ! empty( $event['admin_emails'] )
			? $event['admin_emails']
			: get_option( 'admin_email' );

		$site_name = get_bloginfo( 'name' );
		$subject   = '[' . $site_name . '] ' . $subject;

		wp_mail( $to, $subject, $body );
	}

	/**
	 * Check if user has an FRS role.
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	private static function is_frs_user( int $user_id ): bool {
		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			return false;
		}

		$frs_roles = Roles::get_wp_role_slugs();
		$frs_roles[] = 'administrator';

		return ! empty( array_intersect( (array) $user->roles, $frs_roles ) );
	}
}
