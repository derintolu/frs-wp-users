<?php
/**
 * Gutenberg/Block Editor Compatibility
 *
 * Adds Gutenberg support to themes that don't have it (like Vikinger).
 *
 * @package FRSUsers\Core
 */

declare(strict_types=1);

namespace FRSUsers\Core;

use FRSUsers\Traits\Base;

/**
 * Gutenberg Compatibility Class
 */
class GutenbergCompat {
	use Base;

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public function init(): void {
		add_action( 'after_setup_theme', [ $this, 'add_gutenberg_support' ], 20 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_assets' ] );
	}

	/**
	 * Add Gutenberg/Block Editor support to the theme.
	 *
	 * @return void
	 */
	public function add_gutenberg_support(): void {
		// Add support for editor styles
		add_theme_support( 'editor-styles' );

		// Add support for wide alignment
		add_theme_support( 'align-wide' );

		// Add support for responsive embedded content
		add_theme_support( 'responsive-embeds' );

		// Add support for default block styles
		add_theme_support( 'wp-block-styles' );

		// Add support for custom line height
		add_theme_support( 'custom-line-height' );

		// Add support for custom units
		add_theme_support( 'custom-units' );

		// Add support for custom spacing
		add_theme_support( 'custom-spacing' );

		// Add support for editor color palette (matches Vikinger's theme)
		add_theme_support(
			'editor-color-palette',
			[
				[
					'name'  => __( 'Primary', 'frs-users' ),
					'slug'  => 'primary',
					'color' => '#615dfa',
				],
				[
					'name'  => __( 'Secondary', 'frs-users' ),
					'slug'  => 'secondary',
					'color' => '#23d2e2',
				],
				[
					'name'  => __( 'Dark', 'frs-users' ),
					'slug'  => 'dark',
					'color' => '#3e3f5e',
				],
				[
					'name'  => __( 'Light', 'frs-users' ),
					'slug'  => 'light',
					'color' => '#ffffff',
				],
				[
					'name'  => __( 'Text', 'frs-users' ),
					'slug'  => 'text',
					'color' => '#8b88ff',
				],
			]
		);

		// Add support for editor font sizes
		add_theme_support(
			'editor-font-sizes',
			[
				[
					'name' => __( 'Small', 'frs-users' ),
					'size' => 12,
					'slug' => 'small',
				],
				[
					'name' => __( 'Normal', 'frs-users' ),
					'size' => 14,
					'slug' => 'normal',
				],
				[
					'name' => __( 'Medium', 'frs-users' ),
					'size' => 16,
					'slug' => 'medium',
				],
				[
					'name' => __( 'Large', 'frs-users' ),
					'size' => 20,
					'slug' => 'large',
				],
				[
					'name' => __( 'Huge', 'frs-users' ),
					'size' => 24,
					'slug' => 'huge',
				],
			]
		);
	}

	/**
	 * Enqueue block editor assets.
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		// Add custom editor styles to match frontend
		wp_add_inline_style(
			'wp-edit-blocks',
			'
			.editor-styles-wrapper {
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
				font-size: 14px;
				line-height: 1.6;
			}
			.editor-styles-wrapper .wp-block {
				max-width: 800px;
			}
			.editor-styles-wrapper .wp-block[data-align="wide"] {
				max-width: 1184px;
			}
			.editor-styles-wrapper .wp-block[data-align="full"] {
				max-width: none;
			}
			'
		);
	}
}
