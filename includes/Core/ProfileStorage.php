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
		// Hook into profile saves to sync with avatar plugins
		add_action( 'frs_profile_saved', array( __CLASS__, 'sync_avatar_to_simple_user_avatar' ), 10, 2 );
	}

	/**
	 * Get the active avatar plugin meta key and format.
	 *
	 * Supports: basic-user-avatars, simple-local-avatars
	 *
	 * @return string Meta key for the active avatar plugin.
	 */
	public static function get_avatar_meta_key() {
		// Ensure is_plugin_active() is available
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		// Check for Basic User Avatars plugin (must be active)
		if ( is_plugin_active( 'basic-user-avatars/init.php' ) ) {
			return 'basic_user_avatar';
		}

		// Check for Simple Local Avatars plugin (must be active)
		if ( is_plugin_active( 'simple-local-avatars/simple-local-avatars.php' ) ) {
			return 'simple_local_avatar';
		}

		// Default to Simple Local Avatars format (works even without a dedicated avatar plugin)
		return 'simple_local_avatar';
	}

	/**
	 * Set user avatar meta for the active avatar plugin.
	 *
	 * @param int    $user_id User ID.
	 * @param int    $attachment_id Attachment ID for the avatar image.
	 * @param string $avatar_url URL to the avatar image.
	 * @return bool Whether the meta was updated.
	 */
	public static function set_user_avatar( $user_id, $attachment_id, $avatar_url ) {
		if ( ! $user_id || ! $avatar_url ) {
			return false;
		}

		$meta_key = self::get_avatar_meta_key();

		if ( 'basic_user_avatar' === $meta_key ) {
			// Basic User Avatars format: array( 'full' => $url )
			$avatar_data = array( 'full' => $avatar_url );
		} else {
			// Simple Local Avatars format: array( 'media_id' => $id, 'full' => $url, 'blog_id' => $blog_id )
			$avatar_data = array(
				'media_id' => $attachment_id,
				'full'     => $avatar_url,
				'blog_id'  => get_current_blog_id(),
			);
		}

		return update_user_meta( $user_id, $meta_key, $avatar_data );
	}

	/**
	 * Sync profile headshot to avatar plugin (Simple Local Avatars or Basic User Avatars)
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

		// Use the centralized avatar setter
		self::set_user_avatar( $profile->user_id, $profile->headshot_id, $headshot_url );

		error_log( sprintf(
			'FRS Profiles: Synced headshot %d to avatar plugin for user %d (meta: %s)',
			$profile->headshot_id,
			$profile->user_id,
			self::get_avatar_meta_key()
		) );
	}
}
