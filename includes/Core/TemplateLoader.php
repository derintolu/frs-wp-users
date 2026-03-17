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

        // Template loading - load our templates for FRS users (PHP_INT_MAX to override block themes)
        add_filter('template_include', [$this, 'load_profile_template'], PHP_INT_MAX);

        // Rewrite rules - map /lo/{slug} etc. back to author queries
        add_action('init', [$this, 'add_rewrite_rules']);

        // Resolve frs_profile_slug to actual user (for Microsoft SSO users with email-based nicenames)
        add_action('pre_get_posts', [$this, 'resolve_profile_slug'], 1);

        // Legacy URL redirects
        add_action('template_redirect', [$this, 'redirect_legacy_urls'], 1);

        // Remote profile resolution for marketing sites (before 404 is rendered)
        add_action('template_redirect', [$this, 'handle_remote_profile'], 3);

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
        $vars[] = 'frs_profile_slug';
        return $vars;
    }

    /**
     * Resolve frs_profile_slug to actual WordPress user.
     *
     * Users synced from Microsoft SSO have email-based user_nicename values
     * (e.g., "keithfullrealtyservices-com") but we want friendly URLs like
     * "/leader/keith-thompson/". This hook checks frs_profile_slug meta
     * when WordPress can't find a user by the URL slug.
     *
     * @param \WP_Query $query The query object.
     * @return void
     */
    public function resolve_profile_slug($query) {
        // Only run on main query for author archives.
        if (!$query->is_main_query() || is_admin()) {
            return;
        }

        $author_name = $query->get('author_name');
        if (empty($author_name)) {
            return;
        }

        // Check if WordPress already found a user by user_nicename.
        $user = get_user_by('slug', $author_name);
        if ($user) {
            return; // Found by nicename, no intervention needed.
        }

        // Try to find user by frs_profile_slug meta.
        $users = get_users([
            'meta_key'   => 'frs_profile_slug',
            'meta_value' => sanitize_title($author_name),
            'number'     => 1,
        ]);

        if (!empty($users)) {
            $user = $users[0];
            // Update query to use the actual user_nicename.
            $query->set('author_name', $user->user_nicename);
            // Also set author ID for reliability.
            $query->set('author', $user->ID);
        }
    }

    /**
     * Handle remote profile resolution on marketing sites.
     *
     * When a /lo/{slug} URL is hit and there's no local WP user (404),
     * fetch the profile from Twenty CRM and render the template.
     *
     * @return void
     */
    public function handle_remote_profile() {
        // Only on marketing sites (non-editing contexts).
        if ( Roles::is_profile_editing_enabled() ) {
            return;
        }

        // Check if this is a 404 for an author_name query (from our rewrite rules).
        $author_name = get_query_var( 'author_name' );
        if ( empty( $author_name ) ) {
            return;
        }

        // If WP found a local user, let the normal flow handle it.
        if ( ! is_404() ) {
            return;
        }

        // Try to fetch from Twenty CRM.
        $provider = new \FRSUsers\RemoteData\RemoteProfileProvider();
        if ( ! $provider->should_use_remote() ) {
            return;
        }

        $profile = $provider->get_profile_by_slug( $author_name );
        if ( ! $profile ) {
            return; // Genuinely not found — let 404 render.
        }

        // Found in Twenty CRM. Set up the page to render our template.
        global $wp_query;
        $wp_query->is_404    = false;
        $wp_query->is_author = false;

        // Store profile data for the template to pick up.
        set_query_var( 'frs_remote_profile', $profile );

        // Prevent caching.
        if ( ! defined( 'DONOTCACHEPAGE' ) ) {
            define( 'DONOTCACHEPAGE', true );
        }
        nocache_headers();
        status_header( 200 );

        // Load the loan officer template directly.
        $template = FRS_USERS_DIR . 'templates/profile/loan-officer.php';
        if ( file_exists( $template ) ) {
            include $template;
            exit;
        }
    }

    /**
     * Mask author URLs to role-based URLs
     *
     * Changes /author/john-smith to /lo/john-smith for loan officers, etc.
     * Prefers frs_profile_slug over user_nicename for friendly URLs
     * (Microsoft SSO users have email-based nicenames).
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
                // Prefer frs_profile_slug for friendly URLs (SSO users have email-based nicenames).
                $profile_slug = get_user_meta($author_id, 'frs_profile_slug', true);
                $slug = $profile_slug ?: $author_nicename;
                return home_url("/{$url_prefix}/{$slug}/");
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

        // On marketing sites, try remote data if no local user.
        $remote_profile = null;
        if (!$user && !Roles::is_profile_editing_enabled()) {
            $provider = new \FRSUsers\RemoteData\RemoteProfileProvider();
            if ($provider->should_use_remote()) {
                $remote_profile = $provider->get_profile_by_slug($slug);
            }
        }

        if (!$user && !$remote_profile) {
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            nocache_headers();
            include get_404_template();
            exit;
        }

        // Check if active.
        if ($user) {
            $is_active = get_user_meta($user->ID, 'frs_is_active', true);
            if (!$is_active) {
                global $wp_query;
                $wp_query->set_404();
                status_header(404);
                nocache_headers();
                include get_404_template();
                exit;
            }
            $first_name = get_user_meta($user->ID, 'first_name', true);
            $last_name = get_user_meta($user->ID, 'last_name', true);
        } else {
            if (empty($remote_profile['is_active'])) {
                global $wp_query;
                $wp_query->set_404();
                status_header(404);
                nocache_headers();
                include get_404_template();
                exit;
            }
            $first_name = $remote_profile['first_name'] ?? '';
            $last_name = $remote_profile['last_name'] ?? '';
        }

        $full_name = trim($first_name . ' ' . $last_name);

        // Set up fake post for template
        global $wp_query, $post;

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
            // Pass data to template — user object or remote profile.
            if ($user) {
                set_query_var('frs_qr_user', $user);
            } else {
                set_query_var('frs_remote_profile', $remote_profile);
            }
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
     * - /team-member/{slug} → /lo/{slug} (old theme URL structure, with slug aliases)
     * - /lp_our_team_member_category/* → /directory/
     * - /team-members-archive/* → /directory/
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

        // Redirect /team-member/{slug} → /lo/{slug} (old theme URL structure)
        // Also handles legacy slug aliases for users whose URLs changed
        if (preg_match('#^/team-member/([^/]+)#', $relative_path, $matches)) {
            $slug = $matches[1];

            // Legacy slug aliases - old theme used different naming conventions
            $slug_aliases = [
                'blake-anthony-corkill'    => 'blakeanthonycorkill',
                'wendy-lynn-mcgowan'       => 'wendy-mcgowan',
                'zhong-cheng-zhao'         => 'zhong-chengzhao',
                'batesh-mahmud'            => 'batesh-muhmud',
                'daniel-beutter'           => 'dan-beutter',
                'matt-thompson'            => 'matthew-thompson',
                'keith-thompson'           => 'randy-thompson',
                'randy-keith-thompson'     => 'randy-thompson',
            ];

            $resolved_slug = $slug_aliases[$slug] ?? $slug;
            wp_redirect(home_url("/lo/{$resolved_slug}/"), 301);
            exit;
        }

        // Redirect /lp_our_team_member_category/{category} → /directory/
        if (preg_match('#^/lp_our_team_member_category/#', $relative_path)) {
            wp_redirect(home_url('/directory/'), 301);
            exit;
        }

        // Redirect /team-members-archive/ → /directory/
        if (preg_match('#^/team-members-archive/#', $relative_path)) {
            wp_redirect(home_url('/directory/'), 301);
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
