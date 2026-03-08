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
		// Hook into profile saves to sync headshot to avatar system
		add_action( 'frs_profile_saved', array( __CLASS__, 'sync_headshot_to_avatar' ), 10, 2 );
	}

	/**
	 * Set user avatar using native Avatar system.
	 *
	 * @deprecated Use Avatar::set() directly.
	 *
	 * @param int    $user_id       User ID.
	 * @param int    $attachment_id Attachment ID for the avatar image.
	 * @param string $avatar_url    URL to the avatar image (ignored).
	 * @return bool Whether the avatar was set.
	 */
	public static function set_user_avatar( $user_id, $attachment_id, $avatar_url = '' ) {
		return Avatar::set( $user_id, $attachment_id );
	}

	/**
	 * Sync profile headshot to native avatar system.
	 *
	 * @param int   $profile_id   Profile ID.
	 * @param array $profile_data Profile data that was saved.
	 * @return void
	 */
	public static function sync_headshot_to_avatar( $profile_id, $profile_data ) {
		$profile = Profile::find( $profile_id );

		// Only sync if profile has user_id and headshot_id
		if ( ! $profile || ! $profile->user_id || ! $profile->headshot_id ) {
			return;
		}

		// Avatar::set is already called by Profile model save
		// This hook is kept for R2Storage CDN upload which runs at priority 5
	}
}
