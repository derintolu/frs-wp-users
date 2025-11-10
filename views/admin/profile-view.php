<?php
/**
 * Profile View Template
 *
 * Template for viewing profile details (read-only).
 *
 * @package FRSUsers
 * @var Profile  $profile Profile object.
 * @var string   $page_title Page title.
 * @var string   $headshot_url Headshot image URL.
 * @var callable $decode_json Helper function to decode JSON.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="wrap">
	<h1><?php echo esc_html( $page_title ); ?></h1>

	<p class="submit" style="padding: 0; margin: 20px 0;">
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profile-edit&id=' . $profile->id ) ); ?>" class="button button-primary"><?php esc_html_e( 'Edit Profile', 'frs-users' ); ?></a>
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profiles' ) ); ?>" class="button"><?php esc_html_e( 'Back to List', 'frs-users' ); ?></a>
	</p>

	<!-- Profile Header Card -->
	<div class="postbox" style="margin-bottom: 20px;">
		<div class="inside" style="padding: 20px;">
			<div style="display: flex; gap: 30px; align-items: start;">
				<?php if ( $headshot_url ) : ?>
					<div style="flex-shrink: 0;">
						<img src="<?php echo esc_url( $headshot_url ); ?>" alt="<?php echo esc_attr( $profile->first_name . ' ' . $profile->last_name ); ?>" style="max-width: 200px; height: auto; border-radius: 8px;">
					</div>
				<?php endif; ?>
				<div style="flex: 1;">
					<h2 style="margin-top: 0;">
						<?php echo esc_html( $profile->first_name . ' ' . $profile->last_name ); ?>
					</h2>
					<?php if ( $profile->job_title ) : ?>
						<p style="font-size: 16px; color: #666; margin: 5px 0;">
							<?php echo esc_html( $profile->job_title ); ?>
						</p>
					<?php endif; ?>
					<?php if ( $profile->email ) : ?>
						<p style="margin: 10px 0;">
							<strong><?php esc_html_e( 'Email:', 'frs-users' ); ?></strong>
							<a href="mailto:<?php echo esc_attr( $profile->email ); ?>"><?php echo esc_html( $profile->email ); ?></a>
						</p>
					<?php endif; ?>
					<?php if ( $profile->phone_number ) : ?>
						<p style="margin: 10px 0;">
							<strong><?php esc_html_e( 'Phone:', 'frs-users' ); ?></strong>
							<a href="tel:<?php echo esc_attr( $profile->phone_number ); ?>"><?php echo esc_html( $profile->phone_number ); ?></a>
						</p>
					<?php endif; ?>
					<div style="margin-top: 15px;">
						<?php if ( $profile->select_person_type ) : ?>
							<span class="badge" style="display: inline-block; padding: 4px 10px; background: #2271b1; color: #fff; border-radius: 3px; font-size: 12px; margin-right: 5px;">
								<?php echo esc_html( ucwords( str_replace( '_', ' ', $profile->select_person_type ) ) ); ?>
							</span>
						<?php endif; ?>
						<?php if ( $profile->status ) : ?>
							<span class="badge" style="display: inline-block; padding: 4px 10px; background: <?php echo 'active' === $profile->status ? '#00a32a' : '#dba617'; ?>; color: #fff; border-radius: 3px; font-size: 12px;">
								<?php echo esc_html( ucfirst( $profile->status ) ); ?>
							</span>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	</div>

	<h2 class="nav-tab-wrapper">
		<a href="#tab-contact" class="nav-tab nav-tab-active"><?php esc_html_e( 'Contact Info', 'frs-users' ); ?></a>
		<a href="#tab-professional" class="nav-tab"><?php esc_html_e( 'Professional', 'frs-users' ); ?></a>
		<a href="#tab-location" class="nav-tab"><?php esc_html_e( 'Location', 'frs-users' ); ?></a>
		<a href="#tab-social" class="nav-tab"><?php esc_html_e( 'Social Media', 'frs-users' ); ?></a>
		<a href="#tab-tools" class="nav-tab"><?php esc_html_e( 'Tools & Platforms', 'frs-users' ); ?></a>
	</h2>

	<!-- Contact Info Tab -->
	<div id="tab-contact" class="tab-content postbox" style="display: block;">
		<div class="inside">
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><?php esc_html_e( 'First Name', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->first_name ); ?></td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Last Name', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->last_name ); ?></td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Email', 'frs-users' ); ?></th>
						<td><a href="mailto:<?php echo esc_attr( $profile->email ); ?>"><?php echo esc_html( $profile->email ); ?></a></td>
					</tr>
					<?php if ( $profile->phone_number ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Phone Number', 'frs-users' ); ?></th>
						<td><a href="tel:<?php echo esc_attr( $profile->phone_number ); ?>"><?php echo esc_html( $profile->phone_number ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->mobile_number ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Mobile Number', 'frs-users' ); ?></th>
						<td><a href="tel:<?php echo esc_attr( $profile->mobile_number ); ?>"><?php echo esc_html( $profile->mobile_number ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->office ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Office', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->office ); ?></td>
					</tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Professional Tab -->
	<div id="tab-professional" class="tab-content postbox" style="display: none;">
		<div class="inside">
			<table class="form-table" role="presentation">
				<tbody>
					<?php if ( $profile->frs_agent_id ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'FRS Agent ID', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->frs_agent_id ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->select_person_type ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Person Type', 'frs-users' ); ?></th>
						<td><?php echo esc_html( ucwords( str_replace( '_', ' ', $profile->select_person_type ) ) ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->job_title ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Job Title', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->job_title ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->biography ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Biography', 'frs-users' ); ?></th>
						<td><?php echo wp_kses_post( $profile->biography ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->date_of_birth ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Date of Birth', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->date_of_birth ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->nmls ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'NMLS', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->nmls ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->nmls_number ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'NMLS Number', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->nmls_number ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->license_number ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'License Number', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->license_number ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->dre_license ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'DRE License', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->dre_license ); ?></td>
					</tr>
					<?php endif; ?>
					<?php
					$specialties_lo = $decode_json( $profile->specialties_lo );
					if ( ! empty( $specialties_lo ) ) :
					?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Loan Officer Specialties', 'frs-users' ); ?></th>
						<td><?php echo esc_html( implode( ', ', $specialties_lo ) ); ?></td>
					</tr>
					<?php endif; ?>
					<?php
					$specialties = $decode_json( $profile->specialties );
					if ( ! empty( $specialties ) ) :
					?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Real Estate Specialties', 'frs-users' ); ?></th>
						<td><?php echo esc_html( implode( ', ', $specialties ) ); ?></td>
					</tr>
					<?php endif; ?>
					<?php
					$languages = $decode_json( $profile->languages );
					if ( ! empty( $languages ) ) :
					?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Languages', 'frs-users' ); ?></th>
						<td><?php echo esc_html( implode( ', ', $languages ) ); ?></td>
					</tr>
					<?php endif; ?>
					<?php
					$nar_designations = $decode_json( $profile->nar_designations );
					if ( ! empty( $nar_designations ) ) :
					?>
					<tr>
						<th scope="row"><?php esc_html_e( 'NAR Designations', 'frs-users' ); ?></th>
						<td><?php echo esc_html( implode( ', ', $nar_designations ) ); ?></td>
					</tr>
					<?php endif; ?>
					<?php
					$namb_certifications = $decode_json( $profile->namb_certifications );
					if ( ! empty( $namb_certifications ) ) :
					?>
					<tr>
						<th scope="row"><?php esc_html_e( 'NAMB Certifications', 'frs-users' ); ?></th>
						<td><?php echo esc_html( implode( ', ', $namb_certifications ) ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->awards ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Awards', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->awards ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->brand ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Brand', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->brand ); ?></td>
					</tr>
					<?php endif; ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Status', 'frs-users' ); ?></th>
						<td>
							<span style="color: <?php echo 'active' === $profile->status ? '#00a32a' : '#dba617'; ?>;">
								<?php echo esc_html( ucfirst( $profile->status ?? 'active' ) ); ?>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Location Tab -->
	<div id="tab-location" class="tab-content postbox" style="display: none;">
		<div class="inside">
			<table class="form-table" role="presentation">
				<tbody>
					<?php if ( $profile->city_state ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'City, State', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->city_state ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->region ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Region', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->region ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( ! empty( $profile->service_areas ) ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Service Areas', 'frs-users' ); ?></th>
						<td>
							<?php
							$service_areas = is_array( $profile->service_areas ) ? $profile->service_areas : json_decode( $profile->service_areas, true );
							if ( ! empty( $service_areas ) && is_array( $service_areas ) ) :
								foreach ( $service_areas as $area ) :
									?>
									<span style="display: inline-block; background: #f0f0f1; border: 1px solid #c3c4c7; padding: 4px 10px; border-radius: 3px; font-size: 13px; margin-right: 6px; margin-bottom: 6px;">
										<?php echo esc_html( $area ); ?>
									</span>
									<?php
								endforeach;
							endif;
							?>
						</td>
					</tr>
					<?php endif; ?>
					<?php if ( empty( $profile->city_state ) && empty( $profile->region ) && empty( $profile->service_areas ) ) : ?>
					<tr>
						<td colspan="2" style="color: #666; font-style: italic;">
							<?php esc_html_e( 'No location information available.', 'frs-users' ); ?>
						</td>
					</tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Social Media Tab -->
	<div id="tab-social" class="tab-content postbox" style="display: none;">
		<div class="inside">
			<table class="form-table" role="presentation">
				<tbody>
					<?php if ( $profile->facebook_url ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Facebook', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->facebook_url ); ?>" target="_blank"><?php echo esc_html( $profile->facebook_url ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->instagram_url ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Instagram', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->instagram_url ); ?>" target="_blank"><?php echo esc_html( $profile->instagram_url ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->linkedin_url ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'LinkedIn', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->linkedin_url ); ?>" target="_blank"><?php echo esc_html( $profile->linkedin_url ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->twitter_url ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Twitter', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->twitter_url ); ?>" target="_blank"><?php echo esc_html( $profile->twitter_url ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->youtube_url ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'YouTube', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->youtube_url ); ?>" target="_blank"><?php echo esc_html( $profile->youtube_url ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->tiktok_url ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'TikTok', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->tiktok_url ); ?>" target="_blank"><?php echo esc_html( $profile->tiktok_url ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php
					$has_social = $profile->facebook_url || $profile->instagram_url || $profile->linkedin_url ||
								$profile->twitter_url || $profile->youtube_url || $profile->tiktok_url;
					if ( ! $has_social ) :
					?>
					<tr>
						<td colspan="2" style="color: #666; font-style: italic;">
							<?php esc_html_e( 'No social media links available.', 'frs-users' ); ?>
						</td>
					</tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Tools & Platforms Tab -->
	<div id="tab-tools" class="tab-content postbox" style="display: none;">
		<div class="inside">
			<table class="form-table" role="presentation">
				<tbody>
					<?php if ( $profile->arrive ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'ARRIVE URL', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->arrive ); ?>" target="_blank"><?php echo esc_html( $profile->arrive ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->canva_folder_link ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Canva Folder Link', 'frs-users' ); ?></th>
						<td><a href="<?php echo esc_url( $profile->canva_folder_link ); ?>" target="_blank"><?php echo esc_html( $profile->canva_folder_link ); ?></a></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->niche_bio_content ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Niche Bio Content', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->niche_bio_content ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->loan_officer_profile ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Loan Officer Profile ID', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->loan_officer_profile ); ?></td>
					</tr>
					<?php endif; ?>
					<?php if ( $profile->loan_officer_user ) : ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Loan Officer User ID', 'frs-users' ); ?></th>
						<td><?php echo esc_html( $profile->loan_officer_user ); ?></td>
					</tr>
					<?php endif; ?>
					<?php
					$has_tools = $profile->arrive || $profile->canva_folder_link || $profile->niche_bio_content ||
								$profile->loan_officer_profile || $profile->loan_officer_user;
					if ( ! $has_tools ) :
					?>
					<tr>
						<td colspan="2" style="color: #666; font-style: italic;">
							<?php esc_html_e( 'No tools/platforms information available.', 'frs-users' ); ?>
						</td>
					</tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

	<p class="submit" style="padding: 0; margin: 20px 0;">
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profile-edit&id=' . $profile->id ) ); ?>" class="button button-primary"><?php esc_html_e( 'Edit Profile', 'frs-users' ); ?></a>
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profiles' ) ); ?>" class="button"><?php esc_html_e( 'Back to List', 'frs-users' ); ?></a>
	</p>
</div>

<script>
jQuery(document).ready(function($) {
	// Tab switching
	$('.nav-tab').on('click', function(e) {
		e.preventDefault();
		var targetTab = $(this).attr('href');

		$('.nav-tab').removeClass('nav-tab-active');
		$(this).addClass('nav-tab-active');

		$('.tab-content').hide();
		$(targetTab).show();
	});
});
</script>

<style>
.tab-content {
	display: none;
	margin-top: 20px;
	padding: 20px;
}
.tab-content .inside {
	margin: 0 !important;
	padding: 20px !important;
}
.badge {
	display: inline-block;
	padding: 4px 10px;
	border-radius: 3px;
	font-size: 12px;
	font-weight: 600;
	margin-right: 5px;
}
</style>
