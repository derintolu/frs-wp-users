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
					<a href="<?php echo esc_url($link['url']); ?>" target="_blank" rel="noopener" class="frs-profile-figma__social-icon" aria-label="<?php echo esc_attr($link['label']); ?>">
						<?php if ($platform === 'facebook'): ?>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
						<?php elseif ($platform === 'linkedin'): ?>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
						</svg>
						<?php elseif ($platform === 'instagram'): ?>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
						</svg>
						<?php elseif ($platform === 'twitter'): ?>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
						<?php elseif ($platform === 'youtube'): ?>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
						</svg>
						<?php elseif ($platform === 'tiktok'): ?>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
						</svg>
						<?php endif; ?>
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
			<div class="frs-profile-figma__card">
				<h2 class="frs-profile-figma__card-title">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
					</svg>
					Biography
				</h2>
				<div class="frs-profile-figma__bio-text">
					<?php if ($profile->biography): ?>
						<?php echo wp_kses_post(wpautop($profile->biography)); ?>
					<?php else: ?>
						<p class="frs-profile-figma__empty-state">No biography provided</p>
					<?php endif; ?>
				</div>
			</div>

			<!-- Service Areas Section -->
			<div class="frs-profile-figma__card">
				<h2 class="frs-profile-figma__card-title">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
					Service Areas
				</h2>
				<div class="frs-profile-figma__service-text">
					<?php if (!empty($service_areas)): ?>
						<?php echo esc_html(implode(', ', $service_areas)); ?>
					<?php else: ?>
						<p class="frs-profile-figma__empty-state">No service areas specified</p>
					<?php endif; ?>
				</div>
			</div>

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
			width: 123,
			height: 123,
			type: 'canvas',
			data: profileUrl,
			margin: 0,
			shape: 'square',
			qrOptions: {
				typeNumber: 0,
				mode: 'Byte',
				errorCorrectionLevel: 'L'
			},
			dotsOptions: {
				type: 'extra-rounded',
				roundSize: true,
				gradient: {
					type: 'linear',
					rotation: 0,
					colorStops: [
						{ offset: 0, color: '#2563eb' },
						{ offset: 1, color: '#2dd4da' }
					]
				}
			},
			backgroundOptions: { color: '#ffffff' },
			cornersSquareOptions: {
				type: 'extra-rounded',
				gradient: {
					type: 'linear',
					rotation: 0,
					colorStops: [
						{ offset: 0, color: '#2563ea' },
						{ offset: 1, color: '#2dd4da' }
					]
				}
			},
			cornersDotOptions: {
				type: '',
				gradient: {
					type: 'linear',
					rotation: 0,
					colorStops: [
						{ offset: 0, color: '#2dd4da' },
						{ offset: 1, color: '#2563e9' }
					]
				}
			}
		});

		qrCode.append(qrContainer);

		// Constrain canvas size after generation (matching React component)
		setTimeout(function() {
			var canvas = qrContainer.querySelector('canvas');
			if (canvas) {
				canvas.style.width = '123px';
				canvas.style.height = '123px';
				canvas.style.maxWidth = '123px';
				canvas.style.maxHeight = '123px';
			}
		}, 100);
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
