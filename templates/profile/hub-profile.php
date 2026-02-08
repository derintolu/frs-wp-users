<?php
/**
 * Hub Profile Template
 *
 * Renders the hub profile Greenshift block pattern for author pages on the hub site.
 * The actual layout is defined as a registered block pattern (frs-hub/profile)
 * so it can be edited visually in the block editor.
 *
 * @package FRSUsers
 * @since 2.2.0
 */

defined( 'ABSPATH' ) || exit;

get_header();

$author = get_queried_object();

if ( $author && ( $author instanceof WP_User ) ) {
	// Render the registered block pattern
	$pattern = \WP_Block_Patterns_Registry::get_instance()->get_registered( 'frs-hub/profile' );

	if ( $pattern ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Block content is escaped by do_blocks
		echo do_blocks( $pattern['content'] );
	} else {
		// Fallback if pattern not registered
		echo '<div style="max-width: 56rem; margin: 2rem auto; padding: 1.5rem;">';
		echo '<h1>' . esc_html( $author->display_name ) . '</h1>';
		echo '<p>' . esc_html( get_user_meta( $author->ID, 'frs_job_title', true ) ) . '</p>';
		echo '<div>' . wp_kses_post( get_user_meta( $author->ID, 'frs_biography', true ) ) . '</div>';
		echo '</div>';
	}
}

get_footer();
