<?php
/**
 * Company Contact Block - Server-side rendering
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
	return '<div class="frs-company-contact-error">No user specified</div>';
}

// Get profile data
$profile = null;
if (class_exists('FRSUsers\Models\Profile')) {
	$profile = FRSUsers\Models\Profile::where('user_id', $user_id)->first();
}

if (!$profile) {
	return '<div class="frs-company-contact-error">Profile not found</div>';
}

// Get attributes
$show_social = isset($attributes['showSocial']) ? $attributes['showSocial'] : true;
$show_location = isset($attributes['showLocation']) ? $attributes['showLocation'] : true;
$layout = isset($attributes['layout']) ? $attributes['layout'] : 'grid';

// Build social links array
$social_links = [];
if ($profile->facebook_url) $social_links['facebook'] = $profile->facebook_url;
if ($profile->linkedin_url) $social_links['linkedin'] = $profile->linkedin_url;
if ($profile->instagram_url) $social_links['instagram'] = $profile->instagram_url;
if ($profile->twitter_url) $social_links['twitter'] = $profile->twitter_url;

$wrapper_classes = [
	'frs-company-contact',
	'frs-company-contact--' . esc_attr($layout),
];
?>

<div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">
	<h2 class="frs-company-contact__title">
		<?php esc_html_e('Get in Touch', 'frs-users'); ?>
	</h2>

	<div class="frs-company-contact__grid">
		<?php if ($profile->email) : ?>
			<div class="frs-company-contact__card">
				<div class="frs-company-contact__icon">📧</div>
				<h3><?php esc_html_e('Email', 'frs-users'); ?></h3>
				<a href="mailto:<?php echo esc_attr($profile->email); ?>">
					<?php echo esc_html($profile->email); ?>
				</a>
			</div>
		<?php endif; ?>

		<?php if ($profile->phone_number) : ?>
			<div class="frs-company-contact__card">
				<div class="frs-company-contact__icon">📞</div>
				<h3><?php esc_html_e('Phone', 'frs-users'); ?></h3>
				<a href="tel:<?php echo esc_attr($profile->phone_number); ?>">
					<?php echo esc_html($profile->phone_number); ?>
				</a>
			</div>
		<?php endif; ?>

		<?php if ($show_location && $profile->city_state) : ?>
			<div class="frs-company-contact__card">
				<div class="frs-company-contact__icon">📍</div>
				<h3><?php esc_html_e('Location', 'frs-users'); ?></h3>
				<p><?php echo esc_html($profile->city_state); ?></p>
			</div>
		<?php endif; ?>
	</div>

	<?php if ($show_social && !empty($social_links)) : ?>
		<div class="frs-company-contact__social">
			<p class="frs-company-contact__social-label">
				<?php esc_html_e('Follow Us', 'frs-users'); ?>
			</p>
			<div class="frs-company-contact__social-links">
				<?php foreach ($social_links as $platform => $url) : ?>
					<a
						href="<?php echo esc_url($url); ?>"
						target="_blank"
						rel="noopener noreferrer"
						class="frs-company-contact__social-link frs-company-contact__social-link--<?php echo esc_attr($platform); ?>"
						aria-label="<?php echo esc_attr(ucfirst($platform)); ?>"
					>
						<?php
						// Simple icons - could be replaced with SVG or icon font
						$icons = [
							'facebook' => 'F',
							'linkedin' => 'in',
							'instagram' => 'IG',
							'twitter' => 'X',
						];
						echo esc_html($icons[$platform] ?? substr(ucfirst($platform), 0, 1));
						?>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	<?php endif; ?>
</div>
