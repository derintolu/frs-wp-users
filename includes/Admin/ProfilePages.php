<?php
/**
 * Profile Pages Tab
 *
 * Handles displaying and managing user profile pages within the profile edit interface.
 *
 * @package FRSUsers\Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Traits\Base;

/**
 * Class ProfilePages
 *
 * Manages the profile pages tab in user profiles.
 *
 * @package FRSUsers\Admin
 */
class ProfilePages {
	use Base;

	/**
	 * Initialize
	 *
	 * @return void
	 */
	public function init() {
		// Add profile pages tab to profile view
		add_action( 'frs_profile_tabs', array( $this, 'add_profile_pages_tab' ), 10 );
		add_action( 'frs_profile_tab_content', array( $this, 'render_profile_pages_content' ), 10 );

		// Handle AJAX requests for profile pages list
		add_action( 'wp_ajax_frs_get_profile_pages', array( $this, 'ajax_get_profile_pages' ) );
		add_action( 'wp_ajax_frs_create_profile_page', array( $this, 'ajax_create_profile_page' ) );
		add_action( 'wp_ajax_frs_delete_profile_page', array( $this, 'ajax_delete_profile_page' ) );
	}

	/**
	 * Add profile pages tab to navigation
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public function add_profile_pages_tab( $user_id ) {
		?>
		<a href="#tab-profile-pages" class="nav-tab"><?php esc_html_e( 'Profile Pages', 'frs-users' ); ?></a>
		<?php
	}

	/**
	 * Render profile pages tab content
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public function render_profile_pages_content( $user_id ) {
		// Get all profile pages for this user
		$profile_pages = get_posts(
			array(
				'post_type'      => 'frs_user_profile',
				'author'         => $user_id,
				'posts_per_page' => -1,
				'post_status'    => array( 'publish', 'draft', 'pending' ),
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		// Get template terms
		$templates = get_terms(
			array(
				'taxonomy'   => 'profile_template',
				'hide_empty' => false,
			)
		);

		?>
		<div id="tab-profile-pages" class="tab-content postbox" style="display: none;">
			<div class="inside">
				<div style="margin-bottom: 20px;">
					<h3><?php esc_html_e( 'Your Profile Pages', 'frs-users' ); ?></h3>
					<p class="description">
						<?php esc_html_e( 'Manage your public profile pages. You have one page for each template type.', 'frs-users' ); ?>
					</p>
				</div>

				<?php if ( empty( $profile_pages ) ) : ?>
					<div class="notice notice-info inline">
						<p><?php esc_html_e( 'No profile pages found. Profile pages are automatically created when you save your profile.', 'frs-users' ); ?></p>
					</div>
				<?php else : ?>
					<table class="wp-list-table widefat fixed striped posts">
						<thead>
							<tr>
								<th scope="col" class="manage-column column-title column-primary" style="width: 40%;">
									<?php esc_html_e( 'Title', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column" style="width: 20%;">
									<?php esc_html_e( 'Template', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column" style="width: 15%;">
									<?php esc_html_e( 'Status', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column" style="width: 15%;">
									<?php esc_html_e( 'Date', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column" style="width: 10%;">
									<?php esc_html_e( 'Actions', 'frs-users' ); ?>
								</th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $profile_pages as $page ) : ?>
								<?php
								$edit_url   = admin_url( 'post.php?post=' . $page->ID . '&action=edit' );
								$view_url   = get_permalink( $page->ID );
								$delete_url = get_delete_post_link( $page->ID );

								// Get template taxonomy term
								$page_templates = wp_get_object_terms( $page->ID, 'profile_template' );
								$template_name  = ! empty( $page_templates ) && ! is_wp_error( $page_templates ) ? $page_templates[0]->name : '—';

								// Status badge
								$status_colors = array(
									'publish' => '#00a32a',
									'draft'   => '#dba617',
									'pending' => '#2271b1',
								);
								$status_color  = isset( $status_colors[ $page->post_status ] ) ? $status_colors[ $page->post_status ] : '#666';
								?>
								<tr>
									<td class="title column-title column-primary" data-colname="<?php esc_attr_e( 'Title', 'frs-users' ); ?>">
										<strong>
											<a href="<?php echo esc_url( $edit_url ); ?>" class="row-title">
												<?php echo esc_html( $page->post_title ); ?>
											</a>
										</strong>
										<div class="row-actions">
											<span class="edit">
												<a href="<?php echo esc_url( $edit_url ); ?>"><?php esc_html_e( 'Edit', 'frs-users' ); ?></a> |
											</span>
											<?php if ( 'publish' === $page->post_status ) : ?>
												<span class="view">
													<a href="<?php echo esc_url( $view_url ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'View', 'frs-users' ); ?></a> |
												</span>
											<?php endif; ?>
											<span class="trash">
												<a href="<?php echo esc_url( $delete_url ); ?>" class="submitdelete" onclick="return confirm('<?php esc_attr_e( 'Are you sure you want to delete this page?', 'frs-users' ); ?>');">
													<?php esc_html_e( 'Delete', 'frs-users' ); ?>
												</a>
											</span>
										</div>
									</td>
									<td class="template column-template" data-colname="<?php esc_attr_e( 'Template', 'frs-users' ); ?>">
										<span class="badge" style="display: inline-block; padding: 4px 10px; background: #2271b1; color: #fff; border-radius: 3px; font-size: 12px;">
											<?php echo esc_html( $template_name ); ?>
										</span>
									</td>
									<td class="status column-status" data-colname="<?php esc_attr_e( 'Status', 'frs-users' ); ?>">
										<span class="badge" style="display: inline-block; padding: 4px 10px; background: <?php echo esc_attr( $status_color ); ?>; color: #fff; border-radius: 3px; font-size: 12px;">
											<?php echo esc_html( ucfirst( $page->post_status ) ); ?>
										</span>
									</td>
									<td class="date column-date" data-colname="<?php esc_attr_e( 'Date', 'frs-users' ); ?>">
										<?php
										$time_diff = human_time_diff( strtotime( $page->post_date ), current_time( 'timestamp' ) );
										printf(
											/* translators: %s: Time difference */
											esc_html__( '%s ago', 'frs-users' ),
											esc_html( $time_diff )
										);
										?>
									</td>
									<td class="actions column-actions" data-colname="<?php esc_attr_e( 'Actions', 'frs-users' ); ?>">
										<a href="<?php echo esc_url( $edit_url ); ?>" class="button button-small">
											<?php esc_html_e( 'Edit', 'frs-users' ); ?>
										</a>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
						<tfoot>
							<tr>
								<th scope="col" class="manage-column column-title column-primary">
									<?php esc_html_e( 'Title', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column">
									<?php esc_html_e( 'Template', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column">
									<?php esc_html_e( 'Status', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column">
									<?php esc_html_e( 'Date', 'frs-users' ); ?>
								</th>
								<th scope="col" class="manage-column">
									<?php esc_html_e( 'Actions', 'frs-users' ); ?>
								</th>
							</tr>
						</tfoot>
					</table>

					<div style="margin-top: 20px;">
						<p class="description">
							<?php
							printf(
								/* translators: %d: Number of pages */
								esc_html( _n( 'Total: %d page', 'Total: %d pages', count( $profile_pages ), 'frs-users' ) ),
								count( $profile_pages )
							);
							?>
						</p>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<style>
			.wp-list-table .badge {
				white-space: nowrap;
			}
			.wp-list-table .row-actions {
				color: #dcdcde;
			}
			.wp-list-table .row-actions span {
				display: inline;
			}
			.wp-list-table tr:hover .row-actions {
				visibility: visible;
			}
		</style>
		<?php
	}

	/**
	 * Get user profile pages for the given user
	 *
	 * @param int $user_id User ID.
	 * @return array Array of profile page posts.
	 */
	public static function get_user_profile_pages( $user_id ) {
		return get_posts(
			array(
				'post_type'      => 'frs_user_profile',
				'author'         => $user_id,
				'posts_per_page' => -1,
				'post_status'    => array( 'publish', 'draft', 'pending', 'trash' ),
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);
	}

	/**
	 * AJAX handler to get profile pages
	 *
	 * @return void
	 */
	public function ajax_get_profile_pages() {
		check_ajax_referer( 'frs_profile_pages', 'nonce' );

		if ( ! current_user_can( 'edit_users' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied', 'frs-users' ) ) );
		}

		$user_id = isset( $_GET['user_id'] ) ? intval( $_GET['user_id'] ) : 0;

		if ( ! $user_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid user ID', 'frs-users' ) ) );
		}

		$pages = self::get_user_profile_pages( $user_id );

		wp_send_json_success( array( 'pages' => $pages ) );
	}
}
