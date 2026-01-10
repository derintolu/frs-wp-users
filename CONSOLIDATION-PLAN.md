# FRS User Profiles - Plugin Consolidation & WordPress-Native Migration Plan

**Date**: 2026-01-09
**Objective**: Consolidate `frs-wp-users` and `frs-profile-directory` into a single WordPress-native FRS personnel directory plugin where all personnel are WordPress users with author capabilities and enhanced profile data.

---

## 🎯 Quick Summary

**What we're doing**: Consolidate two bloated plugins into one clean FRS personnel directory that uses WordPress's native user system.

**Key Changes**:
1. **Merge plugins**: Combine frs-wp-users + frs-profile-directory → single plugin
2. **WordPress-native storage**: Replace custom table → wp_users + wp_usermeta
3. **Role-based URLs**: `/lo/{slug}`, `/agent/{slug}`, `/staff/{slug}`, `/leader/{slug}` based on role
4. **Slugs from display_name**: URL slug = sanitized display_name (e.g., "John Smith" → `/lo/john-smith`)
5. **Business identifiers**: NMLS (loan officers), DRE license (agents), email (staff/leaders) for record matching
6. **Custom roles**: loan_officer, realtor_partner, staff, leadership (with author capabilities)
7. **Frontend-only**: FRS personnel blocked from wp-admin, use frontend portal
8. **Full compatibility**: All REST API, webhooks, integrations remain functional

**Benefits**:
- ✅ FRS profiles = WordPress users (enables post attribution, bylines)
- ✅ Profile pages show FRS directory info + their published posts
- ✅ No custom database tables
- ✅ Works with all WordPress plugins (BuddyPress, LearnDash, etc.)
- ✅ Clean codebase without development bloat
- ✅ Easier to maintain and extend

---

## Executive Summary

### Current State
- **frs-wp-users** (tutorlms-exploration): Custom profile system with 51 fields, guest profiles, REST API, React apps, complex integrations
- **frs-profile-directory** (21stcenturylending): Lightweight hub-and-spoke directory frontend using WordPress Interactivity API
- Both plugins are bloated with development artifacts, documentation, and unused features

### Target State
- Single WordPress-native FRS personnel directory plugin
- All FRS personnel stored as WordPress users with author capabilities (can publish posts, manage content)
- Enhanced profile data (51 custom fields) stored in `wp_usermeta` instead of custom `wp_frs_profiles` table
- Consolidated directory/profile viewing features from both plugins
- Full backwards compatibility with existing REST API, webhooks, and integrations
- Clean, production-ready codebase without development bloat
- Personnel can author blog posts, resources, and content on the site while maintaining their directory profiles

---

## Plugin Analysis

### frs-wp-users Architecture

**Core Features**:
- Custom table: `wp_frs_profiles` (51 fields)
- Profile types: loan_officer, realtor_partner, staff, leadership, assistant
- Guest profiles (user_id = NULL)
- REST API: 20+ endpoints under `frs-users/v1`
- Webhooks with HMAC signatures
- ORM: WP-Eloquent (Laravel-style)
- React apps: Admin dashboard, User portal, Profile editor, Directory, Public profiles
- Integrations: FluentCRM, Follow Up Boss, FRS Sync, DataKit, BuddyPress

**Asset Build**:
- Vite-based builds: 8 separate configs
- Admin app, Frontend app, Portal app, Directory app, Profile editor, Public profile, Widget
- Shadcn UI components, Tailwind CSS, React Router

**Admin Interface**:
- Network admin support (multisite)
- Profile CRUD, Import/Export, Merge duplicates
- DataKit table views

**Shortcodes**:
- `[frs_profile]` - Full portal with sidebar
- `[frs_my_profile]` - My profile only
- `[frs_profile_settings]` - Settings page
- `[frs_welcome]` - Onboarding
- `[frs_profile_directory]` - Public directory
- `[frs_profiles_directory]` - DataKit directory
- `[frs_profiles_dataview]` - DataKit table view

**Gutenberg Blocks**:
- `loan-officer-card` - Single profile card
- `loan-officer-directory` - Directory listing

**Integrations**:
1. **FluentCRM** - Real-time contact sync on profile/user updates
2. **FRS Sync** - Consume agent data from frs-wp-sync plugin
3. **Follow Up Boss** - CRM sync with API keys stored in profile
4. **DataKit** - Admin table views
5. **WordPress Abilities API** - Permission system
6. **Simple Local Avatars** - Avatar sync
7. **BuddyPress** - Social integration

**CLI Commands**:
- `wp frs-users migrate-person-cpt`
- `wp frs-users list-profiles`
- `wp frs-users create-user`
- `wp frs-users generate-slugs`
- `wp frs-users sync-suredash-avatars`
- `wp frs-users generate-qr-codes`
- `wp frs-users generate-vcards`

**Database Migrations**: 10 migrations for schema evolution

**Bloat**:
- 75+ files/folders in root (docs, planning docs, .git, node_modules, etc.)
- Multiple documentation markdown files (CLAUDE.md, COMPONENT-INDEX.md, FRS-SHORTCODES.md, LANDING-PAGE-PLAN.md, MONDAY-MVP-SPRINT.md, etc.)
- Development tools: .storybook, .cursor, .worktrees, .playwright-mcp
- Git repository with full history

---

### frs-profile-directory Architecture

**Core Features**:
- Hub-and-spoke model for distributed deployments
- Fetches profiles via REST API from frs-wp-users
- WordPress Interactivity API (no React/heavy JS)
- Lightweight directory and profile pages
- vCard generation and downloads
- QR code landing pages
- Blocksy theme integration via custom post types

**URL Routes**:
- `/directory` - Full directory listing
- `/directory/lo/{slug}` - Single profile page
- `/directory/qr/{slug}` - QR landing page with contact options

**REST Endpoints**:
- `GET /frs-directory/v1/vcard/{slug}` - Download vCard
- `POST /frs-directory/v1/contact` - Contact form submission

**Templates** (PHP + Interactivity API):
- `directory.php` - Directory listing with search/filter
- `lo-profile.php` - Single profile display
- `qr-landing.php` - QR code landing page

**Settings**:
- Site mode: hub_auto, hub_custom, client (spoke)
- Hub URL configuration
- Directory headline/subheadline
- Video background URL

**Gutenberg Blocks**:
- `lo-directory` - Directory block
- `lo-card` - Profile card block
- `lo-detail` - Profile detail block

**Custom Post Types** (for Blocksy styling):
- `frs_lo_profile` - Individual profile page styling
- `frs_lo_directory` - Directory page styling

**Features**:
- API caching (5 minutes)
- Embeddable widgets for external sites
- iFrame embed codes
- Contact form with email notifications
- Service area filtering

**AJAX Handlers**:
- Regenerate QR codes (calls frs-wp-users CLI)
- Regenerate vCards

---

## Consolidation Strategy

### Phase 1: Merge frs-profile-directory into frs-wp-users

**Action Items**:
1. Copy Interactivity API templates to frs-wp-users
2. Merge Gutenberg blocks
3. Merge vCard generator and QR landing pages
4. Add hub-and-spoke settings to frs-wp-users
5. Create migration script for existing frs-profile-directory installations
6. Update REST API to support hub-and-spoke mode

**Benefits**:
- Single plugin to maintain
- Unified settings and configuration
- Eliminates API client code duplication
- Simpler deployment

**File Structure After Merge**:
```
frs-wp-users/
├── includes/
│   ├── Core/
│   │   ├── HubSpoke.php (new - manages hub/spoke mode)
│   │   └── ... (existing core files)
│   ├── Frontend/
│   │   ├── InteractivityDirectory.php (new - Interactivity API directory)
│   │   └── ... (existing)
│   └── ...
├── templates/
│   ├── interactivity/
│   │   ├── directory.php (from frs-profile-directory)
│   │   ├── lo-profile.php (from frs-profile-directory)
│   │   └── qr-landing.php (from frs-profile-directory)
│   └── ... (existing)
├── blocks/
│   ├── lo-directory/ (merged)
│   ├── lo-card/ (merged)
│   └── ...
└── ...
```

---

### Phase 2: WordPress-Native User Migration

**Goal**: Replace custom `wp_frs_profiles` table with WordPress native `wp_users` + `wp_usermeta`

**Why This Matters**:
Making FRS personnel WordPress users with author capabilities enables:
- ✅ **Content Authorship**: Loan officers can write blog posts, market updates, buyer guides, etc.
- ✅ **Bylines**: Posts automatically show "By [Loan Officer Name]" with their profile link
- ✅ **Author Archives**: `/author/john-smith` shows all posts + profile info
- ✅ **WordPress Native UI**: Manage users via WordPress Users page (familiar interface)
- ✅ **Plugin Compatibility**: Works with comments, BuddyPress, bbPress, LearnDash, etc.
- ✅ **Simplified Architecture**: No custom tables, uses WordPress's battle-tested user system
- ✅ **Better Performance**: WordPress user queries are highly optimized
- ✅ **SSO Integration**: Can use standard WordPress SSO plugins (OAuth, SAML, etc.)

#### 2.1 Data Mapping Strategy

**WordPress Core Fields** (wp_users table):
| Custom Field | WP Field | Notes |
|--------------|----------|-------|
| `email` | `user_email` | Primary identifier |
| `first_name` | meta: `first_name` | Core usermeta |
| `last_name` | meta: `last_name` | Core usermeta |
| `display_name` | `display_name` | Core field |
| `user_id` | `ID` | Primary key |

**User Role Assignment**:
All FRS personnel get custom WordPress roles with **author-level capabilities** (can publish posts, upload media, edit their own content).

| Profile Type | WordPress Role | Capabilities |
|--------------|----------------|--------------|
| `loan_officer` | `loan_officer` (custom) | Author capabilities + frs_edit_profile |
| `realtor_partner` | `realtor_partner` (custom) | Author capabilities + frs_edit_profile |
| `staff` | `staff` (custom) | Author capabilities + frs_edit_profile |
| `leadership` | `leadership` (custom) | Editor capabilities + manage_frs_profiles |
| `assistant` | `assistant` (custom) | Contributor capabilities + frs_edit_profile |

**Key Capabilities Added**:
- `read` - Read access to site content
- `edit_posts` - Create and edit their own posts (via frontend only)
- `publish_posts` - Publish posts (for bylines and author attribution)
- `upload_files` - Upload images and media (via frontend portal)
- `edit_published_posts` - Edit their own published content (via frontend)
- `frs_edit_profile` - Edit their FRS profile data (via frontend portal)
- `manage_frs_profiles` - Manage all FRS profiles (leadership only, via frontend)

**IMPORTANT - No Backend Access**:
- ❌ FRS personnel are **blocked from wp-admin** (see below)
- ✅ All editing happens via **frontend portal** (React app)
- ✅ Author capabilities enable WordPress features (bylines, author archives, post queries)
- ✅ Profile editing via frontend portal shortcode `[frs_my_profile]`
- ✅ Content publishing (if enabled) via frontend editor

**Custom Meta Fields** (wp_usermeta):
All 51 custom fields → `wp_usermeta` with prefix `frs_`:
- `frs_headshot_id` - Avatar attachment ID
- `frs_job_title`
- `frs_biography`
- `frs_date_of_birth`
- `frs_phone_number`
- `frs_mobile_number`
- `frs_office`
- `frs_nmls`
- `frs_nmls_number`
- `frs_license_number`
- `frs_dre_license`
- `frs_specialties_lo` (JSON)
- `frs_specialties` (JSON)
- `frs_languages` (JSON)
- `frs_awards` (JSON)
- `frs_nar_designations` (JSON)
- `frs_namb_certifications` (JSON)
- `frs_brand`
- `frs_status`
- `frs_city_state`
- `frs_region`
- `frs_facebook_url`
- `frs_instagram_url`
- `frs_linkedin_url`
- `frs_twitter_url`
- `frs_youtube_url`
- `frs_tiktok_url`
- `frs_arrive`
- `frs_canva_folder_link`
- `frs_niche_bio_content`
- `frs_personal_branding_images` (JSON)
- `frs_loan_officer_profile`
- `frs_loan_officer_user`
- `frs_profile_slug` (unique - requires validation)
- `frs_profile_headline`
- `frs_profile_visibility` (JSON)
- `frs_profile_theme`
- `frs_custom_links` (JSON)
- `frs_service_areas` (JSON)
- `frs_is_active` (boolean)
- `frs_synced_to_fluentcrm_at` (timestamp)
- `frs_frs_agent_id` (external ID)
- `frs_qr_code_data`
- `frs_followupboss_api_key`
- `frs_followupboss_status` (JSON)
- `frs_notification_settings` (JSON)
- `frs_privacy_settings` (JSON)

#### 2.2 Guest Profile Handling

**Problem**: Current system supports guest profiles (user_id = NULL)

**Solutions**:

**Option A: Convert all to WordPress users** (Recommended)
- Create WordPress users for all guest profiles
- Set random password, mark as "inactive" until user claims account
- Add `frs_is_guest_profile` meta flag
- Add "Claim Profile" workflow with email verification

**Option B: Maintain separate guest table**
- Keep `wp_frs_profiles` for guest profiles only
- Linked profiles use `wp_users` + `wp_usermeta`
- Hybrid ORM: check both sources

**Recommendation**: **Option A** - Simplifies architecture, enables unified user management

#### 2.3 Profile Slug System & Role-Based URLs

**Current**: Custom rewrite rule `/profile/{slug}` → custom template

**New Approach**: Role-based URLs with custom rewrite rules

**URL Structure by Role**:
| Role | URL Pattern | Example |
|------|-------------|---------|
| Loan Officer | `/lo/{slug}` | `/lo/john-smith` |
| Realtor Partner | `/agent/{slug}` | `/agent/jane-doe` |
| Staff | `/staff/{slug}` | `/staff/bob-jones` |
| Leadership | `/leader/{slug}` | `/leader/mary-williams` |
| Assistant | `/staff/{slug}` | `/staff/susan-brown` |

**Slug System**:
- Slugs generated from `display_name` → `user_nicename` (WordPress auto-sanitizes)
- Example: "John Smith" → `john-smith`
- WordPress ensures uniqueness (appends `-2`, `-3` if duplicate)
- Preserve existing custom slugs during migration via `frs_custom_slug` meta

**Business Identifiers** (for record matching/deduplication):
- **Loan Officers**: NMLS number (stored in `frs_nmls`)
- **Agents**: DRE license number (stored in `frs_dre_license`)
- **Leaders/Staff**: Email address (WordPress `user_email`)
- **Use cases**: Import matching, duplicate detection, external system sync, API lookups

**Example - Finding user by identifier**:
```php
// Find loan officer by NMLS
function get_user_by_nmls($nmls) {
    $users = get_users([
        'meta_key' => 'frs_nmls',
        'meta_value' => $nmls,
        'number' => 1,
    ]);
    return $users ? $users[0] : null;
}

// Find agent by DRE license
function get_user_by_dre($dre) {
    $users = get_users([
        'meta_key' => 'frs_dre_license',
        'meta_value' => $dre,
        'number' => 1,
    ]);
    return $users ? $users[0] : null;
}

// Find staff/leader by email
$user = get_user_by('email', $email);
```

**Rewrite Rules**:
```php
// Core/Template.php
public function register_rewrite_rules() {
    add_rewrite_rule(
        '^lo/([^/]+)/?$',
        'index.php?frs_profile=$matches[1]&frs_role=loan_officer',
        'top'
    );

    add_rewrite_rule(
        '^agent/([^/]+)/?$',
        'index.php?frs_profile=$matches[1]&frs_role=realtor_partner',
        'top'
    );

    add_rewrite_rule(
        '^staff/([^/]+)/?$',
        'index.php?frs_profile=$matches[1]&frs_role=staff',
        'top'
    );

    add_rewrite_rule(
        '^leader/([^/]+)/?$',
        'index.php?frs_profile=$matches[1]&frs_role=leadership',
        'top'
    );
}

public function add_query_vars($vars) {
    $vars[] = 'frs_profile';
    $vars[] = 'frs_role';
    return $vars;
}
```

**Template Loading**:
```php
public function handle_profile_template() {
    $slug = get_query_var('frs_profile');
    $role = get_query_var('frs_role');

    if (!$slug || !$role) {
        return;
    }

    // Get user by slug
    $user = $this->get_user_by_slug($slug, $role);

    if (!$user) {
        global $wp_query;
        $wp_query->set_404();
        return;
    }

    // Load role-specific template
    $templates = [
        FRS_USERS_DIR . "templates/profile-{$role}.php",
        FRS_USERS_DIR . 'templates/profile.php',
    ];

    foreach ($templates as $template) {
        if (file_exists($template)) {
            include $template;
            exit;
        }
    }
}
```

**Benefits**:
- ✅ Clean, role-based URLs: `/lo/john-smith`, `/agent/jane-doe`
- ✅ Better SEO (descriptive URLs)
- ✅ Easy to identify role from URL
- ✅ Backwards compatible: redirect `/profile/{slug}` → `/lo/{slug}` with 301
- ✅ Shows FRS profile + their published posts on same page

#### 2.4 Avatar/Headshot Handling

**Current**: `headshot_id` references `wp_posts` (attachment)

**WordPress-Native**:
- Use WordPress native avatar system
- Store attachment ID in `frs_headshot_id` usermeta
- Filter `get_avatar` to use custom headshot
- Maintain Simple Local Avatars integration

---

### Phase 3: New Plugin Architecture

#### 3.1 Profile Template System (Masked Author URLs)

**Approach**: Use WordPress native author system but mask the URLs from `/author/` to role-based slugs.

**URL Masking Strategy**:
```php
// Change author URLs from /author/{slug} to /lo/{slug}, /agent/{slug}, etc.
add_filter('author_link', function($link, $author_id) {
    $user = get_userdata($author_id);
    if (!$user) return $link;

    $role_urls = [
        'loan_officer' => 'lo',
        'realtor_partner' => 'agent',
        'staff' => 'staff',
        'leadership' => 'leader',
        'assistant' => 'staff',
    ];

    foreach ($role_urls as $role => $slug_prefix) {
        if (in_array($role, $user->roles)) {
            return str_replace('/author/', "/{$slug_prefix}/", $link);
        }
    }

    return $link;
}, 10, 2);

// Add rewrite rules to map /lo/{slug} back to author query
add_action('init', function() {
    add_rewrite_rule('^lo/([^/]+)/?$', 'index.php?author_name=$matches[1]', 'top');
    add_rewrite_rule('^agent/([^/]+)/?$', 'index.php?author_name=$matches[1]', 'top');
    add_rewrite_rule('^staff/([^/]+)/?$', 'index.php?author_name=$matches[1]', 'top');
    add_rewrite_rule('^leader/([^/]+)/?$', 'index.php?author_name=$matches[1]', 'top');
});
```

**Existing Template Adaptation** (`templates/`):
```
templates/
├── profile/
│   ├── lo-profile.php - EXISTING loan officer template (ADAPT THIS)
│   ├── agent-profile.php - Realtor profile template (create)
│   ├── staff-profile.php - Staff member template (create)
│   ├── leader-profile.php - Leadership template (create)
│   └── partials/
│       ├── profile-header.php - Profile header (from existing)
│       ├── profile-bio.php - Biography section (from existing)
│       ├── profile-credentials.php - NMLS, licenses (from existing)
│       ├── profile-social.php - Social media links (from existing)
│       ├── profile-contact-form.php - Contact form (from existing)
│       └── profile-posts.php - Posts by this person (NEW)
```

**TODO: Adapt Existing LO Template**:
The existing LO template needs to be:
1. ✅ Located and analyzed (where is it currently?)
2. ✅ Adapted to pull from `wp_users` + `wp_usermeta` instead of `wp_frs_profiles`
3. ✅ Updated to use `WP_User` object and `UserProfile` model
4. ✅ Modified to include published posts section (if user has posts)
5. ✅ Tested with masked `/lo/{slug}` URLs

**Template Loading Logic**:
```php
// Core/Template.php
class Template {
    public function init() {
        add_filter('template_include', [$this, 'load_author_template'], 99);
        add_filter('author_link', [$this, 'custom_author_slug'], 10, 3);
    }

    public function load_author_template($template) {
        if (!is_author()) {
            return $template;
        }

        $author = get_queried_object();

        // Check if user has FRS role
        $frs_roles = ['loan_officer', 'realtor_partner', 'staff', 'leadership', 'assistant'];
        $user_roles = $author->roles ?? [];
        $has_frs_role = !empty(array_intersect($frs_roles, $user_roles));

        if (!$has_frs_role) {
            return $template; // Use theme's author template for non-FRS users
        }

        // Check theme for custom template first
        $theme_templates = [
            get_stylesheet_directory() . "/author-{$author->user_nicename}.php",
            get_stylesheet_directory() . "/author-{$user_roles[0]}.php",
            get_stylesheet_directory() . '/author-frs.php',
        ];

        foreach ($theme_templates as $theme_template) {
            if (file_exists($theme_template)) {
                return $theme_template;
            }
        }

        // Fallback to plugin templates
        $plugin_templates = [
            FRS_USERS_DIR . "templates/author/author-{$user_roles[0]}.php",
            FRS_USERS_DIR . 'templates/author/author.php',
        ];

        foreach ($plugin_templates as $plugin_template) {
            if (file_exists($plugin_template)) {
                return $plugin_template;
            }
        }

        return $template;
    }

    // Support custom slugs via user meta
    public function custom_author_slug($link, $author_id, $author_nicename) {
        $custom_slug = get_user_meta($author_id, 'frs_custom_slug', true);
        if ($custom_slug) {
            return str_replace($author_nicename, $custom_slug, $link);
        }
        return $link;
    }
}
```

**Theme Override Support**:
Themes can override by creating:
- `author.php` - Override all FRS author pages
- `author-loan_officer.php` - Override only loan officer pages
- `author-{user_nicename}.php` - Override specific user's page

**Directory Integration**:
The FRS directory page lists all FRS personnel and links to their **author archive pages**:
```php
// In directory template
foreach ($loan_officers as $lo) {
    $author_url = get_author_posts_url($lo->ID);
    echo '<a href="' . $author_url . '">' . $lo->display_name . '</a>';
    // Links to: /author/john-smith (WordPress native URL)
}
```

This creates a seamless experience:
- Directory → `/directory` (all FRS personnel)
- Individual Profile → `/author/john-smith` (profile + their posts)
- Profile posts are automatically included via WordPress author archive
- Bylines on blog posts automatically link to `/author/john-smith`

#### 3.2 Core Plugin Structure

```
frs-user-profiles/
├── frs-user-profiles.php (main file)
├── plugin.php (main class)
├── includes/
│   ├── Core/
│   │   ├── Install.php (activation, create custom roles)
│   │   ├── Migration.php (migrate from old system)
│   │   ├── UserProfile.php (main user profile class)
│   │   ├── ProfileStorage.php (avatar/headshot sync)
│   │   ├── ProfileApi.php (REST API - backwards compatible)
│   │   ├── Webhooks.php (webhook system)
│   │   ├── HubSpoke.php (hub-and-spoke mode)
│   │   ├── Template.php (profile URL routing)
│   │   └── CLI.php (WP-CLI commands)
│   ├── Admin/
│   │   ├── UsersPage.php (extend WP users page)
│   │   ├── ProfileFields.php (custom user fields)
│   │   └── Settings.php (plugin settings)
│   ├── Frontend/
│   │   ├── PublicProfile.php (public profile display)
│   │   ├── DirectoryShortcode.php (directory shortcode)
│   │   └── InteractivityDirectory.php (Interactivity API directory)
│   ├── Integrations/
│   │   ├── FluentCRMSync.php
│   │   ├── FRSSync.php
│   │   ├── FollowUpBoss.php
│   │   └── BuddyPress.php
│   ├── Models/
│   │   └── UserProfile.php (wrapper around WP_User with custom getters/setters)
│   └── Routes/
│       └── Api.php (REST routes)
├── templates/
│   ├── public-profile.php
│   ├── directory.php
│   ├── interactivity/ (Interactivity API templates)
│   │   ├── directory.php
│   │   ├── profile.php
│   │   └── qr-landing.php
│   └── admin/
│       └── profile-fields.php
├── blocks/ (Gutenberg blocks)
├── assets/ (CSS, JS, images)
├── vendor/ (Composer dependencies)
└── uninstall.php
```

#### 3.2 UserProfile Model (WordPress-Native Wrapper)

```php
<?php
namespace FRSUsers\Models;

class UserProfile {
    private WP_User $user;

    public function __construct($user_id_or_email) {
        // Load WP_User
        // Lazy-load all meta fields
    }

    // Getters/setters for all custom fields
    public function get_first_name(): string { return get_user_meta($this->user->ID, 'first_name', true); }
    public function get_headshot_url(): string { /* get from frs_headshot_id */ }
    public function get_service_areas(): array { return json_decode(get_user_meta($this->user->ID, 'frs_service_areas', true), true) ?: []; }

    // Profile slug (with fallback to user_nicename)
    public function get_profile_slug(): string {
        $custom = get_user_meta($this->user->ID, 'frs_custom_slug', true);
        return $custom ?: $this->user->user_nicename;
    }

    // Save method
    public function save(): bool {
        // Update wp_users fields
        // Update all meta fields
        // Fire webhooks
        // Sync to integrations
    }

    // Static factory methods
    public static function find($id): ?self { /* ... */ }
    public static function get_by_email($email): ?self { /* ... */ }
    public static function get_by_slug($slug): ?self { /* ... */ }
    public static function get_all($args = []): array { /* use WP_User_Query */ }
    public static function get_by_type($role, $args = []): array { /* WP_User_Query with role */ }
}
```

#### 3.3 Backwards Compatibility Layer

**CRITICAL**: We maintain 100% backwards compatibility through a **dual-layer system**.

### Strategy 1: Keep Custom Table + Update Model Layer

**Keep the table** but change WHERE the model reads/writes:

```php
// includes/Models/Profile.php (UPDATED - not replaced)
namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

class Profile extends Model {
    protected $table = 'frs_profiles';

    /**
     * OVERRIDE: Read from wp_users + wp_usermeta instead of table
     */
    public static function find($id) {
        // Check if this is a legacy profile ID
        $user_id = get_option("frs_legacy_profile_{$id}");

        if (!$user_id) {
            // Try direct user ID
            $user_id = $id;
        }

        $user = get_userdata($user_id);
        if (!$user) {
            return null;
        }

        // Return object with same structure as before
        return self::hydrate_from_user($user);
    }

    public static function get_all($args = []) {
        // Convert to WP_User_Query
        $wp_args = [
            'role__in' => ['loan_officer', 'realtor_partner', 'staff', 'leadership', 'assistant'],
            'number' => $args['per_page'] ?? 100,
            'offset' => (($args['page'] ?? 1) - 1) * ($args['per_page'] ?? 100),
        ];

        if (!empty($args['type'])) {
            $role_map = [
                'loan_officer' => 'loan_officer',
                'realtor_partner' => 'realtor_partner',
                'staff' => 'staff',
                'leadership' => 'leadership',
            ];
            $wp_args['role__in'] = [$role_map[$args['type']]];
        }

        $users = get_users($wp_args);

        // Hydrate to Profile objects (same structure as before)
        return array_map([self::class, 'hydrate_from_user'], $users);
    }

    /**
     * Convert WP_User to Profile object (maintains same API)
     */
    private static function hydrate_from_user($user) {
        $profile = new self();

        // Map WP fields to old structure
        $profile->id = $user->ID;
        $profile->user_id = $user->ID;
        $profile->email = $user->user_email;
        $profile->display_name = $user->display_name;
        $profile->first_name = get_user_meta($user->ID, 'first_name', true);
        $profile->last_name = get_user_meta($user->ID, 'last_name', true);

        // Map all custom fields
        $profile->phone_number = get_user_meta($user->ID, 'frs_phone_number', true);
        $profile->mobile_number = get_user_meta($user->ID, 'frs_mobile_number', true);
        $profile->job_title = get_user_meta($user->ID, 'frs_job_title', true);
        $profile->biography = get_user_meta($user->ID, 'frs_biography', true);
        $profile->nmls = get_user_meta($user->ID, 'frs_nmls', true);
        $profile->headshot_id = get_user_meta($user->ID, 'frs_headshot_id', true);
        $profile->city_state = get_user_meta($user->ID, 'frs_city_state', true);
        $profile->profile_slug = $user->user_nicename;

        // JSON fields
        $profile->specialties_lo = json_decode(get_user_meta($user->ID, 'frs_specialties_lo', true), true) ?: [];
        $profile->service_areas = json_decode(get_user_meta($user->ID, 'frs_service_areas', true), true) ?: [];
        $profile->custom_links = json_decode(get_user_meta($user->ID, 'frs_custom_links', true), true) ?: [];

        // ... all other fields

        $profile->exists = true;
        return $profile;
    }

    /**
     * OVERRIDE: Save to wp_users + wp_usermeta instead of table
     */
    public function save() {
        if (!$this->user_id) {
            throw new \Exception('Cannot save profile without user_id');
        }

        // Update wp_users
        wp_update_user([
            'ID' => $this->user_id,
            'display_name' => $this->display_name,
            'user_email' => $this->email,
        ]);

        // Update all meta fields
        update_user_meta($this->user_id, 'first_name', $this->first_name);
        update_user_meta($this->user_id, 'last_name', $this->last_name);
        update_user_meta($this->user_id, 'frs_phone_number', $this->phone_number);
        update_user_meta($this->user_id, 'frs_mobile_number', $this->mobile_number);
        update_user_meta($this->user_id, 'frs_job_title', $this->job_title);
        update_user_meta($this->user_id, 'frs_biography', $this->biography);
        update_user_meta($this->user_id, 'frs_nmls', $this->nmls);
        update_user_meta($this->user_id, 'frs_headshot_id', $this->headshot_id);

        // JSON fields
        update_user_meta($this->user_id, 'frs_specialties_lo', json_encode($this->specialties_lo ?: []));
        update_user_meta($this->user_id, 'frs_service_areas', json_encode($this->service_areas ?: []));

        // ... all other fields

        // Fire same hooks as before
        do_action('frs_profile_saved', $this);

        return true;
    }
}
```

### Strategy 2: REST API Maintains Same Structure

**No changes to REST API responses** - just different data source:

```php
// Routes/Api.php - NO CHANGES TO ENDPOINTS
Route::get('/profiles', 'ProfileController@index'); // Still works
Route::get('/profiles/{id}', 'ProfileController@show'); // Still works
Route::get('/profiles/slug/{slug}', 'ProfileController@by_slug'); // Still works

// Controllers/ProfileController.php - NO CHANGES TO OUTPUT
public function index($request) {
    $profiles = Profile::get_all($request->get_params());

    // Returns SAME JSON structure as before
    // But Profile model now reads from wp_users
    return rest_ensure_response([
        'success' => true,
        'data' => $profiles,
    ]);
}
```

### Strategy 3: Database View (Optional Fallback)

For any **direct database queries**, create a VIEW:

```sql
-- Migration creates this VIEW
CREATE OR REPLACE VIEW wp_frs_profiles AS
SELECT
    u.ID as id,
    u.ID as user_id,
    u.user_email as email,
    u.display_name,
    u.user_nicename as profile_slug,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'first_name') as first_name,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'last_name') as last_name,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'frs_phone_number') as phone_number,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'frs_nmls') as nmls,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'frs_biography') as biography,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'frs_headshot_id') as headshot_id,
    -- ... all 51 fields
    u.user_registered as created_at,
    (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'frs_profile_updated_at') as updated_at
FROM wp_users u
WHERE u.ID IN (
    SELECT user_id FROM wp_usermeta
    WHERE meta_key = 'wp_capabilities'
    AND (
        meta_value LIKE '%loan_officer%' OR
        meta_value LIKE '%realtor_partner%' OR
        meta_value LIKE '%staff%' OR
        meta_value LIKE '%leadership%'
    )
);
```

**Result**: Any old code doing `SELECT * FROM wp_frs_profiles` still works!

### Strategy 4: Migration Phase Approach

**Phase 1 (Migration)**:
- ✅ Migrate all data to wp_users + wp_usermeta
- ✅ Keep original `wp_frs_profiles` table (rename to `wp_frs_profiles_legacy`)
- ✅ Store mapping: `frs_legacy_profile_{old_id}` → `{new_user_id}`

**Phase 2 (Compatibility)**:
- ✅ Update Profile model to read from wp_users (but maintain same API)
- ✅ Create database VIEW `wp_frs_profiles` → wp_users
- ✅ Test all REST API endpoints
- ✅ Test all integrations (FluentCRM, Follow Up Boss, etc.)

**Phase 3 (Monitor - 6 months)**:
- ✅ Add logging for any direct table queries
- ✅ Monitor VIEW usage
- ✅ Admin notice: "Using legacy compatibility mode"

**Phase 4 (Cleanup - after 6 months)**:
- ✅ Drop VIEW if unused
- ✅ Drop `wp_frs_profiles_legacy` table
- ✅ Remove compatibility layer from Profile model

### What Remains Compatible

✅ **All REST API endpoints** (same URLs, same JSON structure)
```php
GET /wp-json/frs-users/v1/profiles
GET /wp-json/frs-users/v1/profiles/123
GET /wp-json/frs-users/v1/profiles/slug/john-smith
POST /wp-json/frs-users/v1/profiles
```

✅ **All Model methods** (same API)
```php
Profile::find($id) // Still works
Profile::get_all() // Still works
Profile::get_by_email($email) // Still works
$profile->save() // Still works
```

✅ **All Eloquent queries** (updated internally)
```php
Profile::where('select_person_type', 'loan_officer')->get() // Still works
Profile::whereNotNull('nmls')->get() // Still works
```

✅ **All webhooks** (same events)
```php
do_action('frs_profile_saved', $profile) // Still fires
```

✅ **All integrations**
- FluentCRM sync hooks still fire
- Follow Up Boss API still works
- FRS Sync agent import still works

### What Changes (Internal Only)

❌ **Direct database queries** (must use Model or VIEW)
```php
// OLD (breaks)
$wpdb->get_results("SELECT * FROM wp_frs_profiles");

// FIX 1: Use Model
Profile::get_all();

// FIX 2: Use VIEW (if created)
$wpdb->get_results("SELECT * FROM wp_frs_profiles"); // Works via VIEW
```

### Summary: Zero Breaking Changes

**For external systems/plugins**: Nothing changes
- Same REST API endpoints
- Same JSON structure
- Same webhook events
- Same Profile model API

**Internal changes only**:
- Data stored in wp_users instead of custom table
- Profile model reads/writes to wp_users (transparently)
- Database VIEW provides fallback for direct queries

---

### Phase 4: Migration Script

#### 4.1 Data Migration Steps

```php
/**
 * WP-CLI: wp frs-users migrate-to-native
 */
class MigrateToNative {
    public function migrate($args, $assoc_args) {
        global $wpdb;

        // 1. Get all profiles
        $profiles = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}frs_profiles");

        $stats = [
            'total' => count($profiles),
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [],
        ];

        foreach ($profiles as $profile) {
            try {
                $this->migrate_profile($profile);
                $stats['created']++;
            } catch (Exception $e) {
                $stats['errors'][] = sprintf(
                    'Profile %d (%s): %s',
                    $profile->id,
                    $profile->email,
                    $e->getMessage()
                );
                $stats['skipped']++;
            }

            WP_CLI::log("Migrated: {$profile->email}");
        }

        WP_CLI::success(sprintf(
            'Migration complete: %d created, %d skipped, %d errors',
            $stats['created'],
            $stats['skipped'],
            count($stats['errors'])
        ));

        if (!empty($stats['errors'])) {
            WP_CLI::warning('Errors:');
            foreach ($stats['errors'] as $error) {
                WP_CLI::log('  - ' . $error);
            }
        }
    }

    private function migrate_profile($profile) {
        // Check if user already exists
        if ($profile->user_id) {
            $user = get_user_by('ID', $profile->user_id);
            if (!$user) {
                throw new Exception('Linked user not found');
            }
        } else {
            // Guest profile - create new user
            $user = get_user_by('email', $profile->email);
            if (!$user) {
                $user_id = wp_create_user(
                    sanitize_user($profile->email),
                    wp_generate_password(),
                    $profile->email
                );

                if (is_wp_error($user_id)) {
                    throw new Exception($user_id->get_error_message());
                }

                $user = get_user_by('ID', $user_id);
                update_user_meta($user_id, 'frs_is_guest_profile', true);
            }
        }

        // Set role based on profile type
        $role_map = [
            'loan_officer' => 'loan_officer',
            'realtor_partner' => 'realtor',
            'staff' => 'staff',
            'leadership' => 'administrator',
            'assistant' => 'assistant',
        ];

        if (isset($role_map[$profile->select_person_type])) {
            $user->set_role($role_map[$profile->select_person_type]);
        }

        // Update wp_users fields
        $display_name = $profile->display_name ?: trim($profile->first_name . ' ' . $profile->last_name);

        wp_update_user([
            'ID' => $user->ID,
            'display_name' => $display_name,
            'first_name' => $profile->first_name,
            'last_name' => $profile->last_name,
            'user_nicename' => $profile->profile_slug ?: sanitize_title($display_name), // Slug from display_name
        ]);

        // Store custom slug if different from display_name slug
        if ($profile->profile_slug && $profile->profile_slug !== sanitize_title($display_name)) {
            update_user_meta($user->ID, 'frs_custom_slug', $profile->profile_slug);
        }

        // Migrate all meta fields
        $meta_fields = [
            'job_title', 'biography', 'date_of_birth', 'phone_number', 'mobile_number',
            'office', 'nmls', 'nmls_number', 'license_number', 'dre_license',
            'specialties_lo', 'specialties', 'languages', 'awards', 'nar_designations',
            'namb_certifications', 'brand', 'status', 'city_state', 'region',
            'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url',
            'youtube_url', 'tiktok_url', 'arrive', 'canva_folder_link',
            'niche_bio_content', 'personal_branding_images', 'loan_officer_profile',
            'loan_officer_user', 'profile_slug', 'profile_headline', 'profile_visibility',
            'profile_theme', 'custom_links', 'service_areas', 'is_active',
            'synced_to_fluentcrm_at', 'frs_agent_id', 'qr_code_data',
            'followupboss_api_key', 'followupboss_status', 'notification_settings',
            'privacy_settings', 'headshot_id'
        ];

        foreach ($meta_fields as $field) {
            if (isset($profile->$field) && $profile->$field !== null) {
                update_user_meta($user->ID, 'frs_' . $field, $profile->$field);
            }
        }

        // Store legacy profile ID for backwards compatibility
        update_option("frs_legacy_profile_{$profile->id}", $user->ID);
        update_user_meta($user->ID, 'frs_legacy_profile_id', $profile->id);
    }
}
```

#### 4.2 Custom User Roles

```php
class Install {
    public function create_custom_roles() {
        // Get author role capabilities as base
        $author_caps = get_role('author')->capabilities;

        // Loan Officer role - Full author capabilities + FRS profile management
        add_role('loan_officer', 'Loan Officer', array_merge($author_caps, [
            'frs_edit_profile' => true,
            'frs_view_directory' => true,
        ]));

        // Realtor Partner role - Full author capabilities + FRS profile management
        add_role('realtor_partner', 'Realtor Partner', array_merge($author_caps, [
            'frs_edit_profile' => true,
            'frs_view_directory' => true,
        ]));

        // Staff role - Author capabilities + FRS profile management
        add_role('staff', 'Staff Member', array_merge($author_caps, [
            'frs_edit_profile' => true,
            'frs_view_directory' => true,
        ]));

        // Leadership role - Editor capabilities + manage all FRS profiles
        $editor_caps = get_role('editor')->capabilities;
        add_role('leadership', 'Leadership', array_merge($editor_caps, [
            'frs_edit_profile' => true,
            'frs_manage_profiles' => true,
            'frs_view_directory' => true,
        ]));

        // Assistant role - Contributor capabilities + FRS profile management
        $contributor_caps = get_role('contributor')->capabilities;
        add_role('assistant', 'Assistant', array_merge($contributor_caps, [
            'frs_edit_profile' => true,
            'frs_view_directory' => true,
        ]));
    }
}
```

**Author Capabilities Include**:
- `read` - Read site content (but NOT wp-admin access - see below)
- `edit_posts` - Create and edit their own posts (via frontend portal)
- `delete_posts` - Delete their own posts (via frontend portal)
- `publish_posts` - Publish posts (enables bylines and author archives)
- `upload_files` - Upload images, PDFs, and media (via frontend portal)
- `edit_published_posts` - Edit their own published posts (via frontend)
- `delete_published_posts` - Delete their own published posts (via frontend)

**Blocking wp-admin Access**:
```php
// Core/FrontendOnly.php
class FrontendOnly {
    public function init() {
        add_action('admin_init', [$this, 'block_admin_access']);
        add_filter('show_admin_bar', [$this, 'hide_admin_bar']);
    }

    public function block_admin_access() {
        $user = wp_get_current_user();
        $frs_roles = ['loan_officer', 'realtor_partner', 'staff', 'assistant'];

        // Block FRS users from wp-admin (except AJAX requests)
        if (array_intersect($frs_roles, $user->roles) && !wp_doing_ajax()) {
            wp_redirect(home_url('/my-profile')); // Redirect to frontend portal
            exit;
        }
    }

    public function hide_admin_bar($show) {
        $user = wp_get_current_user();
        $frs_roles = ['loan_officer', 'realtor_partner', 'staff', 'assistant'];

        if (array_intersect($frs_roles, $user->roles)) {
            return false; // Hide admin bar for FRS users
        }

        return $show;
    }
}
```

**Frontend Portal**:
All FRS user interactions happen via frontend:
- Profile editing → `/my-profile` (React app via `[frs_my_profile]` shortcode)
- Settings → `/my-profile/settings` (React portal)
- Media uploads → Frontend upload component (headshot, documents)
- Dashboard → `/dashboard` (React portal via `[frs_profile]` shortcode)

**Content Publishing**:
Content publishing is handled by a **separate plugin** (not this plugin's concern):
- This plugin only provides author capabilities for attribution
- Published posts automatically appear on `/author/{slug}` page
- Bylines link to author archive page

This means FRS personnel:
- ✅ Appear as post authors with bylines linking to `/author/{slug}`
- ✅ Have author archive pages showing their profile + posts
- ✅ Can be queried via `WP_User_Query` with role filters
- ✅ Edit everything via clean frontend portal (no wp-admin clutter)
- ❌ Cannot access wp-admin dashboard
- ❌ Cannot see WordPress admin bar

---

## Implementation Timeline

### Week 1: Consolidation
- [ ] Merge frs-profile-directory into frs-wp-users
- [ ] Test hub-and-spoke functionality
- [ ] Update documentation

### Week 2: Architecture Design
- [ ] Design UserProfile model
- [ ] Design migration strategy
- [ ] Create custom user roles
- [ ] Plan backwards compatibility

### Week 3-4: Migration Implementation
- [ ] Build UserProfile model wrapper
- [ ] Build migration CLI command
- [ ] Implement backwards-compatible REST API
- [ ] Test integrations (FluentCRM, Follow Up Boss, etc.)

### Week 5: Testing
- [ ] Test data migration on staging
- [ ] Test all REST API endpoints
- [ ] Test webhooks
- [ ] Test shortcodes and blocks
- [ ] Test integrations

### Week 6: Deployment
- [ ] Deploy to production (hub21loan.com)
- [ ] Run migration on production
- [ ] Monitor for issues
- [ ] Deploy to spoke sites (21stcenturylending.com, etc.)

---

## Backwards Compatibility Checklist

### API Endpoints (CRITICAL)
- [ ] `GET /frs-users/v1/profiles` - List profiles
- [ ] `GET /frs-users/v1/profiles/{id}` - Get profile by legacy ID
- [ ] `GET /frs-users/v1/profiles/user/{user_id}` - Get by WordPress user ID
- [ ] `GET /frs-users/v1/profiles/slug/{slug}` - Get by slug
- [ ] `POST /frs-users/v1/profiles` - Create profile (create WP user)
- [ ] `PUT /frs-users/v1/profiles/{id}` - Update profile
- [ ] `DELETE /frs-users/v1/profiles/{id}` - Delete profile (delete WP user or mark inactive)

### Webhooks
- [ ] `profile.created` - Fire on user registration
- [ ] `profile.updated` - Fire on user profile update
- [ ] `profile.deleted` - Fire on user deletion

### Shortcodes
- [ ] `[frs_profile]` - User portal
- [ ] `[frs_my_profile]` - My profile editor
- [ ] `[frs_profile_directory]` - Directory listing

### Gutenberg Blocks
- [ ] `loan-officer-card` - Profile card
- [ ] `loan-officer-directory` - Directory

### Integrations
- [ ] FluentCRM sync on user updates
- [ ] FRS Sync agent data import
- [ ] Follow Up Boss API
- [ ] Simple Local Avatars

### WP-CLI Commands
- [ ] `wp frs-users list-profiles` - List users with frs_ meta
- [ ] `wp frs-users create-user` - Create WP user with profile
- [ ] `wp frs-users migrate-to-native` - Migration command

---

## Risks & Mitigation

### Risk 1: Data Loss During Migration
**Mitigation**:
- Full database backup before migration
- Dry-run migration on staging
- Keep `wp_frs_profiles` table as read-only backup
- Migration rollback script

### Risk 2: API Breaking Changes
**Mitigation**:
- Maintain identical JSON response structure
- Add legacy ID mapping
- API versioning (/v2 for new, /v1 for backwards-compatible)
- 6-month deprecation notice

### Risk 3: Integration Failures
**Mitigation**:
- Test all integrations before deployment
- Maintain hook compatibility
- Monitor error logs for 30 days post-migration

### Risk 4: Performance Degradation
**Mitigation**:
- Use WP_User_Query efficiently
- Cache user meta queries
- Benchmark before/after
- Optimize database queries

---

## Success Criteria

- [ ] All existing REST API endpoints return same data structure
- [ ] All webhooks fire correctly
- [ ] FluentCRM sync works
- [ ] FRS Sync import works
- [ ] Public profiles display correctly
- [ ] Directory search/filter works
- [ ] Admin can manage users via WordPress native UI
- [ ] Zero data loss
- [ ] Performance equal or better than before
- [ ] Spoke sites can fetch profiles from hub

---

## Questions for User

1. **Guest Profiles**:
   - Convert all guest profiles to WordPress users (recommended)?
   - Or maintain hybrid system (users in wp_users, guests in wp_frs_profiles)?

2. **Migration Timing**:
   - When is best time for downtime (migration could take 10-30 minutes)?
   - Preferred day/time with minimal traffic?

3. **Legacy Table**:
   - Keep `wp_frs_profiles` as read-only backup for how long?
   - Recommended: 6 months for safety, then drop table

4. **API Versioning**:
   - Maintain /v1 compatibility indefinitely (recommended)?
   - Or introduce /v2 with new user-based structure?

5. **Spoke Sites**:
   - How many sites currently use frs-profile-directory?
   - Update all to use consolidated plugin?

6. **Frontend Portal Pages**:
   - What pages/routes are needed in frontend portal?
   - Current: `/my-profile`, `/settings`, `/dashboard`, `/welcome`
   - Keep all or simplify?

7. **Bloat Cleanup**:
   - Which features can be removed/deprecated?
   - Current bloat: docs, planning files, storybook, unused React apps
   - Keep only: Profile editing, directory, public profiles, API?

---

## Next Steps

1. **Review this plan** - Validate strategy and approach
2. **Answer questions** - Clarify migration decisions
3. **Prioritize features** - What must be kept vs. what can be retired?
4. **Create timeline** - Set realistic deadlines
5. **Begin consolidation** - Start with merging frs-profile-directory
