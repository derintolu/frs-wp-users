<?php
/**
 * Profile Merge Page
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Class ProfileMerge
 *
 * Handles merging duplicate profiles.
 *
 * @package FRSUsers\Admin
 */
class ProfileMerge {
	use Base;

	/**
	 * Initialize
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_post_frs_merge_profiles', array( $this, 'handle_merge' ) );
	}

	/**
	 * Render merge page
	 *
	 * @return void
	 */
	public static function render() {
		// Debug logging
		error_log( 'ProfileMerge::render() called' );
		error_log( 'GET data: ' . print_r( $_GET, true ) );

		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			error_log( 'ProfileMerge: Permission denied' );
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		// Get profile IDs
		$profile_ids = isset( $_GET['profile_ids'] ) ? sanitize_text_field( $_GET['profile_ids'] ) : '';
		error_log( 'ProfileMerge: profile_ids from GET: ' . $profile_ids );

		if ( empty( $profile_ids ) ) {
			error_log( 'ProfileMerge: No profile_ids in GET' );
			wp_die( esc_html__( 'No profiles selected.', 'frs-users' ) );
		}

		$profile_ids = array_map( 'absint', explode( ',', $profile_ids ) );
		error_log( 'ProfileMerge: Parsed profile IDs: ' . print_r( $profile_ids, true ) );

		if ( count( $profile_ids ) < 2 ) {
			wp_die( esc_html__( 'Please select at least 2 profiles to merge.', 'frs-users' ) );
		}

		// Get profiles
		$profiles = array();
		foreach ( $profile_ids as $id ) {
			$profile = Profile::find( $id );
			if ( $profile ) {
				$profiles[] = $profile;
			}
		}

		if ( count( $profiles ) < 2 ) {
			error_log( 'ProfileMerge: Not enough profiles found. Count: ' . count( $profiles ) );
			wp_die( esc_html__( 'Could not find enough profiles to merge.', 'frs-users' ) );
		}

		error_log( 'ProfileMerge: Loading template with ' . count( $profiles ) . ' profiles' );

		// For now, only handle 2 profiles at once
		if ( count( $profiles ) > 2 ) {
			$profiles = array_slice( $profiles, 0, 2 );
			echo '<div class="notice notice-warning"><p>' . esc_html__( 'Note: Only merging the first 2 profiles. Please merge additional profiles separately.', 'frs-users' ) . '</p></div>';
		}

		// Load new template with field-by-field selection
		$template_path = FRS_USERS_DIR . 'views/admin/profile-merge-new.php';
		error_log( 'ProfileMerge: Template path: ' . $template_path );
		error_log( 'ProfileMerge: Template exists: ' . ( file_exists( $template_path ) ? 'YES' : 'NO' ) );

		include $template_path;
	}

	/**
	 * Handle merge submission
	 *
	 * @return void
	 */
	public function handle_merge() {
		// Debug log
		error_log( 'ProfileMerge::handle_merge() called' );
		error_log( 'POST data: ' . print_r( $_POST, true ) );

		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			error_log( 'ProfileMerge: Permission denied' );
			wp_die( esc_html__( 'You do not have permission to perform this action.', 'frs-users' ) );
		}

		// Verify nonce
		if ( ! isset( $_POST['frs_merge_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['frs_merge_nonce'] ) ), 'frs_merge_profiles' ) ) {
			error_log( 'ProfileMerge: Nonce verification failed' );
			wp_die( esc_html__( 'Security check failed.', 'frs-users' ) );
		}

		// Get field selections
		$field_selections = isset( $_POST['field'] ) && is_array( $_POST['field'] ) ? $_POST['field'] : array();

		if ( empty( $field_selections ) ) {
			wp_die( esc_html__( 'No field selections provided.', 'frs-users' ) );
		}

		// Get all profile IDs
		$profile_ids = isset( $_POST['profile_ids'] ) ? sanitize_text_field( $_POST['profile_ids'] ) : '';
		$profile_ids = array_map( 'absint', explode( ',', $profile_ids ) );

		if ( count( $profile_ids ) < 2 ) {
			wp_die( esc_html__( 'At least 2 profiles required for merge.', 'frs-users' ) );
		}

		// Get the profiles
		$profiles_map = array();
		foreach ( $profile_ids as $id ) {
			$profile = Profile::find( $id );
			if ( $profile ) {
				$profiles_map[ $id ] = $profile;
			}
		}

		if ( count( $profiles_map ) < 2 ) {
			wp_die( esc_html__( 'Could not find profiles for merge.', 'frs-users' ) );
		}

		// Create new merged profile data
		$merged_data = array(
			'email'       => '',
			'first_name'  => '',
			'last_name'   => '',
			'is_active'   => 1,
		);

		// Process each field selection
		foreach ( $field_selections as $field_name => $source_profile_id ) {
			$source_profile_id = absint( $source_profile_id );

			if ( ! isset( $profiles_map[ $source_profile_id ] ) ) {
				continue;
			}

			$source_profile = $profiles_map[ $source_profile_id ];
			$value = $source_profile->$field_name ?? null;

			if ( ! empty( $value ) || $value === 0 || $value === '0' ) {
				$merged_data[ $field_name ] = $value;
			}
		}

		// Delete the original profiles FIRST (to avoid unique email constraint)
		$merged_count = 0;
		foreach ( $profiles_map as $profile ) {
			$profile->delete();
			$merged_count++;
		}

		// Now create the new merged profile (no email conflict)
		$merged_profile = Profile::create( $merged_data );

		if ( ! $merged_profile ) {
			wp_die( esc_html__( 'Failed to create merged profile.', 'frs-users' ) );
		}

		// Debug log
		error_log( 'ProfileMerge: Successfully merged ' . $merged_count . ' profiles into new profile ' . $merged_profile->id );

		// Redirect with success message
		$redirect_url = add_query_arg(
			array(
				'page'    => 'frs-profiles',
				'message' => 'merged',
				'count'   => $merged_count,
			),
			admin_url( 'admin.php' )
		);

		error_log( 'ProfileMerge: Redirecting to ' . $redirect_url );

		wp_safe_redirect( $redirect_url );
		exit;
	}
}
