<?php
/**
 * Activity Log Model
 *
 * Append-only activity log for tracking user events (profile updates,
 * meeting requests, course completions, etc.). Used in the Activity tab
 * of the unified profile page — visible at company level.
 *
 * @package FRSUsers
 * @since 3.2.0
 */

namespace FRSUsers\Models;

defined( 'ABSPATH' ) || exit;

class ActivityLog {

	/**
	 * Table name without prefix
	 *
	 * @var string
	 */
	private static $table = 'frs_activity_log';

	/**
	 * Get full table name with wpdb prefix
	 *
	 * @return string
	 */
	private static function table_name() {
		global $wpdb;
		return $wpdb->prefix . self::$table;
	}

	/**
	 * Create the activity log table via dbDelta
	 *
	 * @return void
	 */
	public static function maybe_create_table() {
		global $wpdb;

		$table_name      = self::table_name();
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table_name} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			actor_id bigint(20) unsigned NULL,
			action varchar(100) NOT NULL,
			entity_type varchar(50) NOT NULL DEFAULT 'profile',
			entity_id bigint(20) unsigned NULL,
			summary text NOT NULL,
			meta longtext NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id_created (user_id, created_at)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	/**
	 * Log an activity event
	 *
	 * @param int      $user_id     Profile owner.
	 * @param string   $action      Action slug (e.g. 'profile_updated').
	 * @param string   $entity_type Entity type (e.g. 'profile', 'post', 'course').
	 * @param string   $summary     Human-readable summary.
	 * @param array    $meta        Optional extra data.
	 * @param int|null $actor_id    Who performed the action (null = system).
	 * @param int|null $entity_id   Related entity ID.
	 * @return int|false Inserted row ID or false on failure.
	 */
	public static function log( $user_id, $action, $entity_type, $summary, $meta = array(), $actor_id = null, $entity_id = null ) {
		global $wpdb;

		$result = $wpdb->insert(
			self::table_name(),
			array(
				'user_id'     => $user_id,
				'actor_id'    => $actor_id,
				'action'      => $action,
				'entity_type' => $entity_type,
				'entity_id'   => $entity_id,
				'summary'     => $summary,
				'meta'        => wp_json_encode( $meta ),
				'created_at'  => current_time( 'mysql' ),
			),
			array( '%d', '%d', '%s', '%s', '%d', '%s', '%s', '%s' )
		);

		return $result ? $wpdb->insert_id : false;
	}

	/**
	 * Get paginated activity for a user
	 *
	 * @param int $user_id  User ID.
	 * @param int $page     Page number (1-indexed).
	 * @param int $per_page Items per page.
	 * @return array { data: array, total: int, page: int, pages: int }
	 */
	public static function get_for_user( $user_id, $page = 1, $per_page = 20 ) {
		global $wpdb;

		$table  = self::table_name();
		$offset = ( $page - 1 ) * $per_page;

		$total = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE user_id = %d", $user_id )
		);

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
				$user_id,
				$per_page,
				$offset
			),
			ARRAY_A
		);

		$data = array_map( array( __CLASS__, 'format_row' ), $rows ?: array() );

		return array(
			'data'  => $data,
			'total' => $total,
			'page'  => $page,
			'pages' => (int) ceil( $total / $per_page ),
		);
	}

	/**
	 * Get recent activity (no pagination)
	 *
	 * @param int $user_id User ID.
	 * @param int $limit   Max items.
	 * @return array
	 */
	public static function get_recent( $user_id, $limit = 10 ) {
		global $wpdb;

		$table = self::table_name();

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d",
				$user_id,
				$limit
			),
			ARRAY_A
		);

		return array_map( array( __CLASS__, 'format_row' ), $rows ?: array() );
	}

	/**
	 * Format a database row for API output
	 *
	 * @param array $row Database row.
	 * @return array
	 */
	private static function format_row( $row ) {
		$created = strtotime( $row['created_at'] );

		return array(
			'id'          => (int) $row['id'],
			'action'      => $row['action'],
			'entity_type' => $row['entity_type'],
			'entity_id'   => $row['entity_id'] ? (int) $row['entity_id'] : null,
			'summary'     => $row['summary'],
			'meta'        => json_decode( $row['meta'] ?: '{}', true ),
			'created_at'  => gmdate( 'c', $created ),
			'time_ago'    => human_time_diff( $created, current_time( 'timestamp' ) ) . ' ago',
		);
	}
}
