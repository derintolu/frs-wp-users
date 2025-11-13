<?php
/**
 * Update Profile Page URLs
 *
 * The rewrite slug changed from 'profile' to 'team-profile',
 * but existing pages still have old permalinks cached.
 * This script forces WordPress to regenerate the URLs.
 *
 * Access: http://hub21.local/wp-content/plugins/frs-wp-users/update-profile-page-slugs.php
 */

// Load WordPress
define('WP_USE_THEMES', false);
require_once __DIR__ . '/../../../wp-load.php';

// Security check
if (!is_user_logged_in()) {
	wp_die('Please <a href="' . wp_login_url($_SERVER['REQUEST_URI']) . '">log in</a> to continue.');
}

if (!current_user_can('manage_options')) {
	wp_die('Access denied. You must be an administrator.');
}

// Get all profile pages
$pages = get_posts(array(
	'post_type'      => 'frs_user_profile',
	'posts_per_page' => -1,
	'post_status'    => 'any'
));

?>
<!DOCTYPE html>
<html>
<head>
	<title>Update Profile Page URLs</title>
	<style>
		body { font-family: -apple-system, sans-serif; margin: 40px; }
		.success { color: #46b450; }
		.info { color: #0073aa; }
		table { border-collapse: collapse; width: 100%; margin: 20px 0; }
		th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
		th { background: #f1f1f1; }
	</style>
</head>
<body>

<h1>Update Profile Page URLs</h1>

<?php

// Step 1: Flush rewrite rules
flush_rewrite_rules(true);
echo '<p class="success">✓ Step 1: Rewrite rules flushed</p>';

// Step 2: Touch each post to regenerate permalink
$updated = 0;
foreach ($pages as $page) {
	// Just touching the post forces WordPress to regenerate the permalink
	wp_update_post(array(
		'ID' => $page->ID,
		'post_modified' => current_time('mysql'),
		'post_modified_gmt' => current_time('mysql', 1)
	));
	$updated++;
}

echo '<p class="success">✓ Step 2: Updated ' . $updated . ' profile page permalinks</p>';

// Step 3: Show all pages with their new URLs
echo '<h2>Profile Pages with New URLs</h2>';
echo '<table>';
echo '<thead><tr><th>Page Title</th><th>Old URL</th><th>New URL</th></tr></thead>';
echo '<tbody>';

foreach ($pages as $page) {
	$old_url = home_url('/profile/' . $page->post_name . '/');
	$new_url = get_permalink($page->ID);

	echo '<tr>';
	echo '<td>' . esc_html($page->post_title) . '</td>';
	echo '<td><code>/profile/...</code></td>';
	echo '<td><a href="' . esc_url($new_url) . '" target="_blank">' . esc_html($new_url) . '</a></td>';
	echo '</tr>';
}

echo '</tbody>';
echo '</table>';

?>

<div class="info">
	<h3>✓ All Done!</h3>
	<p>All profile pages now use the new <code>/team-profile/</code> URL structure.</p>
	<p><strong>Next steps:</strong></p>
	<ol>
		<li>Go to <a href="<?php echo admin_url('admin.php?page=frs-profiles'); ?>">All Profiles</a></li>
		<li>Click a "View" link in the Pages column</li>
		<li>The page should now load with the new <code>/team-profile/</code> URL</li>
	</ol>
</div>

<p><a href="<?php echo admin_url('admin.php?page=frs-profiles'); ?>">← Back to All Profiles</a></p>

</body>
</html>
