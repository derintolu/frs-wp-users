<?php
/**
 * Directory Search Block - Server-side render
 *
 * Uses exact same HTML/CSS classes as the monolithic loan-officer-directory block.
 *
 * @package FRSUsers
 */

defined( 'ABSPATH' ) || exit;

$placeholder = $attributes['placeholder'] ?? __( 'Search by name, city, or state...', 'frs-users' );
$show_button = $attributes['showButton'] ?? true;
$button_text = $attributes['buttonText'] ?? __( 'Search', 'frs-users' );

// Get initial search from URL.
// phpcs:ignore WordPress.Security.NonceVerification.Recommended
$initial_search = isset( $_GET['search'] ) ? sanitize_text_field( wp_unslash( $_GET['search'] ) ) : '';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => 'frs-directory',
		'data-wp-interactive' => 'frs/directory',
	)
);
?>

<div <?php echo $wrapper_attributes; ?>>
	<form
		class="frs-search"
		data-wp-on-async--submit="actions.onSearchSubmit"
	>
		<input
			class="frs-search__input"
			type="search"
			placeholder="<?php echo esc_attr( $placeholder ); ?>"
			value="<?php echo esc_attr( $initial_search ); ?>"
			data-wp-bind--value="state.searchQuery"
			data-wp-on--input="actions.setSearchQuery"
		>
		<?php if ( $show_button ) : ?>
			<button class="frs-search__btn" type="submit">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"/>
					<path d="m21 21-4.35-4.35"/>
				</svg>
				<span><?php echo esc_html( $button_text ); ?></span>
			</button>
		<?php endif; ?>
	</form>
</div>
