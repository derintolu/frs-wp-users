<?php
/**
 * Cleanup Profile Pages - Keep Only One Per Profile
 *
 * Since we only have 1 template, each profile should have exactly 1 page.
 * This script deletes ALL duplicate pages, keeping only the newest one per profile.
 *
 * Access: http://hub21.local/wp-content/plugins/frs-wp-users/cleanup-profile-pages.php
 */

// Load WordPress
define('WP_USE_THEMES', false);
require_once __DIR__ . '/../../../wp-load.php';

// Security check - must be logged in as admin
if (!is_user_logged_in()) {
	wp_die('Please <a href="' . wp_login_url($_SERVER['REQUEST_URI']) . '">log in</a> to continue.');
}

if (!current_user_can('manage_options')) {
	wp_die('Access denied. You must be an administrator.');
}

// Check for confirmation
$confirm = isset($_GET['confirm']) && $_GET['confirm'] === 'yes';

?>
<!DOCTYPE html>
<html>
<head>
	<title>Cleanup Profile Pages</title>
	<style>
		body { font-family: -apple-system, sans-serif; margin: 40px; }
		.success { color: #46b450; }
		.error { color: #dc3232; }
		.info { color: #0073aa; }
		table { border-collapse: collapse; width: 100%; margin: 20px 0; }
		th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
		th { background: #f1f1f1; font-weight: 600; }
		.keep { background: #e7f7e7; }
		.delete { background: #ffe7e7; }
		.btn { display: inline-block; padding: 12px 24px; background: #dc3232; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; }
		.btn:hover { background: #a00; }
	</style>
</head>
<body>

<h1>Cleanup Profile Pages</h1>
<p class="info"><strong>Goal:</strong> Each profile should have exactly ONE page (since we only have 1 template).</p>
<hr>

<?php

// Get all profile pages grouped by profile_id
$all_pages = get_posts(array(
	'post_type'      => 'frs_user_profile',
	'posts_per_page' => -1,
	'post_status'    => 'any',
	'orderby'        => 'date',
	'order'          => 'DESC'
));

// Group by profile_id
$grouped = array();
foreach ($all_pages as $page) {
	$profile_id = get_post_meta($page->ID, '_profile_id', true);
	if (!$profile_id) continue;

	if (!isset($grouped[$profile_id])) {
		$grouped[$profile_id] = array();
	}
	$grouped[$profile_id][] = $page;
}

$profiles_with_one = 0;
$profiles_with_multiple = 0;
$total_to_delete = 0;

foreach ($grouped as $profile_id => $pages) {
	if (count($pages) === 1) {
		$profiles_with_one++;
	} else {
		$profiles_with_multiple++;
		$total_to_delete += (count($pages) - 1);
	}
}

echo '<h2>Analysis</h2>';
echo '<ul>';
echo '<li>Total profiles: <strong>' . count($grouped) . '</strong></li>';
echo '<li>Profiles with 1 page (correct): <strong class="success">' . $profiles_with_one . '</strong></li>';
echo '<li>Profiles with multiple pages (need cleanup): <strong class="error">' . $profiles_with_multiple . '</strong></li>';
echo '<li>Total pages to delete: <strong class="error">' . $total_to_delete . '</strong></li>';
echo '</ul>';

if ($total_to_delete === 0) {
	echo '<p class="success"><strong>✓ No cleanup needed! All profiles have exactly 1 page.</strong></p>';
	echo '<p><a href="' . admin_url('admin.php?page=frs-profiles') . '">← Back to All Profiles</a></p>';
	exit;
}

if (!$confirm) {
	echo '<p class="info"><strong>DRY RUN:</strong> Review the list below. Pages in red will be deleted.</p>';
} else {
	echo '<p class="error"><strong>DELETING NOW...</strong></p>';
}

echo '<hr>';
echo '<h2>Profile Pages by Profile</h2>';

$deleted_count = 0;
$kept_count = 0;

echo '<table>';
echo '<thead><tr><th>Profile ID</th><th>Page ID</th><th>Page Title</th><th>Date Created</th><th>Action</th></tr></thead>';
echo '<tbody>';

foreach ($grouped as $profile_id => $pages) {
	if (count($pages) === 1) {
		// Only one page - keep it
		$page = $pages[0];
		echo '<tr class="keep">';
		echo '<td>' . esc_html($profile_id) . '</td>';
		echo '<td>' . esc_html($page->ID) . '</td>';
		echo '<td>' . esc_html($page->post_title) . '</td>';
		echo '<td>' . esc_html($page->post_date) . '</td>';
		echo '<td><strong>KEEP</strong></td>';
		echo '</tr>';
		$kept_count++;
	} else {
		// Multiple pages - keep newest, delete others
		foreach ($pages as $index => $page) {
			if ($index === 0) {
				// Keep the first one (newest)
				echo '<tr class="keep">';
				echo '<td>' . esc_html($profile_id) . '</td>';
				echo '<td>' . esc_html($page->ID) . '</td>';
				echo '<td>' . esc_html($page->post_title) . '</td>';
				echo '<td>' . esc_html($page->post_date) . '</td>';
				echo '<td><strong>KEEP (newest)</strong></td>';
				echo '</tr>';
				$kept_count++;
			} else {
				// Delete this one
				echo '<tr class="delete">';
				echo '<td>' . esc_html($profile_id) . '</td>';
				echo '<td>' . esc_html($page->ID) . '</td>';
				echo '<td>' . esc_html($page->post_title) . '</td>';
				echo '<td>' . esc_html($page->post_date) . '</td>';

				if ($confirm) {
					$result = wp_delete_post($page->ID, true);
					if ($result) {
						echo '<td class="error"><strong>✓ DELETED</strong></td>';
						$deleted_count++;
					} else {
						echo '<td class="error"><strong>✗ FAILED</strong></td>';
					}
				} else {
					echo '<td class="error"><strong>WILL DELETE</strong></td>';
				}

				echo '</tr>';
			}
		}
	}
}

echo '</tbody>';
echo '</table>';

echo '<hr>';
echo '<h2>Summary</h2>';
echo '<p class="success">Pages kept: <strong>' . $kept_count . '</strong></p>';

if ($confirm) {
	echo '<p class="error">Pages deleted: <strong>' . $deleted_count . '</strong></p>';
	echo '<div class="success"><h3>✓ Cleanup Complete!</h3></div>';
	echo '<p>Each profile now has exactly 1 page.</p>';
	echo '<p><a href="' . admin_url('admin.php?page=frs-profiles') . '">← Back to All Profiles</a></p>';
} else {
	echo '<p class="error">Pages to delete: <strong>' . $total_to_delete . '</strong></p>';
	echo '<hr>';
	echo '<p><strong>Ready to proceed?</strong></p>';
	echo '<p><a href="?confirm=yes" class="btn">Delete ' . $total_to_delete . ' Duplicate Pages</a></p>';
	echo '<p><a href="' . admin_url('admin.php?page=frs-profiles') . '">← Cancel</a></p>';
}

?>

</body>
</html>
