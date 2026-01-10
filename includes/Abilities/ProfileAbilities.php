<?php
/**
 * Profile Abilities
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Abilities;

use WP_Error;

/**
 * Class ProfileAbilities
 *
 * Registers abilities for profile management operations.
 */
class ProfileAbilities {

	/**
	 * Register all profile abilities
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_get_profile();
		self::register_update_profile();
		self::register_get_profile_fields();
		self::register_update_avatar();
	}

	/**
	 * Register get-profile ability
	 *
	 * @return void
	 */
	private static function register_get_profile(): void {
		wp_register_ability(
			'frs-users/get-profile',
			array(
				'label'       => __( 'Get Profile', 'frs-wp-users' ),
				'description' => __( 'Retrieves user profile information including public profiles and guest profiles with Carbon Fields custom data.', 'frs-wp-users' ),
				'category'    => 'profile-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to get profile for. Defaults to current user.', 'frs-wp-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id'     => array( 'type' => 'integer' ),
						'username'    => array( 'type' => 'string' ),
						'display_name' => array( 'type' => 'string' ),
						'avatar_url'  => array( 'type' => 'string' ),
						'bio'         => array( 'type' => 'string' ),
						'phone'       => array( 'type' => 'string' ),
						'company'     => array( 'type' => 'string' ),
						'website'     => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_get_profile' ),
				'permission_callback' => function() {
					return current_user_can( 'read' );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute get-profile ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Profile data or error.
	 */
	public static function execute_get_profile( array $input ) {
		$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();

		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		return array(
			'user_id'      => $user_id,
			'username'     => $user->user_login,
			'display_name' => $user->display_name,
			'avatar_url'   => get_avatar_url( $user_id ),
			'bio'          => get_user_meta( $user_id, 'description', true ),
			'phone'        => get_user_meta( $user_id, 'phone', true ),
			'company'      => get_user_meta( $user_id, 'company', true ),
			'website'      => $user->user_url,
		);
	}

	/**
	 * Register update-profile ability
	 *
	 * @return void
	 */
	private static function register_update_profile(): void {
		wp_register_ability(
			'frs-users/update-profile',
			array(
				'label'       => __( 'Update Profile', 'frs-wp-users' ),
				'description' => __( 'Updates user profile information including bio, phone, company, and other custom fields.', 'frs-wp-users' ),
				'category'    => 'profile-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to update. Defaults to current user.', 'frs-wp-users' ),
						),
						'display_name' => array(
							'type'        => 'string',
							'description' => __( 'Display name.', 'frs-wp-users' ),
						),
						'bio' => array(
							'type'        => 'string',
							'description' => __( 'User biography.', 'frs-wp-users' ),
						),
						'phone' => array(
							'type'        => 'string',
							'description' => __( 'Phone number.', 'frs-wp-users' ),
						),
						'company' => array(
							'type'        => 'string',
							'description' => __( 'Company name.', 'frs-wp-users' ),
						),
						'website' => array(
							'type'        => 'string',
							'description' => __( 'Website URL.', 'frs-wp-users' ),
							'format'      => 'uri',
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'user_id' => array( 'type' => 'integer' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_update_profile' ),
				'permission_callback' => function( $input ) {
					$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();
					return current_user_can( 'edit_user', $user_id );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => false,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute update-profile ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Result or error.
	 */
	public static function execute_update_profile( array $input ) {
		$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		$update_data = array( 'ID' => $user_id );

		if ( isset( $input['display_name'] ) ) {
			$update_data['display_name'] = sanitize_text_field( $input['display_name'] );
		}

		if ( isset( $input['website'] ) ) {
			$update_data['user_url'] = esc_url_raw( $input['website'] );
		}

		wp_update_user( $update_data );

		// Update meta fields
		if ( isset( $input['bio'] ) ) {
			update_user_meta( $user_id, 'description', wp_kses_post( $input['bio'] ) );
		}
		if ( isset( $input['phone'] ) ) {
			update_user_meta( $user_id, 'phone', sanitize_text_field( $input['phone'] ) );
		}
		if ( isset( $input['company'] ) ) {
			update_user_meta( $user_id, 'company', sanitize_text_field( $input['company'] ) );
		}

		return array(
			'success' => true,
			'user_id' => $user_id,
		);
	}

	/**
	 * Register get-profile-fields ability
	 *
	 * @return void
	 */
	private static function register_get_profile_fields(): void {
		wp_register_ability(
			'frs-users/get-profile-fields',
			array(
				'label'       => __( 'Get Profile Fields', 'frs-wp-users' ),
				'description' => __( 'Retrieves the list of available profile fields and their configuration from Carbon Fields.', 'frs-wp-users' ),
				'category'    => 'profile-management',
				'input_schema' => array(
					'type'                 => 'object',
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'name'        => array( 'type' => 'string' ),
							'label'       => array( 'type' => 'string' ),
							'type'        => array( 'type' => 'string' ),
							'required'    => array( 'type' => 'boolean' ),
						),
					),
				),
				'execute_callback' => array( self::class, 'execute_get_profile_fields' ),
				'permission_callback' => function() {
					return current_user_can( 'read' );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => true,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute get-profile-fields ability
	 *
	 * @param array $input Input parameters.
	 * @return array List of profile fields.
	 */
	public static function execute_get_profile_fields( array $input ): array {
		// Return standard profile fields
		return array(
			array(
				'name'     => 'display_name',
				'label'    => __( 'Display Name', 'frs-wp-users' ),
				'type'     => 'text',
				'required' => true,
			),
			array(
				'name'     => 'bio',
				'label'    => __( 'Biography', 'frs-wp-users' ),
				'type'     => 'textarea',
				'required' => false,
			),
			array(
				'name'     => 'phone',
				'label'    => __( 'Phone Number', 'frs-wp-users' ),
				'type'     => 'text',
				'required' => false,
			),
			array(
				'name'     => 'company',
				'label'    => __( 'Company', 'frs-wp-users' ),
				'type'     => 'text',
				'required' => false,
			),
			array(
				'name'     => 'website',
				'label'    => __( 'Website', 'frs-wp-users' ),
				'type'     => 'url',
				'required' => false,
			),
		);
	}

	/**
	 * Register update-avatar ability
	 *
	 * @return void
	 */
	private static function register_update_avatar(): void {
		wp_register_ability(
			'frs-users/update-avatar',
			array(
				'label'       => __( 'Update Avatar', 'frs-wp-users' ),
				'description' => __( 'Updates user avatar/profile picture.', 'frs-wp-users' ),
				'category'    => 'profile-management',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to update avatar for. Defaults to current user.', 'frs-wp-users' ),
						),
						'avatar_url' => array(
							'type'        => 'string',
							'description' => __( 'URL of the new avatar image.', 'frs-wp-users' ),
							'format'      => 'uri',
						),
					),
					'required'             => array( 'avatar_url' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success'    => array( 'type' => 'boolean' ),
						'user_id'    => array( 'type' => 'integer' ),
						'avatar_url' => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_update_avatar' ),
				'permission_callback' => function( $input ) {
					$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();
					return current_user_can( 'edit_user', $user_id );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => false,
						'idempotent' => true,
					),
				),
			)
		);
	}

	/**
	 * Execute update-avatar ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Result or error.
	 */
	public static function execute_update_avatar( array $input ) {
		$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		$avatar_url = esc_url_raw( $input['avatar_url'] );
		update_user_meta( $user_id, 'custom_avatar_url', $avatar_url );

		return array(
			'success'    => true,
			'user_id'    => $user_id,
			'avatar_url' => $avatar_url,
		);
	}
}
