<?php
/**
 * Company About Block - Server-side rendering
 *
 * @package FRSUsers
 * @var array $attributes Block attributes
 */

// Get user ID
$user_id = isset($attributes['user_id']) ? intval($attributes['user_id']) : 0;

if ($user_id === 0) {
	global $post;
	if (isset($post) && $post->post_author) {
		$user_id = intval($post->post_author);
	}
}

if (!$user_id) {
	return '<div class="frs-company-about-error">No user specified</div>';
}

// Get profile data
$profile = null;
if (class_exists('FRSUsers\Models\Profile')) {
	$profile = FRSUsers\Models\Profile::where('user_id', $user_id)->first();
}

if (!$profile) {
	return '<div class="frs-company-about-error">Profile not found</div>';
}

// Get attributes
$show_headshot = isset($attributes['showHeadshot']) ? $attributes['showHeadshot'] : true;
$layout = isset($attributes['layout']) ? $attributes['layout'] : 'sidebyside';

// Get content
$biography = $profile->biography ?: 'No biography available.';
$headshot_url = '';

if ($profile->headshot_id) {
	$headshot_url = wp_get_attachment_image_url($profile->headshot_id, 'large');
}

// Build CSS classes
$wrapper_classes = [
	'frs-company-about',
	'frs-company-about--' . esc_attr($layout),
];
?>

<div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">
	<div class="frs-company-about__container">
		<?php if ($show_headshot && $headshot_url) : ?>
			<div class="frs-company-about__image">
				<img src="<?php echo esc_url($headshot_url); ?>" alt="<?php echo esc_attr($profile->first_name . ' ' . $profile->last_name); ?>">
			</div>
		<?php endif; ?>

		<div class="frs-company-about__content">
			<h2 class="frs-company-about__title">
				<?php esc_html_e('About Us', 'frs-users'); ?>
			</h2>
			<div class="frs-company-about__bio">
				<?php echo wp_kses_post(wpautop($biography)); ?>
			</div>

			<?php if ($profile->nmls_number) : ?>
				<p class="frs-company-about__nmls">
					<strong><?php esc_html_e('NMLS:', 'frs-users'); ?></strong>
					<?php echo esc_html($profile->nmls_number); ?>
				</p>
			<?php endif; ?>

			<?php if ($profile->license_number) : ?>
				<p class="frs-company-about__license">
					<strong><?php esc_html_e('License:', 'frs-users'); ?></strong>
					<?php echo esc_html($profile->license_number); ?>
				</p>
			<?php endif; ?>
		</div>
	</div>
</div>
