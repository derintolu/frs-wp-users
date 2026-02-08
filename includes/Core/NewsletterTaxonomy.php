<?php
/**
 * Newsletter Taxonomy
 *
 * Registers a "Newsletter" taxonomy on posts so users can tag posts as newsletters.
 * Used on the hub site to distinguish newsletter content in activity feeds.
 *
 * @package FRSUsers
 * @since 2.2.0
 */

namespace FRSUsers\Core;

defined( 'ABSPATH' ) || exit;

class NewsletterTaxonomy {

	/**
	 * Initialize the taxonomy registration.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
	}

	/**
	 * Register the newsletter taxonomy on posts.
	 *
	 * @return void
	 */
	public static function register() {
		register_taxonomy( 'frs_newsletter', 'post', array(
			'labels'            => array(
				'name'              => 'Newsletters',
				'singular_name'     => 'Newsletter',
				'search_items'      => 'Search Newsletters',
				'all_items'         => 'All Newsletters',
				'edit_item'         => 'Edit Newsletter',
				'update_item'       => 'Update Newsletter',
				'add_new_item'      => 'Add New Newsletter',
				'new_item_name'     => 'New Newsletter Name',
				'menu_name'         => 'Newsletters',
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => array( 'slug' => 'newsletter' ),
		) );
	}
}
