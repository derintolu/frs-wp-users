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
		$src_blocks_dir = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'src/blocks/';

		error_log( 'FRS Users: Registering blocks from ' . $blocks_dir );

		// Register loan-officer-card block
		// The render callback is handled by render.php in block.json
		if ( file_exists( $blocks_dir . 'loan-officer-card' ) ) {
			$result = register_block_type( $blocks_dir . 'loan-officer-card' );
			error_log( 'FRS Users: loan-officer-card registration: ' . ( $result ? 'SUCCESS' : 'FAILED' ) );
		}

		// Register loan-officer-directory block from src
		if ( file_exists( $src_blocks_dir . 'loan-officer-directory' ) ) {
			$result = register_block_type( $src_blocks_dir . 'loan-officer-directory' );
			error_log( 'FRS Users: loan-officer-directory registration: ' . ( $result ? 'SUCCESS (' . $result->name . ')' : 'FAILED' ) );
		}

		// Register loan-officer block from src
		if ( file_exists( $src_blocks_dir . 'loan-officer' ) ) {
			$result = register_block_type( $src_blocks_dir . 'loan-officer' );
			error_log( 'FRS Users: loan-officer registration: ' . ( $result ? 'SUCCESS (' . $result->name . ')' : 'FAILED' ) );
		}

		// Register profile-card block (Interactivity API)
		if ( file_exists( $src_blocks_dir . 'profile-card' ) ) {
			$result = register_block_type( $src_blocks_dir . 'profile-card' );
			error_log( 'FRS Users: profile-card registration: ' . ( $result ? 'SUCCESS (' . $result->name . ')' : 'FAILED' ) );
		}

		// Register profile-page block (from built assets)
		if ( file_exists( $blocks_dir . 'profile-page' ) ) {
			$result = register_block_type( $blocks_dir . 'profile-page' );
			error_log( 'FRS Users: profile-page registration: ' . ( $result ? 'SUCCESS (' . $result->name . ')' : 'FAILED' ) );
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
