<?php
/**
 * Server-side rendering for the profile-card block
 *
 * @param array    $attributes Block attributes
 * @param string   $content    Block content
 * @param WP_Block $block      Block instance
 * @return string  Block HTML output
 */

// Prevent direct access
if (!defined('ABSPATH')) {
	exit;
}

use FRSUsers\Models\Profile;

// Get user ID from attributes or use page author
$user_id = isset($attributes['user_id']) ? intval($attributes['user_id']) : 0;

// If user_id is 0, use the page author
if ($user_id === 0) {
	global $post;
	if (isset($post) && $post->post_author) {
		$user_id = intval($post->post_author);
	} else {
		return '<div class="lrh-profile-card-error">Error: No user ID or page author found</div>';
	}
}

// Get user data
$user = get_user_by('ID', $user_id);
if (!$user) {
	return '<div class="lrh-profile-card-error">Error: User not found</div>';
}

// Get data from Profile model (FRSUsers plugin)
$profile = Profile::where('user_id', $user_id)->first();

if ($profile) {
	$name = trim($profile->first_name . ' ' . $profile->last_name);
	$title = $profile->job_title ?: 'Loan Officer';
	$company = '21st Century Lending';
	$location = $profile->city && $profile->state ? $profile->city . ', ' . $profile->state : '';
	$license = $profile->license_number ?: '';
	$email = $profile->email ?: $user->user_email;
	$phone = $profile->phone_number ?: $profile->mobile_number ?: '';
	$avatar = $profile->headshot_id ? wp_get_attachment_image_url($profile->headshot_id, 'medium') : get_avatar_url($user_id);

	// Social links
	$social_links = [
		'wordpress' => '',
		'twitter' => $profile->twitter_url ?: '',
		'linkedin' => $profile->linkedin_url ?: '',
		'bluesky' => '',
		'github' => '',
		'instagram' => $profile->instagram_url ?: '',
	];

	// Biolink URL
	$username = $user->user_nicename;
	$biolink_url = home_url("/{$username}/links");
} else {
	// Fallback to user data
	$name = $user->display_name;
	$title = 'Loan Officer';
	$company = '21st Century Lending';
	$location = '';
	$license = '';
	$email = $user->user_email;
	$phone = '';
	$avatar = get_avatar_url($user_id);
	$social_links = [
		'wordpress' => '',
		'twitter' => '',
		'linkedin' => '',
		'bluesky' => '',
		'github' => '',
		'instagram' => '',
	];
	$username = $user->user_nicename;
	$biolink_url = home_url("/{$username}/links");
}

// Phone and email URLs
$phone_url = $phone ? 'tel:' . preg_replace('/[^0-9+]/', '', $phone) : '';
$email_url = $email ? 'mailto:' . $email : '';

// Gradient video URL
$gradient_video_url = LRH_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4';

// Unique ID for this block instance
$block_id = 'profile-card-' . $user_id . '-' . wp_rand();

// Interactivity API context
$context = [
	'showQRCode' => false,
	'biolinkUrl' => $biolink_url,
];

ob_start();
?>

<div
	<?php echo get_block_wrapper_attributes(['class' => 'lrh-profile-card']); ?>
	data-wp-interactive="lrh/profile-card"
	data-wp-context='<?php echo wp_json_encode($context); ?>'
	id="<?php echo esc_attr($block_id); ?>"
>
	<!-- Gradient Background Header -->
	<div class="lrh-profile-card__background">
		<video autoplay loop muted playsinline class="lrh-profile-card__video">
			<source src="<?php echo esc_url($gradient_video_url); ?>" type="video/mp4">
		</video>
	</div>

	<!-- Avatar with QR Code Flip -->
	<div class="lrh-profile-card__avatar-container">
		<div class="lrh-profile-card__avatar-wrapper" data-wp-class--flipped="context.showQRCode">
			<!-- Front - Avatar -->
			<div class="lrh-profile-card__avatar-side lrh-profile-card__avatar-front">
				<img
					src="<?php echo esc_url($avatar); ?>"
					alt="<?php echo esc_attr($name); ?>"
					class="lrh-profile-card__avatar-image"
				/>
			</div>

			<!-- Back - QR Code -->
			<div class="lrh-profile-card__avatar-side lrh-profile-card__avatar-back">
				<div class="lrh-profile-card__qr-code" data-wp-init="actions.initQRCode"></div>
			</div>
		</div>

		<!-- QR Code Toggle Button -->
		<button
			class="lrh-profile-card__qr-button"
			data-wp-on--click="actions.toggleQRCode"
			aria-label="Toggle QR Code"
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect width="5" height="5" x="3" y="3" rx="1"/>
				<rect width="5" height="5" x="16" y="3" rx="1"/>
				<rect width="5" height="5" x="3" y="16" rx="1"/>
				<path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
				<path d="M21 21v.01"/>
				<path d="M12 7v3a2 2 0 0 1-2 2H7"/>
				<path d="M3 12h.01"/>
				<path d="M12 3h.01"/>
				<path d="M12 16v.01"/>
				<path d="M16 12h1"/>
				<path d="M21 12v.01"/>
				<path d="M12 21v-1"/>
			</svg>
		</button>
	</div>

	<!-- Content Area -->
	<div class="lrh-profile-card__content">
		<!-- Name and License -->
		<div class="lrh-profile-card__header">
			<h3 class="lrh-profile-card__name"><?php echo esc_html($name); ?></h3>
			<?php if ($license): ?>
				<span class="lrh-profile-card__license">License <?php echo esc_html($license); ?></span>
			<?php endif; ?>
		</div>

		<!-- Title and Company -->
		<div class="lrh-profile-card__title-row">
			<span class="lrh-profile-card__title"><?php echo esc_html($title); ?>,</span>
			<span class="lrh-profile-card__company"><?php echo esc_html($company); ?></span>
		</div>

		<!-- Location -->
		<?php if ($location): ?>
			<div class="lrh-profile-card__location">
				<?php echo esc_html($location); ?>
			</div>
		<?php endif; ?>

		<!-- Social Icons -->
		<div class="lrh-profile-card__social">
			<div class="lrh-profile-card__social-inner">
				<span class="lrh-profile-card__social-divider">—</span>

				<?php foreach ($social_links as $platform => $url): ?>
					<?php if ($url): ?>
						<a href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener noreferrer" class="lrh-profile-card__social-link">
							<?php echo lrh_get_social_icon($platform); ?>
						</a>
					<?php endif; ?>
				<?php endforeach; ?>
			</div>
		</div>

		<!-- Action Buttons Top Row -->
		<div class="lrh-profile-card__actions-top">
			<button class="lrh-profile-card__button lrh-profile-card__button--primary">
				Apply Now
			</button>
			<button class="lrh-profile-card__button lrh-profile-card__button--outline">
				Schedule a Meeting
			</button>
		</div>

		<!-- Action Buttons Bottom Row -->
		<div class="lrh-profile-card__actions-bottom">
			<?php if ($phone_url): ?>
				<a href="<?php echo esc_url($phone_url); ?>" class="lrh-profile-card__button lrh-profile-card__button--outline">
					Call
				</a>
			<?php endif; ?>
			<?php if ($email_url): ?>
				<a href="<?php echo esc_url($email_url); ?>" class="lrh-profile-card__button lrh-profile-card__button--outline">
					Email
				</a>
			<?php endif; ?>
			<button class="lrh-profile-card__button lrh-profile-card__button--outline lrh-profile-card__button--phone">
				Add To Phone
			</button>
		</div>
	</div>
</div>

<?php
return ob_get_clean();

// Helper function for social icons
if (!function_exists('lrh_get_social_icon')) {
	function lrh_get_social_icon($platform) {
		$icons = [
			'wordpress' => '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.158 12.786L9.46 20.625C10.27 20.865 11.13 21 12 21C13.16 21 14.27 20.78 15.3 20.38L15.26 20.3L12.158 12.786ZM3.009 12C3.009 13.42 3.339 14.77 3.929 16L8.46 4.615C7.37 4.84 6.33 5.25 5.38 5.79C3.92 7.03 3.009 9.36 3.009 12ZM21.991 12C21.991 8.58 19.64 5.74 16.5 4.61C17.14 5.56 17.71 6.76 17.71 8.14C17.71 9.74 16.67 11.59 15.76 13.29C14.94 14.82 14.23 16.12 14.23 17.66C14.23 19.09 14.83 20.29 15.43 21.07C18.95 19.54 21.5 16.08 21.991 12ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"/></svg>',
			'twitter' => '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
			'linkedin' => '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
			'bluesky' => '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/></svg>',
			'github' => '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>',
			'instagram' => '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
		];

		return isset($icons[$platform]) ? $icons[$platform] : '';
	}
}
