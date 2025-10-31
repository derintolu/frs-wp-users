<?php
/**
 * Profile View Page
 *
 * Loads the React admin app for viewing profiles.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;

/**
 * Class ProfileView
 *
 * Renders the React app container for profile viewing.
 *
 * @package FRSUsers\Admin
 */
class ProfileView {

	/**
	 * Render the view page
	 *
	 * @param int $profile_id Profile ID to view.
	 * @return void
	 */
	public static function render( $profile_id ) {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( __( 'You do not have permission to view profiles', 'frs-users' ) );
		}

		// Verify profile exists
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( __( 'Profile not found', 'frs-users' ) );
		}

		// Render React app container
		?>
		<div class="wrap">
			<div id="frs-users-admin-root" data-route="/profiles/<?php echo esc_attr( $profile_id ); ?>"></div>
		</div>
		<?php
	}
}
