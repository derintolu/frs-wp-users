<?php
/**
 * Profiles List Template
 *
 * Template for displaying the profiles list table.
 *
 * @package FRSUsers
 * @var ProfilesList $list_table WP_List_Table instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="wrap">
	<h1 class="wp-heading-inline"><?php esc_html_e( 'FRS Profiles', 'frs-users' ); ?></h1>
	<a href="<?php echo esc_url( admin_url( 'admin.php?page=frs-profile-edit&id=new' ) ); ?>" class="page-title-action"><?php esc_html_e( 'Add New', 'frs-users' ); ?></a>
	<hr class="wp-header-end">

	<?php
	// Show messages
	if ( isset( $_GET['message'] ) ) {
		if ( 'success' === $_GET['message'] ) {
			?>
			<div class="notice notice-success is-dismissible">
				<p><?php esc_html_e( 'Profile saved successfully.', 'frs-users' ); ?></p>
			</div>
			<?php
		} elseif ( 'deleted' === $_GET['message'] ) {
			?>
			<div class="notice notice-success is-dismissible">
				<p><?php esc_html_e( 'Profile deleted successfully.', 'frs-users' ); ?></p>
			</div>
			<?php
		} elseif ( 'archived' === $_GET['message'] ) {
			?>
			<div class="notice notice-success is-dismissible">
				<p><?php esc_html_e( 'Profile archived successfully.', 'frs-users' ); ?></p>
			</div>
			<?php
		} elseif ( 'unarchived' === $_GET['message'] ) {
			?>
			<div class="notice notice-success is-dismissible">
				<p><?php esc_html_e( 'Profile unarchived successfully.', 'frs-users' ); ?></p>
			</div>
			<?php
		} elseif ( 'merged' === $_GET['message'] ) {
			$count = isset( $_GET['count'] ) ? absint( $_GET['count'] ) : 0;
			?>
			<div class="notice notice-success is-dismissible">
				<p>
					<?php
					printf(
						__( 'Successfully merged %d profiles. Duplicate profiles have been deleted.', 'frs-users' ),
						$count
					);
					?>
				</p>
			</div>
			<?php
		} elseif ( 'pages_generated' === $_GET['message'] ) {
			$created = isset( $_GET['pages_created'] ) ? absint( $_GET['pages_created'] ) : 0;
			$skipped = isset( $_GET['pages_skipped'] ) ? absint( $_GET['pages_skipped'] ) : 0;
			$failed  = isset( $_GET['pages_failed'] ) ? absint( $_GET['pages_failed'] ) : 0;
			?>
			<div class="notice notice-success is-dismissible">
				<p>
					<?php
					printf(
						/* translators: 1: Created count, 2: Skipped count, 3: Failed count */
						__( 'Profile pages generated! Created: %1$d | Skipped: %2$d | Failed: %3$d', 'frs-users' ),
						$created,
						$skipped,
						$failed
					);
					?>
				</p>
			</div>
			<?php
		} elseif ( 'pages_regenerated' === $_GET['message'] ) {
			$created = isset( $_GET['pages_created'] ) ? absint( $_GET['pages_created'] ) : 0;
			$skipped = isset( $_GET['pages_skipped'] ) ? absint( $_GET['pages_skipped'] ) : 0;
			$failed  = isset( $_GET['pages_failed'] ) ? absint( $_GET['pages_failed'] ) : 0;
			?>
			<div class="notice notice-success is-dismissible">
				<p>
					<?php
					printf(
						/* translators: 1: Created count, 2: Skipped count, 3: Failed count */
						__( 'Profile pages regenerated! Created: %1$d | Skipped: %2$d | Failed: %3$d', 'frs-users' ),
						$created,
						$skipped,
						$failed
					);
					?>
				</p>
			</div>
			<?php
		} elseif ( 'no_profiles_selected' === $_GET['message'] ) {
			?>
			<div class="notice notice-error is-dismissible">
				<p><?php esc_html_e( 'Please select at least one profile.', 'frs-users' ); ?></p>
			</div>
			<?php
		}
	}
	?>

	<form method="post">
		<input type="hidden" name="page" value="frs-profiles">
		<?php
		$list_table->display();
		?>
	</form>
</div>

<style>
.profile-type-badge {
	display: inline-block;
	padding: 3px 8px;
	background: #2271b1;
	color: white;
	border-radius: 3px;
	font-size: 11px;
	margin-right: 3px;
	white-space: nowrap;
}

.profile-only-badge {
	background: #f0ad4e;
	color: white;
	padding: 3px 8px;
	border-radius: 3px;
	font-size: 11px;
}

.profile-plus-badge {
	background: #5cb85c;
	color: white;
	padding: 3px 8px;
	border-radius: 3px;
	font-size: 11px;
}

.create-user-btn {
	padding: 3px 8px !important;
	height: auto !important;
	font-size: 11px !important;
}

.delete-profile {
	color: #b32d2e !important;
}

.delete-profile:hover {
	color: #dc3232 !important;
}
</style>

<script>
jQuery(document).ready(function($) {
	// AJAX create user account
	$(document).on('click', '.create-user-btn', function(e) {
		e.preventDefault();

		var $btn = $(this);
		var profileId = $btn.data('profile-id');
		var nonce = $btn.data('nonce');

		$btn.prop('disabled', true).text('<?php esc_html_e( 'Creating...', 'frs-users' ); ?>');

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'frs_create_user_account',
				profile_id: profileId,
				nonce: nonce
			},
			success: function(response) {
				if (response.success) {
					alert(response.data.message);
					location.reload();
				} else {
					alert(response.data.message || '<?php esc_html_e( 'Error creating user account', 'frs-users' ); ?>');
					$btn.prop('disabled', false).text('<?php esc_html_e( 'Create User Account', 'frs-users' ); ?>');
				}
			},
			error: function() {
				alert('<?php esc_html_e( 'Error creating user account', 'frs-users' ); ?>');
				$btn.prop('disabled', false).text('<?php esc_html_e( 'Create User Account', 'frs-users' ); ?>');
			}
		});
	});

	// Confirm delete
	$(document).on('click', '.delete-profile', function(e) {
		if (!confirm('<?php esc_html_e( 'Are you sure you want to delete this profile?', 'frs-users' ); ?>')) {
			e.preventDefault();
			return false;
		}
	});
});
</script>
