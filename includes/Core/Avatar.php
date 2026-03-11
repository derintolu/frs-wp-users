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

		$avatar_url = self::get_url( $user_id );

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
	 * Priority: CDN URL (if set) > Local attachment URL (full size, no rewrites)
	 *
	 * @param int $user_id User ID.
	 * @return string|false Avatar URL or false if none.
	 */
	public static function get_url( $user_id ) {
		if ( ! $user_id ) {
			return false;
		}

		// Check for CDN URL first (set by R2Storage)
		$cdn_url = get_user_meta( $user_id, self::CDN_META_KEY, true );
		if ( $cdn_url ) {
			return $cdn_url;
		}

		// Fall back to local attachment — always full size, no size rewrites
		$attachment_id = self::get_id( $user_id );
		if ( ! $attachment_id ) {
			return false;
		}

		return self::get_attachment_url_on_main_site( $attachment_id );
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
	 * Migrate all legacy avatar sources into frs_headshot_id.
	 *
	 * Finds photos from WPO365 profile-images folder, basic_user_avatar meta,
	 * and simple_local_avatar meta. Imports them into the WordPress media library
	 * and sets frs_headshot_id so Avatar::get_url() returns them.
	 *
	 * @param bool $dry_run If true, report what would happen without changing anything.
	 * @return array Results with keys: migrated, already_set, skipped, errors.
	 */
	public static function migrate_legacy_avatars( $dry_run = false ) {
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$results = array(
			'migrated'    => 0,
			'already_set' => 0,
			'skipped'     => 0,
			'errors'      => 0,
		);

		$users = get_users( array( 'fields' => array( 'ID' ) ) );

		foreach ( $users as $user ) {
			$user_id = (int) $user->ID;

			if ( self::get_id( $user_id ) > 0 ) {
				$results['already_set']++;
				continue;
			}

			$photo_url = self::find_legacy_photo( $user_id );
			if ( ! $photo_url ) {
				$results['skipped']++;
				continue;
			}

			if ( $dry_run ) {
				if ( class_exists( 'WP_CLI' ) ) {
					\WP_CLI::log( sprintf( '  Would migrate user %d: %s', $user_id, $photo_url ) );
				}
				$results['migrated']++;
				continue;
			}

			$attachment_id = self::import_photo( $user_id, $photo_url );
			if ( $attachment_id ) {
				self::set( $user_id, $attachment_id );
				$results['migrated']++;
			} else {
				$results['errors']++;
			}
		}

		return $results;
	}

	/**
	 * Find a legacy photo URL for a user from any source.
	 *
	 * @param int $user_id User ID.
	 * @return string|false Photo URL or false.
	 */
	private static function find_legacy_photo( $user_id ) {
		// WPO365 profile image
		$upload_dir = wp_upload_dir();
		$wpo_path   = $upload_dir['basedir'] . '/wpo365/profile-images/' . $user_id . '.png';
		if ( file_exists( $wpo_path ) ) {
			return $upload_dir['baseurl'] . '/wpo365/profile-images/' . $user_id . '.png';
		}

		// basic_user_avatar meta
		$bua = get_user_meta( $user_id, 'basic_user_avatar', true );
		if ( is_array( $bua ) && ! empty( $bua['full'] ) ) {
			return $bua['full'];
		}

		// simple_local_avatar meta
		$sla = get_user_meta( $user_id, 'simple_local_avatar', true );
		if ( is_array( $sla ) && ! empty( $sla['full'] ) ) {
			return $sla['full'];
		}

		return false;
	}

	/**
	 * Import a photo into the media library for a user.
	 *
	 * @param int    $user_id   User ID.
	 * @param string $photo_url URL or local path to photo.
	 * @return int|false Attachment ID or false on failure.
	 */
	private static function import_photo( $user_id, $photo_url ) {
		// Check if this URL was already imported
		$url_hash = md5( $photo_url );
		$existing = get_posts( array(
			'post_type'      => 'attachment',
			'meta_query'     => array(
				array(
					'key'   => '_frs_image_url_hash',
					'value' => $url_hash,
				),
			),
			'posts_per_page' => 1,
		) );

		if ( $existing ) {
			return $existing[0]->ID;
		}

		// If it's a local file path (same server), use it directly
		$upload_dir = wp_upload_dir();
		$local_path = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $photo_url );
		if ( file_exists( $local_path ) ) {
			$tmp = wp_tempnam( basename( $local_path ) );
			copy( $local_path, $tmp );
		} else {
			$tmp = download_url( $photo_url );
			if ( is_wp_error( $tmp ) ) {
				return false;
			}
		}

		$file_array = array(
			'name'     => sanitize_file_name( 'headshot-' . $user_id . '-' . basename( $photo_url ) ),
			'tmp_name' => $tmp,
		);

		$attachment_id = media_handle_sideload( $file_array, 0 );
		if ( is_wp_error( $attachment_id ) ) {
			@unlink( $tmp );
			return false;
		}

		update_post_meta( $attachment_id, '_frs_image_url_hash', $url_hash );
		update_post_meta( $attachment_id, '_frs_original_url', $photo_url );

		return $attachment_id;
	}

	/**
	 * Resolve an attachment URL on the main site (blog 1).
	 *
	 * On multisite with a central media library, all attachments live on blog 1.
	 * This helper switches to blog 1 before resolving so URLs are always correct,
	 * regardless of which subsite is currently active.
	 *
	 * Can be called from anywhere in the plugin — not just Avatar methods.
	 *
	 * @param int $attachment_id Attachment ID (must exist on blog 1).
	 * @return string|false     Full-size attachment URL or false.
	 */
	public static function get_attachment_url_on_main_site( $attachment_id ) {
		if ( ! $attachment_id ) {
			return false;
		}

		$switched = false;
		if ( is_multisite() && get_current_blog_id() !== 1 ) {
			switch_to_blog( 1 );
			$switched = true;
		}

		// Always full size — no size rewrites
		$url = wp_get_attachment_url( $attachment_id );

		if ( $switched ) {
			restore_current_blog();
		}

		return $url;
	}


}
