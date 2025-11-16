<?php
/**
 * Template Loader
 *
 * Handles dynamic profile page routing and template loading
 *
 * @package FRSUsers\Core
 */

namespace FRSUsers\Core;

use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

class Templates {
    use Base;

    /**
     * Initialize template hooks
     */
    public function init() {
        // Add rewrite rules for dynamic profile pages
        add_action('init', [$this, 'add_rewrite_rules']);

        // Handle template loading
        add_filter('template_include', [$this, 'load_profile_template']);

        // Add query vars
        add_filter('query_vars', [$this, 'add_query_vars']);
    }

    /**
     * Add rewrite rules for profile URLs
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
     * @param array $vars Query vars
     * @return array Modified query vars
     */
    public function add_query_vars($vars) {
        $vars[] = 'frs_profile_slug';
        return $vars;
    }

    /**
     * Load custom template for profile pages
     *
     * @param string $template Current template path
     * @return string Modified template path
     */
    public function load_profile_template($template) {
        $profile_slug = get_query_var('frs_profile_slug');

        if ($profile_slug) {
            // Find profile by slug
            global $frs_profile;

            // Try to find by slug (you may need to add a slug field to the profiles table)
            // For now, let's try matching against the post slug or email
            $frs_profile = $this->get_profile_by_slug($profile_slug);

            if ($frs_profile) {
                $plugin_template = FRS_USERS_DIR . 'views/templates/profile-page-dynamic.php';

                if (file_exists($plugin_template)) {
                    return $plugin_template;
                }
            } else {
                // Profile not found - show 404
                global $wp_query;
                $wp_query->set_404();
                status_header(404);
                return get_404_template();
            }
        }

        return $template;
    }

    /**
     * Get profile by slug
     *
     * @param string $slug Profile slug
     * @return object|null Profile object or null
     */
    private function get_profile_by_slug($slug) {
        // Try to find by first-last name slug format
        $slug_parts = explode('-', $slug);

        // Try exact email match first
        $profile = Profile::where('email', $slug)->first();
        if ($profile) {
            return $profile;
        }

        // Try to match by name pattern
        if (count($slug_parts) >= 2) {
            $profiles = Profile::all();

            foreach ($profiles as $profile) {
                $profile_slug = sanitize_title($profile->first_name . '-' . $profile->last_name);
                if ($profile_slug === $slug) {
                    return $profile;
                }
            }
        }

        return null;
    }
}
