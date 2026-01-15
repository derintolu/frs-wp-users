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

		// Register lo-directory block (frs/lo-directory)
		// Main directory with search and state filtering
		if ( file_exists( $blocks_dir . 'lo-directory' ) ) {
			register_block_type( $blocks_dir . 'lo-directory' );
		}

		// Register lo-search block (frs/lo-search)
		// Standalone search input for directory
		if ( file_exists( $blocks_dir . 'lo-search' ) ) {
			register_block_type( $blocks_dir . 'lo-search' );
		}

		// Register lo-state-filter block (frs/lo-state-filter)
		// State chip filter for directory
		if ( file_exists( $blocks_dir . 'lo-state-filter' ) ) {
			register_block_type( $blocks_dir . 'lo-state-filter' );
		}

		// Register lo-detail block (frs/lo-detail)
		// Individual loan officer detail/profile view
		if ( file_exists( $blocks_dir . 'lo-detail' ) ) {
			register_block_type( $blocks_dir . 'lo-detail' );
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
