<?php
/**
 * FRS Sync Integration
 *
 * Integrates with frs-wp-sync plugin to write synced agents to profiles table.
 *
 * @package FRSUsers
 * @subpackage Integrations
 * @since 1.0.0
 */

namespace FRSUsers\Integrations;

use FRSUsers\Models\Profile;

/**
 * Class FRSSync
 *
 * Handles integration with frs-wp-sync plugin.
 *
 * @package FRSUsers\Integrations
 */
class FRSSync {

	/**
	 * Initialize the integration
	 *
	 * @return void
	 */
	public static function init() {
		// Hook into frs-wp-sync actions
		add_action( 'frs_sync_agent_data', array( __CLASS__, 'sync_agent_to_profile' ), 10, 2 );
		add_filter( 'frs_sync_use_profiles_table', '__return_true' );

		// Add admin notice if old sync plugin is active
		add_action( 'admin_notices', array( __CLASS__, 'show_integration_notice' ) );
	}

	/**
	 * Sync agent data to profiles table
	 *
	 * @param array $agent Agent data from FRS API.
	 * @param int   $post_id Person CPT post ID (may be null).
	 * @return int|false Profile ID on success, false on failure.
	 */
	public static function sync_agent_to_profile( $agent, $post_id = null ) {
		if ( empty( $agent['email'] ) ) {
			error_log( 'FRS Users Sync: No email provided for agent' );
			return false;
		}

		// Check if we should only sync loan officers
		$is_loan_officer = false;
		if ( isset( $agent['role'] ) && $agent['role'] === 'loan_officer' ) {
			$is_loan_officer = true;
		}
		if ( isset( $agent['roles'] ) && is_array( $agent['roles'] ) && in_array( 'loan_officer', $agent['roles'] ) ) {
			$is_loan_officer = true;
		}

		// Map FRS API fields to profile fields
		$profile_data = array(
			'first_name'     => $agent['first_name'] ?? '',
			'last_name'      => $agent['last_name'] ?? '',
			'email'          => $agent['email'] ?? '',
			'phone_number'   => $agent['phone'] ?? '',
			'mobile_number'  => $agent['mobile'] ?? $agent['phone'] ?? '',
			'job_title'      => $agent['job_title'] ?? '',
			'biography'      => $agent['biography'] ?? '',
			'nmls'           => $agent['nmls_number'] ?? '',
			'nmls_number'    => $agent['nmls_number'] ?? '',
			'license_number' => $agent['license_number'] ?? '',
			'arrive'         => $agent['registration_url'] ?? '',
			'frs_agent_id'   => $agent['id'] ?? '',
		);

		// Handle array fields
		if ( ! empty( $agent['specialties_lo'] ) ) {
			$profile_data['specialties_lo'] = is_array( $agent['specialties_lo'] )
				? $agent['specialties_lo']
				: explode( ',', $agent['specialties_lo'] );
		}

		if ( ! empty( $agent['languages'] ) ) {
			$profile_data['languages'] = is_array( $agent['languages'] )
				? $agent['languages']
				: explode( ',', $agent['languages'] );
		}

		// Handle headshot
		if ( ! empty( $agent['headshot_url'] ) ) {
			$attachment_id = self::get_or_upload_image( $agent['headshot_url'] );
			if ( $attachment_id ) {
				$profile_data['headshot_id'] = $attachment_id;
			}
		}

		// Look for existing profile by multiple identifiers
		$existing_profile = null;

		// Priority 1: By FRS ID
		if ( ! empty( $agent['frs_id'] ) ) {
			$existing_profile = Profile::get_by_frs_agent_id( $agent['frs_id'] );
		}

		// Priority 2: By agent ID
		if ( ! $existing_profile && ! empty( $agent['id'] ) ) {
			$existing_profile = Profile::get_by_frs_agent_id( $agent['id'] );
		}

		// Priority 3: By NMLS number
		if ( ! $existing_profile && ! empty( $agent['nmls_number'] ) ) {
			global $wpdb;
			$table = $wpdb->prefix . 'frs_profiles';
			$row = $wpdb->get_row( $wpdb->prepare(
				"SELECT * FROM {$table} WHERE nmls = %s OR nmls_number = %s LIMIT 1",
				$agent['nmls_number'],
				$agent['nmls_number']
			) );
			if ( $row ) {
				$existing_profile = new Profile( $row );
				$existing_profile->load_types();
			}
		}

		// Priority 4: By email
		if ( ! $existing_profile ) {
			$existing_profile = Profile::get_by_email( $agent['email'] );
		}

		// Create or update profile
		if ( $existing_profile ) {
			$profile_id = $existing_profile->save( $profile_data );
			error_log( 'FRS Users Sync: Updated profile ' . $existing_profile->id . ' for ' . $agent['email'] );
		} else {
			$profile = new Profile();
			$profile_id = $profile->save( $profile_data );
			error_log( 'FRS Users Sync: Created new profile ' . $profile_id . ' for ' . $agent['email'] );
		}

		if ( ! $profile_id ) {
			error_log( 'FRS Users Sync: Failed to save profile for ' . $agent['email'] );
			return false;
		}

		// Set profile types
		$profile = Profile::find( $profile_id );
		if ( $profile ) {
			$profile_types = array();

			if ( $is_loan_officer ) {
				$profile_types[] = 'loan_officer';
			}

			// Add any other roles from the API
			if ( isset( $agent['roles'] ) && is_array( $agent['roles'] ) ) {
				foreach ( $agent['roles'] as $role ) {
					if ( ! in_array( $role, $profile_types ) ) {
						$profile_types[] = $role;
					}
				}
			}

			if ( ! empty( $profile_types ) ) {
				$profile->set_types( $profile_types );
			}
		}

		return $profile_id;
	}

	/**
	 * Get existing image or upload new one
	 *
	 * @param string $image_url Image URL.
	 * @return int|false Attachment ID or false.
	 */
	private static function get_or_upload_image( $image_url ) {
		if ( empty( $image_url ) ) {
			return false;
		}

		$url_hash = md5( $image_url );

		// Check if image already exists
		$existing = get_posts( array(
			'post_type'      => 'attachment',
			'meta_query'     => array(
				array(
					'key'     => '_frs_image_url_hash',
					'value'   => $url_hash,
					'compare' => '=',
				),
			),
			'posts_per_page' => 1,
		) );

		if ( $existing ) {
			return $existing[0]->ID;
		}

		// Upload new image
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = download_url( $image_url );
		if ( is_wp_error( $tmp ) ) {
			return false;
		}

		$filename = basename( parse_url( $image_url, PHP_URL_PATH ) );
		$file_array = array(
			'name'     => $filename ?: 'headshot-' . $url_hash . '.jpg',
			'tmp_name' => $tmp,
		);

		$attachment_id = media_handle_sideload( $file_array, 0 );

		if ( is_wp_error( $attachment_id ) ) {
			@unlink( $tmp );
			return false;
		}

		update_post_meta( $attachment_id, '_frs_image_url_hash', $url_hash );
		update_post_meta( $attachment_id, '_frs_original_url', $image_url );

		return $attachment_id;
	}

	/**
	 * Show admin notice about integration
	 *
	 * @return void
	 */
	public static function show_integration_notice() {
		if ( ! is_plugin_active( 'frs-wp-sync/frs-wp-sync.php' ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $screen->id !== 'plugins' && $screen->id !== 'toplevel_page_frs-users-profiles' ) {
			return;
		}

		// Check if using new profiles system
		$use_profiles = get_option( 'frs_sync_use_profiles_table', false );

		if ( ! $use_profiles ) {
			?>
			<div class="notice notice-info is-dismissible">
				<p>
					<strong>FRS Users:</strong> The FRS WP Sync plugin is active.
					<a href="<?php echo admin_url( 'edit.php?post_type=person&page=frs-wp-sync' ); ?>">Configure it</a>
					to use the new profiles table for better performance and features.
				</p>
			</div>
			<?php
		} else {
			?>
			<div class="notice notice-success is-dismissible">
				<p>
					<strong>FRS Users:</strong> FRS WP Sync is writing to the profiles table.
					<a href="<?php echo admin_url( 'admin.php?page=frs-users-profiles' ); ?>">View profiles</a>
				</p>
			</div>
			<?php
		}
	}

	/**
	 * Get sync statistics
	 *
	 * @return array
	 */
	public static function get_sync_stats() {
		global $wpdb;
		$table = $wpdb->prefix . 'frs_profiles';

		$stats = array(
			'total_profiles'  => $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE is_active = 1" ),
			'synced_profiles' => $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE frs_agent_id IS NOT NULL AND frs_agent_id != ''" ),
			'guest_profiles'  => $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE user_id IS NULL AND is_active = 1" ),
			'last_sync'       => get_option( 'frs_last_sync_time' ),
		);

		return $stats;
	}
}
