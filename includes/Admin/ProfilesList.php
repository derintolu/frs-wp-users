<?php
/**
 * Profiles List Table
 *
 * Displays a list of profiles with actions to create user accounts.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Class ProfilesList
 *
 * Extends WP_List_Table to display profiles with user account creation.
 *
 * @package FRSUsers\Admin
 */
class ProfilesList extends \WP_List_Table {

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct(
			array(
				'singular' => 'profile',
				'plural'   => 'profiles',
				'ajax'     => false,
			)
		);
	}

	/**
	 * Get columns for the list table
	 *
	 * @return array
	 */
	public function get_columns() {
		return array(
			'cb'            => '<input type="checkbox" />',
			'headshot'      => __( 'Photo', 'frs-users' ),
			'name'          => __( 'Name', 'frs-users' ),
			'email'         => __( 'Email', 'frs-users' ),
			'phone_number'  => __( 'Phone', 'frs-users' ),
			'nmls'          => __( 'NMLS', 'frs-users' ),
			'profile_types' => __( 'Type', 'frs-users' ),
			'status'        => __( 'Status', 'frs-users' ),
		);
	}

	/**
	 * Get sortable columns
	 *
	 * @return array
	 */
	protected function get_sortable_columns() {
		return array(
			'name'       => array( 'last_name', false ),
			'email'      => array( 'email', false ),
			'created_at' => array( 'created_at', true ),
		);
	}

	/**
	 * Get bulk actions
	 *
	 * @return array
	 */
	protected function get_bulk_actions() {
		return array(
			'bulk_create_users' => __( 'Create User Accounts', 'frs-users' ),
		);
	}

	/**
	 * Render checkbox column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_cb( $item ) {
		// Only show checkbox for guest profiles
		if ( $item->is_guest() ) {
			return sprintf( '<input type="checkbox" name="profile_ids[]" value="%d" />', $item->id );
		}
		return '';
	}

	/**
	 * Render headshot column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_headshot( $item ) {
		if ( $item->headshot_id ) {
			$image_url = wp_get_attachment_image_url( $item->headshot_id, 'thumbnail' );
			if ( $image_url ) {
				return '<div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden;"><img src="' . esc_url( $image_url ) . '" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="' . esc_attr( $item->first_name . ' ' . $item->last_name ) . '"></div>';
			}
		}
		return '<div style="width: 50px; height: 50px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #666;">' . strtoupper( substr( $item->first_name, 0, 1 ) ) . '</div>';
	}

	/**
	 * Render name column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_name( $item ) {
		$name = $item->first_name . ' ' . $item->last_name;

		$view_url = add_query_arg(
			array(
				'page'       => 'frs-users-profiles',
				'action'     => 'view',
				'profile_id' => $item->id,
			),
			admin_url( 'admin.php' )
		);

		$edit_url = add_query_arg(
			array(
				'page'       => 'frs-users-profiles',
				'action'     => 'edit',
				'profile_id' => $item->id,
			),
			admin_url( 'admin.php' )
		);

		$delete_url = add_query_arg(
			array(
				'page'       => 'frs-users-profiles',
				'action'     => 'delete',
				'profile_id' => $item->id,
				'_wpnonce'   => wp_create_nonce( 'delete_profile_' . $item->id ),
			),
			admin_url( 'admin.php' )
		);

		$actions = array(
			'view'   => sprintf( '<a href="%s">%s</a>', $view_url, __( 'View', 'frs-users' ) ),
			'edit'   => sprintf( '<a href="%s">%s</a>', $edit_url, __( 'Edit', 'frs-users' ) ),
			'delete' => sprintf( '<a href="%s" class="delete-profile">%s</a>', $delete_url, __( 'Delete', 'frs-users' ) ),
		);

		return sprintf( '<strong><a href="%s">%s</a></strong>%s', $view_url, esc_html( $name ), $this->row_actions( $actions ) );
	}

	/**
	 * Render phone number column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_phone_number( $item ) {
		if ( ! empty( $item->phone_number ) ) {
			return sprintf( '<a href="tel:%s">%s</a>', esc_attr( $item->phone_number ), esc_html( $item->phone_number ) );
		}
		return '—';
	}

	/**
	 * Render NMLS column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_nmls( $item ) {
		if ( ! empty( $item->nmls ) ) {
			return '<code>' . esc_html( $item->nmls ) . '</code>';
		}
		if ( ! empty( $item->nmls_number ) ) {
			return '<code>' . esc_html( $item->nmls_number ) . '</code>';
		}
		return '—';
	}

	/**
	 * Render email column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_email( $item ) {
		return sprintf( '<a href="mailto:%s">%s</a>', esc_attr( $item->email ), esc_html( $item->email ) );
	}

	/**
	 * Render profile types column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_profile_types( $item ) {
		$types = $item->get_types();

		if ( empty( $types ) ) {
			return '—';
		}

		$type_labels = array_map( function( $type ) {
			return '<span class="profile-type-badge">' . esc_html( ucwords( str_replace( '_', ' ', $type ) ) ) . '</span>';
		}, $types );

		return implode( ' ', $type_labels );
	}

	/**
	 * Render status column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_status( $item ) {
		if ( $item->is_guest() ) {
			return '<span class="profile-only-badge" style="background: #f0ad4e; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">' . __( 'Profile Only', 'frs-users' ) . '</span>';
		}

		$user = get_user_by( 'id', $item->user_id );
		if ( $user ) {
			return '<span class="profile-plus-badge" style="background: #5cb85c; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">' . sprintf( __( 'Profile+ (@%s)', 'frs-users' ), $user->user_login ) . '</span>';
		}

		return '—';
	}

	/**
	 * Render created_at column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_created_at( $item ) {
		return date_i18n( get_option( 'date_format' ), strtotime( $item->created_at ) );
	}

	/**
	 * Render actions column
	 *
	 * @param object $item Profile item.
	 * @return string
	 */
	protected function column_actions( $item ) {
		if ( ! $item->is_guest() ) {
			return '—';
		}

		$nonce = wp_create_nonce( 'create_user_' . $item->id );

		return sprintf(
			'<button type="button" class="button button-primary create-user-btn" data-profile-id="%d" data-nonce="%s">%s</button>',
			$item->id,
			$nonce,
			__( 'Create User Account', 'frs-users' )
		);
	}

	/**
	 * Prepare items for display
	 *
	 * @return void
	 */
	public function prepare_items() {
		$columns  = $this->get_columns();
		$hidden   = array();
		$sortable = $this->get_sortable_columns();

		$this->_column_headers = array( $columns, $hidden, $sortable );

		// Handle bulk actions
		$this->process_bulk_action();

		// Get filter parameters
		$filter_type = isset( $_GET['filter_type'] ) ? sanitize_text_field( $_GET['filter_type'] ) : '';
		$guests_only = isset( $_GET['guests_only'] ) ? (bool) $_GET['guests_only'] : false;

		// Pagination
		$per_page     = 20;
		$current_page = $this->get_pagenum();
		$offset       = ( $current_page - 1 ) * $per_page;

		$args = array(
			'limit'  => $per_page,
			'offset' => $offset,
		);

		// Get profiles based on filters
		if ( $guests_only ) {
			$items = Profile::get_guests( $args );
			$total_items = count( Profile::get_guests( array( 'limit' => 99999 ) ) );
		} elseif ( $filter_type ) {
			$items = Profile::get_by_type( $filter_type, $args );
			$total_items = count( Profile::get_by_type( $filter_type, array( 'limit' => 99999 ) ) );
		} else {
			// Get all profiles
			$items = Profile::get_all( $args );
			$total_items = Profile::count();
		}

		$this->items = $items;

		$this->set_pagination_args(
			array(
				'total_items' => $total_items,
				'per_page'    => $per_page,
				'total_pages' => ceil( $total_items / $per_page ),
			)
		);
	}

	/**
	 * Process bulk actions
	 *
	 * @return void
	 */
	public function process_bulk_action() {
		$action = $this->current_action();

		if ( 'bulk_create_users' === $action ) {
			if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'bulk-' . $this->_args['plural'] ) ) {
				wp_die( __( 'Security check failed', 'frs-users' ) );
			}

			if ( ! isset( $_POST['profile_ids'] ) || ! is_array( $_POST['profile_ids'] ) ) {
				return;
			}

			$profile_ids = array_map( 'absint', $_POST['profile_ids'] );
			$success_count = 0;
			$failed_count = 0;

			foreach ( $profile_ids as $profile_id ) {
				$profile = Profile::find( $profile_id );

				if ( ! $profile || ! $profile->is_guest() ) {
					$failed_count++;
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
					$failed_count++;
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
				wp_send_new_user_notifications( $user_id, 'user' );

				$success_count++;
			}

			// Show admin notice
			add_action( 'admin_notices', function() use ( $success_count, $failed_count ) {
				?>
				<div class="notice notice-success is-dismissible">
					<p>
						<?php
						printf(
							__( 'Successfully created %d user accounts. %d failed.', 'frs-users' ),
							$success_count,
							$failed_count
						);
						?>
					</p>
				</div>
				<?php
			} );
		}
	}

	/**
	 * Display filters
	 *
	 * @param string $which Top or bottom.
	 * @return void
	 */
	protected function extra_tablenav( $which ) {
		if ( 'top' !== $which ) {
			return;
		}
		?>
		<div class="alignleft actions">
			<select name="filter_type">
				<option value=""><?php _e( 'All Profile Types', 'frs-users' ); ?></option>
				<option value="loan_officer" <?php selected( isset( $_GET['filter_type'] ) && $_GET['filter_type'] === 'loan_officer' ); ?>>
					<?php _e( 'Loan Officers', 'frs-users' ); ?>
				</option>
				<option value="realtor_partner" <?php selected( isset( $_GET['filter_type'] ) && $_GET['filter_type'] === 'realtor_partner' ); ?>>
					<?php _e( 'Real Estate Partners', 'frs-users' ); ?>
				</option>
				<option value="staff" <?php selected( isset( $_GET['filter_type'] ) && $_GET['filter_type'] === 'staff' ); ?>>
					<?php _e( 'Staff', 'frs-users' ); ?>
				</option>
				<option value="leadership" <?php selected( isset( $_GET['filter_type'] ) && $_GET['filter_type'] === 'leadership' ); ?>>
					<?php _e( 'Leadership', 'frs-users' ); ?>
				</option>
				<option value="assistant" <?php selected( isset( $_GET['filter_type'] ) && $_GET['filter_type'] === 'assistant' ); ?>>
					<?php _e( 'Assistants', 'frs-users' ); ?>
				</option>
			</select>

			<label>
				<input type="checkbox" name="guests_only" value="1" <?php checked( isset( $_GET['guests_only'] ) && $_GET['guests_only'] ); ?> />
				<?php _e( 'Guest Profiles Only', 'frs-users' ); ?>
			</label>

			<?php submit_button( __( 'Filter', 'frs-users' ), 'button', 'filter_action', false ); ?>
		</div>
		<?php
	}
}
