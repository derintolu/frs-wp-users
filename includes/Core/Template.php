<?php
/**
 * Template Handler
 *
 * Handles URL rewriting and template loading for public profiles.
 *
 * @package FRSUsers
 * @subpackage Core
 * @since 1.0.0
 */

namespace FRSUsers\Core;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Class Template
 *
 * Manages public profile URL routing and template loading.
 *
 * @package FRSUsers\Core
 */
class Template {
	use Base;

	/**
	 * Initialize template handling
	 *
	 * @return void
	 */
	public function init() {
		// Add rewrite rules
		add_action( 'init', array( $this, 'add_rewrite_rules' ) );

		// Add query vars
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );

		// Handle template loading
		add_action( 'template_redirect', array( $this, 'handle_template' ) );

		// Enqueue assets for public profiles
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_public_profile_assets' ) );
	}

	/**
	 * Add rewrite rules for public profiles
	 *
	 * @return void
	 */
	public function add_rewrite_rules() {
		add_rewrite_rule(
			'^profile/([^/]+)/?$',
			'index.php?frs_profile_slug=$matches[1]',
			'top'
		);
	}

	/**
	 * Add custom query vars
	 *
	 * @param array $vars Query vars.
	 * @return array Modified query vars.
	 */
	public function add_query_vars( $vars ) {
		$vars[] = 'frs_profile_slug';
		return $vars;
	}

	/**
	 * Handle template loading for public profiles
	 *
	 * @return void
	 */
	public function handle_template() {
		$profile_slug = get_query_var( 'frs_profile_slug' );

		if ( empty( $profile_slug ) ) {
			return;
		}

		// Get profile by slug
		$profile = Profile::get_by_slug( sanitize_title( $profile_slug ) );

		if ( ! $profile ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			return;
		}

		// Set up template data
		global $frs_current_profile;
		$frs_current_profile = $profile;

		// Load template
		$this->load_public_profile_template( $profile );
		exit;
	}

	/**
	 * Load public profile template
	 *
	 * @param Profile $profile Profile object.
	 * @return void
	 */
	private function load_public_profile_template( $profile ) {
		// Set page title
		add_filter( 'wp_title', function( $title ) use ( $profile ) {
			return $profile->first_name . ' ' . $profile->last_name . ' | ' . get_bloginfo( 'name' );
		} );

		add_filter( 'document_title_parts', function( $title_parts ) use ( $profile ) {
			$title_parts['title'] = $profile->first_name . ' ' . $profile->last_name;
			return $title_parts;
		} );

		// Include header
		get_header();

		// Render profile content
		$this->render_public_profile( $profile );

		// Include footer
		get_footer();
	}

	/**
	 * Render public profile content
	 *
	 * @param Profile $profile Profile object.
	 * @return void
	 */
	private function render_public_profile( $profile ) {
		// Output React mount point with profile slug
		?>
		<div class="frs-public-profile-container">
			<div id="frs-public-profile-root"
			     data-profile-slug="<?php echo esc_attr( $profile->profile_slug ); ?>"
			     data-profile-id="<?php echo esc_attr( $profile->id ); ?>">
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueue assets for public profile view
	 *
	 * @return void
	 */
	public function enqueue_public_profile_assets() {
		$profile_slug = get_query_var( 'frs_profile_slug' );

		if ( empty( $profile_slug ) ) {
			return;
		}

		// Enqueue public profile assets
		\FRSUsers\Libs\Assets\enqueue_asset(
			FRS_USERS_DIR . '/assets/frontend/dist',
			'src/frontend/portal/public-main.tsx',
			array(
				'handle'       => 'frs-public-profile',
				'dependencies' => array( 'react', 'react-dom' ),
				'in-footer'    => true,
			)
		);

		// Get profile for localization
		$profile = Profile::get_by_slug( sanitize_title( $profile_slug ) );

		if ( $profile ) {
			// Localize script with profile data and settings
			wp_localize_script(
				'frs-public-profile',
				'frsPublicProfileConfig',
				array(
					'restNonce'   => wp_create_nonce( 'wp_rest' ),
					'profileId'   => $profile->id,
					'userId'      => $profile->user_id ?: 'profile_' . $profile->id,
					'apiUrl'      => rest_url( 'frs-users/v1' ),
					'gradientUrl' => FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4',
					'contentUrl'  => WP_CONTENT_URL,
				)
			);
		}
	}
}
