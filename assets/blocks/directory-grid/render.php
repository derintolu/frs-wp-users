<?php
/**
 * Directory Grid Block - Server-side render
 *
 * Loads profile data and renders the card grid shell.
 * Uses exact same CSS classes as the original loan-officer-directory block.
 *
 * @package FRSUsers
 */

defined( 'ABSPATH' ) || exit;

$per_page       = $attributes['perPage'] ?? 12;
$show_count     = $attributes['showCount'] ?? true;
$show_load_more = $attributes['showLoadMore'] ?? true;

// Load profiles from local WordPress data
$profiles_data = array();
$profiles      = \FRSUsers\Models\Profile::get_all( array( 'type' => 'loan_originator' ) );

if ( ! empty( $profiles ) ) {
    foreach ( $profiles as $profile ) {
        $profile_array = is_array( $profile ) ? $profile : ( method_exists( $profile, 'toArray' ) ? $profile->toArray() : (array) $profile );
        // Only include active profiles
        if ( ! empty( $profile_array['is_active'] ) ) {
            $profiles_data[] = $profile_array;
        }
    }
}

// Sort alphabetically by first name, then last name
usort(
    $profiles_data,
    function ( $a, $b ) {
        $first_cmp = strcasecmp( $a['first_name'] ?? '', $b['first_name'] ?? '' );
        if ( $first_cmp !== 0 ) {
            return $first_cmp;
        }
        return strcasecmp( $a['last_name'] ?? '', $b['last_name'] ?? '' );
    }
);

// Excluded names (configurable via WP option)
$excluded_names = get_option( 'frs_directory_excluded', array() );

// Config for JavaScript
$config = array(
    'hubUrl'        => trailingslashit( home_url( '/' . \FRSUsers\Core\Roles::get_url_prefix( 'loan_officer' ) . '/' ) ),
    'perPage'       => $per_page,
    'profiles'      => $profiles_data,
    'excludedNames' => $excluded_names,
);

$wrapper_attributes = get_block_wrapper_attributes(
    array(
        'class'               => 'frs-directory-grid',
        'data-wp-interactive' => 'frs/directory',
        'data-config'         => wp_json_encode( $config ),
    )
);
?>

<div <?php echo $wrapper_attributes; ?>>
    <?php if ( $show_count ) : ?>
        <div class="frs-directory__results-header">
            <span class="frs-directory__count">
                <span data-wp-text="state.totalCount">0</span>
                <?php esc_html_e( 'loan officers', 'frs-users' ); ?>
            </span>
        </div>
    <?php endif; ?>

    <!-- Loading State -->
    <div class="frs-directory__loading" data-wp-bind--hidden="!state.isLoading">
        <div class="frs-directory__spinner"></div>
        <p><?php esc_html_e( 'Loading loan officers...', 'frs-users' ); ?></p>
    </div>

    <!-- Grid Container -->
    <div 
        class="frs-directory__grid" 
        id="frs-grid"
        data-wp-bind--hidden="state.isLoading"
    ></div>

    <!-- No Results -->
    <div 
        class="frs-directory__no-results" 
        data-wp-bind--hidden="state.totalCount > 0 || state.isLoading"
    >
        <p><?php esc_html_e( 'No loan officers found matching your criteria.', 'frs-users' ); ?></p>
        <button 
            class="frs-btn frs-btn--outline"
            data-wp-on--click="callbacks.onClearFilters"
        >
            <?php esc_html_e( 'Clear Filters', 'frs-users' ); ?>
        </button>
    </div>

    <?php if ( $show_load_more ) : ?>
        <!-- Load More -->
        <div 
            class="frs-directory__load-more"
            data-wp-bind--hidden="!state.hasMoreProfiles"
        >
            <button 
                class="frs-btn frs-btn--primary"
                data-wp-on--click="callbacks.onLoadMore"
            >
                <?php esc_html_e( 'Load More', 'frs-users' ); ?>
            </button>
        </div>
    <?php endif; ?>
</div>
