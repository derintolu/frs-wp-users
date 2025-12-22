<?php
/**
 * Profile Edit Page
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;
use FRSUsers\Core\ProfileFields;

/**
 * Class ProfileEdit
 *
 * Handles the profile edit/add admin page.
 *
 * @package FRSUsers\Admin
 */
class ProfileEdit {
	use Base;

	/**
	 * Initialize
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_post_frs_save_profile', array( $this, 'handle_save' ) );
	}

	/**
	 * Render edit page
	 *
	 * @param int|null $profile_id Profile ID to edit, or null for new profile.
	 * @return void
	 */
	public static function render( $profile_id = null ) {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		// Enqueue WordPress media library for image uploads
		wp_enqueue_media();

		// Get profile if editing existing
		$profile = null;
		$is_new  = empty( $profile_id ) || 'new' === $profile_id;

		if ( ! $is_new ) {
			$profile = Profile::find( $profile_id );

			if ( ! $profile ) {
				wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
			}
		}

		// Get all field definitions from Carbon Fields as reference
		$fields = ProfileFields::get_all_fields();

		// Page title
		$page_title = $is_new ? __( 'Add New Profile', 'frs-users' ) : __( 'Edit Profile', 'frs-users' );

		// Helper function to decode JSON fields
		$decode_json = function( $value ) {
			if ( empty( $value ) ) {
				return array();
			}
			if ( is_array( $value ) ) {
				return $value;
			}
			$decoded = json_decode( $value, true );
			return is_array( $decoded ) ? $decoded : array();
		};

		// Load template
		include FRS_USERS_DIR . 'views/admin/profile-edit.php';
	}

	/**
	 * Handle form submission
	 *
	 * @return void
	 */
	public function handle_save() {
		// Security check
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'You do not have permission to perform this action.', 'frs-users' ) );
		}

		// Verify nonce
		if ( ! isset( $_POST['frs_profile_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['frs_profile_nonce'] ) ), 'frs_save_profile' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'frs-users' ) );
		}

		// Get profile ID (0 for new)
		$profile_id = isset( $_POST['profile_id'] ) ? absint( $_POST['profile_id'] ) : 0;
		$is_new     = empty( $profile_id );

		// Prepare data
		$data = $this->sanitize_profile_data( $_POST );

		// Validate email uniqueness
		if ( ! empty( $data['email'] ) ) {
			$existing_profile = Profile::where( 'email', $data['email'] )->first();

			if ( $existing_profile ) {
				// If editing, make sure the existing email belongs to THIS profile
				if ( $is_new || $existing_profile->id !== $profile_id ) {
					error_log( 'FRS Users: Email already exists - ' . $data['email'] );
					wp_safe_redirect(
						add_query_arg(
							array(
								'page'    => 'frs-profile-edit',
								'id'      => $profile_id ?: 'new',
								'message' => 'email_exists',
							),
							admin_url( 'admin.php' )
						)
					);
					exit;
				}
			}
		}

		try {
			if ( $is_new ) {
				// Create new profile
				$profile = Profile::create( $data );
				error_log( 'FRS Users: Profile created - ID: ' . $profile->id );
				$message = __( 'Profile created successfully.', 'frs-users' );
				$redirect_id = $profile->id;
			} else {
				// Update existing profile
				$profile = Profile::find( $profile_id );

				if ( ! $profile ) {
					wp_die( esc_html__( 'Profile not found.', 'frs-users' ) );
				}

				error_log( 'FRS Users: Updating profile - ID: ' . $profile_id . ', Email: ' . $data['email'] );
				$profile->update( $data );
				error_log( 'FRS Users: Profile updated successfully' );
				$message = __( 'Profile updated successfully.', 'frs-users' );
				$redirect_id = $profile_id;
			}

			// Redirect with success message
			wp_safe_redirect(
				add_query_arg(
					array(
						'page'    => 'frs-profile-view',
						'id'      => $redirect_id,
						'message' => 'success',
					),
					admin_url( 'admin.php' )
				)
			);
			exit;

		} catch ( \Exception $e ) {
			// Log the error
			error_log( 'FRS Users: Error saving profile - ' . $e->getMessage() );

			// Redirect with error message
			wp_safe_redirect(
				add_query_arg(
					array(
						'page'    => 'frs-profile-edit',
						'id'      => $profile_id ?: 'new',
						'message' => 'error',
					),
					admin_url( 'admin.php' )
				)
			);
			exit;
		}
	}

	/**
	 * Sanitize profile data from POST
	 *
	 * @param array $post_data POST data.
	 * @return array Sanitized data.
	 */
	private function sanitize_profile_data( $post_data ) {
		$data = array();

		// Text fields
		$text_fields = array(
			'frs_agent_id',
			'email',
			'first_name',
			'last_name',
			'phone_number',
			'mobile_number',
			'office',
			'job_title',
			'nmls',
			'nmls_number',
			'license_number',
			'dre_license',
			'brand',
			'city_state',
			'region',
		);

		foreach ( $text_fields as $field ) {
			if ( isset( $post_data[ $field ] ) ) {
				if ( 'email' === $field ) {
					$data[ $field ] = sanitize_email( $post_data[ $field ] );
				} else {
					$data[ $field ] = sanitize_text_field( $post_data[ $field ] );
				}
			}
		}

		// URL fields
		$url_fields = array(
			'facebook_url',
			'instagram_url',
			'linkedin_url',
			'twitter_url',
			'youtube_url',
			'tiktok_url',
			'arrive',
			'canva_folder_link',
		);

		foreach ( $url_fields as $field ) {
			if ( isset( $post_data[ $field ] ) ) {
				$data[ $field ] = esc_url_raw( $post_data[ $field ] );
			}
		}

		// Textarea fields
		if ( isset( $post_data['biography'] ) ) {
			$data['biography'] = wp_kses_post( $post_data['biography'] );
		}

		if ( isset( $post_data['niche_bio_content'] ) ) {
			$data['niche_bio_content'] = sanitize_textarea_field( $post_data['niche_bio_content'] );
		}

		// Select fields
		if ( isset( $post_data['select_person_type'] ) ) {
			$data['select_person_type'] = sanitize_text_field( $post_data['select_person_type'] );
		}

		if ( isset( $post_data['status'] ) ) {
			$data['status'] = sanitize_text_field( $post_data['status'] );
		}

		// Date fields
		if ( isset( $post_data['date_of_birth'] ) ) {
			$data['date_of_birth'] = sanitize_text_field( $post_data['date_of_birth'] );
		}

		// Number fields
		if ( isset( $post_data['headshot_id'] ) ) {
			$data['headshot_id'] = absint( $post_data['headshot_id'] );
		}

		if ( isset( $post_data['loan_officer_profile'] ) ) {
			$data['loan_officer_profile'] = absint( $post_data['loan_officer_profile'] );
		}

		if ( isset( $post_data['loan_officer_user'] ) ) {
			$data['loan_officer_user'] = absint( $post_data['loan_officer_user'] );
		}

		// Multiselect/JSON fields
		$json_fields = array(
			'specialties',
			'specialties_lo',
			'languages',
			'nar_designations',
			'namb_certifications',
		);

		foreach ( $json_fields as $field ) {
			if ( isset( $post_data[ $field ] ) && is_array( $post_data[ $field ] ) ) {
				$sanitized = array_map( 'sanitize_text_field', $post_data[ $field ] );
				$data[ $field ] = wp_json_encode( $sanitized );
			}
		}

		// Service areas (textarea - one per line)
		if ( isset( $post_data['service_areas'] ) && ! empty( $post_data['service_areas'] ) ) {
			$areas = explode( "\n", sanitize_textarea_field( $post_data['service_areas'] ) );
			$areas = array_map( 'trim', $areas );
			$areas = array_filter( $areas ); // Remove empty lines
			$data['service_areas'] = wp_json_encode( array_values( $areas ) );
		} elseif ( isset( $post_data['service_areas'] ) ) {
			// If field exists but is empty, save empty array
			$data['service_areas'] = wp_json_encode( array() );
		}

		// Complex field: awards (JSON)
		if ( isset( $post_data['awards'] ) ) {
			$data['awards'] = sanitize_textarea_field( $post_data['awards'] );
		}

		// Complex field: personal_branding_images (media gallery - array of IDs)
		if ( isset( $post_data['personal_branding_images'] ) ) {
			if ( is_array( $post_data['personal_branding_images'] ) ) {
				$ids = array_map( 'absint', $post_data['personal_branding_images'] );
				$data['personal_branding_images'] = wp_json_encode( $ids );
			}
		}

		return $data;
	}
}
