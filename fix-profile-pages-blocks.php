<?php
/**
 * Fix Profile Pages - Update blocks with proper profile_id attributes
 *
 * This script updates all existing profile pages to have the correct block format
 * with profile_id attribute from post meta.
 *
 * Usage: php fix-profile-pages-blocks.php
 * Or via WP-CLI: wp eval-file fix-profile-pages-blocks.php
 */

// Load WordPress
require_once __DIR__ . '/../../../wp-load.php';

echo "=== Fixing Profile Page Blocks ===\n\n";

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

	// Get profile_id from post meta
	$profile_id = get_post_meta( $page->ID, '_profile_id', true );

	if ( ! $profile_id ) {
		echo "  ⚠️  No profile_id in meta, skipping\n\n";
		$skipped++;
		continue;
	}

	echo "  Profile ID: {$profile_id}\n";

	// Check current content
	echo "  Current content: " . substr( $page->post_content, 0, 100 ) . "...\n";

	// Parse blocks
	$blocks = parse_blocks( $page->post_content );

	$found_block = false;
	$updated_block = false;

	// Update profile_id attribute in all frs/profile-page blocks
	foreach ( $blocks as &$block ) {
		if ( $block['blockName'] === 'frs/profile-page' ) {
			$found_block = true;

			// Check if profile_id is already set correctly
			$current_profile_id = isset( $block['attrs']['profile_id'] ) ? $block['attrs']['profile_id'] : 0;

			if ( $current_profile_id !== intval( $profile_id ) ) {
				if ( ! isset( $block['attrs'] ) ) {
					$block['attrs'] = array();
				}
				$block['attrs']['profile_id'] = intval( $profile_id );
				$updated_block = true;
				echo "  ✓ Updated profile_id attribute from {$current_profile_id} to {$profile_id}\n";
			} else {
				echo "  ✓ Profile ID already correct ({$profile_id})\n";
			}
		}
	}

	if ( ! $found_block ) {
		echo "  ⚠️  No frs/profile-page block found in content\n\n";
		$skipped++;
		continue;
	}

	if ( ! $updated_block ) {
		echo "  → No update needed\n\n";
		$skipped++;
		continue;
	}

	// Serialize blocks back to content
	$new_content = serialize_blocks( $blocks );

	echo "  New content: " . substr( $new_content, 0, 100 ) . "...\n";

	// Update the post
	$result = wp_update_post(
		array(
			'ID'           => $page->ID,
			'post_content' => $new_content,
		),
		true
	);

	if ( is_wp_error( $result ) ) {
		echo "  ❌ Error updating page: " . $result->get_error_message() . "\n\n";
		$errors++;
	} else {
		echo "  ✅ Page updated successfully\n\n";
		$updated++;
	}
}

echo "\n=== Summary ===\n";
echo "Total pages: " . count( $pages ) . "\n";
echo "Updated: {$updated}\n";
echo "Skipped: {$skipped}\n";
echo "Errors: {$errors}\n";
echo "\n";

if ( $updated > 0 ) {
	echo "✅ Profile pages have been fixed. Test a few pages to verify they're rendering correctly.\n";
} else {
	echo "⚠️  No pages were updated. Check if they already have the correct format.\n";
}
