<?php
/**
 * Native Avatar Handler
 *
 * Integrates FRS headshots with WordPress avatar system, replacing external avatar plugins.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

/**
 * Class Avatar
 *
 * Hooks into WordPress avatar filters to serve FRS headshots as avatars.
 * Works across multisite, directories, blocks, and anywhere get_avatar() is used.
 *
 * @package FRSUsers\Core
 */
class Avatar {

	/**
	 * Meta key for storing avatar attachment ID.
	 *
	 * @var string
	 */
	const META_KEY = 'frs_headshot_id';

	/**
	 * Meta key for storing avatar URL (CDN or local).
	 *
	 * @var string
	 */
	const URL_META_KEY = 'frs_headshot_url';

	/**
	 * Initialize avatar hooks.
	 *
	 * @return void
	 */
	public static function init() {
		// Hook into avatar data before HTML is generated (priority 10, after default)
		add_filter( 'pre_get_avatar_data', array( __CLASS__, 'filter_avatar_data' ), 10, 2 );

		// Clean up old avatar plugin meta on profile save
		add_action( 'frs_profile_saved', array( __CLASS__, 'cleanup_legacy_avatar_meta' ), 20, 2 );
	}

	/**
	 * Filter avatar data to use FRS headshot.
	 *
	 * This is the main hook that makes WordPress serve our headshots as avatars.
	 * Works with get_avatar(), get_avatar_url(), and all avatar-related functions.
	 *
	 * @param array $args        Avatar data arguments.
	 * @param mixed $id_or_email User ID, email, WP_User, WP_Post, or WP_Comment.
	 * @return array Modified avatar data.
	 */
	public static function filter_avatar_data( $args, $id_or_email ) {
		$user_id = self::get_user_id( $id_or_email );

		if ( ! $user_id ) {
			return $args;
		}

		// Get avatar URL for this user
		$avatar_url = self::get_avatar_url( $user_id, $args['size'] ?? 96 );

		if ( ! $avatar_url ) {
			return $args;
		}

		// Override the avatar URL
		$args['url'] = $avatar_url;

		// Mark as found so WordPress doesn't fall back to gravatar
		$args['found_avatar'] = true;

		return $args;
	}

	/**
	 * Get user ID from various input types.
	 *
	 * @param mixed $id_or_email User ID, email, WP_User, WP_Post, or WP_Comment.
	 * @return int|false User ID or false if not found.
	 */
	public static function get_user_id( $id_or_email ) {
		$user_id = false;

		if ( is_numeric( $id_or_email ) ) {
			$user_id = absint( $id_or_email );
		} elseif ( is_string( $id_or_email ) && is_email( $id_or_email ) ) {
			$user = get_user_by( 'email', $id_or_email );
			if ( $user ) {
				$user_id = $user->ID;
			}
		} elseif ( $id_or_email instanceof \WP_User ) {
			$user_id = $id_or_email->ID;
		} elseif ( $id_or_email instanceof \WP_Post ) {
			$user_id = $id_or_email->post_author;
		} elseif ( $id_or_email instanceof \WP_Comment ) {
			if ( $id_or_email->user_id ) {
				$user_id = $id_or_email->user_id;
			} elseif ( $id_or_email->comment_author_email ) {
				$user = get_user_by( 'email', $id_or_email->comment_author_email );
				if ( $user ) {
					$user_id = $user->ID;
				}
			}
		}

		return $user_id;
	}

	/**
	 * Get avatar URL for a user at a specific size.
	 *
	 * Priority:
	 * 1. CDN URL from frs_headshot_url meta
	 * 2. Local attachment from frs_headshot_id meta
	 *
	 * @param int $user_id User ID.
	 * @param int $size    Desired size in pixels.
	 * @return string|false Avatar URL or false if none found.
	 */
	public static function get_avatar_url( $user_id, $size = 96 ) {
		// First check for CDN URL
		$cdn_url = get_user_meta( $user_id, self::URL_META_KEY, true );
		if ( $cdn_url ) {
			// CDN URLs are already optimized, return as-is
			return $cdn_url;
		}

		// Fall back to local attachment
		$attachment_id = get_user_meta( $user_id, self::META_KEY, true );
		if ( ! $attachment_id ) {
			return false;
		}

		// Get appropriately sized image
		$image = self::get_sized_image_url( $attachment_id, $size );
		if ( $image ) {
			return $image;
		}

		// Final fallback to full size
		return wp_get_attachment_url( $attachment_id );
	}

	/**
	 * Get image URL at closest available size.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @param int $size          Desired size in pixels.
	 * @return string|false Image URL or false.
	 */
	private static function get_sized_image_url( $attachment_id, $size ) {
		// Map common avatar sizes to WordPress image sizes
		$size_map = array(
			32  => 'thumbnail',
			48  => 'thumbnail',
			64  => 'thumbnail',
			96  => 'thumbnail',
			128 => 'medium',
			256 => 'medium',
			512 => 'medium_large',
		);

		// Find best matching size
		$wp_size = 'thumbnail';
		foreach ( $size_map as $threshold => $image_size ) {
			if ( $size <= $threshold ) {
				$wp_size = $image_size;
				break;
			}
		}

		// For large sizes, use full
		if ( $size > 512 ) {
			$wp_size = 'full';
		}

		$image = wp_get_attachment_image_src( $attachment_id, $wp_size );
		if ( $image && ! empty( $image[0] ) ) {
			return $image[0];
		}

		return false;
	}

	/**
	 * Set avatar for a user.
	 *
	 * @param int    $user_id       User ID.
	 * @param int    $attachment_id Attachment ID.
	 * @param string $url           Optional URL (for CDN). If not provided, uses attachment URL.
	 * @return bool Whether the avatar was set.
	 */
	public static function set_avatar( $user_id, $attachment_id, $url = '' ) {
		if ( ! $user_id || ! $attachment_id ) {
			return false;
		}

		// Save attachment ID
		update_user_meta( $user_id, self::META_KEY, $attachment_id );

		// Save URL (CDN or local)
		if ( ! $url ) {
			$url = wp_get_attachment_url( $attachment_id );
		}
		if ( $url ) {
			update_user_meta( $user_id, self::URL_META_KEY, $url );
		}

		return true;
	}

	/**
	 * Remove avatar for a user.
	 *
	 * @param int $user_id User ID.
	 * @return bool Whether the avatar was removed.
	 */
	public static function delete_avatar( $user_id ) {
		if ( ! $user_id ) {
			return false;
		}

		delete_user_meta( $user_id, self::META_KEY );
		delete_user_meta( $user_id, self::URL_META_KEY );

		// Also clean up legacy meta
		self::delete_legacy_avatar_meta( $user_id );

		return true;
	}

	/**
	 * Check if user has a custom avatar.
	 *
	 * @param int $user_id User ID.
	 * @return bool Whether user has a custom avatar.
	 */
	public static function has_avatar( $user_id ) {
		if ( ! $user_id ) {
			return false;
		}

		$url = get_user_meta( $user_id, self::URL_META_KEY, true );
		if ( $url ) {
			return true;
		}

		$attachment_id = get_user_meta( $user_id, self::META_KEY, true );
		return ! empty( $attachment_id );
	}

	/**
	 * Cleanup legacy avatar plugin meta after profile save.
	 *
	 * @param int   $profile_id   Profile ID.
	 * @param array $profile_data Profile data.
	 * @return void
	 */
	public static function cleanup_legacy_avatar_meta( $profile_id, $profile_data ) {
		$profile = \FRSUsers\Models\Profile::find( $profile_id );
		if ( ! $profile || ! $profile->user_id ) {
			return;
		}

		self::delete_legacy_avatar_meta( $profile->user_id );
	}

	/**
	 * Delete legacy avatar plugin meta keys.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	private static function delete_legacy_avatar_meta( $user_id ) {
		// Basic User Avatars
		delete_user_meta( $user_id, 'basic_user_avatar' );

		// Simple Local Avatars
		delete_user_meta( $user_id, 'simple_local_avatar' );
		delete_user_meta( $user_id, 'simple_local_avatar_rating' );
	}

	/**
	 * Migrate avatars from legacy plugins to native system.
	 *
	 * Call this via WP-CLI to migrate existing avatars.
	 *
	 * @param bool $dry_run Whether to perform a dry run.
	 * @return array Migration results.
	 */
	public static function migrate_legacy_avatars( $dry_run = false ) {
		global $wpdb;

		$results = array(
			'migrated'     => 0,
			'skipped'      => 0,
			'errors'       => 0,
			'already_set'  => 0,
		);

		// Find users with legacy avatar meta
		$legacy_keys = array( 'basic_user_avatar', 'simple_local_avatar' );

		foreach ( $legacy_keys as $meta_key ) {
			$users_with_legacy = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT user_id, meta_value FROM {$wpdb->usermeta} WHERE meta_key = %s",
					$meta_key
				)
			);

			foreach ( $users_with_legacy as $row ) {
				$user_id    = $row->user_id;
				$meta_value = maybe_unserialize( $row->meta_value );

				// Skip if user already has native avatar
				if ( self::has_avatar( $user_id ) ) {
					++$results['already_set'];
					continue;
				}

				// Extract URL and attachment ID from legacy format
				$url           = '';
				$attachment_id = 0;

				if ( is_array( $meta_value ) ) {
					if ( isset( $meta_value['full'] ) ) {
						$url = $meta_value['full'];
					}
					if ( isset( $meta_value['media_id'] ) ) {
						$attachment_id = absint( $meta_value['media_id'] );
					}
				}

				if ( ! $url && ! $attachment_id ) {
					++$results['skipped'];
					continue;
				}

				// Try to find attachment ID from URL if not set
				if ( ! $attachment_id && $url ) {
					$attachment_id = attachment_url_to_postid( $url );
				}

				if ( $dry_run ) {
					++$results['migrated'];
					continue;
				}

				// Migrate to native system
				if ( $attachment_id ) {
					update_user_meta( $user_id, self::META_KEY, $attachment_id );
				}
				if ( $url ) {
					update_user_meta( $user_id, self::URL_META_KEY, $url );
				}

				// Remove legacy meta
				delete_user_meta( $user_id, $meta_key );

				++$results['migrated'];
			}
		}

		return $results;
	}
}
