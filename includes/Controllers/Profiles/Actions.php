<?php
/**
 * Profiles Controller
 *
 * Handles REST API endpoints for profile CRUD operations.
 *
 * @package FRSUsers
 * @subpackage Controllers\Profiles
 * @since 1.0.0
 */

namespace FRSUsers\Controllers\Profiles;

use FRSUsers\Models\Profile;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Class Actions
 *
 * REST API controller for profile operations.
 *
 * @package FRSUsers\Controllers\Profiles
 */
class Actions {

	/**
	 * Get all profiles
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_profiles( WP_REST_Request $request ) {
		$type        = $request->get_param( 'type' );
		$limit       = $request->get_param( 'per_page' ) ?: 50;
		$page        = $request->get_param( 'page' ) ?: 1;
		$guests_only = $request->get_param( 'guests_only' );

		// Build query using Eloquent
		$query = Profile::active();

		if ( $guests_only ) {
			$query->guests();
		}

		if ( $type ) {
			$query->ofType( $type );
		}

		// Get total count for pagination
		$total = $query->count();

		// Apply pagination - sort by first name alphabetically
		$profiles = $query->orderBy( 'first_name', 'asc' )
			->skip( ( $page - 1 ) * $limit )
			->take( $limit )
			->get();

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $profiles->toArray(),
				'total'   => $total,
				'page'    => $page,
				'per_page' => $limit,
				'pages'   => ceil( $total / $limit ),
			),
			200
		);
	}

	/**
	 * Get single profile
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_profile( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$profile = Profile::find( $id );

		if ( ! $profile ) {
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $profile->toArray(),
			),
			200
		);
	}

	/**
	 * Get profile by user ID
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_profile_by_user( WP_REST_Request $request ) {
		$user_id = $request->get_param( 'user_id' );

		if ( $user_id === 'me' ) {
			$user_id = get_current_user_id();
		}

		$profile = Profile::get_by_user_id( $user_id );

		if ( ! $profile ) {
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found for this user', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $profile->toArray(),
			),
			200
		);
	}

	/**
	 * Get profile by slug
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error Response object or error.
	 */
	public function get_profile_by_slug( WP_REST_Request $request ) {
		$slug = $request->get_param( 'slug' );

		// Try exact email match first
		$profile = Profile::where( 'email', $slug )->first();

		if ( $profile ) {
			return new WP_REST_Response(
				array(
					'success' => true,
					'data'    => $profile->toArray(),
				),
				200
			);
		}

		// Try to match by name pattern
		$slug_parts = explode( '-', $slug );

		if ( count( $slug_parts ) >= 2 ) {
			$profiles = Profile::all();

			foreach ( $profiles as $profile ) {
				$profile_slug = sanitize_title( $profile->first_name . '-' . $profile->last_name );
				if ( $profile_slug === $slug ) {
					return new WP_REST_Response(
						array(
							'success' => true,
							'data'    => $profile->toArray(),
						),
						200
					);
				}
			}
		}

		return new WP_Error(
			'profile_not_found',
			__( 'Profile not found', 'frs-users' ),
			array( 'status' => 404 )
		);
	}

	/**
	 * Create profile
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_profile( WP_REST_Request $request ) {
		$data = $request->get_json_params();

		// Validate required fields
		if ( empty( $data['email'] ) ) {
			return new WP_Error(
				'missing_email',
				__( 'Email is required', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		if ( empty( $data['first_name'] ) ) {
			return new WP_Error(
				'missing_first_name',
				__( 'First name is required', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		if ( empty( $data['last_name'] ) ) {
			return new WP_Error(
				'missing_last_name',
				__( 'Last name is required', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Check if profile with this email already exists
		$existing = Profile::get_by_email( $data['email'] );
		if ( $existing ) {
			return new WP_Error(
				'profile_exists',
				__( 'Profile with this email already exists', 'frs-users' ),
				array( 'status' => 409 )
			);
		}

		// Sanitize email
		$data['email'] = sanitize_email( $data['email'] );

		// Create profile using Eloquent
		$profile = Profile::create( $data );

		if ( ! $profile ) {
			return new WP_Error(
				'create_failed',
				__( 'Failed to create profile', 'frs-users' ),
				array( 'status' => 500 )
			);
		}

		// Trigger profile creation hook (for profile pages generation)
		do_action( 'frs_profile_created', $profile->id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $profile->toArray(),
				'message' => __( 'Profile created successfully', 'frs-users' ),
			),
			201
		);
	}

	/**
	 * Update profile
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_profile( WP_REST_Request $request ) {
		$id   = $request->get_param( 'id' );
		$data = $request->get_json_params();

		error_log( 'UPDATE PROFILE - ID: ' . $id );
		error_log( 'UPDATE PROFILE - Data received: ' . print_r( $data, true ) );

		$profile = Profile::find( $id );

		if ( ! $profile ) {
			error_log( 'UPDATE PROFILE - Profile not found' );
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		error_log( 'UPDATE PROFILE - Profile found: ' . print_r( $profile->toArray(), true ) );

		// Sanitize email if present
		if ( isset( $data['email'] ) ) {
			$data['email'] = sanitize_email( $data['email'] );
		}

		// Update using Eloquent
		$result = $profile->update( $data );

		error_log( 'UPDATE PROFILE - Update result: ' . ( $result ? 'SUCCESS' : 'FAILED' ) );
		error_log( 'UPDATE PROFILE - After update: ' . print_r( $profile->fresh()->toArray(), true ) );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $profile->fresh()->toArray(),
				'message' => __( 'Profile updated successfully', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Delete profile
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_profile( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$profile = Profile::find( $id );

		if ( ! $profile ) {
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		$result = $profile->delete();

		if ( ! $result ) {
			return new WP_Error(
				'delete_failed',
				__( 'Failed to delete profile', 'frs-users' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Profile deleted successfully', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Create user account for guest profile
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_user_account( WP_REST_Request $request ) {
		$id       = $request->get_param( 'id' );
		$username = $request->get_param( 'username' );
		$send_email = $request->get_param( 'send_email' ) ?? true;
		$roles    = $request->get_param( 'roles' ) ?? array();

		$profile = Profile::find( $id );

		if ( ! $profile ) {
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		if ( ! $profile->is_guest() ) {
			return new WP_Error(
				'already_linked',
				__( 'Profile is already linked to a user account', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Validate required fields
		if ( empty( $profile->first_name ) ) {
			return new WP_Error(
				'missing_first_name',
				__( 'Profile is missing first name', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		if ( empty( $profile->last_name ) ) {
			return new WP_Error(
				'missing_last_name',
				__( 'Profile is missing last name', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		if ( empty( $profile->email ) ) {
			return new WP_Error(
				'missing_email',
				__( 'Profile is missing email', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Generate username if not provided
		if ( empty( $username ) ) {
			$username = sanitize_user( strtolower( $profile->first_name . '.' . $profile->last_name ) );
			$username = str_replace( ' ', '', $username );
		}

		// Check if username exists
		if ( username_exists( $username ) ) {
			$username = $username . wp_rand( 1, 999 );
		}

		// Create WordPress user
		$user_data = array(
			'user_login' => $username,
			'user_email' => $profile->email,
			'first_name' => $profile->first_name,
			'last_name'  => $profile->last_name,
			'role'       => 'subscriber', // Default role
		);

		$user_id = wp_insert_user( $user_data );

		if ( is_wp_error( $user_id ) ) {
			return new WP_Error(
				'user_creation_failed',
				$user_id->get_error_message(),
				array( 'status' => 500 )
			);
		}

		// Add additional roles
		$user = new \WP_User( $user_id );
		foreach ( $roles as $role ) {
			$user->add_role( $role );
		}

		// Link profile to user
		$profile->link_user( $user_id );

		// Send password reset email
		if ( $send_email ) {
			wp_send_new_user_notifications( $user_id, 'user' );
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array(
					'user_id'  => $user_id,
					'username' => $username,
					'profile'  => $profile->to_array(),
				),
				'message' => __( 'User account created and linked successfully', 'frs-users' ),
			),
			201
		);
	}

	/**
	 * Bulk create user accounts for guest profiles
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function bulk_create_users( WP_REST_Request $request ) {
		$profile_ids = $request->get_param( 'profile_ids' );
		$send_email  = $request->get_param( 'send_email' ) ?? true;

		if ( empty( $profile_ids ) || ! is_array( $profile_ids ) ) {
			return new WP_Error(
				'invalid_input',
				__( 'Profile IDs array is required', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		$results = array(
			'success' => array(),
			'failed'  => array(),
		);

		foreach ( $profile_ids as $profile_id ) {
			$profile = Profile::find( $profile_id );

			if ( ! $profile || ! $profile->is_guest() ) {
				$results['failed'][] = array(
					'id'     => $profile_id,
					'reason' => __( 'Profile not found or already linked', 'frs-users' ),
				);
				continue;
			}

			// Validate required fields
			if ( empty( $profile->first_name ) || empty( $profile->last_name ) || empty( $profile->email ) ) {
				$results['failed'][] = array(
					'id'     => $profile_id,
					'reason' => __( 'Profile is missing required fields (first name, last name, or email)', 'frs-users' ),
				);
				continue;
			}

			// Generate username
			$username = sanitize_user( strtolower( $profile->first_name . '.' . $profile->last_name ) );
			$username = str_replace( ' ', '', $username );

			if ( username_exists( $username ) ) {
				$username = $username . wp_rand( 1, 999 );
			}

			// Create user
			$user_data = array(
				'user_login' => $username,
				'user_email' => $profile->email,
				'first_name' => $profile->first_name,
				'last_name'  => $profile->last_name,
				'role'       => 'subscriber',
			);

			$user_id = wp_insert_user( $user_data );

			if ( is_wp_error( $user_id ) ) {
				$results['failed'][] = array(
					'id'     => $profile_id,
					'reason' => $user_id->get_error_message(),
				);
				continue;
			}

			// Add profile type as role
			if ( ! empty( $profile->select_person_type ) ) {
				$user = new \WP_User( $user_id );
				$user->add_role( $profile->select_person_type );
			}

			// Link profile
			$profile->link_user( $user_id );

			// Send email
			if ( $send_email ) {
				wp_send_new_user_notifications( $user_id, 'user' );
			}

			$results['success'][] = array(
				'profile_id' => $profile_id,
				'user_id'    => $user_id,
				'username'   => $username,
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $results,
				'message' => sprintf(
					__( 'Created %d users, %d failed', 'frs-users' ),
					count( $results['success'] ),
					count( $results['failed'] )
				),
			),
			200
		);
	}

	/**
	 * Permission callback for read operations
	 *
	 * Profiles are public data meant to be displayed on the website,
	 * so we allow public read access to profile lists and individual profiles.
	 *
	 * @param WP_REST_Request|null $request Request object.
	 * @return bool
	 */
	public function check_read_permissions( $request = null ) {
		// Profiles are public - allow anyone to read them
		// They contain only public-facing information (name, photo, bio, contact info)
		return true;
	}

	/**
	 * Get sync settings
	 *
	 * @return WP_REST_Response
	 */
	public function get_sync_settings() {
		$settings = array(
			'sync_loan_officers' => (bool) get_option( 'frs_sync_loan_officers', true ),
			'sync_realtors'      => (bool) get_option( 'frs_sync_realtors', false ),
			'sync_staff'         => (bool) get_option( 'frs_sync_staff', false ),
			'sync_leadership'    => (bool) get_option( 'frs_sync_leadership', false ),
			'sync_assistants'    => (bool) get_option( 'frs_sync_assistants', false ),
		);

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $settings,
			),
			200
		);
	}

	/**
	 * Save sync settings
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function save_sync_settings( WP_REST_Request $request ) {
		$data = $request->get_json_params();

		if ( isset( $data['sync_loan_officers'] ) ) {
			update_option( 'frs_sync_loan_officers', (bool) $data['sync_loan_officers'] );
		}
		if ( isset( $data['sync_realtors'] ) ) {
			update_option( 'frs_sync_realtors', (bool) $data['sync_realtors'] );
		}
		if ( isset( $data['sync_staff'] ) ) {
			update_option( 'frs_sync_staff', (bool) $data['sync_staff'] );
		}
		if ( isset( $data['sync_leadership'] ) ) {
			update_option( 'frs_sync_leadership', (bool) $data['sync_leadership'] );
		}
		if ( isset( $data['sync_assistants'] ) ) {
			update_option( 'frs_sync_assistants', (bool) $data['sync_assistants'] );
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Sync settings saved successfully', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Get sync statistics
	 *
	 * @return WP_REST_Response
	 */
	public function get_sync_stats() {
		$stats = \FRSUsers\Integrations\FRSSync::get_sync_stats();

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $stats,
			),
			200
		);
	}

	/**
	 * Trigger manual sync
	 *
	 * @return WP_REST_Response
	 */
	public function trigger_sync() {
		// Trigger the sync action
		do_action( 'frs_users_trigger_manual_sync' );

		// Update last sync time
		update_option( 'frs_last_sync_time', time() );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Sync triggered successfully. Check the logs for details.', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Permission callback for write operations
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function check_write_permissions( $request = null ) {
		// Administrators can edit any profile
		if ( current_user_can( 'edit_users' ) ) {
			return true;
		}

		// For update operations, check if user is editing their own profile
		if ( $request && $request->get_method() === 'PUT' ) {
			$profile_id = $request->get_param( 'id' );

			if ( $profile_id ) {
				$profile = Profile::find( $profile_id );

				if ( $profile && $profile->user_id && $profile->user_id == get_current_user_id() ) {
					return true;
				}
			}
		}

		// Default: deny access
		return false;
	}

	/**
	 * Upload avatar/headshot for a profile
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function upload_avatar( WP_REST_Request $request ) {
		$user_id = $request->get_param( 'user_id' );

		if ( ! $user_id ) {
			return new WP_Error(
				'missing_user_id',
				__( 'User ID is required', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Get profile by user_id
		$profile = Profile::where( 'user_id', $user_id )->first();

		if ( ! $profile ) {
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found for this user', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		// Check file was uploaded
		$files = $request->get_file_params();
		if ( empty( $files['avatar'] ) ) {
			return new WP_Error(
				'no_file',
				__( 'No file was uploaded', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		$file = $files['avatar'];

		// Validate file type
		$allowed_types = array( 'image/jpeg', 'image/png', 'image/gif', 'image/webp' );
		if ( ! in_array( $file['type'], $allowed_types ) ) {
			return new WP_Error(
				'invalid_file_type',
				__( 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Handle the upload
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_sideload(
			$file,
			0,
			null,
			array(
				'test_form' => false,
				'mimes'     => array(
					'jpg|jpeg|jpe' => 'image/jpeg',
					'gif'          => 'image/gif',
					'png'          => 'image/png',
					'webp'         => 'image/webp',
				),
			)
		);

		if ( is_wp_error( $attachment_id ) ) {
			return new WP_Error(
				'upload_failed',
				$attachment_id->get_error_message(),
				array( 'status' => 500 )
			);
		}

		// Update profile with new headshot_id
		$profile->update( array( 'headshot_id' => $attachment_id ) );

		// Get the image URL
		$image_url = wp_get_attachment_url( $attachment_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array(
					'attachment_id' => $attachment_id,
					'url'           => $image_url,
				),
				'message' => __( 'Avatar uploaded successfully', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Get profiles for block editor (WordPress core-data format)
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_profiles_for_block_editor( WP_REST_Request $request ) {
		$per_page = $request->get_param( 'per_page' ) ?: 100;

		// Get all active profiles
		$profiles = Profile::active()
			->orderBy( 'full_name', 'asc' )
			->take( $per_page )
			->get();

		// Format for WordPress core-data store
		$formatted = $profiles->map(
			function ( $profile ) {
				return array(
					'id'        => $profile->id,
					'user_id'   => $profile->user_id,
					'full_name' => $profile->full_name,
					'email'     => $profile->primary_business_email ?? $profile->email,
					'type'      => $profile->type,
				);
			}
		);

		return new WP_REST_Response( $formatted->toArray(), 200 );
	}
}
