# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Start

**Plugin:** FRS User Profiles | **Namespace:** `FRSUsers` | **PHP:** 8.1+ | **WordPress:** 6.0+

```bash
npm install && composer install   # Install dependencies
npm run build                     # Build all assets
npm run dev:admin                 # Dev server for admin (port 5174)
```

**Core Pattern:** React SPA → REST API → Controllers → Eloquent → Database

---

## Critical Rules

1. **Research First** - Read actual code before making changes. Check `database/Migrations/Profiles.php`, `src/admin/routes.jsx`, existing patterns.
2. **React SPA for Profiles** - Profile management uses React SPA, not traditional WordPress admin. PHP renders container, React takes over.
3. **Eloquent Only** - NEVER use raw SQL. ALWAYS use `FRSUsers\Models\Profile` and Eloquent ORM.
4. **REST API for React** - React components MUST fetch data via REST API (`/wp-json/frs-users/v1/`).
5. **Assume Your Change Broke It** - When debugging, fix YOUR code first before blaming caching.
6. **Push After Commit** - ALWAYS push to remote after committing. Never leave commits local.

---

## Documentation

Detailed guides in `/docs`:
- **[VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md)** - Critical Vite setup (READ THIS for React work)
- **[DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md)** - Complete database schema
- **[DEVELOPMENT-WORKFLOWS.md](docs/DEVELOPMENT-WORKFLOWS.md)** - Step-by-step guides
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues & fixes

---

## Commands

```bash
# Development (see docs/VITE-DEV-SERVER.md)
npm run dev              # Admin + Frontend (ports 5174 + 5173)
npm run dev:admin        # Admin only (port 5174)
npm run dev:portal       # Portal only (port 5176)
npm run dev:profile-editor  # Profile editor (port 5175)
npm run dev:directory    # Directory only (port 5177)

# Production
npm run build            # Build all apps

# Code quality
npm run lint:fix         # Fix JS/PHP linting
npm run format:fix       # Fix formatting

# WP-CLI
wp frs-users list-profiles [--type=loan_officer]
wp frs-users list-guests
wp frs-users create-user <profile_id>
wp frs-users generate-slugs
wp frs-users migrate-person-cpt
```

---

## Architecture

### React Apps (6 Vite configs)

| App | Entry Point | Dev Port | Dist Directory |
|-----|-------------|----------|----------------|
| Admin | `src/admin/main.jsx` | 5174 | `assets/admin/dist` |
| Frontend | `src/frontend/main.jsx` | 5173 | `assets/frontend/dist` |
| Portal | `src/frontend/portal/main.tsx` | 5176 | `assets/portal/dist` |
| Profile Editor | `src/frontend/profile-editor/main.tsx` | 5175 | `assets/profile-editor/dist` |
| Directory | `src/frontend/directory/` | 5177 | `assets/directory/dist` |
| Widget | `src/widget/` | - | `assets/widget/dist` |

### Data Flow

```
React Component → REST API (/wp-json/frs-users/v1/) → Controller → Eloquent Model → wp_frs_profiles
```

### Key Files

```
frs-wp-users/
├── database/Migrations/Profiles.php  # Database schema (source of truth)
├── includes/
│   ├── Models/Profile.php            # Eloquent model
│   ├── Routes/Api.php                # REST API routes
│   ├── Controllers/Profiles/Actions.php  # API handlers
│   ├── Core/CLI.php                  # WP-CLI commands
│   └── Core/ProfileStorage.php       # Carbon Fields → custom table
├── src/
│   ├── admin/routes.jsx              # Admin React Router
│   ├── admin/pages/                  # Admin React pages
│   └── frontend/portal/routes.tsx    # Portal React Router
├── libs/assets.php                   # Vite asset loading
└── vite.*.config.js                  # 6 Vite configs
```

---

## REST API

**Base:** `/wp-json/frs-users/v1/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | List profiles (`?type=`, `?guests_only=`, `?per_page=`, `?page=`) |
| POST | `/profiles` | Create profile |
| GET | `/profiles/{id}` | Get single profile |
| PUT | `/profiles/{id}` | Update profile |
| DELETE | `/profiles/{id}` | Delete profile |
| GET | `/profiles/user/{user_id}` | Get profile by user ID (or "me") |
| GET | `/profiles/slug/{slug}` | Get profile by slug (public) |
| POST | `/profiles/{id}/create-user` | Create WP user for guest profile |
| POST | `/profiles/bulk-create-users` | Bulk create users |
| GET/POST | `/sync-settings` | FluentCRM sync settings |
| GET | `/sync-stats` | Sync statistics |
| POST | `/trigger-sync` | Manual sync trigger |

---

## Key Patterns

### Singleton Pattern
```php
use FRSUsers\Traits\Base;

class MyClass {
    use Base;
}
// Usage: MyClass::get_instance()->init();
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
$profile = Profile::get_by_frs_agent_id($frs_id);
```

### Creating React Admin Features
1. Add REST endpoint in `includes/Routes/Api.php`
2. Create component in `src/admin/pages/MyFeature.tsx`
3. Add route in `src/admin/routes.jsx`
4. Add menu item in `includes/Admin/Menu.php` (use `#/route` format)
5. Build: `npm run build`

---

## Database

**Table:** `wp_frs_profiles`

Key fields:
- `id`, `user_id` (NULL for guests), `email` (unique), `profile_slug` (unique)
- `select_person_type`: loan_officer | agent | staff | leadership | assistant
- **JSON fields:** `languages`, `specialties_lo`, `specialties`, `awards`, `nar_designations`, `namb_certifications`, `profile_visibility`, `custom_links`, `service_areas`, `personal_branding_images`

See [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) for complete schema.

---

## Tech Stack

**Backend:** PHP 8.1+ | WordPress 6.0+ | Carbon Fields | Eloquent ORM (prappo/wp-eloquent) | PSR-4

**Frontend:** React 18 | TypeScript | Vite 4 | Tailwind + shadcn/ui | React Hook Form + Zod | Jotai | React Router (HashRouter)

**Build:** @kucrut/vite-for-wp | @wordpress/scripts (blocks)

---

## Quick Fixes

| Problem | Solution |
|---------|----------|
| React blank screen | `npm run build` + check browser console |
| REST API 404 | `wp rewrite flush` |
| Vite dev server issues | See [VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md) |
| Profile not saving | Check `$fillable` array, permission callbacks, browser console |
| Changes not loading | Verify `vite-dev-server.json` exists in dist directory |

---

## Git Workflow

```bash
git checkout -b feature/name-YYYY-MM-DD
# Make changes
npm run build
git add . && git commit -m "feat: description"
git push origin feature/name-YYYY-MM-DD
# Merge
git checkout main && git merge feature/name-YYYY-MM-DD && git push origin main
```

**Commit types:** `feat:` `fix:` `docs:` `refactor:` `perf:` `security:` `test:` `chore:`

---

## Checklist Before Done

- [ ] Used Eloquent (not raw SQL)
- [ ] REST API has permission callbacks
- [ ] React fetches via REST API
- [ ] TypeScript + shadcn/ui for new components
- [ ] `npm run build` successful
- [ ] No browser console errors
- [ ] Pushed to remote
