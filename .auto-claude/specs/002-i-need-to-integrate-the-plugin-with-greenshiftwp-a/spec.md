# Specification: GreenshiftWP Integration for FRS User Profiles

## Overview

This feature integrates the FRS User Profiles plugin with GreenshiftWP page builder, enabling all profile fields to be accessible through Greenshift's dynamic data system. Since GreenshiftWP only supports WordPress meta tables (postmeta, usermeta, options) for dynamic data, and FRS stores profiles in a custom table (`wp_frs_profiles`), this integration creates a sync bridge that mirrors profile data to WordPress user meta. Additionally, field-specific shortcodes provide a fallback mechanism for guest profiles and use in Greenshift's shortcode blocks.

## Workflow Type

**Type**: feature

**Rationale**: This is a new integration feature that requires creating new files, hooks, and synchronization logic. It involves multiple components (sync service, shortcodes, admin settings) and will touch both PHP backend and potentially documentation.

## Task Scope

### Services Involved
- **FRS User Profiles Plugin** (primary) - The plugin to integrate, containing profile data
- **GreenshiftWP** (external) - Page builder requiring WordPress meta for dynamic data

### This Task Will:
- [ ] Create a GreenshiftWP integration class that syncs profile data to WordPress user meta
- [ ] Add field-specific shortcodes for all profile fields (e.g., `[frs_field name="first_name"]`)
- [ ] Hook into the existing `frs_profile_saved` action for real-time sync
- [ ] Handle JSON array fields appropriately (flatten or serialize for meta storage)
- [ ] Provide admin UI to enable/configure the integration
- [ ] Support current user context for shortcodes (default behavior)

### Out of Scope:
- Modifying GreenshiftWP internals or creating custom Greenshift data source plugins
- Guest profile sync to user meta (guests have no `user_id`)
- Premium Greenshift Query Addon functionality validation
- Complex Query Loop integration beyond basic meta getter support

## Service Context

### FRS User Profiles Plugin

**Tech Stack:**
- Language: PHP 8.1+
- Framework: WordPress 6.0+ with Eloquent ORM (prappo/wp-eloquent)
- Key directories: `includes/`, `database/`, `src/`

**Entry Point:** `frs-wp-users.php` → `plugin.php`

**How to Run:**
```bash
# WordPress plugin - activate in wp-admin
# Development
npm run dev:admin        # Admin React app (port 5174)
npm run build            # Build all assets
```

**Port:** 5174 (admin dev server)

### Key Files

| File | Purpose |
|------|---------|
| `includes/Models/Profile.php` | Eloquent model with 40+ profile fields |
| `includes/Controllers/Shortcodes.php` | Existing shortcode registration pattern |
| `includes/Integrations/FluentCRMSync.php` | Reference integration pattern |
| `database/Migrations/Profiles.php` | Database schema definition |

## Files to Modify

| File | Service | What to Change |
|------|---------|---------------|
| `includes/Integrations/GreenshiftSync.php` | FRS Plugin | **CREATE** - New integration class for syncing to user meta |
| `includes/Controllers/FieldShortcodes.php` | FRS Plugin | **CREATE** - Field-specific shortcodes controller |
| `plugin.php` | FRS Plugin | Add initialization for new Greenshift integration |
| `includes/Routes/Api.php` | FRS Plugin | Add API endpoint for integration settings (optional) |

## Files to Reference

These files show patterns to follow:

| File | Pattern to Copy |
|------|----------------|
| `includes/Integrations/FluentCRMSync.php` | Integration class structure, hook into `frs_profile_saved` |
| `includes/Controllers/Shortcodes.php` | Shortcode registration and rendering patterns |
| `includes/Models/Profile.php` | Profile field list, JSON casts, data access patterns |
| `includes/Traits/Base.php` | Singleton pattern for service classes |

## Patterns to Follow

### Integration Class Pattern

From `includes/Integrations/FluentCRMSync.php`:

```php
namespace FRSUsers\Integrations;

use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

class GreenshiftSync {
    use Base;

    public function init(): void {
        // Hook into profile saves
        add_action('frs_profile_saved', [$this, 'sync_to_user_meta'], 10, 2);
    }

    public function sync_to_user_meta(int $profile_id, array $profile_data): void {
        $profile = Profile::find($profile_id);
        if (!$profile || !$profile->user_id) {
            return; // Can't sync guest profiles to user meta
        }

        // Sync each field to user meta with 'frs_' prefix
        foreach ($this->get_syncable_fields() as $field) {
            $value = $profile->$field;
            // Handle JSON arrays
            if (is_array($value)) {
                $value = wp_json_encode($value);
            }
            update_user_meta($profile->user_id, 'frs_' . $field, $value);
        }
    }
}
```

**Key Points:**
- Use the `Base` trait for singleton pattern
- Hook into `frs_profile_saved` for real-time sync
- Check for `user_id` before syncing (skip guest profiles)
- Prefix meta keys with `frs_` to avoid conflicts

### Shortcode Registration Pattern

From `includes/Controllers/Shortcodes.php`:

```php
public static function register_shortcodes() {
    add_shortcode('frs_field', array(__CLASS__, 'render_field'));

    // Allow extensions
    do_action('frs_users_register_shortcodes');
}

public static function render_field($atts) {
    $atts = shortcode_atts(
        array(
            'name'       => '',
            'user_id'    => 'current',
            'profile_id' => null,
            'default'    => '',
        ),
        $atts,
        'frs_field'
    );

    // Get profile...
    // Return field value...
}
```

**Key Points:**
- Use `shortcode_atts()` for attribute parsing
- Support `user_id="current"` for logged-in user context
- Provide `default` attribute for fallback values

## Requirements

### Functional Requirements

1. **User Meta Sync**
   - Description: When a profile is saved, sync all relevant fields to WordPress user meta
   - Acceptance: After saving a profile, all synced fields should be readable via `get_user_meta($user_id, 'frs_field_name')`

2. **Field Shortcodes**
   - Description: Provide `[frs_field name="field_name"]` shortcode to output any profile field
   - Acceptance: Shortcode renders correct field value for current user or specified user/profile

3. **JSON Array Handling**
   - Description: JSON fields (specialties, languages, etc.) should be stored appropriately for meta usage
   - Acceptance: JSON fields accessible in both raw (serialized) and comma-separated formats

4. **Guest Profile Fallback**
   - Description: Guest profiles (no user_id) work via shortcodes even though they can't sync to user meta
   - Acceptance: `[frs_field profile_id="123" name="first_name"]` works for guest profiles

5. **Greenshift Compatibility**
   - Description: Synced meta fields work with Greenshift's Meta Getter block
   - Acceptance: Meta Getter can select and display `frs_*` user meta fields

### Edge Cases

1. **Profile without user_id (Guest)** - Skip user meta sync, rely on shortcode with `profile_id` attribute
2. **Empty/null field values** - Return empty string, use `default` attribute if provided
3. **JSON arrays in Meta Getter** - Provide both raw JSON and comma-separated string versions
4. **Profile deletion** - Clean up corresponding user meta
5. **User without profile** - Shortcode returns empty string or default
6. **Bulk profile updates** - Handle efficiently without performance degradation

## Implementation Notes

### DO
- Follow the singleton pattern using `Base` trait in `includes/Traits/Base.php`
- Use Eloquent ORM (`Profile::find()`, `Profile::where()`) for all database access
- Prefix all user meta keys with `frs_` (e.g., `frs_first_name`, `frs_job_title`)
- Hook into existing `frs_profile_saved` action (already fires on Profile model save)
- Provide both JSON and flattened versions of array fields for flexibility
- Add the new integration initialization in `plugin.php`

### DON'T
- Use raw SQL queries - always use Eloquent
- Modify the `wp_frs_profiles` table schema
- Create dependencies on Greenshift premium addons being installed
- Store sensitive data (API keys, passwords) in user meta
- Sync fields that don't make sense as user meta (e.g., `followupboss_api_key`)

## Profile Fields to Sync

Based on `database/Migrations/Profiles.php` and `includes/Models/Profile.php`:

### Scalar Fields (Direct Sync)
| Field | Meta Key | Type |
|-------|----------|------|
| `email` | `frs_email` | string |
| `first_name` | `frs_first_name` | string |
| `last_name` | `frs_last_name` | string |
| `display_name` | `frs_display_name` | string |
| `phone_number` | `frs_phone_number` | string |
| `mobile_number` | `frs_mobile_number` | string |
| `office` | `frs_office` | string |
| `job_title` | `frs_job_title` | string |
| `biography` | `frs_biography` | text |
| `select_person_type` | `frs_person_type` | string |
| `nmls_number` | `frs_nmls_number` | string |
| `license_number` | `frs_license_number` | string |
| `dre_license` | `frs_dre_license` | string |
| `brand` | `frs_brand` | string |
| `city_state` | `frs_city_state` | string |
| `region` | `frs_region` | string |
| `profile_slug` | `frs_profile_slug` | string |
| `profile_headline` | `frs_profile_headline` | text |
| `facebook_url` | `frs_facebook_url` | url |
| `instagram_url` | `frs_instagram_url` | url |
| `linkedin_url` | `frs_linkedin_url` | url |
| `twitter_url` | `frs_twitter_url` | url |
| `youtube_url` | `frs_youtube_url` | url |
| `tiktok_url` | `frs_tiktok_url` | url |
| `headshot_id` | `frs_headshot_id` | int |

### JSON Array Fields (Dual Format Sync)
| Field | Meta Key (JSON) | Meta Key (CSV) | Type |
|-------|-----------------|----------------|------|
| `languages` | `frs_languages` | `frs_languages_list` | array |
| `specialties` | `frs_specialties` | `frs_specialties_list` | array |
| `specialties_lo` | `frs_specialties_lo` | `frs_specialties_lo_list` | array |
| `awards` | `frs_awards` | `frs_awards_list` | array |
| `nar_designations` | `frs_nar_designations` | `frs_nar_designations_list` | array |
| `namb_certifications` | `frs_namb_certifications` | `frs_namb_certifications_list` | array |
| `service_areas` | `frs_service_areas` | `frs_service_areas_list` | array |

### Fields NOT to Sync (Sensitive/Internal)
- `followupboss_api_key` - Sensitive API credential
- `followupboss_status` - Internal status
- `notification_settings` - User preferences
- `privacy_settings` - User preferences
- `profile_visibility` - Complex visibility rules

## Development Environment

### Start Services

```bash
# Development
cd /Users/cedarstone/Local Sites/tutorlms-exploration/app/public/wp-content/plugins/frs-wp-users
npm run dev:admin        # Admin React app if needed

# Build for production
npm run build
```

### Service URLs
- WordPress Admin: http://tutorlms-exploration.local/wp-admin/
- REST API: http://tutorlms-exploration.local/wp-json/frs-users/v1/

### Required Environment Variables
- None specific to this integration (uses WordPress environment)

## File Structure to Create

```
includes/
├── Integrations/
│   ├── FluentCRMSync.php      # Existing (reference)
│   └── GreenshiftSync.php     # NEW - User meta sync
└── Controllers/
    ├── Shortcodes.php         # Existing (reference)
    └── FieldShortcodes.php    # NEW - Field-specific shortcodes
```

## Success Criteria

The task is complete when:

1. [ ] `GreenshiftSync.php` integration class created and initialized
2. [ ] Profile saves trigger automatic sync to WordPress user meta
3. [ ] All scalar fields sync with `frs_` prefix
4. [ ] JSON array fields sync in both JSON and comma-separated formats
5. [ ] `[frs_field]` shortcode works for all profile fields
6. [ ] Shortcode supports `user_id="current"` (default), `user_id="123"`, and `profile_id="456"`
7. [ ] Guest profiles work via shortcode with `profile_id` attribute
8. [ ] Greenshift Meta Getter block can select and display `frs_*` user meta fields
9. [ ] No console errors or PHP warnings
10. [ ] Existing tests still pass
11. [ ] `npm run build` successful

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests
| Test | File | What to Verify |
|------|------|----------------|
| Meta Sync | `tests/Integration/GreenshiftSyncTest.php` | Profile save triggers meta update |
| Field Shortcode | `tests/Shortcodes/FieldShortcodeTest.php` | Shortcode returns correct values |
| JSON Handling | `tests/Integration/GreenshiftSyncTest.php` | Arrays stored in both formats |
| Guest Handling | `tests/Shortcodes/FieldShortcodeTest.php` | Guest profile shortcode works |

### Integration Tests
| Test | Services | What to Verify |
|------|----------|----------------|
| Profile Save → Meta | FRS Plugin ↔ WordPress | Saving profile updates user meta |
| Shortcode → Profile | FRS Plugin ↔ WordPress | Shortcode fetches from custom table |

### End-to-End Tests
| Flow | Steps | Expected Outcome |
|------|-------|------------------|
| Profile Edit Sync | 1. Edit profile in admin 2. Check user meta | Meta values match profile |
| Greenshift Display | 1. Add Meta Getter block 2. Select frs_first_name 3. View page | Name displays correctly |
| Shortcode Render | 1. Add `[frs_field name="job_title"]` to page 2. View page | Job title displays |

### Browser Verification (if frontend)
| Page/Component | URL | Checks |
|----------------|-----|--------|
| Page with shortcode | Any page with `[frs_field]` | Field value renders |
| Greenshift page | Any Greenshift-built page | Meta Getter displays frs_ fields |

### Database Verification (if applicable)
| Check | Query/Command | Expected |
|-------|---------------|----------|
| User meta exists | `SELECT * FROM wp_usermeta WHERE meta_key LIKE 'frs_%' AND user_id = X` | Meta rows for synced fields |
| Profile data intact | `SELECT * FROM wp_frs_profiles WHERE id = X` | Original profile unchanged |

### QA Sign-off Requirements
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Browser verification complete (shortcode renders)
- [ ] Database state verified (user meta populated)
- [ ] No regressions in existing functionality
- [ ] Code follows established patterns (Base trait, Eloquent ORM)
- [ ] No security vulnerabilities introduced
- [ ] Sensitive fields excluded from sync

## Shortcode Usage Examples

### Basic Field Output
```
[frs_field name="first_name"]
[frs_field name="job_title"]
[frs_field name="biography"]
```

### With Fallback Default
```
[frs_field name="phone_number" default="Contact Us"]
```

### Specific User/Profile
```
[frs_field user_id="123" name="first_name"]
[frs_field profile_id="456" name="email"]
```

### Array Fields
```
[frs_field name="languages" format="list"]      <!-- Returns comma-separated -->
[frs_field name="specialties" format="json"]    <!-- Returns JSON string -->
[frs_field name="languages" format="count"]     <!-- Returns count: "3" -->
```

### With Greenshift
In Greenshift, use the Meta Getter block:
1. Source: User Meta
2. Meta Key: `frs_first_name` (or any `frs_*` field)
3. Current User: Yes (or specific user ID)
