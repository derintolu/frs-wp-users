<?php
/**
 * LO Directory Search Block - Server-side Render
 *
 * Search bar that communicates with the LO Grid block.
 *
 * @package FRSUsers
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

declare(strict_types=1);

defined('ABSPATH') || exit;

$placeholder = $attributes['placeholder'] ?? 'Search by name, city, or state...';
$button_text = $attributes['buttonText'] ?? 'Search';
$show_button = $attributes['showButton'] ?? true;
$size = $attributes['size'] ?? 'large';

$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'frs-lo-search frs-lo-search--' . esc_attr($size),
    'data-wp-interactive' => 'frs/lo-search',
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <form class="frs-lo-search__form" id="frs-lo-search-form">
        <div class="frs-lo-search__input-wrap">
            <svg class="frs-lo-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
                type="search" 
                class="frs-lo-search__input" 
                id="frs-lo-search-input"
                placeholder="<?php echo esc_attr($placeholder); ?>"
                autocomplete="off"
            />
        </div>
        <?php if ($show_button) : ?>
        <button type="submit" class="frs-lo-search__btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span><?php echo esc_html($button_text); ?></span>
        </button>
        <?php endif; ?>
    </form>
</div>
