# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ STOP! READ THIS ENTIRE FILE BEFORE DOING ANYTHING ⚠️

**MANDATORY REQUIREMENT FOR ALL CLAUDE INSTANCES:**

Before you do ANYTHING in this codebase - before answering questions, making changes, or offering suggestions:

1. **READ THIS ENTIRE CLAUDE.md FILE** - Every section, every rule
2. **READ THE VITE DEV SERVER SECTION** - Lines 36-176 contain critical setup info
3. **READ THE BOILERPLATE DOCUMENTATION** - https://prappo.github.io/wordpress-plugin-boilerplate/docs
4. **CHECK EXISTING CODE** - Look at how things are already implemented
5. **VERIFY YOUR UNDERSTANDING** - If you're not 100% sure, ASK the user

**THIS IS NOT OPTIONAL. READ THE RULES FIRST.**

---

## 🚨 CRITICAL: READ THIS FIRST 🚨

**MANDATORY RESEARCH-FIRST APPROACH:**

Before making ANY changes, suggestions, or answering ANY questions, you MUST:

1. **READ THE ACTUAL CODE** - Never assume how something works. Read the files.
2. **STUDY THE EXISTING PATTERNS** - Look at how similar functionality is already implemented
3. **EXAMINE THE BOILERPLATE** - Read `.cursor/rules/project-structure.mdc` to understand the architecture
4. **VERIFY DATABASE SCHEMA** - Always check `database/Migrations/Profiles.php` for the complete field list
5. **ASK CLARIFYING QUESTIONS** - If you're unsure after research, ask the user instead of guessing

**NEVER:**
- Assume how the WordPress Plugin Boilerplate works without reading the structure rules
- Create inline HTML in PHP classes instead of using views/ templates
- Miss database fields when creating view/edit forms
- Use custom HTML structures instead of WordPress standard markup
- Guess at file locations, namespaces, or architectural patterns
- Deviate from the boilerplate's patterns and conventions
- Skip reading the boilerplate documentation at https://prappo.github.io/wordpress-plugin-boilerplate/

**MANDATORY BOILERPLATE COMPLIANCE:**

This plugin MUST follow the WordPress Plugin Boilerplate paradigm at ALL times:

1. **Read Documentation First:** Before ANY work, check https://prappo.github.io/wordpress-plugin-boilerplate/docs
2. **Follow Boilerplate Patterns:** Use the same patterns as existing boilerplate code
3. **Use Boilerplate Tools:**
   - Use `@kucrut/vite-for-wp` for Vite integration (already configured)
   - Use the libs/assets.php helper functions
   - Use the Route helper for REST API
   - Use PSR-4 autoloading via Composer
4. **Check Existing Examples:** Look at admin/frontend configs to understand patterns
5. **Never Invent New Patterns:** If the boilerplate has a pattern for something, use it

**If you catch yourself about to guess or assume something, STOP and research it first.**

**MOST IMPORTANT DEBUGGING RULE:**
- **ALWAYS assume that the last action you took or code you wrote is the cause of the error**
- NEVER blame caching unless you have verified cache exists
- NEVER make up explanations - read documentation and actual code
- If something breaks after your change, YOUR CHANGE broke it - fix YOUR code

---

## 🔥 VITE DEV SERVER SETUP (CRITICAL) 🔥

**This section is MANDATORY reading. Dev server issues have caused repeated problems.**

### How @kucrut/vite-for-wp Works

The plugin uses `@kucrut/vite-for-wp` for Vite integration. Here's how it works:

1. **Dev Mode:** When `npm run dev:portal` is running, Vite serves files from http://hub21.local:5176
2. **WordPress Detection:** WordPress checks for `vite-dev-server.json` OR `.vite-for-wp` in the dist directory
3. **File Loading:** If dev server file exists, WordPress loads from Vite server. Otherwise, it loads built files.

### Dev Server File Format

**Location:** `assets/portal/dist/vite-dev-server.json`

**Required Content:**
```json
{
  "origin": "http://hub21.local:5176",
  "base": "/"
}
```

### Portal Dev Server Setup (CRITICAL STEPS)

**EVERY TIME you start working on portal components:**

```bash
# 1. Start dev server
npm run dev:portal

# 2. VERIFY vite-dev-server.json exists
cat assets/portal/dist/vite-dev-server.json

# 3. If missing, CREATE IT:
echo '{
  "origin": "http://hub21.local:5176",
  "base": "/"
}' > assets/portal/dist/vite-dev-server.json

# 4. Verify dev server is running
curl http://hub21.local:5176
```

### How WordPress Loads Portal Assets

**File:** `includes/Controllers/Shortcodes.php`

```php
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/portal/dist',
    'src/frontend/portal/main.tsx',
    array(
        'handle'       => 'frs-profile-portal',
        'dependencies' => array( 'react', 'react-dom' ),
        'in-footer'    => true,
    )
);
```

**File:** `libs/assets.php` (lines 29-53)

The `get_manifest()` function looks for files in this order:
1. `vite-dev-server.json` - If found, loads from dev server
2. `manifest.json` - If found, loads built production files
3. If neither found, throws error: `[Vite] No manifest found in {dir}`

### Troubleshooting Dev Server Issues

**Error: "[Vite] No manifest found in assets/portal/dist"**

**Solution:**
```bash
# Check what's in dist directory
ls -la assets/portal/dist/

# Should see vite-dev-server.json
# If not, create it:
echo '{
  "origin": "http://hub21.local:5176",
  "base": "/"
}' > assets/portal/dist/vite-dev-server.json

# Verify dev server is running on that port
npm run dev:portal
```

**Error: "Changes not showing / Old code loading"**

**Solution (in this order):**
1. Check if `vite-dev-server.json` exists in dist directory
2. Verify dev server is actually running: `curl http://hub21.local:5176`
3. Check browser console for 404 errors from Vite server
4. Verify port in `vite-dev-server.json` matches `vite.portal.config.js`
5. LAST RESORT: Hard refresh browser (Cmd+Shift+R)

**Error: "Connection refused on port 5176"**

**Solution:**
```bash
# Kill any existing dev servers
lsof -ti:5176 | xargs kill -9

# Restart dev server
npm run dev:portal

# Recreate vite-dev-server.json
echo '{
  "origin": "http://hub21.local:5176",
  "base": "/"
}' > assets/portal/dist/vite-dev-server.json
```

### NEVER Do These Things

❌ **NEVER** run `npm run build:portal` when you want dev server
❌ **NEVER** delete the entire `assets/portal/dist/` directory
❌ **NEVER** assume caching is the problem without checking dev server file first
❌ **NEVER** guess about how Vite integration works - read `libs/assets.php`
❌ **NEVER** blame WordPress for not loading files - check YOUR dev server setup first

### Always Do These Things

✅ **ALWAYS** verify `vite-dev-server.json` exists when dev server is running
✅ **ALWAYS** check actual dev server is running: `curl http://hub21.local:5176`
✅ **ALWAYS** read error messages carefully - they tell you exactly what file is missing
✅ **ALWAYS** assume your last change broke it - check YOUR code first
✅ **ALWAYS** check browser console for actual errors before guessing solutions

### Available Dev Servers

```bash
npm run dev              # Frontend + Admin (ports 5173 + 5174)
npm run dev:admin        # Admin only (port 5174)
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:portal       # Portal only (port 5176)
npm run dev:profile-editor  # Profile editor (port 5175)
```

Each needs its own `vite-dev-server.json` in its respective dist directory.

---

## Quick Start

### Development Environment

This plugin is developed using the **WordPress Plugin Boilerplate** framework:

- **Plugin Name:** FRS User Profiles
- **Text Domain:** `frs-users`
- **Namespace:** `FRSUsers`
- **PHP Version:** 8.1+
- **WordPress Version:** 6.0+

### Build Commands

```bash
# Install dependencies
npm install
composer install

# Development (runs both admin and frontend)
npm run dev              # Vite dev servers on ports 5173 (frontend) and 5174 (admin)

# Development (separate)
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:admin        # Admin only (port 5174)
npm run dev:all          # Dev + Gutenberg blocks
npm run dev:server       # Dev + WordPress server

# Gutenberg blocks
npm run block:start      # Development mode
npm run block:build      # Production build

# Production build
npm run build            # Build both frontend and admin

# Code quality
npm run format:check     # Check code formatting
npm run format:fix       # Fix code formatting

# Release
npm run release          # Creates release package in /release folder
```

### Project Overview

Advanced user profile management system for 21st Century Lending. Manages profiles for loan officers, real estate agents, staff, leadership, and assistants. Built with WordPress Plugin Boilerplate, Carbon Fields, Eloquent ORM, React 18, TypeScript, Tailwind CSS, and shadcn/ui.

**Key Features:**
- Guest profile support (profiles without WordPress user accounts)
- Carbon Fields integration for profile metadata
- Eloquent ORM for database operations
- REST API for profile management
- React-based admin interface
- WP-CLI commands for bulk operations

---

## Architecture Essentials

### Tech Stack

**Backend:**
- **PHP 8.1+** - Modern PHP with typed properties, readonly, enums
- **WordPress 6.0+** - Core platform
- **Carbon Fields 3.6+** - Profile metadata management
- **WP Eloquent 3.0+** - ORM for database operations
- **PSR-4 Autoloading** - Composer autoloader

**Frontend:**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 4** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library (Radix UI)
- **React Hook Form** + **Zod** - Form handling and validation
- **React Router DOM** - Client-side routing
- **Jotai** - State management

**Build Tools:**
- **Vite** - Frontend bundler (2 separate configs for admin/frontend)
- **@wordpress/scripts** - Gutenberg block bundler
- **Grunt** - PHP tasks (release, rename, i18n)
- **Composer** - PHP dependency management

---

### React Admin SPA Architecture (CRITICAL)

**🎯 PREFERRED APPROACH: The admin interface is a React Single Page Application (SPA).**

**How it works:**
1. PHP admin classes render a React container element
2. React app mounts and takes over rendering
3. React Router handles client-side navigation
4. Data is fetched via REST API

**Example - PHP renders container only:**
```php
// includes/Admin/ProfileView.php
class ProfileView {
    public static function render($profile_id) {
        // Security check
        if (!current_user_can('edit_users')) {
            wp_die(__('You do not have permission', 'frs-users'));
        }

        // Render React app container with initial route
        ?>
        <div class="wrap">
            <div id="frs-users-admin-root" data-route="/profiles/<?php echo esc_attr($profile_id); ?>"></div>
        </div>
        <?php
    }
}
```

**React takes over:**
```jsx
// src/admin/routes.jsx
export const router = createHashRouter([
  {
    path: "/",
    element: <ApplicationLayout />,
    children: [
      {
        path: "profiles",
        element: <ProfileList />,  // Full React component
      },
      {
        path: "profiles/:id",
        element: <ProfileView />,  // Full React component
      }
    ],
  },
]);
```

**Current React Admin Routes:**
- `/` - Dashboard
- `/profiles` - ProfileList (React component)
- `/profiles/:id` - ProfileView (React component)
- `/inbox` - Inbox
- `/settings` - Settings
- `/charts` - Charts

**Key Points:**
- ✅ **Profile management uses React SPA** - This is the current direction
- ✅ Data fetched from REST API (`/wp-json/frs-users/v1/`)
- ✅ Client-side routing with HashRouter
- ✅ shadcn/ui components for UI
- ✅ TypeScript for type safety
- ❌ Do NOT create traditional WordPress admin forms for profiles
- ❌ Do NOT use `views/admin/` templates for profile UI (use React components instead)

**When to use React SPA vs Traditional WordPress Admin:**
- **React SPA (PREFERRED for profiles):** Complex UI, data tables, forms with validation, modern UX
- **Traditional WordPress Admin (LEGACY):** Simple settings pages, basic forms, WordPress-native UI

---

### File Structure & Architecture

**IMPORTANT:** This plugin follows the WordPress Plugin Boilerplate structure. **DO NOT deviate from this pattern.**

```
frs-wp-users/
├── config/                    # PHP configuration
├── database/                  # Database layer
│   ├── Migrations/           # Database schema (Profiles.php)
│   └── Seeders/              # Test data (not used yet)
├── includes/                 # Core PHP classes (PSR-4: FRSUsers\)
│   ├── Admin/               # Admin interface classes
│   │   ├── Menu.php         # Admin menu registration
│   │   ├── ProfilesPage.php # Main profiles list page
│   │   ├── ProfileView.php  # Single profile view
│   │   ├── ProfileEdit.php  # Profile edit form
│   │   └── ProfilesList.php # Profiles table list
│   ├── Assets/              # Asset management
│   ├── Controllers/         # API controllers
│   │   └── Profiles/        # Profile-specific controllers
│   ├── Core/                # Core functionality
│   │   ├── ProfileFields.php   # Carbon Fields registration
│   │   ├── ProfileStorage.php  # Data storage override
│   │   ├── Install.php         # Activation/migration
│   │   ├── CLI.php             # WP-CLI commands
│   │   ├── Api.php             # REST API setup
│   │   └── Template.php        # Template loading
│   ├── Integrations/        # Third-party integrations
│   │   └── FRSSync.php      # FRS system sync
│   ├── Interfaces/          # PHP interfaces
│   ├── Models/              # Eloquent models
│   │   ├── Profile.php      # Profile model (frs_profiles table)
│   │   ├── Users.php        # WordPress users
│   │   └── Posts.php        # WordPress posts
│   ├── Routes/              # API route definitions
│   │   └── Api.php          # REST API routes
│   ├── Traits/              # Reusable traits
│   │   └── Base.php         # Singleton pattern
│   └── functions.php        # Helper functions
├── libs/                     # Utility libraries
│   ├── assets.php           # Asset helper functions
│   └── db.php               # Database helper functions
├── src/                      # Frontend source code
│   ├── admin/               # Admin React app
│   ├── frontend/            # Frontend React app
│   ├── components/          # Shared React components
│   │   └── ui/              # shadcn/ui components
│   ├── blocks/              # Gutenberg blocks
│   └── lib/                 # Utilities
├── views/                    # PHP templates
│   ├── admin/               # Admin page templates (to be created)
│   └── templates/           # Frontend templates
├── assets/                   # Built assets (generated)
├── vendor/                   # Composer dependencies
├── frs-wp-users.php         # Main plugin file
├── plugin.php               # Main plugin class
├── plugin-config.json       # Plugin configuration
├── composer.json            # PHP dependencies
├── package.json             # Node dependencies
├── vite.admin.config.js     # Vite config for admin
├── vite.frontend.config.js  # Vite config for frontend
└── uninstall.php            # Uninstall cleanup
```

---

### Key Architectural Patterns

**1. Singleton Pattern (Base Trait)**
All major classes use the `Base` trait for singleton pattern:

```php
<?php
namespace FRSUsers\Admin;

use FRSUsers\Traits\Base;

class ProfilesPage {
    use Base;

    public function init() {
        // Implementation
    }
}

// Usage:
ProfilesPage::get_instance()->init();
```

**2. Template Loading Pattern (CRITICAL)**
**NEVER put HTML directly in PHP classes.** Always use templates in `views/` directory:

```php
// ❌ WRONG - Inline HTML in class
class ProfileView {
    public static function render($profile_id) {
        ?>
        <div class="wrap">
            <h1>Profile</h1>
            <!-- 500 lines of HTML -->
        </div>
        <?php
    }
}

// ✅ CORRECT - Load template from views/
class ProfileView {
    public static function render($profile_id) {
        $profile = Profile::find($profile_id);
        include FRS_USERS_DIR . 'views/admin/profile-view.php';
    }
}
```

**3. Eloquent ORM for Database Operations**
Use Eloquent models, not raw SQL:

```php
use FRSUsers\Models\Profile;

// Get all profiles
$profiles = Profile::all();

// Get single profile
$profile = Profile::find($id);

// Create profile
$profile = Profile::create([
    'email' => 'john@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe'
]);

// Update profile
$profile->first_name = 'Jane';
$profile->save();

// Query builder
$loan_officers = Profile::where('select_person_type', 'loan_officer')
    ->where('is_active', 1)
    ->orderBy('last_name')
    ->get();
```

**4. Carbon Fields for Profile Metadata**
Carbon Fields stores data in `wp_postmeta` but we intercept and store in our custom table:

```php
// ProfileStorage.php intercepts Carbon Fields save
// Data is saved to frs_profiles table instead of postmeta
```

**5. REST API Routes**
All routes defined in `includes/Routes/Api.php`:

```php
// Base: /wp-json/frs-users/v1/

GET    /profiles                    # List all profiles
POST   /profiles                    # Create profile
GET    /profiles/{id}               # Get single profile
PUT    /profiles/{id}               # Update profile
DELETE /profiles/{id}               # Delete profile
GET    /profiles/user/{user_id}    # Get profile by user ID
POST   /profiles/{id}/create-user  # Create WP user for guest profile
POST   /profiles/bulk-create-users # Bulk create WP users
```

---

## Database Schema

### Custom Table: `wp_frs_profiles`

**51 fields total** - When creating view/edit forms, **ALL fields must be shown**.

**Contact Information:**
- `id` (BIGINT UNSIGNED, AUTO_INCREMENT, PRIMARY KEY)
- `user_id` (BIGINT UNSIGNED, NULL) - Links to wp_users.ID (NULL for guest profiles)
- `frs_agent_id` (VARCHAR 100, NULL) - External system ID
- `email` (VARCHAR 255, NOT NULL, UNIQUE)
- `first_name` (VARCHAR 255)
- `last_name` (VARCHAR 255)
- `display_name` (VARCHAR 255) - Public display name
- `phone_number` (VARCHAR 50)
- `mobile_number` (VARCHAR 50)
- `office` (VARCHAR 255)

**Profile:**
- `headshot_id` (BIGINT UNSIGNED) - References wp_posts.ID (attachment)
- `job_title` (VARCHAR 255)
- `biography` (TEXT)
- `date_of_birth` (DATE)
- `select_person_type` (VARCHAR 50) - loan_officer|agent|staff|leadership|assistant

**Professional Details:**
- `nmls` (VARCHAR 50)
- `nmls_number` (VARCHAR 50)
- `license_number` (VARCHAR 50)
- `dre_license` (VARCHAR 50)
- `specialties_lo` (JSON) - Loan officer specialties
- `specialties` (JSON) - Agent specialties
- `languages` (JSON) - Languages spoken
- `awards` (JSON)
- `nar_designations` (JSON) - NAR designations
- `namb_certifications` (JSON) - NAMB certifications
- `brand` (VARCHAR 255)
- `status` (VARCHAR 50, DEFAULT 'active')

**Location:**
- `city_state` (VARCHAR 255)
- `region` (VARCHAR 255)

**Social Media:**
- `facebook_url` (VARCHAR 500)
- `instagram_url` (VARCHAR 500)
- `linkedin_url` (VARCHAR 500)
- `twitter_url` (VARCHAR 500)
- `youtube_url` (VARCHAR 500)
- `tiktok_url` (VARCHAR 500)

**Tools & Platforms:**
- `arrive` (VARCHAR 500) - ARRIVE platform URL
- `canva_folder_link` (VARCHAR 500)
- `niche_bio_content` (LONGTEXT)
- `personal_branding_images` (JSON)

**Additional:**
- `loan_officer_profile` (BIGINT UNSIGNED)
- `loan_officer_user` (BIGINT UNSIGNED)

**Public Profile Settings:**
- `profile_slug` (VARCHAR 255, UNIQUE) - URL slug for public profile
- `profile_headline` (TEXT) - Public profile headline
- `profile_visibility` (JSON) - Field visibility settings
- `profile_theme` (VARCHAR 50, DEFAULT 'default') - Profile theme
- `custom_links` (JSON) - Custom links for profile
- `service_areas` (JSON) - Geographic service areas

**Metadata:**
- `is_active` (BOOLEAN, DEFAULT 1)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, ON UPDATE CURRENT_TIMESTAMP)
- `synced_to_fluentcrm_at` (DATETIME)

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `email`, `profile_slug`
- KEY: `user_id`, `frs_agent_id`, `is_active`, `created_at`

---

## Development Workflow - MANDATORY

### 1. Before Starting Any Task

```bash
# ALWAYS read these files first:
cat CLAUDE.md
cat .cursor/rules/project-structure.mdc
cat database/Migrations/Profiles.php
cat src/admin/routes.jsx  # Check existing React routes
```

### 1.5. Understanding Current Admin Architecture

**Before creating/modifying admin functionality, determine the approach:**

```bash
# Check if it's a React SPA route
cat src/admin/routes.jsx | grep -A 5 "path:"

# Check existing React page components
ls src/admin/pages/

# Check REST API endpoints
cat includes/Routes/Api.php
```

**Decision Matrix:**
- **Profile Management?** → Use React SPA (current direction)
- **Complex forms/tables?** → Use React SPA
- **Simple settings page?** → Can use traditional WordPress admin (legacy)

### 2. Creating a New Admin Page (React SPA - PREFERRED)

**🎯 Use this approach for profile-related features.**

**Step 1:** Create REST API endpoint in `includes/Routes/Api.php`

```php
register_rest_route(
    self::$namespace,
    '/my-data',
    array(
        'methods' => 'GET',
        'callback' => array(self::$actions, 'get_my_data'),
        'permission_callback' => array(self::$actions, 'check_read_permissions'),
    )
);
```

**Step 2:** Create React component in `src/admin/pages/`

```tsx
// src/admin/pages/MyFeature.tsx
import { useState, useEffect } from 'react';

interface MyData {
  id: number;
  name: string;
}

export default function MyFeature() {
  const [data, setData] = useState<MyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/wp-json/frs-users/v1/my-data')
      .then(res => res.json())
      .then(result => {
        setData(result.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Feature</h1>
      {/* Your UI here using shadcn/ui components */}
    </div>
  );
}
```

**Step 3:** Add route to `src/admin/routes.jsx`

```jsx
import MyFeature from "./pages/MyFeature";

export const router = createHashRouter([
  {
    path: "/",
    element: <ApplicationLayout />,
    children: [
      // ... existing routes
      {
        path: "my-feature",
        element: <MyFeature />,
      }
    ],
  },
]);
```

**Step 4:** Add menu item in `includes/Admin/Menu.php`

```php
add_submenu_page(
    'frs-profiles',
    __('My Feature', 'frs-users'),
    __('My Feature', 'frs-users'),
    'manage_options',
    'frs-profiles#/my-feature',  // Note: #/route for React router
    [$this, 'render_react_app']
);
```

**Step 5:** Build and test

```bash
npm run dev:admin  # Development
# OR
npm run build      # Production
```

### 2.1. Creating Traditional WordPress Admin Page (LEGACY)

**⚠️ Only use for simple, non-profile features.**

**Step 1:** Create template in `views/admin/`

```php
// views/admin/my-page.php
<div class="wrap">
    <h1><?php echo esc_html($title); ?></h1>
    <table class="form-table">
        <tr>
            <th><?php _e('Field Name', 'frs-users'); ?></th>
            <td><?php echo esc_html($value); ?></td>
        </tr>
    </table>
</div>
```

**Step 2:** Create class in `includes/Admin/`

```php
// includes/Admin/MyPage.php
namespace FRSUsers\Admin;

use FRSUsers\Traits\Base;

class MyPage {
    use Base;

    public function init() {
        add_action('admin_menu', [$this, 'add_menu']);
    }

    public function add_menu() {
        add_submenu_page(
            'frs-profiles',
            __('My Page', 'frs-users'),
            __('My Page', 'frs-users'),
            'manage_options',
            'frs-my-page',
            [$this, 'render']
        );
    }

    public function render() {
        $title = __('My Page', 'frs-users');
        $value = 'Example value';
        include FRS_USERS_DIR . 'views/admin/my-page.php';
    }
}
```

**Step 3:** Register in `plugin.php`

```php
// plugin.php
if (is_admin()) {
    MyPage::get_instance()->init();
}
```

### 3. Creating a New REST API Endpoint

**Step 1:** Add route in `includes/Routes/Api.php`

```php
register_rest_route(
    self::$namespace,
    '/my-endpoint',
    array(
        'methods' => 'GET',
        'callback' => array(self::$actions, 'my_method'),
        'permission_callback' => array(self::$actions, 'check_read_permissions'),
    )
);
```

**Step 2:** Add method in `includes/Controllers/Profiles/Actions.php`

```php
public function my_method($request) {
    $data = Profile::all();

    return rest_ensure_response([
        'success' => true,
        'data' => $data
    ]);
}
```

### 4. Creating a New Eloquent Model

```php
// includes/Models/MyModel.php
namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

class MyModel extends Model {
    protected $table = 'my_table';
    protected $fillable = ['field1', 'field2'];
}
```

### 5. Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/descriptive-name-YYYY-MM-DD

# 2. Make changes following standards

# 3. Build for production
npm run build

# 4. Commit with proper message
git add .
git commit -m "feat: descriptive commit message"

# 5. Push to remote
git push origin feature/descriptive-name-YYYY-MM-DD

# 6. Merge to main (after testing)
git checkout main
git merge feature/descriptive-name-YYYY-MM-DD
git push origin main
```

---

## Coding Standards

### PHP Standards (2025)

- **PHP 8.1+** features: typed properties, readonly, named arguments, enums
- **PSR-4 autoloading** with Composer
- **Type declarations** on all functions
- **Strict comparison:** Use `===` not `==`
- **WordPress Coding Standards:** Follow WP formatting

**Security Checklist (MANDATORY):**
- [ ] Use `sanitize_text_field()`, `sanitize_email()`, etc.
- [ ] Use `esc_html()`, `esc_attr()`, `esc_url()` for output
- [ ] Use `wp_verify_nonce()` for form submissions
- [ ] Use `current_user_can()` for capability checks
- [ ] Use Eloquent query builder (prevents SQL injection)

**Example:**

```php
namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

class ProfileView {
    use Base;

    public function render(int $profile_id): void {
        // Security check
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have permission', 'frs-users'));
        }

        // Get data with Eloquent
        $profile = Profile::find($profile_id);

        if (!$profile) {
            wp_die(__('Profile not found', 'frs-users'));
        }

        // Load template
        include FRS_USERS_DIR . 'views/admin/profile-view.php';
    }
}
```

### React/TypeScript Standards (2025)

- **Strict TypeScript** enabled
- **Functional components** with hooks
- **Proper typing:** Interfaces for props, explicit return types
- **Modern hooks:** `useState`, `useEffect`, `useCallback`, `useMemo`

**Example:**

```typescript
interface ProfileData {
  readonly id: number;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
}

interface ProfileListProps {
  readonly type?: string;
}

export function ProfileList({ type }: ProfileListProps): JSX.Element {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/wp-json/frs-users/v1/profiles')
      .then(res => res.json())
      .then(data => setProfiles(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {profiles.map(profile => (
        <div key={profile.id}>
          {profile.first_name} {profile.last_name}
        </div>
      ))}
    </div>
  );
}
```

### Tailwind CSS Standards

- **Utility-first:** Use Tailwind classes primarily
- **shadcn/ui components:** Use pre-built components from `src/components/ui/`
- **Responsive:** Mobile-first breakpoints
- **Use `cn()` helper** for conditional classes

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  className
)}>
  Content
</div>
```

---

## Common Tasks & Patterns

### Using the Profile Model (Eloquent ORM)

**CRITICAL:** Always use Eloquent, never raw SQL.

```php
use FRSUsers\Models\Profile;

// Get all profiles
$all_profiles = Profile::all();

// Get all profiles with count
$count = Profile::count();
$profiles = Profile::get_all(); // Custom method that returns all with metadata

// Get single profile by ID
$profile = Profile::find($id);

// Get profile by email
$profile = Profile::where('email', 'john@example.com')->first();

// Get profiles by type
$loan_officers = Profile::where('select_person_type', 'loan_officer')
    ->where('is_active', 1)
    ->orderBy('last_name', 'asc')
    ->get();

// Pagination
$profiles = Profile::where('is_active', 1)
    ->skip(0)
    ->take(20)
    ->get();

// Search profiles
$results = Profile::where('first_name', 'like', '%John%')
    ->orWhere('last_name', 'like', '%John%')
    ->orWhere('email', 'like', '%John%')
    ->get();
```

### Getting a Profile by User ID

```php
use FRSUsers\Models\Profile;

// Get profile for specific user
$profile = Profile::where('user_id', $user_id)->first();

// Get profile for current user
$profile = Profile::where('user_id', get_current_user_id())->first();

// Get guest profiles (no user account)
$guests = Profile::whereNull('user_id')->get();
```

### Creating a Guest Profile

```php
$profile = Profile::create([
    'email' => 'john@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'select_person_type' => 'loan_officer',
    'user_id' => null  // Guest profile
]);

// Verify it was created
if ($profile->id) {
    // Success
    error_log("Profile created with ID: {$profile->id}");
}
```

### Updating a Profile

```php
// Get the profile
$profile = Profile::find($id);

if (!$profile) {
    return new WP_Error('not_found', 'Profile not found');
}

// Update fields
$profile->first_name = 'Jane';
$profile->last_name = 'Smith';
$profile->phone_number = '555-1234';

// Save changes
$profile->save();

// Or use mass update
$profile->update([
    'first_name' => 'Jane',
    'last_name' => 'Smith',
    'phone_number' => '555-1234',
]);
```

### Working with JSON Fields

```php
// Languages, specialties, awards, etc. are JSON fields
$profile = Profile::find($id);

// Get JSON field (returns array)
$languages = $profile->languages; // ['English', 'Spanish']

// Update JSON field
$profile->languages = ['English', 'Spanish', 'French'];
$profile->save();

// Or use mass update
$profile->update([
    'languages' => json_encode(['English', 'Spanish', 'French']),
    'specialties_lo' => json_encode(['FHA', 'VA', 'Conventional']),
]);
```

### Converting Guest Profile to User

```php
// Via REST API
POST /wp-json/frs-users/v1/profiles/{id}/create-user
{
    "username": "john.doe",  // Optional, auto-generated if not provided
    "send_email": true,      // Send password reset email
    "roles": ["loan_officer"]
}
```

### Using WP-CLI Commands

```bash
# List all profiles
wp frs-users list

# Create profile
wp frs-users create --email=john@example.com --first_name=John --last_name=Doe

# Sync profiles
wp frs-users sync
```

---

## Critical Rules (NEVER BREAK THESE)

### Rule #0: Understand Admin Interface Type (NEW - MOST IMPORTANT)
**Before creating/modifying admin features, determine the approach:**

**For Profile Management:**
- ✅ **USE React SPA** - This is the current direction
- ✅ Create React components in `src/admin/pages/`
- ✅ Add routes to `src/admin/routes.jsx`
- ✅ Fetch data from REST API
- ❌ **DO NOT** create traditional WordPress admin pages with `views/admin/` templates
- ❌ **DO NOT** put profile UI in PHP templates

**Decision Tree:**
```
Is it profile-related?
├─ YES → React SPA (src/admin/pages/)
└─ NO → Is it complex UI/forms?
   ├─ YES → React SPA
   └─ NO → Can use traditional WordPress admin (views/admin/)
```

### Rule #1: Database Schema Completeness
**When creating view/edit forms for profiles, ALL database fields must be included.**

1. Count the fields in `database/Migrations/Profiles.php` (51 fields)
2. Count the fields in your React component or template
3. If numbers don't match, **YOU'RE WRONG**

**Verification Checklist:**
```bash
# Count database fields
grep -E "^\s+\w+\s+(VARCHAR|TEXT|JSON|BIGINT|DATE|BOOLEAN)" database/Migrations/Profiles.php | wc -l

# Should show 51 fields
```

### Rule #2: Use Eloquent ORM for Database Operations
**NEVER use raw SQL. ALWAYS use Eloquent models.**

```php
// ✅ CORRECT - Eloquent
$profile = Profile::find($id);
$profile->first_name = 'John';
$profile->save();

// ❌ WRONG - Raw SQL
$wpdb->query("UPDATE wp_frs_profiles SET first_name='John' WHERE id=$id");
```

### Rule #3: REST API for Data Access
**React components MUST use REST API, not direct database access.**

```tsx
// ✅ CORRECT - REST API
fetch('/wp-json/frs-users/v1/profiles/123')
  .then(res => res.json())
  .then(data => setProfile(data.data));

// ❌ WRONG - No direct DB access from React
// (This is impossible anyway, but the concept matters)
```

### Rule #4: Use Boilerplate Utilities
- **Singleton:** Use `Base` trait for PHP classes
- **ORM:** Use Eloquent for all database operations
- **REST API Routes:** Define in `includes/Routes/Api.php`
- **React Router:** Use HashRouter in `src/admin/routes.jsx`
- **UI Components:** Use shadcn/ui from `src/components/ui/`

### Rule #5: Security ALWAYS
**PHP Side:**
- Input sanitization (ALWAYS) - `sanitize_text_field()`, `sanitize_email()`
- Output escaping (ALWAYS) - `esc_html()`, `esc_attr()`, `esc_url()`
- Nonce verification for forms (ALWAYS) - `wp_verify_nonce()`
- Capability checks (ALWAYS) - `current_user_can()`
- Use Eloquent query builder (prevents SQL injection)

**React Side:**
- Validate REST API responses
- Use TypeScript for type safety
- Sanitize user inputs in forms
- Use React Hook Form + Zod for validation

### Rule #6: Template Separation (For Legacy Pages Only)
**If using traditional WordPress admin (not React SPA):**
- **NEVER** put HTML directly in PHP classes
- **ALWAYS** use `views/` templates
- Use WordPress form-table markup

**Note:** For profile management, use React SPA instead.

---

## Troubleshooting Common Issues

### Issue: React admin not loading / Blank screen
**Symptoms:** Admin page shows empty `#frs-users-admin-root` div
**Check:**
1. Verify React app is built:
   ```bash
   npm run build
   # OR for development
   npm run dev:admin
   ```
2. Check browser console for errors
3. Verify `assets/admin/dist/` directory exists with built files
4. Check `includes/Assets/Admin.php` is enqueuing assets correctly
5. Verify `#frs-users-admin-root` element exists in page source

**Fix:**
```bash
# Rebuild admin assets
npm run build

# If still not working, clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: React Router not working (404 on routes)
**Symptoms:** Clicking links shows 404 or doesn't navigate
**Check:**
1. Verify using HashRouter (URLs should have `#/` in them)
2. Check routes are defined in `src/admin/routes.jsx`
3. Verify menu links use hash format: `frs-profiles#/route`
4. Check `data-route` attribute is set correctly in PHP

**Example:**
```php
// PHP menu item - note the #/
'frs-profiles#/profiles'

// PHP template
<div id="frs-users-admin-root" data-route="/profiles/<?php echo $id; ?>"></div>
```

### Issue: REST API returns 404
**Symptoms:** `fetch('/wp-json/frs-users/v1/profiles')` returns 404
**Check:**
1. Routes registered in `includes/Routes/Api.php`
2. Controller methods exist in `includes/Controllers/Profiles/Actions.php`
3. Flush permalinks: WP Admin → Settings → Permalinks → Save Changes
4. Verify REST API is working: Visit `/wp-json/` in browser

**Fix:**
```bash
# Via WP-CLI
wp rewrite flush

# Via browser
# Go to: WP Admin > Settings > Permalinks > Click "Save Changes"
```

### Issue: Vite dev server not working
**Cause:** SSL certificate issue or domain mismatch in Local WP
**Fix:** Change Router mode to `localhost` in Local WP settings

### Issue: TypeScript errors in React components
**Check:**
1. Verify TypeScript is configured: `tsconfig.json` exists
2. Check imports use correct paths (use `@/` alias)
3. Verify interfaces are properly defined
4. Check shadcn/ui components are installed correctly

**Fix:**
```bash
# Reinstall dependencies
npm install

# Check TypeScript
npx tsc --noEmit
```

### Issue: Database table not created
**Fix:**
```bash
# Deactivate and reactivate plugin
wp plugin deactivate frs-wp-users
wp plugin activate frs-wp-users
```

### Issue: Profile data not saving
**Check:**
1. Verify Eloquent model has `$fillable` array with all fields
2. Check REST API endpoint has permission callback
3. Verify data is being sanitized on server side
4. Check browser console for API errors
5. Verify `ProfileStorage.php` is intercepting Carbon Fields saves correctly

**Debug:**
```php
// Add to controller method
error_log('Profile data: ' . print_r($request->get_params(), true));
```

### Issue: Carbon Fields not showing/saving data
**Check:**
1. Verify `ProfileFields.php` is loaded in `plugin.php`
2. Check `ProfileStorage.php` is registered correctly
3. Verify field names match database columns
4. Check if data is in `wp_frs_profiles` table (not postmeta)

**Query to verify:**
```sql
SELECT * FROM wp_frs_profiles WHERE email = 'test@example.com';
```

---

## Commit Message Format

```
feat: add complete profile view with all 51 fields

- Created views/admin/profile-view.php template
- ProfileView class loads template properly
- Shows ALL database fields (verified count)
- Uses WordPress form-table markup
- Proper escaping and sanitization

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code restructure (no feature change)
- `perf:` - Performance improvement
- `security:` - Security fix
- `test:` - Tests
- `chore:` - Maintenance
- `cleanup:` - Remove unused code

---

## Before Declaring "Done" - Checklist

**General:**
- [ ] Did I read CLAUDE.md, `.cursor/rules/project-structure.mdc`, and `database/Migrations/Profiles.php`?
- [ ] Did I check `src/admin/routes.jsx` to understand existing routes?
- [ ] Did I use the correct admin approach (React SPA for profiles)?

**If Using React SPA (Profile Management):**
- [ ] Did I create React components in `src/admin/pages/`?
- [ ] Did I add routes to `src/admin/routes.jsx`?
- [ ] Did I create REST API endpoints in `includes/Routes/Api.php`?
- [ ] Did I use TypeScript with proper interfaces?
- [ ] Did I use shadcn/ui components?
- [ ] Did I count database fields vs form fields? (Should be 51)
- [ ] Did I test the React app in development mode (`npm run dev:admin`)?
- [ ] Did I build assets before committing (`npm run build`)?
- [ ] Are there any console errors in browser dev tools?

**If Using Traditional WordPress Admin (Legacy):**
- [ ] Did I use `views/` templates instead of inline HTML?
- [ ] Did I use WordPress escaping functions?
- [ ] Did I use WordPress form-table markup?

**Backend (Both Approaches):**
- [ ] Did I use Eloquent ORM (not raw SQL)?
- [ ] Did I add proper permission callbacks to REST API routes?
- [ ] Did I sanitize all inputs?
- [ ] Did I use capability checks (`current_user_can()`)?
- [ ] Did I use the Base trait for singletons?
- [ ] Are there any PHP errors in debug.log?

**Testing:**
- [ ] Did I test in WordPress admin?
- [ ] Did I test with real data from the database?
- [ ] Did I test all CRUD operations (Create, Read, Update, Delete)?
- [ ] Did I test with guest profiles (user_id = NULL)?
- [ ] Did I verify REST API responses in browser network tab?

**Git & Deployment:**
- [ ] Did I run `npm run build` before committing?
- [ ] Did I follow the commit message format?
- [ ] Did I push to remote (not just local commit)?
- [ ] Did I test the built assets (not just dev mode)?

---

## If You're Confused - STOP AND ASK

If you're not sure:
- Which boilerplate utility to use
- Where a file should go
- How to structure something
- Whether to create a new file or modify existing
- Whether to use React SPA or traditional WordPress admin

**STOP. ASK THE USER. Don't guess.**

---

## Current Development Status

**Active Development Focus:** Profile management using React SPA

**Recently Completed:**
- ✅ Profile management list screens (React SPA)
- ✅ Profile view screens (React SPA)
- ✅ Profile model with `get_all()` and `count()` methods
- ✅ Carbon Fields integration for People fields
- ✅ Profile images using 1:1 ratio with object-fit cover
- ✅ Basic REST API endpoints for profiles

**Architecture Decisions:**
- **Admin Interface:** React SPA (HashRouter) for profile management
- **Database:** Custom `wp_frs_profiles` table with Eloquent ORM
- **Data Flow:** React → REST API → Controllers → Eloquent Models → Database
- **Metadata:** Carbon Fields integrated but data stored in custom table (via ProfileStorage)

**What's Working:**
- Custom database table (`wp_frs_profiles`) with 51 fields
- Eloquent ORM for database operations
- REST API endpoints for CRUD operations
- React admin interface with routing
- Profile list and view pages
- Guest profile support (profiles without WordPress user accounts)

**Current Tech Stack Confirmation:**
- ✅ PHP 8.1+ with modern features (typed properties, readonly)
- ✅ React 18 with TypeScript
- ✅ Vite for bundling (separate admin/frontend configs)
- ✅ Tailwind CSS + shadcn/ui for UI components
- ✅ Eloquent ORM for database operations
- ✅ React Hook Form + Zod for forms (ready to use)
- ✅ HashRouter for client-side routing

**Next Steps (Likely):**
- Profile edit/create forms in React
- Bulk operations UI
- Advanced filtering and search
- Profile photo upload integration
- User account creation from guest profiles

**Important Notes:**
- Do NOT create traditional WordPress admin pages for profiles
- Do NOT use `views/admin/` templates for profile UI
- DO use React components in `src/admin/pages/`
- DO fetch data via REST API endpoints

---

## Key Dependencies & Versions

**Required:**
- WordPress 6.0+
- PHP 8.1+
- Carbon Fields 3.6+
- WP Eloquent 3.0+

**Node/NPM:**
- Node 18+
- React 18
- TypeScript (latest)
- Vite 4
- Tailwind CSS 3

---

## Summary

This plugin uses the **WordPress Plugin Boilerplate** architecture with **React SPA for admin interface**.

**Core Architecture:**
- **Admin UI:** React 18 SPA with TypeScript, HashRouter, shadcn/ui
- **Database:** Custom table (`wp_frs_profiles`) with Eloquent ORM
- **API:** REST API for all data access
- **Data Flow:** React → REST API → Controllers → Eloquent → Database
- **Forms:** React Hook Form + Zod validation
- **Security:** PHP sanitization, capability checks, nonce verification
- **Build:** Vite (admin/frontend), Grunt (release), Composer (PHP deps)

**Key Technologies:**
- ✅ PHP 8.1+ (typed properties, readonly, enums)
- ✅ React 18 + TypeScript
- ✅ Eloquent ORM (not raw SQL)
- ✅ Tailwind CSS + shadcn/ui
- ✅ Carbon Fields (data stored in custom table)
- ✅ PSR-4 autoloading
- ✅ WP-CLI commands

**The Golden Rules:**

**Before writing ANY code, ask yourself:**

1. **Am I using React SPA for profiles?**
   - YES → Create React components in `src/admin/pages/`
   - NO → Why not? (It's the current direction)

2. **Am I using the boilerplate structure properly?**
   - Eloquent for database operations?
   - REST API for data access?
   - Proper namespaces and PSR-4?

3. **Am I showing ALL database fields?**
   - Count fields in `database/Migrations/Profiles.php`
   - Verify all 51 fields are in your form/view

4. **Am I following security best practices?**
   - PHP: Sanitize input, escape output, check capabilities
   - React: Validate API responses, use TypeScript

5. **Would I want to use this UI if I were the user?**
   - Modern React UI with shadcn/ui?
   - Responsive and accessible?
   - Fast and intuitive?

**If the answer to ANY question is "no" or "I don't know", STOP and ASK the user.**

**Remember:**
- Profile management = React SPA (not traditional WordPress admin)
- Always use Eloquent (never raw SQL)
- Always use REST API from React
- Always show ALL 51 database fields
- Always prioritize security and user experience
- always assume that the last action you took or code you wrote is  the cause of the error. never assume its cacheing