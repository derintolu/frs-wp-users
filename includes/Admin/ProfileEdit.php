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
use Carbon_Fields\Container;
use Carbon_Fields\Field;

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
		add_action( 'carbon_fields_register_fields', array( __CLASS__, 'register_fields' ) );
	}

	/**
	 * Register Carbon Fields for profile editing
	 *
	 * @return void
	 */
	public static function register_fields() {
		Container::make( 'user_meta', __( 'FRS Profile Information', 'frs-users' ) )
			->add_tab( __( 'Basic Information', 'frs-users' ), array(
				Field::make( 'text', 'frs_first_name', __( 'First Name', 'frs-users' ) )
					->set_width( 50 ),
				Field::make( 'text', 'frs_last_name', __( 'Last Name', 'frs-users' ) )
					->set_width( 50 ),
				Field::make( 'text', 'frs_email', __( 'Email', 'frs-users' ) )
					->set_attribute( 'type', 'email' )
					->set_width( 50 ),
				Field::make( 'text', 'frs_phone_number', __( 'Phone Number', 'frs-users' ) )
					->set_width( 50 ),
				Field::make( 'text', 'frs_mobile_number', __( 'Mobile Number', 'frs-users' ) )
					->set_width( 50 ),
				Field::make( 'text', 'frs_job_title', __( 'Job Title', 'frs-users' ) )
					->set_width( 50 ),
				Field::make( 'textarea', 'frs_biography', __( 'Biography', 'frs-users' ) )
					->set_rows( 4 ),
			) )
			->add_tab( __( 'Professional Info', 'frs-users' ), array(
				Field::make( 'text', 'frs_nmls', __( 'NMLS Number', 'frs-users' ) )
					->set_width( 33 ),
				Field::make( 'text', 'frs_license_number', __( 'License Number', 'frs-users' ) )
					->set_width( 33 ),
				Field::make( 'text', 'frs_arrive', __( 'Arrive URL', 'frs-users' ) )
					->set_width( 33 ),
				Field::make( 'multiselect', 'frs_specialties_lo', __( 'Loan Officer Specialties', 'frs-users' ) )
					->add_options( array(
						'fha'         => 'FHA Loans',
						'va'          => 'VA Loans',
						'conventional' => 'Conventional',
						'jumbo'       => 'Jumbo Loans',
						'renovation'  => 'Renovation Loans',
						'first_time'  => 'First-Time Buyers',
					) ),
				Field::make( 'multiselect', 'frs_languages', __( 'Languages', 'frs-users' ) )
					->add_options( array(
						'en' => 'English',
						'es' => 'Spanish',
						'fr' => 'French',
						'de' => 'German',
						'zh' => 'Chinese',
					) ),
			) )
			->add_tab( __( 'Media', 'frs-users' ), array(
				Field::make( 'image', 'frs_headshot_id', __( 'Headshot', 'frs-users' ) )
					->set_value_type( 'id' ),
			) );
	}

	/**
	 * Render the edit page
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

		// Handle form submission
		if ( isset( $_POST['frs_save_profile'] ) && check_admin_referer( 'frs_save_profile' ) ) {
			self::save_profile( $profile_id );
		}

		// Helper to decode JSON fields
		$decode_json = function( $value ) {
			if ( is_string( $value ) ) {
				$decoded = json_decode( $value, true );
				return is_array( $decoded ) ? $decoded : array();
			}
			return is_array( $value ) ? $value : array();
		};

		?>
		<div class="wrap">
			<h1><?php echo $profile_id ? __( 'Edit Profile', 'frs-users' ) : __( 'Add New Profile', 'frs-users' ); ?></h1>

			<form method="post" action="" enctype="multipart/form-data">
				<?php wp_nonce_field( 'frs_save_profile' ); ?>

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
			</form>
		</div>

		<style>
			.tab-content { display: none; }
			.nav-tab-wrapper { margin-bottom: 20px; }
		</style>

		<script>
		jQuery(document).ready(function($) {
			// Tab switching
			$('.nav-tab').on('click', function(e) {
				e.preventDefault();
				$('.nav-tab').removeClass('nav-tab-active');
				$(this).addClass('nav-tab-active');
				$('.tab-content').hide();
				$($(this).attr('href')).show();
			});

			// Media uploader for headshot
			$('.upload-image-btn').on('click', function(e) {
				e.preventDefault();
				var target = $(this).data('target');
				var frame = wp.media({
					title: '<?php esc_js( _e( 'Select or Upload Image', 'frs-users' ) ); ?>',
					button: { text: '<?php esc_js( _e( 'Use this image', 'frs-users' ) ); ?>' },
					multiple: false
				});

				frame.on('select', function() {
					var attachment = frame.state().get('selection').first().toJSON();
					$('#' + target).val(attachment.id);
					location.reload(); // Reload to show the image
				});

				frame.open();
			});

			// Remove image
			$('.remove-image-btn').on('click', function(e) {
				e.preventDefault();
				var target = $(this).data('target');
				$('#' + target).val('');
				location.reload();
			});
		});
		</script>
		<?php
	}

	/**
	 * Save profile data
	 *
	 * @param int $profile_id Profile ID (0 for new).
	 * @return void
	 */
	private static function save_profile( $profile_id = 0 ) {
		// Contact fields
		$data = array(
			'first_name'    => sanitize_text_field( $_POST['first_name'] ?? '' ),
			'last_name'     => sanitize_text_field( $_POST['last_name'] ?? '' ),
			'email'         => sanitize_email( $_POST['email'] ?? '' ),
			'phone_number'  => sanitize_text_field( $_POST['phone_number'] ?? '' ),
			'mobile_number' => sanitize_text_field( $_POST['mobile_number'] ?? '' ),
			'office'        => sanitize_text_field( $_POST['office'] ?? '' ),
		);

		// Professional fields
		$data['headshot_id']          = absint( $_POST['headshot_id'] ?? 0 );
		$data['job_title']            = sanitize_text_field( $_POST['job_title'] ?? '' );
		$data['biography']            = sanitize_textarea_field( $_POST['biography'] ?? '' );
		$data['date_of_birth']        = sanitize_text_field( $_POST['date_of_birth'] ?? '' );
		$data['nmls']                 = sanitize_text_field( $_POST['nmls'] ?? '' );
		$data['nmls_number']          = sanitize_text_field( $_POST['nmls_number'] ?? '' );
		$data['license_number']       = sanitize_text_field( $_POST['license_number'] ?? '' );
		$data['dre_license']          = sanitize_text_field( $_POST['dre_license'] ?? '' );
		$data['specialties']          = sanitize_textarea_field( $_POST['specialties'] ?? '' );
		$data['awards']               = sanitize_textarea_field( $_POST['awards'] ?? '' );
		$data['nar_designations']     = sanitize_text_field( $_POST['nar_designations'] ?? '' );
		$data['namb_certifications']  = sanitize_text_field( $_POST['namb_certifications'] ?? '' );
		$data['brand']                = sanitize_text_field( $_POST['brand'] ?? '' );
		$data['status']               = sanitize_text_field( $_POST['status'] ?? 'active' );

		// JSON array fields
		$data['specialties_lo'] = isset( $_POST['specialties_lo'] ) && is_array( $_POST['specialties_lo'] )
			? wp_json_encode( array_map( 'sanitize_text_field', $_POST['specialties_lo'] ) )
			: wp_json_encode( array() );

		$data['languages'] = isset( $_POST['languages'] ) && is_array( $_POST['languages'] )
			? wp_json_encode( array_map( 'sanitize_text_field', $_POST['languages'] ) )
			: wp_json_encode( array() );

		// Location fields
		$data['city_state'] = sanitize_text_field( $_POST['city_state'] ?? '' );
		$data['region']     = sanitize_text_field( $_POST['region'] ?? '' );

		// Social media fields
		$data['facebook_url']  = esc_url_raw( $_POST['facebook_url'] ?? '' );
		$data['instagram_url'] = esc_url_raw( $_POST['instagram_url'] ?? '' );
		$data['linkedin_url']  = esc_url_raw( $_POST['linkedin_url'] ?? '' );
		$data['twitter_url']   = esc_url_raw( $_POST['twitter_url'] ?? '' );
		$data['youtube_url']   = esc_url_raw( $_POST['youtube_url'] ?? '' );
		$data['tiktok_url']    = esc_url_raw( $_POST['tiktok_url'] ?? '' );

		// Tools & platforms fields
		$data['arrive']                     = esc_url_raw( $_POST['arrive'] ?? '' );
		$data['canva_folder_link']          = esc_url_raw( $_POST['canva_folder_link'] ?? '' );
		$data['niche_bio_content']          = sanitize_textarea_field( $_POST['niche_bio_content'] ?? '' );
		$data['personal_branding_images']   = sanitize_textarea_field( $_POST['personal_branding_images'] ?? '' );

		if ( empty( $data['email'] ) ) {
			add_settings_error( 'frs-users', 'missing-email', __( 'Email is required', 'frs-users' ), 'error' );
			return;
		}

		$profile_types = isset( $_POST['profile_types'] ) && is_array( $_POST['profile_types'] )
			? array_map( 'sanitize_text_field', $_POST['profile_types'] )
			: array();

		if ( $profile_id ) {
			$profile = Profile::find( $profile_id );
			if ( $profile ) {
				$profile->save( $data );
				if ( ! empty( $profile_types ) ) {
					$profile->set_types( $profile_types );
				}
				add_settings_error( 'frs-users', 'profile-updated', __( 'Profile updated successfully', 'frs-users' ), 'updated' );
			}
		} else {
			$profile = new Profile();
			$new_id = $profile->save( $data );
			if ( $new_id ) {
				if ( ! empty( $profile_types ) ) {
					$profile_obj = Profile::find( $new_id );
					if ( $profile_obj ) {
						$profile_obj->set_types( $profile_types );
					}
				}
				add_settings_error( 'frs-users', 'profile-created', __( 'Profile created successfully', 'frs-users' ), 'updated' );
				wp_redirect( admin_url( 'admin.php?page=frs-users-profiles&action=edit&profile_id=' . $new_id ) );
				exit;
			}
		}
	}
}
