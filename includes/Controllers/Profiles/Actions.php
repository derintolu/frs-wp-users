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

		// Apply pagination
		$profiles = $query->orderBy( 'last_name', 'asc' )
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

		$profile = Profile::find( $id );

		if ( ! $profile ) {
			return new WP_Error(
				'profile_not_found',
				__( 'Profile not found', 'frs-users' ),
				array( 'status' => 404 )
			);
		}

		// Sanitize email if present
		if ( isset( $data['email'] ) ) {
			$data['email'] = sanitize_email( $data['email'] );
		}

		// Update using Eloquent
		$profile->update( $data );

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

			// Add profile types as roles
			$profile_types = $profile->get_types();
			$user = new \WP_User( $user_id );
			foreach ( $profile_types as $type ) {
				$user->add_role( $type );
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
	 * @return bool
	 */
	public function check_read_permissions() {
		return current_user_can( 'edit_users' );
	}

	/**
	 * Permission callback for write operations
	 *
	 * @return bool
	 */
	public function check_write_permissions() {
		return current_user_can( 'edit_users' );
	}
}
