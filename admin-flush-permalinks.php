<?php
/**
 * Plugin Name: FRS Flush Permalinks Helper
 * Description: Temporary helper to flush permalinks - visit /wp-admin/admin.php?page=frs-flush-permalinks
 * Version: 1.0.0
 */

// Add admin menu
add_action('admin_menu', function() {
    add_submenu_page(
        null, // No parent = hidden from menu
        'Flush Permalinks',
        'Flush Permalinks',
        'manage_options',
        'frs-flush-permalinks',
        'frs_flush_permalinks_page'
    );
});

function frs_flush_permalinks_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Access denied');
    }

    // Check if flush button was clicked
    if (isset($_POST['flush_permalinks']) && check_admin_referer('frs_flush_permalinks')) {
        flush_rewrite_rules(true);
        echo '<div class="notice notice-success"><p><strong>✓ Permalinks flushed successfully!</strong></p></div>';
        echo '<div class="notice notice-info"><p>Profile pages should now be accessible at: <code>/team-profile/page-slug/</code></p></div>';
    }

    ?>
    <div class="wrap">
        <h1>Flush Permalinks</h1>
        <p>Click the button below to flush WordPress rewrite rules and update the permalink structure.</p>
        <p><strong>Note:</strong> This is needed after changing the profile page rewrite slug from 'profile' to 'team-profile'.</p>

        <form method="post">
            <?php wp_nonce_field('frs_flush_permalinks'); ?>
            <p>
                <input type="submit" name="flush_permalinks" class="button button-primary button-large" value="Flush Permalinks Now">
            </p>
        </form>

        <hr>

        <h2>What This Does</h2>
        <ul>
            <li>Regenerates WordPress rewrite rules</li>
            <li>Updates the .htaccess file (if using Apache)</li>
            <li>Makes profile pages accessible at <code>/team-profile/page-slug/</code></li>
        </ul>

        <h2>After Flushing</h2>
        <p>Test by visiting a profile page URL in your browser.</p>
    </div>
    <?php
}
