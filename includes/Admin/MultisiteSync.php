<?php
/**
 * Multisite User Sync Admin Page
 *
 * Allows adding users from main site to subsites.
 *
 * @package FRSUsers\Admin
 */

namespace FRSUsers\Admin;

use FRSUsers\Core\Roles;
use FRSUsers\Traits\Base;

/**
 * Class MultisiteSync
 */
class MultisiteSync {

	use Base;

	/**
	 * Initialize the admin page.
	 *
	 * @return void
	 */
	public function init() {
		// Only load in multisite
		if ( ! is_multisite() ) {
			return;
		}

		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'handle_sync_action' ) );
	}

	/**
	 * Add admin menu page.
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'frs-profiles',
			__( 'Sync to Site', 'frs-users' ),
			__( 'Sync to Site', 'frs-users' ),
			'manage_options',
			'frs-multisite-sync',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Handle the sync action.
	 *
	 * @return void
	 */
	public function handle_sync_action() {
		if ( ! isset( $_POST['frs_sync_users'] ) ) {
			return;
		}

		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'frs_multisite_sync' ) ) {
			wp_die( 'Security check failed' );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized' );
		}

		$user_ids = isset( $_POST['user_ids'] ) ? array_map( 'intval', $_POST['user_ids'] ) : array();
		$target_site = isset( $_POST['target_site'] ) ? intval( $_POST['target_site'] ) : 0;

		if ( empty( $user_ids ) || ! $target_site ) {
			add_settings_error( 'frs_sync', 'no_selection', __( 'Please select users and a target site.', 'frs-users' ), 'error' );
			return;
		}

		$synced = 0;
		$skipped = 0;

		foreach ( $user_ids as $user_id ) {
			$user = get_userdata( $user_id );
			if ( ! $user ) {
				continue;
			}

			// Check if already a member
			if ( is_user_member_of_blog( $user_id, $target_site ) ) {
				$skipped++;
				continue;
			}

			// Get user's role from main site
			$main_site_id = get_main_site_id();
			switch_to_blog( $main_site_id );
			$user_roles = $user->roles;
			$role = ! empty( $user_roles ) ? reset( $user_roles ) : 'subscriber';
			restore_current_blog();

			// Add user to target site with same role
			add_user_to_blog( $target_site, $user_id, $role );
			$synced++;
		}

		add_settings_error(
			'frs_sync',
			'sync_complete',
			sprintf( __( 'Synced %d users to site. %d already members.', 'frs-users' ), $synced, $skipped ),
			'success'
		);
	}

	/**
	 * Render the admin page.
	 *
	 * @return void
	 */
	public function render_page() {
		$current_site_id = get_current_blog_id();
		$main_site_id = get_main_site_id();
		$filter_role = isset( $_GET['filter_role'] ) ? sanitize_text_field( $_GET['filter_role'] ) : '';

		// Get all sites for dropdown
		$sites = get_sites( array( 'number' => 100 ) );

		// Get users from main site
		$user_args = array(
			'blog_id'  => $main_site_id,
			'role__in' => Roles::get_wp_role_slugs(),
			'orderby'  => 'display_name',
			'order'    => 'ASC',
			'number'   => 200,
		);

		if ( $filter_role ) {
			$user_args['role'] = $filter_role;
		}

		$users = get_users( $user_args );

		// Get available roles for filter
		$available_roles = Roles::get_wp_roles_for_admin();

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Sync Users to Site', 'frs-users' ); ?></h1>

			<?php settings_errors( 'frs_sync' ); ?>

			<p><?php esc_html_e( 'Add users from the main site to subsites. Users will keep their existing role.', 'frs-users' ); ?></p>

			<!-- Filter Form -->
			<form method="get" style="margin-bottom: 20px;">
				<input type="hidden" name="page" value="frs-multisite-sync">
				<label for="filter_role"><strong><?php esc_html_e( 'Filter by Role:', 'frs-users' ); ?></strong></label>
				<select name="filter_role" id="filter_role">
					<option value=""><?php esc_html_e( 'All Roles', 'frs-users' ); ?></option>
					<?php foreach ( $available_roles as $role_slug => $role_data ) : ?>
						<option value="<?php echo esc_attr( $role_slug ); ?>" <?php selected( $filter_role, $role_slug ); ?>>
							<?php echo esc_html( $role_data['label'] ); ?>
						</option>
					<?php endforeach; ?>
				</select>
				<button type="submit" class="button"><?php esc_html_e( 'Filter', 'frs-users' ); ?></button>
			</form>

			<!-- Sync Form -->
			<form method="post">
				<?php wp_nonce_field( 'frs_multisite_sync' ); ?>

				<div style="margin-bottom: 15px;">
					<label for="target_site"><strong><?php esc_html_e( 'Target Site:', 'frs-users' ); ?></strong></label>
					<select name="target_site" id="target_site" required>
						<option value=""><?php esc_html_e( '-- Select Site --', 'frs-users' ); ?></option>
						<?php foreach ( $sites as $site ) : ?>
							<?php if ( (int) $site->blog_id !== $main_site_id ) : ?>
								<option value="<?php echo esc_attr( $site->blog_id ); ?>">
									<?php echo esc_html( $site->blogname ?: $site->path ); ?>
								</option>
							<?php endif; ?>
						<?php endforeach; ?>
					</select>
				</div>

				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<td class="manage-column column-cb check-column">
								<input type="checkbox" id="select-all">
							</td>
							<th><?php esc_html_e( 'Name', 'frs-users' ); ?></th>
							<th><?php esc_html_e( 'Email', 'frs-users' ); ?></th>
							<th><?php esc_html_e( 'Role', 'frs-users' ); ?></th>
							<th><?php esc_html_e( 'Status', 'frs-users' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php if ( empty( $users ) ) : ?>
							<tr>
								<td colspan="5"><?php esc_html_e( 'No users found.', 'frs-users' ); ?></td>
							</tr>
						<?php else : ?>
							<?php foreach ( $users as $user ) : ?>
								<?php
								$role_names = array_map( function( $role ) use ( $available_roles ) {
									return isset( $available_roles[ $role ] ) ? $available_roles[ $role ]['label'] : $role;
								}, $user->roles );
								?>
								<tr>
									<th class="check-column">
										<input type="checkbox" name="user_ids[]" value="<?php echo esc_attr( $user->ID ); ?>">
									</th>
									<td>
										<strong><?php echo esc_html( $user->display_name ); ?></strong>
									</td>
									<td><?php echo esc_html( $user->user_email ); ?></td>
									<td><?php echo esc_html( implode( ', ', $role_names ) ); ?></td>
									<td>
										<?php
										// Check which sites user is member of
										$member_sites = array();
										foreach ( $sites as $site ) {
											if ( is_user_member_of_blog( $user->ID, $site->blog_id ) ) {
												$member_sites[] = $site->blogname ?: $site->path;
											}
										}
										echo esc_html( implode( ', ', $member_sites ) );
										?>
									</td>
								</tr>
							<?php endforeach; ?>
						<?php endif; ?>
					</tbody>
				</table>

				<p class="submit">
					<button type="submit" name="frs_sync_users" class="button button-primary">
						<?php esc_html_e( 'Add Selected Users to Site', 'frs-users' ); ?>
					</button>
				</p>
			</form>
		</div>

		<script>
		document.getElementById('select-all').addEventListener('change', function() {
			var checkboxes = document.querySelectorAll('input[name="user_ids[]"]');
			for (var i = 0; i < checkboxes.length; i++) {
				checkboxes[i].checked = this.checked;
			}
		});
		</script>
		<?php
	}
}
