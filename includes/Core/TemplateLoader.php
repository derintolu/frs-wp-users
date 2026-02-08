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
     * WordPress role to URL prefix mapping
     *
     * Maps WP roles to their public URL prefixes.
     * Partner has null because they don't have public URLs.
     *
     * @var array
     */
    private $role_urls = [
        'loan_officer'     => 'lo',
        're_agent'         => 'agent',
        'escrow_officer'   => 'escrow',
        'property_manager' => 'pm',
        'dual_license'     => 'lo',     // Default to LO, context can override.
        'partner'          => null,     // No public URL.
        'staff'            => 'staff',
        'leadership'       => 'leader',
        'assistant'        => 'staff',
    ];

    /**
     * QR landing query var
     *
     * @var string
     */
    const QR_QUERY_VAR = 'frs_qr_landing';

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

        // QR landing query var
        add_filter('query_vars', [$this, 'add_query_vars']);

        // QR landing template
        add_action('template_redirect', [$this, 'handle_qr_landing'], 5);
    }

    /**
     * Add custom query vars
     *
     * @param array $vars Existing query vars.
     * @return array Modified query vars.
     */
    public function add_query_vars($vars) {
        $vars[] = self::QR_QUERY_VAR;
        return $vars;
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

        // Match user's WP roles against our role_urls map
        $frs_roles = array_keys($this->role_urls);
        $user_frs_roles = array_intersect($frs_roles, (array) $user->roles);

        if (!empty($user_frs_roles)) {
            $role = reset($user_frs_roles);
            $url_prefix = $this->role_urls[$role];
            if ($url_prefix) {
                return home_url("/{$url_prefix}/{$author_nicename}/");
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

        // QR landing page: /qr/{slug}
        add_rewrite_rule(
            '^qr/([^/]+)/?$',
            'index.php?' . self::QR_QUERY_VAR . '=$matches[1]',
            'top'
        );

        // Flush rewrite rules if needed (only once after activation)
        if (get_option('frs_users_flush_rewrite_rules')) {
            flush_rewrite_rules();
            delete_option('frs_users_flush_rewrite_rules');
        }
    }

    /**
     * Handle QR landing page route
     *
     * Displays mobile-friendly landing page when QR code is scanned.
     *
     * @return void
     */
    public function handle_qr_landing() {
        $slug = get_query_var(self::QR_QUERY_VAR);

        if (empty($slug)) {
            return;
        }

        // Find user by slug (nicename or custom profile slug)
        $user = get_user_by('slug', $slug);

        if (!$user) {
            // Try custom profile slug
            $users = get_users([
                'meta_key'   => 'frs_profile_slug',
                'meta_value' => sanitize_title($slug),
                'number'     => 1,
            ]);
            $user = $users ? $users[0] : null;
        }

        if (!$user) {
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            nocache_headers();
            include get_404_template();
            exit;
        }

        // Check if user is active
        $is_active = get_user_meta($user->ID, 'frs_is_active', true);
        if (!$is_active) {
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            nocache_headers();
            include get_404_template();
            exit;
        }

        // Set up fake post for template
        global $wp_query, $post;

        $first_name = get_user_meta($user->ID, 'first_name', true);
        $last_name = get_user_meta($user->ID, 'last_name', true);
        $full_name = trim($first_name . ' ' . $last_name);

        $post = new \WP_Post((object) [
            'ID'          => 0,
            'post_type'   => 'frs_qr_landing',
            'post_title'  => $full_name ?: 'Contact',
            'post_status' => 'publish',
            'post_name'   => $slug,
        ]);
        $wp_query->post = $post;
        $wp_query->posts = [$post];
        $wp_query->is_singular = true;
        $wp_query->is_single = true;

        // Prevent caching
        if (!defined('DONOTCACHEPAGE')) {
            define('DONOTCACHEPAGE', true);
        }
        nocache_headers();

        // Load the QR landing template
        $template = FRS_USERS_DIR . 'templates/profile/qr-landing.php';

        if (file_exists($template)) {
            // Pass user data to template
            set_query_var('frs_qr_user', $user);
            include $template;
            exit;
        }

        // Fallback to 404 if template missing
        global $wp_query;
        $wp_query->set_404();
        status_header(404);
        include get_404_template();
        exit;
    }

    /**
     * Load profile template for FRS users
     *
     * Loads our custom templates for loan officers, agents, staff, leaders
     * on their author archive pages.
     *
     * On hub/development contexts, loads the hub profile template which renders
     * the Greenshift block pattern instead of the public marketing template.
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

        // Hub context: use the hub profile template (Greenshift block pattern)
        $site_context = Roles::get_site_context();
        if (in_array($site_context, ['hub', 'development'], true)) {
            $hub_template = FRS_USERS_DIR . 'templates/profile/hub-profile.php';
            if (file_exists($hub_template)) {
                return $hub_template;
            }
        }

        // Use plugin template (marketing sites)
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
     * - /author/{slug} → /{role-prefix}/{slug} (for FRS users)
     *
     * Uses site-relative paths so redirects work on multisite subsites.
     *
     * @return void
     */
    public function redirect_legacy_urls() {
        $request_uri = $_SERVER['REQUEST_URI'] ?? '';

        // Get site-relative path (strips subsite prefix on multisite)
        // e.g. /lending/author/john → /author/john
        $relative_path = $this->get_site_relative_path($request_uri);

        // Redirect /directory/qr/{slug} → /qr/{slug}
        if (preg_match('#^/directory/qr/([^/]+)#', $relative_path, $matches)) {
            $slug = $matches[1];
            wp_redirect(home_url("/qr/{$slug}/"), 301);
            exit;
        }

        // Redirect /directory/{prefix}/{slug} → /{prefix}/{slug}
        if (preg_match('#^/directory/(lo|agent|escrow|pm|staff|leader)/([^/]+)#', $relative_path, $matches)) {
            $prefix = $matches[1];
            $slug = $matches[2];
            wp_redirect(home_url("/{$prefix}/{$slug}/"), 301);
            exit;
        }

        // Redirect /profile/{slug} → determine role and redirect
        if (preg_match('#^/profile/([^/]+)#', $relative_path, $matches)) {
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
                    if ($url_prefix && in_array($role, $user->roles)) {
                        wp_redirect(home_url("/{$url_prefix}/{$slug}/"), 301);
                        exit;
                    }
                }
            }
        }

        // Redirect /author/{slug} to masked URL (if FRS user)
        if (is_author()) {
            $author = get_queried_object();
            if ($author && ($author instanceof \WP_User)) {
                // Only redirect if currently on an /author/ URL
                if (strpos($relative_path, '/author/') === 0) {
                    foreach ($this->role_urls as $role => $url_prefix) {
                        if ($url_prefix && in_array($role, $author->roles)) {
                            wp_redirect(home_url("/{$url_prefix}/{$author->user_nicename}/"), 301);
                            exit;
                        }
                    }
                }
            }
        }
    }

    /**
     * Get the request path relative to the site's home URL
     *
     * On multisite subsites, strips the subsite prefix so pattern matching
     * works regardless of the subsite path.
     * e.g. /lending/author/john-smith → /author/john-smith
     *
     * @param string $request_uri Raw REQUEST_URI
     * @return string Site-relative path
     */
    private function get_site_relative_path($request_uri) {
        $home_path = wp_parse_url(home_url(), PHP_URL_PATH);
        $home_path = $home_path ? trailingslashit($home_path) : '/';

        // Strip the site base path to get the relative portion
        if ($home_path !== '/' && strpos($request_uri, $home_path) === 0) {
            return '/' . substr($request_uri, strlen($home_path));
        }

        return $request_uri;
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
