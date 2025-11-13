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

		// Handle profile pages generation
		if ( isset( $_POST['frs_generate_profile_pages'] ) && check_admin_referer( 'frs_generate_profile_pages_' . $profile->id ) ) {
			$submitted_profile_id = isset( $_POST['profile_id'] ) ? intval( $_POST['profile_id'] ) : 0;

			if ( $submitted_profile_id === $profile->id ) {
				// Trigger page generation for this profile
				if ( class_exists( 'FRSUsers\\Controllers\\PostTypes' ) ) {
					$post_types = \FRSUsers\Controllers\PostTypes::get_instance();
					// Use reflection to call private method
					$method = new \ReflectionMethod( $post_types, 'generate_profile_pages_for_profile' );
					$method->setAccessible( true );
					$method->invoke( $post_types, $profile->id, $profile->full_name );

					// Show success message
					add_settings_error(
						'frs_profile_pages',
						'pages_generated',
						__( 'Profile pages generated successfully!', 'frs-users' ),
						'success'
					);

					// Clear transient to allow regeneration
					delete_transient( 'frs_profile_pages_generated_' . $profile->id );
				}
			}
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
