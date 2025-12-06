<?php
/**
 * Profile Merge Template
 *
 * Template for merging duplicate profiles.
 *
 * @package FRSUsers
 * @var Profile[] $profiles Array of profiles to merge.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Merge Profiles', 'frs-users' ); ?></h1>

	<div class="notice notice-info">
		<p>
			<?php esc_html_e( 'Review the fields below and select which value to keep for each field. You can choose from either profile. The selected profile will be kept and others will be deleted after merging.', 'frs-users' ); ?>
		</p>
	</div>

	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" id="merge-form">
		<?php wp_nonce_field( 'frs_merge_profiles', 'frs_merge_nonce' ); ?>
		<input type="hidden" name="action" value="frs_merge_profiles">
		<input type="hidden" name="profile_ids" value="<?php echo esc_attr( implode( ',', array_map( function( $p ) { return $p->id; }, $profiles ) ) ); ?>">
		<input type="hidden" name="primary_profile" id="primary_profile_input" value="<?php echo esc_attr( $profiles[0]->id ); ?>">

		<table class="widefat fixed striped">
			<thead>
				<tr>
					<th style="width: 60px;"><?php esc_html_e( 'Primary', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Photo', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Name', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Email', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Phone', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Type', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Status', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Fields Filled', 'frs-users' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $profiles as $index => $profile ) : ?>
					<?php
					// Count non-empty fields
					$filled_count = 0;
					$total_count = 0;
					$fields = array(
						'frs_agent_id',
						'phone_number',
						'mobile_number',
						'office',
						'headshot_id',
						'job_title',
						'biography',
						'date_of_birth',
						'select_person_type',
						'nmls',
						'nmls_number',
						'license_number',
						'dre_license',
						'brand',
						'city_state',
						'region',
						'facebook_url',
						'instagram_url',
						'linkedin_url',
						'twitter_url',
						'youtube_url',
						'tiktok_url',
						'arrive',
						'canva_folder_link',
						'niche_bio_content',
					);

					foreach ( $fields as $field ) {
						$total_count++;
						if ( ! empty( $profile->$field ) ) {
							$filled_count++;
						}
					}

					$fill_percentage = round( ( $filled_count / $total_count ) * 100 );

					$headshot_url = '';
					if ( $profile->headshot_id ) {
						$headshot_url = wp_get_attachment_image_url( $profile->headshot_id, 'thumbnail' );
					}
					?>
					<tr>
						<td style="text-align: center;">
							<input type="radio" name="primary_profile" value="<?php echo esc_attr( $profile->id ); ?>" <?php checked( 0 === $index ); ?> required>
						</td>
						<td>
							<?php if ( $headshot_url ) : ?>
								<img src="<?php echo esc_url( $headshot_url ); ?>" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" alt="">
							<?php else : ?>
								<div style="width: 50px; height: 50px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #666;">
									<?php echo esc_html( strtoupper( substr( $profile->first_name, 0, 1 ) ) ); ?>
								</div>
							<?php endif; ?>
						</td>
						<td>
							<?php
							$display_name = trim( $profile->first_name . ' ' . $profile->last_name );
							if ( empty( $display_name ) ) {
								$display_name = $profile->email;
							}
							?>
							<strong><?php echo esc_html( $display_name ); ?></strong>
							<br>
							<small style="color: #666;">ID: <?php echo esc_html( $profile->id ); ?></small>
						</td>
						<td><?php echo esc_html( $profile->email ); ?></td>
						<td><?php echo esc_html( $profile->phone_number ?: '—' ); ?></td>
						<td>
							<?php if ( $profile->select_person_type ) : ?>
								<span class="profile-type-badge" style="background: #2271b1; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
									<?php echo esc_html( ucwords( str_replace( '_', ' ', $profile->select_person_type ) ) ); ?>
								</span>
							<?php else : ?>
								<span style="color: #999;">—</span>
							<?php endif; ?>
						</td>
						<td>
							<?php if ( $profile->is_guest() ) : ?>
								<span style="background: #f0ad4e; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
									<?php esc_html_e( 'Guest', 'frs-users' ); ?>
								</span>
							<?php else : ?>
								<span style="background: #5cb85c; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
									<?php
									$user = get_user_by( 'id', $profile->user_id );
									if ( $user ) {
										printf( __( 'User: @%s', 'frs-users' ), $user->user_login );
									}
									?>
								</span>
							<?php endif; ?>
						</td>
						<td>
							<div style="display: flex; align-items: center; gap: 10px;">
								<div style="flex: 1; height: 20px; background: #ddd; border-radius: 10px; overflow: hidden;">
									<div style="width: <?php echo esc_attr( $fill_percentage ); ?>%; height: 100%; background: #2271b1;"></div>
								</div>
								<strong><?php echo esc_html( $fill_percentage ); ?>%</strong>
							</div>
							<small style="color: #666;"><?php echo esc_html( $filled_count . ' / ' . $total_count . ' fields' ); ?></small>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<p class="submit">
			<button type="submit" class="button button-primary button-large">
				<?php esc_html_e( 'Merge Profiles', 'frs-users' ); ?>
			</button>
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profiles' ) ); ?>" class="button button-large">
				<?php esc_html_e( 'Cancel', 'frs-users' ); ?>
			</a>
		</p>

		<div class="notice notice-warning">
			<p>
				<strong><?php esc_html_e( 'Warning:', 'frs-users' ); ?></strong>
				<?php esc_html_e( 'This action cannot be undone. The duplicate profiles will be permanently deleted after merging.', 'frs-users' ); ?>
			</p>
		</div>
	</form>
</div>
