<?php
/**
 * Profile Page Block - Server-side rendering
 *
 * @package FRSUsers
 * @var array $attributes Block attributes
 */

// Get profile ID from block attributes
$profile_id = isset($attributes['profile_id']) ? intval($attributes['profile_id']) : 0;

if (!$profile_id) {
	return '<div class="frs-profile-page-error">No profile selected</div>';
}

// Get profile data directly by profile ID
$profile = null;
if (class_exists('FRSUsers\\Models\\Profile')) {
	$profile = FRSUsers\Models\Profile::find($profile_id);
}

if (!$profile) {
	return '<div class="frs-profile-page-error">Profile not found (ID: ' . $profile_id . ')</div>';
}

// Get WordPress user data if user_id exists
$user = null;
if ($profile->user_id) {
	$user = get_userdata($profile->user_id);
}

// Build social links array
$social_links = [];
if ($profile->facebook_url) $social_links['facebook'] = ['url' => $profile->facebook_url, 'icon' => 'facebook', 'label' => 'Facebook'];
if ($profile->linkedin_url) $social_links['linkedin'] = ['url' => $profile->linkedin_url, 'icon' => 'linkedin', 'label' => 'LinkedIn'];
if ($profile->instagram_url) $social_links['instagram'] = ['url' => $profile->instagram_url, 'icon' => 'instagram', 'label' => 'Instagram'];
if ($profile->twitter_url) $social_links['twitter'] = ['url' => $profile->twitter_url, 'icon' => 'twitter', 'label' => 'Twitter/X'];

// Build custom links array
$custom_links = [];
if ($profile->website_url) $custom_links['website'] = ['url' => $profile->website_url, 'label' => 'Website'];
if ($profile->calendly_url) $custom_links['calendar'] = ['url' => $profile->calendly_url, 'label' => 'Schedule Meeting'];

// Parse service areas and specialties (assuming comma-separated strings)
$service_areas = !empty($profile->service_areas) ? array_map('trim', explode(',', $profile->service_areas)) : [];
$specialties = !empty($profile->specialties) ? array_map('trim', explode(',', $profile->specialties)) : [];

?>

<div class="frs-profile-page">
	<!-- Profile Header Card -->
	<div class="frs-profile-page__header">
		<div class="frs-profile-page__header-gradient"></div>

		<div class="frs-profile-page__header-content">
			<?php if ($profile->profile_photo_url) : ?>
				<div class="frs-profile-page__avatar">
					<img src="<?php echo esc_url($profile->profile_photo_url); ?>" alt="<?php echo esc_attr($profile->full_name); ?>" />
				</div>
			<?php endif; ?>

			<h1 class="frs-profile-page__name"><?php echo esc_html($profile->full_name); ?></h1>

			<?php if ($profile->title || $profile->nmls_number) : ?>
				<p class="frs-profile-page__title">
					<?php
					$title_parts = [];
					if ($profile->title) $title_parts[] = esc_html($profile->title);
					if ($profile->nmls_number) $title_parts[] = 'NMLS ' . esc_html($profile->nmls_number);
					echo implode(' | ', $title_parts);
					?>
				</p>
			<?php endif; ?>

			<?php if ($profile->city_state) : ?>
				<div class="frs-profile-page__location">
					<svg class="frs-profile-page__location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
					<?php echo esc_html($profile->city_state); ?>
				</div>
			<?php endif; ?>

			<!-- Contact Info -->
			<div class="frs-profile-page__contact">
				<?php if ($profile->email) : ?>
					<div class="frs-profile-page__contact-item">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
						</svg>
						<a href="mailto:<?php echo esc_attr($profile->email); ?>"><?php echo esc_html($profile->email); ?></a>
					</div>
				<?php endif; ?>

				<?php if ($profile->phone_number) : ?>
					<div class="frs-profile-page__contact-item">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
						</svg>
						<a href="tel:<?php echo esc_attr($profile->phone_number); ?>"><?php echo esc_html($profile->phone_number); ?></a>
					</div>
				<?php endif; ?>
			</div>

			<!-- Action Buttons -->
			<div class="frs-profile-page__actions">
				<?php if ($profile->phone_number) : ?>
					<a href="tel:<?php echo esc_attr($profile->phone_number); ?>" class="frs-profile-page__btn frs-profile-page__btn--primary">
						<?php esc_html_e('Call', 'frs-users'); ?>
					</a>
				<?php endif; ?>

				<?php if ($profile->email) : ?>
					<a href="mailto:<?php echo esc_attr($profile->email); ?>" class="frs-profile-page__btn frs-profile-page__btn--secondary">
						<?php esc_html_e('Email', 'frs-users'); ?>
					</a>
				<?php endif; ?>

				<?php if ($profile->calendly_url) : ?>
					<a href="<?php echo esc_url($profile->calendly_url); ?>" target="_blank" rel="noopener noreferrer" class="frs-profile-page__btn frs-profile-page__btn--secondary">
						<?php esc_html_e('Schedule Meeting', 'frs-users'); ?>
					</a>
				<?php endif; ?>

				<?php if ($profile->apply_now_url) : ?>
					<a href="<?php echo esc_url($profile->apply_now_url); ?>" target="_blank" rel="noopener noreferrer" class="frs-profile-page__btn frs-profile-page__btn--accent">
						<?php esc_html_e('Apply Now', 'frs-users'); ?>
					</a>
				<?php endif; ?>
			</div>
		</div>
	</div>

	<div class="frs-profile-page__content">
		<!-- Links & Social Section -->
		<?php if (!empty($custom_links) || !empty($social_links)) : ?>
			<div class="frs-profile-page__section">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Links & Social', 'frs-users'); ?></h2>
				<div class="frs-profile-page__links">
					<?php foreach ($custom_links as $key => $link) : ?>
						<a href="<?php echo esc_url($link['url']); ?>" target="_blank" rel="noopener noreferrer" class="frs-profile-page__link">
							<?php echo esc_html($link['label']); ?>
						</a>
					<?php endforeach; ?>

					<?php foreach ($social_links as $key => $link) : ?>
						<a href="<?php echo esc_url($link['url']); ?>" target="_blank" rel="noopener noreferrer" class="frs-profile-page__link frs-profile-page__link--<?php echo esc_attr($key); ?>">
							<?php echo esc_html($link['label']); ?>
						</a>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- Service Areas Section -->
		<?php if (!empty($service_areas)) : ?>
			<div class="frs-profile-page__section">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Service Areas', 'frs-users'); ?></h2>
				<div class="frs-profile-page__tags">
					<?php foreach ($service_areas as $area) : ?>
						<span class="frs-profile-page__tag"><?php echo esc_html($area); ?></span>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- Professional Biography Section -->
		<?php if ($profile->biography) : ?>
			<div class="frs-profile-page__section frs-profile-page__section--full">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Professional Biography', 'frs-users'); ?></h2>
				<div class="frs-profile-page__bio">
					<?php echo wp_kses_post(wpautop($profile->biography)); ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- Specialties & Credentials Section -->
		<?php if (!empty($specialties) || $profile->license_number) : ?>
			<div class="frs-profile-page__section frs-profile-page__section--full">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Specialties & Credentials', 'frs-users'); ?></h2>

				<?php if (!empty($specialties)) : ?>
					<div class="frs-profile-page__tags">
						<?php foreach ($specialties as $specialty) : ?>
							<span class="frs-profile-page__tag frs-profile-page__tag--specialty"><?php echo esc_html($specialty); ?></span>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<?php if ($profile->license_number || $profile->nmls_number) : ?>
					<div class="frs-profile-page__credentials">
						<?php if ($profile->nmls_number) : ?>
							<p><strong><?php esc_html_e('NMLS:', 'frs-users'); ?></strong> <?php echo esc_html($profile->nmls_number); ?></p>
						<?php endif; ?>
						<?php if ($profile->license_number) : ?>
							<p><strong><?php esc_html_e('License:', 'frs-users'); ?></strong> <?php echo esc_html($profile->license_number); ?></p>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</div>
