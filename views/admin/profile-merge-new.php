<?php
/**
 * Profile Merge Template - Field-by-Field Selection
 *
 * @package FRSUsers
 * @var Profile[] $profiles Array of profiles to merge (limit 2 for now)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// For simplicity, we'll handle 2 profiles at a time
$profile1 = $profiles[0];
$profile2 = $profiles[1];

// Define fields to compare
$fields = array(
	'Contact Information' => array(
		'email'          => 'Email',
		'first_name'     => 'First Name',
		'last_name'      => 'Last Name',
		'phone_number'   => 'Phone Number',
		'mobile_number'  => 'Mobile Number',
		'office'         => 'Office',
		'headshot_id'    => 'Profile Photo',
	),
	'Professional Details' => array(
		'select_person_type' => 'Person Type',
		'job_title'          => 'Job Title',
		'nmls'               => 'NMLS',
		'nmls_number'        => 'NMLS Number',
		'license_number'     => 'License Number',
		'dre_license'        => 'DRE License',
		'brand'              => 'Brand',
	),
	'Location' => array(
		'city_state' => 'City/State',
		'region'     => 'Region',
	),
	'Social Media' => array(
		'facebook_url'  => 'Facebook',
		'instagram_url' => 'Instagram',
		'linkedin_url'  => 'LinkedIn',
		'twitter_url'   => 'Twitter',
		'youtube_url'   => 'YouTube',
		'tiktok_url'    => 'TikTok',
	),
);
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Merge Profiles', 'frs-users' ); ?></h1>

	<div class="notice notice-info">
		<p>
			<strong><?php esc_html_e( 'Instructions:', 'frs-users' ); ?></strong>
			<?php esc_html_e( 'For each field below, select which value you want to keep. The merged profile will use your selections. Both original profiles will be deleted and replaced with the merged result.', 'frs-users' ); ?>
		</p>
	</div>

	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" id="merge-form">
		<?php wp_nonce_field( 'frs_merge_profiles', 'frs_merge_nonce' ); ?>
		<input type="hidden" name="action" value="frs_merge_profiles">
		<input type="hidden" name="profile_ids" value="<?php echo esc_attr( $profile1->id . ',' . $profile2->id ); ?>">

		<h2><?php esc_html_e( 'Profile Comparison', 'frs-users' ); ?></h2>

		<?php foreach ( $fields as $section_name => $section_fields ) : ?>
			<h3><?php echo esc_html( $section_name ); ?></h3>
			<table class="widefat merge-table">
				<thead>
					<tr>
						<th style="width: 25%;"><?php esc_html_e( 'Field', 'frs-users' ); ?></th>
						<th style="width: 37.5%;">
							<?php echo esc_html( $profile1->first_name . ' ' . $profile1->last_name ); ?>
							<br><small style="color: #666;"><?php echo esc_html( $profile1->email ); ?></small>
						</th>
						<th style="width: 37.5%;">
							<?php echo esc_html( $profile2->first_name . ' ' . $profile2->last_name ); ?>
							<br><small style="color: #666;"><?php echo esc_html( $profile2->email ); ?></small>
						</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $section_fields as $field_key => $field_label ) : ?>
						<?php
						$value1 = $profile1->$field_key ?? '';
						$value2 = $profile2->$field_key ?? '';


					// Special handling for headshot_id (show image preview)
					if ( $field_key === 'headshot_id' ) {
						$display1 = ! empty( $value1 ) ? wp_get_attachment_image( $value1, 'thumbnail' ) : '<em style="color: #999;">No photo</em>';
						$display2 = ! empty( $value2 ) ? wp_get_attachment_image( $value2, 'thumbnail' ) : '<em style="color: #999;">No photo</em>';
					} else {
						// Display values
						$display1 = ! empty( $value1 ) ? $value1 : '<em style="color: #999;">Empty</em>';
						$display2 = ! empty( $value2 ) ? $value2 : '<em style="color: #999;">Empty</em>';
					}

						// Determine default selection (prefer non-empty)
						$default_profile = ! empty( $value1 ) ? $profile1->id : $profile2->id;
						if ( ! empty( $value1 ) && ! empty( $value2 ) ) {
							// Both have values, default to profile 1
							$default_profile = $profile1->id;
						}
						?>
						<tr>
							<th scope="row"><?php echo esc_html( $field_label ); ?></th>
							<td>
								<label style="display: flex; align-items: center; cursor: pointer;">
									<input type="radio"
										name="field[<?php echo esc_attr( $field_key ); ?>]"
										value="<?php echo esc_attr( $profile1->id ); ?>"
										<?php checked( $default_profile, $profile1->id ); ?>
										style="margin-right: 8px;">
									<span><?php echo wp_kses_post( $display1 ); ?></span>
								</label>
							</td>
							<td>
								<label style="display: flex; align-items: center; cursor: pointer;">
									<input type="radio"
										name="field[<?php echo esc_attr( $field_key ); ?>]"
										value="<?php echo esc_attr( $profile2->id ); ?>"
										<?php checked( $default_profile, $profile2->id ); ?>
										style="margin-right: 8px;">
									<span><?php echo wp_kses_post( $display2 ); ?></span>
								</label>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<br>
		<?php endforeach; ?>

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
				<?php esc_html_e( 'This action cannot be undone. Both original profiles will be permanently deleted and replaced with your merged result.', 'frs-users' ); ?>
			</p>
		</div>
	</form>
</div>

<style>
.merge-table {
	border: 1px solid #ddd;
}
.merge-table th,
.merge-table td {
	padding: 12px;
}
.merge-table tbody tr:hover {
	background: #f9f9f9;
}
.merge-table input[type="radio"]:checked + span {
	font-weight: bold;
	color: #2271b1;
}
.merge-table label {
	padding: 4px 8px;
	border-radius: 3px;
	transition: background 0.2s;
}
.merge-table label:hover {
	background: #f0f0f0;
}
.merge-table label.selected {
	background: #e8f4fd;
	border-left: 3px solid #2271b1;
	padding-left: 5px;
}
</style>

<script>
jQuery(document).ready(function($) {
	// Highlight selected values
	$('.merge-table input[type="radio"]').on('change', function() {
		var $row = $(this).closest('tr');
		$row.find('input[type="radio"]').each(function() {
			$(this).parent('label').removeClass('selected');
		});
		$(this).parent('label').addClass('selected');
	});

	// Initialize highlighting for default selections
	$('.merge-table input[type="radio"]:checked').each(function() {
		$(this).parent('label').addClass('selected');
	});
});
</script>
