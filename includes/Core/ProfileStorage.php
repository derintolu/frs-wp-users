<?php
/**
 * Profile Storage Utilities
 *
 * Handles profile-related storage operations and sync utilities.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;

/**
 * Class ProfileStorage
 *
 * Handles storage utilities for profiles.
 *
 * @package FRSUsers\Core
 */
class ProfileStorage {

	/**
	 * Initialize storage hooks
	 *
	 * @return void
	 */
	public static function init() {
		// Hook into profile saves to sync with Simple User Avatar
		add_action( 'frs_profile_saved', array( __CLASS__, 'sync_avatar_to_simple_user_avatar' ), 10, 2 );
	}

	/**
	 * Sync profile headshot to Simple Local Avatars
	 *
	 * @param int   $profile_id Profile ID.
	 * @param array $profile_data Profile data that was saved.
	 * @return void
	 */
	public static function sync_avatar_to_simple_user_avatar( $profile_id, $profile_data ) {
		$profile = Profile::find( $profile_id );

		// Only sync if profile has user_id and headshot_id
		if ( ! $profile || ! $profile->user_id || ! $profile->headshot_id ) {
			return;
		}

		// Get the attachment URL for the headshot
		$headshot_url = wp_get_attachment_url( $profile->headshot_id );

		if ( ! $headshot_url ) {
			error_log( sprintf(
				'FRS Profiles: Failed to get URL for headshot %d',
				$profile->headshot_id
			) );
			return;
		}

		// Update Simple Local Avatars meta with the correct structure
		// Structure: array( 'media_id' => $id, 'full' => $url, 'blog_id' => $blog_id )
		update_user_meta(
			$profile->user_id,
			'simple_local_avatar',
			array(
				'media_id' => $profile->headshot_id,
				'full'     => $headshot_url,
				'blog_id'  => get_current_blog_id(),
			)
		);

		error_log( sprintf(
			'FRS Profiles: Synced headshot %d to Simple Local Avatars for user %d',
			$profile->headshot_id,
			$profile->user_id
		) );
	}
}
