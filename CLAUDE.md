# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FRS User Profiles is a WordPress plugin for managing loan officer, realtor, staff, and leadership profiles. It supports both a legacy custom database table (`frs_profiles`) and a WordPress-native mode that stores profile data in `wp_users` + `wp_usermeta`.

## Build Commands

```bash
# PHP dependencies
composer install
composer lint          # Run PHPCS
composer lint:fix      # Run PHPCBF auto-fix
composer test          # Run PHPUnit

# Admin React interface (assets/admin/)
cd assets/admin && npm install
npm run build          # Build for production
npm run start          # Watch mode for development

# Gutenberg blocks (assets/blocks/)
cd assets/blocks && npm install
npm run build          # Build blocks
npm run start          # Watch mode
```

## Architecture

### Data Storage (Dual Mode)

The `Profile` model (`includes/Models/Profile.php`) operates in two modes controlled by `$use_wp_native`:

1. **WordPress-native mode** (default): Reads/writes to `wp_users` + `wp_usermeta` with `frs_` prefixed meta keys
2. **Legacy mode**: Uses custom `frs_profiles` table via Eloquent ORM (prappo/wp-eloquent)

Profile fields are stored as user meta with `frs_` prefix (e.g., `frs_phone_number`, `frs_nmls`). JSON fields like `specialties`, `languages`, `service_areas` are encoded/decoded automatically.

### Key Directories

- `includes/` - PSR-4 autoloaded PHP classes (namespace `FRSUsers\`)
- `includes/Models/` - Eloquent models (Profile, UserProfile)
- `includes/Routes/Api.php` - REST API endpoints under `frs-users/v1`
- `includes/Controllers/` - Block registration, shortcodes, API actions
- `includes/Admin/` - WordPress admin pages (DataViews-based)
- `includes/Core/` - Core services (CLI, Template, CORS, VCard)
- `includes/Integrations/` - FluentCRM sync, FRS sync, Arrive auto-populate
- `assets/admin/` - React admin interface using @wordpress/dataviews
- `assets/blocks/` - Gutenberg blocks (directory-grid, directory-search, loan-officer-directory)
- `database/Migrations/` - Database schema migrations
- `templates/profile/` - Frontend profile templates (loan-officer.php, qr-landing.php)

### REST API

Base: `/wp-json/frs-users/v1/`

Key endpoints:
- `GET/POST /profiles` - List/create profiles
- `GET/PUT/DELETE /profiles/{id}` - Single profile CRUD
- `GET /profiles/slug/{slug}` - Public profile by slug
- `GET /profiles/user/{user_id|me}` - Profile by user ID
- `POST /profiles/{id}/create-user` - Create WP user for guest profile
- `GET /vcard/{id}` - Download vCard
- `GET /service-areas` - List unique service areas
- `POST /meeting-request` - Public contact form

### WP-CLI Commands

```bash
wp frs-users list-profiles [--type=<type>] [--format=<format>]
wp frs-users list-guests
wp frs-users create-user <profile_id> [--username=<name>] [--send-email]
wp frs-users generate-slugs
wp frs-users generate-qr-codes [--force] [--id=<user_id>]
wp frs-users generate-vcards [--type=<type>]
wp frs-users migrate-fields [--dry-run]
wp frs-users cleanup-fields [--dry-run]
wp frs-users sync-suredash-avatars [--force]
wp frs-users migrate-person-cpt
```

### Profile Types / Roles

Profiles have a `select_person_type` field mapped to WordPress roles:
- `loan_originator` / `loan_officer` - Loan officers
- `broker_associate` / `realtor_partner` - Real estate agents
- `sales_associate` - Sales staff
- `dual_license` - Both mortgage and real estate
- `leadership` - Company leadership
- `staff` / `assistant` - Support staff

### Gutenberg Blocks

Registered in `includes/Controllers/Blocks.php`:
- `frs/lo-directory` - Searchable loan officer directory with service area filtering
- `frs/directory-grid` - Grid display of profiles
- `frs/directory-search` - Search component
- `frs/loan-officer-card` - Individual profile card

Blocks use WordPress Interactivity API for frontend behavior (`view.js` stores).

### Integrations

- **FluentCRM**: Real-time sync on user create/update/role change (`includes/Integrations/FluentCRMSync.php`)
- **Simple Local Avatars**: Uses WP avatar system for profile photos
- **Arrive**: Auto-populates Arrive loan application URLs (`includes/Integrations/ArriveAutoPopulate.php`)

### Multisite Support

Uses `$wpdb->base_prefix` for network-wide profile tables (configured in `libs/db.php`).

### Hooks

- `frs_profile_saved` - Fires after profile create/update with `($profile_id, $profile_data)`
- `frs_users_loaded` - Fires after plugin initialization
- `frs_users_api_routes` - Add custom REST routes
- `frs_users_register_blocks` - Register additional blocks

### User Meta Keys

All FRS fields use `frs_` prefix:
- Core: `frs_phone_number`, `frs_mobile_number`, `frs_job_title`, `frs_biography`
- Licensing: `frs_nmls`, `frs_nmls_number`, `frs_license_number`, `frs_dre_license`
- Social: `frs_facebook_url`, `frs_instagram_url`, `frs_linkedin_url`, `frs_twitter_url`
- Profile: `frs_profile_headline`, `frs_profile_theme`, `frs_is_active`, `frs_qr_code_data`
- JSON arrays: `frs_specialties`, `frs_languages`, `frs_service_areas`, `frs_custom_links`
