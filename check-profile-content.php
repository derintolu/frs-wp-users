<?php
/**
 * Check Profile Page Content
 *
 * Diagnose why profile pages are rendering empty
 */

// Load WordPress
define('WP_USE_THEMES', false);
require_once __DIR__ . '/../../../wp-load.php';

// Security check
if (!is_user_logged_in() || !current_user_can('manage_options')) {
    wp_die('Access denied. Must be logged in as admin.');
}

// Get a profile page
$pages = get_posts(array(
    'post_type'      => 'frs_user_profile',
    'posts_per_page' => 1,
    'post_status'    => 'any'
));

if (empty($pages)) {
    echo '<h1>No profile pages found</h1>';
    exit;
}

$page = $pages[0];

?>
<!DOCTYPE html>
<html>
<head>
    <title>Profile Page Content Check</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .info { color: #0073aa; }
        .error { color: #dc3232; }
        .success { color: #46b450; }
    </style>
</head>
<body>

<h1>Profile Page Content Diagnostic</h1>

<h2>Page Info</h2>
<ul>
    <li><strong>ID:</strong> <?php echo $page->ID; ?></li>
    <li><strong>Title:</strong> <?php echo esc_html($page->post_title); ?></li>
    <li><strong>Slug:</strong> <?php echo esc_html($page->post_name); ?></li>
    <li><strong>URL:</strong> <a href="<?php echo get_permalink($page->ID); ?>" target="_blank"><?php echo get_permalink($page->ID); ?></a></li>
</ul>

<h2>Post Meta</h2>
<pre><?php
$profile_id = get_post_meta($page->ID, '_profile_id', true);
$template_id = get_post_meta($page->ID, '_template_id', true);
echo 'Profile ID: ' . var_export($profile_id, true) . PHP_EOL;
echo 'Template ID: ' . var_export($template_id, true) . PHP_EOL;
?></pre>

<h2>Raw Post Content (first 1000 chars)</h2>
<pre><?php echo htmlspecialchars(substr($page->post_content, 0, 1000)); ?></pre>

<h2>Full Post Content Length</h2>
<p><?php echo strlen($page->post_content); ?> characters</p>

<h2>Block Parser Output</h2>
<pre><?php
$blocks = parse_blocks($page->post_content);
echo 'Number of blocks: ' . count($blocks) . PHP_EOL . PHP_EOL;

foreach ($blocks as $index => $block) {
    echo 'Block #' . $index . ':' . PHP_EOL;
    echo '  Name: ' . var_export($block['blockName'], true) . PHP_EOL;
    echo '  Attributes: ' . var_export($block['attrs'], true) . PHP_EOL;
    echo '  Inner Content Length: ' . strlen($block['innerHTML']) . PHP_EOL;
    echo PHP_EOL;
}
?></pre>

<h2>Rendered Output</h2>
<div style="border: 2px solid #0073aa; padding: 20px; margin: 20px 0;">
<?php
// Try to render the content
echo do_blocks($page->post_content);
?>
</div>

<h2>Profile Model Check</h2>
<pre><?php
if (class_exists('FRSUsers\\Models\\Profile')) {
    echo '✓ Profile model class exists' . PHP_EOL;

    if ($profile_id) {
        $profile = FRSUsers\Models\Profile::find($profile_id);
        if ($profile) {
            echo '✓ Profile found in database' . PHP_EOL;
            echo 'Profile Name: ' . $profile->full_name . PHP_EOL;
            echo 'Profile Email: ' . $profile->email . PHP_EOL;
        } else {
            echo '✗ Profile NOT found for ID: ' . $profile_id . PHP_EOL;
        }
    } else {
        echo '✗ No profile_id meta found' . PHP_EOL;
    }
} else {
    echo '✗ Profile model class does not exist' . PHP_EOL;
}
?></pre>

</body>
</html>
