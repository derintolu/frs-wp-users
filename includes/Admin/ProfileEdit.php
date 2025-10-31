<?php
/**
 * Profile Edit Page
 *
 * Handles the profile edit/add form with Carbon Fields.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;

/**
 * Class ProfileEdit
 *
 * Manages the profile edit/add form.
 *
 * @package FRSUsers\Admin
 */
class ProfileEdit {

	/**
	 * Initialize the edit page
	 *
	 * @return void
	 */
	public static function init() {
		// Hook into SCF form save
		add_action( 'acf/save_post', array( __CLASS__, 'save_to_profile_table' ), 20 );
	}

	/**
	 * Render the edit page with SCF fields
	 *
	 * @param int $profile_id Profile ID to edit (0 for new).
	 * @return void
	 */
	public static function render_edit_page( $profile_id = 0 ) {
		$profile = null;
		if ( $profile_id ) {
			$profile = Profile::find( $profile_id );
			if ( ! $profile ) {
				wp_die( __( 'Profile not found', 'frs-users' ) );
			}
		}

		// Create temporary post object for SCF (SCF expects a post context)
		$post_id = 'frs_profile_' . ( $profile_id ?: 'new' );

		// Load existing profile data into SCF fields
		if ( $profile ) {
			self::load_profile_into_scf( $profile );
		}

		?>
		<div class="wrap">
			<h1><?php echo $profile_id ? __( 'Edit Profile', 'frs-users' ) : __( 'Add New Profile', 'frs-users' ); ?></h1>

			<?php
			// Render SCF form with profile data
			acf_form( array(
				'id'            => 'frs-profile-form',
				'post_id'       => $post_id,
				'field_groups'  => array( 'group_people' ), // ID of the "People" field group from SCF export
				'form'          => true,
				'return'        => add_query_arg( 'updated', 'true', $_SERVER['REQUEST_URI'] ),
				'html_before_fields' => '<input type="hidden" name="frs_profile_id" value="' . esc_attr( $profile_id ) . '">',
				'submit_value'  => $profile_id ? __( 'Update Profile', 'frs-users' ) : __( 'Create Profile', 'frs-users' ),
				'updated_message' => __( 'Profile updated successfully', 'frs-users' ),
			) );
			?>

			<div style="display:none;">
				<!-- Original form structure for reference if needed -->
				<h2 class="nav-tab-wrapper">
					<a href="#tab-contact" class="nav-tab nav-tab-active"><?php _e( 'Contact Info', 'frs-users' ); ?></a>
					<a href="#tab-professional" class="nav-tab"><?php _e( 'Professional', 'frs-users' ); ?></a>
					<a href="#tab-location" class="nav-tab"><?php _e( 'Location', 'frs-users' ); ?></a>
					<a href="#tab-social" class="nav-tab"><?php _e( 'Social Media', 'frs-users' ); ?></a>
					<a href="#tab-tools" class="nav-tab"><?php _e( 'Tools & Platforms', 'frs-users' ); ?></a>
				</h2>

				<div id="tab-contact" class="tab-content" style="display: block;">
					<table class="form-table">
						<tr>
							<th><label for="first_name"><?php _e( 'First Name', 'frs-users' ); ?> *</label></th>
							<td><input type="text" name="first_name" id="first_name" class="regular-text" value="<?php echo esc_attr( $profile->first_name ?? '' ); ?>" required></td>
						</tr>
						<tr>
							<th><label for="last_name"><?php _e( 'Last Name', 'frs-users' ); ?> *</label></th>
							<td><input type="text" name="last_name" id="last_name" class="regular-text" value="<?php echo esc_attr( $profile->last_name ?? '' ); ?>" required></td>
						</tr>
						<tr>
							<th><label for="email"><?php _e( 'Email', 'frs-users' ); ?> *</label></th>
							<td><input type="email" name="email" id="email" class="regular-text" value="<?php echo esc_attr( $profile->email ?? '' ); ?>" required></td>
						</tr>
						<tr>
							<th><label for="phone_number"><?php _e( 'Phone Number', 'frs-users' ); ?></label></th>
							<td><input type="tel" name="phone_number" id="phone_number" class="regular-text" value="<?php echo esc_attr( $profile->phone_number ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="mobile_number"><?php _e( 'Mobile Number', 'frs-users' ); ?></label></th>
							<td><input type="tel" name="mobile_number" id="mobile_number" class="regular-text" value="<?php echo esc_attr( $profile->mobile_number ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="office"><?php _e( 'Office', 'frs-users' ); ?></label></th>
							<td><input type="text" name="office" id="office" class="regular-text" value="<?php echo esc_attr( $profile->office ?? '' ); ?>"></td>
						</tr>
					</table>
				</div>

				<div id="tab-professional" class="tab-content" style="display: none;">
					<table class="form-table">
						<tr>
							<th><label for="headshot_id"><?php _e( 'Headshot', 'frs-users' ); ?></label></th>
							<td>
								<?php
								$headshot_id = $profile->headshot_id ?? 0;
								if ( $headshot_id ) {
									echo wp_get_attachment_image( $headshot_id, 'thumbnail' );
									echo '<br>';
								}
								?>
								<input type="hidden" name="headshot_id" id="headshot_id" value="<?php echo esc_attr( $headshot_id ); ?>">
								<button type="button" class="button upload-image-btn" data-target="headshot_id"><?php _e( 'Upload/Select Image', 'frs-users' ); ?></button>
								<?php if ( $headshot_id ) : ?>
									<button type="button" class="button remove-image-btn" data-target="headshot_id"><?php _e( 'Remove', 'frs-users' ); ?></button>
								<?php endif; ?>
							</td>
						</tr>
						<tr>
							<th><label for="job_title"><?php _e( 'Job Title', 'frs-users' ); ?></label></th>
							<td><input type="text" name="job_title" id="job_title" class="regular-text" value="<?php echo esc_attr( $profile->job_title ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="biography"><?php _e( 'Biography', 'frs-users' ); ?></label></th>
							<td><textarea name="biography" id="biography" rows="5" class="large-text"><?php echo esc_textarea( $profile->biography ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th><label for="date_of_birth"><?php _e( 'Date of Birth', 'frs-users' ); ?></label></th>
							<td><input type="date" name="date_of_birth" id="date_of_birth" class="regular-text" value="<?php echo esc_attr( $profile->date_of_birth ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="nmls"><?php _e( 'NMLS', 'frs-users' ); ?></label></th>
							<td><input type="text" name="nmls" id="nmls" class="regular-text" value="<?php echo esc_attr( $profile->nmls ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="nmls_number"><?php _e( 'NMLS Number', 'frs-users' ); ?></label></th>
							<td><input type="text" name="nmls_number" id="nmls_number" class="regular-text" value="<?php echo esc_attr( $profile->nmls_number ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="license_number"><?php _e( 'License Number', 'frs-users' ); ?></label></th>
							<td><input type="text" name="license_number" id="license_number" class="regular-text" value="<?php echo esc_attr( $profile->license_number ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="dre_license"><?php _e( 'DRE License', 'frs-users' ); ?></label></th>
							<td><input type="text" name="dre_license" id="dre_license" class="regular-text" value="<?php echo esc_attr( $profile->dre_license ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label><?php _e( 'Loan Officer Specialties', 'frs-users' ); ?></label></th>
							<td>
								<?php
								$specialties_lo = $decode_json( $profile->specialties_lo ?? '' );
								$lo_options = array(
									'fha' => 'FHA Loans',
									'va' => 'VA Loans',
									'conventional' => 'Conventional',
									'jumbo' => 'Jumbo Loans',
									'renovation' => 'Renovation Loans',
									'first_time' => 'First-Time Buyers',
								);
								foreach ( $lo_options as $value => $label ) {
									$checked = in_array( $value, $specialties_lo ) ? 'checked' : '';
									echo '<label style="display: block; margin: 5px 0;">';
									echo '<input type="checkbox" name="specialties_lo[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
									echo esc_html( $label );
									echo '</label>';
								}
								?>
							</td>
						</tr>
						<tr>
							<th><label for="specialties"><?php _e( 'Specialties', 'frs-users' ); ?></label></th>
							<td><textarea name="specialties" id="specialties" rows="3" class="large-text"><?php echo esc_textarea( $profile->specialties ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th><label><?php _e( 'Languages', 'frs-users' ); ?></label></th>
							<td>
								<?php
								$languages = $decode_json( $profile->languages ?? '' );
								$lang_options = array(
									'en' => 'English',
									'es' => 'Spanish',
									'fr' => 'French',
									'de' => 'German',
									'zh' => 'Chinese',
								);
								foreach ( $lang_options as $value => $label ) {
									$checked = in_array( $value, $languages ) ? 'checked' : '';
									echo '<label style="display: block; margin: 5px 0;">';
									echo '<input type="checkbox" name="languages[]" value="' . esc_attr( $value ) . '" ' . $checked . '> ';
									echo esc_html( $label );
									echo '</label>';
								}
								?>
							</td>
						</tr>
						<tr>
							<th><label for="awards"><?php _e( 'Awards', 'frs-users' ); ?></label></th>
							<td><textarea name="awards" id="awards" rows="3" class="large-text"><?php echo esc_textarea( $profile->awards ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th><label for="nar_designations"><?php _e( 'NAR Designations', 'frs-users' ); ?></label></th>
							<td><input type="text" name="nar_designations" id="nar_designations" class="regular-text" value="<?php echo esc_attr( $profile->nar_designations ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="namb_certifications"><?php _e( 'NAMB Certifications', 'frs-users' ); ?></label></th>
							<td><input type="text" name="namb_certifications" id="namb_certifications" class="regular-text" value="<?php echo esc_attr( $profile->namb_certifications ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="brand"><?php _e( 'Brand', 'frs-users' ); ?></label></th>
							<td><input type="text" name="brand" id="brand" class="regular-text" value="<?php echo esc_attr( $profile->brand ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="status"><?php _e( 'Status', 'frs-users' ); ?></label></th>
							<td>
								<select name="status" id="status" class="regular-text">
									<option value="active" <?php selected( ( $profile->status ?? 'active' ), 'active' ); ?>><?php _e( 'Active', 'frs-users' ); ?></option>
									<option value="inactive" <?php selected( ( $profile->status ?? 'active' ), 'inactive' ); ?>><?php _e( 'Inactive', 'frs-users' ); ?></option>
								</select>
							</td>
						</tr>
						<tr>
							<th><label><?php _e( 'Profile Types', 'frs-users' ); ?></label></th>
							<td>
								<?php
								$current_types = $profile ? $profile->get_types() : array();
								$available_types = array(
									'loan_officer' => __( 'Loan Officer', 'frs-users' ),
									'realtor_partner' => __( 'Realtor Partner', 'frs-users' ),
									'staff' => __( 'Staff', 'frs-users' ),
									'leadership' => __( 'Leadership', 'frs-users' ),
									'assistant' => __( 'Assistant', 'frs-users' ),
								);
								foreach ( $available_types as $type_value => $type_label ) {
									$checked = in_array( $type_value, $current_types ) ? 'checked' : '';
									echo '<label style="display: block; margin: 5px 0;">';
									echo '<input type="checkbox" name="profile_types[]" value="' . esc_attr( $type_value ) . '" ' . $checked . '> ';
									echo esc_html( $type_label );
									echo '</label>';
								}
								?>
								<p class="description"><?php _e( 'Select all that apply', 'frs-users' ); ?></p>
							</td>
						</tr>
					</table>
				</div>

				<div id="tab-location" class="tab-content" style="display: none;">
					<table class="form-table">
						<tr>
							<th><label for="city_state"><?php _e( 'City, State', 'frs-users' ); ?></label></th>
							<td><input type="text" name="city_state" id="city_state" class="regular-text" value="<?php echo esc_attr( $profile->city_state ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="region"><?php _e( 'Region', 'frs-users' ); ?></label></th>
							<td><input type="text" name="region" id="region" class="regular-text" value="<?php echo esc_attr( $profile->region ?? '' ); ?>"></td>
						</tr>
					</table>
				</div>

				<div id="tab-social" class="tab-content" style="display: none;">
					<table class="form-table">
						<tr>
							<th><label for="facebook_url"><?php _e( 'Facebook URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="facebook_url" id="facebook_url" class="regular-text" value="<?php echo esc_attr( $profile->facebook_url ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="instagram_url"><?php _e( 'Instagram URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="instagram_url" id="instagram_url" class="regular-text" value="<?php echo esc_attr( $profile->instagram_url ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="linkedin_url"><?php _e( 'LinkedIn URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="linkedin_url" id="linkedin_url" class="regular-text" value="<?php echo esc_attr( $profile->linkedin_url ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="twitter_url"><?php _e( 'Twitter URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="twitter_url" id="twitter_url" class="regular-text" value="<?php echo esc_attr( $profile->twitter_url ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="youtube_url"><?php _e( 'YouTube URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="youtube_url" id="youtube_url" class="regular-text" value="<?php echo esc_attr( $profile->youtube_url ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="tiktok_url"><?php _e( 'TikTok URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="tiktok_url" id="tiktok_url" class="regular-text" value="<?php echo esc_attr( $profile->tiktok_url ?? '' ); ?>"></td>
						</tr>
					</table>
				</div>

				<div id="tab-tools" class="tab-content" style="display: none;">
					<table class="form-table">
						<tr>
							<th><label for="arrive"><?php _e( 'Arrive URL', 'frs-users' ); ?></label></th>
							<td><input type="url" name="arrive" id="arrive" class="regular-text" value="<?php echo esc_attr( $profile->arrive ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="canva_folder_link"><?php _e( 'Canva Folder Link', 'frs-users' ); ?></label></th>
							<td><input type="url" name="canva_folder_link" id="canva_folder_link" class="regular-text" value="<?php echo esc_attr( $profile->canva_folder_link ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="niche_bio_content"><?php _e( 'Niche Bio Content', 'frs-users' ); ?></label></th>
							<td><textarea name="niche_bio_content" id="niche_bio_content" rows="5" class="large-text"><?php echo esc_textarea( $profile->niche_bio_content ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th><label for="personal_branding_images"><?php _e( 'Personal Branding Images', 'frs-users' ); ?></label></th>
							<td><textarea name="personal_branding_images" id="personal_branding_images" rows="3" class="large-text" placeholder="<?php esc_attr_e( 'Enter image URLs, one per line', 'frs-users' ); ?>"><?php echo esc_textarea( $profile->personal_branding_images ?? '' ); ?></textarea></td>
						</tr>
					</table>
				</div>

				<p class="submit">
					<input type="submit" name="frs_save_profile" class="button button-primary" value="<?php echo $profile_id ? __( 'Update Profile', 'frs-users' ) : __( 'Create Profile', 'frs-users' ); ?>">
					<a href="<?php echo admin_url( 'admin.php?page=frs-users-profiles' ); ?>" class="button"><?php _e( 'Cancel', 'frs-users' ); ?></a>
				</p>
			</div><!-- End hidden original form -->

		</div><!-- .wrap -->
		<?php
	}

	/**
	 * Load profile data from wp_frs_profiles table into SCF fields
	 *
	 * @param Profile $profile Profile object
	 * @return void
	 */
	private static function load_profile_into_scf( $profile ) {
		if ( ! $profile || ! function_exists( 'update_field' ) ) {
			return;
		}

		$post_id = 'frs_profile_' . $profile->id;

		// Map all 45 fields from profile table to SCF fields
		$field_mapping = array(
			// Contact
			'first_name', 'last_name', 'email', 'phone_number', 'mobile_number', 'office',
			// Professional
			'headshot_id', 'job_title', 'biography', 'date_of_birth', 'select_person_type',
			'nmls', 'nmls_number', 'license_number', 'dre_license',
			'specialties_lo', 'specialties', 'languages', 'awards',
			'nar_designations', 'namb_certifications', 'brand', 'status',
			// Location
			'city_state', 'region',
			// Social
			'facebook_url', 'instagram_url', 'linkedin_url',
			'twitter_url', 'youtube_url', 'tiktok_url',
			// Tools
			'arrive', 'canva_folder_link', 'niche_bio_content', 'personal_branding_images',
		);

		foreach ( $field_mapping as $field_name ) {
			if ( isset( $profile->{$field_name} ) ) {
				$value = $profile->{$field_name};

				// Decode JSON fields
				if ( in_array( $field_name, array( 'specialties_lo', 'languages', 'awards', 'niche_bio_content', 'personal_branding_images' ), true ) ) {
					if ( is_string( $value ) ) {
						$decoded = json_decode( $value, true );
						$value = is_array( $decoded ) ? $decoded : $value;
					}
				}

				update_field( $field_name, $value, $post_id );
			}
		}

		// Load profile types
		$profile_types = $profile->get_types();
		update_field( 'select_person_type', $profile_types, $post_id );
	}

	/**
	 * Save SCF form data to wp_frs_profiles table
	 *
	 * @param string|int $post_id Post ID (our custom ID: frs_profile_123).
	 * @return void
	 */
	public static function save_to_profile_table( $post_id ) {
		// Only handle our custom profile post IDs
		if ( ! is_string( $post_id ) || strpos( $post_id, 'frs_profile_' ) !== 0 ) {
			return;
		}

		// Get profile ID from custom post ID
		$profile_id = str_replace( 'frs_profile_', '', $post_id );
		$profile_id = ( $profile_id === 'new' ) ? 0 : absint( $profile_id );

		if ( ! function_exists( 'get_field' ) ) {
			return;
		}

		// Collect all SCF field values
		$data = array();

		// Contact fields
		$data['first_name']    = get_field( 'first_name', $post_id );
		$data['last_name']     = get_field( 'last_name', $post_id );
		$data['email']         = get_field( 'email', $post_id );
		$data['phone_number']  = get_field( 'phone_number', $post_id );
		$data['mobile_number'] = get_field( 'mobile_number', $post_id );
		$data['office']        = get_field( 'office', $post_id );

		// Professional fields
		$data['headshot_id']         = get_field( 'headshot', $post_id ); // Note: SCF might use 'headshot' not 'headshot_id'
		$data['job_title']           = get_field( 'job_title', $post_id );
		$data['biography']           = get_field( 'biography', $post_id );
		$data['date_of_birth']       = get_field( 'date_of_birth', $post_id );
		$data['nmls']                = get_field( 'nmls', $post_id );
		$data['nmls_number']         = get_field( 'nmls_number', $post_id );
		$data['license_number']      = get_field( 'license_number', $post_id );
		$data['dre_license']         = get_field( 'dre_license', $post_id );
		$data['brand']               = get_field( 'brand', $post_id );
		$data['status']              = get_field( 'status', $post_id );

		// JSON fields - encode arrays
		$data['specialties_lo']      = wp_json_encode( get_field( 'specialties_lo', $post_id ) ?: array() );
		$data['specialties']         = get_field( 'specialties', $post_id );
		$data['languages']           = wp_json_encode( get_field( 'languages', $post_id ) ?: array() );
		$data['awards']              = wp_json_encode( get_field( 'awards', $post_id ) ?: array() );
		$data['nar_designations']    = wp_json_encode( get_field( 'nar_designations', $post_id ) ?: array() );
		$data['namb_certifications'] = wp_json_encode( get_field( 'namb_certifications', $post_id ) ?: array() );

		// Location fields
		$data['city_state'] = get_field( 'city_state', $post_id );
		$data['region']     = get_field( 'region', $post_id );

		// Social fields
		$data['facebook_url']  = get_field( 'facebook_url', $post_id );
		$data['instagram_url'] = get_field( 'instagram_url', $post_id );
		$data['linkedin_url']  = get_field( 'linkedin_url', $post_id );
		$data['twitter_url']   = get_field( 'twitter_url', $post_id );
		$data['youtube_url']   = get_field( 'youtube_url', $post_id );
		$data['tiktok_url']    = get_field( 'tiktok_url', $post_id );

		// Tools fields
		$data['arrive']                    = get_field( 'arrive', $post_id );
		$data['canva_folder_link']         = get_field( 'canva_folder_link', $post_id );
		$data['niche_bio_content']         = wp_json_encode( get_field( 'niche_bio_content', $post_id ) ?: array() );
		$data['personal_branding_images']  = wp_json_encode( get_field( 'personal_branding_images', $post_id ) ?: array() );

		// Remove null values
		$data = array_filter( $data, function( $value ) {
			return $value !== null && $value !== '';
		} );

		// Save to profiles table
		if ( $profile_id ) {
			// Update existing profile
			$profile = Profile::find( $profile_id );
			if ( $profile ) {
				$profile->save( $data );
			}
		} else {
			// Create new profile
			$profile = new Profile();
			$new_id = $profile->save( $data );

			if ( $new_id ) {
				// Redirect to edit page for new profile
				wp_redirect( admin_url( 'admin.php?page=frs-users-profiles&action=edit&profile_id=' . $new_id ) );
				exit;
			}
		}

		// Handle profile types
		$profile_types = get_field( 'select_person_type', $post_id );
		if ( $profile && ! empty( $profile_types ) ) {
			$profile->set_types( is_array( $profile_types ) ? $profile_types : array( $profile_types ) );
		}
	}

}
