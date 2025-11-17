# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📚 Documentation Structure

This is the main overview. Detailed guides are in `/docs`:
- **[VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md)** - Critical Vite setup (READ THIS if working on React)
- **[DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md)** - Complete 51-field schema
- **[DEVELOPMENT-WORKFLOWS.md](docs/DEVELOPMENT-WORKFLOWS.md)** - Step-by-step guides
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues & fixes

---

## 🚨 Critical Rules - Read First

**RESEARCH-FIRST APPROACH:**

1. **READ THE ACTUAL CODE** - Check `database/Migrations/Profiles.php`, `src/admin/routes.jsx`, existing patterns
2. **CHECK DOCS** - See `/docs` folder for detailed guides
3. **ASK IF UNSURE** - Don't guess at architecture or patterns

**DEBUGGING RULE:**
- **ALWAYS assume your last change caused the error** - Fix YOUR code first, don't blame caching

**BOILERPLATE COMPLIANCE:**
- Use `@kucrut/vite-for-wp` for Vite (see [VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md))
- Use `libs/assets.php` helper functions
- Use Eloquent ORM (never raw SQL)
- Follow PSR-4 autoloading patterns

## Quick Reference - Dev Commands

```bash
# Install
npm install && composer install

# Development (see docs/VITE-DEV-SERVER.md for critical setup)
npm run dev              # Admin + Frontend (ports 5174 + 5173)
npm run dev:admin        # Admin only (port 5174)
npm run dev:portal       # Portal only (port 5176) ⚠️ See VITE-DEV-SERVER.md
npm run dev:profile-editor  # Profile editor (port 5175)

# Production
npm run build            # Build all (frontend, admin, portal, profile-editor, blocks, widget)

# Code quality
npm run lint:fix
npm run format:fix

# WP-CLI
wp frs-users list
wp frs-users create --email=user@example.com --first_name=John --last_name=Doe
```

**⚠️ VITE CRITICAL:** When working on React components, **always read [docs/VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md)** first. Dev server issues are common.

---

## Project Info

- **Plugin**: FRS User Profiles
- **Namespace**: `FRSUsers`
- **Text Domain**: `frs-users`
- **PHP**: 8.1+ (typed properties, readonly, enums)
- **WordPress**: 6.0+

**Purpose:** User profile management for 21st Century Lending (loan officers, agents, staff, leadership, assistants)

**Key Features:** Guest profiles, Carbon Fields metadata, Eloquent ORM, REST API, React admin, WP-CLI

---

## Architecture Overview

### Tech Stack Summary

**Backend:** PHP 8.1+ | WordPress 6.0+ | Carbon Fields | Eloquent ORM | PSR-4
**Frontend:** React 18 | TypeScript | Vite 4 | Tailwind + shadcn/ui | React Hook Form + Zod | Jotai
**Build:** Vite (5 configs: admin, frontend, portal, profile-editor, widget) | @wordpress/scripts | Grunt

### Core Architecture Pattern

**Admin Interface = React SPA**

```
PHP renders container → React mounts → React Router (HashRouter) → REST API for data
```

**Data Flow:**
```
React Component → REST API (/wp-json/frs-users/v1/) → Controller → Eloquent Model → Database
```

**Key Points:**
- ✅ Profile management uses React SPA (not traditional WordPress admin)
- ✅ PHP renders `<div id="frs-users-admin-root">`, React takes over
- ❌ Do NOT create traditional WordPress admin for profiles
- ❌ Do NOT use `views/admin/` templates for profile UI

---

## File Structure (Key Directories)

```
frs-wp-users/
├── database/Migrations/Profiles.php  # 51-field schema
├── includes/
│   ├── Admin/              # Admin classes
│   ├── Controllers/        # API controllers
│   ├── Core/               # ProfileFields, ProfileStorage, CLI, Api
│   ├── Models/Profile.php  # Eloquent model
│   └── Routes/Api.php      # REST API routes
├── src/
│   ├── admin/pages/        # React admin pages
│   ├── admin/routes.jsx    # React Router config
│   ├── frontend/portal/    # Portal React app
│   └── components/ui/      # shadcn/ui
├── assets/                 # Built (generated)
├── docs/                   # Documentation
└── vite.*.config.js        # 5 Vite configs
```

---

## Key Development Patterns

### 1. Singleton Pattern
```php
use FRSUsers\Traits\Base;

class MyClass {
    use Base;
}
// Usage: MyClass::get_instance()->init();
```

###2. Eloquent ORM (MANDATORY - Never use raw SQL)
```php
use FRSUsers\Models\Profile;

$profiles = Profile::all();
$profile = Profile::find($id);
$profile = Profile::create(['email' => 'user@example.com']);
$profile->first_name = 'Jane';
$profile->save();

$loan_officers = Profile::where('select_person_type', 'loan_officer')
    ->where('is_active', 1)
    ->orderBy('last_name')
    ->get();
```

### 3. REST API Routes (`includes/Routes/Api.php`)
**Base:** `/wp-json/frs-users/v1/`

```
GET/POST   /profiles
GET/PUT/DELETE /profiles/{id}
GET        /profiles/user/{user_id}
POST       /profiles/{id}/create-user
```

### 4. Carbon Fields Integration
`ProfileStorage.php` intercepts Carbon Fields saves → stores in `wp_frs_profiles` table (not postmeta)

---

## Database

**Table:** `wp_frs_profiles` - **51 fields total**

**📖 See [docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) for complete schema**

**Key Fields:**
- `id`, `user_id` (NULL for guests), `email` (unique)
- `select_person_type` (loan_officer|agent|staff|leadership|assistant)
- **JSON fields:** `languages`, `specialties_lo`, `specialties`, `awards`, `nar_designations`, `profile_visibility`, `custom_links`, `service_areas`, `personal_branding_images`

**Verify field count:**
```bash
grep -E "^\s+\w+\s+(VARCHAR|TEXT|JSON|BIGINT|DATE|BOOLEAN)" database/Migrations/Profiles.php | wc -l
# Should output: 51
```

---

---

## Creating React Admin Features

**📖 Full step-by-step guides in [docs/DEVELOPMENT-WORKFLOWS.md](docs/DEVELOPMENT-WORKFLOWS.md)**

**Quick Pattern:**
1. Create REST API endpoint (`includes/Routes/Api.php`)
2. Create React component (`src/admin/pages/MyFeature.tsx`)
3. Add route (`src/admin/routes.jsx`)
4. Add menu item (`includes/Admin/Menu.php`)
5. Build: `npm run dev:admin` or `npm run build`

---

## Critical Rules

### Rule #0: React SPA for Profile Management
- ✅ Create React components in `src/admin/pages/`
- ✅ Add routes to `src/admin/routes.jsx`
- ✅ Fetch data from REST API
- ❌ Do NOT create traditional WordPress admin pages for profiles

### Rule #1: Database Schema Completeness
When creating profile forms, ALL 51 fields must be included. **Verify the count.**

### Rule #2: Use Eloquent ORM
**NEVER** use raw SQL. **ALWAYS** use Eloquent models.

### Rule #3: REST API for Data Access
React components MUST use REST API. No direct database access.

### Rule #4: Security ALWAYS
**PHP:** Sanitize inputs, escape outputs, verify nonces, check capabilities
**React:** Validate API responses, use TypeScript, React Hook Form + Zod

---

## Coding Standards

### PHP Example (2025)
```php
namespace FRSUsers\Admin;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

class ProfileView {
    use Base;

    public function render(int $profile_id): void {
        if (!current_user_can('manage_options')) {
            wp_die(__('No permission', 'frs-users'));
        }

        $profile = Profile::find($profile_id);
        // React container or views/ template
    }
}
```

### React/TypeScript Example (2025)
```typescript
interface ProfileData {
  readonly id: number;
  readonly email: string;
}

export function ProfileList(): JSX.Element {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    fetch('/wp-json/frs-users/v1/profiles')
      .then(res => res.json())
      .then(data => setProfiles(data.data));
  }, []);

  return <div>{profiles.map(p => <div key={p.id}>{p.email}</div>)}</div>;
}
```

---

## Common Issues

**📖 Full troubleshooting in [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**

**Quick Fixes:**
- **React blank screen:** `npm run build` + check browser console
- **REST API 404:** `wp rewrite flush`
- **Vite dev server:** See [docs/VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md)
- **Profile not saving:** Check `$fillable` array, permission callbacks, browser console

---

## Git Workflow

```bash
# 1. Create branch
git checkout -b feature/name-YYYY-MM-DD

# 2. Build
npm run build

# 3. Commit (ALWAYS push after commit)
git add .
git commit -m "feat: description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push (MANDATORY - never leave commits local)
git push origin feature/name-YYYY-MM-DD

# 5. Merge to main
git checkout main && git merge feature/name-YYYY-MM-DD && git push origin main
```

**Commit types:** `feat:` `fix:` `docs:` `refactor:` `perf:` `security:` `test:` `chore:` `cleanup:`

---

## Checklist Before "Done"

**React SPA:**
- [ ] Created components in `src/admin/pages/`
- [ ] Added routes to `src/admin/routes.jsx`
- [ ] Created REST API endpoints
- [ ] Used TypeScript + shadcn/ui
- [ ] Verified ALL 51 fields (if form)
- [ ] Built assets: `npm run build`
- [ ] No console errors

**Backend:**
- [ ] Used Eloquent (not raw SQL)
- [ ] Added permission callbacks
- [ ] Sanitized inputs
- [ ] Checked capabilities

**Git:**
- [ ] Ran `npm run build`
- [ ] Pushed to remote

---

## Summary

**Core Pattern:** React SPA → REST API → Controllers → Eloquent → Database

**Remember:**
1. Profile management = React SPA
2. Always use Eloquent (never raw SQL)
3. Always use REST API from React
4. Always show ALL 51 database fields in forms
5. Always assume your last change caused the error
6. Always push commits to remote

**When confused:** STOP and ASK the user.

**Documentation:**
- [VITE-DEV-SERVER.md](docs/VITE-DEV-SERVER.md) - Critical for React work
- [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) - Complete 51-field schema
- [DEVELOPMENT-WORKFLOWS.md](docs/DEVELOPMENT-WORKFLOWS.md) - Step-by-step guides
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues & fixes
