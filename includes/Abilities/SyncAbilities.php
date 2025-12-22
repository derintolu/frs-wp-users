<?php
/**
 * Sync Abilities
 *
 * @package FRSUsers
 * @since 1.0.0
 */

namespace FRSUsers\Abilities;

use WP_Error;

/**
 * Class SyncAbilities
 *
 * Registers abilities for webhook sync operations.
 */
class SyncAbilities {

	/**
	 * Register all sync abilities
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_trigger_sync();
		self::register_get_sync_status();
	}

	/**
	 * Register trigger-sync ability
	 *
	 * @return void
	 */
	private static function register_trigger_sync(): void {
		wp_register_ability(
			'frs-users/trigger-sync',
			array(
				'label'       => __( 'Trigger Sync', 'frs-wp-users' ),
				'description' => __( 'Manually triggers webhook-based synchronization with external systems for user data.', 'frs-wp-users' ),
				'category'    => 'sync-operations',
				'input_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'user_id' => array(
							'type'        => 'integer',
							'description' => __( 'User ID to sync. If omitted, syncs all users.', 'frs-wp-users' ),
						),
						'sync_type' => array(
							'type'        => 'string',
							'description' => __( 'Type of sync to trigger.', 'frs-wp-users' ),
							'enum'        => array( 'full', 'incremental', 'single' ),
							'default'     => 'incremental',
						),
					),
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'success'    => array( 'type' => 'boolean' ),
						'sync_type'  => array( 'type' => 'string' ),
						'users_synced' => array( 'type' => 'integer' ),
						'timestamp'  => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_trigger_sync' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
				'meta' => array(
					'show_in_rest' => true,
					'annotations'  => array(
						'readonly'   => false,
						'idempotent' => false,
					),
				),
			)
		);
	}

	/**
	 * Execute trigger-sync ability
	 *
	 * @param array $input Input parameters.
	 * @return array|WP_Error Result or error.
	 */
	public static function execute_trigger_sync( array $input ) {
		$sync_type = isset( $input['sync_type'] ) ? sanitize_text_field( $input['sync_type'] ) : 'incremental';
		$user_id = isset( $input['user_id'] ) ? absint( $input['user_id'] ) : null;

		// Validate user if specified
		if ( $user_id && ! get_user_by( 'id', $user_id ) ) {
			return new WP_Error(
				'user_not_found',
				__( 'User not found.', 'frs-wp-users' ),
				array( 'status' => 404 )
			);
		}

		$users_synced = 0;

		// Trigger sync based on type
		switch ( $sync_type ) {
			case 'single':
				if ( ! $user_id ) {
					return new WP_Error(
						'user_required',
						__( 'User ID is required for single sync.', 'frs-wp-users' ),
						array( 'status' => 400 )
					);
				}
				// Trigger single user sync via action hook
				do_action( 'frs_users_sync_single_user', $user_id );
				$users_synced = 1;
				break;

			case 'full':
				// Trigger full sync via action hook
				do_action( 'frs_users_sync_all_users' );
				$user_query = new \WP_User_Query( array( 'fields' => 'ID' ) );
				$users_synced = $user_query->get_total();
				break;

			case 'incremental':
			default:
				// Trigger incremental sync via action hook (updated users only)
				do_action( 'frs_users_sync_updated_users' );
				// Get users updated in last 24 hours
				$users = get_users(
					array(
						'fields'      => 'ID',
						'date_query'  => array(
							array(
								'after'     => '24 hours ago',
								'inclusive' => true,
							),
						),
					)
				);
				$users_synced = count( $users );
				break;
		}

		// Store sync status
		update_option(
			'frs_users_last_sync',
			array(
				'type'      => $sync_type,
				'timestamp' => current_time( 'mysql' ),
				'count'     => $users_synced,
			)
		);

		return array(
			'success'      => true,
			'sync_type'    => $sync_type,
			'users_synced' => $users_synced,
			'timestamp'    => current_time( 'mysql' ),
		);
	}

	/**
	 * Register get-sync-status ability
	 *
	 * @return void
	 */
	private static function register_get_sync_status(): void {
		wp_register_ability(
			'frs-users/get-sync-status',
			array(
				'label'       => __( 'Get Sync Status', 'frs-wp-users' ),
				'description' => __( 'Retrieves the status and details of the last synchronization operation.', 'frs-wp-users' ),
				'category'    => 'sync-operations',
				'input_schema' => array(
					'type'                 => 'object',
					'additionalProperties' => false,
				),
				'output_schema' => array(
					'type'       => 'object',
					'properties' => array(
						'last_sync_type'  => array( 'type' => 'string' ),
						'last_sync_time'  => array( 'type' => 'string' ),
						'users_synced'    => array( 'type' => 'integer' ),
						'next_sync_due'   => array( 'type' => 'string' ),
					),
				),
				'execute_callback' => array( self::class, 'execute_get_sync_status' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
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
	 * Execute get-sync-status ability
	 *
	 * @param array $input Input parameters.
	 * @return array Sync status.
	 */
	public static function execute_get_sync_status( array $input ): array {
		$last_sync = get_option( 'frs_users_last_sync', array() );

		if ( empty( $last_sync ) ) {
			return array(
				'last_sync_type' => 'never',
				'last_sync_time' => '',
				'users_synced'   => 0,
				'next_sync_due'  => '',
			);
		}

		// Calculate next sync time (24 hours from last sync)
		$last_sync_timestamp = strtotime( $last_sync['timestamp'] );
		$next_sync_timestamp = $last_sync_timestamp + ( 24 * 60 * 60 );

		return array(
			'last_sync_type' => $last_sync['type'] ?? 'unknown',
			'last_sync_time' => $last_sync['timestamp'] ?? '',
			'users_synced'   => $last_sync['count'] ?? 0,
			'next_sync_due'  => gmdate( 'Y-m-d H:i:s', $next_sync_timestamp ),
		);
	}
}
