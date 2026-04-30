<?php
/**
 * Sync REST routes — outbound triggers for hub→marketing profile sync.
 *
 * Endpoints (all on hub side):
 *   POST /wp-json/frs-users/v1/sync/push-user/<id>  → re-push one user.
 *   POST /wp-json/frs-users/v1/sync/backfill        → full LO backfill.
 *   GET  /wp-json/frs-users/v1/sync/diff/<id>       → which fields differ vs marketing.
 *
 * Permissions: caller must have `manage_options` capability OR provide a
 * matching `X-FRS-Sync-Token` header (constant `FRS_SYNC_TOKEN` in wp-config).
 *
 * @package FRSUsers\Routes
 * @since 3.1.0
 */

namespace FRSUsers\Routes;

use FRSUsers\Core\ProfileSync;
use FRSUsers\Models\Profile;

defined( 'ABSPATH' ) || exit;

class SyncRoutes {

	const NAMESPACE_V1 = 'frs-users/v1';

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes(): void {
		register_rest_route(
			self::NAMESPACE_V1,
			'/sync/push-user/(?P<id>\d+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_push_user' ),
				'permission_callback' => array( __CLASS__, 'check_permission' ),
				'args'                => array(
					'id' => array( 'type' => 'integer', 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE_V1,
			'/sync/backfill',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_backfill' ),
				'permission_callback' => array( __CLASS__, 'check_permission' ),
				'args'                => array(
					'limit'   => array( 'type' => 'integer', 'default' => 0 ),
					'dry_run' => array( 'type' => 'boolean', 'default' => false ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE_V1,
			'/sync/diff/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'handle_diff' ),
				'permission_callback' => array( __CLASS__, 'check_permission' ),
				'args'                => array(
					'id' => array( 'type' => 'integer', 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE_V1,
			'/sync/reconcile',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_reconcile' ),
				'permission_callback' => array( __CLASS__, 'check_permission' ),
				'args'                => array(
					'dry_run' => array( 'type' => 'boolean', 'default' => false ),
				),
			)
		);
	}

	/**
	 * Permission gate: admin capability OR shared secret header.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return bool|\WP_Error
	 */
	public static function check_permission( $request ) {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}
		$expected = defined( 'FRS_SYNC_TOKEN' ) ? FRS_SYNC_TOKEN : '';
		if ( $expected ) {
			$provided = (string) $request->get_header( 'X-FRS-Sync-Token' );
			if ( $provided && hash_equals( $expected, $provided ) ) {
				return true;
			}
		}
		return new \WP_Error(
			'frs_sync_forbidden',
			__( 'Admin capability or matching X-FRS-Sync-Token header required.', 'frs-users' ),
			array( 'status' => 403 )
		);
	}

	public static function handle_push_user( \WP_REST_Request $request ) {
		$user_id = (int) $request->get_param( 'id' );
		$user    = get_userdata( $user_id );
		if ( ! $user ) {
			return new \WP_REST_Response( array( 'error' => 'User not found' ), 404 );
		}

		$endpoints = self::endpoints();
		$secret    = self::secret();
		if ( empty( $endpoints ) ) {
			return new \WP_REST_Response( array( 'error' => 'No frs_webhook_endpoints configured' ), 500 );
		}

		$profile = Profile::hydrate_from_user( $user );
		$payload = array(
			'event'     => 'profile_updated',
			'timestamp' => time(),
			'profile'   => $profile->toArray(),
		);

		$results = self::dispatch_webhook( $endpoints, $payload, $secret );
		return new \WP_REST_Response(
			array(
				'user_id'    => $user_id,
				'email'      => $user->user_email,
				'endpoints'  => $endpoints,
				'results'    => $results,
				'sent'       => count( array_filter( $results, fn( $r ) => $r['ok'] ) ),
				'failed'     => count( array_filter( $results, fn( $r ) => ! $r['ok'] ) ),
			),
			200
		);
	}

	public static function handle_backfill( \WP_REST_Request $request ) {
		$limit   = (int) $request->get_param( 'limit' );
		$dry_run = (bool) $request->get_param( 'dry_run' );

		$endpoints = self::endpoints();
		$secret    = self::secret();
		if ( empty( $endpoints ) && ! $dry_run ) {
			return new \WP_REST_Response( array( 'error' => 'No frs_webhook_endpoints configured' ), 500 );
		}

		$users = get_users( array(
			'role'   => 'loan_officer',
			'fields' => array( 'ID', 'user_email' ),
			'number' => -1,
		) );

		$processed      = 0;
		$skipped_nmls   = 0;
		$skipped_arrive = 0;
		$skipped_email  = 0;
		$ok             = 0;
		$failed         = 0;
		$detail         = array();

		foreach ( $users as $stub ) {
			if ( $limit && $processed >= $limit ) {
				break;
			}
			$processed++;

			$user = get_userdata( $stub->ID );
			if ( ! $user ) {
				continue;
			}

			$nmls   = trim( (string) get_user_meta( $user->ID, 'frs_nmls', true ) );
			$arrive = trim( (string) get_user_meta( $user->ID, 'frs_arrive', true ) );
			$email  = strtolower( (string) $user->user_email );

			if ( ! str_ends_with( $email, '@21stcenturylending.com' ) ) {
				$skipped_email++;
				continue;
			}
			if ( $nmls === '' ) {
				$skipped_nmls++;
				continue;
			}
			if ( $arrive === '' ) {
				$skipped_arrive++;
				continue;
			}

			if ( $dry_run ) {
				$detail[] = array( 'id' => $user->ID, 'email' => $user->user_email, 'action' => 'would_send' );
				continue;
			}

			$profile = Profile::hydrate_from_user( $user );
			$payload = array(
				'event'     => 'profile_updated',
				'timestamp' => time(),
				'profile'   => $profile->toArray(),
			);
			$res = self::dispatch_webhook( $endpoints, $payload, $secret );
			$any_ok = false;
			foreach ( $res as $r ) {
				if ( $r['ok'] ) { $any_ok = true; }
			}
			if ( $any_ok ) { $ok++; } else { $failed++; }
		}

		return new \WP_REST_Response(
			array(
				'cohort'         => count( $users ),
				'processed'      => $processed,
				'skipped_email'  => $skipped_email,
				'skipped_nmls'   => $skipped_nmls,
				'skipped_arrive' => $skipped_arrive,
				'ok'             => $ok,
				'failed'         => $failed,
				'dry_run'        => $dry_run,
				'detail'         => $dry_run ? $detail : null,
			),
			200
		);
	}

	/**
	 * Local-only reconcile: enforce LO eligibility rules against THIS site's
	 * own data (no hub iteration). For each WP user with an FRS role:
	 *   - email must end with @21stcenturylending.com
	 *   - frs_nmls must be non-empty
	 *   - frs_arrive must be non-empty
	 * Failing any → set frs_is_active=0.  Passing all → ensure frs_is_active=1.
	 *
	 * Designed to run on the marketing site so legacy / never-logged-in
	 * profiles get their flag set correctly without being affected by the
	 * hub's user list.
	 */
	public static function handle_reconcile( \WP_REST_Request $request ) {
		$dry_run = (bool) $request->get_param( 'dry_run' );

		$frs_roles = \FRSUsers\Core\Roles::get_wp_role_slugs();
		$users = get_users( array(
			'role__in' => $frs_roles,
			'fields'   => 'ID',
			'number'   => -1,
		) );

		$activated   = array();
		$deactivated = array();
		$unchanged   = 0;

		foreach ( $users as $user_id ) {
			$user_id = (int) $user_id;
			$user    = get_userdata( $user_id );
			if ( ! $user ) {
				continue;
			}

			$email_ok = str_ends_with( strtolower( (string) $user->user_email ), '@21stcenturylending.com' );
			$nmls     = trim( (string) get_user_meta( $user_id, 'frs_nmls', true ) );
			$arrive   = trim( (string) get_user_meta( $user_id, 'frs_arrive', true ) );
			$eligible = $email_ok && $nmls !== '' && $arrive !== '';

			$current_active = (int) get_user_meta( $user_id, 'frs_is_active', true );
			$desired_active = $eligible ? 1 : 0;

			if ( $current_active === $desired_active ) {
				$unchanged++;
				continue;
			}

			$reason = $eligible
				? 'now eligible'
				: ( ! $email_ok ? 'email not @21stcenturylending.com' : ( $nmls === '' ? 'no NMLS' : 'no Arrive link' ) );

			$entry = array(
				'user_id' => $user_id,
				'email'   => $user->user_email,
				'reason'  => $reason,
			);

			if ( ! $dry_run ) {
				update_user_meta( $user_id, 'frs_is_active', $desired_active );
			}

			if ( $desired_active === 1 ) {
				$activated[] = $entry;
			} else {
				$deactivated[] = $entry;
			}
		}

		return new \WP_REST_Response(
			array(
				'cohort'      => count( $users ),
				'unchanged'   => $unchanged,
				'activated'   => count( $activated ),
				'deactivated' => count( $deactivated ),
				'dry_run'     => $dry_run,
				'detail'      => array(
					'activated'   => $activated,
					'deactivated' => $deactivated,
				),
			),
			200
		);
	}

	public static function handle_diff( \WP_REST_Request $request ) {
		$user_id = (int) $request->get_param( 'id' );
		$user    = get_userdata( $user_id );
		if ( ! $user ) {
			return new \WP_REST_Response( array( 'error' => 'User not found on hub' ), 404 );
		}

		$endpoints = self::endpoints();
		if ( empty( $endpoints ) ) {
			return new \WP_REST_Response( array( 'error' => 'No frs_webhook_endpoints configured' ), 500 );
		}

		$profile     = Profile::hydrate_from_user( $user );
		$hub_payload = $profile->toArray();

		// We don't have a remote read endpoint on marketing; surface what hub
		// would send + a hint for which keys the receiver currently maps.
		// This is a starting point — the full marketing-side diff requires
		// a corresponding GET endpoint on the marketing site.
		return new \WP_REST_Response(
			array(
				'user_id'   => $user_id,
				'email'     => $user->user_email,
				'hub'       => $hub_payload,
				'endpoints' => $endpoints,
				'note'      => 'Full diff requires the marketing site to expose a profile-read endpoint. For now this returns hub-side payload only.',
			),
			200
		);
	}

	private static function endpoints(): array {
		$raw = is_multisite()
			? get_site_option( 'frs_webhook_endpoints', get_option( 'frs_webhook_endpoints', array() ) )
			: get_option( 'frs_webhook_endpoints', array() );
		if ( is_string( $raw ) ) {
			$decoded = maybe_unserialize( $raw );
			$raw = is_array( $decoded ) ? $decoded : array();
		}
		return is_array( $raw ) ? array_values( $raw ) : array();
	}

	private static function secret(): string {
		return is_multisite()
			? (string) get_site_option( 'frs_webhook_secret', get_option( 'frs_webhook_secret', '' ) )
			: (string) get_option( 'frs_webhook_secret', '' );
	}

	private static function dispatch_webhook( array $endpoints, array $payload, string $secret ): array {
		$body = wp_json_encode( $payload );
		$headers = array( 'Content-Type' => 'application/json' );
		if ( $secret ) {
			$headers['X-FRS-Signature'] = hash_hmac( 'sha256', $body, $secret );
		}

		$results = array();
		foreach ( $endpoints as $url ) {
			$resp = wp_remote_post( $url, array(
				'timeout' => 30,
				'headers' => $headers,
				'body'    => $body,
			) );
			if ( is_wp_error( $resp ) ) {
				$results[] = array( 'url' => $url, 'ok' => false, 'error' => $resp->get_error_message() );
				continue;
			}
			$code = wp_remote_retrieve_response_code( $resp );
			$results[] = array(
				'url'  => $url,
				'ok'   => ( $code >= 200 && $code < 300 ),
				'code' => $code,
				'body' => wp_remote_retrieve_body( $resp ),
			);
		}
		return $results;
	}
}
