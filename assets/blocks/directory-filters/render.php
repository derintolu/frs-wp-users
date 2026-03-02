<?php
/**
 * Directory Filters Block - Server-side render
 *
 * Uses exact same CSS classes as the original loan-officer-directory block
 * to maintain visual consistency.
 *
 * @package FRSUsers
 */

defined( 'ABSPATH' ) || exit;

$title             = $attributes['title'] ?? __( 'Service Areas', 'frs-users' );
$hint              = $attributes['hint'] ?? __( 'Click to filter by service area', 'frs-users' );
$show_clear_button = $attributes['showClearButton'] ?? true;

// Get initial selected areas from URL
$initial_areas = isset( $_GET['areas'] ) ? array_map( 'sanitize_text_field', explode( ',', wp_unslash( $_GET['areas'] ) ) ) : array();

$wrapper_attributes = get_block_wrapper_attributes( array(
    'class'               => 'frs-directory-filters',
    'data-wp-interactive' => 'frs/directory',
) );

// All US states for rendering chips (JS will show/hide based on data)
$all_states = array(
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
);

$state_names = array(
    'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas', 'CA' => 'California',
    'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware', 'FL' => 'Florida', 'GA' => 'Georgia',
    'HI' => 'Hawaii', 'ID' => 'Idaho', 'IL' => 'Illinois', 'IN' => 'Indiana', 'IA' => 'Iowa',
    'KS' => 'Kansas', 'KY' => 'Kentucky', 'LA' => 'Louisiana', 'ME' => 'Maine', 'MD' => 'Maryland',
    'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota', 'MS' => 'Mississippi', 'MO' => 'Missouri',
    'MT' => 'Montana', 'NE' => 'Nebraska', 'NV' => 'Nevada', 'NH' => 'New Hampshire', 'NJ' => 'New Jersey',
    'NM' => 'New Mexico', 'NY' => 'New York', 'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio',
    'OK' => 'Oklahoma', 'OR' => 'Oregon', 'PA' => 'Pennsylvania', 'RI' => 'Rhode Island', 'SC' => 'South Carolina',
    'SD' => 'South Dakota', 'TN' => 'Tennessee', 'TX' => 'Texas', 'UT' => 'Utah', 'VT' => 'Vermont',
    'VA' => 'Virginia', 'WA' => 'Washington', 'WV' => 'West Virginia', 'WI' => 'Wisconsin', 'WY' => 'Wyoming',
);
?>

<div <?php echo $wrapper_attributes; ?>>
    <div class="frs-sidebar__section">
        <div class="frs-sidebar__header">
            <label class="frs-sidebar__label"><?php echo esc_html( $title ); ?></label>
            <?php if ( $show_clear_button ) : ?>
                <button 
                    class="frs-sidebar__clear"
                    data-wp-on--click="callbacks.onClearFilters"
                    data-wp-bind--hidden="!state.hasFilters"
                >
                    <?php esc_html_e( 'Clear All', 'frs-users' ); ?>
                </button>
            <?php endif; ?>
        </div>
        <p class="frs-sidebar__hint"><?php echo esc_html( $hint ); ?></p>
        <div class="frs-service-areas" data-wp-ignore>
            <?php
            // Chips will be populated by JavaScript based on available data
            // We render placeholders that JS will update
            ?>
        </div>
    </div>
</div>
