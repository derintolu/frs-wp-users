# MyHub21 Project Update - March 2026

A plain-English summary of what's been built, what works, and what's in progress for the FRS team member profile and directory system.

---

## What Is This System?

The **FRS User Profiles** plugin manages all team member profiles (loan officers, real estate agents, staff, leadership) across multiple websites:

- **MyHub21.com** (the "Hub") - Where team members log in and manage their profiles
- **21stCenturyLending.com** - Public-facing loan officer directory
- **C21Masters.com** - Public-facing real estate agent directory
- **Twenty CRM** (data.c21frs.com) - The central database that stores all contact/profile data

---

## What's Working Now

### Profile Management (Hub)

- **Single Sign-On (SSO)**: Team members log in with their Microsoft 365 accounts
- **Profile Editor**: Team members can update their own bio, photo, contact info, social links, etc.
- **Headshot Uploads**: Photos are stored and synced across all sites
- **QR Codes**: Each profile gets a branded QR code that links to their public profile
- **My Profile Page**: Tabbed interface with Profile, Activity, and Settings sections

### Public Directories

- **Loan Officer Directory**: Searchable grid of loan officers on 21stCenturyLending.com
- **Real Estate Agent Directory**: Similar grid on C21Masters.com
- **Service Area Filtering**: Visitors can filter by states/regions the team member serves
- **Profile Pages**: Beautiful individual profile pages with contact info, bio, booking links

### Booking & Contact

- **Appointment Scheduling**: "Book Appointment" buttons link to FluentBooking calendars
- **Contact Forms**: Fallback contact form when no booking calendar is set up
- **Email Routing**: Contact form submissions go directly to the team member's email

### Data Sync

- **Hub to Marketing Sites**: When a profile is updated on the Hub, it automatically syncs to the public websites
- **Avatar/Headshot Sync**: Profile photos sync across all sites
- **FluentCRM Integration**: Profile changes sync to FluentCRM for email marketing
- **Twenty CRM Integration**: Profiles sync to/from the Twenty CRM system

---

## What's In Progress

### Twenty CRM Relationship Fields (Current Work)

We discovered that some of the connections between records in Twenty CRM aren't set up correctly:

**The Problem:**
- Twenty CRM has "join tables" that connect People to other things (like MLS associations, Local Associations, Offices)
- These join tables were created manually but are missing critical connections
- For example: `personMls` (connects a person to their MLS memberships) only has a link TO the MLS, but no link FROM the person
- This means you can't easily see which MLS associations a person belongs to

**What Needs to Be Fixed:**

| Connection | Status | Issue |
|------------|--------|-------|
| Person → Office | Working | Team members correctly linked to their office |
| Person → MLS | Broken | Missing the person link on the join table |
| Person → Local Association | Needs Review | May have similar issues |
| Office → MLS | Needs Review | May have similar issues |

**The Fix:**
These join table objects need to be deleted and recreated properly with:
1. A connection TO the person
2. A connection TO the MLS/Association
3. Proper "hidden" status so they don't clutter the CRM interface

### New Fields Added to Twenty CRM

We added three new fields to store important URLs:

| Field | Purpose | Example |
|-------|---------|---------|
| `arriveUrl` | Loan application link | `https://21stcenturylending.my1003app.com/123456/register` |
| `bookingUrl` | Scheduling/calendar link | `https://myhub21.com/booking/john-smith` |
| `tiktokUrl` | TikTok social profile | `https://tiktok.com/@johnsmith` |

### Sync Improvements Needed

Several fields sync one direction but not the other:

| Field | Hub → CRM | CRM → Hub | Status |
|-------|-----------|-----------|--------|
| Arrive URL | No | No | Needs setup |
| Booking URL | No | No | Needs setup |
| TikTok URL | No | No | Needs setup |
| License Number | Yes | No | Needs inbound |
| Century21 URL | Yes | No | Needs inbound |
| Zillow URL | Yes | No | Needs inbound |
| Realtor URL | Yes | No | Needs inbound |

---

## Recent Improvements (Last 3 Months)

### Directory & Search
- Added "Clear Filters" button to directory
- Fixed search to work with state names (not just abbreviations)
- Directory now filters to only show people with NMLS numbers (for loan officers)
- Alphabetical sorting by first name

### Avatars & Photos
- Unified avatar system - one source of truth for profile photos
- Fixed broken images on cross-domain URLs
- Migrated legacy photos from old systems
- Photos now sync properly to FluentBooking calendars

### Booking Integration
- Added "Book Appointment" button to profiles
- Moved booking button from directory grid to individual profile pages
- Contact form emails now route to the team member's email

### Security & Login
- Synced users can only log in on the Hub (not marketing sites)
- Documented the Azure AD two-app architecture
- Fixed OAuth popup flow for calendar connections

### Admin Tools
- Network-level admin panel for managing sync across sites
- CSV Import/Export with smart field matching
- Bulk image import capability
- QR code generation and display in admin

---

## Technical Architecture

### Multi-Site Setup

```
MyHub21.com (Hub - Site 1)
├── Team members log in here
├── Profiles are edited here
├── Master copy of all data
│
├── 21stCenturyLending.com (Site 2)
│   └── Shows loan officer profiles (read-only)
│
└── C21Masters.com (Site 3)
    └── Shows real estate agent profiles (read-only)
```

### Data Flow

```
Team Member Updates Profile on Hub
         ↓
    Saved to WordPress
         ↓
    ┌────┴────┐
    ↓         ↓
Twenty CRM   Marketing Sites
(via API)    (via webhook)
    ↓
FluentCRM
(for email marketing)
```

### Role Types

**WordPress Roles** (for permissions):
- `loan_officer` - Can access loan officer features
- `re_agent` - Can access real estate features
- `dual_license` - Has both loan and RE access
- `staff`, `leadership`, `assistant`, `partner`

**Company Roles** (for directory placement):
- `loan_originator` - Shows in LO directory
- `broker_associate`, `sales_associate` - Shows in RE directory
- `leadership`, `staff` - Shows in staff sections

---

## What's Protected (Do Not Change)

These settings control login and authentication - changing them breaks the whole system:

1. **Fluent Snippet** (login redirect) - Controls where users go after login
2. **WPO365 Config** - Microsoft 365 SSO settings
3. **Azure AD Apps** - Two apps work together:
   - `hub21` - For user logins and M365 widgets
   - `hub21-app-only` - For background sync jobs

---

## Next Steps

1. **Fix Twenty CRM Relationships**
   - Delete broken join tables
   - Recreate with proper two-way connections
   - Test person → MLS associations work

2. **Complete Field Sync**
   - Add Arrive URL, Booking URL, TikTok to sync
   - Add inbound sync for license/social URLs

3. **Add Timeline Activities**
   - Log WordPress events (profile updates, headshot changes) to Twenty CRM timeline
   - Gives visibility into what's happening across systems

---

## Questions?

This system touches WordPress, Microsoft 365, Twenty CRM, FluentCRM, and FluentBooking. If something breaks or you need changes, check with the dev team first - many pieces are interconnected.

*Last Updated: March 15, 2026*
