<?php
/**
 * Network-Wide Bookmarks
 *
 * Extends Greenshift's wishlist functionality to work network-wide in multisite.
 * Stores bookmarks in main site's usermeta for cross-site access.
 *
 * @package FRSUsers
 * @subpackage Intranet
 * @since 2.2.0
 */

namespace FRSUsers\Intranet;

/**
 * Class Bookmarks
 *
 * Network-wide bookmark management that integrates with Greenshift's wishlist.
 * Uses main site's usermeta for network-wide storage.
 */
class Bookmarks {

	/**
	 * Meta key for network bookmarks (separate from Greenshift's _wished_posts).
	 */
	const META_KEY = '_frs_network_bookmarks';

	/**
	 * Meta key for bookmark collections/folders.
	 */
	const COLLECTIONS_KEY = '_frs_bookmark_collections';

	/**
	 * Get the main site ID for network-wide storage.
	 *
	 * @return int
	 */
	public static function get_main_site_id() {
		if ( defined( 'FRS_BOOKMARKS_SITE_ID' ) ) {
			return FRS_BOOKMARKS_SITE_ID;
		}
		return is_multisite() ? get_main_site_id() : get_current_blog_id();
	}

	/**
	 * Get user's network-wide bookmarks.
	 *
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return array Array of bookmark data.
	 */
	public static function get_bookmarks( $user_id = null ) {
		$user_id = $user_id ?: get_current_user_id();
		if ( ! $user_id ) {
			return array();
		}

		// Switch to main site for network-wide storage.
		$switched = false;
		if ( is_multisite() && get_current_blog_id() !== self::get_main_site_id() ) {
			switch_to_blog( self::get_main_site_id() );
			$switched = true;
		}

		$bookmarks = get_user_meta( $user_id, self::META_KEY, true );

		if ( $switched ) {
			restore_current_blog();
		}

		return is_array( $bookmarks ) ? $bookmarks : array();
	}

	/**
	 * Add a bookmark.
	 *
	 * @param int         $post_id    Post ID to bookmark.
	 * @param int|null    $user_id    User ID. Defaults to current user.
	 * @param string|null $collection Optional collection/folder name.
	 * @param array       $meta       Optional metadata (notes, tags, etc.).
	 * @return bool|array False on failure, bookmark data on success.
	 */
	public static function add_bookmark( $post_id, $user_id = null, $collection = null, $meta = array() ) {
		$user_id = $user_id ?: get_current_user_id();
		if ( ! $user_id || ! $post_id ) {
			return false;
		}

		$post = get_post( $post_id );
		if ( ! $post ) {
			return false;
		}

		$bookmarks = self::get_bookmarks( $user_id );

		// Check if already bookmarked.
		$key = 'post-' . $post_id;
		if ( isset( $bookmarks[ $key ] ) ) {
			// Update existing bookmark.
			if ( $collection ) {
				$bookmarks[ $key ]['collection'] = $collection;
			}
			if ( ! empty( $meta ) ) {
				$bookmarks[ $key ]['meta'] = array_merge( $bookmarks[ $key ]['meta'] ?? array(), $meta );
			}
		} else {
			// Add new bookmark.
			$bookmarks[ $key ] = array(
				'post_id'    => $post_id,
				'site_id'    => get_current_blog_id(),
				'post_type'  => $post->post_type,
				'title'      => $post->post_title,
				'url'        => get_permalink( $post_id ),
				'collection' => $collection,
				'meta'       => $meta,
				'created_at' => current_time( 'mysql' ),
			);
		}

		// Save to main site.
		$switched = false;
		if ( is_multisite() && get_current_blog_id() !== self::get_main_site_id() ) {
			switch_to_blog( self::get_main_site_id() );
			$switched = true;
		}

		$result = update_user_meta( $user_id, self::META_KEY, $bookmarks );

		if ( $switched ) {
			restore_current_blog();
		}

		/**
		 * Fires after a bookmark is added.
		 *
		 * @param int   $post_id  Post ID.
		 * @param int   $user_id  User ID.
		 * @param array $bookmark Bookmark data.
		 */
		do_action( 'frs_bookmark_added', $post_id, $user_id, $bookmarks[ $key ] );

		// Also add to Greenshift wishlist for compatibility.
		self::sync_to_greenshift( $post_id, $user_id, 'add' );

		return $bookmarks[ $key ];
	}

	/**
	 * Remove a bookmark.
	 *
	 * @param int      $post_id Post ID to remove.
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return bool
	 */
	public static function remove_bookmark( $post_id, $user_id = null ) {
		$user_id = $user_id ?: get_current_user_id();
		if ( ! $user_id || ! $post_id ) {
			return false;
		}

		$bookmarks = self::get_bookmarks( $user_id );
		$key       = 'post-' . $post_id;

		if ( ! isset( $bookmarks[ $key ] ) ) {
			return false;
		}

		unset( $bookmarks[ $key ] );

		// Save to main site.
		$switched = false;
		if ( is_multisite() && get_current_blog_id() !== self::get_main_site_id() ) {
			switch_to_blog( self::get_main_site_id() );
			$switched = true;
		}

		$result = update_user_meta( $user_id, self::META_KEY, $bookmarks );

		if ( $switched ) {
			restore_current_blog();
		}

		/**
		 * Fires after a bookmark is removed.
		 *
		 * @param int $post_id Post ID.
		 * @param int $user_id User ID.
		 */
		do_action( 'frs_bookmark_removed', $post_id, $user_id );

		// Also remove from Greenshift wishlist.
		self::sync_to_greenshift( $post_id, $user_id, 'remove' );

		return true;
	}

	/**
	 * Check if a post is bookmarked.
	 *
	 * @param int      $post_id Post ID.
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return bool
	 */
	public static function is_bookmarked( $post_id, $user_id = null ) {
		$user_id   = $user_id ?: get_current_user_id();
		$bookmarks = self::get_bookmarks( $user_id );
		return isset( $bookmarks[ 'post-' . $post_id ] );
	}

	/**
	 * Get bookmarks by collection.
	 *
	 * @param string   $collection Collection name.
	 * @param int|null $user_id    User ID. Defaults to current user.
	 * @return array
	 */
	public static function get_by_collection( $collection, $user_id = null ) {
		$bookmarks = self::get_bookmarks( $user_id );
		return array_filter(
			$bookmarks,
			function ( $bookmark ) use ( $collection ) {
				return ( $bookmark['collection'] ?? '' ) === $collection;
			}
		);
	}

	/**
	 * Get bookmarks by post type.
	 *
	 * @param string   $post_type Post type.
	 * @param int|null $user_id   User ID. Defaults to current user.
	 * @return array
	 */
	public static function get_by_post_type( $post_type, $user_id = null ) {
		$bookmarks = self::get_bookmarks( $user_id );
		return array_filter(
			$bookmarks,
			function ( $bookmark ) use ( $post_type ) {
				return ( $bookmark['post_type'] ?? '' ) === $post_type;
			}
		);
	}

	/**
	 * Get user's bookmark collections.
	 *
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return array
	 */
	public static function get_collections( $user_id = null ) {
		$user_id = $user_id ?: get_current_user_id();
		if ( ! $user_id ) {
			return array();
		}

		$switched = false;
		if ( is_multisite() && get_current_blog_id() !== self::get_main_site_id() ) {
			switch_to_blog( self::get_main_site_id() );
			$switched = true;
		}

		$collections = get_user_meta( $user_id, self::COLLECTIONS_KEY, true );

		if ( $switched ) {
			restore_current_blog();
		}

		// Default collections.
		$defaults = array(
			array(
				'slug'  => 'favorites',
				'name'  => __( 'Favorites', 'frs-users' ),
				'icon'  => 'star',
				'color' => '#f59e0b',
			),
			array(
				'slug'  => 'read-later',
				'name'  => __( 'Read Later', 'frs-users' ),
				'icon'  => 'clock',
				'color' => '#3b82f6',
			),
		);

		return is_array( $collections ) && ! empty( $collections ) ? $collections : $defaults;
	}

	/**
	 * Create a new collection.
	 *
	 * @param string   $name    Collection name.
	 * @param array    $options Collection options (icon, color).
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return array|false Collection data or false on failure.
	 */
	public static function create_collection( $name, $options = array(), $user_id = null ) {
		$user_id = $user_id ?: get_current_user_id();
		if ( ! $user_id || empty( $name ) ) {
			return false;
		}

		$collections = self::get_collections( $user_id );
		$slug        = sanitize_title( $name );

		// Check for duplicate.
		foreach ( $collections as $collection ) {
			if ( $collection['slug'] === $slug ) {
				return false;
			}
		}

		$new_collection = array(
			'slug'  => $slug,
			'name'  => sanitize_text_field( $name ),
			'icon'  => sanitize_text_field( $options['icon'] ?? 'folder' ),
			'color' => sanitize_hex_color( $options['color'] ?? '#6b7280' ),
		);

		$collections[] = $new_collection;

		$switched = false;
		if ( is_multisite() && get_current_blog_id() !== self::get_main_site_id() ) {
			switch_to_blog( self::get_main_site_id() );
			$switched = true;
		}

		update_user_meta( $user_id, self::COLLECTIONS_KEY, $collections );

		if ( $switched ) {
			restore_current_blog();
		}

		return $new_collection;
	}

	/**
	 * Sync bookmark to Greenshift's wishlist for compatibility.
	 *
	 * @param int    $post_id Post ID.
	 * @param int    $user_id User ID.
	 * @param string $action  'add' or 'remove'.
	 */
	private static function sync_to_greenshift( $post_id, $user_id, $action ) {
		// Get Greenshift wishlist.
		$gs_wishlist = get_user_meta( $user_id, '_wished_posts', true );
		if ( ! is_array( $gs_wishlist ) ) {
			$gs_wishlist = array();
		}

		$key = 'post-' . $post_id;

		if ( $action === 'add' && ! isset( $gs_wishlist[ $key ] ) ) {
			$gs_wishlist[ $key ] = $post_id;
			update_user_meta( $user_id, '_wished_posts', $gs_wishlist );
			update_user_meta( $user_id, '_user_wish_count', count( $gs_wishlist ) );
		} elseif ( $action === 'remove' && isset( $gs_wishlist[ $key ] ) ) {
			unset( $gs_wishlist[ $key ] );
			update_user_meta( $user_id, '_wished_posts', $gs_wishlist );
			update_user_meta( $user_id, '_user_wish_count', count( $gs_wishlist ) );
		}
	}

	/**
	 * Import bookmarks from Greenshift wishlist.
	 *
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return int Number of bookmarks imported.
	 */
	public static function import_from_greenshift( $user_id = null ) {
		$user_id = $user_id ?: get_current_user_id();
		if ( ! $user_id ) {
			return 0;
		}

		$gs_wishlist = get_user_meta( $user_id, '_wished_posts', true );
		if ( ! is_array( $gs_wishlist ) || empty( $gs_wishlist ) ) {
			return 0;
		}

		$imported = 0;
		foreach ( $gs_wishlist as $post_id ) {
			if ( ! self::is_bookmarked( $post_id, $user_id ) ) {
				self::add_bookmark( $post_id, $user_id );
				$imported++;
			}
		}

		return $imported;
	}

	/**
	 * Get bookmark count for a user.
	 *
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @return int
	 */
	public static function get_count( $user_id = null ) {
		return count( self::get_bookmarks( $user_id ) );
	}

	/**
	 * Get all bookmarks with full post data.
	 *
	 * @param int|null $user_id User ID. Defaults to current user.
	 * @param array    $args    Query arguments (limit, offset, post_type, collection).
	 * @return array
	 */
	public static function get_bookmarks_with_posts( $user_id = null, $args = array() ) {
		$bookmarks = self::get_bookmarks( $user_id );

		// Filter by collection.
		if ( ! empty( $args['collection'] ) ) {
			$bookmarks = array_filter(
				$bookmarks,
				function ( $b ) use ( $args ) {
					return ( $b['collection'] ?? '' ) === $args['collection'];
				}
			);
		}

		// Filter by post type.
		if ( ! empty( $args['post_type'] ) ) {
			$bookmarks = array_filter(
				$bookmarks,
				function ( $b ) use ( $args ) {
					return ( $b['post_type'] ?? '' ) === $args['post_type'];
				}
			);
		}

		// Sort by created_at descending (newest first).
		uasort(
			$bookmarks,
			function ( $a, $b ) {
				return strtotime( $b['created_at'] ?? '0' ) - strtotime( $a['created_at'] ?? '0' );
			}
		);

		// Pagination.
		$offset = $args['offset'] ?? 0;
		$limit  = $args['limit'] ?? -1;

		if ( $offset > 0 || $limit > 0 ) {
			$bookmarks = array_slice( $bookmarks, $offset, $limit > 0 ? $limit : null, true );
		}

		// Enrich with current post data.
		$result = array();
		foreach ( $bookmarks as $key => $bookmark ) {
			$post_id = $bookmark['post_id'];
			$site_id = $bookmark['site_id'] ?? get_current_blog_id();

			// Switch to post's site if needed.
			$switched = false;
			if ( is_multisite() && get_current_blog_id() !== $site_id ) {
				switch_to_blog( $site_id );
				$switched = true;
			}

			$post = get_post( $post_id );
			if ( $post && $post->post_status === 'publish' ) {
				$bookmark['post']       = $post;
				$bookmark['title']      = $post->post_title;
				$bookmark['url']        = get_permalink( $post_id );
				$bookmark['excerpt']    = get_the_excerpt( $post );
				$bookmark['thumbnail']  = get_the_post_thumbnail_url( $post_id, 'medium' );
				$bookmark['post_type']  = $post->post_type;
				$bookmark['site_name']  = get_bloginfo( 'name' );
				$result[ $key ]         = $bookmark;
			}

			if ( $switched ) {
				restore_current_blog();
			}
		}

		return $result;
	}
}
