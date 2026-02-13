<?php
/**
 * Profile Editor Block - Server-side Render
 *
 * Identical layout to templates/profile/loan-officer.php but for the current logged-in user.
 * Adds edit mode capability via Interactivity API.
 *
 * @package FRSUsers
 */

declare(strict_types=1);

defined( 'ABSPATH' ) || exit;

// Check if user is logged in
if ( ! is_user_logged_in() ) {
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'frs-profile-editor-error' ) );
	echo '<div ' . $wrapper_attributes . '>';
	echo '<p>' . esc_html__( 'Please log in to access your profile.', 'frs-users' ) . '</p>';
	echo '</div>';
	return;
}

// Get current user
$current_user_id = get_current_user_id();
$user = get_userdata( $current_user_id );

if ( ! $user ) {
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'frs-profile-editor-error' ) );
	echo '<div ' . $wrapper_attributes . '>';
	echo '<p>' . esc_html__( 'User not found.', 'frs-users' ) . '</p>';
	echo '</div>';
	return;
}

// Build profile data from user meta
$user_profile = new \FRSUsers\Models\UserProfile( $current_user_id );
$profile = array(
	'id'                  => $current_user_id,
	'user_id'             => $current_user_id,
	'email'               => $user_profile->get_email(),
	'first_name'          => $user_profile->get_first_name(),
	'last_name'           => $user_profile->get_last_name(),
	'display_name'        => $user_profile->get_display_name(),
	'full_name'           => $user_profile->get_full_name(),
	'phone_number'        => $user_profile->get_phone_number(),
	'mobile_number'       => $user_profile->get_mobile_number(),
	'job_title'           => $user_profile->get_job_title() ?: 'Loan Officer',
	'nmls'                => $user_profile->get_nmls(),
	'city_state'          => $user_profile->get_city_state(),
	'biography'           => $user_profile->get_biography(),
	'headshot_url'        => $user_profile->get_headshot_url(),
	'profile_slug'        => $user->user_nicename,
	'qr_code_data'        => $user_profile->get_qr_code_data(),
	'arrive'              => $user_profile->get_arrive_url(),
	'apply_url'           => $user_profile->get_arrive_url(),
	'website'             => $user_profile->get_website(),
	'facebook_url'        => $user_profile->get_facebook_url(),
	'instagram_url'       => $user_profile->get_instagram_url(),
	'linkedin_url'        => $user_profile->get_linkedin_url(),
	'twitter_url'         => $user_profile->get_twitter_url(),
	'specialties_lo'      => $user_profile->get_specialties_lo(),
	'namb_certifications' => $user_profile->get_namb_certifications(),
	'service_areas'       => $user_profile->get_service_areas(),
	'custom_links'        => $user_profile->get_custom_links(),
);

// Profile data for template
$first_name    = $profile['first_name'] ?? '';
$last_name     = $profile['last_name'] ?? '';
$full_name     = trim( $first_name . ' ' . $last_name );
$initials      = strtoupper( substr( $first_name, 0, 1 ) . substr( $last_name, 0, 1 ) );
$job_title     = $profile['job_title'] ?? 'Loan Officer';
$raw_nmls      = $profile['nmls'] ?? '';
$nmls          = preg_match( '/^1994\d{3}$/', $raw_nmls ) ? '' : $raw_nmls;
$email         = $profile['email'] ?? '';
$phone         = $profile['phone_number'] ?? $profile['mobile_number'] ?? '';
$location      = $profile['city_state'] ?? '';
$bio           = $profile['biography'] ?? '';
// Strip any injected shadow-host elements
$bio           = preg_replace( '/<div[^>]*trails-highlight-shadow-host[^>]*>.*?<\/div>/is', '', $bio );
$headshot_url  = $profile['headshot_url'] ?? '';
$profile_slug  = $profile['profile_slug'] ?? '';
$qr_code_data  = $profile['qr_code_data'] ?? '';
$apply_url     = $profile['arrive'] ?? $profile['apply_url'] ?? '';
$website       = $profile['website'] ?? '';
$facebook      = $profile['facebook_url'] ?? '';
$instagram     = $profile['instagram_url'] ?? '';
$linkedin      = $profile['linkedin_url'] ?? '';
$twitter       = $profile['twitter_url'] ?? '';
$specialties   = $profile['specialties_lo'] ?? array();
$certifications = $profile['namb_certifications'] ?? array();
$service_areas = $profile['service_areas'] ?? array();
$custom_links  = $profile['custom_links'] ?? array();

// Ensure arrays
if ( ! is_array( $specialties ) ) $specialties = array();
if ( ! is_array( $certifications ) ) $certifications = array();
if ( ! is_array( $service_areas ) ) $service_areas = array();
if ( ! is_array( $custom_links ) ) $custom_links = array();

// Options for checkboxes
$specialties_options = array(
	'Residential Mortgages',
	'Consumer Loans',
	'VA Loans',
	'FHA Loans',
	'Jumbo Loans',
	'Construction Loans',
	'Investment Property',
	'Reverse Mortgages',
	'USDA Rural Loans',
	'Bridge Loans',
);

$certifications_options = array(
	'CMC - Certified Mortgage Consultant',
	'CRMS - Certified Residential Mortgage Specialist',
	'GMA - General Mortgage Associate',
	'CVLS - Certified Veterans Lending Specialist',
);

// Video URL
$video_url = defined( 'FRS_USERS_VIDEO_BG_URL' ) ? FRS_USERS_VIDEO_BG_URL : '';

// State abbreviation to slug mapping for SVG URLs
$abbr_to_slug = array(
	'AL' => 'alabama', 'AK' => 'alaska', 'AZ' => 'arizona', 'AR' => 'arkansas',
	'CA' => 'california', 'CO' => 'colorado', 'CT' => 'connecticut', 'DE' => 'delaware',
	'DC' => 'district-of-columbia', 'FL' => 'florida', 'GA' => 'georgia', 'HI' => 'hawaii',
	'ID' => 'idaho', 'IL' => 'illinois', 'IN' => 'indiana', 'IA' => 'iowa',
	'KS' => 'kansas', 'KY' => 'kentucky', 'LA' => 'louisiana', 'ME' => 'maine',
	'MD' => 'maryland', 'MA' => 'massachusetts', 'MI' => 'michigan', 'MN' => 'minnesota',
	'MS' => 'mississippi', 'MO' => 'missouri', 'MT' => 'montana', 'NE' => 'nebraska',
	'NV' => 'nevada', 'NH' => 'new-hampshire', 'NJ' => 'new-jersey', 'NM' => 'new-mexico',
	'NY' => 'new-york', 'NC' => 'north-carolina', 'ND' => 'north-dakota', 'OH' => 'ohio',
	'OK' => 'oklahoma', 'OR' => 'oregon', 'PA' => 'pennsylvania', 'RI' => 'rhode-island',
	'SC' => 'south-carolina', 'SD' => 'south-dakota', 'TN' => 'tennessee', 'TX' => 'texas',
	'UT' => 'utah', 'VT' => 'vermont', 'VA' => 'virginia', 'WA' => 'washington',
	'WV' => 'west-virginia', 'WI' => 'wisconsin', 'WY' => 'wyoming',
);

// State name to abbreviation mapping
$state_map = array(
	'alabama' => 'AL', 'alaska' => 'AK', 'arizona' => 'AZ', 'arkansas' => 'AR',
	'california' => 'CA', 'colorado' => 'CO', 'connecticut' => 'CT', 'delaware' => 'DE',
	'florida' => 'FL', 'georgia' => 'GA', 'hawaii' => 'HI', 'idaho' => 'ID',
	'illinois' => 'IL', 'indiana' => 'IN', 'iowa' => 'IA', 'kansas' => 'KS',
	'kentucky' => 'KY', 'louisiana' => 'LA', 'maine' => 'ME', 'maryland' => 'MD',
	'massachusetts' => 'MA', 'michigan' => 'MI', 'minnesota' => 'MN', 'mississippi' => 'MS',
	'missouri' => 'MO', 'montana' => 'MT', 'nebraska' => 'NE', 'nevada' => 'NV',
	'new hampshire' => 'NH', 'new jersey' => 'NJ', 'new mexico' => 'NM', 'new york' => 'NY',
	'north carolina' => 'NC', 'north dakota' => 'ND', 'ohio' => 'OH', 'oklahoma' => 'OK',
	'oregon' => 'OR', 'pennsylvania' => 'PA', 'rhode island' => 'RI', 'south carolina' => 'SC',
	'south dakota' => 'SD', 'tennessee' => 'TN', 'texas' => 'TX', 'utah' => 'UT',
	'vermont' => 'VT', 'virginia' => 'VA', 'washington' => 'WA', 'west virginia' => 'WV',
	'wisconsin' => 'WI', 'wyoming' => 'WY', 'district of columbia' => 'DC',
);

// Base URL for state SVGs
$state_svg_base = FRS_USERS_URL . 'assets/images/states/';

// Get wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'frs-profile',
	'id'    => 'frs-profile',
) );
?>

<div <?php echo $wrapper_attributes; ?>>
	<!-- Tab Navigation -->
	<div class="frs-profile__tabs">
		<button type="button" class="frs-profile__tab frs-profile__tab--active" data-tab="profile">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
				<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
				<circle cx="12" cy="7" r="4"/>
			</svg>
			Profile
		</button>
		<button type="button" class="frs-profile__tab" data-tab="activity">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
			</svg>
			Activity
		</button>
		<button type="button" class="frs-profile__tab" data-tab="settings">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
				<circle cx="12" cy="12" r="3"/>
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
			</svg>
			Settings &amp; Admin
		</button>
	</div>

	<!-- Tab: Profile (public) -->
	<div class="frs-profile__tab-panel frs-profile__tab-panel--active" data-tab-panel="profile">
	<!-- Preview Frame (contains profile content with dark background for device preview) -->
	<div class="frs-profile__preview-frame">
		<div class="frs-profile__preview-content">
	<!-- Row 1: Profile Card + Action Buttons/Service Areas -->
	<div class="frs-profile__row frs-profile__row--main">
		<!-- Profile Card (65%) -->
		<div class="frs-profile__card frs-profile__card--header">
			<!-- Video Header -->
			<div class="frs-profile__hero">
				<?php if ( $video_url ) : ?>
					<video autoplay loop muted playsinline>
						<source src="<?php echo esc_url( $video_url ); ?>" type="video/mp4">
					</video>
				<?php else : ?>
					<div class="frs-profile__hero-fallback"></div>
				<?php endif; ?>
			</div>

			<!-- Avatar with QR Flip -->
			<div class="frs-profile__avatar-wrap frs-profile__avatar-upload-wrap">
				<div class="frs-profile__avatar-inner">
					<!-- Front: Photo with QR button -->
					<div class="frs-profile__avatar-front">
						<?php if ( $headshot_url ) : ?>
							<img src="<?php echo esc_url( $headshot_url ); ?>" alt="<?php echo esc_attr( $full_name ); ?>">
						<?php else : ?>
							<div class="frs-profile__avatar-placeholder"><?php echo esc_html( $initials ); ?></div>
						<?php endif; ?>
						<!-- QR button on front face -->
						<button
							type="button"
							class="frs-profile__qr-toggle"
							aria-label="Show QR code"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="url(#qr-grad)" stroke-width="2">
								<defs><linearGradient id="qr-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#2dd4da"/><stop offset="100%" style="stop-color:#2563eb"/></linearGradient></defs>
								<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>
							</svg>
						</button>
					</div>
					<!-- Back: QR Code with Avatar button -->
					<div class="frs-profile__avatar-back">
						<?php if ( $qr_code_data ) : ?>
							<img src="<?php echo esc_attr( $qr_code_data ); ?>" alt="QR Code" width="90" height="90">
						<?php else : ?>
							<div class="frs-profile__no-qr">QR</div>
						<?php endif; ?>
						<!-- Avatar button on back face -->
						<button
							type="button"
							class="frs-profile__qr-toggle"
							aria-label="Show avatar"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="url(#av-grad)" stroke-width="2">
								<defs><linearGradient id="av-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#2dd4da"/><stop offset="100%" style="stop-color:#2563eb"/></linearGradient></defs>
								<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
							</svg>
						</button>
					</div>
				</div>
				<!-- Upload Photo Button (visible in edit mode) -->
				<button type="button" class="frs-profile__avatar-upload-btn" id="avatar-upload-trigger">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="17 8 12 3 7 8"/>
						<line x1="12" y1="3" x2="12" y2="15"/>
					</svg>
					Change Photo
				</button>
				<input type="file" class="frs-profile__avatar-file-input" id="avatar-file-input" accept="image/*">
			</div>

			<!-- Profile Info -->
			<div class="frs-profile__info">
				<div class="frs-profile__name-row">
					<h1 class="frs-profile__name"><?php echo esc_html( $full_name ); ?></h1>
					<?php if ( $apply_url ) : ?>
					<div class="frs-profile__header-actions">
						<a href="<?php echo esc_url( $apply_url ); ?>" class="frs-profile__apply-btn" target="_blank" rel="noopener">Apply Now</a>
					</div>
					<?php endif; ?>
				</div>
				<p class="frs-profile__title-location">
					<span class="frs-profile__title">
						<!-- View mode -->
						<span data-view-mode><?php echo esc_html( $job_title ); ?></span>
						<!-- Edit mode -->
						<input
							type="text"
							class="frs-profile__edit-input"
							data-edit-mode
							data-field="job_title"
							value="<?php echo esc_attr( $job_title ); ?>"
							placeholder="Job Title"
							hidden
						>
						<?php if ( $nmls ) : ?>
							<span class="frs-profile__nmls">| NMLS# <?php echo esc_html( $nmls ); ?></span>
						<?php endif; ?>
					</span>
					<?php if ( $location ) : ?>
						<span class="frs-profile__location">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
								<circle cx="12" cy="10" r="3"/>
							</svg>
							<!-- View mode -->
							<span data-view-mode><?php echo esc_html( $location ); ?></span>
							<!-- Edit mode -->
							<input
								type="text"
								class="frs-profile__edit-input frs-profile__edit-input--small"
								data-edit-mode
								data-field="city_state"
								value="<?php echo esc_attr( $location ); ?>"
								placeholder="City, State"
								hidden
							>
						</span>
					<?php endif; ?>
				</p>
				<div class="frs-profile__contact">
					<?php if ( $email ) : ?>
						<a href="mailto:<?php echo esc_attr( $email ); ?>" class="frs-profile__contact-item" data-view-mode>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
								<circle cx="12" cy="12" r="10"/>
								<path d="M8 12h8M12 8v8"/>
							</svg>
							<?php echo esc_html( $email ); ?>
						</a>
						<!-- Edit mode email -->
						<div class="frs-profile__contact-item" data-edit-mode hidden>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
								<circle cx="12" cy="12" r="10"/>
								<path d="M8 12h8M12 8v8"/>
							</svg>
							<input
								type="email"
								class="frs-profile__edit-input"
								data-field="email"
								value="<?php echo esc_attr( $email ); ?>"
								placeholder="Email"
							>
						</div>
					<?php endif; ?>
					<?php if ( $phone ) : ?>
						<a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', $phone ) ); ?>" class="frs-profile__contact-item" data-view-mode>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
								<circle cx="12" cy="12" r="10"/>
								<path d="M15.05 11.05a3 3 0 0 0-6.1 0M12 14v.01"/>
							</svg>
							<?php echo esc_html( $phone ); ?>
						</a>
						<!-- Edit mode phone -->
						<div class="frs-profile__contact-item" data-edit-mode hidden>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
								<circle cx="12" cy="12" r="10"/>
								<path d="M15.05 11.05a3 3 0 0 0-6.1 0M12 14v.01"/>
							</svg>
							<input
								type="tel"
								class="frs-profile__edit-input"
								data-field="phone_number"
								value="<?php echo esc_attr( $phone ); ?>"
								placeholder="Phone"
							>
						</div>
					<?php endif; ?>
				</div>
			</div>
		</div>

		<!-- Right Column (35%) -->
		<div class="frs-profile__sidebar">
			<!-- Action Buttons Card -->
			<div class="frs-profile__card frs-profile__card--actions">
				<button class="frs-profile__action-btn" id="open-contact-modal">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
						<polyline points="22,6 12,13 2,6"/>
					</svg>
					Contact <?php echo esc_html( $first_name ); ?>
				</button>
				<?php if ( $phone ) : ?>
				<a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', $phone ) ); ?>" class="frs-profile__action-btn">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
					</svg>
					Call Me
				</a>
				<?php endif; ?>
			</div>

			<!-- Service Areas Card -->
			<div class="frs-profile__card frs-profile__card--service-areas">
				<h3 class="frs-profile__card-title">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
						<circle cx="12" cy="10" r="3"/>
					</svg>
					Service Areas
				</h3>
				<!-- View mode -->
				<div class="frs-profile__states-grid" data-view-mode>
					<?php if ( ! empty( $service_areas ) ) : ?>
						<?php foreach ( $service_areas as $area ) :
							$area_lower = strtolower( trim( $area ) );
							$abbr = $state_map[ $area_lower ] ?? ( strlen( $area ) === 2 ? strtoupper( $area ) : null );
							if ( $abbr && isset( $abbr_to_slug[ $abbr ] ) ) :
								$state_slug = $abbr_to_slug[ $abbr ];
								$svg_url = $state_svg_base . $state_slug . '.svg';
						?>
							<div class="frs-profile__state-card">
								<img src="<?php echo esc_url( $svg_url ); ?>" alt="<?php echo esc_attr( $abbr ); ?>" class="frs-profile__state-svg">
								<span class="frs-profile__state-abbr"><?php echo esc_html( $abbr ); ?></span>
							</div>
						<?php else : ?>
							<div class="frs-profile__state-card frs-profile__state-card--text">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
									<circle cx="12" cy="10" r="3"/>
								</svg>
								<span class="frs-profile__state-abbr"><?php echo esc_html( $area ); ?></span>
							</div>
						<?php endif; endforeach; ?>
					<?php else : ?>
						<p class="frs-profile__empty">No service areas specified.</p>
					<?php endif; ?>
				</div>
				<!-- Edit mode - State checkboxes -->
				<div class="frs-profile__edit-service-areas" data-edit-mode hidden>
					<div class="frs-profile__states-checkbox-grid">
						<?php foreach ( $abbr_to_slug as $abbr => $slug ) :
							$checked = in_array( $abbr, $service_areas, true );
						?>
							<label class="frs-profile__state-checkbox">
								<input
									type="checkbox"
									value="<?php echo esc_attr( $abbr ); ?>"
									data-service-area
									<?php checked( $checked ); ?>
								>
								<span><?php echo esc_html( $abbr ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Row 2: Biography + Specialties -->
	<div class="frs-profile__row">
		<!-- Biography Card (65%) -->
		<div class="frs-profile__card frs-profile__card--bio">
			<h3 class="frs-profile__card-title">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
					<polyline points="14 2 14 8 20 8"/>
					<line x1="16" y1="13" x2="8" y2="13"/>
					<line x1="16" y1="17" x2="8" y2="17"/>
					<line x1="10" y1="9" x2="8" y2="9"/>
				</svg>
				Professional Biography
			</h3>
			<div class="frs-profile__bio-content">
				<!-- View mode -->
				<div data-view-mode>
					<?php if ( $bio ) : ?>
						<?php echo wp_kses_post( wpautop( $bio ) ); ?>
					<?php else : ?>
						<p class="frs-profile__empty">No biography provided.</p>
					<?php endif; ?>
				</div>
				<!-- Edit mode -->
				<textarea
					class="frs-profile__edit-textarea"
					data-edit-mode
					data-field="biography"
					placeholder="Write your professional biography..."
					rows="8"
					hidden
				><?php echo esc_textarea( $bio ); ?></textarea>
			</div>
		</div>

		<!-- Specialties Card (35%) -->
		<div class="frs-profile__card frs-profile__card--specialties">
			<h3 class="frs-profile__card-title">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<polyline points="9 11 12 14 22 4"/>
					<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
				</svg>
				Specialties & Credentials
			</h3>
			<div class="frs-profile__specialties-section">
				<h4>Loan Officer Specialties</h4>
				<!-- View mode -->
				<div class="frs-profile__badges" data-view-mode>
					<?php if ( ! empty( $specialties ) ) : ?>
						<?php foreach ( $specialties as $specialty ) : ?>
							<span class="frs-profile__badge"><?php echo esc_html( $specialty ); ?></span>
						<?php endforeach; ?>
					<?php else : ?>
						<p class="frs-profile__empty frs-profile__empty--small">No specialties selected</p>
					<?php endif; ?>
				</div>
				<!-- Edit mode -->
				<div class="frs-profile__checkbox-grid" data-edit-mode hidden>
					<?php foreach ( $specialties_options as $option ) :
						$checked = in_array( $option, $specialties, true );
					?>
						<label class="frs-profile__checkbox-label">
							<input
								type="checkbox"
								value="<?php echo esc_attr( $option ); ?>"
								data-specialty
								<?php checked( $checked ); ?>
							>
							<span><?php echo esc_html( $option ); ?></span>
						</label>
					<?php endforeach; ?>
				</div>
			</div>
			<div class="frs-profile__specialties-section">
				<h4>NAMB Certifications</h4>
				<!-- View mode -->
				<div class="frs-profile__badges" data-view-mode>
					<?php if ( ! empty( $certifications ) ) : ?>
						<?php foreach ( $certifications as $cert ) : ?>
							<span class="frs-profile__badge frs-profile__badge--cert"><?php echo esc_html( $cert ); ?></span>
						<?php endforeach; ?>
					<?php else : ?>
						<p class="frs-profile__empty frs-profile__empty--small">No certifications selected</p>
					<?php endif; ?>
				</div>
				<!-- Edit mode -->
				<div class="frs-profile__checkbox-grid" data-edit-mode hidden>
					<?php foreach ( $certifications_options as $option ) :
						$checked = in_array( $option, $certifications, true );
					?>
						<label class="frs-profile__checkbox-label">
							<input
								type="checkbox"
								value="<?php echo esc_attr( $option ); ?>"
								data-certification
								<?php checked( $checked ); ?>
							>
							<span><?php echo esc_html( $option ); ?></span>
						</label>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>

	<!-- Row 3: Custom Links + Social -->
	<div class="frs-profile__row">
		<!-- Custom Links Card (65%) -->
		<div class="frs-profile__card frs-profile__card--links">
			<h3 class="frs-profile__card-title">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
					<polyline points="15 3 21 3 21 9"/>
					<line x1="10" y1="14" x2="21" y2="3"/>
				</svg>
				Custom Links
			</h3>
			<!-- View mode -->
			<div class="frs-profile__links-list" data-view-mode>
				<?php if ( ! empty( $custom_links ) ) : ?>
					<?php foreach ( $custom_links as $link ) : ?>
						<a href="<?php echo esc_url( $link['url'] ?? '#' ); ?>" target="_blank" rel="noopener noreferrer" class="frs-profile__link-item">
							<div class="frs-profile__link-info">
								<span class="frs-profile__link-title"><?php echo esc_html( $link['title'] ?? 'Link' ); ?></span>
								<span class="frs-profile__link-url"><?php echo esc_html( $link['url'] ?? '' ); ?></span>
							</div>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
								<polyline points="15 3 21 3 21 9"/>
								<line x1="10" y1="14" x2="21" y2="3"/>
							</svg>
						</a>
					<?php endforeach; ?>
				<?php else : ?>
					<p class="frs-profile__empty frs-profile__empty--center">No custom links added yet.</p>
				<?php endif; ?>
			</div>
			<!-- Edit mode -->
			<div class="frs-profile__links-edit" data-edit-mode hidden>
				<div class="frs-profile__links-edit-list">
					<?php foreach ( $custom_links as $index => $link ) : ?>
						<div class="frs-profile__link-edit-item" data-index="<?php echo esc_attr( $index ); ?>">
							<input
								type="text"
								class="frs-profile__edit-input"
								value="<?php echo esc_attr( $link['title'] ?? '' ); ?>"
								data-link-title="<?php echo esc_attr( $index ); ?>"
								placeholder="Link Title"
							>
							<input
								type="url"
								class="frs-profile__edit-input"
								value="<?php echo esc_attr( $link['url'] ?? '' ); ?>"
								data-link-url="<?php echo esc_attr( $index ); ?>"
								placeholder="https://example.com"
							>
							<button
								type="button"
								class="frs-profile__link-remove-btn"
								data-link-remove="<?php echo esc_attr( $index ); ?>"
								title="Remove link"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
						</div>
					<?php endforeach; ?>
				</div>
				<button
					type="button"
					class="frs-profile__link-add-btn"
					id="add-link-btn"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
					Add Link
				</button>
			</div>
		</div>

		<!-- Links & Social Card (35%) -->
		<div class="frs-profile__card frs-profile__card--social">
			<h3 class="frs-profile__card-title">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<circle cx="12" cy="12" r="10"/>
					<line x1="2" y1="12" x2="22" y2="12"/>
					<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
				</svg>
				Links & Social
			</h3>
			<!-- View mode -->
			<div class="frs-profile__social-grid" data-view-mode>
				<a href="<?php echo $website ? esc_url( $website ) : '#'; ?>" class="frs-profile__social-item <?php echo ! $website ? 'frs-profile__social-item--empty' : ''; ?>" <?php echo $website ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
						<circle cx="12" cy="12" r="10"/>
						<line x1="2" y1="12" x2="22" y2="12"/>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
					</svg>
					<span>Website</span>
				</a>
				<a href="<?php echo $linkedin ? esc_url( $linkedin ) : '#'; ?>" class="frs-profile__social-item <?php echo ! $linkedin ? 'frs-profile__social-item--empty' : ''; ?>" <?php echo $linkedin ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
					<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
						<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
						<rect x="2" y="9" width="4" height="12"/>
						<circle cx="4" cy="4" r="2"/>
					</svg>
					<span>LinkedIn</span>
				</a>
				<a href="<?php echo $facebook ? esc_url( $facebook ) : '#'; ?>" class="frs-profile__social-item <?php echo ! $facebook ? 'frs-profile__social-item--empty' : ''; ?>" <?php echo $facebook ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
					<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
						<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
					</svg>
					<span>Facebook</span>
				</a>
				<a href="<?php echo $instagram ? esc_url( $instagram ) : '#'; ?>" class="frs-profile__social-item <?php echo ! $instagram ? 'frs-profile__social-item--empty' : ''; ?>" <?php echo $instagram ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
						<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
						<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
						<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
					</svg>
					<span>Instagram</span>
				</a>
			</div>
			<!-- Edit mode -->
			<div class="frs-profile__social-edit" data-edit-mode hidden>
				<div class="frs-profile__social-edit-item">
					<label>Website</label>
					<input
						type="url"
						class="frs-profile__edit-input"
						data-field="website"
						value="<?php echo esc_attr( $website ); ?>"
						placeholder="https://yourwebsite.com"
					>
				</div>
				<div class="frs-profile__social-edit-item">
					<label>LinkedIn</label>
					<input
						type="url"
						class="frs-profile__edit-input"
						data-field="linkedin_url"
						value="<?php echo esc_attr( $linkedin ); ?>"
						placeholder="https://linkedin.com/in/username"
					>
				</div>
				<div class="frs-profile__social-edit-item">
					<label>Facebook</label>
					<input
						type="url"
						class="frs-profile__edit-input"
						data-field="facebook_url"
						value="<?php echo esc_attr( $facebook ); ?>"
						placeholder="https://facebook.com/username"
					>
				</div>
				<div class="frs-profile__social-edit-item">
					<label>Instagram</label>
					<input
						type="url"
						class="frs-profile__edit-input"
						data-field="instagram_url"
						value="<?php echo esc_attr( $instagram ); ?>"
						placeholder="https://instagram.com/username"
					>
				</div>
			</div>
		</div>
	</div>

		</div><!-- /.frs-profile__preview-content -->
	</div><!-- /.frs-profile__preview-frame -->

	<!-- Edit Bar (bottom of content area) -->
	<div class="frs-profile__edit-bar">
		<!-- Left: Responsive Preview Controls -->
		<div class="frs-profile__preview-controls">
		<button
			type="button"
			class="frs-profile__preview-btn active"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
				<line x1="8" y1="21" x2="16" y2="21"></line>
				<line x1="12" y1="17" x2="12" y2="21"></line>
			</svg>
			<span>Desktop</span>
		</button>
		<button
			type="button"
			class="frs-profile__preview-btn"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
				<line x1="12" y1="18" x2="12.01" y2="18"></line>
			</svg>
			<span>Tablet</span>
		</button>
		<button
			type="button"
			class="frs-profile__preview-btn"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
				<line x1="12" y1="18" x2="12.01" y2="18"></line>
			</svg>
			<span>Mobile</span>
		</button>
		</div>

		<!-- Right: Edit/Cancel/Save Buttons -->
		<div class="frs-profile__edit-actions">
			<!-- View Mode: Edit Button -->
			<button
				type="button"
				class="frs-profile__bar-edit-btn"
				data-view-mode
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
					<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
				</svg>
				Edit Profile
			</button>

			<!-- Edit Mode: Cancel + Save Buttons -->
			<button
				type="button"
				class="frs-profile__bar-cancel-btn"
				data-edit-mode
				hidden
			>
				Cancel
			</button>
			<button
				type="button"
				class="frs-profile__bar-save-btn"
				data-edit-mode
				hidden
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
					<polyline points="17 21 17 13 7 13 7 21"/>
					<polyline points="7 3 7 8 15 8"/>
				</svg>
				<span class="frs-profile__save-text">Save Changes</span>
			</button>
		</div>
	</div>
	</div><!-- /.frs-profile__tab-panel profile -->

	<!-- Tab: Activity (company-level) -->
	<div class="frs-profile__tab-panel" data-tab-panel="activity" hidden>
		<!-- Published Content -->
		<div class="frs-profile__card frs-profile__card--posts">
			<h3 class="frs-profile__card-title">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
					<polyline points="14 2 14 8 20 8"/>
				</svg>
				Published Content
			</h3>
			<div class="frs-profile__posts-grid" id="frs-profile-posts">
				<?php
				$author_posts = get_posts( array(
					'author'         => $current_user_id,
					'post_type'      => array( 'post', 'page' ),
					'post_status'    => 'publish',
					'posts_per_page' => 6,
					'orderby'        => 'date',
					'order'          => 'DESC',
				) );
				if ( ! empty( $author_posts ) ) :
					foreach ( $author_posts as $apost ) :
						$thumb = get_the_post_thumbnail_url( $apost->ID, 'medium' );
						$excerpt = wp_trim_words( $apost->post_content, 20, '...' );
				?>
					<a href="<?php echo esc_url( get_permalink( $apost->ID ) ); ?>" class="frs-profile__post-card">
						<?php if ( $thumb ) : ?>
							<div class="frs-profile__post-thumb" style="background-image: url(<?php echo esc_url( $thumb ); ?>)"></div>
						<?php else : ?>
							<div class="frs-profile__post-thumb frs-profile__post-thumb--empty">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
									<polyline points="14 2 14 8 20 8"/>
								</svg>
							</div>
						<?php endif; ?>
						<div class="frs-profile__post-info">
							<span class="frs-profile__post-date"><?php echo esc_html( get_the_date( 'M j, Y', $apost->ID ) ); ?></span>
							<h4 class="frs-profile__post-title"><?php echo esc_html( $apost->post_title ); ?></h4>
							<p class="frs-profile__post-excerpt"><?php echo esc_html( $excerpt ); ?></p>
						</div>
					</a>
				<?php endforeach; else : ?>
					<p class="frs-profile__empty frs-profile__empty--center">No published content yet.</p>
				<?php endif; ?>
			</div>
		</div>

		<!-- Activity Timeline -->
		<div class="frs-profile__card frs-profile__card--activity">
			<h3 class="frs-profile__card-title">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
				</svg>
				Activity Timeline
			</h3>
			<div class="frs-profile__activity-feed" id="frs-activity-feed">
				<div class="frs-profile__activity-loading">Loading activity...</div>
			</div>
			<div class="frs-profile__activity-more" id="frs-activity-more" hidden>
				<button type="button" class="frs-profile__load-more-btn" id="frs-load-more-activity">Load More</button>
			</div>
		</div>
	</div><!-- /.frs-profile__tab-panel activity -->

	<!-- Tab: Settings & Admin (user-only) -->
	<div class="frs-profile__tab-panel" data-tab-panel="settings" hidden>
		<div class="frs-profile__settings-grid">
			<!-- Notifications -->
			<div class="frs-profile__card frs-profile__card--notifications">
				<h3 class="frs-profile__card-title">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
						<path d="M13.73 21a2 2 0 0 1-3.46 0"/>
					</svg>
					Notifications
				</h3>
				<div class="frs-profile__toggles" id="frs-notification-toggles">
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Lead notifications</span>
							<span class="frs-profile__toggle-desc">Get notified when new leads come in</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="notifications" data-key="lead_notifications" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Meeting notifications</span>
							<span class="frs-profile__toggle-desc">Get notified about meeting requests</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="notifications" data-key="meeting_notifications" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Marketing emails</span>
							<span class="frs-profile__toggle-desc">Receive company marketing communications</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="notifications" data-key="marketing_emails" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">System updates</span>
							<span class="frs-profile__toggle-desc">Important system and platform updates</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="notifications" data-key="system_updates" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Weekly digest</span>
							<span class="frs-profile__toggle-desc">Weekly summary of your profile activity</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="notifications" data-key="weekly_digest">
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
				</div>
			</div>

			<!-- Privacy -->
			<div class="frs-profile__card frs-profile__card--privacy">
				<h3 class="frs-profile__card-title">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
					</svg>
					Privacy
				</h3>
				<div class="frs-profile__toggles" id="frs-privacy-toggles">
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Profile visible</span>
							<span class="frs-profile__toggle-desc">Show your profile on marketing websites</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="privacy" data-key="profile_visible" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Show phone number</span>
							<span class="frs-profile__toggle-desc">Display your phone number publicly</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="privacy" data-key="show_phone" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Show email</span>
							<span class="frs-profile__toggle-desc">Display your email address publicly</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="privacy" data-key="show_email" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Show social links</span>
							<span class="frs-profile__toggle-desc">Display social media links on your profile</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="privacy" data-key="show_social_links" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Contact form</span>
							<span class="frs-profile__toggle-desc">Allow visitors to send you meeting requests</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="privacy" data-key="allow_contact_form" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
					<label class="frs-profile__toggle-row">
						<div class="frs-profile__toggle-info">
							<span class="frs-profile__toggle-label">Show in directory</span>
							<span class="frs-profile__toggle-desc">Appear in the company directory listing</span>
						</div>
						<div class="frs-profile__toggle-switch">
							<input type="checkbox" data-setting="privacy" data-key="show_in_directory" checked>
							<span class="frs-profile__toggle-slider"></span>
						</div>
					</label>
				</div>
			</div>
		</div>

		<!-- Settings save toast -->
		<div class="frs-profile__settings-toast" id="frs-settings-toast" hidden>Saved</div>
	</div><!-- /.frs-profile__tab-panel settings -->
</div>
