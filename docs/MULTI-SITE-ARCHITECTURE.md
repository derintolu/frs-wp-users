# FRS Multi-Site Architecture

This document describes how the FRS User Profiles plugin operates across multiple WordPress installations with synchronized profile data.

## Overview

The FRS ecosystem consists of:

1. **Hub Site** (myhub21.com) - Central source of truth for all profile data
2. **Marketing Sites** (21stcenturylending.com, c21masters.com, etc.) - Read-only consumers

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
│ Context:        │  │ Context:        │  │ Context:        │
│ 21stcentury     │  │ c21masters      │  │ (varies)        │
│ lending         │  │                 │  │                 │
│                 │  │                 │  │                 │
│ Shows:          │  │ Shows:          │  │                 │
│ - LO            │  │ - Broker Assoc  │  │                 │
│ - Leadership    │  │ - Sales Assoc   │  │                 │
│                 │  │ - Leadership    │  │                 │
│ Editing: OFF    │  │ Editing: OFF    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Site Contexts

Each site defines its context via the `FRS_SITE_CONTEXT` constant in `wp-config.php`:

| Context | Company Roles Shown | Profile Editing | Use Case |
|---------|---------------------|-----------------|----------|
| `development` | All 8 roles | Enabled | Local development |
| `hub` | All 8 roles | Enabled | Central hub/intranet |
| `21stcenturylending` | loan_originator, leadership | Disabled | Marketing site |
| `c21masters` | broker_associate, sales_associate, leadership | Disabled | Marketing site |

### Configuration

**In wp-config.php:**

```php
// Hub site
define( 'FRS_SITE_CONTEXT', 'hub' );

// 21st Century Lending marketing site
define( 'FRS_SITE_CONTEXT', '21stcenturylending' );

// Century 21 Masters marketing site
define( 'FRS_SITE_CONTEXT', 'c21masters' );

// Local development (or omit for default)
define( 'FRS_SITE_CONTEXT', 'development' );
```

## Data Synchronization

### Development: CLI Command

Use WP-CLI to manually pull profiles from the hub:

```bash
# Configure hub URL (one time)
wp frs-users setup-sync --hub-url=https://myhub21.com

# Sync all profiles
wp frs-users sync-from-hub

# Sync specific type
wp frs-users sync-from-hub --type=loan_originator

# Preview without making changes
wp frs-users sync-from-hub --dry-run

# Limit number of profiles
wp frs-users sync-from-hub --limit=10
```

### Production: Webhooks

Webhooks automatically sync profile changes in real-time.

#### Setup on Marketing Site (receiver)

```bash
# Generate a webhook secret
wp frs-users setup-sync --generate-secret

# Note the secret and webhook endpoint URL displayed
```

#### Setup on Hub Site (sender)

Add the marketing site's webhook endpoint:

```php
// In theme or plugin, or via WP-CLI
FRSUsers\Core\ProfileSync::add_webhook_endpoint(
    'https://21stcenturylending.com/wp-json/frs-users/v1/webhook/profile-updated'
);
```

Set the shared secret (must match the marketing site):

```bash
wp option update frs_webhook_secret "the-secret-from-marketing-site"
```

#### Webhook Flow

1. Profile is saved on hub
2. Hub fires `frs_profile_saved` action
3. ProfileSync sends POST to all configured endpoints
4. Marketing site receives webhook, verifies signature
5. Local user is created/updated with profile data
6. Only profiles matching the site's active company roles are synced

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
    ...
  }
}
```

## WordPress Roles vs Company Roles

### WordPress Roles (Capabilities)

Determine what users **can do** - their permissions.

| WP Role | Label | URL Prefix | Public |
|---------|-------|------------|--------|
| `loan_officer` | Loan Officer | `/lo/` | Yes |
| `re_agent` | Real Estate Agent | `/agent/` | Yes |
| `escrow_officer` | Escrow Officer | `/escrow/` | Yes |
| `property_manager` | Property Manager | `/pm/` | Yes |
| `dual_license` | Dual License | `/lo/` (default) | Yes |
| `partner` | Partner | None | No |
| `staff` | Staff | `/staff/` | Yes |
| `leadership` | Leadership | `/leader/` | Yes |
| `assistant` | Assistant | `/staff/` | Yes |

### Company Roles (Directory Categorization)

Determine **where users appear** in directories. Stored as `frs_company_role` user meta.

| Company Role | Who Has It | Appears In |
|--------------|-----------|------------|
| `loan_originator` | loan_officer, dual_license, leadership | LO Directory |
| `broker_associate` | re_agent, dual_license | Agent Directory |
| `sales_associate` | re_agent | Agent Directory |
| `escrow_officer` | escrow_officer | Escrow Directory |
| `property_manager` | property_manager | PM Directory |
| `partner` | partner | Partner-specific only |
| `leadership` | leadership | Leadership pages |
| `staff` | staff, assistant | Staff pages |

## WP-CLI Commands

### Site Context

```bash
# View current context and settings
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
wp frs-users sync-from-hub --hub-url=https://myhub21.com
wp frs-users sync-from-hub --type=loan_originator
wp frs-users sync-from-hub --limit=50
wp frs-users sync-from-hub --dry-run
```

### Profile Commands

```bash
# List profiles
wp frs-users list-profiles
wp frs-users list-profiles --type=loan_originator

# Generate assets
wp frs-users generate-qr-codes
wp frs-users generate-vcards
```

## REST API

### Public Endpoints

```
GET /wp-json/frs-users/v1/profiles
    ?type=loan_originator    # Filter by company role
    ?per_page=50             # Pagination
    ?page=1

GET /wp-json/frs-users/v1/profiles/{id}
GET /wp-json/frs-users/v1/profiles/slug/{slug}
GET /wp-json/frs-users/v1/service-areas
GET /wp-json/frs-users/v1/vcard/{id}
```

### Protected Endpoints (require authentication)

```
PUT /wp-json/frs-users/v1/profiles/{id}    # Update profile
POST /wp-json/frs-users/v1/profiles        # Create profile
DELETE /wp-json/frs-users/v1/profiles/{id} # Delete profile
```

**Note:** Write operations are blocked on marketing sites where `profile_editing` is disabled.

### Webhook Endpoint

```
POST /wp-json/frs-users/v1/webhook/profile-updated
    Header: X-FRS-Signature: {hmac-sha256-signature}
    Body: {webhook payload}
```

## Database Schema

All profile data is stored in WordPress native tables:

- `wp_users` - Core user data (email, display_name, etc.)
- `wp_usermeta` - FRS fields with `frs_` prefix

### Key Meta Fields

| Meta Key | Description |
|----------|-------------|
| `frs_phone_number` | Primary phone |
| `frs_mobile_number` | Mobile phone |
| `frs_job_title` | Job title |
| `frs_nmls` | NMLS license number |
| `frs_dre_license` | DRE license number |
| `frs_biography` | Bio text |
| `frs_is_active` | Active status (1/0) |
| `frs_select_person_type` | Primary company role |
| `frs_company_role` | Company role(s) |
| `frs_service_areas` | Service states (JSON array) |
| `frs_profile_slug` | Custom URL slug |
| `frs_arrive` | Arrive loan app URL |

## Deployment Checklist

### New Hub Site

1. Install frs-wp-users plugin
2. Add to wp-config.php: `define( 'FRS_SITE_CONTEXT', 'hub' );`
3. Configure webhook endpoints for marketing sites
4. Generate webhook secret: `wp frs-users setup-sync --generate-secret`
5. Import/create user profiles

### New Marketing Site

1. Install frs-wp-users plugin
2. Add to wp-config.php: `define( 'FRS_SITE_CONTEXT', '21stcenturylending' );` (or appropriate context)
3. Configure hub URL: `wp frs-users setup-sync --hub-url=https://myhub21.com`
4. Set webhook secret (same as hub): `wp frs-users setup-sync --webhook-secret="..."`
5. Initial sync: `wp frs-users sync-from-hub`
6. Verify profiles appear correctly

## Troubleshooting

### Profiles not syncing

1. Check site context: `wp frs-users site-context`
2. Verify hub URL is correct
3. Check webhook secret matches on both sites
4. Look for errors in WordPress debug log

### Wrong profiles appearing

1. Check company role filter in site context
2. Verify `frs_company_role` meta is set correctly on profiles
3. Check `frs_is_active` status

### Editing blocked unexpectedly

1. Check site context - editing only works on `development` and `hub`
2. Verify `FRS_SITE_CONTEXT` constant in wp-config.php
3. Use WP-CLI to check: `wp frs-users site-context`
