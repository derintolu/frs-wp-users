<?php
/**
 * Profile Pages Admin Controller
 *
 * Adds Templates and Settings submenus to FRS Users admin.
 *
 * @package FRSUsers\Controllers
 * @since 1.0.0
 */

namespace FRSUsers\Controllers;

use FRSUsers\Traits\Base;

/**
 * Class ProfilePagesAdmin
 *
 * Handles admin pages for profile page templates and settings.
 *
 * @package FRSUsers\Controllers
 */
class ProfilePagesAdmin {

	use Base;

	/**
	 * Initialize admin pages.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_admin_pages' ) );
	}

	/**
	 * Add admin menu pages.
	 *
	 * @return void
	 */
	public function add_admin_pages() {
		// Add Templates submenu (links to template post type)
		add_submenu_page(
			'frs-profiles',
			__( 'Profile Templates', 'frs-users' ),
			__( 'Templates', 'frs-users' ),
			'edit_posts',
			'edit.php?post_type=frs_profile_template'
		);

		// Add Settings submenu
		add_submenu_page(
			'frs-profiles',
			__( 'Profile Pages Settings', 'frs-users' ),
			__( 'Settings', 'frs-users' ),
			'manage_options',
			'frs-profile-pages-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Render settings page.
	 *
	 * @return void
	 */
	public function render_settings_page() {
		// Handle form submission
		if ( isset( $_POST['frs_regenerate_profile_pages'] ) && check_admin_referer( 'frs_regenerate_profile_pages' ) ) {
			$stats = $this->regenerate_all_profile_pages();
			echo '<div class="notice notice-success"><p>';
			printf(
				/* translators: 1: Created count, 2: Skipped count, 3: Failed count */
				esc_html__( 'Profile pages regenerated! Created: %1$d | Skipped: %2$d | Failed: %3$d', 'frs-users' ),
				$stats['created'],
				$stats['skipped'],
				$stats['failed']
			);
			echo '</p></div>';
		}

		// Get template posts
		$templates = get_posts(
			array(
				'post_type'      => 'frs_profile_template',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Profile Pages Settings', 'frs-users' ); ?></h1>

			<div class="card" style="max-width: 800px;">
				<h2><?php esc_html_e( 'Available Profile Page Templates', 'frs-users' ); ?></h2>
				<p><?php esc_html_e( 'These templates are used when generating profile pages for each user. Edit templates using the block editor.', 'frs-users' ); ?></p>

				<?php if ( ! empty( $templates ) ) : ?>
					<table class="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th style="width: 40%;"><?php esc_html_e( 'Template Name', 'frs-users' ); ?></th>
								<th style="width: 20%;"><?php esc_html_e( 'Status', 'frs-users' ); ?></th>
								<th style="width: 20%;"><?php esc_html_e( 'Last Modified', 'frs-users' ); ?></th>
								<th style="width: 20%;"><?php esc_html_e( 'Actions', 'frs-users' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $templates as $template ) : ?>
								<tr>
									<td><strong><?php echo esc_html( $template->post_title ); ?></strong></td>
									<td>
										<?php
										$status_labels = array(
											'publish' => __( 'Published', 'frs-users' ),
											'draft'   => __( 'Draft', 'frs-users' ),
											'pending' => __( 'Pending', 'frs-users' ),
										);
										echo esc_html( $status_labels[ $template->post_status ] ?? $template->post_status );
										?>
									</td>
									<td><?php echo esc_html( get_the_modified_date( '', $template ) ); ?></td>
									<td>
										<a href="<?php echo esc_url( admin_url( 'post.php?post=' . $template->ID . '&action=edit' ) ); ?>">
											<?php esc_html_e( 'Edit', 'frs-users' ); ?>
										</a>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php else : ?>
					<p><?php esc_html_e( 'No templates found. Default templates will be created automatically when needed.', 'frs-users' ); ?></p>
				<?php endif; ?>

				<p>
					<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=frs_profile_template' ) ); ?>" class="button">
						<?php esc_html_e( 'View All Templates', 'frs-users' ); ?>
					</a>
					<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=frs_profile_template' ) ); ?>" class="button button-primary">
						<?php esc_html_e( 'Add New Template', 'frs-users' ); ?>
					</a>
				</p>
			</div>

			<div class="card" style="max-width: 800px; margin-top: 20px;">
				<h2><?php esc_html_e( 'Regenerate Profile Pages', 'frs-users' ); ?></h2>
				<p><?php esc_html_e( 'Regenerate profile pages for all users. This will create missing pages for existing profiles.', 'frs-users' ); ?></p>
				<p><strong><?php esc_html_e( 'Note:', 'frs-users' ); ?></strong> <?php esc_html_e( 'This will not delete existing pages, only create missing ones.', 'frs-users' ); ?></p>

				<form method="post">
					<?php wp_nonce_field( 'frs_regenerate_profile_pages' ); ?>
					<p>
						<input type="submit" name="frs_regenerate_profile_pages" class="button button-primary" value="<?php esc_attr_e( 'Regenerate Profile Pages', 'frs-users' ); ?>">
					</p>
				</form>
			</div>

			<div class="card" style="max-width: 800px; margin-top: 20px;">
				<h2><?php esc_html_e( 'How It Works', 'frs-users' ); ?></h2>
				<ol>
					<li><?php esc_html_e( 'Each user profile automatically gets profile pages created based on available templates.', 'frs-users' ); ?></li>
					<li><?php esc_html_e( 'Profile pages are visible in the "Profile Pages" tab of each user profile.', 'frs-users' ); ?></li>
					<li><?php esc_html_e( 'Each page includes the "Profile Page" block which dynamically displays user data.', 'frs-users' ); ?></li>
					<li><?php esc_html_e( 'Templates can be managed using the taxonomy system.', 'frs-users' ); ?></li>
				</ol>
			</div>
		</div>
		<?php
	}

	/**
	 * Regenerate profile pages for all users.
	 *
	 * @return array Stats array with created, skipped, failed counts.
	 */
	private function regenerate_all_profile_pages() {
		$stats = array(
			'created' => 0,
			'skipped' => 0,
			'failed'  => 0,
		);

		// Clear all transients to force regeneration
		global $wpdb;
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_frs_profile_pages_generated_%'" );
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_frs_profile_pages_generated_%'" );

		// Get all profiles and generate pages
		if ( ! class_exists( 'FRSUsers\\Models\\Profile' ) || ! class_exists( 'FRSUsers\\Controllers\\PostTypes' ) ) {
			return $stats;
		}

		$profiles   = \FRSUsers\Models\Profile::all();
		$post_types = PostTypes::get_instance();

		foreach ( $profiles as $profile ) {
			// Check if pages already exist
			$existing_pages = get_posts(
				array(
					'post_type'   => 'frs_user_profile',
					'post_status' => 'any',
					'numberposts' => 1,
					'meta_query'  => array(
						array(
							'key'   => '_profile_id',
							'value' => $profile->id,
						),
					),
				)
			);

			if ( ! empty( $existing_pages ) ) {
				$stats['skipped']++;
				continue;
			}

			// Use reflection to call private method
			try {
				$method = new \ReflectionMethod( $post_types, 'generate_profile_pages_for_profile' );
				$method->setAccessible( true );
				$method->invoke( $post_types, $profile->id, $profile->full_name );
				$stats['created']++;
			} catch ( \Exception $e ) {
				error_log( 'FRS Users: Failed to generate pages for profile ' . $profile->id . ': ' . $e->getMessage() );
				$stats['failed']++;
			}
		}

		return $stats;
	}
}
