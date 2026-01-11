<?php
/**
 * Profile Edit Template
 *
 * Template for editing/creating profiles with all fields.
 *
 * @package FRSUsers
 * @var Profile|null $profile Profile object or null for new.
 * @var bool         $is_new Whether this is a new profile.
 * @var string       $page_title Page title.
 * @var callable     $decode_json Helper function to decode JSON.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="wrap">
	<h1><?php echo esc_html( $page_title ); ?></h1>

	<?php
	// Show messages
	if ( isset( $_GET['message'] ) ) {
		if ( 'success' === $_GET['message'] ) {
			?>
			<div class="notice notice-success is-dismissible">
				<p><?php esc_html_e( 'Profile saved successfully.', 'frs-users' ); ?></p>
			</div>
			<?php
		} elseif ( 'email_exists' === $_GET['message'] ) {
			?>
			<div class="notice notice-error is-dismissible">
				<p><?php esc_html_e( 'Error: This email address is already in use by another profile.', 'frs-users' ); ?></p>
			</div>
			<?php
		} elseif ( 'error' === $_GET['message'] ) {
			?>
			<div class="notice notice-error is-dismissible">
				<p><?php esc_html_e( 'Error saving profile. Please try again.', 'frs-users' ); ?></p>
			</div>
			<?php
		}
	}
	?>

	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="frs-profile-form">
		<?php wp_nonce_field( 'frs_save_profile', 'frs_profile_nonce' ); ?>
		<input type="hidden" name="action" value="frs_save_profile">
		<input type="hidden" name="profile_id" value="<?php echo esc_attr( $profile->id ?? 0 ); ?>">

		<h2 class="nav-tab-wrapper">
			<a href="#tab-contact" class="nav-tab nav-tab-active"><?php esc_html_e( 'Contact Info', 'frs-users' ); ?></a>
			<a href="#tab-professional" class="nav-tab"><?php esc_html_e( 'Professional', 'frs-users' ); ?></a>
			<a href="#tab-location" class="nav-tab"><?php esc_html_e( 'Location', 'frs-users' ); ?></a>
			<a href="#tab-social" class="nav-tab"><?php esc_html_e( 'Social Media', 'frs-users' ); ?></a>
			<a href="#tab-tools" class="nav-tab"><?php esc_html_e( 'Tools & Platforms', 'frs-users' ); ?></a>
		</h2>

		<!-- Contact Info Tab -->
		<div id="tab-contact" class="tab-content" style="display: block;">
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="first_name"><?php esc_html_e( 'First Name', 'frs-users' ); ?> <span class="description">(<?php esc_html_e( 'required', 'frs-users' ); ?>)</span></label></th>
						<td><input type="text" name="first_name" id="first_name" class="regular-text" value="<?php echo esc_attr( $profile->first_name ?? '' ); ?>" required></td>
					</tr>
					<tr>
						<th scope="row"><label for="last_name"><?php esc_html_e( 'Last Name', 'frs-users' ); ?> <span class="description">(<?php esc_html_e( 'required', 'frs-users' ); ?>)</span></label></th>
						<td><input type="text" name="last_name" id="last_name" class="regular-text" value="<?php echo esc_attr( $profile->last_name ?? '' ); ?>" required></td>
					</tr>
					<tr>
						<th scope="row"><label for="email"><?php esc_html_e( 'Email', 'frs-users' ); ?> <span class="description">(<?php esc_html_e( 'required', 'frs-users' ); ?>)</span></label></th>
						<td><input type="email" name="email" id="email" class="regular-text" value="<?php echo esc_attr( $profile->email ?? '' ); ?>" required></td>
					</tr>
					<tr>
						<th scope="row"><label for="phone_number"><?php esc_html_e( 'Phone Number', 'frs-users' ); ?></label></th>
						<td><input type="tel" name="phone_number" id="phone_number" class="regular-text" value="<?php echo esc_attr( $profile->phone_number ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="mobile_number"><?php esc_html_e( 'Mobile Number', 'frs-users' ); ?></label></th>
						<td><input type="tel" name="mobile_number" id="mobile_number" class="regular-text" value="<?php echo esc_attr( $profile->mobile_number ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="office"><?php esc_html_e( 'Office', 'frs-users' ); ?></label></th>
						<td><input type="text" name="office" id="office" class="regular-text" value="<?php echo esc_attr( $profile->office ?? '' ); ?>"></td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Professional Tab -->
		<div id="tab-professional" class="tab-content" style="display: none;">
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="frs_agent_id"><?php esc_html_e( 'FRS Agent ID', 'frs-users' ); ?></label></th>
						<td>
							<input type="text" name="frs_agent_id" id="frs_agent_id" class="regular-text" value="<?php echo esc_attr( $profile->frs_agent_id ?? '' ); ?>">
							<p class="description"><?php esc_html_e( 'External FRS system agent ID', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="select_person_type"><?php esc_html_e( 'Person Type', 'frs-users' ); ?></label></th>
						<td>
							<select name="select_person_type" id="select_person_type" class="regular-text">
								<option value=""><?php esc_html_e( '-- Select Type --', 'frs-users' ); ?></option>
								<option value="loan_originator" <?php selected( $profile->select_person_type ?? '', 'loan_originator' ); ?>><?php esc_html_e( 'Loan Originator', 'frs-users' ); ?></option>
								<option value="broker_associate" <?php selected( $profile->select_person_type ?? '', 'broker_associate' ); ?>><?php esc_html_e( 'Broker Associate', 'frs-users' ); ?></option>
								<option value="sales_associate" <?php selected( $profile->select_person_type ?? '', 'sales_associate' ); ?>><?php esc_html_e( 'Sales Associate', 'frs-users' ); ?></option>
								<option value="escrow_officer" <?php selected( $profile->select_person_type ?? '', 'escrow_officer' ); ?>><?php esc_html_e( 'Escrow Officer', 'frs-users' ); ?></option>
								<option value="property_manager" <?php selected( $profile->select_person_type ?? '', 'property_manager' ); ?>><?php esc_html_e( 'Property Manager', 'frs-users' ); ?></option>
								<option value="partner" <?php selected( $profile->select_person_type ?? '', 'partner' ); ?>><?php esc_html_e( 'Partner', 'frs-users' ); ?></option>
								<option value="leadership" <?php selected( $profile->select_person_type ?? '', 'leadership' ); ?>><?php esc_html_e( 'Leadership', 'frs-users' ); ?></option>
								<option value="staff" <?php selected( $profile->select_person_type ?? '', 'staff' ); ?>><?php esc_html_e( 'Staff', 'frs-users' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="headshot_id"><?php esc_html_e( 'Headshot', 'frs-users' ); ?></label></th>
						<td>
							<div id="headshot-preview" style="margin-bottom: 10px;">
							<?php
							$headshot_id = $profile->headshot_id ?? 0;
							if ( $headshot_id ) {
								echo wp_get_attachment_image( $headshot_id, 'thumbnail' );
							}
							?>
							</div>
							<input type="hidden" name="headshot_id" id="headshot_id" value="<?php echo esc_attr( $headshot_id ); ?>">
							<button type="button" class="button" id="upload-headshot"><?php esc_html_e( 'Upload/Select Image', 'frs-users' ); ?></button>
							<button type="button" class="button" id="remove-headshot" style="<?php echo $headshot_id ? '' : 'display:none;'; ?>"><?php esc_html_e( 'Remove', 'frs-users' ); ?></button>
							<p class="description"><?php esc_html_e( 'Click "Save Profile" button at the bottom to save changes', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="job_title"><?php esc_html_e( 'Job Title', 'frs-users' ); ?></label></th>
						<td><input type="text" name="job_title" id="job_title" class="regular-text" value="<?php echo esc_attr( $profile->job_title ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="biography"><?php esc_html_e( 'Biography', 'frs-users' ); ?></label></th>
						<td><textarea name="biography" id="biography" rows="5" class="large-text"><?php echo esc_textarea( $profile->biography ?? '' ); ?></textarea></td>
					</tr>
					<tr>
						<th scope="row"><label for="date_of_birth"><?php esc_html_e( 'Date of Birth', 'frs-users' ); ?></label></th>
						<td><input type="date" name="date_of_birth" id="date_of_birth" class="regular-text" value="<?php echo esc_attr( $profile->date_of_birth ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="nmls"><?php esc_html_e( 'NMLS', 'frs-users' ); ?></label></th>
						<td><input type="text" name="nmls" id="nmls" class="regular-text" value="<?php echo esc_attr( $profile->nmls ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="nmls_number"><?php esc_html_e( 'NMLS Number', 'frs-users' ); ?></label></th>
						<td><input type="text" name="nmls_number" id="nmls_number" class="regular-text" value="<?php echo esc_attr( $profile->nmls_number ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="license_number"><?php esc_html_e( 'License Number', 'frs-users' ); ?></label></th>
						<td><input type="text" name="license_number" id="license_number" class="regular-text" value="<?php echo esc_attr( $profile->license_number ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="dre_license"><?php esc_html_e( 'DRE License', 'frs-users' ); ?></label></th>
						<td><input type="text" name="dre_license" id="dre_license" class="regular-text" value="<?php echo esc_attr( $profile->dre_license ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label><?php esc_html_e( 'Loan Officer Specialties', 'frs-users' ); ?></label></th>
						<td>
							<?php
							$specialties_lo = $decode_json( $profile->specialties_lo ?? '' );
							$lo_options = array(
								'Residential Mortgages' => __( 'Residential Mortgages', 'frs-users' ),
								'Consumer Loans' => __( 'Consumer Loans', 'frs-users' ),
								'VA Loans' => __( 'VA Loans', 'frs-users' ),
								'FHA Loans' => __( 'FHA Loans', 'frs-users' ),
								'Jumbo Loans' => __( 'Jumbo Loans', 'frs-users' ),
								'Construction Loans' => __( 'Construction Loans', 'frs-users' ),
								'Investment Property' => __( 'Investment Property', 'frs-users' ),
								'Reverse Mortgages' => __( 'Reverse Mortgages', 'frs-users' ),
								'USDA Rural Loans' => __( 'USDA Rural Loans', 'frs-users' ),
								'Bridge Loans' => __( 'Bridge Loans', 'frs-users' ),
							);
							foreach ( $lo_options as $value => $label ) {
								$checked = in_array( $value, $specialties_lo, true ) ? 'checked' : '';
								echo '<label style="display: block; margin: 5px 0;">';
								echo '<input type="checkbox" name="specialties_lo[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
								echo esc_html( $label );
								echo '</label>';
							}
							?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label><?php esc_html_e( 'Real Estate Specialties', 'frs-users' ); ?></label></th>
						<td>
							<?php
							$specialties = $decode_json( $profile->specialties ?? '' );
							$re_options = array(
								'Residential' => __( 'Residential', 'frs-users' ),
								'Commercial' => __( 'Commercial', 'frs-users' ),
								'Luxury' => __( 'Luxury', 'frs-users' ),
								'Investment' => __( 'Investment', 'frs-users' ),
								'New Construction' => __( 'New Construction', 'frs-users' ),
							);
							foreach ( $re_options as $value => $label ) {
								$checked = in_array( $value, $specialties, true ) ? 'checked' : '';
								echo '<label style="display: block; margin: 5px 0;">';
								echo '<input type="checkbox" name="specialties[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
								echo esc_html( $label );
								echo '</label>';
							}
							?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label><?php esc_html_e( 'Languages', 'frs-users' ); ?></label></th>
						<td>
							<?php
							$languages = $decode_json( $profile->languages ?? '' );
							$lang_options = array(
								'English' => __( 'English', 'frs-users' ),
								'Spanish' => __( 'Spanish', 'frs-users' ),
								'Mandarin' => __( 'Mandarin', 'frs-users' ),
								'Cantonese' => __( 'Cantonese', 'frs-users' ),
								'French' => __( 'French', 'frs-users' ),
							);
							foreach ( $lang_options as $value => $label ) {
								$checked = in_array( $value, $languages, true ) ? 'checked' : '';
								echo '<label style="display: block; margin: 5px 0;">';
								echo '<input type="checkbox" name="languages[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
								echo esc_html( $label );
								echo '</label>';
							}
							?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="nar_designations"><?php esc_html_e( 'NAR Designations', 'frs-users' ); ?></label></th>
						<td>
							<?php
							$nar_designations = $decode_json( $profile->nar_designations ?? '' );
							$nar_options = array(
								"ABR - Accredited Buyer's Representative",
								'CRS - Certified Residential Specialist',
								'SRES - Seniors Real Estate Specialist',
								'SRS - Seller Representative Specialist',
								'GRI - Graduate REALTOR® Institute',
							);
							foreach ( $nar_options as $value ) {
								$checked = in_array( $value, $nar_designations, true ) ? 'checked' : '';
								echo '<label style="display: block; margin: 5px 0;">';
								echo '<input type="checkbox" name="nar_designations[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
								echo esc_html( $value );
								echo '</label>';
							}
							?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="namb_certifications"><?php esc_html_e( 'NAMB Certifications', 'frs-users' ); ?></label></th>
						<td>
							<?php
							$namb_certifications = $decode_json( $profile->namb_certifications ?? '' );
							$namb_options = array(
								'CMC - Certified Mortgage Consultant',
								'CRMS - Certified Residential Mortgage Specialist',
								'GMA - General Mortgage Associate',
								'CVLS - Certified Veterans Lending Specialist',
							);
							foreach ( $namb_options as $value ) {
								$checked = in_array( $value, $namb_certifications, true ) ? 'checked' : '';
								echo '<label style="display: block; margin: 5px 0;">';
								echo '<input type="checkbox" name="namb_certifications[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
								echo esc_html( $value );
								echo '</label>';
							}
							?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="awards"><?php esc_html_e( 'Awards', 'frs-users' ); ?></label></th>
						<td><textarea name="awards" id="awards" rows="3" class="large-text"><?php echo esc_textarea( $profile->awards ?? '' ); ?></textarea></td>
					</tr>
					<tr>
						<th scope="row"><label for="brand"><?php esc_html_e( 'Brand', 'frs-users' ); ?></label></th>
						<td><input type="text" name="brand" id="brand" class="regular-text" value="<?php echo esc_attr( $profile->brand ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="status"><?php esc_html_e( 'Status', 'frs-users' ); ?></label></th>
						<td>
							<select name="status" id="status" class="regular-text">
								<option value="active" <?php selected( $profile->status ?? 'active', 'active' ); ?>><?php esc_html_e( 'Active', 'frs-users' ); ?></option>
								<option value="inactive" <?php selected( $profile->status ?? 'active', 'inactive' ); ?>><?php esc_html_e( 'Inactive', 'frs-users' ); ?></option>
							</select>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Location Tab -->
		<div id="tab-location" class="tab-content" style="display: none;">
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="city_state"><?php esc_html_e( 'City, State', 'frs-users' ); ?></label></th>
						<td><input type="text" name="city_state" id="city_state" class="regular-text" value="<?php echo esc_attr( $profile->city_state ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="region"><?php esc_html_e( 'Region', 'frs-users' ); ?></label></th>
						<td><input type="text" name="region" id="region" class="regular-text" value="<?php echo esc_attr( $profile->region ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row">
							<label for="service_areas"><?php esc_html_e( 'Service Areas', 'frs-users' ); ?></label>
							<p class="description"><?php esc_html_e( 'One per line', 'frs-users' ); ?></p>
						</th>
						<td>
							<textarea name="service_areas" id="service_areas" class="large-text" rows="5" placeholder="<?php esc_attr_e( 'Enter service areas (one per line)', 'frs-users' ); ?>"><?php
								$service_areas = is_array( $profile->service_areas ?? '' ) ? $profile->service_areas : json_decode( $profile->service_areas ?? '[]', true );
								if ( ! empty( $service_areas ) && is_array( $service_areas ) ) {
									echo esc_textarea( implode( "\n", $service_areas ) );
								}
							?></textarea>
							<p class="description"><?php esc_html_e( 'Enter service areas such as cities, states, or zip codes - one per line.', 'frs-users' ); ?></p>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Social Media Tab -->
		<div id="tab-social" class="tab-content" style="display: none;">
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="facebook_url"><?php esc_html_e( 'Facebook URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="facebook_url" id="facebook_url" class="regular-text" value="<?php echo esc_attr( $profile->facebook_url ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="instagram_url"><?php esc_html_e( 'Instagram URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="instagram_url" id="instagram_url" class="regular-text" value="<?php echo esc_attr( $profile->instagram_url ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="linkedin_url"><?php esc_html_e( 'LinkedIn URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="linkedin_url" id="linkedin_url" class="regular-text" value="<?php echo esc_attr( $profile->linkedin_url ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="twitter_url"><?php esc_html_e( 'Twitter URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="twitter_url" id="twitter_url" class="regular-text" value="<?php echo esc_attr( $profile->twitter_url ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="youtube_url"><?php esc_html_e( 'YouTube URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="youtube_url" id="youtube_url" class="regular-text" value="<?php echo esc_attr( $profile->youtube_url ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="tiktok_url"><?php esc_html_e( 'TikTok URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="tiktok_url" id="tiktok_url" class="regular-text" value="<?php echo esc_attr( $profile->tiktok_url ?? '' ); ?>"></td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Tools & Platforms Tab -->
		<div id="tab-tools" class="tab-content" style="display: none;">
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="arrive"><?php esc_html_e( 'ARRIVE URL', 'frs-users' ); ?></label></th>
						<td><input type="url" name="arrive" id="arrive" class="regular-text" value="<?php echo esc_attr( $profile->arrive ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="canva_folder_link"><?php esc_html_e( 'Canva Folder Link', 'frs-users' ); ?></label></th>
						<td><input type="url" name="canva_folder_link" id="canva_folder_link" class="regular-text" value="<?php echo esc_attr( $profile->canva_folder_link ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="niche_bio_content"><?php esc_html_e( 'Niche Bio Content', 'frs-users' ); ?></label></th>
						<td><textarea name="niche_bio_content" id="niche_bio_content" rows="5" class="large-text"><?php echo esc_textarea( $profile->niche_bio_content ?? '' ); ?></textarea></td>
					</tr>
					<tr>
						<th scope="row"><label for="loan_officer_profile"><?php esc_html_e( 'Loan Officer Profile ID', 'frs-users' ); ?></label></th>
						<td><input type="number" name="loan_officer_profile" id="loan_officer_profile" class="regular-text" value="<?php echo esc_attr( $profile->loan_officer_profile ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="loan_officer_user"><?php esc_html_e( 'Loan Officer User ID', 'frs-users' ); ?></label></th>
						<td><input type="number" name="loan_officer_user" id="loan_officer_user" class="regular-text" value="<?php echo esc_attr( $profile->loan_officer_user ?? '' ); ?>"></td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="submit">
			<input type="submit" name="submit" id="submit" class="button button-primary" value="<?php echo $is_new ? esc_attr__( 'Create Profile', 'frs-users' ) : esc_attr__( 'Update Profile', 'frs-users' ); ?>">
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profiles' ) ); ?>" class="button"><?php esc_html_e( 'Cancel', 'frs-users' ); ?></a>
		</p>
	</form>
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

	// Media uploader for headshot
	var mediaUploader;

	$('#upload-headshot').on('click', function(e) {
		e.preventDefault();

		if (mediaUploader) {
			mediaUploader.open();
			return;
		}

		mediaUploader = wp.media({
			title: '<?php esc_html_e( 'Choose Headshot', 'frs-users' ); ?>',
			button: {
				text: '<?php esc_html_e( 'Use this image', 'frs-users' ); ?>'
			},
			multiple: false
		});

		mediaUploader.on('select', function() {
			var attachment = mediaUploader.state().get('selection').first().toJSON();
			$('#headshot_id').val(attachment.id);

			// Show preview
			var imgHtml = '<img src="' + attachment.url + '" style="max-width: 150px; height: auto;">';
			$('#headshot-preview').html(imgHtml);
			$('#remove-headshot').show();
		});

		mediaUploader.open();
	});

	$('#remove-headshot').on('click', function(e) {
		e.preventDefault();
		if (confirm('<?php esc_html_e( 'Are you sure you want to remove this image?', 'frs-users' ); ?>')) {
			$('#headshot_id').val('');
			$('#headshot-preview').html('');
			$(this).hide();
		}
	});
});
</script>

<style>
.tab-content {
	display: none;
	padding: 20px 0;
}
.tab-content table {
	margin-top: 0;
}
</style>
