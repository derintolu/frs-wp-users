# FRS Multi-Site Architecture

This document describes how the FRS User Profiles plugin operates across multiple WordPress installations with synchronized profile data.

---

## Overview

The FRS ecosystem uses a **hub-and-spoke architecture** where profile data is managed centrally and distributed to marketing sites:

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
│ 21stcentury     │  │ c21masters.com  │  │ Future Sites    │
│ lending.com     │  │                 │  │                 │
│                 │  │                 │  │                 │
│ Shows:          │  │ Shows:          │  │                 │
│ - Loan Officers │  │ - RE Agents     │  │                 │
│ - Leadership    │  │ - Sales Assoc   │  │                 │
│                 │  │ - Leadership    │  │                 │
│ Editing: OFF    │  │ Editing: OFF    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Site Contexts

Each WordPress installation defines its **site context** which controls:
- Which company roles (profile types) are visible
- Whether profile editing is enabled
- Which URL prefixes are active

### Context Configuration

Set in `wp-config.php`:

```php
// Hub site (myhub21.com)
define( 'FRS_SITE_CONTEXT', 'hub' );

// 21st Century Lending marketing site
define( 'FRS_SITE_CONTEXT', '21stcenturylending' );

// Century 21 Masters marketing site
define( 'FRS_SITE_CONTEXT', 'c21masters' );

// Local development (default if not set)
define( 'FRS_SITE_CONTEXT', 'development' );
```

### Context Reference

| Context | Company Roles Shown | Profile Editing | URL Prefixes |
|---------|---------------------|-----------------|--------------|
| `development` | All 8 roles | Enabled | lo, agent, escrow, pm, staff, leader |
| `hub` | All except partner | Enabled | lo, agent, escrow, pm, staff, leader |
| `21stcenturylending` | loan_originator, leadership | Disabled | lo, leader |
| `c21masters` | broker_associate, sales_associate, leadership | Disabled | agent, leader |

### Configuration Precedence

The site context is determined in this order (highest priority first):

1. **Constant**: `FRS_SITE_CONTEXT` in wp-config.php (locks production sites)
2. **Filter**: `frs_site_context` filter hook
3. **Option**: `frs_site_context` database option
4. **Default**: `development`

---

## WordPress Roles vs Company Roles

The plugin distinguishes between two role systems:

### WordPress Roles (Capabilities)

Determine what users **can do** - their permissions in WordPress.

| WP Role | Label | URL Prefix | Public Profile |
|---------|-------|------------|----------------|
| `loan_officer` | Loan Officer | `/lo/` | Yes |
| `re_agent` | Real Estate Agent | `/agent/` | Yes |
| `escrow_officer` | Escrow Officer | `/escrow/` | Yes |
| `property_manager` | Property Manager | `/pm/` | Yes |
| `dual_license` | Dual License | `/lo/` | Yes |
| `partner` | Partner | None | No |
| `staff` | Staff | `/staff/` | Yes |
| `leadership` | Leadership | `/leader/` | Yes |
| `assistant` | Assistant | `/staff/` | Yes |

### Company Roles (Directory Categorization)

Determine **where users appear** in directories. Stored in `frs_company_role` user meta.

| Company Role | Typical WP Roles | Appears In |
|--------------|------------------|------------|
| `loan_originator` | loan_officer, dual_license | LO Directory |
| `broker_associate` | re_agent, dual_license | Agent Directory |
| `sales_associate` | re_agent | Agent Directory |
| `escrow_officer` | escrow_officer | Escrow Directory |
| `property_manager` | property_manager | PM Directory |
| `partner` | partner | Partner pages only |
| `leadership` | leadership | Leadership pages |
| `staff` | staff, assistant | Staff pages |

---

## Data Synchronization

### Development: WP-CLI Commands

For local development and initial setup, use CLI commands to pull profiles from the hub:

```bash
# Configure hub URL (one time)
wp frs-users setup-sync --hub-url=https://myhub21.com

# Sync all profiles matching this site's context
wp frs-users sync-from-hub

# Sync specific profile type
wp frs-users sync-from-hub --type=loan_originator

# Preview without making changes
wp frs-users sync-from-hub --dry-run

# Limit number of profiles
wp frs-users sync-from-hub --limit=10
```

### Production: Webhook Synchronization

Webhooks automatically sync profile changes in real-time.

#### Setup on Marketing Site (Receiver)

```bash
# Generate a webhook secret
wp frs-users setup-sync --generate-secret

# Note: This displays the webhook URL and secret
```

#### Setup on Hub Site (Sender)

```php
// Add marketing site webhook endpoint
FRSUsers\Core\ProfileSync::add_webhook_endpoint(
    'https://21stcenturylending.com/wp-json/frs-users/v1/webhook/profile-updated'
);

// Set shared secret (must match marketing site)
update_option( 'frs_webhook_secret', 'the-secret-from-marketing-site' );
```

Or via WP-CLI:
```bash
wp option update frs_webhook_secret "the-secret-from-marketing-site"
```

#### Webhook Flow

```
1. Profile saved on hub
       ↓
2. `frs_profile_saved` action fires
       ↓
3. ProfileSync sends POST to all endpoints
       ↓
4. Marketing site receives webhook
       ↓
5. Signature verified (HMAC-SHA256)
       ↓
6. Profile filtered by site context
       ↓
7. User created/updated if role matches
```

#### Webhook Payload

```json
{
  "event": "profile_updated",
  "timestamp": 1704931200,
  "profile": {
    "user_id": 123,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "display_name": "John Smith",
    "job_title": "Loan Officer",
    "phone_number": "555-1234",
    "nmls": "123456",
    "select_person_type": "loan_originator",
    "company_roles": ["loan_originator"],
    "is_active": true,
    "profile_slug": "john-smith",
    "service_areas": ["CA", "AZ", "NV"],
    ...
  }
}
```

#### Security

- **HMAC-SHA256 signatures**: Every webhook includes `X-FRS-Signature` header
- **Timing-safe comparison**: Uses `hash_equals()` to prevent timing attacks
- **Profile filtering**: Only profiles matching site context are processed
- **Soft deletes**: `profile_deleted` event deactivates rather than deletes users

---

## REST API

### Public Endpoints

```
GET /wp-json/frs-users/v1/profiles
    ?type=loan_originator    # Filter by company role
    ?per_page=50             # Pagination
    ?page=1
    ?search=john             # Search name/email/NMLS

GET /wp-json/frs-users/v1/profiles/{id}
GET /wp-json/frs-users/v1/profiles/slug/{slug}
GET /wp-json/frs-users/v1/profiles/user/{user_id|me}
GET /wp-json/frs-users/v1/service-areas
GET /wp-json/frs-users/v1/vcard/{id}
POST /wp-json/frs-users/v1/meeting-request
```

### Protected Endpoints (Authentication Required)

```
POST /wp-json/frs-users/v1/profiles           # Create
PUT /wp-json/frs-users/v1/profiles/{id}       # Update
DELETE /wp-json/frs-users/v1/profiles/{id}    # Delete
POST /wp-json/frs-users/v1/profiles/{id}/create-user
```

**Note:** Write operations are blocked on marketing sites where `profile_editing` is disabled.

### Webhook Endpoint

```
POST /wp-json/frs-users/v1/webhook/profile-updated
    Header: X-FRS-Signature: {hmac-sha256-signature}
    Body: {webhook payload}
```

---

## Data Storage

All profile data is stored in WordPress native tables:

| Table | Purpose |
|-------|---------|
| `wp_users` | Core user data (email, display_name, user_nicename) |
| `wp_usermeta` | FRS fields with `frs_` prefix |

### Key Meta Fields

| Meta Key | Description | Type |
|----------|-------------|------|
| `frs_phone_number` | Primary phone | string |
| `frs_mobile_number` | Mobile phone | string |
| `frs_job_title` | Job title | string |
| `frs_nmls` | NMLS license number | string |
| `frs_dre_license` | DRE license number | string |
| `frs_biography` | Bio text | text |
| `frs_is_active` | Active status | boolean (1/0) |
| `frs_select_person_type` | Primary person type | string |
| `frs_company_role` | Company role(s) | string (multi-value) |
| `frs_service_areas` | Service states | JSON array |
| `frs_profile_slug` | Custom URL slug | string |
| `frs_arrive` | Arrive loan app URL | string |
| `frs_headshot_id` | Avatar attachment ID | int |
| `frs_qr_code_data` | QR code SVG data | text |

---

## WP-CLI Reference

### Site Context Commands

```bash
# View current context and configuration
wp frs-users site-context
```

### Sync Commands

```bash
# Configure sync settings
wp frs-users setup-sync --hub-url=https://myhub21.com
wp frs-users setup-sync --generate-secret
wp frs-users setup-sync --webhook-secret="shared-secret"

# Sync profiles from hub
wp frs-users sync-from-hub
wp frs-users sync-from-hub --type=loan_originator
wp frs-users sync-from-hub --limit=50
wp frs-users sync-from-hub --dry-run
```

### Profile Commands

```bash
wp frs-users list-profiles [--type=<type>] [--format=<format>]
wp frs-users list-guests
wp frs-users create-user <profile_id> [--username=<name>] [--send-email]
wp frs-users generate-slugs
wp frs-users generate-qr-codes [--force] [--id=<user_id>]
wp frs-users generate-vcards [--type=<type>]
```

---

## Deployment Checklist

### New Hub Site

1. Install and activate frs-wp-users plugin
2. Add to wp-config.php: `define( 'FRS_SITE_CONTEXT', 'hub' );`
3. Generate webhook secret: `wp frs-users setup-sync --generate-secret`
4. Import or create user profiles
5. Configure webhook endpoints for each marketing site

### New Marketing Site

1. Install and activate frs-wp-users plugin
2. Add to wp-config.php: `define( 'FRS_SITE_CONTEXT', '21stcenturylending' );`
3. Configure hub URL: `wp frs-users setup-sync --hub-url=https://myhub21.com`
4. Set webhook secret (same as hub): `wp frs-users setup-sync --webhook-secret="..."`
5. Initial sync: `wp frs-users sync-from-hub`
6. Verify profiles appear correctly with proper role filtering

---

## Troubleshooting

### Profiles Not Syncing

1. Check site context: `wp frs-users site-context`
2. Verify hub URL is correct
3. Check webhook secrets match on both sites
4. Review WordPress debug log for errors
5. Ensure profile's company role matches site's active roles

### Wrong Profiles Appearing

1. Check company role filter in site context
2. Verify `frs_company_role` meta is set correctly
3. Check `frs_is_active` status (must be `1`)
4. Run `wp frs-users list-profiles --type=<role>` to debug

### Editing Blocked Unexpectedly

1. Editing only works on `development` and `hub` contexts
2. Verify `FRS_SITE_CONTEXT` constant in wp-config.php
3. Check with: `wp frs-users site-context`

### Webhook Failures

1. Check webhook secret matches: `wp option get frs_webhook_secret`
2. Verify endpoint URL is correct and accessible
3. Check for SSL certificate issues
4. Review response codes in hub's debug log
