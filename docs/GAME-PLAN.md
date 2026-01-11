# FRS User Profiles - Implementation Game Plan

## Current Status: Phase 1 Complete

**Last Commit:** `e8d966fa2` - Add multi-site architecture with site context and profile sync

---

## What's Done

### Multi-Site Architecture (Committed)
- [x] Centralized `Roles.php` class - single source of truth for all role configurations
- [x] Site context system with 4 contexts (development, hub, 21stcenturylending, c21masters)
- [x] Layered configuration: Constant → Filter → Option → Default
- [x] `ProfileSync.php` for webhook-based sync (production)
- [x] WP-CLI commands: `site-context`, `sync-from-hub`, `setup-sync`
- [x] REST API filtering by site context
- [x] Admin settings page for site context (when not locked by constant)
- [x] Full documentation in `docs/MULTI-SITE-ARCHITECTURE.md`

### Admin Interface (Committed)
- [x] WordPress-native DataViews admin interface
- [x] Profile list page with filtering
- [x] Profile edit page
- [x] Profile add page
- [x] User profile fields on WP user edit screen
- [x] Company role labels (ROLE_LABELS → COMPANY_ROLE_LABELS)

---

## Recently Completed Changes

These changes were committed as part of the role normalization:

| File | Description |
|------|-------------|
| `assets/admin/src/style.scss` | Admin styling updates |
| `assets/blocks/loan-officer-directory/render.php` | Block rendering updates (removed hero avatars) |
| `assets/blocks/loan-officer-directory/style-index.css` | Block styles |
| `assets/blocks/loan-officer-directory/view.js` | Block interactivity |
| `database/Migrations/AddRealtorFields.php` | Renamed `realtor_partner` → `partner` |
| `database/Migrations/ProfileTypes.php` | Updated documentation |
| `includes/Abilities/*` | Added all 9 WP roles to enum options |
| `includes/Admin/ProfilesList.php` | Updated to use company roles |
| `includes/Admin/UserProfileFields.php` | Now uses centralized Roles class |
| `includes/Integrations/ArriveAutoPopulate.php` | Uses `frs_company_role` meta key |
| `includes/Integrations/FluentCRMSync.php` | Uses centralized Roles class, all roles in tags |
| `templates/profile/qr-landing.php` | Uses `Roles::get_url_prefix()` for URLs |
| `views/admin/profile-edit.php` | Updated dropdown to use all company roles |

---

## Next Steps

### Immediate (This Session)

1. **Commit remaining changes**
   - Decide what to commit vs gitignore
   - Create meaningful commit message

2. **Test site context system**
   - Verify `wp frs-users site-context` command works
   - Test option-based context switching in admin
   - Verify API filtering by company role

### Short-Term (Before Production)

3. **Set up myhub21.com local environment**
   - Create Local Sites instance for myhub21.com
   - Symlink or copy plugin
   - Set `FRS_SITE_CONTEXT = 'hub'` in wp-config.php

4. **Test sync workflow**
   - Test CLI sync from hub to marketing site
   - Verify profile data transfers correctly
   - Test webhook endpoint (simulate POST)

5. **Configure production sites**
   ```php
   // myhub21.com wp-config.php
   define( 'FRS_SITE_CONTEXT', 'hub' );

   // 21stcenturylending.com wp-config.php
   define( 'FRS_SITE_CONTEXT', '21stcenturylending' );
   ```

### Medium-Term

6. **Webhook production setup**
   - Generate webhook secrets on both sites
   - Configure hub to send to marketing sites
   - Test real-time sync

7. **Frontend block testing**
   - Test loan officer directory block on marketing site
   - Verify service area filtering works
   - Test profile links/URLs

---

## Site Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     HUB (myhub21.com)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  FRS User Profiles Plugin                                │    │
│  │  - All profile data (single source of truth)            │    │
│  │  - Profile editing enabled                               │    │
│  │  - FRS_SITE_CONTEXT = 'hub'                             │    │
│  │  - Sends webhooks on profile save                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                    Webhooks (on save)                           │
│                              ▼                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 21stcentury     │  │ c21masters.com  │  │ Other Sites     │
│ lending.com     │  │                 │  │                 │
│                 │  │                 │  │                 │
│ Shows:          │  │ Shows:          │  │                 │
│ - LO            │  │ - Broker Assoc  │  │                 │
│ - Leadership    │  │ - Sales Assoc   │  │                 │
│                 │  │ - Leadership    │  │                 │
│ Editing: OFF    │  │ Editing: OFF    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Testing Checklist

### Site Context
- [ ] `wp frs-users site-context` shows correct context
- [ ] Changing option updates context (when no constant)
- [ ] Constant locks context and shows in admin
- [ ] API filters profiles by active company roles

### Sync (Development)
- [ ] `wp frs-users setup-sync --hub-url=<url>` saves hub URL
- [ ] `wp frs-users sync-from-hub --dry-run` shows what would sync
- [ ] `wp frs-users sync-from-hub` creates/updates local users
- [ ] Only active company roles are synced

### Sync (Production)
- [ ] Webhook secret generated and saved
- [ ] Webhook endpoint accessible
- [ ] Signature verification works
- [ ] Profile updates trigger webhook
- [ ] Marketing site receives and processes webhook

### Admin Interface
- [ ] Profile list shows only active company roles
- [ ] Edit link works
- [ ] Add profile works (hub only)
- [ ] Site context setting visible (when not locked)

---

## Quick Reference

### WP-CLI Commands
```bash
# Check current context
wp frs-users site-context

# Configure sync (on marketing site)
wp frs-users setup-sync --hub-url=https://myhub21.com
wp frs-users setup-sync --generate-secret

# Sync profiles (development)
wp frs-users sync-from-hub
wp frs-users sync-from-hub --dry-run
wp frs-users sync-from-hub --type=loan_originator
```

### wp-config.php Constants
```php
// Lock site context (production)
define( 'FRS_SITE_CONTEXT', 'hub' );              // or
define( 'FRS_SITE_CONTEXT', '21stcenturylending' );  // or
define( 'FRS_SITE_CONTEXT', 'c21masters' );
```

### REST API
```
GET /wp-json/frs-users/v1/profiles?type=loan_originator
GET /wp-json/frs-users/v1/profiles/{id}
POST /wp-json/frs-users/v1/webhook/profile-updated
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 2025 | Option 1: Same plugin, different context | Simplest approach, short timeframe, limited experience |
| Jan 2025 | Layered config (Constant → Filter → Option) | Flexibility for dev, safety for production |
| Jan 2025 | Hub includes all 8 company roles | Partner directory needed on hub |
| Jan 2025 | CLI for dev sync, webhooks for production | Different reliability/convenience needs |
