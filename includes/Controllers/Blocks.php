<?php
/**
 * Blocks Controller
 *
 * Registers Gutenberg blocks for loan officer profiles.
 *
 * @package FRSUsers
 * @subpackage Controllers
 * @since 1.0.0
 */

namespace FRSUsers\Controllers;

/**
 * Class Blocks
 *
 * Handles registration of custom Gutenberg blocks.
 *
 * @package FRSUsers\Controllers
 */
class Blocks {

	/**
	 * Initialize blocks
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_blocks' ) );
		add_filter( 'block_categories_all', array( __CLASS__, 'add_block_category' ), 10, 2 );
	}

	/**
	 * Register custom block category
	 *
	 * @param array $categories Existing block categories.
	 * @param WP_Block_Editor_Context $context Block editor context.
	 * @return array Modified block categories.
	 */
	public static function add_block_category( $categories, $context ) {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'frs-blocks',
					'title' => __( 'FRS Blocks', 'frs-users' ),
					'icon'  => 'businessperson',
				),
			)
		);
	}

	/**
	 * Register all custom blocks
	 *
	 * @return void
	 */
	public static function register_blocks() {
		$blocks_dir = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'assets/blocks/';

		// Register loan-officer-directory block (frs/lo-directory)
		// Main directory with hero, sidebar filters, state chips, QR modal
		if ( file_exists( $blocks_dir . 'loan-officer-directory' ) ) {
			register_block_type( $blocks_dir . 'loan-officer-directory' );
		}

		// Register lo-grid block (frs/lo-grid)
		// Directory grid only - no hero, design your own hero above this block
		if ( file_exists( $blocks_dir . 'build/lo-grid' ) ) {
			register_block_type( $blocks_dir . 'build/lo-grid' );
		}

		// Register lo-search block (frs/lo-search)
		// Search bar that communicates with the lo-grid block
		if ( file_exists( $blocks_dir . 'build/lo-search' ) ) {
			register_block_type( $blocks_dir . 'build/lo-search' );
		}

		// Register profile-editor block (frs/profile-editor)
		// Bento-grid profile editor with Interactivity API for edit/preview
		// Built blocks go to build/ subdirectory
		if ( file_exists( $blocks_dir . 'build/profile-editor' ) ) {
			register_block_type( $blocks_dir . 'build/profile-editor' );
		}

		// Allow other plugins to register additional FRS blocks
		do_action( 'frs_users_register_blocks', $blocks_dir );
	}

	/**
	 * Render callback for loan-officer-card block
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block content.
	 * @param WP_Block $block      Block instance.
	 * @return string Rendered block HTML.
	 */
	public static function render_loan_officer_card( $attributes, $content = '', $block = null ) {
		// Output a mount point for React with attributes as data attribute
		return sprintf(
			'<div class="wp-block-frs-users-loan-officer-card" data-attributes="%s"></div>',
			esc_attr( wp_json_encode( $attributes ) )
		);
	}

	/**
	 * Render callback for loan-officer-directory block
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block content.
	 * @param WP_Block $block      Block instance.
	 * @return string Rendered block HTML.
	 */
	public static function render_loan_officer_directory( $attributes, $content = '', $block = null ) {
		// Output a mount point for React with attributes as data attribute
		return sprintf(
			'<div class="wp-block-frs-users-loan-officer-directory" data-attributes="%s"></div>',
			esc_attr( wp_json_encode( $attributes ) )
		);
	}
}
