<?php
/**
 * CSV Import/Export Admin Page
 *
 * Smart CSV import with fuzzy matching, bulk image import, and export.
 *
 * @package FRSUsers
 * @since 2.2.0
 */

namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Class CsvImportExport
 *
 * Handles CSV import/export with smart matching and bulk image import.
 */
class CsvImportExport {

	use Base;

	/**
	 * CSV field mapping to profile fields.
	 *
	 * @var array
	 */
	private static $field_map = array(
		// Core fields
		'email'              => 'email',
		'first_name'         => 'first_name',
		'last_name'          => 'last_name',
		'display_name'       => 'display_name',
		'phone'              => 'phone_number',
		'phone_number'       => 'phone_number',
		'mobile'             => 'mobile_number',
		'mobile_number'      => 'mobile_number',
		'job_title'          => 'job_title',
		'title'              => 'job_title',
		'biography'          => 'biography',
		'bio'                => 'biography',

		// Licensing
		'nmls'               => 'nmls',
		'nmls_number'        => 'nmls',
		'nmls_id'            => 'nmls',
		'license_number'     => 'license_number',
		'dre_license'        => 'dre_license',
		'dre'                => 'dre_license',

		// Location
		'office'             => 'office',
		'city_state'         => 'city_state',
		'location'           => 'city_state',
		'region'             => 'region',

		// Social
		'facebook'           => 'facebook_url',
		'facebook_url'       => 'facebook_url',
		'instagram'          => 'instagram_url',
		'instagram_url'      => 'instagram_url',
		'linkedin'           => 'linkedin_url',
		'linkedin_url'       => 'linkedin_url',
		'twitter'            => 'twitter_url',
		'twitter_url'        => 'twitter_url',
		'youtube'            => 'youtube_url',
		'youtube_url'        => 'youtube_url',
		'tiktok'             => 'tiktok_url',
		'tiktok_url'         => 'tiktok_url',

		// Profile
		'profile_slug'       => 'profile_slug',
		'slug'               => 'profile_slug',
		'headshot_url'       => 'headshot_url',
		'headshot'           => 'headshot_url',
		'photo'              => 'headshot_url',
		'photo_url'          => 'headshot_url',
		'image'              => 'headshot_url',
		'image_url'          => 'headshot_url',

		// Arrays (pipe or comma separated)
		'service_areas'      => 'service_areas',
		'states'             => 'service_areas',
		'licensed_states'    => 'service_areas',
		'specialties'        => 'specialties_lo',
		'specialties_lo'     => 'specialties_lo',
		'languages'          => 'languages',

		// Role/Type
		'company_role'       => 'company_role',
		'role'               => 'company_role',
		'type'               => 'company_role',
		'person_type'        => 'select_person_type',

		// URLs
		'arrive'             => 'arrive',
		'arrive_url'         => 'arrive',
		'apply_url'          => 'arrive',
	);

	/**
	 * Array fields that need special parsing.
	 *
	 * @var array
	 */
	private static $array_fields = array(
		'service_areas',
		'specialties_lo',
		'specialties',
		'languages',
		'awards',
		'nar_designations',
		'namb_certifications',
		'company_roles',
	);

	/**
	 * Initialize the admin page.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'handle_export' ) );
		add_action( 'admin_init', array( $this, 'handle_import' ) );
		add_action( 'wp_ajax_frs_import_preview', array( $this, 'ajax_import_preview' ) );
		add_action( 'wp_ajax_frs_import_process', array( $this, 'ajax_import_process' ) );
	}

	/**
	 * Add submenu page under FRS Profiles.
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'frs-profiles',
			__( 'Import / Export', 'frs-users' ),
			__( 'Import / Export', 'frs-users' ),
			'manage_options',
			'frs-profiles-import-export',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the import/export page.
	 *
	 * @return void
	 */
	public function render_page() {
		$active_tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'import';
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Import / Export Profiles', 'frs-users' ); ?></h1>

			<nav class="nav-tab-wrapper">
				<a href="?page=frs-profiles-import-export&tab=import" class="nav-tab <?php echo $active_tab === 'import' ? 'nav-tab-active' : ''; ?>">
					<?php esc_html_e( 'Import', 'frs-users' ); ?>
				</a>
				<a href="?page=frs-profiles-import-export&tab=export" class="nav-tab <?php echo $active_tab === 'export' ? 'nav-tab-active' : ''; ?>">
					<?php esc_html_e( 'Export', 'frs-users' ); ?>
				</a>
			</nav>

			<div class="tab-content" style="margin-top: 20px;">
				<?php
				if ( $active_tab === 'export' ) {
					$this->render_export_tab();
				} else {
					$this->render_import_tab();
				}
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render export tab.
	 *
	 * @return void
	 */
	private function render_export_tab() {
		$profiles = Profile::get_all();
		$count    = count( $profiles );
		?>
		<div class="card" style="max-width: 800px; padding: 20px;">
			<h2><?php esc_html_e( 'Export Profiles to CSV', 'frs-users' ); ?></h2>
			<p><?php printf( esc_html__( 'Export all %d profiles to a CSV file.', 'frs-users' ), $count ); ?></p>

			<form method="post" action="">
				<?php wp_nonce_field( 'frs_export_csv', 'frs_export_nonce' ); ?>
				
				<table class="form-table">
					<tr>
						<th scope="row"><?php esc_html_e( 'Profile Type', 'frs-users' ); ?></th>
						<td>
							<select name="export_type">
								<option value=""><?php esc_html_e( 'All Profiles', 'frs-users' ); ?></option>
								<option value="loan_originator"><?php esc_html_e( 'Loan Officers', 'frs-users' ); ?></option>
								<option value="broker_associate"><?php esc_html_e( 'Real Estate Agents', 'frs-users' ); ?></option>
								<option value="leadership"><?php esc_html_e( 'Leadership', 'frs-users' ); ?></option>
								<option value="staff"><?php esc_html_e( 'Staff', 'frs-users' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Include', 'frs-users' ); ?></th>
						<td>
							<label><input type="checkbox" name="include_images" value="1" checked> <?php esc_html_e( 'Headshot URLs', 'frs-users' ); ?></label><br>
							<label><input type="checkbox" name="include_social" value="1" checked> <?php esc_html_e( 'Social Media Links', 'frs-users' ); ?></label><br>
							<label><input type="checkbox" name="include_arrays" value="1" checked> <?php esc_html_e( 'Service Areas, Specialties, Languages', 'frs-users' ); ?></label>
						</td>
					</tr>
				</table>

				<p class="submit">
					<button type="submit" name="frs_export_csv" class="button button-primary">
						<?php esc_html_e( 'Download CSV', 'frs-users' ); ?>
					</button>
				</p>
			</form>
		</div>
		<?php
	}

	/**
	 * Render import tab.
	 *
	 * @return void
	 */
	private function render_import_tab() {
		?>
		<style>
			.frs-import-card { max-width: 900px; padding: 20px; margin-bottom: 20px; }
			.frs-import-card h3 { margin-top: 0; }
			.frs-field-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
			.frs-field-tag { background: #f0f0f1; padding: 4px 10px; border-radius: 3px; font-size: 12px; }
			.frs-preview-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
			.frs-preview-table th, .frs-preview-table td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
			.frs-preview-table th { background: #f9f9f9; }
			.frs-match-new { color: #00a32a; }
			.frs-match-update { color: #0073aa; }
			.frs-match-skip { color: #d63638; }
			.frs-import-progress { display: none; margin: 20px 0; }
			.frs-import-progress .progress-bar { height: 20px; background: #f0f0f1; border-radius: 3px; overflow: hidden; }
			.frs-import-progress .progress-fill { height: 100%; background: #0073aa; transition: width 0.3s; }
			.frs-import-log { max-height: 300px; overflow-y: auto; background: #f9f9f9; padding: 10px; font-family: monospace; font-size: 12px; }
		</style>

		<div class="card frs-import-card">
			<h2><?php esc_html_e( 'Smart CSV Import', 'frs-users' ); ?></h2>
			<p><?php esc_html_e( 'Import profiles from CSV with automatic field mapping and fuzzy name matching.', 'frs-users' ); ?></p>

			<h3><?php esc_html_e( 'Supported Fields', 'frs-users' ); ?></h3>
			<div class="frs-field-list">
				<?php
				$display_fields = array(
					'email', 'first_name', 'last_name', 'phone', 'mobile', 'job_title', 'bio',
					'nmls', 'license_number', 'dre_license', 'office', 'city_state', 'region',
					'facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok',
					'headshot_url', 'profile_slug', 'service_areas', 'specialties', 'languages',
					'company_role', 'arrive_url',
				);
				foreach ( $display_fields as $field ) {
					echo '<span class="frs-field-tag">' . esc_html( $field ) . '</span>';
				}
				?>
			</div>
			<p class="description"><?php esc_html_e( 'Column headers are matched automatically. Arrays (service_areas, specialties, languages) can be pipe (|) or comma separated.', 'frs-users' ); ?></p>

			<hr style="margin: 20px 0;">

			<form id="frs-import-form" method="post" enctype="multipart/form-data">
				<?php wp_nonce_field( 'frs_import_csv', 'frs_import_nonce' ); ?>

				<table class="form-table">
					<tr>
						<th scope="row"><label for="csv_file"><?php esc_html_e( 'CSV File', 'frs-users' ); ?></label></th>
						<td>
							<input type="file" name="csv_file" id="csv_file" accept=".csv" required>
							<p class="description"><?php esc_html_e( 'UTF-8 encoded CSV file with header row.', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Match Mode', 'frs-users' ); ?></th>
						<td>
							<label><input type="radio" name="match_mode" value="email" checked> <?php esc_html_e( 'Match by Email (exact)', 'frs-users' ); ?></label><br>
							<label><input type="radio" name="match_mode" value="fuzzy"> <?php esc_html_e( 'Fuzzy Match by Name (for updates)', 'frs-users' ); ?></label><br>
							<label><input type="radio" name="match_mode" value="nmls"> <?php esc_html_e( 'Match by NMLS Number', 'frs-users' ); ?></label>
							<p class="description"><?php esc_html_e( 'Fuzzy matching finds similar names (e.g., "John Smith" matches "Jonathan Smith").', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Import Mode', 'frs-users' ); ?></th>
						<td>
							<label><input type="radio" name="import_mode" value="update" checked> <?php esc_html_e( 'Update existing, create new', 'frs-users' ); ?></label><br>
							<label><input type="radio" name="import_mode" value="update_only"> <?php esc_html_e( 'Update existing only (skip new)', 'frs-users' ); ?></label><br>
							<label><input type="radio" name="import_mode" value="create_only"> <?php esc_html_e( 'Create new only (skip existing)', 'frs-users' ); ?></label>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Image Handling', 'frs-users' ); ?></th>
						<td>
							<label><input type="checkbox" name="import_images" value="1" checked> <?php esc_html_e( 'Download and attach headshot images from URLs', 'frs-users' ); ?></label>
							<p class="description"><?php esc_html_e( 'If headshot_url column contains image URLs, they will be downloaded to the media library.', 'frs-users' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Default Role', 'frs-users' ); ?></th>
						<td>
							<select name="default_role">
								<option value="loan_officer"><?php esc_html_e( 'Loan Officer', 'frs-users' ); ?></option>
								<option value="re_agent"><?php esc_html_e( 'Real Estate Agent', 'frs-users' ); ?></option>
								<option value="staff"><?php esc_html_e( 'Staff', 'frs-users' ); ?></option>
								<option value="leadership"><?php esc_html_e( 'Leadership', 'frs-users' ); ?></option>
							</select>
							<p class="description"><?php esc_html_e( 'WordPress role for new users if not specified in CSV.', 'frs-users' ); ?></p>
						</td>
					</tr>
				</table>

				<p class="submit">
					<button type="button" id="frs-preview-btn" class="button button-secondary">
						<?php esc_html_e( 'Preview Import', 'frs-users' ); ?>
					</button>
					<button type="submit" name="frs_import_csv" class="button button-primary" id="frs-import-btn" disabled>
						<?php esc_html_e( 'Run Import', 'frs-users' ); ?>
					</button>
				</p>
			</form>

			<div id="frs-preview-results"></div>

			<div class="frs-import-progress" id="frs-import-progress">
				<h3><?php esc_html_e( 'Import Progress', 'frs-users' ); ?></h3>
				<div class="progress-bar">
					<div class="progress-fill" id="frs-progress-fill" style="width: 0%;"></div>
				</div>
				<p id="frs-progress-text"><?php esc_html_e( 'Processing...', 'frs-users' ); ?></p>
				<div class="frs-import-log" id="frs-import-log"></div>
			</div>
		</div>

		<script>
		jQuery(document).ready(function($) {
			var previewData = null;

			$('#frs-preview-btn').on('click', function() {
				var formData = new FormData($('#frs-import-form')[0]);
				formData.append('action', 'frs_import_preview');
				formData.append('nonce', '<?php echo wp_create_nonce( 'frs_import_preview' ); ?>');

				$('#frs-preview-results').html('<p>Loading preview...</p>');
				$('#frs-import-btn').prop('disabled', true);

				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					success: function(response) {
						if (response.success) {
							previewData = response.data;
							renderPreview(response.data);
							$('#frs-import-btn').prop('disabled', false);
						} else {
							$('#frs-preview-results').html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
						}
					},
					error: function() {
						$('#frs-preview-results').html('<div class="notice notice-error"><p>Error processing file.</p></div>');
					}
				});
			});

			function renderPreview(data) {
				var html = '<h3>Preview (' + data.rows.length + ' rows)</h3>';
				html += '<p><strong>Columns detected:</strong> ' + data.columns.join(', ') + '</p>';
				html += '<p><span class="frs-match-new">● New</span> | <span class="frs-match-update">● Update</span> | <span class="frs-match-skip">● Skip</span></p>';
				html += '<table class="frs-preview-table"><thead><tr>';
				html += '<th>Status</th><th>Name</th><th>Email</th><th>Match</th>';
				html += '</tr></thead><tbody>';

				data.rows.slice(0, 20).forEach(function(row) {
					var statusClass = 'frs-match-' + row.action;
					html += '<tr>';
					html += '<td class="' + statusClass + '">' + row.action.toUpperCase() + '</td>';
					html += '<td>' + (row.first_name || '') + ' ' + (row.last_name || '') + '</td>';
					html += '<td>' + (row.email || '-') + '</td>';
					html += '<td>' + (row.match_info || '-') + '</td>';
					html += '</tr>';
				});

				if (data.rows.length > 20) {
					html += '<tr><td colspan="4">... and ' + (data.rows.length - 20) + ' more rows</td></tr>';
				}

				html += '</tbody></table>';
				html += '<p><strong>Summary:</strong> ' + data.summary.new + ' new, ' + data.summary.update + ' updates, ' + data.summary.skip + ' skipped</p>';

				$('#frs-preview-results').html(html);
			}

			$('#frs-import-form').on('submit', function(e) {
				e.preventDefault();

				if (!previewData) {
					alert('Please preview the import first.');
					return;
				}

				if (!confirm('This will import ' + previewData.rows.length + ' profiles. Continue?')) {
					return;
				}

				var formData = new FormData(this);
				formData.append('action', 'frs_import_process');
				formData.append('nonce', '<?php echo wp_create_nonce( 'frs_import_process' ); ?>');

				$('#frs-import-progress').show();
				$('#frs-import-btn').prop('disabled', true);
				$('#frs-import-log').html('');

				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					success: function(response) {
						$('#frs-progress-fill').css('width', '100%');
						if (response.success) {
							$('#frs-progress-text').html('<strong>Import complete!</strong> ' + response.data.message);
							$('#frs-import-log').html(response.data.log.join('<br>'));
						} else {
							$('#frs-progress-text').html('<strong>Error:</strong> ' + response.data);
						}
						$('#frs-import-btn').prop('disabled', false);
					},
					error: function() {
						$('#frs-progress-text').html('<strong>Error:</strong> Import failed.');
						$('#frs-import-btn').prop('disabled', false);
					}
				});
			});
		});
		</script>
		<?php
	}

	/**
	 * Handle CSV export.
	 *
	 * @return void
	 */
	public function handle_export() {
		if ( ! isset( $_POST['frs_export_csv'] ) || ! isset( $_POST['frs_export_nonce'] ) ) {
			return;
		}

		if ( ! wp_verify_nonce( $_POST['frs_export_nonce'], 'frs_export_csv' ) ) {
			wp_die( 'Invalid nonce' );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized' );
		}

		$type = isset( $_POST['export_type'] ) ? sanitize_key( $_POST['export_type'] ) : '';
		$args = $type ? array( 'type' => $type ) : array();

		$profiles = Profile::get_all( $args );

		$include_images = ! empty( $_POST['include_images'] );
		$include_social = ! empty( $_POST['include_social'] );
		$include_arrays = ! empty( $_POST['include_arrays'] );

		// Build CSV
		$headers = array(
			'id', 'email', 'first_name', 'last_name', 'display_name',
			'phone_number', 'mobile_number', 'job_title', 'biography',
			'nmls', 'license_number', 'dre_license',
			'office', 'city_state', 'region',
			'profile_slug', 'company_role', 'is_active',
		);

		if ( $include_images ) {
			$headers[] = 'headshot_url';
		}

		if ( $include_social ) {
			$headers = array_merge( $headers, array(
				'facebook_url', 'instagram_url', 'linkedin_url',
				'twitter_url', 'youtube_url', 'tiktok_url',
			) );
		}

		if ( $include_arrays ) {
			$headers = array_merge( $headers, array(
				'service_areas', 'specialties_lo', 'languages',
			) );
		}

		$headers[] = 'arrive';

		// Output CSV
		$filename = 'frs-profiles-' . date( 'Y-m-d' ) . '.csv';
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=' . $filename );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		$output = fopen( 'php://output', 'w' );
		fprintf( $output, chr( 0xEF ) . chr( 0xBB ) . chr( 0xBF ) ); // UTF-8 BOM
		fputcsv( $output, $headers );

		foreach ( $profiles as $profile ) {
			$row = array();
			foreach ( $headers as $field ) {
				$value = '';

				if ( $field === 'headshot_url' && isset( $profile->headshot_id ) && $profile->headshot_id ) {
					$value = wp_get_attachment_url( $profile->headshot_id );
				} elseif ( in_array( $field, self::$array_fields, true ) ) {
					$arr   = isset( $profile->$field ) ? $profile->$field : array();
					$value = is_array( $arr ) ? implode( '|', $arr ) : $arr;
				} elseif ( $field === 'company_role' ) {
					$roles = isset( $profile->company_roles ) ? $profile->company_roles : array();
					$value = is_array( $roles ) ? implode( '|', $roles ) : $roles;
				} elseif ( isset( $profile->$field ) ) {
					$value = $profile->$field;
				}

				$row[] = $value;
			}
			fputcsv( $output, $row );
		}

		fclose( $output );
		exit;
	}

	/**
	 * AJAX handler for import preview.
	 *
	 * @return void
	 */
	public function ajax_import_preview() {
		check_ajax_referer( 'frs_import_preview', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Unauthorized' );
		}

		if ( empty( $_FILES['csv_file'] ) ) {
			wp_send_json_error( 'No file uploaded' );
		}

		$file = $_FILES['csv_file'];
		if ( $file['error'] !== UPLOAD_ERR_OK ) {
			wp_send_json_error( 'Upload error: ' . $file['error'] );
		}

		$match_mode  = isset( $_POST['match_mode'] ) ? sanitize_key( $_POST['match_mode'] ) : 'email';
		$import_mode = isset( $_POST['import_mode'] ) ? sanitize_key( $_POST['import_mode'] ) : 'update';

		$result = $this->parse_csv_file( $file['tmp_name'], $match_mode, $import_mode );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success( $result );
	}

	/**
	 * AJAX handler for import processing.
	 *
	 * @return void
	 */
	public function ajax_import_process() {
		check_ajax_referer( 'frs_import_process', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Unauthorized' );
		}

		if ( empty( $_FILES['csv_file'] ) ) {
			wp_send_json_error( 'No file uploaded' );
		}

		$file          = $_FILES['csv_file'];
		$match_mode    = isset( $_POST['match_mode'] ) ? sanitize_key( $_POST['match_mode'] ) : 'email';
		$import_mode   = isset( $_POST['import_mode'] ) ? sanitize_key( $_POST['import_mode'] ) : 'update';
		$import_images = ! empty( $_POST['import_images'] );
		$default_role  = isset( $_POST['default_role'] ) ? sanitize_key( $_POST['default_role'] ) : 'loan_officer';

		$result = $this->process_import(
			$file['tmp_name'],
			$match_mode,
			$import_mode,
			$import_images,
			$default_role
		);

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success( $result );
	}

	/**
	 * Parse CSV file for preview.
	 *
	 * @param string $filepath    Path to CSV file.
	 * @param string $match_mode  Match mode (email, fuzzy, nmls).
	 * @param string $import_mode Import mode (update, update_only, create_only).
	 * @return array|WP_Error
	 */
	private function parse_csv_file( $filepath, $match_mode, $import_mode ) {
		$handle = fopen( $filepath, 'r' );
		if ( ! $handle ) {
			return new \WP_Error( 'file_error', 'Could not open file' );
		}

		// Read header
		$header = fgetcsv( $handle );
		if ( ! $header ) {
			fclose( $handle );
			return new \WP_Error( 'file_error', 'Could not read header row' );
		}

		// Normalize headers
		$header = array_map( function( $h ) {
			return strtolower( trim( preg_replace( '/[^a-zA-Z0-9_]/', '_', $h ) ) );
		}, $header );

		// Get existing profiles for matching
		$existing = $this->get_existing_profiles_for_matching();

		$rows    = array();
		$summary = array( 'new' => 0, 'update' => 0, 'skip' => 0 );

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			if ( count( $row ) !== count( $header ) ) {
				continue; // Skip malformed rows
			}

			$data = array_combine( $header, $row );
			$data = $this->map_csv_fields( $data );

			// Find match
			$match = $this->find_matching_profile( $data, $existing, $match_mode );

			$action     = 'new';
			$match_info = '';

			if ( $match ) {
				if ( $import_mode === 'create_only' ) {
					$action     = 'skip';
					$match_info = 'Already exists: ' . $match['name'];
				} else {
					$action     = 'update';
					$match_info = 'Match: ' . $match['name'] . ' (' . $match['method'] . ')';
				}
			} else {
				if ( $import_mode === 'update_only' ) {
					$action     = 'skip';
					$match_info = 'No match found';
				}
			}

			$data['action']     = $action;
			$data['match_info'] = $match_info;
			$data['match_id']   = $match ? $match['id'] : null;

			$rows[] = $data;
			$summary[ $action ]++;
		}

		fclose( $handle );

		return array(
			'columns' => $header,
			'rows'    => $rows,
			'summary' => $summary,
		);
	}

	/**
	 * Map CSV fields to profile fields.
	 *
	 * @param array $data CSV row data.
	 * @return array Mapped data.
	 */
	private function map_csv_fields( $data ) {
		$mapped = array();

		foreach ( $data as $key => $value ) {
			$key = strtolower( trim( $key ) );

			// Check field map
			if ( isset( self::$field_map[ $key ] ) ) {
				$target = self::$field_map[ $key ];

				// Parse array fields
				if ( in_array( $target, self::$array_fields, true ) ) {
					$value = $this->parse_array_value( $value );
				}

				$mapped[ $target ] = $value;
			} else {
				// Keep unmapped fields
				$mapped[ $key ] = $value;
			}
		}

		return $mapped;
	}

	/**
	 * Parse array value from CSV (pipe or comma separated).
	 *
	 * @param string $value CSV value.
	 * @return array
	 */
	private function parse_array_value( $value ) {
		if ( empty( $value ) ) {
			return array();
		}

		// Try pipe separator first, then comma
		if ( strpos( $value, '|' ) !== false ) {
			$items = explode( '|', $value );
		} else {
			$items = explode( ',', $value );
		}

		return array_map( 'trim', array_filter( $items ) );
	}

	/**
	 * Get existing profiles for matching.
	 *
	 * @return array
	 */
	private function get_existing_profiles_for_matching() {
		$profiles = Profile::get_all();
		$result   = array();

		foreach ( $profiles as $profile ) {
			$result[] = array(
				'id'         => $profile->id,
				'email'      => strtolower( $profile->email ?? '' ),
				'first_name' => strtolower( $profile->first_name ?? '' ),
				'last_name'  => strtolower( $profile->last_name ?? '' ),
				'full_name'  => strtolower( trim( ( $profile->first_name ?? '' ) . ' ' . ( $profile->last_name ?? '' ) ) ),
				'nmls'       => $profile->nmls ?? '',
			);
		}

		return $result;
	}

	/**
	 * Find matching profile.
	 *
	 * @param array  $data       CSV row data.
	 * @param array  $existing   Existing profiles.
	 * @param string $match_mode Match mode.
	 * @return array|null Match info or null.
	 */
	private function find_matching_profile( $data, $existing, $match_mode ) {
		$email      = strtolower( $data['email'] ?? '' );
		$first_name = strtolower( $data['first_name'] ?? '' );
		$last_name  = strtolower( $data['last_name'] ?? '' );
		$full_name  = strtolower( trim( $first_name . ' ' . $last_name ) );
		$nmls       = $data['nmls'] ?? '';

		foreach ( $existing as $profile ) {
			// Email match (always try this first)
			if ( $match_mode === 'email' && $email && $profile['email'] === $email ) {
				return array(
					'id'     => $profile['id'],
					'name'   => $profile['full_name'],
					'method' => 'email',
				);
			}

			// NMLS match
			if ( $match_mode === 'nmls' && $nmls && $profile['nmls'] === $nmls ) {
				return array(
					'id'     => $profile['id'],
					'name'   => $profile['full_name'],
					'method' => 'nmls',
				);
			}

			// Fuzzy name match
			if ( $match_mode === 'fuzzy' && $full_name ) {
				$similarity = $this->calculate_name_similarity( $full_name, $profile['full_name'] );
				if ( $similarity >= 0.85 ) {
					return array(
						'id'     => $profile['id'],
						'name'   => $profile['full_name'],
						'method' => 'fuzzy (' . round( $similarity * 100 ) . '%)',
					);
				}
			}
		}

		return null;
	}

	/**
	 * Calculate name similarity using multiple methods.
	 *
	 * @param string $name1 First name.
	 * @param string $name2 Second name.
	 * @return float Similarity score 0-1.
	 */
	private function calculate_name_similarity( $name1, $name2 ) {
		if ( $name1 === $name2 ) {
			return 1.0;
		}

		// Levenshtein distance
		$lev = levenshtein( $name1, $name2 );
		$max = max( strlen( $name1 ), strlen( $name2 ) );
		$lev_score = $max > 0 ? 1 - ( $lev / $max ) : 0;

		// Similar text
		similar_text( $name1, $name2, $sim_percent );
		$sim_score = $sim_percent / 100;

		// Soundex comparison
		$soundex_score = soundex( $name1 ) === soundex( $name2 ) ? 0.3 : 0;

		// Weight the scores
		return ( $lev_score * 0.4 ) + ( $sim_score * 0.5 ) + $soundex_score;
	}

	/**
	 * Process the actual import.
	 *
	 * @param string $filepath      Path to CSV file.
	 * @param string $match_mode    Match mode.
	 * @param string $import_mode   Import mode.
	 * @param bool   $import_images Whether to import images.
	 * @param string $default_role  Default WordPress role.
	 * @return array|WP_Error
	 */
	private function process_import( $filepath, $match_mode, $import_mode, $import_images, $default_role ) {
		$parsed = $this->parse_csv_file( $filepath, $match_mode, $import_mode );

		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$log     = array();
		$created = 0;
		$updated = 0;
		$skipped = 0;
		$errors  = 0;

		foreach ( $parsed['rows'] as $row ) {
			if ( $row['action'] === 'skip' ) {
				$skipped++;
				$log[] = 'Skipped: ' . ( $row['first_name'] ?? '' ) . ' ' . ( $row['last_name'] ?? '' );
				continue;
			}

			try {
				if ( $row['action'] === 'update' && $row['match_id'] ) {
					// Update existing profile
					$result = $this->update_profile( $row['match_id'], $row, $import_images );
					if ( $result ) {
						$updated++;
						$log[] = 'Updated: ' . ( $row['first_name'] ?? '' ) . ' ' . ( $row['last_name'] ?? '' );
					}
				} elseif ( $row['action'] === 'new' ) {
					// Create new profile
					$result = $this->create_profile( $row, $default_role, $import_images );
					if ( $result ) {
						$created++;
						$log[] = 'Created: ' . ( $row['first_name'] ?? '' ) . ' ' . ( $row['last_name'] ?? '' );
					}
				}
			} catch ( \Exception $e ) {
				$errors++;
				$log[] = 'Error: ' . ( $row['first_name'] ?? '' ) . ' ' . ( $row['last_name'] ?? '' ) . ' - ' . $e->getMessage();
			}
		}

		return array(
			'message' => sprintf(
				__( 'Created: %d, Updated: %d, Skipped: %d, Errors: %d', 'frs-users' ),
				$created, $updated, $skipped, $errors
			),
			'log'     => $log,
			'created' => $created,
			'updated' => $updated,
			'skipped' => $skipped,
			'errors'  => $errors,
		);
	}

	/**
	 * Create a new profile.
	 *
	 * @param array  $data          Profile data.
	 * @param string $default_role  Default role.
	 * @param bool   $import_images Whether to import images.
	 * @return int|false User ID or false.
	 */
	private function create_profile( $data, $default_role, $import_images ) {
		$email = $data['email'] ?? '';
		if ( empty( $email ) ) {
			// Generate email from name
			$first = sanitize_title( $data['first_name'] ?? 'user' );
			$last  = sanitize_title( $data['last_name'] ?? '' );
			$email = $first . '.' . $last . '@placeholder.frs';
		}

		// Check if email exists
		if ( email_exists( $email ) ) {
			return false;
		}

		// Create user
		$username = sanitize_user( strtok( $email, '@' ), true );
		$username = $this->generate_unique_username( $username );

		$user_id = wp_insert_user( array(
			'user_login'   => $username,
			'user_email'   => $email,
			'user_pass'    => wp_generate_password(),
			'first_name'   => $data['first_name'] ?? '',
			'last_name'    => $data['last_name'] ?? '',
			'display_name' => trim( ( $data['first_name'] ?? '' ) . ' ' . ( $data['last_name'] ?? '' ) ),
			'role'         => $default_role,
		) );

		if ( is_wp_error( $user_id ) ) {
			throw new \Exception( $user_id->get_error_message() );
		}

		// Update meta
		$this->update_profile_meta( $user_id, $data, $import_images );

		return $user_id;
	}

	/**
	 * Update an existing profile.
	 *
	 * @param int   $user_id       User ID.
	 * @param array $data          Profile data.
	 * @param bool  $import_images Whether to import images.
	 * @return bool Success.
	 */
	private function update_profile( $user_id, $data, $import_images ) {
		// Update user data
		$user_data = array( 'ID' => $user_id );

		if ( ! empty( $data['first_name'] ) ) {
			$user_data['first_name'] = $data['first_name'];
		}
		if ( ! empty( $data['last_name'] ) ) {
			$user_data['last_name'] = $data['last_name'];
		}
		if ( ! empty( $data['display_name'] ) ) {
			$user_data['display_name'] = $data['display_name'];
		}

		if ( count( $user_data ) > 1 ) {
			wp_update_user( $user_data );
		}

		// Update meta
		$this->update_profile_meta( $user_id, $data, $import_images );

		return true;
	}

	/**
	 * Update profile meta fields.
	 *
	 * @param int   $user_id       User ID.
	 * @param array $data          Profile data.
	 * @param bool  $import_images Whether to import images.
	 * @return void
	 */
	private function update_profile_meta( $user_id, $data, $import_images ) {
		$meta_fields = array(
			'phone_number', 'mobile_number', 'job_title', 'biography',
			'nmls', 'license_number', 'dre_license',
			'office', 'city_state', 'region',
			'facebook_url', 'instagram_url', 'linkedin_url',
			'twitter_url', 'youtube_url', 'tiktok_url',
			'profile_slug', 'arrive',
			'service_areas', 'specialties_lo', 'languages',
		);

		foreach ( $meta_fields as $field ) {
			if ( isset( $data[ $field ] ) && $data[ $field ] !== '' ) {
				$value = $data[ $field ];

				// Serialize arrays
				if ( is_array( $value ) ) {
					$value = wp_json_encode( $value );
				}

				update_user_meta( $user_id, 'frs_' . $field, $value );
			}
		}

		// Handle company role
		if ( ! empty( $data['company_role'] ) ) {
			$roles = is_array( $data['company_role'] ) ? $data['company_role'] : array( $data['company_role'] );
			delete_user_meta( $user_id, 'frs_company_role' );
			foreach ( $roles as $role ) {
				add_user_meta( $user_id, 'frs_company_role', sanitize_key( $role ) );
			}
		}

		// Handle headshot image
		if ( $import_images && ! empty( $data['headshot_url'] ) ) {
			$attachment_id = $this->import_image_from_url( $data['headshot_url'], $user_id );
			if ( $attachment_id ) {
				update_user_meta( $user_id, 'frs_headshot_id', $attachment_id );

				// Also set as Simple Local Avatars if available
				if ( function_exists( 'simple_local_avatar' ) ) {
					update_user_meta( $user_id, 'simple_local_avatar', array(
						'media_id' => $attachment_id,
						'full'     => wp_get_attachment_url( $attachment_id ),
					) );
				}
			}
		}

		// Generate profile slug if not set
		if ( empty( $data['profile_slug'] ) ) {
			$slug = sanitize_title( ( $data['first_name'] ?? '' ) . '-' . ( $data['last_name'] ?? '' ) );
			update_user_meta( $user_id, 'frs_profile_slug', $slug );
		}
	}

	/**
	 * Import image from URL.
	 *
	 * @param string $url     Image URL.
	 * @param int    $user_id User ID for context.
	 * @return int|false Attachment ID or false.
	 */
	private function import_image_from_url( $url, $user_id ) {
		if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return false;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		// Download file
		$tmp = download_url( $url, 30 );
		if ( is_wp_error( $tmp ) ) {
			return false;
		}

		// Get filename from URL
		$filename = basename( wp_parse_url( $url, PHP_URL_PATH ) );
		if ( empty( $filename ) ) {
			$filename = 'headshot-' . $user_id . '.jpg';
		}

		$file_array = array(
			'name'     => $filename,
			'tmp_name' => $tmp,
		);

		// Upload to media library
		$attachment_id = media_handle_sideload( $file_array, 0, null, array(
			'post_title' => sprintf( __( 'Headshot for user %d', 'frs-users' ), $user_id ),
		) );

		// Clean up temp file
		if ( file_exists( $tmp ) ) {
			@unlink( $tmp );
		}

		if ( is_wp_error( $attachment_id ) ) {
			return false;
		}

		return $attachment_id;
	}

	/**
	 * Generate a unique username.
	 *
	 * @param string $base Base username.
	 * @return string Unique username.
	 */
	private function generate_unique_username( $base ) {
		$username = $base;
		$i        = 1;

		while ( username_exists( $username ) ) {
			$username = $base . $i;
			$i++;
		}

		return $username;
	}

	/**
	 * Handle form-based import (non-AJAX fallback).
	 *
	 * @return void
	 */
	public function handle_import() {
		// This is handled via AJAX now, but kept as fallback
	}
}
