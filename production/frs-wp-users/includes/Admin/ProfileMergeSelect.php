<?php
/**
 * Profile Merge Selection Page
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Class ProfileMergeSelect
 *
 * Handles the selection of a second profile to merge with.
 *
 * @package FRSUsers\Admin
 */
class ProfileMergeSelect {
	use Base;

	/**
	 * Render merge selection page
	 *
	 * @return void
	 */
	public static function render() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		// Get the first profile ID
		$profile_id = isset( $_GET['profile_id'] ) ? absint( $_GET['profile_id'] ) : 0;

		if ( ! $profile_id ) {
			wp_die( esc_html__( 'No profile selected.', 'frs-users' ) );
		}

		// Get the first profile
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
		}

		// Get search query
		$search = isset( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';

		// Get profiles for selection (exclude the current profile)
		$query = Profile::where( 'id', '!=', $profile_id );

		if ( ! empty( $search ) ) {
			$query->where( function( $q ) use ( $search ) {
				$q->where( 'first_name', 'like', '%' . $search . '%' )
				  ->orWhere( 'last_name', 'like', '%' . $search . '%' )
				  ->orWhere( 'email', 'like', '%' . $search . '%' );
			});
		}

		$profiles = $query->orderBy( 'last_name' )->limit( 50 )->get();

		// Load template
		include FRS_USERS_DIR . 'views/admin/profile-merge-select.php';
	}
}
