<?php
/**
 * Profile Import/Export Admin Page
 *
 * Handles CSV import and export of profile data with field selection.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 1.0.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;

defined( 'ABSPATH' ) || exit;

/**
 * Class ProfileImportExport
 *
 * Manages CSV import and export of profiles with field selection.
 *
 * @package FRSUsers\Admin
 */
class ProfileImportExport {

	/**
	 * Generate arrive link from NMLS number
	 *
	 * @param string|int $nmls NMLS number.
	 * @return string Arrive registration URL.
	 */
	private static function generate_arrive_link( $nmls ) {
		if ( empty( $nmls ) ) {
			return '';
		}

		return 'https://21stcenturylending.my1003app.com/' . sanitize_text_field( $nmls ) . '/register';
	}

	/**
	 * Download image from URL and import to media library
	 *
	 * @param string $image_url Image URL.
	 * @return int|false Attachment ID on success, false on failure.
	 */
	private static function import_image_from_url( $image_url ) {
		if ( empty( $image_url ) ) {
			return false;
		}

		// Validate URL
		$image_url = esc_url_raw( $image_url );
		if ( ! filter_var( $image_url, FILTER_VALIDATE_URL ) ) {
			return false;
		}

		// Download image
		$tmp = download_url( $image_url );
		if ( is_wp_error( $tmp ) ) {
			return false;
		}

		// Get file info
		$file_array = array(
			'name'     => basename( wp_parse_url( $image_url, PHP_URL_PATH ) ),
			'tmp_name' => $tmp,
		);

		// Import to media library
		$attachment_id = media_handle_sideload( $file_array, 0 );

		// Clean up temp file if upload failed
		if ( is_wp_error( $attachment_id ) ) {
			@unlink( $file_array['tmp_name'] );
			return false;
		}

		return $attachment_id;
	}

	/**
	 * All available profile fields for export
	 *
	 * @return array
	 */
	private static function get_available_fields() {
		return array(
			'id'                      => __( 'Profile ID', 'frs-users' ),
			'user_id'                 => __( 'User ID', 'frs-users' ),
			'first_name'              => __( 'First Name', 'frs-users' ),
			'last_name'               => __( 'Last Name', 'frs-users' ),
			'email'                   => __( 'Email', 'frs-users' ),
			'phone_number'            => __( 'Phone Number', 'frs-users' ),
			'mobile_number'           => __( 'Mobile Number', 'frs-users' ),
			'office'                  => __( 'Office', 'frs-users' ),
			'headshot_id'             => __( 'Headshot ID', 'frs-users' ),
			'avatar_url'              => __( 'Avatar/Headshot URL', 'frs-users' ),
			'job_title'               => __( 'Job Title', 'frs-users' ),
			'biography'               => __( 'Biography', 'frs-users' ),
			'date_of_birth'           => __( 'Date of Birth', 'frs-users' ),
			'nmls'                    => __( 'NMLS', 'frs-users' ),
			'nmls_number'             => __( 'NMLS Number', 'frs-users' ),
			'license_number'          => __( 'License Number', 'frs-users' ),
			'dre_license'             => __( 'DRE License', 'frs-users' ),
			'brand'                   => __( 'Brand', 'frs-users' ),
			'city_state'              => __( 'City, State', 'frs-users' ),
			'region'                  => __( 'Region', 'frs-users' ),
			'facebook_url'            => __( 'Facebook URL', 'frs-users' ),
			'instagram_url'           => __( 'Instagram URL', 'frs-users' ),
			'linkedin_url'            => __( 'LinkedIn URL', 'frs-users' ),
			'twitter_url'             => __( 'Twitter URL', 'frs-users' ),
			'youtube_url'             => __( 'YouTube URL', 'frs-users' ),
			'tiktok_url'              => __( 'TikTok URL', 'frs-users' ),
			'arrive'                  => __( 'Arrive Link', 'frs-users' ),
			'canva_folder_link'       => __( 'Canva Folder Link', 'frs-users' ),
			'status'                  => __( 'Status', 'frs-users' ),
			'created_at'              => __( 'Created At', 'frs-users' ),
			'updated_at'              => __( 'Updated At', 'frs-users' ),
		);
	}

	/**
	 * Render the import/export page
	 *
	 * @return void
	 */
	public static function render() {
		// Handle export
		if ( isset( $_POST['frs_export'] ) && check_admin_referer( 'frs_export_profiles' ) ) {
			self::handle_export();
			return;
		}

		// Handle import
		if ( isset( $_POST['frs_import'] ) && check_admin_referer( 'frs_import_profiles' ) ) {
			self::handle_import();
		}

		self::render_page();
	}

	/**
	 * Render the page HTML
	 *
	 * @return void
	 */
	private static function render_page() {
		$tab = isset( $_GET['tab'] ) ? sanitize_text_field( $_GET['tab'] ) : 'export';
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Import / Export Profiles', 'frs-users' ); ?></h1>

			<nav class="nav-tab-wrapper">
				<a href="?page=frs-profile-import-export&tab=export" class="nav-tab <?php echo $tab === 'export' ? 'nav-tab-active' : ''; ?>">
					<?php esc_html_e( 'Export', 'frs-users' ); ?>
				</a>
				<a href="?page=frs-profile-import-export&tab=import" class="nav-tab <?php echo $tab === 'import' ? 'nav-tab-active' : ''; ?>">
					<?php esc_html_e( 'Import', 'frs-users' ); ?>
				</a>
			</nav>

			<div class="tab-content" style="margin-top: 20px;">
				<?php
				if ( $tab === 'export' ) {
					self::render_export_tab();
				} else {
					self::render_import_tab();
				}
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render export tab
	 *
	 * @return void
	 */
	private static function render_export_tab() {
		$fields      = self::get_available_fields();
		$total_count = Profile::count();
		?>
		<div class="card" style="max-width: 800px;">
			<h2><?php esc_html_e( 'Export Profiles to CSV', 'frs-users' ); ?></h2>
			<p><?php echo sprintf( __( 'Export %d profiles to CSV. Select the fields you want to include.', 'frs-users' ), $total_count ); ?></p>

			<form method="post" action="">
				<?php wp_nonce_field( 'frs_export_profiles' ); ?>

				<h3><?php esc_html_e( 'Select Fields to Export', 'frs-users' ); ?></h3>

				<p>
					<button type="button" id="select-all-fields" class="button"><?php esc_html_e( 'Select All', 'frs-users' ); ?></button>
					<button type="button" id="deselect-all-fields" class="button"><?php esc_html_e( 'Deselect All', 'frs-users' ); ?></button>
				</p>

				<div style="column-count: 3; column-gap: 20px; margin: 20px 0;">
					<?php foreach ( $fields as $key => $label ) : ?>
						<label style="display: block; margin-bottom: 8px; break-inside: avoid;">
							<input type="checkbox" name="export_fields[]" value="<?php echo esc_attr( $key ); ?>"
								<?php checked( in_array( $key, array( 'first_name', 'last_name', 'email', 'phone_number', 'nmls', 'arrive', 'avatar_url' ) ) ); ?>>
							<?php echo esc_html( $label ); ?>
						</label>
					<?php endforeach; ?>
				</div>

				<hr>

				<h3><?php esc_html_e( 'Filter Options', 'frs-users' ); ?></h3>

				<p>
					<label>
						<input type="checkbox" name="export_active_only" value="1">
						<?php esc_html_e( 'Export active profiles only', 'frs-users' ); ?>
					</label>
				</p>

				<p>
					<label>
						<input type="checkbox" name="export_with_users_only" value="1">
						<?php esc_html_e( 'Export profiles with WordPress users only', 'frs-users' ); ?>
					</label>
				</p>

				<hr>

				<p class="submit">
					<button type="submit" name="frs_export" class="button button-primary">
						<?php esc_html_e( 'Export to CSV', 'frs-users' ); ?>
					</button>
				</p>
			</form>
		</div>

		<script>
		document.getElementById('select-all-fields').addEventListener('click', function() {
			document.querySelectorAll('input[name="export_fields[]"]').forEach(function(checkbox) {
				checkbox.checked = true;
			});
		});

		document.getElementById('deselect-all-fields').addEventListener('click', function() {
			document.querySelectorAll('input[name="export_fields[]"]').forEach(function(checkbox) {
				checkbox.checked = false;
			});
		});
		</script>
		<?php
	}

	/**
	 * Render import tab
	 *
	 * @return void
	 */
	private static function render_import_tab() {
		?>
		<div class="card" style="max-width: 800px;">
			<h2><?php esc_html_e( 'Import Profiles from CSV', 'frs-users' ); ?></h2>
			<p><?php esc_html_e( 'Upload a CSV file to import profiles. The first row should contain column headers.', 'frs-users' ); ?></p>

			<form method="post" action="" enctype="multipart/form-data">
				<?php wp_nonce_field( 'frs_import_profiles' ); ?>

				<table class="form-table">
					<tr>
						<th scope="row">
							<label for="import_file"><?php esc_html_e( 'CSV File', 'frs-users' ); ?></label>
						</th>
						<td>
							<input type="file" name="import_file" id="import_file" accept=".csv" required>
							<p class="description"><?php esc_html_e( 'Select a CSV file to upload.', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Update Existing', 'frs-users' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="update_existing" value="1" checked>
								<?php esc_html_e( 'Update existing profiles if email matches', 'frs-users' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'If unchecked, existing profiles will be skipped.', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Create Users', 'frs-users' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="create_users" value="1">
								<?php esc_html_e( 'Create WordPress user accounts for profiles without users', 'frs-users' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'Users will be created with role "subscriber" if not specified.', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Auto-Generate', 'frs-users' ); ?></th>
						<td>
							<p>
								<strong><?php esc_html_e( 'Arrive links will be automatically generated', 'frs-users' ); ?></strong>
								<?php esc_html_e( 'if arrive field is empty and NMLS is present.', 'frs-users' ); ?>
							</p>
							<p class="description">
								<?php esc_html_e( 'Pattern: https://21stcenturylending.my1003app.com/{NMLS}/register', 'frs-users' ); ?>
							</p>
						</td>
					</tr>
				</table>

				<hr>

				<h3><?php esc_html_e( 'CSV Format', 'frs-users' ); ?></h3>
				<p><?php esc_html_e( 'Your CSV should have column headers matching field names:', 'frs-users' ); ?></p>
				<code style="display: block; padding: 10px; background: #f5f5f5; margin: 10px 0;">
					first_name,last_name,email,phone_number,nmls,arrive<br>
					John,Doe,john@example.com,555-1234,123456,https://arrive.com/123456
				</code>

				<p><?php esc_html_e( 'Available field names:', 'frs-users' ); ?></p>
				<div style="column-count: 3; column-gap: 20px; font-size: 12px;">
					<?php foreach ( array_keys( self::get_available_fields() ) as $field ) : ?>
						<div style="break-inside: avoid; margin-bottom: 4px;">
							<code><?php echo esc_html( $field ); ?></code>
						</div>
					<?php endforeach; ?>
				</div>

				<hr>

				<p class="submit">
					<button type="submit" name="frs_import" class="button button-primary">
						<?php esc_html_e( 'Import CSV', 'frs-users' ); ?>
					</button>
				</p>
			</form>
		</div>
		<?php
	}

	/**
	 * Handle CSV export
	 *
	 * @return void
	 */
	private static function handle_export() {
		$fields = isset( $_POST['export_fields'] ) && is_array( $_POST['export_fields'] )
			? array_map( 'sanitize_text_field', $_POST['export_fields'] )
			: array();

		if ( empty( $fields ) ) {
			wp_die( esc_html__( 'Please select at least one field to export.', 'frs-users' ) );
		}

		// Build query
		$query = Profile::query();

		// Apply filters
		if ( isset( $_POST['export_active_only'] ) ) {
			$query->where( 'status', 'active' );
		}

		if ( isset( $_POST['export_with_users_only'] ) ) {
			$query->whereNotNull( 'user_id' );
		}

		$profiles = $query->get();

		// Generate CSV
		$filename = 'frs-profiles-export-' . date( 'Y-m-d-His' ) . '.csv';

		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=' . $filename );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		$output = fopen( 'php://output', 'w' );

		// Write header row
		fputcsv( $output, $fields );

		// Write data rows
		foreach ( $profiles as $profile ) {
			$row = array();
			foreach ( $fields as $field ) {
				// Special handling for avatar_url - get URL from headshot_id
				if ( 'avatar_url' === $field ) {
					$row[] = ! empty( $profile->headshot_id ) ? wp_get_attachment_url( $profile->headshot_id ) : '';
				} else {
					$row[] = isset( $profile->$field ) ? $profile->$field : '';
				}
			}
			fputcsv( $output, $row );
		}

		fclose( $output );
		exit;
	}

	/**
	 * Handle CSV import
	 *
	 * @return void
	 */
	private static function handle_import() {
		if ( empty( $_FILES['import_file']['tmp_name'] ) ) {
			add_action( 'admin_notices', function() {
				echo '<div class="notice notice-error"><p>' . esc_html__( 'Please select a file to import.', 'frs-users' ) . '</p></div>';
			} );
			return;
		}

		$file = $_FILES['import_file']['tmp_name'];
		$update_existing = isset( $_POST['update_existing'] );
		$create_users    = isset( $_POST['create_users'] );

		$handle = fopen( $file, 'r' );
		if ( ! $handle ) {
			add_action( 'admin_notices', function() {
				echo '<div class="notice notice-error"><p>' . esc_html__( 'Could not read the uploaded file.', 'frs-users' ) . '</p></div>';
			} );
			return;
		}

		// Read header row
		$headers = fgetcsv( $handle );
		if ( ! $headers ) {
			fclose( $handle );
			add_action( 'admin_notices', function() {
				echo '<div class="notice notice-error"><p>' . esc_html__( 'CSV file is empty or invalid.', 'frs-users' ) . '</p></div>';
			} );
			return;
		}

		$imported = 0;
		$updated  = 0;
		$skipped  = 0;
		$errors   = 0;

		// Process rows
		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			if ( count( $row ) !== count( $headers ) ) {
				++$errors;
				continue;
			}

			// Combine headers with values
			$data = array_combine( $headers, $row );

			// Email is required
			if ( empty( $data['email'] ) ) {
				++$errors;
				continue;
			}

			// Check if profile exists
			$existing = Profile::where( 'email', $data['email'] )->first();

			if ( $existing ) {
				if ( $update_existing ) {
					// Update existing profile
					foreach ( $data as $key => $value ) {
						if ( $key !== 'id' && $key !== 'created_at' && $key !== 'avatar_url' ) {
							$existing->$key = $value;
						}
					}

					// Handle avatar_url - download and import image
					if ( ! empty( $data['avatar_url'] ) ) {
						$attachment_id = self::import_image_from_url( $data['avatar_url'] );
						if ( $attachment_id ) {
							$existing->headshot_id = $attachment_id;
						}
					}

					// Auto-generate arrive link if missing but NMLS present
					if ( empty( $existing->arrive ) && ! empty( $existing->nmls ) ) {
						$existing->arrive = self::generate_arrive_link( $existing->nmls );
					} elseif ( empty( $existing->arrive ) && ! empty( $existing->nmls_number ) ) {
						$existing->arrive = self::generate_arrive_link( $existing->nmls_number );
					}

					$existing->save();
					++$updated;
				} else {
					++$skipped;
				}
			} else {
				// Create new profile
				try {
					$profile = new Profile();
					foreach ( $data as $key => $value ) {
						if ( $key !== 'id' && $key !== 'created_at' && $key !== 'updated_at' && $key !== 'avatar_url' ) {
							$profile->$key = $value;
						}
					}

					// Handle avatar_url - download and import image
					if ( ! empty( $data['avatar_url'] ) ) {
						$attachment_id = self::import_image_from_url( $data['avatar_url'] );
						if ( $attachment_id ) {
							$profile->headshot_id = $attachment_id;
						}
					}

					// Auto-generate arrive link if missing but NMLS present
					if ( empty( $profile->arrive ) && ! empty( $profile->nmls ) ) {
						$profile->arrive = self::generate_arrive_link( $profile->nmls );
					} elseif ( empty( $profile->arrive ) && ! empty( $profile->nmls_number ) ) {
						$profile->arrive = self::generate_arrive_link( $profile->nmls_number );
					}

					$profile->save();
					++$imported;

					// Create WordPress user if requested
					if ( $create_users && empty( $profile->user_id ) && ! empty( $profile->email ) ) {
						$user_id = wp_create_user(
							sanitize_user( $profile->email ),
							wp_generate_password(),
							$profile->email
						);

						if ( ! is_wp_error( $user_id ) ) {
							$profile->user_id = $user_id;
							$profile->save();

							// Set first/last name
							if ( ! empty( $profile->first_name ) ) {
								wp_update_user( array(
									'ID'         => $user_id,
									'first_name' => $profile->first_name,
									'last_name'  => $profile->last_name,
								) );
							}
						}
					}
				} catch ( \Exception $e ) {
					++$errors;
				}
			}
		}

		fclose( $handle );

		// Show success message
		add_action( 'admin_notices', function() use ( $imported, $updated, $skipped, $errors ) {
			$message = sprintf(
				__( 'Import complete: %d created, %d updated, %d skipped, %d errors.', 'frs-users' ),
				$imported,
				$updated,
				$skipped,
				$errors
			);
			echo '<div class="notice notice-success"><p>' . esc_html( $message ) . '</p></div>';
		} );
	}
}
