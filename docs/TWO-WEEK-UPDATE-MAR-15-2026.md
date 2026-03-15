# Two-Week Update: March 1-15, 2026

A summary of changes made to the MyHub21 profile and directory system over the past two weeks.

---

## Highlights

### Booking & Appointments
- **Book Appointment button** moved from directory grid to individual profile pages (cleaner UX)
- Contact form emails now **route directly to the loan officer's email**
- Scheduling buttons link to FluentBooking calendars with fallback to contact form

### Directory Improvements
- Added **"Clear Filters" button** below Load More for easier navigation
- Directory now **only shows profiles with NMLS numbers** (filters out incomplete profiles)
- Shows "Loan Originator" as title for all LOs, with additional title appended if they have one

### Avatar/Photo System (Major Overhaul)
- **Unified avatar system** - one source of truth for all profile photos
- Fixed broken images on cross-domain URLs
- **FluentBooking avatar sync** - profile photos now appear correctly in booking calendars
- **Legacy avatar migration** - imported old photos from WPO365 and previous plugins
- Fixed multisite avatar resolution (switching to main site for attachments)

### Security
- **Synced users blocked from marketing site login** - team members can only log in on the Hub, not on 21stCenturyLending or C21Masters

### OAuth & Calendar Connections
- Fixed OAuth popup flow for connecting Outlook/Google calendars
- Implemented iframe escape handling for OAuth redirects
- Documented Azure AD two-app architecture

### QR Codes
- Added QR code display and download to profile edit admin page
- Existing QR codes are now preserved (never overwritten on save)
- Node.js generator script with branded styling

### Profile Editor
- Added loading indicators, error handling, and field validation
- Fixed data saving and validation issues
- Added missing fields to REST API

---

## Bug Fixes

| Issue | Fix |
|-------|-----|
| Broken avatar images on cross-site URLs | Stopped rewriting size suffixes on cross-domain URLs |
| FluentBooking showing wrong photos | Fixed multisite table structure for avatar sync |
| Directory search not finding states | Fixed case mismatch in state name lookup |
| Avatar placeholder wrong shape | Fixed border-radius on directory cards and profile pages |
| Company roles not syncing | Fixed to use singular `frs_company_role` meta key |
| Protocol-relative URLs breaking | Fixed URL handling in sync |
| WPO365 silhouette avatars | Skip importing placeholder images |

---

## Technical Changes

### Files Added
- `docs/PROJECT-UPDATE-MARCH-2026.md` - Comprehensive project documentation
- Planning docs for avatar sync and directory fixes
- Node.js QR code generator script

### Files Modified
- `TwentyCRMSync.php` - Sync improvements
- `Avatar.php` - Unified avatar system
- `FluentBookingSync.php` - Calendar photo sync
- Directory block files - Filters, search, grid improvements
- Profile template files - Booking button placement

---

## In Progress

### Twenty CRM Relationship Fields
We discovered broken join tables in Twenty CRM:
- `personMls` is missing the link back to `person`
- Need to rebuild these as proper hidden junction tables

### New Twenty CRM Fields Created
- `arriveUrl` - Loan application links
- `bookingUrl` - Scheduling links  
- `tiktokUrl` - TikTok social profiles

### Sync Improvements Needed
Several fields need bidirectional sync added (currently one-way or not syncing).

---

## Commits This Period
**68 commits** over the past two weeks

---

*Generated: March 15, 2026*
