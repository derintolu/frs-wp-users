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

// Get booking link from post meta
$post_id = get_the_ID();
$booking_link = get_post_meta($post_id, '_booking_link', true);

// Gradient video URL
$gradient_video_url = get_site_url() . '/wp-content/uploads/2025/10/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4';

// Profile page URL for QR code
$profile_url = get_permalink();

// Unique block ID
$block_id = 'frs-profile-page-' . $profile_id . '-' . wp_rand();

// Parse service areas and specialties (assuming comma-separated strings)
$service_areas = !empty($profile->service_areas) ? array_map('trim', explode(',', $profile->service_areas)) : [];
$specialties = !empty($profile->specialties) ? array_map('trim', explode(',', $profile->specialties)) : [];

?>

<div class="frs-profile-page" id="<?php echo esc_attr($block_id); ?>">
	<!-- Profile Header Card -->
	<div class="frs-profile-page__header">
		<!-- Video Background -->
		<div class="frs-profile-page__header-video">
			<video autoplay loop muted playsinline>
				<source src="<?php echo esc_url($gradient_video_url); ?>" type="video/mp4">
			</video>
		</div>

		<div class="frs-profile-page__header-content">
			<!-- Avatar with Flip Animation -->
			<?php if ($profile->headshot_url): ?>
			<div class="frs-profile-page__avatar-container">
				<div class="frs-profile-page__avatar-flip">
					<!-- Front - Photo -->
					<div class="frs-profile-page__avatar frs-profile-page__avatar-front">
						<img src="<?php echo esc_url($profile->headshot_url); ?>" alt="<?php echo esc_attr($profile->full_name); ?>" />
					</div>
					<!-- Back - QR Code -->
					<div class="frs-profile-page__avatar frs-profile-page__avatar-back">
						<div id="qr-code-<?php echo esc_attr($profile->id); ?>" class="frs-profile-page__qr-code"></div>
					</div>
				</div>
				<!-- QR Code Toggle Button -->
				<button class="frs-profile-page__qr-button frs-flip-btn" type="button" aria-label="Toggle QR Code">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
					</svg>
				</button>
			</div>
			<?php endif; ?>

			<div class="frs-profile-page__main-content">
				<div class="frs-profile-page__header-top">
					<h1 class="frs-profile-page__name"><?php echo esc_html($profile->full_name); ?></h1>
					<?php if ($profile->arrive): ?>
					<a href="<?php echo esc_url($profile->arrive); ?>" target="_blank" rel="noopener" class="frs-profile-page__btn frs-profile-page__btn--arrive">
						<svg width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor">
							<path d="M512 16c-273.934 0-496 222.066-496 496s222.066 496 496 496 496-222.066 496-496-222.066-496-496-496zM512 112c221.064 0 400 178.902 400 400 0 221.064-178.902 400-400 400-221.064 0-400-178.902-400-400 0-221.064 178.902-400 400-400zM792.408 372.534l-45.072-45.436c-9.334-9.41-24.53-9.472-33.94-0.136l-282.704 280.432-119.584-120.554c-9.334-9.41-24.53-9.472-33.94-0.138l-45.438 45.072c-9.41 9.334-9.472 24.53-0.136 33.942l181.562 183.032c9.334 9.41 24.53 9.472 33.94 0.136l345.178-342.408c9.408-9.336 9.468-24.532 0.134-33.942z"/>
						</svg>
						Get Pre-Approved
					</a>
					<?php endif; ?>
				</div>

			<?php if ($profile->job_title || $profile->city_state) : ?>
				<p class="frs-profile-page__title">
					<?php if ($profile->job_title): ?>
					<span><?php echo esc_html($profile->job_title); ?></span>
					<?php endif; ?>
					<?php if ($profile->city_state): ?>
					<span class="frs-profile-page__location">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
							<circle cx="12" cy="10" r="3"/>
						</svg>
						<?php echo esc_html($profile->city_state); ?>
					</span>
					<?php endif; ?>
				</p>
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
				<a href="#contact" class="frs-profile-page__btn frs-profile-page__btn--secondary">
					Send a Message
				</a>
				<a href="#" class="frs-profile-page__btn frs-profile-page__btn--secondary add-to-contacts">
					Add To Contacts
				</a>
				<button type="button" class="frs-profile-page__btn frs-profile-page__btn--secondary frs-schedule-meeting-btn" data-booking-url="<?php echo esc_attr($booking_link); ?>">
					Schedule Meeting
				</button>
			</div>
			</div><!-- .frs-profile-page__main-content -->
		</div><!-- .frs-profile-page__header-content -->
	</div><!-- .frs-profile-page__header -->

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
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('About', 'frs-users'); ?></h2>
				<div class="frs-profile-page__bio">
					<?php echo wp_kses_post(wpautop($profile->biography)); ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- Credentials Section -->
		<?php if ($profile->license_number || $profile->nmls_number) : ?>
			<div class="frs-profile-page__section">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Credentials', 'frs-users'); ?></h2>
				<div class="frs-profile-page__credentials">
					<?php if ($profile->nmls_number) : ?>
						<p><strong><?php esc_html_e('NMLS #:', 'frs-users'); ?></strong> <?php echo esc_html($profile->nmls_number); ?></p>
					<?php endif; ?>
					<?php if ($profile->license_number) : ?>
						<p><strong><?php esc_html_e('License #:', 'frs-users'); ?></strong> <?php echo esc_html($profile->license_number); ?></p>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- Languages Section -->
		<?php
		$languages = !empty($profile->languages) ? (is_array($profile->languages) ? $profile->languages : json_decode($profile->languages, true)) : [];
		if (!empty($languages)) : ?>
			<div class="frs-profile-page__section">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Languages', 'frs-users'); ?></h2>
				<p><?php echo esc_html(is_array($languages) ? implode(', ', $languages) : $languages); ?></p>
			</div>
		<?php endif; ?>

		<!-- Specialties Section -->
		<?php if (!empty($specialties)) : ?>
			<div class="frs-profile-page__section">
				<h2 class="frs-profile-page__section-title"><?php esc_html_e('Specialties', 'frs-users'); ?></h2>
				<div class="frs-profile-page__tags">
					<?php foreach ($specialties as $specialty) : ?>
						<span class="frs-profile-page__tag frs-profile-page__tag--specialty"><?php echo esc_html($specialty); ?></span>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>
	</div>

	<!-- Booking Popup Modal -->
	<div id="frs-booking-modal-<?php echo esc_attr($profile->id); ?>" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7);">
		<div style="position: relative; margin: 5% auto; width: 90%; max-width: 800px; background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
			<button type="button" class="frs-close-modal" style="position: absolute; right: 20px; top: 20px; background: #f3f4f6; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 24px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; color: #6b7280;">&times;</button>
			<div style="padding: 40px;">
				<h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">Schedule a Meeting</h2>
				<iframe class="frs-booking-iframe" src="" style="width: 100%; height: 600px; border: none; border-radius: 8px;"></iframe>
			</div>
		</div>
	</div>

	<!-- QR Code and Modal Scripts -->
	<script src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
	<style>
	.frs-flip-btn:hover {
		transform: scale(1.1) !important;
	}
	.frs-avatar-flip canvas {
		max-width: 100%;
		max-height: 100%;
	}
	</style>
	<script>
	(function() {
		var blockId = '<?php echo esc_js($block_id); ?>';
		var profileId = <?php echo intval($profile->id); ?>;

		// Generate QR Code for profile with styling
		var profileUrl = '<?php echo esc_js($profile_url); ?>';
		var qrContainer = document.getElementById('qr-code-' + profileId);

		if (qrContainer && typeof QRCodeStyling !== 'undefined') {
			// Check if already generated
			if (qrContainer.querySelector('canvas')) {
				return;
			}

			var qrCode = new QRCodeStyling({
				width: 200,
				height: 200,
				type: 'canvas',
				data: profileUrl,
				dotsOptions: {
					color: '#1e3a8a',
					type: 'rounded'
				},
				backgroundOptions: {
					color: '#ffffff',
				},
				cornersSquareOptions: {
					color: '#2dd4da',
					type: 'extra-rounded'
				},
				cornersDotOptions: {
					color: '#2563eb',
					type: 'dot'
				},
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 8
				}
			});

			qrCode.append(qrContainer);
		}

		// Flip card animation (toggle)
		var container = document.getElementById(blockId);
		if (container) {
			var flipBtn = container.querySelector('.frs-flip-btn');
			var flipCard = container.querySelector('.frs-avatar-flip');
			var isFlipped = false;

			if (flipBtn && flipCard) {
				flipBtn.addEventListener('click', function(e) {
					e.preventDefault();
					isFlipped = !isFlipped;
					flipCard.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
				});
			}

			// Schedule Meeting Modal
			var modal = document.getElementById('frs-booking-modal-' + profileId);
			var iframe = modal ? modal.querySelector('.frs-booking-iframe') : null;
			var closeBtn = modal ? modal.querySelector('.frs-close-modal') : null;
			var scheduleBtn = container.querySelector('.frs-schedule-meeting-btn');

			if (scheduleBtn && modal && iframe) {
				scheduleBtn.addEventListener('click', function() {
					var bookingUrl = this.getAttribute('data-booking-url');
					if (bookingUrl && bookingUrl !== '') {
						iframe.src = bookingUrl;
						modal.style.display = 'block';
						document.body.style.overflow = 'hidden';
					} else {
						alert('No booking link available for this profile.');
					}
				});
			}

			if (closeBtn && modal && iframe) {
				closeBtn.addEventListener('click', function() {
					modal.style.display = 'none';
					iframe.src = '';
					document.body.style.overflow = '';
				});
			}

			// Close modal when clicking outside
			if (modal && iframe) {
				window.addEventListener('click', function(e) {
					if (e.target === modal) {
						modal.style.display = 'none';
						iframe.src = '';
						document.body.style.overflow = '';
					}
				});

				// Close on ESC key
				document.addEventListener('keydown', function(e) {
					if (e.key === 'Escape' && modal.style.display === 'block') {
						modal.style.display = 'none';
						iframe.src = '';
						document.body.style.overflow = '';
					}
				});
			}
		}
	})();
	</script>
</div>
