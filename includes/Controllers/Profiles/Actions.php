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
use FRSUsers\Core\Roles;
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

		// Get active company roles for current site context.
		$active_company_roles = Roles::get_active_company_role_slugs();

		// Use WordPress-native query
		$wp_args = array(
			'role__in' => Roles::get_wp_role_slugs(),
			'orderby'  => 'meta_value',
			'meta_key' => 'first_name',
			'order'    => 'ASC',
			'number'   => -1, // Get all, we'll paginate after filtering admins
		);

		// Filter by type (person type stored in user meta)
		// If type is provided, validate it's in active roles for this site.
		if ( $type ) {
			// Only allow filtering by types active for this site context.
			if ( ! in_array( $type, $active_company_roles, true ) ) {
				return new WP_REST_Response(
					array(
						'success' => true,
						'data'    => array(),
						'total'   => 0,
						'page'    => $page,
						'per_page' => $limit,
						'pages'   => 0,
					),
					200
				);
			}
			$wp_args['meta_query'] = array(
				array(
					'key'   => 'frs_company_role',
					'value' => $type,
				),
			);
		} else {
			// No specific type requested - filter by ALL active company roles for this site.
			// This ensures marketing sites only show their configured roles.
			$wp_args['meta_query'] = array(
				'relation' => 'OR',
			);
			foreach ( $active_company_roles as $role ) {
				$wp_args['meta_query'][] = array(
					'key'     => 'frs_company_role',
					'value'   => $role,
					'compare' => '=',
				);
			}
		}

		// Get users (this returns all active FRS users)
		$users = get_users( $wp_args );

		// Convert to Profile objects
		$all_profiles = array_map( array( Profile::class, 'hydrate_from_user' ), $users );

		// Filter out administrators
		$filtered_profiles = array_filter( $all_profiles, function( $profile ) {
			if ( ! $profile->user_id ) {
				return true;
			}

			$user = get_user_by( 'ID', $profile->user_id );
			if ( ! $user ) {
				return true;
			}

			return ! in_array( 'administrator', (array) $user->roles, true );
		} );

		// Get total count after filtering
		$total = count( $filtered_profiles );

		// Apply pagination
		$offset = ( $page - 1 ) * $limit;
		$profiles = array_slice( $filtered_profiles, $offset, $limit );

		// Convert to arrays for response
		$profiles_array = array_map( function( $profile ) {
			return $profile->toArray();
		}, $profiles );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array_values( $profiles_array ),
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
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_profile_by_slug( WP_REST_Request $request ) {
		nocache_headers();

		$slug = $request->get_param( 'slug' );

		// Use WordPress-native query by user_nicename
		$user = get_user_by( 'slug', sanitize_title( $slug ) );

		if ( ! $user ) {
			// Also try custom frs_profile_slug meta
			$users = get_users( array(
				'meta_key'   => 'frs_profile_slug',
				'meta_value' => sanitize_title( $slug ),
				'number'     => 1,
			) );

			if ( empty( $users ) ) {
				return new WP_Error(
					'profile_not_found',
					__( 'Profile not found', 'frs-users' ),
					array( 'status' => 404 )
				);
			}

			$user = $users[0];
		}

		$profile = Profile::hydrate_from_user( $user );

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

		// Create profile
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

		$user_id = $profile->user_id;

		// Sanitize email if present
		if ( isset( $data['email'] ) ) {
			$data['email'] = sanitize_email( $data['email'] );
		}

		// Update WordPress user data
		$user_data = array( 'ID' => $user_id );

		if ( isset( $data['email'] ) ) {
			$user_data['user_email'] = $data['email'];
		}
		if ( isset( $data['first_name'] ) ) {
			$user_data['first_name'] = sanitize_text_field( $data['first_name'] );
		}
		if ( isset( $data['last_name'] ) ) {
			$user_data['last_name'] = sanitize_text_field( $data['last_name'] );
		}
		if ( isset( $data['first_name'] ) || isset( $data['last_name'] ) ) {
			$first = $data['first_name'] ?? $profile->first_name;
			$last  = $data['last_name'] ?? $profile->last_name;
			$user_data['display_name'] = trim( $first . ' ' . $last );
		}

		if ( count( $user_data ) > 1 ) {
			wp_update_user( $user_data );
		}

		// Update user meta fields
		$meta_fields = array(
			'phone_number',
			'mobile_number',
			'job_title',
			'nmls',
			'dre_license',
			'biography',
			'city_state',
			'region',
			'office',
			'linkedin_url',
			'facebook_url',
			'instagram_url',
			'twitter_url',
			'is_active',
			'select_person_type',
			'profile_slug',
			'arrive',
			'service_areas',
		);

		foreach ( $meta_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$value = $data[ $field ];
				// Sanitize based on field type
				if ( in_array( $field, array( 'linkedin_url', 'facebook_url', 'instagram_url', 'twitter_url', 'arrive' ), true ) ) {
					$value = esc_url_raw( $value );
				} elseif ( $field === 'biography' ) {
					$value = wp_kses_post( $value );
				} elseif ( $field === 'is_active' ) {
					$value = (bool) $value ? 1 : 0;
				} elseif ( $field === 'service_areas' ) {
					// Ensure it's stored as array
					if ( is_string( $value ) ) {
						$value = array_filter( array_map( 'trim', explode( ',', $value ) ) );
					}
				} else {
					$value = sanitize_text_field( $value );
				}
				update_user_meta( $user_id, 'frs_' . $field, $value );
			}
		}

		error_log( 'UPDATE PROFILE - Update completed for user ' . $user_id );

		// Re-fetch the profile
		$updated_profile = Profile::find( $user_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $updated_profile ? $updated_profile->toArray() : $profile->toArray(),
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
	 * Submit meeting request (public endpoint)
	 *
	 * Sends an email notification to the profile owner when someone
	 * requests a meeting through the public profile page.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function submit_meeting_request( WP_REST_Request $request ) {
		$profile_id    = $request->get_param( 'profile_id' );
		$profile_email = $request->get_param( 'profile_email' );
		$profile_name  = $request->get_param( 'profile_name' );
		$name          = $request->get_param( 'name' );
		$email         = $request->get_param( 'email' );
		$phone         = $request->get_param( 'phone' ) ?: 'Not provided';
		$message       = $request->get_param( 'message' ) ?: 'No message provided';

		// Validate required fields
		if ( empty( $profile_email ) || empty( $name ) || empty( $email ) ) {
			return new WP_Error(
				'missing_fields',
				__( 'Required fields are missing', 'frs-users' ),
				array( 'status' => 400 )
			);
		}

		// Build email content
		$subject = sprintf(
			/* translators: %s: requester name */
			__( 'New Meeting Request from %s', 'frs-users' ),
			$name
		);

		$email_body = sprintf(
			"Hello %s,\n\n" .
			"You have received a new meeting request through your profile page.\n\n" .
			"=== Request Details ===\n\n" .
			"Name: %s\n" .
			"Email: %s\n" .
			"Phone: %s\n\n" .
			"Message:\n%s\n\n" .
			"---\n" .
			"Please respond to this request within 24 hours.\n\n" .
			"Best regards,\n" .
			"21st Century Lending Team",
			$profile_name,
			$name,
			$email,
			$phone,
			$message
		);

		// Set headers for plain text email with reply-to
		$headers = array(
			'Content-Type: text/plain; charset=UTF-8',
			'Reply-To: ' . $name . ' <' . $email . '>',
		);

		// Send email to profile owner
		$sent = wp_mail( $profile_email, $subject, $email_body, $headers );

		if ( ! $sent ) {
			// Log the error but still return success to user
			error_log( sprintf(
				'[FRS Users] Failed to send meeting request email to %s from %s',
				$profile_email,
				$email
			) );
		}

		// Trigger action for other integrations (CRM, etc.)
		do_action( 'frs_meeting_request_submitted', array(
			'profile_id'    => $profile_id,
			'profile_email' => $profile_email,
			'profile_name'  => $profile_name,
			'requester_name'  => $name,
			'requester_email' => $email,
			'requester_phone' => $phone,
			'message'         => $message,
		) );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Meeting request sent successfully', 'frs-users' ),
			),
			200
		);
	}

	/**
	 * Get all unique service areas from profiles active for this site context
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_service_areas( WP_REST_Request $request ) {
		// Get active company roles for current site context.
		$active_company_roles = Roles::get_active_company_role_slugs();

		// Build meta query to get users with active company roles.
		$meta_query = array( 'relation' => 'OR' );
		foreach ( $active_company_roles as $role ) {
			$meta_query[] = array(
				'key'     => 'frs_company_role',
				'value'   => $role,
				'compare' => '=',
			);
		}

		// Use WordPress-native query to get users with active company roles.
		$users = get_users( array(
			'role__in'   => Roles::get_wp_role_slugs(),
			'meta_query' => $meta_query,
			'number'     => -1,
		) );

		// Convert to Profile objects and collect service areas
		$all_areas = array();
		foreach ( $users as $user ) {
			$profile = Profile::hydrate_from_user( $user );
			$areas = $profile->service_areas;
			if ( is_array( $areas ) ) {
				$all_areas = array_merge( $all_areas, $areas );
			}
		}

		// Remove duplicates and sort
		$unique_areas = array_unique( $all_areas );
		sort( $unique_areas );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array_values( $unique_areas ),
			),
			200
		);
	}

	/**
	 * Permission callback for write operations
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function check_write_permissions( $request = null ) {
		// Check if profile editing is enabled for this site context.
		if ( ! Roles::is_profile_editing_enabled() ) {
			return new WP_Error(
				'editing_disabled',
				__( 'Profile editing is disabled for this site. Profiles can only be edited on the hub.', 'frs-users' ),
				array( 'status' => 403 )
			);
		}

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
}
