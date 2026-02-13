<?php
/**
 * Post Composer — Minimal Block Editor Page
 *
 * Registers a hidden admin page that loads a stripped-down Gutenberg block editor
 * for use inside an iframe on the frontend profile page. Communicates with the
 * parent frame via postMessage.
 *
 * @package FRSUsers
 * @since 3.3.0
 */

namespace FRSUsers\Core;

use FRSUsers\Traits\Base;

defined( 'ABSPATH' ) || exit;

class PostComposer {

	use Base;

	/**
	 * Admin page slug.
	 *
	 * @var string
	 */
	const PAGE_SLUG = 'frs-post-composer';

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'register_page' ) );
		add_action( 'admin_init', array( $this, 'maybe_render_composer' ) );
	}

	/**
	 * Register hidden admin page (no menu entry).
	 *
	 * @return void
	 */
	public function register_page() {
		add_submenu_page(
			null,
			__( 'Post Composer', 'frs-users' ),
			__( 'Post Composer', 'frs-users' ),
			'edit_posts',
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);
	}

	/**
	 * Intercept early on admin_init to strip chrome when our page is loaded.
	 *
	 * @return void
	 */
	public function maybe_render_composer() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['page'] ) || self::PAGE_SLUG !== $_GET['page'] ) {
			return;
		}

		// Hide admin bar in iframe.
		add_filter( 'show_admin_bar', '__return_false' );

		// Remove all admin notices.
		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
	}

	/**
	 * Render the minimal editor page.
	 *
	 * This outputs a full HTML document with only the block editor — no admin menu,
	 * no toolbar, no footer. Designed to be loaded inside an iframe.
	 *
	 * @return void
	 */
	public function render_page() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;

		if ( ! $post_id ) {
			wp_die( esc_html__( 'Missing post ID.', 'frs-users' ) );
		}

		$post = get_post( $post_id );
		if ( ! $post || 'post' !== $post->post_type ) {
			wp_die( esc_html__( 'Invalid post.', 'frs-users' ) );
		}

		// Verify current user owns this post.
		if ( (int) $post->post_author !== get_current_user_id() && ! current_user_can( 'edit_others_posts' ) ) {
			wp_die( esc_html__( 'You do not have permission to edit this post.', 'frs-users' ) );
		}

		// Enqueue the block editor.
		$this->enqueue_editor_assets( $post );

		// Output minimal HTML.
		$this->render_editor_html( $post );
		exit; // Prevent WordPress admin footer.
	}

	/**
	 * Enqueue block editor scripts and styles.
	 *
	 * @param \WP_Post $post The post being edited.
	 * @return void
	 */
	private function enqueue_editor_assets( $post ) {
		// Core editor dependencies.
		wp_enqueue_script( 'wp-edit-post' );
		wp_enqueue_script( 'wp-format-library' );
		wp_enqueue_script( 'wp-dom-ready' );
		wp_enqueue_script( 'wp-data' );
		wp_enqueue_script( 'wp-plugins' );

		// Editor styles.
		wp_enqueue_style( 'wp-edit-post' );
		wp_enqueue_style( 'wp-format-library' );
		wp_enqueue_style( 'wp-components' );

		// Our bridge script.
		$bridge_path = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'assets/js/composer-editor.js';
		if ( file_exists( $bridge_path ) ) {
			wp_enqueue_script(
				'frs-composer-editor',
				plugins_url( 'assets/js/composer-editor.js', dirname( dirname( __FILE__ ) ) ),
				array( 'wp-edit-post', 'wp-dom-ready', 'wp-data' ),
				filemtime( $bridge_path ),
				true
			);

			wp_add_inline_script(
				'frs-composer-editor',
				'window.frsComposerConfig = ' . wp_json_encode(
					array(
						'postId'   => $post->ID,
						'postType' => $post->post_type,
					)
				) . ';',
				'before'
			);
		}

		// Fire the block editor assets hook so other plugins (like PFBT) can enqueue.
		do_action( 'enqueue_block_editor_assets' );
	}

	/**
	 * Output the minimal editor HTML document.
	 *
	 * @param \WP_Post $post The post being edited.
	 * @return void
	 */
	private function render_editor_html( $post ) {
		// Build editor settings.
		$editor_settings = $this->get_editor_settings( $post );
		?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
	<style>
		/* Strip ALL admin chrome */
		#wpadminbar, #adminmenuwrap, #adminmenuback, #adminmenumain,
		#wpfooter, #screen-meta, #screen-meta-links,
		.notice, .update-nag, .updated, .error,
		#wpcontent > .wrap > h1:first-child { display: none !important; }

		html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; overflow: hidden; }
		#wpcontent { margin-left: 0 !important; padding: 0 !important; }
		#wpbody-content { padding: 0 !important; }

		/* Hide editor header bar (top toolbar with publish button, settings toggle) */
		.edit-post-header,
		.editor-header { display: none !important; }

		/* Hide sidebars */
		.interface-interface-skeleton__sidebar,
		.interface-interface-skeleton__secondary-sidebar,
		.edit-post-sidebar { display: none !important; }

		/* Hide the inserter sidebar */
		.interface-interface-skeleton__left-sidebar { display: none !important; }

		/* Make editor content fill the entire viewport */
		.interface-interface-skeleton {
			top: 0 !important;
			left: 0 !important;
		}
		.interface-interface-skeleton__content {
			overflow-y: auto !important;
		}

		/* Clean up the editor canvas */
		.editor-styles-wrapper {
			padding: 1rem 1.25rem !important;
			font-family: 'Mona Sans', -apple-system, BlinkMacSystemFont, sans-serif;
		}

		/* Placeholder styling */
		.block-editor-default-block-appender .block-editor-default-block-appender__content::before {
			content: 'Go ahead, put anything...';
			color: #9ca3af;
		}
	</style>
</head>
<body class="wp-admin wp-core-ui block-editor-page frs-composer-body">
	<div id="frs-composer-editor"></div>

	<script>
	( function() {
		var settings = <?php echo wp_json_encode( $editor_settings ); ?>;
		var postId = <?php echo (int) $post->ID; ?>;

		wp.domReady( function() {
			// Initialize the block editor.
			var editorDiv = document.getElementById( 'frs-composer-editor' );
			if ( ! editorDiv ) return;

			wp.editPost.initializeEditor( 'frs-composer-editor', 'post', postId, settings, {} );
		} );
	} )();
	</script>
	<?php wp_footer(); ?>
</body>
</html>
		<?php
	}

	/**
	 * Build editor settings for initializeEditor().
	 *
	 * @param \WP_Post $post The post being edited.
	 * @return array
	 */
	private function get_editor_settings( $post ) {
		$settings = array(
			'alignWide'              => true,
			'allowedBlockTypes'      => true,
			'disableCustomColors'    => false,
			'disableCustomFontSizes' => false,
			'titlePlaceholder'       => __( 'Title', 'frs-users' ),
			'bodyPlaceholder'        => __( 'Go ahead, put anything...', 'frs-users' ),
			'autosaveInterval'       => 60,
			'richEditingEnabled'     => true,
			'codeEditingEnabled'     => false,
			'canLockBlocks'          => false,
			'enableCustomFields'     => false,
			'postLock'               => false,
			'postLockUtils'          => false,
		);

		// Merge with core editor settings.
		$block_editor_context = new \WP_Block_Editor_Context( array( 'post' => $post ) );
		$core_settings        = get_block_editor_settings(
			array_merge( get_default_block_editor_settings(), $settings ),
			$block_editor_context
		);

		return $core_settings;
	}
}
