<?php
/**
 * Onboarding Abilities
 *
 * @package FRSUsers
 * @since 3.3.0
 */

namespace FRSUsers\Abilities;

use FRSUsers\Core\OnboardingWizard;
use FRSUsers\Models\UserProfile;
use WP_Error;

class OnboardingAbilities {

	/**
	 * Register all onboarding abilities.
	 */
	public static function register(): void {
		self::register_get_onboarding_status();
		self::register_complete_onboarding();
		self::register_reset_onboarding();
	}

	private static function register_get_onboarding_status(): void {
		wp_register_ability(
			'frs-users/get-onboarding-status',
			array(
				'label'       => __( 'Get Onboarding Status', 'frs-wp-users' ),
				'description' => __( 'Check onboarding completion state, current step, and completion items for a user.', 'frs-wp-users' ),
				'category'    => 'onboarding',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID. Defaults to current user.', 'frs-wp-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'needs_onboarding' => array( 'type' => 'boolean' ),
						'needs_tour'       => array( 'type' => 'boolean' ),
						'step'             => array( 'type' => 'integer' ),
						'completed'        => array( 'type' => 'integer' ),
						'total'            => array( 'type' => 'integer' ),
					),
				),
				'execute_callback'    => array( self::class, 'execute_get_status' ),
				'permission_callback' => function () {
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

	public static function execute_get_status( array $input ) {
		$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error( 'user_not_found', __( 'User not found.', 'frs-wp-users' ), array( 'status' => 404 ) );
		}

		$items = array();
		try {
			$profile = new UserProfile( $user_id );
			$items   = $profile->get_profile_completion_items();
		} catch ( \Exception $e ) {
			// No profile.
		}

		$completed = count( array_filter( $items, fn( $i ) => $i['is_completed'] ) );

		return array(
			'needs_onboarding' => OnboardingWizard::needs_onboarding( $user_id ),
			'needs_tour'       => OnboardingWizard::needs_tour( $user_id ),
			'step'             => (int) get_user_meta( $user_id, '_frs_onboarding_step', true ) ?: 1,
			'completed'        => $completed,
			'total'            => count( $items ),
			'items'            => $items,
		);
	}

	private static function register_complete_onboarding(): void {
		wp_register_ability(
			'frs-users/complete-onboarding',
			array(
				'label'       => __( 'Complete Onboarding', 'frs-wp-users' ),
				'description' => __( 'Mark onboarding as complete for a user.', 'frs-wp-users' ),
				'category'    => 'onboarding',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID. Defaults to current user.', 'frs-wp-users' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
					),
				),
				'execute_callback'    => array( self::class, 'execute_complete' ),
				'permission_callback' => function ( $input ) {
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

	public static function execute_complete( array $input ) {
		$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : get_current_user_id();

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error( 'user_not_found', __( 'User not found.', 'frs-wp-users' ), array( 'status' => 404 ) );
		}

		update_user_meta( $user_id, '_frs_onboarding_complete', time() );
		delete_user_meta( $user_id, 'frs_onboarding_dismissed' );

		return array( 'success' => true );
	}

	private static function register_reset_onboarding(): void {
		wp_register_ability(
			'frs-users/reset-onboarding',
			array(
				'label'       => __( 'Reset Onboarding', 'frs-wp-users' ),
				'description' => __( 'Reset onboarding state for a user (admin only).', 'frs-wp-users' ),
				'category'    => 'onboarding',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to reset onboarding for.', 'frs-wp-users' ),
							'required'    => true,
						),
					),
					'required'             => array( 'user_id' ),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
					),
				),
				'execute_callback'    => array( self::class, 'execute_reset' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
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

	public static function execute_reset( array $input ) {
		$user_id = absint( $input['user_id'] );

		if ( ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error( 'user_not_found', __( 'User not found.', 'frs-wp-users' ), array( 'status' => 404 ) );
		}

		delete_user_meta( $user_id, '_frs_onboarding_complete' );
		delete_user_meta( $user_id, '_frs_onboarding_step' );
		delete_user_meta( $user_id, '_frs_tour_complete' );
		delete_user_meta( $user_id, 'frs_onboarding_dismissed' );

		return array( 'success' => true );
	}
}
