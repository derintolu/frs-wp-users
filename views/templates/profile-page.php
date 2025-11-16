<?php
/**
 * Profile Page Template
 *
 * Simple template that hides the title and renders the content (Gutenberg blocks)
 *
 * @package FRSUsers
 */

get_header();
?>

<style>
/* Hide the page title for profile pages */
.single-frs_user_profile .entry-header,
.single-frs_user_profile .page-header,
.single-frs_user_profile .entry-title {
	display: none !important;
}
</style>

<main id="main" class="site-main">
	<?php
	while (have_posts()) :
		the_post();
		the_content();
	endwhile;
	?>
</main>

<?php
get_footer();
