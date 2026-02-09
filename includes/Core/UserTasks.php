<?php
/**
 * User Tasks
 *
 * Manages admin-assigned tasks and auto-computed profile completion items.
 * Provides REST API endpoints for CRUD operations and a custom DB table.
 *
 * @package FRSUsers
 * @since 3.1.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\UserProfile;

defined( 'ABSPATH' ) || exit;

class UserTasks {

	/**
	 * Singleton instance
	 *
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * REST namespace
	 *
	 * @var string
	 */
	private $namespace = 'frs-users/v1';

	/**
	 * Table name (without prefix)
	 *
	 * @var string
	 */
	private $table_name = 'frs_user_tasks';

	/**
	 * Get singleton instance
	 *
	 * @return self
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Initialize hooks
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Get full table name with prefix
	 *
	 * @return string
	 */
	private function get_table_name() {
		global $wpdb;
		return $wpdb->prefix . $this->table_name;
	}

	// =========================================
	// Table Creation
	// =========================================

	/**
	 * Create or update the tasks table via dbDelta
	 *
	 * @return void
	 */
	public static function maybe_create_table() {
		global $wpdb;

		$table_name      = $wpdb->prefix . 'frs_user_tasks';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table_name} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			title varchar(500) NOT NULL,
			description text NULL,
			due_date date NULL,
			is_completed tinyint(1) NOT NULL DEFAULT 0,
			completed_at datetime NULL,
			completed_by bigint(20) unsigned NULL,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			sort_order int NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY is_completed (is_completed)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	// =========================================
	// REST API Routes
	// =========================================

	/**
	 * Register REST routes
	 *
	 * @return void
	 */
	public function register_routes() {
		// GET all tasks (auto + admin) for a user
		register_rest_route(
			$this->namespace,
			'/profiles/(?P<id>\d+)/tasks',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_tasks' ),
					'permission_callback' => array( $this, 'can_view_tasks' ),
					'args'                => array(
						'id' => array(
							'required'          => true,
							'validate_callback' => function ( $param ) {
								return is_numeric( $param );
							},
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_task' ),
					'permission_callback' => array( $this, 'can_manage_tasks' ),
					'args'                => array(
						'id' => array(
							'required'          => true,
							'validate_callback' => function ( $param ) {
								return is_numeric( $param );
							},
						),
					),
				),
			)
		);

		// PUT/DELETE a specific task
		register_rest_route(
			$this->namespace,
			'/profiles/(?P<id>\d+)/tasks/(?P<task_id>\d+)',
			array(
				array(
					'methods'             => 'PUT',
					'callback'            => array( $this, 'update_task' ),
					'permission_callback' => array( $this, 'can_view_tasks' ),
					'args'                => array(
						'id'      => array(
							'required'          => true,
							'validate_callback' => function ( $param ) {
								return is_numeric( $param );
							},
						),
						'task_id' => array(
							'required'          => true,
							'validate_callback' => function ( $param ) {
								return is_numeric( $param );
							},
						),
					),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_task' ),
					'permission_callback' => array( $this, 'can_manage_tasks' ),
					'args'                => array(
						'id'      => array(
							'required'          => true,
							'validate_callback' => function ( $param ) {
								return is_numeric( $param );
							},
						),
						'task_id' => array(
							'required'          => true,
							'validate_callback' => function ( $param ) {
								return is_numeric( $param );
							},
						),
					),
				),
			)
		);
	}

	// =========================================
	// Permission Callbacks
	// =========================================

	/**
	 * Check if current user can view tasks (owner or admin)
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function can_view_tasks( $request ) {
		$user_id = (int) $request->get_param( 'id' );
		return current_user_can( 'edit_users' ) || get_current_user_id() === $user_id;
	}

	/**
	 * Check if current user can manage tasks (admin only)
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function can_manage_tasks( $request ) {
		return current_user_can( 'edit_users' );
	}

	// =========================================
	// CRUD Callbacks
	// =========================================

	/**
	 * GET /profiles/{id}/tasks — returns auto items + admin tasks merged
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_tasks( $request ) {
		$user_id = (int) $request->get_param( 'id' );
		$profile = UserProfile::find( $user_id );

		if ( ! $profile ) {
			return new \WP_Error( 'not_found', 'User not found', array( 'status' => 404 ) );
		}

		$auto_items  = $profile->get_profile_completion_items();
		$admin_tasks = $this->get_admin_tasks( $user_id );

		$all_tasks = array_merge( $auto_items, $admin_tasks );

		return rest_ensure_response( $all_tasks );
	}

	/**
	 * POST /profiles/{id}/tasks — create an admin task
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function create_task( $request ) {
		$user_id = (int) $request->get_param( 'id' );
		$title   = sanitize_text_field( $request->get_param( 'title' ) );

		if ( empty( $title ) ) {
			return new \WP_Error( 'missing_title', 'Task title is required', array( 'status' => 400 ) );
		}

		global $wpdb;

		$data = array(
			'user_id'     => $user_id,
			'title'       => $title,
			'description' => sanitize_textarea_field( $request->get_param( 'description' ) ?: '' ),
			'due_date'    => $this->sanitize_date( $request->get_param( 'due_date' ) ),
			'created_by'  => get_current_user_id(),
			'sort_order'  => (int) $request->get_param( 'sort_order' ),
		);

		$result = $wpdb->insert( $this->get_table_name(), $data );

		if ( false === $result ) {
			return new \WP_Error( 'db_error', 'Failed to create task', array( 'status' => 500 ) );
		}

		$task = $this->format_admin_task(
			$wpdb->get_row(
				$wpdb->prepare(
					"SELECT * FROM {$this->get_table_name()} WHERE id = %d",
					$wpdb->insert_id
				)
			)
		);

		return rest_ensure_response( $task );
	}

	/**
	 * PUT /profiles/{id}/tasks/{task_id} — toggle completion or update fields
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_task( $request ) {
		global $wpdb;

		$user_id = (int) $request->get_param( 'id' );
		$task_id = (int) $request->get_param( 'task_id' );

		$task = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table_name()} WHERE id = %d AND user_id = %d",
				$task_id,
				$user_id
			)
		);

		if ( ! $task ) {
			return new \WP_Error( 'not_found', 'Task not found', array( 'status' => 404 ) );
		}

		$update = array();

		// Toggle completion
		if ( null !== $request->get_param( 'is_completed' ) ) {
			$is_completed            = (bool) $request->get_param( 'is_completed' );
			$update['is_completed']  = $is_completed ? 1 : 0;
			$update['completed_at']  = $is_completed ? current_time( 'mysql' ) : null;
			$update['completed_by']  = $is_completed ? get_current_user_id() : null;
		}

		// Update title (admin only)
		if ( $request->get_param( 'title' ) && current_user_can( 'edit_users' ) ) {
			$update['title'] = sanitize_text_field( $request->get_param( 'title' ) );
		}

		// Update due_date (admin only)
		if ( null !== $request->get_param( 'due_date' ) && current_user_can( 'edit_users' ) ) {
			$update['due_date'] = $this->sanitize_date( $request->get_param( 'due_date' ) );
		}

		if ( empty( $update ) ) {
			return new \WP_Error( 'no_changes', 'No fields to update', array( 'status' => 400 ) );
		}

		$wpdb->update(
			$this->get_table_name(),
			$update,
			array(
				'id'      => $task_id,
				'user_id' => $user_id,
			)
		);

		$updated = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table_name()} WHERE id = %d",
				$task_id
			)
		);

		return rest_ensure_response( $this->format_admin_task( $updated ) );
	}

	/**
	 * DELETE /profiles/{id}/tasks/{task_id}
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_task( $request ) {
		global $wpdb;

		$user_id = (int) $request->get_param( 'id' );
		$task_id = (int) $request->get_param( 'task_id' );

		$deleted = $wpdb->delete(
			$this->get_table_name(),
			array(
				'id'      => $task_id,
				'user_id' => $user_id,
			)
		);

		if ( ! $deleted ) {
			return new \WP_Error( 'not_found', 'Task not found', array( 'status' => 404 ) );
		}

		return rest_ensure_response( array( 'deleted' => true ) );
	}

	// =========================================
	// Data Helpers
	// =========================================

	/**
	 * Get admin-assigned tasks for a user
	 *
	 * @param int $user_id User ID.
	 * @return array Formatted task list.
	 */
	private function get_admin_tasks( $user_id ) {
		global $wpdb;

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table_name()} WHERE user_id = %d ORDER BY sort_order ASC, created_at ASC",
				$user_id
			)
		);

		return array_map( array( $this, 'format_admin_task' ), $rows ?: array() );
	}

	/**
	 * Format a DB row as a task array
	 *
	 * @param object $row DB row.
	 * @return array
	 */
	private function format_admin_task( $row ) {
		return array(
			'id'           => (int) $row->id,
			'type'         => 'admin',
			'key'          => 'admin_' . $row->id,
			'title'        => $row->title,
			'description'  => $row->description ?: '',
			'due_date'     => $row->due_date,
			'is_completed' => (bool) $row->is_completed,
			'completed_at' => $row->completed_at,
			'completed_by' => $row->completed_by ? (int) $row->completed_by : null,
			'created_by'   => (int) $row->created_by,
			'created_at'   => $row->created_at,
			'sort_order'   => (int) $row->sort_order,
		);
	}

	/**
	 * Sanitize a date string to Y-m-d or null
	 *
	 * @param mixed $value Date value.
	 * @return string|null
	 */
	private function sanitize_date( $value ) {
		if ( empty( $value ) ) {
			return null;
		}
		$timestamp = strtotime( $value );
		return $timestamp ? gmdate( 'Y-m-d', $timestamp ) : null;
	}
}
