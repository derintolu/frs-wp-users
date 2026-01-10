<?php
/**
 * Embeddable Pages Handler
 *
 * Creates clean, embeddable landing pages for Nextcloud iframe integration.
 *
 * @package FRSUsers\Core
 */

declare(strict_types=1);

namespace FRSUsers\Core;

use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

/**
 * Embeddable Pages Class
 */
class EmbeddablePages {
	use Base;

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public function init(): void {
		add_action( 'init', [ $this, 'register_rewrite_rules' ] );
		add_filter( 'query_vars', [ $this, 'register_query_vars' ] );
		add_action( 'template_redirect', [ $this, 'handle_embeddable_pages' ] );
	}

	/**
	 * Register rewrite rules for landing pages.
	 *
	 * @return void
	 */
	public function register_rewrite_rules(): void {
		// Personal landing pages: /landing/personal/{slug}
		add_rewrite_rule(
			'^landing/personal/([^/]+)/?$',
			'index.php?frs_landing_type=personal&frs_landing_slug=$matches[1]',
			'top'
		);

		// Partnership landing pages: /landing/partnership/{slug}
		add_rewrite_rule(
			'^landing/partnership/([^/]+)/?$',
			'index.php?frs_landing_type=partnership&frs_landing_slug=$matches[1]',
			'top'
		);

		// Team landing pages: /landing/team/{slug}
		add_rewrite_rule(
			'^landing/team/([^/]+)/?$',
			'index.php?frs_landing_type=team&frs_landing_slug=$matches[1]',
			'top'
		);
	}

	/**
	 * Register query vars.
	 *
	 * @param array $vars Existing query vars.
	 * @return array
	 */
	public function register_query_vars( array $vars ): array {
		$vars[] = 'frs_landing_type';
		$vars[] = 'frs_landing_slug';
		return $vars;
	}

	/**
	 * Handle embeddable page requests.
	 *
	 * @return void
	 */
	public function handle_embeddable_pages(): void {
		$landing_type = get_query_var( 'frs_landing_type' );
		$landing_slug = get_query_var( 'frs_landing_slug' );

		if ( empty( $landing_type ) || empty( $landing_slug ) ) {
			return;
		}

		// Disable admin bar for embeddable pages
		show_admin_bar( false );

		// Load appropriate template
		switch ( $landing_type ) {
			case 'personal':
				$this->render_personal_landing( $landing_slug );
				break;
			case 'partnership':
				$this->render_partnership_landing( $landing_slug );
				break;
			case 'team':
				$this->render_team_landing( $landing_slug );
				break;
			default:
				return;
		}

		exit;
	}

	/**
	 * Render personal landing page.
	 *
	 * @param string $slug Profile slug.
	 * @return void
	 */
	private function render_personal_landing( string $slug ): void {
		$profile = Profile::where( 'profile_slug', $slug )->first();

		if ( ! $profile ) {
			$this->render_404();
			return;
		}

		$this->render_clean_template( 'personal', [
			'profile' => $profile,
			'title'   => $profile->first_name . ' ' . $profile->last_name,
		] );
	}

	/**
	 * Render partnership landing page.
	 *
	 * @param string $slug Partnership slug.
	 * @return void
	 */
	private function render_partnership_landing( string $slug ): void {
		// TODO: Implement partnership lookup from wp_frs_partnerships table
		$this->render_clean_template( 'partnership', [
			'title' => 'Partnership Landing Page',
			'slug'  => $slug,
		] );
	}

	/**
	 * Render team landing page.
	 *
	 * @param string $slug Team slug.
	 * @return void
	 */
	private function render_team_landing( string $slug ): void {
		// TODO: Implement team lookup from wp_frs_teams table
		$this->render_clean_template( 'team', [
			'title' => 'Team Landing Page',
			'slug'  => $slug,
		] );
	}

	/**
	 * Render clean template without WordPress theme.
	 *
	 * @param string $type Template type.
	 * @param array  $data Template data.
	 * @return void
	 */
	private function render_clean_template( string $type, array $data ): void {
		header( 'Content-Type: text/html; charset=utf-8' );
		header( 'X-Frame-Options: SAMEORIGIN' ); // Allow embedding in iframes from same origin
		header( 'Content-Security-Policy: frame-ancestors \'self\' *' ); // Allow embedding from Nextcloud

		// Extract data for template
		extract( $data );

		// Load template
		$template_path = FRS_USERS_DIR . "templates/embeddable/{$type}.php";

		if ( file_exists( $template_path ) ) {
			include $template_path;
		} else {
			$this->render_default_template( $type, $data );
		}
	}

	/**
	 * Render default template if custom doesn't exist.
	 *
	 * @param string $type Template type.
	 * @param array  $data Template data.
	 * @return void
	 */
	private function render_default_template( string $type, array $data ): void {
		?>
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title><?php echo esc_html( $data['title'] ?? 'Landing Page' ); ?></title>
			<style>
				* { margin: 0; padding: 0; box-sizing: border-box; }
				body {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
					line-height: 1.6;
					color: #333;
					background: #fff;
					padding: 20px;
				}
				.container {
					max-width: 1200px;
					margin: 0 auto;
				}
				h1 {
					font-size: 2.5rem;
					margin-bottom: 1rem;
					color: #1a1a1a;
				}
				.profile-card {
					background: #f9f9f9;
					padding: 2rem;
					border-radius: 8px;
					margin: 2rem 0;
				}
				.profile-field {
					margin: 1rem 0;
				}
				.profile-field strong {
					display: inline-block;
					width: 150px;
					color: #666;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<h1><?php echo esc_html( $data['title'] ?? 'Landing Page' ); ?></h1>

				<?php if ( $type === 'personal' && isset( $data['profile'] ) ) : ?>
					<?php $profile = $data['profile']; ?>
					<div class="profile-card">
						<div class="profile-field">
							<strong>Email:</strong>
							<?php echo esc_html( $profile->email ); ?>
						</div>
						<div class="profile-field">
							<strong>Type:</strong>
							<?php echo esc_html( $profile->select_person_type ); ?>
						</div>
						<?php if ( $profile->phone_number ) : ?>
							<div class="profile-field">
								<strong>Phone:</strong>
								<?php echo esc_html( $profile->phone_number ); ?>
							</div>
						<?php endif; ?>
						<?php if ( $profile->bio ) : ?>
							<div class="profile-field">
								<strong>Bio:</strong>
								<p><?php echo esc_html( $profile->bio ); ?></p>
							</div>
						<?php endif; ?>
					</div>
				<?php else : ?>
					<p>Landing page type: <?php echo esc_html( $type ); ?></p>
					<p>Slug: <?php echo esc_html( $data['slug'] ?? 'N/A' ); ?></p>
				<?php endif; ?>
			</div>
		</body>
		</html>
		<?php
	}

	/**
	 * Render 404 page.
	 *
	 * @return void
	 */
	private function render_404(): void {
		status_header( 404 );
		?>
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Page Not Found</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100vh;
					margin: 0;
					background: #f5f5f5;
				}
				.error {
					text-align: center;
					padding: 2rem;
				}
				h1 { font-size: 3rem; color: #333; }
				p { color: #666; margin-top: 1rem; }
			</style>
		</head>
		<body>
			<div class="error">
				<h1>404</h1>
				<p>Landing page not found.</p>
			</div>
		</body>
		</html>
		<?php
	}
}
