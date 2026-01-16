<?php
/**
 * Loan Officer Grid Block - Server-side Render
 *
 * Directory grid with sidebar filters and state chips.
 * No hero - design your own hero section above this block.
 *
 * @package FRSUsers
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

declare(strict_types=1);

defined('ABSPATH') || exit;

// Get attributes with defaults
$per_page = $attributes['perPage'] ?? 12;
$columns = $attributes['columns'] ?? 4;
$show_sidebar = $attributes['showSidebar'] ?? true;

// Get video URL for cards
$video_url = get_option('frs_directory_video_url', '');
if (empty($video_url)) {
    $video_url = defined('FRS_USERS_VIDEO_BG_URL') ? FRS_USERS_VIDEO_BG_URL : '';
}

// Preload profiles server-side
$profiles_data = [];
$profiles = \FRSUsers\Models\Profile::get_all(['type' => 'loan_originator']);
if (!empty($profiles)) {
    foreach ($profiles as $profile) {
        $profiles_data[] = is_array($profile) ? $profile : (method_exists($profile, 'toArray') ? $profile->toArray() : (array) $profile);
    }
}

// Config for JavaScript
$config = [
    'hubUrl' => trailingslashit(home_url('/lo/')),
    'apiUrl' => rest_url('frs-users/v1'),
    'videoUrl' => $video_url,
    'perPage' => $per_page,
    'profiles' => $profiles_data,
    'showSidebar' => $show_sidebar,
];

$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'frs-lo-grid',
    'id' => 'frs-lo-grid',
    'data-config' => wp_json_encode($config),
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <!-- Directory Section -->
    <section class="frs-directory-section" id="frs-directory-section">
        <!-- Loading State -->
        <div class="frs-directory__loading" id="frs-loading">
            <div class="frs-directory__spinner"></div>
            <p><?php esc_html_e('Loading loan officers...', 'frs-users'); ?></p>
        </div>

        <!-- Main Layout -->
        <div class="frs-directory__layout<?php echo $show_sidebar ? '' : ' frs-directory__layout--no-sidebar'; ?>" id="frs-layout" style="display: none;">
            <?php if ($show_sidebar) : ?>
            <!-- Sidebar -->
            <aside class="frs-directory__sidebar" id="frs-sidebar">
                <div class="frs-sidebar__header">
                    <h3><?php esc_html_e('Filter Results', 'frs-users'); ?></h3>
                    <button class="frs-sidebar__clear" id="frs-clear" style="display: none;"><?php esc_html_e('Clear All', 'frs-users'); ?></button>
                </div>

                <!-- Search -->
                <div class="frs-sidebar__section">
                    <label class="frs-sidebar__label" for="frs-search"><?php esc_html_e('Search', 'frs-users'); ?></label>
                    <div class="frs-sidebar__input-wrap">
                        <input type="text" id="frs-search" placeholder="<?php esc_attr_e('Name or location...', 'frs-users'); ?>" class="frs-sidebar__input">
                        <svg class="frs-sidebar__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                    </div>
                </div>

                <!-- Service Areas (Chip Grid) -->
                <div class="frs-sidebar__section">
                    <label class="frs-sidebar__label"><?php esc_html_e('Licensed States', 'frs-users'); ?></label>
                    <p class="frs-sidebar__hint"><?php esc_html_e('Click states to filter', 'frs-users'); ?></p>
                    <div class="frs-state-chips" id="frs-state-chips"></div>
                </div>

            </aside>
            <?php else : ?>
            <!-- Inline Search Bar (when no sidebar) -->
            <div class="frs-directory__search-bar" id="frs-search-bar">
                <div class="frs-search-inline">
                    <div class="frs-search-inline__input-wrap">
                        <svg class="frs-search-inline__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" id="frs-search" placeholder="<?php esc_attr_e('Search by name or location...', 'frs-users'); ?>" class="frs-search-inline__input">
                    </div>
                    <div class="frs-state-chips frs-state-chips--inline" id="frs-state-chips"></div>
                    <button class="frs-search-inline__clear" id="frs-clear" style="display: none;"><?php esc_html_e('Clear', 'frs-users'); ?></button>
                </div>
            </div>
            <?php endif; ?>

            <!-- Main Content -->
            <main class="frs-directory__main">
                <!-- Results Header -->
                <div class="frs-directory__results-header">
                    <span class="frs-directory__count"><span id="frs-count">0</span> <?php esc_html_e('loan officers', 'frs-users'); ?></span>
                </div>

                <!-- Grid -->
                <div class="frs-directory__grid" id="frs-grid"></div>

                <!-- No Results -->
                <div class="frs-directory__no-results" id="frs-no-results" style="display: none;">
                    <p><?php esc_html_e('No loan officers found matching your criteria.', 'frs-users'); ?></p>
                    <button class="frs-btn frs-btn--outline" id="frs-clear-alt"><?php esc_html_e('Clear Filters', 'frs-users'); ?></button>
                </div>

                <!-- Load More -->
                <div class="frs-directory__load-more" id="frs-load-more" style="display: none;">
                    <button class="frs-btn frs-btn--outline" id="frs-load-more-btn"><?php esc_html_e('Load More', 'frs-users'); ?></button>
                </div>
            </main>
        </div>

        <!-- Error -->
        <div class="frs-directory__error" id="frs-error" style="display: none;">
            <p><?php esc_html_e('Failed to load loan officers. Please try again.', 'frs-users'); ?></p>
            <button class="frs-btn frs-btn--primary" id="frs-retry"><?php esc_html_e('Retry', 'frs-users'); ?></button>
        </div>
    </section>

    <!-- QR Popup -->
    <div class="frs-qr-popup" id="frs-qr-popup">
        <div class="frs-qr-popup__backdrop" id="frs-qr-backdrop"></div>
        <div class="frs-qr-popup__content">
            <button class="frs-qr-popup__close" id="frs-qr-close" aria-label="<?php esc_attr_e('Close', 'frs-users'); ?>">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <div class="frs-qr-popup__qr">
                <img id="frs-qr-image" src="" alt="QR Code">
            </div>
            <p class="frs-qr-popup__name" id="frs-qr-name"></p>
            <p class="frs-qr-popup__hint"><?php esc_html_e('Scan to view profile', 'frs-users'); ?></p>
        </div>
    </div>
</div>
