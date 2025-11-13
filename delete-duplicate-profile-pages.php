<?php
/**
 * Delete Duplicate Profile Pages Script
 *
 * This script keeps only ONE profile page per profile (the one from "Default Profile Page" template)
 * and deletes any extras (from old "Company Profile Page" or "Personal Branding Profile" templates).
 *
 * Access via browser: http://hub21.local/wp-content/plugins/frs-wp-users/delete-duplicate-profile-pages.php
 */

// Load WordPress
define('WP_USE_THEMES', false);
require_once __DIR__ . '/../../../wp-load.php';

// Security check - only allow admins
if (!current_user_can('manage_options')) {
	wp_die('Access denied. You must be an administrator to run this script.');
}

echo '<html><head><title>Delete Duplicate Profile Pages</title>';
echo '<style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; } .error { color: red; } .success { color: green; } .info { color: blue; } table { border-collapse: collapse; width: 100%; margin: 20px 0; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background: #f1f1f1; } .deleted { background: #fee; } .kept { background: #efe; }</style>';
echo '</head><body>';

echo '<h1>Delete Duplicate Profile Pages</h1>';
echo '<p>This will keep ONE page per profile and delete the rest.</p>';

// Check if confirm parameter is set
$confirm = isset($_GET['confirm']) && $_GET['confirm'] === 'yes';

if (!$confirm) {
	echo '<div class="info"><strong>DRY RUN MODE</strong> - No pages will be deleted yet.</div>';
	echo '<p>Review the list below, then <a href="?confirm=yes">click here to actually delete the pages</a>.</p>';
} else {
	echo '<div class="error"><strong>DELETION MODE</strong> - Pages will be permanently deleted!</div>';
}

echo '<hr>';

// Get all profile pages
$pages = get_posts(array(
	'post_type'      => 'frs_user_profile',
	'posts_per_page' => -1,
	'post_status'    => 'any',
	'orderby'        => 'meta_value_num',
	'meta_key'       => '_profile_id',
	'order'          => 'ASC'
));

if (empty($pages)) {
	echo '<p>No profile pages found.</p>';
	echo '</body></html>';
	exit;
}

// Group pages by profile_id
$pages_by_profile = array();
foreach ($pages as $page) {
	$profile_id = get_post_meta($page->ID, '_profile_id', true);
	if (!$profile_id) {
		continue;
	}

	if (!isset($pages_by_profile[$profile_id])) {
		$pages_by_profile[$profile_id] = array();
	}

	$pages_by_profile[$profile_id][] = $page;
}

// Get template IDs
$default_template = get_posts(array(
	'post_type'      => 'frs_profile_template',
	'post_status'    => 'publish',
	'title'          => 'Default Profile Page',
	'posts_per_page' => 1
));

$default_template_id = !empty($default_template) ? $default_template[0]->ID : 0;

echo '<h2>Analysis</h2>';
echo '<p>Total profiles with pages: <strong>' . count($pages_by_profile) . '</strong></p>';
echo '<p>Default Profile Page template ID: <strong>' . ($default_template_id ?: 'NOT FOUND') . '</strong></p>';

// Process each profile
$total_kept = 0;
$total_deleted = 0;

echo '<table>';
echo '<thead><tr><th>Profile ID</th><th>Page ID</th><th>Page Title</th><th>Template ID</th><th>Action</th></tr></thead>';
echo '<tbody>';

foreach ($pages_by_profile as $profile_id => $profile_pages) {
	if (count($profile_pages) === 1) {
		// Only one page, keep it
		$page = $profile_pages[0];
		$template_id = get_post_meta($page->ID, '_template_id', true);
		echo '<tr class="kept">';
		echo '<td>' . esc_html($profile_id) . '</td>';
		echo '<td>' . esc_html($page->ID) . '</td>';
		echo '<td>' . esc_html($page->post_title) . '</td>';
		echo '<td>' . esc_html($template_id) . '</td>';
		echo '<td><strong>KEEP</strong> (only one page)</td>';
		echo '</tr>';
		$total_kept++;
	} else {
		// Multiple pages - keep the one from "Default Profile Page" template, delete others
		$kept_page = null;

		// First, try to find page from Default Profile Page template
		foreach ($profile_pages as $page) {
			$template_id = get_post_meta($page->ID, '_template_id', true);
			if ($template_id == $default_template_id) {
				$kept_page = $page;
				break;
			}
		}

		// If no page from Default template found, keep the first one
		if (!$kept_page) {
			$kept_page = $profile_pages[0];
		}

		// Display and delete the rest
		foreach ($profile_pages as $page) {
			$template_id = get_post_meta($page->ID, '_template_id', true);

			if ($page->ID === $kept_page->ID) {
				echo '<tr class="kept">';
				echo '<td>' . esc_html($profile_id) . '</td>';
				echo '<td>' . esc_html($page->ID) . '</td>';
				echo '<td>' . esc_html($page->post_title) . '</td>';
				echo '<td>' . esc_html($template_id) . '</td>';
				echo '<td><strong>KEEP</strong> (primary page)</td>';
				echo '</tr>';
				$total_kept++;
			} else {
				echo '<tr class="deleted">';
				echo '<td>' . esc_html($profile_id) . '</td>';
				echo '<td>' . esc_html($page->ID) . '</td>';
				echo '<td>' . esc_html($page->post_title) . '</td>';
				echo '<td>' . esc_html($template_id) . '</td>';

				if ($confirm) {
					// Actually delete the page
					$result = wp_delete_post($page->ID, true);
					if ($result) {
						echo '<td class="error"><strong>DELETED</strong></td>';
						$total_deleted++;
					} else {
						echo '<td class="error"><strong>FAILED TO DELETE</strong></td>';
					}
				} else {
					echo '<td class="error"><strong>WILL DELETE</strong></td>';
					$total_deleted++;
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
echo '<p class="success">Pages to keep: <strong>' . $total_kept . '</strong></p>';
echo '<p class="error">Pages to delete: <strong>' . $total_deleted . '</strong></p>';

if ($confirm) {
	echo '<div class="success"><h3>✓ Deletion Complete!</h3></div>';
	echo '<p><a href="' . admin_url('admin.php?page=frs-profiles') . '">← Back to All Profiles</a></p>';
} else {
	echo '<hr>';
	echo '<p><strong>Ready to proceed?</strong></p>';
	echo '<p><a href="?confirm=yes" style="background: #dc3232; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Delete ' . $total_deleted . ' Duplicate Pages</a></p>';
	echo '<p><a href="' . admin_url('admin.php?page=frs-profiles') . '">← Cancel and go back</a></p>';
}

echo '</body></html>';
