<?php
/**
 * Profile View Page
 *
 * Displays full profile information in read-only view.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;

/**
 * Class ProfileView
 *
 * Displays complete profile information.
 *
 * @package FRSUsers\Admin
 */
class ProfileView {

	/**
	 * Render the view page
	 *
	 * @param int $profile_id Profile ID to view.
	 * @return void
	 */
	public static function render( $profile_id ) {
		$profile = Profile::find( $profile_id );

		if ( ! $profile ) {
			wp_die( __( 'Profile not found', 'frs-users' ) );
		}

		$edit_url = add_query_arg(
			array(
				'page'       => 'frs-users-profiles',
				'action'     => 'edit',
				'profile_id' => $profile_id,
			),
			admin_url( 'admin.php' )
		);

		// Helper to decode JSON
		$decode_json = function( $value ) {
			if ( is_string( $value ) ) {
				$decoded = json_decode( $value, true );
				return is_array( $decoded ) ? $decoded : array();
			}
			return is_array( $value ) ? $value : array();
		};

		?>
		<div class="wrap">
			<h1><?php echo esc_html( $profile->first_name . ' ' . $profile->last_name ); ?>
				<a href="<?php echo esc_url( $edit_url ); ?>" class="page-title-action"><?php _e( 'Edit', 'frs-users' ); ?></a>
				<a href="<?php echo admin_url( 'admin.php?page=frs-users-profiles' ); ?>" class="page-title-action"><?php _e( 'Back to List', 'frs-users' ); ?></a>
			</h1>

			<div class="profile-view-container" style="max-width: 1200px;">

				<!-- Header Card with Photo -->
				<div class="card" style="margin-top: 20px; padding: 20px; display: flex; gap: 30px; align-items: start;">
					<div class="profile-photo">
						<?php if ( $profile->headshot_id ) : ?>
							<?php echo wp_get_attachment_image( $profile->headshot_id, 'medium', false, array( 'style' => 'border-radius: 8px; max-width: 200px;' ) ); ?>
						<?php else : ?>
							<div style="width: 200px; height: 200px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 72px; color: #666;">
								<?php echo strtoupper( substr( $profile->first_name, 0, 1 ) ); ?>
							</div>
						<?php endif; ?>
					</div>

					<div class="profile-header-info" style="flex: 1;">
						<h2 style="margin-top: 0;"><?php echo esc_html( $profile->first_name . ' ' . $profile->last_name ); ?></h2>

						<?php if ( $profile->job_title ) : ?>
							<p style="font-size: 16px; color: #666; margin: 5px 0;">
								<?php echo esc_html( $profile->job_title ); ?>
							</p>
						<?php endif; ?>

						<?php
						$profile_types = $profile->get_types();
						if ( ! empty( $profile_types ) ) :
							?>
							<div style="margin: 15px 0;">
								<?php foreach ( $profile_types as $type ) : ?>
									<span class="profile-type-badge" style="background: #2271b1; color: white; padding: 4px 10px; border-radius: 3px; margin-right: 5px; font-size: 12px; display: inline-block;">
										<?php echo esc_html( ucwords( str_replace( '_', ' ', $type ) ) ); ?>
									</span>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>

						<?php if ( $profile->is_guest() ) : ?>
							<span class="profile-only-badge" style="background: #f0ad4e; color: white; padding: 5px 12px; border-radius: 3px; font-size: 12px; display: inline-block; margin-top: 10px;">
								<?php _e( 'Profile Only', 'frs-users' ); ?>
							</span>
						<?php else : ?>
							<?php $user = get_user_by( 'id', $profile->user_id ); ?>
							<?php if ( $user ) : ?>
								<span class="profile-plus-badge" style="background: #5cb85c; color: white; padding: 5px 12px; border-radius: 3px; font-size: 12px; display: inline-block; margin-top: 10px;">
									<?php printf( __( 'Profile+ (@%s)', 'frs-users' ), $user->user_login ); ?>
								</span>
							<?php endif; ?>
						<?php endif; ?>
					</div>
				</div>

				<!-- Contact Information -->
				<div class="card" style="margin-top: 20px; padding: 20px;">
					<h2><?php _e( 'Contact Information', 'frs-users' ); ?></h2>
					<table class="widefat fixed striped">
						<tbody>
							<tr>
								<th style="width: 200px;"><?php _e( 'Email', 'frs-users' ); ?></th>
								<td><a href="mailto:<?php echo esc_attr( $profile->email ); ?>"><?php echo esc_html( $profile->email ); ?></a></td>
							</tr>
							<?php if ( $profile->phone_number ) : ?>
								<tr>
									<th><?php _e( 'Phone Number', 'frs-users' ); ?></th>
									<td><a href="tel:<?php echo esc_attr( $profile->phone_number ); ?>"><?php echo esc_html( $profile->phone_number ); ?></a></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->mobile_number ) : ?>
								<tr>
									<th><?php _e( 'Mobile Number', 'frs-users' ); ?></th>
									<td><a href="tel:<?php echo esc_attr( $profile->mobile_number ); ?>"><?php echo esc_html( $profile->mobile_number ); ?></a></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->office ) : ?>
								<tr>
									<th><?php _e( 'Office', 'frs-users' ); ?></th>
									<td><?php echo esc_html( $profile->office ); ?></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->city_state ) : ?>
								<tr>
									<th><?php _e( 'City, State', 'frs-users' ); ?></th>
									<td><?php echo esc_html( $profile->city_state ); ?></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->region ) : ?>
								<tr>
									<th><?php _e( 'Region', 'frs-users' ); ?></th>
									<td><?php echo esc_html( $profile->region ); ?></td>
								</tr>
							<?php endif; ?>
						</tbody>
					</table>
				</div>

				<!-- Professional Information -->
				<div class="card" style="margin-top: 20px; padding: 20px;">
					<h2><?php _e( 'Professional Information', 'frs-users' ); ?></h2>
					<table class="widefat fixed striped">
						<tbody>
							<?php if ( $profile->biography ) : ?>
								<tr>
									<th style="width: 200px;"><?php _e( 'Biography', 'frs-users' ); ?></th>
									<td><?php echo wpautop( wp_kses_post( $profile->biography ) ); ?></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->nmls ) : ?>
								<tr>
									<th><?php _e( 'NMLS', 'frs-users' ); ?></th>
									<td><code><?php echo esc_html( $profile->nmls ); ?></code></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->nmls_number ) : ?>
								<tr>
									<th><?php _e( 'NMLS Number', 'frs-users' ); ?></th>
									<td><code><?php echo esc_html( $profile->nmls_number ); ?></code></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->license_number ) : ?>
								<tr>
									<th><?php _e( 'License Number', 'frs-users' ); ?></th>
									<td><code><?php echo esc_html( $profile->license_number ); ?></code></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->dre_license ) : ?>
								<tr>
									<th><?php _e( 'DRE License', 'frs-users' ); ?></th>
									<td><code><?php echo esc_html( $profile->dre_license ); ?></code></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->brand ) : ?>
								<tr>
									<th><?php _e( 'Brand', 'frs-users' ); ?></th>
									<td><?php echo esc_html( $profile->brand ); ?></td>
								</tr>
							<?php endif; ?>
							<?php if ( $profile->status ) : ?>
								<tr>
									<th><?php _e( 'Status', 'frs-users' ); ?></th>
									<td><span class="status-badge" style="background: <?php echo $profile->status === 'active' ? '#5cb85c' : '#d9534f'; ?>; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;"><?php echo esc_html( ucfirst( $profile->status ) ); ?></span></td>
								</tr>
							<?php endif; ?>
							<?php
							$specialties_lo = $decode_json( $profile->specialties_lo );
							if ( ! empty( $specialties_lo ) ) :
								?>
								<tr>
									<th><?php _e( 'Loan Officer Specialties', 'frs-users' ); ?></th>
									<td><?php echo esc_html( implode( ', ', $specialties_lo ) ); ?></td>
								</tr>
							<?php endif; ?>
							<?php
							$languages = $decode_json( $profile->languages );
							if ( ! empty( $languages ) ) :
								?>
								<tr>
									<th><?php _e( 'Languages', 'frs-users' ); ?></th>
									<td><?php echo esc_html( implode( ', ', $languages ) ); ?></td>
								</tr>
							<?php endif; ?>
							<?php
							$nar_designations = $decode_json( $profile->nar_designations );
							if ( ! empty( $nar_designations ) ) :
								?>
								<tr>
									<th><?php _e( 'NAR Designations', 'frs-users' ); ?></th>
									<td><?php echo esc_html( implode( ', ', $nar_designations ) ); ?></td>
								</tr>
							<?php endif; ?>
							<?php
							$namb_certifications = $decode_json( $profile->namb_certifications );
							if ( ! empty( $namb_certifications ) ) :
								?>
								<tr>
									<th><?php _e( 'NAMB Certifications', 'frs-users' ); ?></th>
									<td><?php echo esc_html( implode( ', ', $namb_certifications ) ); ?></td>
								</tr>
							<?php endif; ?>
						</tbody>
					</table>
				</div>

				<!-- Social Media -->
				<?php if ( $profile->facebook_url || $profile->instagram_url || $profile->linkedin_url || $profile->twitter_url || $profile->youtube_url || $profile->tiktok_url ) : ?>
					<div class="card" style="margin-top: 20px; padding: 20px;">
						<h2><?php _e( 'Social Media', 'frs-users' ); ?></h2>
						<table class="widefat fixed striped">
							<tbody>
								<?php if ( $profile->facebook_url ) : ?>
									<tr>
										<th style="width: 200px;"><?php _e( 'Facebook', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->facebook_url ); ?>" target="_blank"><?php echo esc_html( $profile->facebook_url ); ?></a></td>
									</tr>
								<?php endif; ?>
								<?php if ( $profile->instagram_url ) : ?>
									<tr>
										<th><?php _e( 'Instagram', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->instagram_url ); ?>" target="_blank"><?php echo esc_html( $profile->instagram_url ); ?></a></td>
									</tr>
								<?php endif; ?>
								<?php if ( $profile->linkedin_url ) : ?>
									<tr>
										<th><?php _e( 'LinkedIn', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->linkedin_url ); ?>" target="_blank"><?php echo esc_html( $profile->linkedin_url ); ?></a></td>
									</tr>
								<?php endif; ?>
								<?php if ( $profile->twitter_url ) : ?>
									<tr>
										<th><?php _e( 'Twitter', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->twitter_url ); ?>" target="_blank"><?php echo esc_html( $profile->twitter_url ); ?></a></td>
									</tr>
								<?php endif; ?>
								<?php if ( $profile->youtube_url ) : ?>
									<tr>
										<th><?php _e( 'YouTube', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->youtube_url ); ?>" target="_blank"><?php echo esc_html( $profile->youtube_url ); ?></a></td>
									</tr>
								<?php endif; ?>
								<?php if ( $profile->tiktok_url ) : ?>
									<tr>
										<th><?php _e( 'TikTok', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->tiktok_url ); ?>" target="_blank"><?php echo esc_html( $profile->tiktok_url ); ?></a></td>
									</tr>
								<?php endif; ?>
							</tbody>
						</table>
					</div>
				<?php endif; ?>

				<!-- Tools & Platforms -->
				<?php if ( $profile->arrive || $profile->canva_folder_link || $profile->niche_bio_content || $profile->personal_branding_images ) : ?>
					<div class="card" style="margin-top: 20px; padding: 20px;">
						<h2><?php _e( 'Tools & Platforms', 'frs-users' ); ?></h2>
						<table class="widefat fixed striped">
							<tbody>
								<?php if ( $profile->arrive ) : ?>
									<tr>
										<th style="width: 200px;"><?php _e( 'Arrive', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->arrive ); ?>" target="_blank"><?php echo esc_html( $profile->arrive ); ?></a></td>
									</tr>
								<?php endif; ?>
								<?php if ( $profile->canva_folder_link ) : ?>
									<tr>
										<th><?php _e( 'Canva Folder', 'frs-users' ); ?></th>
										<td><a href="<?php echo esc_url( $profile->canva_folder_link ); ?>" target="_blank"><?php echo esc_html( $profile->canva_folder_link ); ?></a></td>
									</tr>
								<?php endif; ?>
							</tbody>
						</table>
					</div>
				<?php endif; ?>

			</div>
		</div>
		<?php
	}
}
