<?php
/**
 * Profile Merge Selection Template
 *
 * Template for selecting a profile to merge with.
 *
 * @package FRSUsers
 * @var Profile $profile The first profile to merge
 * @var Profile[] $profiles Available profiles to merge with
 * @var string $search Current search query
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Select Profile to Merge With', 'frs-users' ); ?></h1>

	<div class="notice notice-info">
		<p>
			<strong><?php esc_html_e( 'Step 1 of 2:', 'frs-users' ); ?></strong>
			<?php esc_html_e( 'Select which profile you want to merge with the profile below. You\'ll then be able to choose which data to keep from each profile.', 'frs-users' ); ?>
		</p>
	</div>

	<!-- First Profile Card -->
	<div style="background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 20px; margin: 20px 0;">
		<h2 style="margin-top: 0;"><?php esc_html_e( 'Merging Profile:', 'frs-users' ); ?></h2>
		<div style="display: flex; align-items: center; gap: 15px;">
			<?php if ( $profile->headshot_id ) : ?>
				<?php echo wp_get_attachment_image( $profile->headshot_id, 'thumbnail', false, array( 'style' => 'width: 80px; height: 80px; border-radius: 50%; object-fit: cover;' ) ); ?>
			<?php else : ?>
				<div style="width: 80px; height: 80px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #666;">
					<?php echo esc_html( strtoupper( substr( $profile->first_name, 0, 1 ) ) ); ?>
				</div>
			<?php endif; ?>
			<div>
				<h3 style="margin: 0;"><?php echo esc_html( $profile->first_name . ' ' . $profile->last_name ); ?></h3>
				<p style="margin: 5px 0; color: #666;">
					<strong><?php esc_html_e( 'Email:', 'frs-users' ); ?></strong> <?php echo esc_html( $profile->email ); ?><br>
					<?php if ( $profile->phone_number ) : ?>
						<strong><?php esc_html_e( 'Phone:', 'frs-users' ); ?></strong> <?php echo esc_html( $profile->phone_number ); ?><br>
					<?php endif; ?>
					<?php if ( $profile->job_title ) : ?>
						<strong><?php esc_html_e( 'Title:', 'frs-users' ); ?></strong> <?php echo esc_html( $profile->job_title ); ?>
					<?php endif; ?>
				</p>
			</div>
		</div>
	</div>

	<!-- Search Box -->
	<form method="get" action="">
		<input type="hidden" name="page" value="frs-profile-merge-select">
		<input type="hidden" name="profile_id" value="<?php echo esc_attr( $profile->id ); ?>">
		<p class="search-box">
			<label class="screen-reader-text" for="profile-search-input"><?php esc_html_e( 'Search Profiles:', 'frs-users' ); ?></label>
			<input type="search" id="profile-search-input" name="s" value="<?php echo esc_attr( $search ); ?>" placeholder="<?php esc_attr_e( 'Search by name or email...', 'frs-users' ); ?>">
			<input type="submit" id="search-submit" class="button" value="<?php esc_attr_e( 'Search', 'frs-users' ); ?>">
		</p>
	</form>

	<!-- Available Profiles -->
	<h2><?php esc_html_e( 'Select a Profile to Merge With:', 'frs-users' ); ?></h2>

	<?php if ( empty( $profiles ) ) : ?>
		<div class="notice notice-warning">
			<p><?php esc_html_e( 'No profiles found. Try a different search.', 'frs-users' ); ?></p>
		</div>
	<?php else : ?>
		<table class="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th style="width: 60px;"><?php esc_html_e( 'Photo', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Name', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Email', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Phone', 'frs-users' ); ?></th>
					<th><?php esc_html_e( 'Type', 'frs-users' ); ?></th>
					<th style="width: 120px;"><?php esc_html_e( 'Action', 'frs-users' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $profiles as $available_profile ) : ?>
					<tr>
						<td>
							<?php if ( $available_profile->headshot_id ) : ?>
								<?php echo wp_get_attachment_image( $available_profile->headshot_id, 'thumbnail', false, array( 'style' => 'width: 50px; height: 50px; border-radius: 50%; object-fit: cover;' ) ); ?>
							<?php else : ?>
								<div style="width: 50px; height: 50px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #666;">
									<?php echo esc_html( strtoupper( substr( $available_profile->first_name, 0, 1 ) ) ); ?>
								</div>
							<?php endif; ?>
						</td>
						<td>
							<strong><?php echo esc_html( $available_profile->first_name . ' ' . $available_profile->last_name ); ?></strong>
							<br>
							<small style="color: #666;">ID: <?php echo esc_html( $available_profile->id ); ?></small>
						</td>
						<td><?php echo esc_html( $available_profile->email ); ?></td>
						<td><?php echo esc_html( $available_profile->phone_number ?: '—' ); ?></td>
						<td>
							<?php if ( $available_profile->select_person_type ) : ?>
								<span style="background: #2271b1; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
									<?php echo esc_html( ucwords( str_replace( '_', ' ', $available_profile->select_person_type ) ) ); ?>
								</span>
							<?php else : ?>
								<span style="color: #999;">—</span>
							<?php endif; ?>
						</td>
						<td>
							<?php
							$merge_url = add_query_arg(
								array(
									'page'        => 'frs-profile-merge',
									'profile_ids' => $profile->id . ',' . $available_profile->id,
								),
								admin_url( 'admin.php' )
							);
							?>
							<a href="<?php echo esc_url( $merge_url ); ?>" class="button button-primary">
								<?php esc_html_e( 'Select', 'frs-users' ); ?>
							</a>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<?php if ( count( $profiles ) >= 50 ) : ?>
			<p class="description">
				<?php esc_html_e( 'Showing first 50 results. Use search to narrow down results.', 'frs-users' ); ?>
			</p>
		<?php endif; ?>
	<?php endif; ?>

	<p style="margin-top: 20px;">
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profiles' ) ); ?>" class="button">
			<?php esc_html_e( 'Cancel', 'frs-users' ); ?>
		</a>
	</p>
</div>

<style>
.search-box {
	margin: 20px 0;
}
.search-box input[type="search"] {
	width: 300px;
	padding: 5px 10px;
}
</style>
