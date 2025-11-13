<?php
/**
 * Flush Permalinks Script
 *
 * Run this via: php flush-permalinks.php
 */

// Load WordPress
define('WP_USE_THEMES', false);
require_once __DIR__ . '/../../../wp-load.php';

// Flush rewrite rules
flush_rewrite_rules(true);

echo "✓ Permalinks flushed successfully!\n";
echo "✓ Profile pages should now be accessible at: /team-profile/page-slug/\n";
