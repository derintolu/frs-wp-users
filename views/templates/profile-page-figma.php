<?php
/**
 * Dynamic Profile Page Template - Figma Design
 *
 * Renders profile pages exactly matching Figma specifications
 *
 * @package FRSUsers
 */

// Get profile from global variable (set by Templates class)
global $frs_profile;

if (!$frs_profile) {
	get_header();
	echo '<div class="error">Profile not found</div>';
	get_footer();
	return;
}

$profile = $frs_profile;

// Build social links array
$social_links = [];
if ($profile->facebook_url) $social_links['facebook'] = ['url' => $profile->facebook_url, 'label' => 'Facebook'];
if ($profile->linkedin_url) $social_links['linkedin'] = ['url' => $profile->linkedin_url, 'label' => 'LinkedIn'];
if ($profile->instagram_url) $social_links['instagram'] = ['url' => $profile->instagram_url, 'label' => 'Instagram'];
if ($profile->twitter_url) $social_links['twitter'] = ['url' => $profile->twitter_url, 'label' => 'Twitter/X'];
if ($profile->youtube_url) $social_links['youtube'] = ['url' => $profile->youtube_url, 'label' => 'YouTube'];
if ($profile->tiktok_url) $social_links['tiktok'] = ['url' => $profile->tiktok_url, 'label' => 'TikTok'];

// Booking link
$booking_link = '';

// Gradient video URL
$gradient_video_url = get_site_url() . '/wp-content/uploads/2025/10/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4';

// Profile URL for QR code
$profile_slug = sanitize_title($profile->first_name . '-' . $profile->last_name);
$profile_url = home_url('/profile/' . $profile_slug);

// Unique block ID
$block_id = 'frs-profile-page-' . $profile->id . '-' . wp_rand();

// Parse service areas and specialties
$service_areas = !empty($profile->service_areas) ? (is_array($profile->service_areas) ? $profile->service_areas : array_map('trim', explode(',', $profile->service_areas))) : [];
$specialties_data = !empty($profile->specialties_lo) ? (is_array($profile->specialties_lo) ? $profile->specialties_lo : json_decode($profile->specialties_lo, true)) : [];
if (empty($specialties_data) && !empty($profile->specialties)) {
	$specialties_data = is_array($profile->specialties) ? $profile->specialties : json_decode($profile->specialties, true);
}
$specialties = is_array($specialties_data) ? $specialties_data : [];

// Parse languages
$languages = !empty($profile->languages) ? (is_array($profile->languages) ? $profile->languages : json_decode($profile->languages, true)) : [];

// Parse NAMB certifications
$namb_certs = !empty($profile->namb_certifications) ? (is_array($profile->namb_certifications) ? $profile->namb_certifications : json_decode($profile->namb_certifications, true)) : [];

// Enqueue block styles
wp_enqueue_style('frs-profile-page-figma-style', FRS_USERS_URL . 'assets/blocks/profile-page/style-index.css', [], FRS_USERS_VERSION);

get_header();
?>

<style>
/* Hide default page header/title */
.page-header,
.entry-header,
.entry-title {
	display: none !important;
}
</style>

<main id="main" class="site-main">

<div class="frs-profile-figma" id="<?php echo esc_attr($block_id); ?>">
	<!-- Top Row: Profile Header + Biography/Service Areas -->
	<div class="frs-profile-figma__top-row">

		<!-- Left Column: Profile Header (621px) -->
		<div class="frs-profile-figma__profile-header">
			<!-- Background Video -->
			<div class="frs-profile-figma__video-bg">
				<video autoplay loop muted playsinline>
					<source src="<?php echo esc_url($gradient_video_url); ?>" type="video/mp4">
				</video>
			</div>

			<!-- Avatar Section -->
			<div class="frs-profile-figma__avatar-section">
				<?php if ($profile->headshot_url): ?>
				<div class="frs-profile-figma__avatar-wrapper">
					<div class="frs-profile-figma__avatar-flip">
						<div class="frs-profile-figma__avatar-front">
							<img src="<?php echo esc_url($profile->headshot_url); ?>" alt="<?php echo esc_attr($profile->full_name); ?>" />
						</div>
						<div class="frs-profile-figma__avatar-back">
							<div id="qr-code-<?php echo esc_attr($profile->id); ?>" class="frs-profile-figma__qr-code"></div>
						</div>
					</div>
					<button class="frs-profile-figma__qr-btn frs-flip-btn" type="button">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
						</svg>
					</button>
				</div>
				<?php endif; ?>
			</div>

			<!-- Profile Info Section -->
			<div class="frs-profile-figma__info">
				<!-- Name and License -->
				<div class="frs-profile-figma__name-license">
					<h1 class="frs-profile-figma__name"><?php echo esc_html($profile->full_name); ?></h1>
					<?php if ($profile->license_number): ?>
					<div class="frs-profile-figma__license">License <?php echo esc_html($profile->license_number); ?></div>
					<?php endif; ?>
				</div>

				<!-- Job Title & Company -->
				<div class="frs-profile-figma__title-company">
					<?php if ($profile->job_title): ?>
					<span class="frs-profile-figma__job-title"><?php echo esc_html($profile->job_title); ?>,</span>
					<?php endif; ?>
					<span class="frs-profile-figma__company"><?php echo esc_html($profile->office ?: 'Full Realty Services'); ?></span>
				</div>

				<!-- Social Icons -->
				<?php if (!empty($social_links)): ?>
				<div class="frs-profile-figma__social">
					<?php foreach ($social_links as $platform => $link): ?>
					<a href="<?php echo esc_url($link['url']); ?>" target="_blank" rel="noopener" class="frs-profile-figma__social-icon">
						<!-- SVG icons here -->
					</a>
					<?php endforeach; ?>
				</div>
				<?php endif; ?>

				<!-- Location -->
				<?php if ($profile->city_state): ?>
				<div class="frs-profile-figma__location">
					<?php echo esc_html($profile->city_state); ?>
				</div>
				<?php endif; ?>

				<!-- Action Buttons -->
				<div class="frs-profile-figma__actions">
					<button type="button" class="frs-profile-figma__btn frs-profile-figma__btn--outline">
						Save to Contacts
					</button>
					<button type="button" class="frs-profile-figma__btn frs-profile-figma__btn--outline">
						Schedule a Meeting
					</button>
					<?php if ($profile->phone_number): ?>
					<a href="tel:<?php echo esc_attr($profile->phone_number); ?>" class="frs-profile-figma__btn frs-profile-figma__btn--outline">
						Call Me
					</a>
					<?php endif; ?>
				</div>
			</div>

			<!-- Apply Now Button (positioned absolutely in top right) -->
			<?php if ($profile->arrive): ?>
			<a href="<?php echo esc_url($profile->arrive); ?>" target="_blank" rel="noopener" class="frs-profile-figma__apply-btn">
				Apply Now
			</a>
			<?php endif; ?>
		</div>

		<!-- Right Column: Biography + Service Areas (624px) -->
		<div class="frs-profile-figma__right-column">

			<!-- Biography Section -->
			<?php if ($profile->biography): ?>
			<div class="frs-profile-figma__card">
				<h2 class="frs-profile-figma__card-title">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
					</svg>
					Biography
				</h2>
				<div class="frs-profile-figma__bio-text">
					<?php echo wp_kses_post(wpautop($profile->biography)); ?>
				</div>
			</div>
			<?php endif; ?>

			<!-- Service Areas Section -->
			<?php if (!empty($service_areas)): ?>
			<div class="frs-profile-figma__card">
				<h2 class="frs-profile-figma__card-title">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
					Service Areas
				</h2>
				<div class="frs-profile-figma__service-text">
					<?php echo esc_html(implode(', ', $service_areas)); ?>
				</div>
			</div>
			<?php endif; ?>

		</div>
	</div>

	<!-- Bottom Row: Specialties & Credentials (621px full width) -->
	<div class="frs-profile-figma__bottom-row">
		<div class="frs-profile-figma__card frs-profile-figma__specialties-card">
			<h2 class="frs-profile-figma__card-title">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				Specialties & Credentials
			</h2>

			<div class="frs-profile-figma__specialty-groups">
				<!-- Loan Officer Specialties -->
				<div class="frs-profile-figma__specialty-group">
					<h3 class="frs-profile-figma__specialty-label">Loan Officer Specialties</h3>
					<?php if (!empty($specialties) && is_array($specialties)): ?>
					<ul>
						<?php foreach ($specialties as $specialty): ?>
						<li><?php echo esc_html($specialty); ?></li>
						<?php endforeach; ?>
					</ul>
					<?php else: ?>
					<p class="frs-profile-figma__empty-state">No specialties selected</p>
					<?php endif; ?>
				</div>

				<!-- NAMB Certifications -->
				<div class="frs-profile-figma__specialty-group">
					<h3 class="frs-profile-figma__specialty-label">NAMB Certifications</h3>
					<?php if (!empty($namb_certs) && is_array($namb_certs)): ?>
					<ul>
						<?php foreach ($namb_certs as $cert): ?>
						<li><?php echo esc_html($cert); ?></li>
						<?php endforeach; ?>
					</ul>
					<?php else: ?>
					<p class="frs-profile-figma__empty-state">No certifications selected</p>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- QR Code Scripts -->
<script src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
<script>
(function() {
	var profileId = <?php echo intval($profile->id); ?>;
	var profileUrl = '<?php echo esc_js($profile_url); ?>';
	var qrContainer = document.getElementById('qr-code-' + profileId);

	if (qrContainer && typeof QRCodeStyling !== 'undefined') {
		if (qrContainer.querySelector('canvas')) return;

		var qrCode = new QRCodeStyling({
			width: 200,
			height: 200,
			type: 'canvas',
			data: profileUrl,
			dotsOptions: { color: '#1e3a8a', type: 'rounded' },
			backgroundOptions: { color: '#ffffff' },
			cornersSquareOptions: { color: '#2dd4da', type: 'extra-rounded' },
			cornersDotOptions: { color: '#2563eb', type: 'dot' }
		});

		qrCode.append(qrContainer);
	}

	// Flip card animation
	var flipBtn = document.querySelector('.frs-flip-btn');
	var flipCard = document.querySelector('.frs-profile-figma__avatar-flip');

	if (flipBtn && flipCard) {
		flipBtn.addEventListener('click', function() {
			flipCard.classList.toggle('is-flipped');
		});
	}
})();
</script>

<?php
get_footer();
