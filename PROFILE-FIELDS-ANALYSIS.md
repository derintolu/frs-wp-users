# Profile Fields Analysis & Implementation Plan

## All Profile Fields (45+ fields)

### Contact Information (6 fields)
- `email` - Email address
- `first_name` - First name
- `last_name` - Last name
- `phone_number` - Primary phone
- `mobile_number` - Mobile phone
- `office` - Office location/name

### Professional Details (19 fields)
- `frs_agent_id` - FRS system ID
- `user_id` - WordPress user ID link
- `select_person_type` - loan_officer|realtor_partner|staff|leadership|assistant
- `headshot_id` - Profile photo ID
- `job_title` - Professional title
- `biography` - Professional bio
- `date_of_birth` - Date of birth
- `license_number` - Real estate license
- `dre_license` - California DRE license
- `nmls` - NMLS ID
- `nmls_number` - NMLS license number
- `brand` - Professional brand name
- `specialties` - Real estate agent specialties (JSON array)
- `specialties_lo` - Loan officer specialties (JSON array)
- `nar_designations` - NAR designations (JSON array)
- `namb_certifications` - NAMB certifications (JSON array)
- `awards` - Awards & recognition (Complex JSON)
- `languages` - Languages spoken (JSON array)
- `status` - active|inactive

### Location (2 fields)
- `city_state` - Primary city and state
- `region` - Service region

### Social Media (6 fields)
- `facebook_url` - Facebook profile URL
- `instagram_url` - Instagram profile URL
- `linkedin_url` - LinkedIn profile URL
- `twitter_url` - Twitter/X profile URL
- `youtube_url` - YouTube channel URL
- `tiktok_url` - TikTok profile URL

### Tools & Platforms (6 fields)
- `arrive` - ARRIVE platform URL
- `canva_folder_link` - Canva marketing materials link
- `niche_bio_content` - Multiple niche-specific bios (Complex JSON)
- `personal_branding_images` - Personal branding gallery (Media Gallery)
- `loan_officer_profile` - Related loan officer profile ID
- `loan_officer_user` - Related loan officer user ID

### Metadata (6 fields)
- `is_active` - Active status boolean
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `synced_to_fluentcrm_at` - FluentCRM sync timestamp
- `id` - Profile ID
- `synced_to_fluentcrm_at` - FluentCRM sync

---

## Field Categorization

### 🔒 STAFF EYES ONLY (Internal Management)
**Never show to public or to the agent's customizable profile**

1. `frs_agent_id` - Internal FRS system ID
2. `user_id` - WordPress user link (system field)
3. `date_of_birth` - Privacy concern (DOB)
4. `canva_folder_link` - Internal marketing resource
5. `niche_bio_content` - Staff/admin curated content
6. `personal_branding_images` - Internal asset library
7. `loan_officer_profile` - Internal relationship mapping
8. `loan_officer_user` - Internal relationship mapping
9. `is_active` - System status flag
10. `created_at` - System timestamp
11. `updated_at` - System timestamp
12. `synced_to_fluentcrm_at` - System sync timestamp
13. `status` - Internal status (active/inactive)
14. `id` - System ID

**Total Staff-Only: 14 fields**

---

### 👤 AGENT CAN EDIT & PUBLIC CAN VIEW (Customizable Profile)
**These fields should be on the public profile AND editable by the agent**

#### Basic Info (5 fields)
1. `first_name` ✅ Public
2. `last_name` ✅ Public
3. `email` ✅ Public (contact)
4. `phone_number` ✅ Public (contact)
5. `mobile_number` ✅ Public (contact)

#### Professional (8 fields)
6. `headshot_id` ✅ Public (profile photo)
7. `job_title` ✅ Public
8. `biography` ✅ Public
9. `license_number` ✅ Public (credentials)
10. `dre_license` ✅ Public (credentials)
11. `nmls` ✅ Public (credentials)
12. `nmls_number` ✅ Public (credentials)
13. `brand` ✅ Public
14. `select_person_type` ✅ Public (Loan Officer vs Realtor)

#### Specialties & Credentials (5 fields)
15. `specialties` ✅ Public (real estate specialties)
16. `specialties_lo` ✅ Public (loan officer specialties)
17. `nar_designations` ✅ Public
18. `namb_certifications` ✅ Public
19. `awards` ✅ Public (achievements)

#### Additional (2 fields)
20. `languages` ✅ Public
21. `office` ✅ Public (office location)

#### Location (2 fields)
22. `city_state` ✅ Public
23. `region` ✅ Public

#### Social Media (6 fields)
24. `facebook_url` ✅ Public
25. `instagram_url` ✅ Public
26. `linkedin_url` ✅ Public
27. `twitter_url` ✅ Public
28. `youtube_url` ✅ Public
29. `tiktok_url` ✅ Public

#### Tools (1 field)
30. `arrive` ✅ Public (pre-approval link)

**Total Public/Editable: 30 fields**

---

## Three-Part Implementation Plan

### Part 1: Public Profile Page (Agent Customization + Biolink Integration)

**Goal:** Combine hub21.local/dashboard/#/profile with biolink-page functionality

**Features:**
- Agent can customize which fields to show/hide on their public profile
- Combine profile data with biolink-style action buttons
- QR code generation for profile
- Theme/color customization
- Profile slug: `hub21.local/profile/{username}` or `hub21.local/{username}`

**New Fields Needed:**
```sql
-- Add to profiles table
profile_visibility JSON NULL,  -- Which fields are visible {"phone": true, "email": false, etc}
profile_theme VARCHAR(50) DEFAULT 'default',  -- Theme selection
profile_slug VARCHAR(255) UNIQUE NULL,  -- Custom URL slug
profile_headline TEXT NULL,  -- Short tagline (like Gravatar)
custom_links JSON NULL,  -- Custom links with titles and URLs
```

**Components to Create:**
1. `PublicProfileView.tsx` - Public-facing profile page
2. `ProfileCustomizer.tsx` - Drag-and-drop profile editor
3. `ProfileThemeSelector.tsx` - Theme picker
4. `ProfileLinkManager.tsx` - Manage custom links

**Routes:**
- `/profile/{slug}` - Public view
- `/dashboard/#/profile/customize` - Customization interface
- `/dashboard/#/profile/preview` - Preview before publishing

---

### Part 2: Directory System (Central Management)

**Goal:** Create a centralized directory that pulls from frs-wp-users profiles

**Features:**
- Filterable directory (by location, specialty, type)
- Search functionality
- Card/list view toggle
- Central admin can manage all profiles
- Export/import profiles

**Components:**
1. `ProfileDirectory.tsx` - Main directory page
2. `DirectoryFilters.tsx` - Filter sidebar
3. `DirectorySearch.tsx` - Search component
4. `DirectoryCard.tsx` - Profile card (already have ProfileCard component)

**REST API Endpoints:**
```
GET  /frs-users/v1/directory?type=loan_officer&location=CA&specialty=VA
GET  /frs-users/v1/directory/search?q=John
GET  /frs-users/v1/directory/export
POST /frs-users/v1/directory/import
```

**Routes:**
- `/directory` - Public directory listing
- `/directory/loan-officers` - Filter by type
- `/directory/search` - Search results

---

### Part 3: Cross-Site Profile System (Multisite/Network Support)

**Goal:** Host profiles centrally but display on multiple sites with proper routing

**Architecture Options:**

#### Option A: REST API Federation
- Central site: `hub21.local` (profile source)
- Remote sites: `site1.com`, `site2.com` (profile consumers)
- Remote sites fetch profiles via REST API
- Profile URLs: `site1.com/profile/{slug}` → fetches from hub21.local API

**Implementation:**
```php
// On remote site
class RemoteProfileHandler {
    private $central_api = 'https://hub21.local/wp-json/frs-users/v1';

    public function get_profile($slug) {
        $response = wp_remote_get("{$this->central_api}/profiles/slug/{$slug}");
        return json_decode(wp_remote_retrieve_body($response));
    }
}
```

#### Option B: WordPress Multisite
- Single network with shared profile database
- Profiles accessible across all sites
- Profile URLs: Any site can show any profile

**Implementation:**
```php
// Switch to main site for profile access
switch_to_blog(1); // Main site
$profile = Profile::where('profile_slug', $slug)->first();
restore_current_blog();
```

#### Option C: Profile Replication
- Profiles sync to multiple sites
- Webhook-based updates
- Each site has local profile cache

**Recommended: Option A (REST API Federation)**
- Most flexible
- Works with non-WordPress sites
- Central source of truth
- Easy to debug and maintain

**New Components:**
1. `ProfileAPIClient.php` - REST API client for remote sites
2. `ProfileCache.php` - Cache layer for remote profiles
3. `ProfileWebhooks.php` - Notify remote sites of profile updates

---

## Implementation Priority

### Phase 1 (Week 1): Profile Visibility & Customization
- [ ] Add profile_visibility, profile_theme, profile_slug fields to database
- [ ] Create ProfileCustomizer component
- [ ] Update frontend profile to respect visibility settings
- [ ] Add theme selector

### Phase 2 (Week 2): Public Profile Page
- [ ] Create PublicProfileView component
- [ ] Integrate biolink-style action buttons
- [ ] Add QR code generation
- [ ] Implement custom links management
- [ ] Set up `/profile/{slug}` routing

### Phase 3 (Week 3): Directory System
- [ ] Create directory REST API endpoints
- [ ] Build ProfileDirectory component with filters
- [ ] Add search functionality
- [ ] Implement export/import

### Phase 4 (Week 4): Cross-Site Routing
- [ ] Implement REST API federation
- [ ] Create ProfileAPIClient for remote sites
- [ ] Add profile caching layer
- [ ] Set up webhook notifications
- [ ] Test on multiple sites

---

## Database Migration Needed

```sql
ALTER TABLE wp_frs_profiles
ADD COLUMN profile_visibility JSON NULL COMMENT 'Field visibility settings',
ADD COLUMN profile_theme VARCHAR(50) DEFAULT 'default' COMMENT 'Theme selection',
ADD COLUMN profile_slug VARCHAR(255) NULL COMMENT 'Custom URL slug',
ADD COLUMN profile_headline TEXT NULL COMMENT 'Short tagline',
ADD COLUMN custom_links JSON NULL COMMENT 'Custom links array',
ADD UNIQUE KEY profile_slug (profile_slug);
```

---

## Summary

**Current State:**
- ✅ 45+ profile fields defined
- ✅ Profile editing with tabs
- ✅ Frontend profile view (Gravatar-style)
- ✅ QR code generation
- ✅ Biolink pages in frs-lrg
- ✅ ProfileCard components

**Next Steps:**
1. Categorize fields: 14 staff-only, 30 public/editable
2. Add visibility controls to profiles
3. Create public profile page (combine with biolink)
4. Build directory system
5. Implement cross-site routing via REST API

**Key Decision Points:**
- Profile slug format: `/profile/{slug}` or `/{slug}`?
- Theme system: Pre-built themes or full customization?
- Cross-site method: REST API (recommended) or Multisite?
- Link to biolink pages: Replace or complement?
