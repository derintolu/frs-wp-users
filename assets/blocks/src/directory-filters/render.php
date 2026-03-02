<?php
/**
 * Directory Filters Block - Server-side render
 *
 * Uses exact same HTML/CSS classes as the monolithic loan-officer-directory sidebar.
 *
 * @package FRSUsers
 */

defined( 'ABSPATH' ) || exit;

$title             = $attributes['title'] ?? __( 'Filter Results', 'frs-users' );
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
$interactivity_state = wp_interactivity_state( 'frs/directory' );
$available_areas     = $interactivity_state['availableServiceAreas'] ?? array();
$area_counts         = $interactivity_state['serviceAreaCounts'] ?? array();

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => 'frs-directory__sidebar',
		'data-wp-interactive' => 'frs/directory',
	)
);
?>

<aside <?php echo $wrapper_attributes; ?>>
	<div class="frs-sidebar__header">
		<h3><?php echo esc_html( $title ); ?></h3>
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

	<!-- Sidebar Search -->
	<div class="frs-sidebar__section">
		<label class="frs-sidebar__label" for="frs-search"><?php esc_html_e( 'Search', 'frs-users' ); ?></label>
		<div class="frs-sidebar__input-wrap">
			<input
				type="text"
				id="frs-search"
				placeholder="<?php esc_attr_e( 'Name or location...', 'frs-users' ); ?>"
				class="frs-sidebar__input"
				value="<?php echo esc_attr( $initial_search ); ?>"
				data-wp-bind--value="state.searchQuery"
				data-wp-on--input="actions.setSearchQuery"
			>
			<svg class="frs-sidebar__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
			</svg>
		</div>
	</div>

	<!-- Service Areas Filter -->
	<div class="frs-sidebar__section">
		<label class="frs-sidebar__label"><?php esc_html_e( 'Service Areas', 'frs-users' ); ?></label>
		<p class="frs-sidebar__hint"><?php echo esc_html( $hint ); ?></p>
		<div class="frs-service-areas" id="frs-service-areas">
			<?php
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
</aside>
