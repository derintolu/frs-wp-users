<?php
/**
 * Directory Filters Block - Server-side render
 *
 * Renders service area filter chips with proper Interactivity API state.
 * Uses exact same CSS classes as the original loan-officer-directory block.
 *
 * @package FRSUsers
 */

defined( 'ABSPATH' ) || exit;

$title             = $attributes['title'] ?? __( 'Service Areas', 'frs-users' );
$hint              = $attributes['hint'] ?? __( 'Click to filter by service area', 'frs-users' );
$show_clear_button = $attributes['showClearButton'] ?? true;

// Get initial selected areas from URL.
// phpcs:ignore WordPress.Security.NonceVerification.Recommended
$initial_areas  = isset( $_GET['areas'] ) ? array_map( 'sanitize_text_field', explode( ',', wp_unslash( $_GET['areas'] ) ) ) : array();
// phpcs:ignore WordPress.Security.NonceVerification.Recommended
$initial_search = isset( $_GET['search'] ) ? sanitize_text_field( wp_unslash( $_GET['search'] ) ) : '';
$has_filters    = ! empty( $initial_areas ) || ! empty( $initial_search );

// State names for tooltip.
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

// Get state from the shared Interactivity API store (initialized by grid block).
// If grid block hasn't initialized yet, we'll get empty values but JS will update.
$interactivity_state = wp_interactivity_state( 'frs/directory' );
$available_areas     = $interactivity_state['availableServiceAreas'] ?? array();
$area_counts         = $interactivity_state['serviceAreaCounts'] ?? array();

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => 'frs-directory-filters',
		'data-wp-interactive' => 'frs/directory',
	)
);
?>

<div <?php echo $wrapper_attributes; ?>>
	<div class="frs-sidebar__section">
		<div class="frs-sidebar__header">
			<label class="frs-sidebar__label"><?php echo esc_html( $title ); ?></label>
			<?php if ( $show_clear_button ) : ?>
				<button 
					class="frs-sidebar__clear"
					data-wp-on-async--click="actions.clearFilters"
					data-wp-bind--hidden="!state.hasFilters"
					<?php echo ! $has_filters ? 'hidden' : ''; ?>
				>
					<?php esc_html_e( 'Clear All', 'frs-users' ); ?>
				</button>
			<?php endif; ?>
		</div>
		<p class="frs-sidebar__hint"><?php echo esc_html( $hint ); ?></p>
		<div class="frs-service-areas">
			<?php
			// Server-render the chips based on available areas from state.
			// If the grid block rendered first, we have the data. Otherwise, JS will populate.
			if ( ! empty( $available_areas ) ) :
				foreach ( $available_areas as $area ) :
					$is_selected = in_array( $area, $initial_areas, true );
					$count       = $area_counts[ $area ] ?? 0;
					$full_name   = $state_names[ $area ] ?? $area;
					$classes     = 'frs-service-area-chip';
					if ( $is_selected ) {
						$classes .= ' frs-service-area-chip--selected';
					}
					?>
					<div 
						class="<?php echo esc_attr( $classes ); ?>"
						data-service-area="<?php echo esc_attr( $area ); ?>"
						title="<?php echo esc_attr( $full_name . ' (' . $count . ')' ); ?>"
						data-wp-on-async--click="actions.toggleServiceArea"
						data-wp-class--frs-service-area-chip--selected="state.selectedServiceAreas.includes('<?php echo esc_js( $area ); ?>')"
					>
						<?php echo esc_html( $area ); ?>
					</div>
					<?php
				endforeach;
			endif;
			?>
		</div>
	</div>
</div>
