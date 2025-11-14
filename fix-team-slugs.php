<?php
/**
 * Fix Team Slugs - Remove team- prefix from post_name
 *
 * Since we changed the rewrite slug to 'agent-profile/team', we need to remove
 * the 'team-' prefix from post_name fields so URLs work correctly.
 *
 * Usage: php fix-team-slugs.php
 * Or via WP-CLI: wp eval-file fix-team-slugs.php
 */

// Load WordPress
require_once __DIR__ . '/../../../wp-load.php';

echo "=== Fixing Team Slugs ===\n\n";

// Get all profile pages
$args = array(
	'post_type'      => 'frs_user_profile',
	'post_status'    => 'any',
	'posts_per_page' => -1,
);

$pages = get_posts( $args );

echo "Found " . count( $pages ) . " profile pages to process.\n\n";

$updated = 0;
$skipped = 0;
$errors  = 0;

foreach ( $pages as $page ) {
	echo "Processing page ID {$page->ID}: {$page->post_title}\n";
	echo "  Current slug: {$page->post_name}\n";

	// Get profile_id from post meta
	$profile_id = get_post_meta( $page->ID, '_profile_id', true );

	if ( ! $profile_id ) {
		echo "  ⚠️  No profile_id in meta, skipping\n\n";
		$skipped++;
		continue;
	}

	// Get profile name from database
	if ( class_exists( 'FRSUsers\\Models\\Profile' ) ) {
		$profile = \FRSUsers\Models\Profile::find( $profile_id );

		if ( ! $profile ) {
			echo "  ⚠️  Profile {$profile_id} not found in database, skipping\n\n";
			$skipped++;
			continue;
		}

		$profile_name = trim( $profile->first_name . ' ' . $profile->last_name );
		$new_slug     = sanitize_title( $profile_name );

		echo "  Profile: {$profile_name}\n";
		echo "  New slug: {$new_slug}\n";

		// Check if slug needs updating
		if ( $page->post_name === $new_slug ) {
			echo "  ✓ Slug already correct\n\n";
			$skipped++;
			continue;
		}

		// Update the post
		$result = wp_update_post(
			array(
				'ID'        => $page->ID,
				'post_name' => $new_slug,
			),
			true
		);

		if ( is_wp_error( $result ) ) {
			echo "  ❌ Error updating page: " . $result->get_error_message() . "\n\n";
			$errors++;
		} else {
			echo "  ✅ Updated slug\n\n";
			$updated++;
		}
	} else {
		echo "  ❌ Profile model not available\n\n";
		$errors++;
	}
}

echo "\n=== Summary ===\n";
echo "Total pages: " . count( $pages ) . "\n";
echo "Updated: {$updated}\n";
echo "Skipped: {$skipped}\n";
echo "Errors: {$errors}\n";
echo "\n";

if ( $updated > 0 ) {
	echo "Flushing permalinks...\n";
	flush_rewrite_rules( false );
	echo "✅ Slugs have been fixed.\n";
	echo "\nNote: URLs will now be in format:\n";
	echo "https://hub21.local/agent-profile/team/rossana-aliaga/\n";
} else {
	echo "⚠️  No pages were updated.\n";
}
