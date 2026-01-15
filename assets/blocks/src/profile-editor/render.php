<?php
/**
 * Profile Editor Block - Server-side Render
 *
 * Displays the current user's profile with edit capabilities.
 * Uses the loan-officer.php template with the edit-bar.php partial.
 *
 * @package FRSUsers
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
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
	'id'                => $current_user_id,
	'user_id'           => $current_user_id,
	'email'             => $user_profile->get_email(),
	'first_name'        => $user_profile->get_first_name(),
	'last_name'         => $user_profile->get_last_name(),
	'display_name'      => $user_profile->get_display_name(),
	'full_name'         => $user_profile->get_full_name(),
	'phone_number'      => $user_profile->get_phone_number(),
	'mobile_number'     => $user_profile->get_mobile_number(),
	'job_title'         => $user_profile->get_job_title() ?: 'Loan Officer',
	'nmls'              => $user_profile->get_nmls(),
	'city_state'        => $user_profile->get_city_state(),
	'biography'         => $user_profile->get_biography(),
	'headshot_url'      => $user_profile->get_headshot_url(),
	'profile_slug'      => $user->user_nicename,
	'qr_code_data'      => $user_profile->get_qr_code_data(),
	'arrive'            => $user_profile->get_arrive_url(),
	'apply_url'         => $user_profile->get_arrive_url(),
	'website'           => $user_profile->get_website(),
	'facebook_url'      => $user_profile->get_facebook_url(),
	'instagram_url'     => $user_profile->get_instagram_url(),
	'linkedin_url'      => $user_profile->get_linkedin_url(),
	'twitter_url'       => $user_profile->get_twitter_url(),
	'specialties_lo'    => $user_profile->get_specialties_lo(),
	'namb_certifications' => $user_profile->get_namb_certifications(),
	'service_areas'     => $user_profile->get_service_areas(),
	'custom_links'      => $user_profile->get_custom_links(),
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

// Video URL
$video_url = defined( 'FRS_USERS_VIDEO_BG_URL' ) ? FRS_USERS_VIDEO_BG_URL : '';

// State SVG mapping
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
$state_svg_base = FRS_USERS_URL . 'assets/images/states/';

// Localize script data for Interactivity API
wp_localize_script(
	'frs-profile-editor-view-script',
	'frsProfileEditor',
	array(
		'nonce'   => wp_create_nonce( 'wp_rest' ),
		'apiUrl'  => rest_url( 'frs-users/v1' ),
		'userId'  => $current_user_id,
		'profile' => $profile,
	)
);

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'frs-profile-editor',
) );
?>

<div <?php echo $wrapper_attributes; ?>>
	<div class="frs-profile-content">
		<?php
		// Include the profile template inline (simplified version)
		// For full template, include from templates/profile/loan-officer.php
		?>
		
		<!-- Header Card -->
		<div class="frs-profile__card frs-profile__card--header">
			<div class="frs-profile__hero">
				<?php if ( $video_url ) : ?>
				<video autoplay loop muted playsinline>
					<source src="<?php echo esc_url( $video_url ); ?>" type="video/mp4">
				</video>
				<?php else : ?>
				<div class="frs-profile__hero-fallback"></div>
				<?php endif; ?>
			</div>
			
			<div class="frs-profile__avatar-wrap">
				<div class="frs-profile__avatar-inner">
					<?php if ( $headshot_url ) : ?>
					<div class="frs-profile__avatar-front">
						<img src="<?php echo esc_url( $headshot_url ); ?>" alt="<?php echo esc_attr( $full_name ); ?>">
					</div>
					<?php else : ?>
					<div class="frs-profile__avatar-placeholder"><?php echo esc_html( $initials ); ?></div>
					<?php endif; ?>
				</div>
			</div>
			
			<div class="frs-profile__info">
				<div class="frs-profile__name-row">
					<h1 class="frs-profile__name" data-frs-field="display_name"><?php echo esc_html( $full_name ); ?></h1>
					<?php if ( $apply_url ) : ?>
					<a href="<?php echo esc_url( $apply_url ); ?>" class="frs-profile__apply-btn" target="_blank" rel="noopener">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14 2 14 8 20 8"/>
							<line x1="16" y1="13" x2="8" y2="13"/>
							<line x1="16" y1="17" x2="8" y2="17"/>
							<polyline points="10 9 9 9 8 9"/>
						</svg>
						Apply Now
					</a>
					<?php endif; ?>
				</div>
				
				<p class="frs-profile__title-location">
					<span class="frs-profile__title" data-frs-field="job_title"><?php echo esc_html( $job_title ); ?></span>
					<?php if ( $nmls ) : ?>
					<span class="frs-profile__nmls">NMLS# <?php echo esc_html( $nmls ); ?></span>
					<?php endif; ?>
					<?php if ( $location ) : ?>
					<span class="frs-profile__location">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
							<circle cx="12" cy="10" r="3"/>
						</svg>
						<?php echo esc_html( $location ); ?>
					</span>
					<?php endif; ?>
				</p>
				
				<div class="frs-profile__contact">
					<?php if ( $email ) : ?>
					<a href="mailto:<?php echo esc_attr( $email ); ?>" class="frs-profile__contact-item">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
							<polyline points="22,6 12,13 2,6"/>
						</svg>
						<?php echo esc_html( $email ); ?>
					</a>
					<?php endif; ?>
					<?php if ( $phone ) : ?>
					<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>" class="frs-profile__contact-item">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
						</svg>
						<?php echo esc_html( $phone ); ?>
					</a>
					<?php endif; ?>
				</div>
			</div>
		</div>
		
		<!-- Biography Card -->
		<?php if ( $bio ) : ?>
		<div class="frs-profile__card frs-profile__card--bio">
			<h3 class="frs-profile__card-title">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
					<circle cx="12" cy="7" r="4"/>
				</svg>
				About Me
			</h3>
			<div class="frs-profile__bio-content" data-frs-field="biography">
				<?php echo wp_kses_post( wpautop( $bio ) ); ?>
			</div>
		</div>
		<?php endif; ?>
		
		<!-- Service Areas Card -->
		<?php if ( ! empty( $service_areas ) ) : ?>
		<div class="frs-profile__card frs-profile__card--service-areas">
			<h3 class="frs-profile__card-title">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
					<circle cx="12" cy="10" r="3"/>
				</svg>
				Licensed States
			</h3>
			<div class="frs-profile__states-grid">
				<?php foreach ( $service_areas as $state_abbr ) : 
					$state_abbr = strtoupper( trim( $state_abbr ) );
					$state_slug = $abbr_to_slug[ $state_abbr ] ?? strtolower( $state_abbr );
					$svg_url = $state_svg_base . $state_slug . '.svg';
				?>
				<div class="frs-profile__state-card">
					<img src="<?php echo esc_url( $svg_url ); ?>" alt="<?php echo esc_attr( $state_abbr ); ?>" class="frs-profile__state-svg">
					<span class="frs-profile__state-abbr"><?php echo esc_html( $state_abbr ); ?></span>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php endif; ?>
		
		<!-- Specialties Card -->
		<?php if ( ! empty( $specialties ) || ! empty( $certifications ) ) : ?>
		<div class="frs-profile__card frs-profile__card--specialties">
			<h3 class="frs-profile__card-title">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
				</svg>
				Expertise
			</h3>
			<?php if ( ! empty( $specialties ) ) : ?>
			<div class="frs-profile__specialties-section">
				<h4>Loan Programs</h4>
				<div class="frs-profile__badges">
					<?php foreach ( $specialties as $specialty ) : ?>
					<span class="frs-profile__badge"><?php echo esc_html( $specialty ); ?></span>
					<?php endforeach; ?>
				</div>
			</div>
			<?php endif; ?>
			<?php if ( ! empty( $certifications ) ) : ?>
			<div class="frs-profile__specialties-section">
				<h4>Certifications</h4>
				<div class="frs-profile__badges">
					<?php foreach ( $certifications as $cert ) : ?>
					<span class="frs-profile__badge frs-profile__badge--cert"><?php echo esc_html( $cert ); ?></span>
					<?php endforeach; ?>
				</div>
			</div>
			<?php endif; ?>
		</div>
		<?php endif; ?>
		
		<!-- Social Links Card -->
		<?php if ( $facebook || $instagram || $linkedin || $twitter || $website ) : ?>
		<div class="frs-profile__card frs-profile__card--social">
			<h3 class="frs-profile__card-title">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="18" cy="5" r="3"/>
					<circle cx="6" cy="12" r="3"/>
					<circle cx="18" cy="19" r="3"/>
					<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
					<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
				</svg>
				Connect
			</h3>
			<div class="frs-profile__social-grid">
				<?php if ( $linkedin ) : ?>
				<a href="<?php echo esc_url( $linkedin ); ?>" class="frs-profile__social-item" target="_blank" rel="noopener">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
						<rect x="2" y="9" width="4" height="12"/>
						<circle cx="4" cy="4" r="2"/>
					</svg>
					LinkedIn
				</a>
				<?php endif; ?>
				<?php if ( $facebook ) : ?>
				<a href="<?php echo esc_url( $facebook ); ?>" class="frs-profile__social-item" target="_blank" rel="noopener">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
					</svg>
					Facebook
				</a>
				<?php endif; ?>
				<?php if ( $instagram ) : ?>
				<a href="<?php echo esc_url( $instagram ); ?>" class="frs-profile__social-item" target="_blank" rel="noopener">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
						<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
						<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
					</svg>
					Instagram
				</a>
				<?php endif; ?>
				<?php if ( $twitter ) : ?>
				<a href="<?php echo esc_url( $twitter ); ?>" class="frs-profile__social-item" target="_blank" rel="noopener">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
					</svg>
					Twitter/X
				</a>
				<?php endif; ?>
				<?php if ( $website ) : ?>
				<a href="<?php echo esc_url( $website ); ?>" class="frs-profile__social-item" target="_blank" rel="noopener">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<line x1="2" y1="12" x2="22" y2="12"/>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
					</svg>
					Website
				</a>
				<?php endif; ?>
			</div>
		</div>
		<?php endif; ?>
	</div>
	
	<?php
	// Include the edit bar partial
	include FRS_USERS_DIR . 'templates/profile/partials/edit-bar.php';
	?>
</div>
