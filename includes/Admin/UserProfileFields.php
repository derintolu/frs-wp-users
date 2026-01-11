<?php
/**
 * User Profile Fields Admin
 *
 * Adds FRS profile fields to WordPress user edit screen.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Core\Roles;
use FRSUsers\Traits\Base;

/**
 * Class UserProfileFields
 *
 * Extends WordPress user edit screen with FRS profile fields.
 *
 * @package FRSUsers\Admin
 */
class UserProfileFields {

	use Base;

	/**
	 * Initialize user profile fields.
	 *
	 * @return void
	 */
	public function init() {
		// Add profile fields to user edit screen
		add_action( 'show_user_profile', array( $this, 'render_profile_fields' ) );
		add_action( 'edit_user_profile', array( $this, 'render_profile_fields' ) );

		// Save profile fields
		add_action( 'personal_options_update', array( $this, 'save_profile_fields' ) );
		add_action( 'edit_user_profile_update', array( $this, 'save_profile_fields' ) );

		// Enqueue admin assets
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Render profile fields on user edit screen.
	 *
	 * @param \WP_User $user User object.
	 * @return void
	 */
	public function render_profile_fields( $user ) {
		// Only show for FRS roles (use centralized Roles class)
		$frs_roles = Roles::get_wp_role_slugs();
		$user_roles = $user->roles ?? array();
		$has_frs_role = ! empty( array_intersect( $frs_roles, $user_roles ) );

		if ( ! $has_frs_role && ! current_user_can( 'manage_options' ) ) {
			return;
		}

		?>
		<h2><?php esc_html_e( 'FRS Profile Information', 'frs-users' ); ?></h2>
		<table class="form-table" role="presentation">
			<?php $this->render_contact_fields( $user ); ?>
			<?php $this->render_professional_fields( $user ); ?>
			<?php $this->render_location_fields( $user ); ?>
			<?php $this->render_social_fields( $user ); ?>
			<?php $this->render_profile_settings( $user ); ?>
		</table>
		<?php
	}

	/**
	 * Render contact information fields.
	 *
	 * @param \WP_User $user User object.
	 * @return void
	 */
	protected function render_contact_fields( $user ) {
		?>
		<tr class="frs-section-header">
			<th colspan="2"><h3><?php esc_html_e( 'Contact Information', 'frs-users' ); ?></h3></th>
		</tr>
		<tr>
			<th><label for="frs_phone_number"><?php esc_html_e( 'Phone Number', 'frs-users' ); ?></label></th>
			<td>
				<input type="tel" name="frs_phone_number" id="frs_phone_number" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_phone_number', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<tr>
			<th><label for="frs_mobile_number"><?php esc_html_e( 'Mobile Number', 'frs-users' ); ?></label></th>
			<td>
				<input type="tel" name="frs_mobile_number" id="frs_mobile_number" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_mobile_number', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<tr>
			<th><label for="frs_office"><?php esc_html_e( 'Office Location', 'frs-users' ); ?></label></th>
			<td>
				<input type="text" name="frs_office" id="frs_office" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_office', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<?php
	}

	/**
	 * Render professional information fields.
	 *
	 * @param \WP_User $user User object.
	 * @return void
	 */
	protected function render_professional_fields( $user ) {
		?>
		<tr class="frs-section-header">
			<th colspan="2"><h3><?php esc_html_e( 'Professional Information', 'frs-users' ); ?></h3></th>
		</tr>
		<tr>
			<th><label for="frs_job_title"><?php esc_html_e( 'Job Title', 'frs-users' ); ?></label></th>
			<td>
				<input type="text" name="frs_job_title" id="frs_job_title" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_job_title', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<tr>
			<th><label for="frs_nmls"><?php esc_html_e( 'NMLS Number', 'frs-users' ); ?></label></th>
			<td>
				<input type="text" name="frs_nmls" id="frs_nmls" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_nmls', true ) ); ?>" class="regular-text" />
				<p class="description"><?php esc_html_e( 'For loan officers', 'frs-users' ); ?></p>
			</td>
		</tr>
		<tr>
			<th><label for="frs_dre_license"><?php esc_html_e( 'DRE License', 'frs-users' ); ?></label></th>
			<td>
				<input type="text" name="frs_dre_license" id="frs_dre_license" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_dre_license', true ) ); ?>" class="regular-text" />
				<p class="description"><?php esc_html_e( 'For real estate agents', 'frs-users' ); ?></p>
			</td>
		</tr>
		<tr>
			<th><label for="frs_biography"><?php esc_html_e( 'Biography', 'frs-users' ); ?></label></th>
			<td>
				<textarea name="frs_biography" id="frs_biography" rows="5" class="large-text"><?php echo esc_textarea( get_user_meta( $user->ID, 'frs_biography', true ) ); ?></textarea>
			</td>
		</tr>
		<tr>
			<th><label for="frs_headshot_id"><?php esc_html_e( 'Profile Photo', 'frs-users' ); ?></label></th>
			<td>
				<?php
				$headshot_id = get_user_meta( $user->ID, 'frs_headshot_id', true );
				$headshot_url = $headshot_id ? wp_get_attachment_url( $headshot_id ) : '';
				?>
				<div class="frs-image-upload">
					<div class="frs-image-preview" style="margin-bottom: 10px;">
						<?php if ( $headshot_url ) : ?>
							<img src="<?php echo esc_url( $headshot_url ); ?>" style="max-width: 150px; max-height: 150px; display: block;" />
						<?php endif; ?>
					</div>
					<input type="hidden" name="frs_headshot_id" id="frs_headshot_id" value="<?php echo esc_attr( $headshot_id ); ?>" />
					<button type="button" class="button frs-upload-image"><?php esc_html_e( 'Upload Photo', 'frs-users' ); ?></button>
					<?php if ( $headshot_url ) : ?>
						<button type="button" class="button frs-remove-image"><?php esc_html_e( 'Remove Photo', 'frs-users' ); ?></button>
					<?php endif; ?>
				</div>
			</td>
		</tr>
		<?php
	}

	/**
	 * Render location fields.
	 *
	 * @param \WP_User $user User object.
	 * @return void
	 */
	protected function render_location_fields( $user ) {
		?>
		<tr class="frs-section-header">
			<th colspan="2"><h3><?php esc_html_e( 'Location & Service Areas', 'frs-users' ); ?></h3></th>
		</tr>
		<tr>
			<th><label for="frs_city_state"><?php esc_html_e( 'City, State', 'frs-users' ); ?></label></th>
			<td>
				<input type="text" name="frs_city_state" id="frs_city_state" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_city_state', true ) ); ?>" class="regular-text" />
				<p class="description"><?php esc_html_e( 'e.g., San Diego, CA', 'frs-users' ); ?></p>
			</td>
		</tr>
		<tr>
			<th><label for="frs_service_areas"><?php esc_html_e( 'Service Areas', 'frs-users' ); ?></label></th>
			<td>
				<textarea name="frs_service_areas" id="frs_service_areas" rows="3" class="large-text" placeholder="<?php esc_attr_e( 'Enter states, one per line (e.g., CA, AZ, NV)', 'frs-users' ); ?>"><?php
					$service_areas = json_decode( get_user_meta( $user->ID, 'frs_service_areas', true ) ?: '[]', true );
					echo esc_textarea( is_array( $service_areas ) ? implode( "\n", $service_areas ) : '' );
				?></textarea>
				<p class="description"><?php esc_html_e( 'Enter state abbreviations or names, one per line', 'frs-users' ); ?></p>
			</td>
		</tr>
		<?php
	}

	/**
	 * Render social media fields.
	 *
	 * @param \WP_User $user User object.
	 * @return void
	 */
	protected function render_social_fields( $user ) {
		?>
		<tr class="frs-section-header">
			<th colspan="2"><h3><?php esc_html_e( 'Social Media & Links', 'frs-users' ); ?></h3></th>
		</tr>
		<tr>
			<th><label for="frs_linkedin_url"><?php esc_html_e( 'LinkedIn URL', 'frs-users' ); ?></label></th>
			<td>
				<input type="url" name="frs_linkedin_url" id="frs_linkedin_url" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_linkedin_url', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<tr>
			<th><label for="frs_facebook_url"><?php esc_html_e( 'Facebook URL', 'frs-users' ); ?></label></th>
			<td>
				<input type="url" name="frs_facebook_url" id="frs_facebook_url" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_facebook_url', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<tr>
			<th><label for="frs_instagram_url"><?php esc_html_e( 'Instagram URL', 'frs-users' ); ?></label></th>
			<td>
				<input type="url" name="frs_instagram_url" id="frs_instagram_url" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_instagram_url', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<tr>
			<th><label for="frs_twitter_url"><?php esc_html_e( 'Twitter URL', 'frs-users' ); ?></label></th>
			<td>
				<input type="url" name="frs_twitter_url" id="frs_twitter_url" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_twitter_url', true ) ); ?>" class="regular-text" />
			</td>
		</tr>
		<?php
	}

	/**
	 * Render profile settings.
	 *
	 * @param \WP_User $user User object.
	 * @return void
	 */
	protected function render_profile_settings( $user ) {
		?>
		<tr class="frs-section-header">
			<th colspan="2"><h3><?php esc_html_e( 'Profile Settings', 'frs-users' ); ?></h3></th>
		</tr>
		<tr>
			<th><label for="frs_is_active"><?php esc_html_e( 'Active Profile', 'frs-users' ); ?></label></th>
			<td>
				<label>
					<input type="checkbox" name="frs_is_active" id="frs_is_active" value="1" <?php checked( get_user_meta( $user->ID, 'frs_is_active', true ), '1' ); ?> />
					<?php esc_html_e( 'Show this profile in directories', 'frs-users' ); ?>
				</label>
			</td>
		</tr>
		<tr>
			<th><label for="frs_arrive"><?php esc_html_e( 'Apply Now URL', 'frs-users' ); ?></label></th>
			<td>
				<input type="url" name="frs_arrive" id="frs_arrive" value="<?php echo esc_attr( get_user_meta( $user->ID, 'frs_arrive', true ) ); ?>" class="regular-text" />
				<p class="description"><?php esc_html_e( 'URL for loan application', 'frs-users' ); ?></p>
			</td>
		</tr>
		<?php
	}

	/**
	 * Save profile fields.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public function save_profile_fields( $user_id ) {
		if ( ! current_user_can( 'edit_user', $user_id ) ) {
			return;
		}

		// Contact fields
		$this->update_user_meta( $user_id, 'frs_phone_number', 'text' );
		$this->update_user_meta( $user_id, 'frs_mobile_number', 'text' );
		$this->update_user_meta( $user_id, 'frs_office', 'text' );

		// Professional fields
		$this->update_user_meta( $user_id, 'frs_job_title', 'text' );
		$this->update_user_meta( $user_id, 'frs_nmls', 'text' );
		$this->update_user_meta( $user_id, 'frs_dre_license', 'text' );
		$this->update_user_meta( $user_id, 'frs_biography', 'textarea' );
		$this->update_user_meta( $user_id, 'frs_headshot_id', 'int' );

		// Location fields
		$this->update_user_meta( $user_id, 'frs_city_state', 'text' );

		// Service areas - convert textarea to JSON array
		if ( isset( $_POST['frs_service_areas'] ) ) {
			$areas = array_filter( array_map( 'trim', explode( "\n", sanitize_textarea_field( wp_unslash( $_POST['frs_service_areas'] ) ) ) ) );
			update_user_meta( $user_id, 'frs_service_areas', wp_json_encode( $areas ) );
		}

		// Social media
		$this->update_user_meta( $user_id, 'frs_linkedin_url', 'url' );
		$this->update_user_meta( $user_id, 'frs_facebook_url', 'url' );
		$this->update_user_meta( $user_id, 'frs_instagram_url', 'url' );
		$this->update_user_meta( $user_id, 'frs_twitter_url', 'url' );

		// Profile settings
		$this->update_user_meta( $user_id, 'frs_arrive', 'url' );

		// Checkbox
		update_user_meta( $user_id, 'frs_is_active', isset( $_POST['frs_is_active'] ) ? '1' : '0' );

		// Update timestamp
		update_user_meta( $user_id, 'frs_updated_at', current_time( 'mysql' ) );

		// Fire hook for integrations
		do_action( 'frs_user_profile_updated', $user_id );
	}

	/**
	 * Update user meta with sanitization.
	 *
	 * @param int    $user_id User ID.
	 * @param string $meta_key Meta key.
	 * @param string $type Field type (text, textarea, url, int).
	 * @return void
	 */
	protected function update_user_meta( $user_id, $meta_key, $type = 'text' ) {
		if ( ! isset( $_POST[ $meta_key ] ) ) {
			return;
		}

		$value = wp_unslash( $_POST[ $meta_key ] );

		switch ( $type ) {
			case 'textarea':
				$value = sanitize_textarea_field( $value );
				break;
			case 'url':
				$value = esc_url_raw( $value );
				break;
			case 'int':
				$value = absint( $value );
				break;
			default:
				$value = sanitize_text_field( $value );
				break;
		}

		update_user_meta( $user_id, $meta_key, $value );
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook Admin page hook.
	 * @return void
	 */
	public function enqueue_assets( $hook ) {
		if ( ! in_array( $hook, array( 'profile.php', 'user-edit.php' ), true ) ) {
			return;
		}

		// Add media uploader
		wp_enqueue_media();

		// Add custom admin CSS
		wp_add_inline_style(
			'wp-admin',
			'
			.frs-section-header th {
				padding-top: 20px;
				padding-bottom: 0;
			}
			.frs-section-header h3 {
				margin: 0;
				font-size: 14px;
				color: #1d2327;
			}
			.frs-image-preview img {
				border: 1px solid #ddd;
				border-radius: 4px;
			}
			.frs-remove-image {
				color: #b32d2e;
			}
			'
		);

		// Add media uploader JS
		wp_add_inline_script(
			'media-upload',
			"
			jQuery(document).ready(function($) {
				var mediaUploader;

				$('.frs-upload-image').on('click', function(e) {
					e.preventDefault();
					var button = $(this);
					var preview = button.closest('.frs-image-upload').find('.frs-image-preview');
					var input = button.closest('.frs-image-upload').find('input[type=hidden]');

					if (mediaUploader) {
						mediaUploader.open();
						return;
					}

					mediaUploader = wp.media({
						title: 'Select Profile Photo',
						button: { text: 'Use This Photo' },
						multiple: false
					});

					mediaUploader.on('select', function() {
						var attachment = mediaUploader.state().get('selection').first().toJSON();
						preview.html('<img src=\"' + attachment.url + '\" style=\"max-width: 150px; max-height: 150px; display: block;\" />');
						input.val(attachment.id);
						button.after('<button type=\"button\" class=\"button frs-remove-image\">Remove Photo</button>');
					});

					mediaUploader.open();
				});

				$(document).on('click', '.frs-remove-image', function(e) {
					e.preventDefault();
					var button = $(this);
					var preview = button.closest('.frs-image-upload').find('.frs-image-preview');
					var input = button.closest('.frs-image-upload').find('input[type=hidden]');

					preview.html('');
					input.val('');
					button.remove();
				});
			});
			"
		);
	}
}
