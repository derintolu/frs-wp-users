<?php
/**
 * Company Header Block - Server-side rendering
 *
 * @package FRSUsers
 * @var array $attributes Block attributes
 */

// Get user ID (from block attribute or page author)
$user_id = isset($attributes['user_id']) ? intval($attributes['user_id']) : 0;

if ($user_id === 0) {
	global $post;
	if (isset($post) && $post->post_author) {
		$user_id = intval($post->post_author);
	}
}

if (!$user_id) {
	return '<div class="frs-company-header-error">No user specified</div>';
}

// Get profile data
$profile = null;
if (class_exists('FRSUsers\Models\Profile')) {
	$profile = FRSUsers\Models\Profile::where('user_id', $user_id)->first();
}

if (!$profile) {
	return '<div class="frs-company-header-error">Profile not found</div>';
}

// Get attributes
$show_logo = isset($attributes['showLogo']) ? $attributes['showLogo'] : true;
$show_tagline = isset($attributes['showTagline']) ? $attributes['showTagline'] : true;
$alignment = isset($attributes['alignment']) ? $attributes['alignment'] : 'center';

// Get company info
$company_name = $profile->brand ?: ($profile->first_name . ' ' . $profile->last_name);
$tagline = $profile->job_title ?: 'Your trusted partner in home financing';
$logo_url = '';

// Get logo from headshot if available
if ($profile->headshot_id) {
	$logo_url = wp_get_attachment_image_url($profile->headshot_id, 'medium');
}

// Build CSS classes
$wrapper_classes = [
	'frs-company-header',
	'frs-company-header--' . esc_attr($alignment),
];
?>

<div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">
	<?php if ($show_logo && $logo_url) : ?>
		<div class="frs-company-header__logo">
			<img src="<?php echo esc_url($logo_url); ?>" alt="<?php echo esc_attr($company_name); ?>">
		</div>
	<?php endif; ?>

	<h1 class="frs-company-header__title">
		<?php echo esc_html($company_name); ?>
	</h1>

	<?php if ($show_tagline && $tagline) : ?>
		<p class="frs-company-header__tagline">
			<?php echo esc_html($tagline); ?>
		</p>
	<?php endif; ?>
</div>
