# FRS User Profiles

A WordPress plugin for managing professional profiles across multiple sites with synchronized data.

---

## What This Plugin Does

FRS User Profiles manages **loan officer, real estate agent, staff, and leadership profiles** for the FRS family of companies. It provides:

- **Profile Directory** - Searchable directory with filtering by service area
- **Individual Profile Pages** - Public-facing profile pages with contact info, bio, and credentials
- **Multi-Site Sync** - Profiles managed on a central hub, automatically synced to marketing sites
- **QR Codes & vCards** - Generated contact cards for each profile
- **CRM Integration** - Real-time sync with FluentCRM

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    HUB (myhub21.com)                        │
│                                                             │
│   All profiles live here. This is the source of truth.     │
│   Staff edit profiles here.                                 │
│                                                             │
│   Profiles: Loan Officers, Agents, Staff, Leadership        │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    (webhooks sync on save)
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│  21stcenturylending │           │    c21masters.com   │
│        .com         │           │                     │
│                     │           │                     │
│  Shows ONLY:        │           │  Shows ONLY:        │
│  • Loan Officers    │           │  • RE Agents        │
│  • Leadership       │           │  • Sales Associates │
│                     │           │  • Leadership       │
│  (Read-only)        │           │  (Read-only)        │
└─────────────────────┘           └─────────────────────┘
```

### Why This Matters

1. **Single Source of Truth** - Edit profiles in one place, changes appear everywhere
2. **Role-Based Filtering** - Each marketing site only shows relevant profiles
3. **Automatic Sync** - No manual updates needed on marketing sites
4. **Consistent Data** - Contact info, photos, and credentials always match

---

## Profile Types (Roles)

### Who Appears Where

| Role | Hub | 21st Century Lending | C21 Masters |
|------|-----|---------------------|-------------|
| Loan Officers | ✓ | ✓ | - |
| Real Estate Agents | ✓ | - | ✓ |
| Sales Associates | ✓ | - | ✓ |
| Leadership | ✓ | ✓ | ✓ |
| Staff | ✓ | - | - |

### URL Structure

Each role has a URL prefix for profile pages:

| Role | URL Example |
|------|-------------|
| Loan Officer | `/lo/john-smith` |
| Real Estate Agent | `/agent/jane-doe` |
| Leadership | `/leader/bob-jones` |
| Staff | `/staff/mary-williams` |

---

## Profile Data

### What's Stored

Each profile includes:

**Basic Info**
- Name, email, phone numbers
- Job title, biography
- Headshot photo

**Professional Credentials**
- NMLS number (loan officers)
- DRE license (agents)
- Certifications and designations

**Service Areas**
- States they're licensed in
- Used for directory filtering

**Social & Links**
- Facebook, Instagram, LinkedIn, Twitter
- Personal website
- Loan application link (Arrive)

**Generated Assets**
- QR code (links to profile)
- vCard download

---

## How Sync Works

### On the Hub (Editing)

1. Staff member edits a profile
2. Plugin saves changes to database
3. Webhook fires to all marketing sites
4. Each site receives the update

### On Marketing Sites (Receiving)

1. Webhook received with profile data
2. Security signature verified
3. Profile checked against site's allowed roles
4. If role matches, local user created/updated
5. If role doesn't match, webhook ignored

### Manual Sync (Development)

```bash
# Pull all profiles from hub
wp frs-users sync-from-hub

# Preview without changes
wp frs-users sync-from-hub --dry-run

# Sync only loan officers
wp frs-users sync-from-hub --type=loan_originator
```

---

## Configuration

### Setting Up a Site

In `wp-config.php`, define the site context:

```php
// Hub site (where profiles are edited)
define( 'FRS_SITE_CONTEXT', 'hub' );

// 21st Century Lending marketing site
define( 'FRS_SITE_CONTEXT', '21stcenturylending' );

// Century 21 Masters marketing site
define( 'FRS_SITE_CONTEXT', 'c21masters' );
```

### What Each Context Does

| Context | Can Edit Profiles | Roles Shown |
|---------|-------------------|-------------|
| `hub` | Yes | All roles |
| `21stcenturylending` | No | Loan Officers, Leadership |
| `c21masters` | No | Agents, Sales, Leadership |
| `development` | Yes | All roles (for testing) |

---

## Admin Interface

### WordPress Admin

- **FRS Profiles** menu in wp-admin
- List view with filtering by role
- Edit individual profiles
- Site settings (hub URL, webhook config)

### Profile Fields on User Edit

When editing a WordPress user, FRS fields appear:
- Phone numbers
- Job title
- NMLS/license numbers
- Biography
- Service areas
- Social media links

---

## Directory Block

Add a searchable directory to any page using the Gutenberg block:

**Block Name:** `FRS Loan Officer Directory`

**Features:**
- Grid of profile cards
- Search by name
- Filter by service area (state)
- Click card to view full profile
- QR code popup

---

## REST API

For developers integrating with the profile system:

```
GET /wp-json/frs-users/v1/profiles              # List all
GET /wp-json/frs-users/v1/profiles?type=loan_originator  # Filter by role
GET /wp-json/frs-users/v1/profiles/slug/john-smith       # By URL slug
GET /wp-json/frs-users/v1/service-areas         # List states
GET /wp-json/frs-users/v1/vcard/{id}            # Download vCard
```

---

## Common Tasks

### Check Current Site Context

```bash
wp frs-users site-context
```

### List All Profiles

```bash
wp frs-users list-profiles
wp frs-users list-profiles --type=loan_originator
```

### Regenerate QR Codes

```bash
wp frs-users generate-qr-codes
wp frs-users generate-qr-codes --id=123  # Single user
```

### Set Up Webhook Sync

On marketing site:
```bash
wp frs-users setup-sync --hub-url=https://myhub21.com
wp frs-users setup-sync --generate-secret
```

---

## Troubleshooting

### Profiles Not Appearing

1. Check site context: `wp frs-users site-context`
2. Verify profile has correct role assigned
3. Check `frs_is_active` is set to `1`
4. Run sync: `wp frs-users sync-from-hub`

### Webhooks Not Working

1. Verify webhook secret matches on both sites
2. Check hub has marketing site's endpoint configured
3. Review WordPress debug log for errors

### Wrong Roles Showing

1. Check `FRS_SITE_CONTEXT` in wp-config.php
2. Verify profile's `frs_company_role` meta value
3. Marketing sites only show their configured roles

---

## Key Files

| File | Purpose |
|------|---------|
| `includes/Core/Roles.php` | Role definitions and site contexts |
| `includes/Core/ProfileSync.php` | Webhook sync logic |
| `includes/Models/Profile.php` | Profile data model |
| `includes/Routes/Api.php` | REST API endpoints |
| `assets/blocks/loan-officer-directory/` | Directory block |

---

## Support

For technical issues or feature requests, contact the development team.
