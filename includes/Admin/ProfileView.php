<?php
/**
 * Profile View Page
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Class ProfileView
 *
 * Handles the profile view admin page (read-only).
 *
 * @package FRSUsers\Admin
 */
class ProfileView {
	use Base;

	/**
	 * Render view page
	 *
	 * @param int $profile_id Profile ID to view.
	 * @return void
	 */
	public static function render( $profile_id ) {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		// Get profile
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
		}

		// Helper function to decode JSON fields
		$decode_json = function( $value ) {
			if ( empty( $value ) ) {
				return array();
			}
			if ( is_array( $value ) ) {
				return $value;
			}
			$decoded = json_decode( $value, true );
			return is_array( $decoded ) ? $decoded : array();
		};

		// Get headshot URL
		$headshot_url = '';
		if ( $profile->headshot_id ) {
			$headshot_url = wp_get_attachment_image_url( $profile->headshot_id, 'medium' );
		}

		// Page title
		$page_title = sprintf( __( 'Profile: %s', 'frs-users' ), $profile->first_name . ' ' . $profile->last_name );

		// Load template
		include FRS_USERS_DIR . 'views/admin/profile-view.php';
	}
}
