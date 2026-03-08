<?php
/**
 * Avatar Handler - Single Source of Truth
 *
 * ALL avatar/headshot reads and writes MUST go through this class.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

/**
 * Class Avatar
 *
 * Single source of truth for user avatars/headshots.
 * Hooks into WordPress avatar system so get_avatar() works everywhere.
 *
 * @package FRSUsers\Core
 */
class Avatar {

	/**
	 * Meta key for storing avatar attachment ID.
	 */
	const META_KEY = 'frs_headshot_id';

	/**
	 * Meta key for CDN URL (set by R2Storage after upload).
	 */
	const CDN_META_KEY = 'frs_headshot_cdn_url';

	/**
	 * Initialize avatar hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_filter( 'pre_get_avatar_data', array( __CLASS__, 'filter_avatar_data' ), 10, 2 );
	}

	/**
	 * Filter avatar data to use FRS headshot.
	 *
	 * @param array $args        Avatar data arguments.
	 * @param mixed $id_or_email User ID, email, WP_User, WP_Post, or WP_Comment.
	 * @return array Modified avatar data.
	 */
	public static function filter_avatar_data( $args, $id_or_email ) {
		$user_id = self::resolve_user_id( $id_or_email );

		if ( ! $user_id ) {
			return $args;
		}

		$avatar_url = self::get_url( $user_id, $args['size'] ?? 96 );

		if ( ! $avatar_url ) {
			return $args;
		}

		$args['url']          = $avatar_url;
		$args['found_avatar'] = true;

		return $args;
	}

	/**
	 * Get user ID from various input types.
	 *
	 * @param mixed $id_or_email User ID, email, WP_User, WP_Post, or WP_Comment.
	 * @return int|false User ID or false if not found.
	 */
	public static function resolve_user_id( $id_or_email ) {
		if ( is_numeric( $id_or_email ) ) {
			return absint( $id_or_email );
		}

		if ( is_string( $id_or_email ) && is_email( $id_or_email ) ) {
			$user = get_user_by( 'email', $id_or_email );
			return $user ? $user->ID : false;
		}

		if ( $id_or_email instanceof \WP_User ) {
			return $id_or_email->ID;
		}

		if ( $id_or_email instanceof \WP_Post ) {
			return $id_or_email->post_author;
		}

		if ( $id_or_email instanceof \WP_Comment ) {
			if ( $id_or_email->user_id ) {
				return $id_or_email->user_id;
			}
			if ( $id_or_email->comment_author_email ) {
				$user = get_user_by( 'email', $id_or_email->comment_author_email );
				return $user ? $user->ID : false;
			}
		}

		return false;
	}

	/**
	 * GET: Get avatar URL for a user.
	 *
	 * This is THE method to get avatar URL. All code should use this.
	 * Priority: CDN URL (if set) > Local attachment URL
	 *
	 * @param int $user_id User ID.
	 * @param int $size    Desired size in pixels.
	 * @return string|false Avatar URL or false if none.
	 */
	public static function get_url( $user_id, $size = 96 ) {
		if ( ! $user_id ) {
			return false;
		}

		// Check for CDN URL first (set by R2Storage)
		$cdn_url = get_user_meta( $user_id, self::CDN_META_KEY, true );
		if ( $cdn_url ) {
			return $cdn_url;
		}

		// Fall back to local attachment
		$attachment_id = self::get_id( $user_id );
		if ( ! $attachment_id ) {
			return false;
		}

		// Get sized image
		$image = wp_get_attachment_image_src( $attachment_id, self::get_wp_size( $size ) );
		if ( $image && ! empty( $image[0] ) ) {
			return $image[0];
		}

		// Fallback to full size
		return wp_get_attachment_url( $attachment_id );
	}

	/**
	 * GET: Get avatar attachment ID for a user.
	 *
	 * @param int $user_id User ID.
	 * @return int Attachment ID or 0 if none.
	 */
	public static function get_id( $user_id ) {
		if ( ! $user_id ) {
			return 0;
		}
		return (int) get_user_meta( $user_id, self::META_KEY, true );
	}

	/**
	 * SET: Set avatar for a user.
	 *
	 * This is THE method to set avatar. All code should use this.
	 *
	 * @param int $user_id       User ID.
	 * @param int $attachment_id Attachment ID.
	 * @return bool Success.
	 */
	public static function set( $user_id, $attachment_id ) {
		if ( ! $user_id ) {
			return false;
		}

		$attachment_id = absint( $attachment_id );

		if ( $attachment_id ) {
			update_user_meta( $user_id, self::META_KEY, $attachment_id );
		} else {
			delete_user_meta( $user_id, self::META_KEY );
		}

		// Clean up any legacy URL meta
		delete_user_meta( $user_id, 'frs_headshot_url' );

		return true;
	}

	/**
	 * DELETE: Remove avatar for a user.
	 *
	 * @param int $user_id User ID.
	 * @return bool Success.
	 */
	public static function delete( $user_id ) {
		return self::set( $user_id, 0 );
	}

	/**
	 * CHECK: Does user have an avatar?
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function has( $user_id ) {
		return self::get_id( $user_id ) > 0;
	}

	/**
	 * Map pixel size to WordPress image size.
	 *
	 * @param int $size Size in pixels.
	 * @return string WordPress image size name.
	 */
	private static function get_wp_size( $size ) {
		if ( $size <= 96 ) {
			return 'thumbnail';
		}
		if ( $size <= 256 ) {
			return 'medium';
		}
		if ( $size <= 512 ) {
			return 'medium_large';
		}
		return 'full';
	}
}
