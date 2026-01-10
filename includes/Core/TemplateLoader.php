<?php
/**
 * Template Loader
 *
 * Handles:
 * - URL masking (/author/{slug} → /lo/{slug}, /agent/{slug}, etc.)
 * - Template loading for FRS user profiles
 * - Rewrite rules for role-based URLs
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Core;

class TemplateLoader {

    /**
     * Role to URL prefix mapping
     *
     * @var array
     */
    private $role_urls = [
        'loan_officer' => 'lo',
        'realtor_partner' => 'agent',
        'staff' => 'staff',
        'leadership' => 'leader',
        'assistant' => 'staff', // Assistants use staff URL
    ];

    /**
     * Initialize template loader
     *
     * @return void
     */
    public function init() {
        // URL masking - change /author/ to role-based URLs
        add_filter('author_link', [$this, 'mask_author_url'], 10, 3);

        // Template loading - load our templates for FRS users
        add_filter('template_include', [$this, 'load_profile_template'], 99);

        // Rewrite rules - map /lo/{slug} etc. back to author queries
        add_action('init', [$this, 'add_rewrite_rules']);

        // Legacy URL redirects
        add_action('template_redirect', [$this, 'redirect_legacy_urls'], 1);
    }

    /**
     * Mask author URLs to role-based URLs
     *
     * Changes /author/john-smith to /lo/john-smith for loan officers, etc.
     *
     * @param string $link Author URL
     * @param int $author_id Author user ID
     * @param string $author_nicename Author slug
     * @return string Modified URL
     */
    public function mask_author_url($link, $author_id, $author_nicename) {
        $user = get_userdata($author_id);
        if (!$user) {
            return $link;
        }

        // Check if user has FRS role
        foreach ($this->role_urls as $role => $url_prefix) {
            if (in_array($role, $user->roles)) {
                return str_replace('/author/', "/{$url_prefix}/", $link);
            }
        }

        return $link;
    }

    /**
     * Add rewrite rules for role-based URLs
     *
     * Maps /lo/{slug} → ?author_name={slug}
     *
     * @return void
     */
    public function add_rewrite_rules() {
        // Get unique URL prefixes
        $prefixes = array_unique(array_values($this->role_urls));

        foreach ($prefixes as $prefix) {
            add_rewrite_rule(
                "^{$prefix}/([^/]+)/?$",
                'index.php?author_name=$matches[1]',
                'top'
            );
        }

        // Flush rewrite rules if needed (only once after activation)
        if (get_option('frs_users_flush_rewrite_rules')) {
            flush_rewrite_rules();
            delete_option('frs_users_flush_rewrite_rules');
        }
    }

    /**
     * Load profile template for FRS users
     *
     * Loads our custom templates for loan officers, agents, staff, leaders
     * on their author archive pages.
     *
     * @param string $template Current template path
     * @return string Modified template path
     */
    public function load_profile_template($template) {
        if (!is_author()) {
            return $template;
        }

        $author = get_queried_object();
        if (!$author || !($author instanceof \WP_User)) {
            return $template;
        }

        // Check if user has FRS role
        $frs_roles = array_keys($this->role_urls);
        $user_roles = $author->roles ?? [];
        $has_frs_role = !empty(array_intersect($frs_roles, $user_roles));

        if (!$has_frs_role) {
            return $template; // Use theme's author template for non-FRS users
        }

        // Determine which role (prioritize first match)
        $role = null;
        foreach ($frs_roles as $frs_role) {
            if (in_array($frs_role, $user_roles)) {
                $role = $frs_role;
                break;
            }
        }

        if (!$role) {
            return $template;
        }

        // Check for theme override first
        $theme_templates = [
            get_stylesheet_directory() . "/author-{$author->user_nicename}.php",
            get_stylesheet_directory() . "/author-{$role}.php",
            get_stylesheet_directory() . '/author-frs.php',
        ];

        foreach ($theme_templates as $theme_template) {
            if (file_exists($theme_template)) {
                return $theme_template;
            }
        }

        // Use plugin template
        $plugin_template = FRS_USERS_DIR . "templates/profile/{$role}.php";

        // Fallback for roles without specific templates
        if (!file_exists($plugin_template)) {
            // Try generic loan-officer template as fallback
            $plugin_template = FRS_USERS_DIR . 'templates/profile/loan-officer.php';
        }

        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        return $template;
    }

    /**
     * Redirect legacy URLs to new masked URLs
     *
     * Redirects:
     * - /profile/{slug} → /lo/{slug} (old custom URL)
     * - /directory/lo/{slug} → /lo/{slug} (from frs-profile-directory)
     *
     * @return void
     */
    public function redirect_legacy_urls() {
        $request_uri = $_SERVER['REQUEST_URI'] ?? '';

        // Redirect /directory/lo/{slug} → /lo/{slug}
        if (preg_match('#^/directory/(lo|agent|staff|leader)/([^/]+)#', $request_uri, $matches)) {
            $prefix = $matches[1];
            $slug = $matches[2];
            wp_redirect(home_url("/{$prefix}/{$slug}"), 301);
            exit;
        }

        // Redirect /profile/{slug} → determine role and redirect
        if (preg_match('#^/profile/([^/]+)#', $request_uri, $matches)) {
            $slug = $matches[1];

            // Find user by slug
            $user = get_user_by('slug', $slug);

            if (!$user) {
                // Try custom slug
                $users = get_users([
                    'meta_key' => 'frs_custom_slug',
                    'meta_value' => $slug,
                    'number' => 1,
                ]);
                $user = $users ? $users[0] : null;
            }

            if ($user) {
                // Determine role and redirect
                foreach ($this->role_urls as $role => $url_prefix) {
                    if (in_array($role, $user->roles)) {
                        wp_redirect(home_url("/{$url_prefix}/{$slug}"), 301);
                        exit;
                    }
                }
            }
        }

        // Redirect /author/{slug} to masked URL (if FRS user)
        if (is_author()) {
            $author = get_queried_object();
            if ($author && ($author instanceof \WP_User)) {
                foreach ($this->role_urls as $role => $url_prefix) {
                    if (in_array($role, $author->roles)) {
                        $current_url = $_SERVER['REQUEST_URI'] ?? '';
                        // Only redirect if currently on /author/ URL
                        if (strpos($current_url, '/author/') !== false) {
                            $new_url = str_replace('/author/', "/{$url_prefix}/", $current_url);
                            wp_redirect(home_url($new_url), 301);
                            exit;
                        }
                    }
                }
            }
        }
    }

    /**
     * Get singleton instance
     *
     * @return self
     */
    public static function get_instance() {
        static $instance = null;
        if (null === $instance) {
            $instance = new self();
        }
        return $instance;
    }
}
