<?php
/**
 * Server-side rendering for loan-officer-card block
 *
 * This outputs a React mount point. The actual rendering happens
 * client-side via view.js for an identical editor/frontend experience.
 *
 * @param array    $attributes Block attributes
 * @param string   $content    Block content
 * @param WP_Block $block      Block instance
 * @return string  Block HTML output
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Output React mount point with attributes as data attribute
return sprintf(
    '<div class="wp-block-frs-users-loan-officer-card" data-attributes="%s"></div>',
    esc_attr(wp_json_encode($attributes))
);
