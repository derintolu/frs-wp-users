# FRS WP Users Plugin - Comprehensive Component Index

**Last Updated:** 2025-12-05
**Plugin Version:** 1.0.0

## Overview
- **Plugin Name:** FRS User Profiles
- **Namespace:** `FRSUsers`
- **PHP Version:** 8.1+
- **WordPress Version:** 6.0+
- **Architecture:** React SPA frontends (6 Vite configs) + REST API + Eloquent ORM + WordPress Backend

---

## Quick Stats

| Category | Count |
|----------|-------|
| React Components (Active) | 130+ |
| React Components (Archived) | 257+ |
| PHP Classes | 43 |
| Database Migrations | 8 |
| Gutenberg Blocks | 2 |
| Custom Widgets | 1 |
| Shared UI Components | 117 |
| Vite Build Configs | 8 |

---

## React Applications (6 Vite Builds)

### 1. Admin Dashboard (Port 5174)
**Entry:** `src/admin/main.jsx` | **Dist:** `assets/admin/dist`

**Pages:**
- `Dashboard` - Main admin dashboard
- `ProfileList` - Profiles table view (`pages/profiles/ProfileList.tsx`)
- `ProfileView` - Single profile view
- `ProfileEdit` - Profile editor
- `ImportExport` - CSV import/export (`pages/profiles/ImportExport.tsx`)
- `Settings` - Plugin settings
  - `SyncSettings` - FluentCRM sync
  - Profile form settings
  - Layout settings
- `Inbox` - Email/message management
- `Charts` - Analytics dashboard
- `Login` - Admin login
- `Error` - Error boundary

### 2. Portal (Port 5176)
**Entry:** `src/frontend/portal/main.tsx` | **Dist:** `assets/portal/dist`

**Core Components:**
- `PortalLayout.tsx` - Main layout wrapper
- `PortalSidebarApp.tsx` - Sidebar app with color scheme support
- `PortalSidebar.tsx` - Navigation sidebar
- `Dashboard.tsx` - Portal dashboard/welcome screen
- `MyProfile.tsx` - User profile management
- `ProfileView.tsx` - Profile display
- `ProfileEditorView.tsx` - Inline editor
- `ProfileSection.tsx` - Collapsible sections
- `ProfileCompletionCard.tsx` - Completion indicator
- `Settings.tsx` - User settings
- `nav-main.tsx` - Main navigation
- `nav-user.tsx` - User profile menu
- `team-switcher.tsx` - Team/account switcher

**Utilities:**
- `routes.tsx` - Router config with auth
- `menu.ts` - Menu configuration
- `profileCompletion.ts` - Profile completion logic
- `mortgageCalculations.ts` - Mortgage calculator
- `rentcastService.ts` - RentCast API integration
- `dataService.ts` - API client
- `landingPageGenerator.ts` - Dynamic landing pages
- `contexts/ProfileEditContext.tsx` - Profile edit state

### 3. Profile Editor (Port 5175)
**Entry:** `src/frontend/profile-editor/main.tsx` | **Dist:** `assets/profile-editor/dist`

**Components:**
- `ProfileEditor.tsx` - Main editor
- `ProfileDashboard.tsx` - Dashboard/landing
- `sections/AboutSection.tsx` - Bio editor
- `sections/SpecialtiesSection.tsx` - Specialties/designations
- `sections/ServiceAreasSection.tsx` - Service areas
- `sections/SocialMediaSection.tsx` - Social links
- `sections/LinksSection.tsx` - Custom links
- `Sidebar.tsx` - Section navigation
- `preview/PreviewTabs.tsx` - Profile preview

### 4. Directory (Port 5177)
**Entry:** `src/frontend/directory/index.tsx` | **Dist:** `assets/directory/dist`

**Components:**
- `Directory.tsx` - Main directory component
- `DirectorySidebar.tsx` - Filters and search
- `ProfileDetailPage.tsx` - Individual profile view

### 5. Public Profile (Port 5178)
**Entry:** `src/frontend/public-profile/main.tsx` | **Dist:** `assets/public-profile/dist`

**Components:**
- `BuddyPressProfile.tsx` - BuddyPress integration
- `HybridProfile.tsx` - Hybrid BuddyPress + custom
- `BuddyPressLayout.tsx` - BuddyPress theme wrapper
- `ProfileCustomizerLayout.tsx` - Customizable layout
- `ProfileEditorView.tsx` - Edit overlay
- `ProfileHeader.tsx` - Profile header
- `CustomizerPreview.tsx` - Customizer preview

### 6. Widget
**Entry:** `src/widget/loan-officer-directory-widget.tsx` | **Dist:** `assets/widget/dist`

**Output:** `loan-officer-directory-widget.iife.js` (Legacy jQuery)

---

## Shared Components (117 files)

### Profile Cards
- `ProfileCard.tsx` - Standard card
- `ProfileCardCompact.tsx` - Compact card
- `FigmaProfileCard.tsx` - Figma-designed card
- `StandardProfileCard.tsx` - Alternative standard
- `DirectoryProfileCard.tsx` - Directory-specific

### Icons (16 components)
- `AnalyticsIcon.tsx`
- `CampaignsIcon.tsx`
- `CommonInboxIcon.tsx`
- `ContactBookIcon.tsx`
- `CrmIcon.tsx`
- `DashboardIcon.tsx`
- `EmailIcon.tsx`
- `Logo.tsx`
- `NotificationIcon.tsx`
- `SettingsIcon.tsx`
- `icons.ts` - Icon registry

### UI Library (shadcn-based, 70+ components)
**Base Components:**
- `accordion.tsx`
- `alert.tsx`
- `avatar.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.jsx`
- `dialog.jsx`
- `dropdown-menu.jsx`
- `input.tsx`
- `label.tsx`
- `loading.tsx`
- `popover.jsx`
- `scroll-area.jsx`
- `select.jsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `switch.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `tooltip.tsx`

**Custom UI:**
- `CollapsibleSidebar.tsx`
- `RichTextEditor.tsx`
- `floating-input.tsx`
- `media-uploader.tsx`
- `pagination.tsx`
- `iphone-mockup.tsx`
- `safari-mockup.tsx`
- `use-mobile.ts` - Mobile detection hook
- `chart.jsx`
- `calendar.jsx`
- `form.jsx`
- `resizable.jsx`
- `sonner.jsx` - Toast notifications
- `toast.jsx` / `toaster.jsx`

### Card Variants
- `cards/AnnouncementCard.tsx`
- `cards/FeatureCard.tsx`
- `cards/StatCard.tsx`
- `cards/ToolCard.tsx`

### Account Components
- `accounts/connect-account.tsx` - Account connector
- `accounts/add-widget.jsx` - Widget installer
- `accounts/list.jsx` - Accounts list
- `accounts/connections/gmail/` - Gmail OAuth (step-1, step-2, step-3)
- `accounts/window/delete.jsx` - Delete dialog
- `accounts/window/edit.jsx` - Edit dialog

### Layout Components
- `application-layout/ApplicationLayout.jsx`
- `application-layout/LayoutOne.jsx`
- `application-layout/LayoutTwo.tsx`

### Dashboard Components
- `dashboard/overview.tsx`
- `dashboard/date-range-picker.tsx`
- `dashboard/recent-sales.tsx`
- `dashboard/search.tsx`
- `dashboard/team-switcher.tsx`

### Inbox Components
- `inbox/mail.tsx`
- `inbox/mail-list.tsx`
- `inbox/mail-display.tsx`
- `inbox/nav.tsx`
- `inbox/account-switcher.tsx`

---

## PHP Classes (43 files)

### Models (Eloquent ORM)

**`includes/Models/Profile.php`**
- **Class:** `FRSUsers\Models\Profile`
- **Table:** `wp_frs_profiles`
- **Key Features:**
  - User association (nullable `user_id`)
  - Profile types: loan_officer, agent, staff, leadership, assistant
  - JSON fields: languages, specialties, awards, service_areas
  - Slug-based routing
  - Scopes: `active()`, `guests()`, `ofType()`, `getByEmail()`, `getByUserId()`

**Other Models:**
- `SSOClient.php` - SSO client configuration
- `SSOProvider.php` - SSO provider configuration
- `FluentCRMSubscriber.php` - FluentCRM integration

### Controllers

**`includes/Controllers/Profiles/Actions.php`**
- **Class:** `FRSUsers\Controllers\Profiles\Actions`
- **Methods:**
  - `get_profiles()` - List profiles with filtering
  - `get_profile()` - Get single profile
  - `create_profile()` - Create new profile
  - `update_profile()` - Update profile
  - `delete_profile()` - Delete profile
  - CRUD and utility methods

**Other Controllers:**
- `Blocks.php` - Gutenberg block rendering
- `Shortcodes.php` - Shortcode handlers

### Routes

**`includes/Routes/Api.php`**
- **Namespace:** `frs-users/v1`
- **Endpoints:**
  - `GET /profiles` - List profiles
  - `POST /profiles` - Create profile
  - `GET /profiles/{id}` - Get profile
  - `PUT /profiles/{id}` - Update profile
  - `DELETE /profiles/{id}` - Delete profile
  - `GET /profiles/user/{user_id}` - Get by user
  - `GET /profiles/slug/{slug}` - Get by slug
  - `POST /profiles/{id}/create-user` - Create WP user
  - `POST /profiles/bulk-create-users` - Bulk create
  - `GET/POST /sync-settings` - FluentCRM sync
  - `GET /sync-stats` - Sync stats
  - `POST /trigger-sync` - Manual sync

### Core Classes

**Infrastructure:**
- `Core/Install.php` - Plugin installation, activation, migrations
- `Core/Template.php` - Template rendering
- `Core/ProfileStorage.php` - Carbon Fields → custom table sync
- `Core/ProfileFields.php` - Profile field definitions
- `Core/ProfileApi.php` - Profile API utilities
- `Core/DataKit.php` - DataKit integration
- `Core/EmbeddablePages.php` - Content-only rendering
- `Core/GutenbergCompat.php` - Gutenberg compatibility
- `Core/CORS.php` - CORS headers
- `Core/PluginDependencies.php` - Dependency checking

**CLI:**
- `Core/CLI.php` - WP-CLI commands
  - `wp frs-users list-profiles`
  - `wp frs-users list-guests`
  - `wp frs-users create-user`
  - `wp frs-users generate-slugs`
  - `wp frs-users migrate-person-cpt`

### Assets

- `Assets/Admin.php` - Load admin React apps
- `Assets/FRSAdmin.php` - FRS-specific admin assets

### Admin Pages

- `Admin/ProfilesPage.php` - Admin profiles page container
- `Admin/ProfilesList.php` - Profile table list
- `Admin/ProfileView.php` - Single profile view
- `Admin/ProfileEdit.php` - Profile editing interface
- `Admin/ProfileImportExport.php` - CSV import/export
- `Admin/ProfileMerge.php` - Profile merging
- `Admin/ProfileMergeSelect.php` - Merge selection

### Integrations

- `Integrations/FluentCRMSync.php` - FluentCRM sync
- `Integrations/FRSSync.php` - FRS API sync

### Abilities (Permissions)

- `Abilities/AbilitiesRegistry.php` - Register capabilities
- `Abilities/Categories.php` - Ability categories
- `Abilities/ProfileAbilities.php` - Profile capabilities
- `Abilities/RoleAbilities.php` - Role-based capabilities
- `Abilities/SyncAbilities.php` - Sync capabilities
- `Abilities/UserAbilities.php` - User management capabilities

### DataKit

- `DataKit/EloquentDataSource.php` - DataKit data source
- `DataKit/ProfilesDataView.php` - DataKit view config

### Traits

- `Traits/Base.php` - Singleton pattern
  - `get_instance()` - Get singleton
  - `init()` - Initialize hook

### Utilities

- `functions.php` - Helper functions

---

## Database Migrations

**Location:** `database/Migrations/`

1. **`Profiles.php`** - Main profiles table schema
   - Table: `wp_frs_profiles`
   - Fields: id, user_id, email, profile_slug, display_name, JSON fields

2. **`ProfileTypes.php`** - Profile type constants

3. **`AddProfileSlug.php`** - Add unique profile_slug field

4. **`AddDisplayNameToProfiles.php`** - Add display_name field

5. **`AddServiceAreasToProfiles.php`** - Add service_areas JSON field

6. **`AddRealtorFields.php`** - Add realtor-specific fields

7. **`MigratePersonCPT.php`** - Migrate legacy Person CPT

8. **`SSOConnections.php`** - SSO connection tracking table

**Seeders:**
- `database/Seeders/Accounts.php` - Seed test accounts

---

## Gutenberg Blocks

**Location:** `src/blocks/`

### 1. Loan Officer Card Block
- `loan-officer-card/edit.tsx` - Block editor UI
- `loan-officer-card/index.tsx` - Block registration
- `loan-officer-card/view.tsx` - Frontend display

### 2. Loan Officer Directory Block
- `loan-officer-directory/edit.tsx` - Block editor UI
- `loan-officer-directory/index.tsx` - Block registration
- `loan-officer-directory/view.tsx` - Frontend display

---

## Configuration Files

### Build Tools
- `vite.admin.config.js` - Admin dashboard build (port 5174)
- `vite.frontend.config.js` - Frontend apps build
- `vite.portal.config.js` - Portal app build (port 5176)
- `vite.profile-editor.config.js` - Profile editor build (port 5175)
- `vite.public-profile.config.js` - Public profile build (port 5178)
- `vite.directory.config.js` - Directory app build (port 5177)
- `vite.widget.config.js` - Widget build
- ~~`vite.optimization.js`~~ - Optimization config (reverted)

### Package Management
- `package.json` - NPM dependencies
- `composer.json` - PHP dependencies

### WordPress
- `plugin.php` - Main plugin entry point
- `uninstall.php` - Plugin uninstall handler
- `config/plugin.php` - Plugin metadata

### Storybook
- `.storybook/` - Component library setup
- Storybook version: 7.5.2 (DO NOT upgrade - breaks WordPress integration)

---

## Key Architectural Patterns

### Data Flow
```
React Component → REST API (/wp-json/frs-users/v1/) →
  Controller (Profiles/Actions) → Eloquent Model (Profile) → Database (wp_frs_profiles)
```

### Singleton Pattern
```php
use FRSUsers\Traits\Base;

class MyClass {
    use Base;
}

// Usage
MyClass::get_instance()->init();
```

### Eloquent ORM
```php
use FRSUsers\Models\Profile;

// Basic CRUD
$profiles = Profile::all();
$profile = Profile::find($id);
$profile = Profile::create(['email' => 'user@example.com']);
$profile->update(['first_name' => 'Jane']);

// Scopes
$active = Profile::active()->get();
$guests = Profile::guests()->get();
$loan_officers = Profile::ofType('loan_officer')->get();

// Static helpers
$profile = Profile::get_by_email('user@example.com');
$profile = Profile::get_by_user_id($user_id);
```

---

## Archived Components (Legacy)

**Location:** `src/_archived-from-bp-integration/` (257+ files)

**Status:** Preserved for reference, NOT used in current builds

**Contents:**
- Deprecated BuddyPress integrations
- Legacy portal dashboards
- Old calculator components
- Marketing material generators
- Lead tracking components
- Calendar integrations

---

## Development Commands

```bash
# Development servers
npm run dev              # Admin + Frontend (ports 5174 + 5173)
npm run dev:admin        # Admin only (port 5174)
npm run dev:portal       # Portal only (port 5176)
npm run dev:profile-editor  # Profile editor (port 5175)
npm run dev:directory    # Directory only (port 5177)
npm run dev:public-profile  # Public profile (port 5178)

# Production builds
npm run build            # Build all apps
npm run build:portal     # Build portal only
npm run build:profile-editor  # Build profile editor
npm run build:directory  # Build directory

# WP-CLI
wp frs-users list-profiles [--type=loan_officer]
wp frs-users list-guests
wp frs-users create-user <profile_id>
wp frs-users generate-slugs
wp frs-users migrate-person-cpt
```

---

## Known Issues & Notes

1. **Storybook Version:** DO NOT upgrade from 7.5.2 - newer versions break WordPress/Vite integration
2. **vite.optimization.js:** Reverted - caused build issues with WordPress
3. **Build Warnings:** Some chunks >500KB - intentional, splitting causes WP loading issues
4. **CSS Warnings:** `.border*` syntax warnings in some builds - non-breaking

---

## Quick Reference

**Finding Components:**
- Admin pages: `src/admin/pages/`
- Portal pages: `src/frontend/portal/`
- Shared UI: `src/components/ui/`
- PHP controllers: `includes/Controllers/`
- Models: `includes/Models/`
- API routes: `includes/Routes/Api.php`

**Finding Endpoints:**
- REST API: `includes/Routes/Api.php` → `/wp-json/frs-users/v1/`
- Shortcodes: `includes/Controllers/Shortcodes.php`
- Blocks: `src/blocks/` + `includes/Controllers/Blocks.php`

**Database:**
- Schema: `database/Migrations/Profiles.php`
- Model: `includes/Models/Profile.php`
- Table: `wp_frs_profiles`

---

**Last verified:** 2025-12-05
**Build system:** Vite 4.5.14 (frs-wp-users), Vite 5.4.21 (frs-lrg)
