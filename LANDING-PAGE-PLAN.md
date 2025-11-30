# Landing Page Generation & User Content Management Plan

**Date:** 2025-01-28
**Project:** FRS User Profiles + Vikinger Theme Integration
**Goal:** Push-button landing page generation and frontend content management

---

## 1. Executive Summary

### What We're Building
A complete self-service system where loan officers can:
1. **Generate landing pages** with 1 click (co-branded, personal, partnership pages)
2. **Manage content** from frontend (no WordPress admin access needed)
3. **Customize appearance** (colors, layout, widgets) in real-time
4. **Preview & publish** instantly

### Core Philosophy
- **Zero WordPress Admin** - Everything from BuddyPress frontend
- **Push-Button Creation** - One click to generate complete pages
- **Template-Based** - Pre-designed layouts, user fills content
- **Real-time Preview** - See changes as you make them
- **Data-Driven** - Pull from FRS profile database automatically

---

## 2. Page Types & Use Cases

### 2.1 Personal Landing Pages

**Purpose:** Loan officer's professional website
**URL Structure:** `hub21.local/{username}/landing`
**Auto-Generated Content:**
- Hero section with profile photo, name, NMLS#
- About section from bio
- Service areas with state icons
- Testimonials section (manual entry)
- Contact form
- Apply Now CTA with arrive.com link

**Customization Options:**
- Choose template (Modern, Classic, Bold)
- Color scheme (primary/secondary colors)
- Toggle sections on/off
- Reorder sections (drag & drop)
- Add custom content blocks

**Data Sources:**
```php
wp_frs_profiles:
- profile_photo, cover_photo
- first_name, last_name, professional_title
- bio, tagline
- nmls_id, state_licenses
- service_areas
- phone, email, arrive
- specialties_lo
```

### 2.2 Co-Branded Partnership Pages

**Purpose:** Realtor + Loan Officer joint marketing page
**URL Structure:** `hub21.local/partnerships/{partnership-slug}`
**Auto-Generated Content:**
- Dual hero (both headshots side-by-side)
- Combined bio ("Meet Your Dream Team")
- Service overlap areas (where both serve)
- Split CTA (Contact Realtor | Get Pre-Approved)
- Combined testimonials

**Customization Options:**
- Choose who appears first
- Edit partnership tagline
- Add partnership logo/brand
- Custom color scheme for partnership
- Add joint content blocks

**Data Sources:**
```php
wp_frs_partnerships:
- loan_officer_id, realtor_id
- partnership_name, partnership_bio
- combined_service_areas
- partnership_logo

wp_frs_profiles (both profiles):
- All personal data merged
```

### 2.3 Team/Company Landing Pages

**Purpose:** Brokerage or team showcase
**URL Structure:** `hub21.local/teams/{team-slug}`
**Auto-Generated Content:**
- Company branding header
- Team roster (all members with photos)
- Company stats (total loans, years experience)
- Service coverage map
- Team testimonials
- Multi-CTA (one per team member)

**Customization Options:**
- Upload company logo
- Set team colors
- Choose member display (grid/list)
- Feature certain members
- Add company content

**Data Sources:**
```php
wp_frs_teams (new table):
- team_name, team_slug
- team_logo, team_bio
- team_lead_id
- team_color_primary, team_color_secondary

wp_frs_team_members (new table):
- team_id, profile_id
- role, is_featured
- join_date
```

### 2.4 Campaign Landing Pages

**Purpose:** Event/promotion-specific pages
**URL Structure:** `hub21.local/campaigns/{campaign-slug}`
**Examples:**
- "First-Time Homebuyer Workshop"
- "Summer Refinance Special"
- "New Construction Lending Program"

**Auto-Generated Content:**
- Campaign hero with event/promo details
- Host profile(s)
- Event details (date, time, location)
- Registration/RSVP form
- Related resources

**Customization Options:**
- Set campaign dates
- Choose template style
- Add event images
- Configure form fields
- Set thank-you message

**Data Sources:**
```php
wp_frs_campaigns (new table):
- campaign_name, campaign_slug
- campaign_type (event, promotion, program)
- host_profile_id (can be multiple)
- start_date, end_date
- description, terms
- registration_fields (JSON)
- campaign_image, campaign_logo
```

---

## 3. Technical Architecture

### 3.1 Database Schema Changes

**New Tables:**

```sql
-- Landing pages registry
CREATE TABLE wp_frs_landing_pages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id BIGINT UNSIGNED NOT NULL,
  page_type ENUM('personal', 'partnership', 'team', 'campaign') NOT NULL,
  page_slug VARCHAR(255) UNIQUE NOT NULL,
  page_title VARCHAR(255) NOT NULL,
  template VARCHAR(50) DEFAULT 'modern',
  settings JSON, -- colors, layout options, enabled sections
  content_blocks JSON, -- custom content added by user
  is_published BOOLEAN DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  INDEX idx_profile (profile_id),
  INDEX idx_type (page_type),
  INDEX idx_slug (page_slug)
);

-- Teams
CREATE TABLE wp_frs_teams (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  team_slug VARCHAR(255) UNIQUE NOT NULL,
  team_bio TEXT,
  team_logo VARCHAR(255),
  team_lead_id BIGINT UNSIGNED,
  color_primary VARCHAR(7) DEFAULT '#2563eb',
  color_secondary VARCHAR(7) DEFAULT '#2dd4da',
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (team_slug),
  FOREIGN KEY (team_lead_id) REFERENCES wp_frs_profiles(id) ON DELETE SET NULL
);

CREATE TABLE wp_frs_team_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id BIGINT UNSIGNED NOT NULL,
  profile_id BIGINT UNSIGNED NOT NULL,
  role VARCHAR(100) DEFAULT 'member',
  is_featured BOOLEAN DEFAULT 0,
  display_order INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_team_member (team_id, profile_id),
  FOREIGN KEY (team_id) REFERENCES wp_frs_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES wp_frs_profiles(id) ON DELETE CASCADE
);

-- Campaigns
CREATE TABLE wp_frs_campaigns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_slug VARCHAR(255) UNIQUE NOT NULL,
  campaign_type ENUM('event', 'promotion', 'program') NOT NULL,
  description TEXT,
  campaign_image VARCHAR(255),
  start_date DATETIME,
  end_date DATETIME,
  registration_fields JSON,
  settings JSON,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (campaign_slug),
  INDEX idx_type (campaign_type),
  INDEX idx_dates (start_date, end_date),
  FOREIGN KEY (created_by) REFERENCES wp_frs_profiles(id) ON DELETE RESTRICT
);

CREATE TABLE wp_frs_campaign_hosts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  profile_id BIGINT UNSIGNED NOT NULL,
  role VARCHAR(100) DEFAULT 'host',
  UNIQUE KEY unique_campaign_host (campaign_id, profile_id),
  FOREIGN KEY (campaign_id) REFERENCES wp_frs_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES wp_frs_profiles(id) ON DELETE CASCADE
);

-- Page views analytics
CREATE TABLE wp_frs_landing_page_views (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  landing_page_id BIGINT UNSIGNED NOT NULL,
  visitor_ip VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_page (landing_page_id),
  INDEX idx_date (viewed_at),
  FOREIGN KEY (landing_page_id) REFERENCES wp_frs_landing_pages(id) ON DELETE CASCADE
);

-- Page form submissions
CREATE TABLE wp_frs_landing_page_leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  landing_page_id BIGINT UNSIGNED NOT NULL,
  lead_name VARCHAR(255),
  lead_email VARCHAR(255),
  lead_phone VARCHAR(50),
  lead_message TEXT,
  form_data JSON, -- all form fields
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_contacted BOOLEAN DEFAULT 0,
  INDEX idx_page (landing_page_id),
  INDEX idx_email (lead_email),
  INDEX idx_date (submitted_at),
  FOREIGN KEY (landing_page_id) REFERENCES wp_frs_landing_pages(id) ON DELETE CASCADE
);
```

### 3.2 Eloquent Models

**Location:** `includes/Models/`

```php
// LandingPage.php
namespace FRSUsers\Models;

class LandingPage extends Model {
    protected $table = 'frs_landing_pages';
    protected $fillable = [
        'profile_id', 'page_type', 'page_slug', 'page_title',
        'template', 'settings', 'content_blocks', 'is_published',
        'seo_title', 'seo_description', 'published_at'
    ];

    protected $casts = [
        'settings' => 'array',
        'content_blocks' => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime'
    ];

    public function profile() {
        return $this->belongsTo(Profile::class);
    }

    public function views() {
        return $this->hasMany(LandingPageView::class);
    }

    public function leads() {
        return $this->hasMany(LandingPageLead::class);
    }

    // Scopes
    public function scopePublished($query) {
        return $query->where('is_published', true);
    }

    public function scopeByType($query, $type) {
        return $query->where('page_type', $type);
    }
}

// Team.php
class Team extends Model {
    protected $table = 'frs_teams';
    protected $fillable = [
        'team_name', 'team_slug', 'team_bio', 'team_logo',
        'team_lead_id', 'color_primary', 'color_secondary', 'settings'
    ];

    protected $casts = ['settings' => 'array'];

    public function lead() {
        return $this->belongsTo(Profile::class, 'team_lead_id');
    }

    public function members() {
        return $this->belongsToMany(Profile::class, 'frs_team_members', 'team_id', 'profile_id')
                    ->withPivot('role', 'is_featured', 'display_order', 'joined_at');
    }
}

// Campaign.php
class Campaign extends Model {
    protected $table = 'frs_campaigns';
    protected $fillable = [
        'campaign_name', 'campaign_slug', 'campaign_type',
        'description', 'campaign_image', 'start_date', 'end_date',
        'registration_fields', 'settings', 'created_by'
    ];

    protected $casts = [
        'registration_fields' => 'array',
        'settings' => 'array',
        'start_date' => 'datetime',
        'end_date' => 'datetime'
    ];

    public function hosts() {
        return $this->belongsToMany(Profile::class, 'frs_campaign_hosts', 'campaign_id', 'profile_id')
                    ->withPivot('role');
    }

    public function creator() {
        return $this->belongsTo(Profile::class, 'created_by');
    }
}
```

### 3.3 REST API Endpoints

**Location:** `includes/Routes/Api.php`

```php
// Landing Pages
GET    /frs-users/v1/landing-pages                    // List user's pages
POST   /frs-users/v1/landing-pages                    // Create new page
GET    /frs-users/v1/landing-pages/{id}               // Get page details
PUT    /frs-users/v1/landing-pages/{id}               // Update page
DELETE /frs-users/v1/landing-pages/{id}               // Delete page
POST   /frs-users/v1/landing-pages/{id}/publish       // Publish/unpublish
GET    /frs-users/v1/landing-pages/{id}/preview       // Preview data
GET    /frs-users/v1/landing-pages/{id}/analytics     // View stats
GET    /frs-users/v1/landing-pages/slug/{slug}        // Public: Get by slug

// Templates
GET    /frs-users/v1/landing-pages/templates          // List available templates
GET    /frs-users/v1/landing-pages/templates/{type}   // Templates by type

// Teams
GET    /frs-users/v1/teams                            // List teams
POST   /frs-users/v1/teams                            // Create team
GET    /frs-users/v1/teams/{id}                       // Get team
PUT    /frs-users/v1/teams/{id}                       // Update team
DELETE /frs-users/v1/teams/{id}                       // Delete team
POST   /frs-users/v1/teams/{id}/members               // Add member
DELETE /frs-users/v1/teams/{id}/members/{profileId}   // Remove member

// Campaigns
GET    /frs-users/v1/campaigns                        // List campaigns
POST   /frs-users/v1/campaigns                        // Create campaign
GET    /frs-users/v1/campaigns/{id}                   // Get campaign
PUT    /frs-users/v1/campaigns/{id}                   // Update campaign
DELETE /frs-users/v1/campaigns/{id}                   // Delete campaign
POST   /frs-users/v1/campaigns/{id}/hosts             // Add host
POST   /frs-users/v1/campaigns/{id}/register          // Public: Register for event

// Form Submissions
POST   /frs-users/v1/landing-pages/{id}/submit        // Public: Submit contact form
GET    /frs-users/v1/landing-pages/{id}/leads         // Get leads for page
```

---

## 4. Frontend Architecture

### 4.1 BuddyPress Integration Points

**New BuddyPress Component:** `Landing Pages`

Add to BuddyPress navigation:
```
/me/landing-pages/        → Manage all landing pages
/me/landing-pages/new     → Create new page wizard
/me/landing-pages/{id}/edit → Edit existing page
/me/teams/                → Manage teams
/me/campaigns/            → Manage campaigns
```

**Menu Structure in BuddyPress:**
```
My Profile
├── Activity
├── Profile
├── Settings
├── 📄 Landing Pages        ← NEW
│   ├── My Pages
│   ├── Create New
│   ├── Analytics
│   └── Settings
├── 👥 Teams                ← NEW
│   ├── My Teams
│   └── Create Team
└── 📅 Campaigns            ← NEW
    ├── My Campaigns
    └── Create Campaign
```

### 4.2 React App Structure

**New Vite App:** `src/frontend/landing-pages/`

```
src/frontend/landing-pages/
├── main.tsx                     # Entry point
├── routes.tsx                   # React Router
├── contexts/
│   ├── LandingPageContext.tsx   # Current page state
│   └── TemplateContext.tsx      # Available templates
├── pages/
│   ├── LandingPagesList.tsx     # Dashboard
│   ├── CreatePageWizard.tsx     # Step-by-step creation
│   ├── PageEditor.tsx           # Visual editor
│   ├── PageAnalytics.tsx        # Stats dashboard
│   ├── TeamManager.tsx          # Team management
│   └── CampaignManager.tsx      # Campaign management
├── components/
│   ├── wizard/
│   │   ├── StepSelectType.tsx   # Choose page type
│   │   ├── StepSelectTemplate.tsx # Choose template
│   │   ├── StepCustomize.tsx    # Customize settings
│   │   └── StepReview.tsx       # Preview & publish
│   ├── editor/
│   │   ├── EditorSidebar.tsx    # Settings panel
│   │   ├── EditorPreview.tsx    # Live preview
│   │   ├── SectionEditor.tsx    # Edit individual sections
│   │   ├── ColorPicker.tsx      # Brand colors
│   │   └── ContentBlockEditor.tsx # Rich content blocks
│   ├── templates/
│   │   ├── personal/
│   │   │   ├── ModernTemplate.tsx
│   │   │   ├── ClassicTemplate.tsx
│   │   │   └── BoldTemplate.tsx
│   │   ├── partnership/
│   │   │   ├── DualHeroTemplate.tsx
│   │   │   └── UnifiedTemplate.tsx
│   │   ├── team/
│   │   │   └── RosterTemplate.tsx
│   │   └── campaign/
│   │       └── EventTemplate.tsx
│   └── analytics/
│       ├── ViewsChart.tsx       # Page views over time
│       ├── LeadsTable.tsx       # Contact form submissions
│       └── StatsCards.tsx       # Quick stats
└── api/
    ├── landingPages.ts          # API calls for pages
    ├── teams.ts                 # API calls for teams
    └── campaigns.ts             # API calls for campaigns
```

### 4.3 Page Builder UI Flow

**Step 1: Type Selection**
```tsx
// User sees 4 cards with icons
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Personal   │  │ Partnership │  │    Team     │  │  Campaign   │
│   Landing   │  │    Page     │  │    Page     │  │    Page     │
│             │  │             │  │             │  │             │
│   [Icon]    │  │   [Icon]    │  │   [Icon]    │  │   [Icon]    │
│             │  │             │  │             │  │             │
│  [Select]   │  │  [Select]   │  │  [Select]   │  │  [Select]   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Step 2: Template Selection**
```tsx
// Show template previews based on type chosen
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Modern          │  │  Classic         │  │  Bold            │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │ [Preview]  │  │  │  │ [Preview]  │  │  │  │ [Preview]  │  │
│  │            │  │  │  │            │  │  │  │            │  │
│  │            │  │  │  │            │  │  │  │            │  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
│  Clean & Simple  │  │  Professional    │  │  High Impact     │
│  [Use Template]  │  │  [Use Template]  │  │  [Use Template]  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Step 3: Customize**
```tsx
// Split screen: Settings sidebar + Live preview
┌──────────────┬───────────────────────────────────────┐
│   Settings   │          Live Preview                 │
├──────────────┤                                       │
│ Page Title   │    ┌─────────────────────────────┐   │
│ [Input]      │    │ [Hero with photo]           │   │
│              │    │ John Doe                    │   │
│ Colors       │    │ Senior Loan Officer         │   │
│ Primary:     │    │ NMLS# 123456               │   │
│ [#2563eb]    │    └─────────────────────────────┘   │
│              │    ┌─────────────────────────────┐   │
│ Sections     │    │ [About Section]             │   │
│ ☑ Hero       │    │ Bio text here...            │   │
│ ☑ About      │    └─────────────────────────────┘   │
│ ☑ Services   │                                       │
│ ☐ Testimonials│                                      │
│              │                                       │
│ [Back] [Next]│                                       │
└──────────────┴───────────────────────────────────────┘
```

**Step 4: Review & Publish**
```tsx
┌─────────────────────────────────────────────────────┐
│ Review Your Landing Page                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Page URL: hub21.local/johndoe/landing              │
│                                                     │
│ SEO Settings:                                       │
│ Title: [John Doe - Mortgage Loan Officer]          │
│ Description: [Auto-generated from bio...]          │
│                                                     │
│ Publishing Options:                                 │
│ ○ Save as Draft                                     │
│ ● Publish Immediately                               │
│                                                     │
│ [← Back to Edit]  [Publish Page →]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 5. Page Editor Features

### 5.1 Visual Editor Components

**Sidebar Controls:**
```tsx
<EditorSidebar>
  <Tabs>
    <Tab value="content">
      - Edit Hero Section
      - Edit About Section
      - Edit Services Section
      - Edit Contact Form
      - Add Custom Block
    </Tab>
    <Tab value="design">
      - Brand Colors
      - Fonts
      - Spacing
      - Border Radius
      - Shadows
    </Tab>
    <Tab value="seo">
      - Page Title
      - Meta Description
      - Social Share Image
      - Custom URL Slug
    </Tab>
    <Tab value="settings">
      - Enable/Disable Sections
      - Section Order
      - Form Settings
      - Analytics Tracking
    </Tab>
  </Tabs>
</EditorSidebar>
```

**Content Blocks:**
```tsx
// Draggable, reorderable content sections
const availableBlocks = [
  'hero',           // Hero banner with CTA
  'about',          // Bio/About section
  'services',       // Services/Specialties grid
  'testimonials',   // Customer reviews
  'stats',          // Numbers/achievements
  'contact_form',   // Lead capture form
  'faq',            // Accordion FAQ
  'cta_banner',     // Call-to-action banner
  'gallery',        // Image gallery
  'video',          // Embedded video
  'map',            // Service area map
  'custom_html',    // Custom content
];
```

### 5.2 Real-time Preview

**Preview Modes:**
- Desktop (1920px)
- Tablet (768px)
- Mobile (375px)

**Live Updates:**
```tsx
// Changes reflect immediately in preview
- Color changes → CSS variables update
- Content edits → Text updates
- Section toggle → Show/hide animation
- Reorder → Smooth transition
```

### 5.3 Auto-Save & Version History

```tsx
// Auto-save every 30 seconds
useAutoSave(pageData, {
  interval: 30000,
  onSave: async (data) => {
    await api.landingPages.update(pageId, data);
  }
});

// Version history
interface PageVersion {
  id: number;
  page_id: number;
  version_number: number;
  content: PageContent;
  created_at: string;
  created_by: string;
}

// Restore previous version
<VersionHistory
  versions={versions}
  onRestore={(version) => restorePage(version)}
/>
```

---

## 6. Templates Library

### 6.1 Personal Landing Page Templates

**Template: Modern**
```
[Full-width hero with gradient overlay]
├── Profile photo (circular, centered)
├── Name + Title
├── NMLS# badge
└── Dual CTA buttons

[About Section - 2 Column]
├── Left: Headshot + bio
└── Right: Key stats (loans, experience, ratings)

[Services Grid - 3 Column]
├── Purchase Loans
├── Refinancing
└── VA/FHA Loans

[Service Areas Map]
└── Interactive state map with licenses

[Contact Form]
└── Name, Email, Phone, Message

[Footer]
└── Social links, contact info
```

**Template: Classic**
```
[Hero - Left/Right Split]
├── Left: Professional headshot
└── Right: Name, title, bio, CTA

[Specialties Section]
└── Icon cards with specialties

[Testimonials Carousel]
└── Rotating customer reviews

[Process Steps]
└── 4-step loan process

[Contact Section]
└── Form + direct contact info
```

**Template: Bold**
```
[Full-screen video hero]
└── Overlay: Name, tagline, CTA

[Stats Banner]
└── Animated numbers (loans closed, $ volume, etc.)

[About - Centered]
└── Centered bio with photo

[CTA Section]
└── Large "Get Pre-Approved" button

[Minimal Footer]
```

### 6.2 Partnership Page Templates

**Template: Dual Hero**
```
[Split Hero - 50/50]
├── Left: Loan Officer (blue gradient)
└── Right: Realtor (purple gradient)

[Partnership Story]
└── "Why We Work Together" section

[Combined Stats]
└── Merged achievements

[Dual CTA]
├── Get Pre-Approved (LO)
└── View Homes (Realtor)
```

### 6.3 Team Page Templates

**Template: Roster Grid**
```
[Company Header]
├── Logo
├── Team name
└── Company bio

[Team Members Grid]
├── Member 1 (featured, larger)
├── Member 2 (featured, larger)
├── Member 3 (regular)
└── ... more members

[Company Stats]
└── Total loans, combined experience, etc.

[Multi-CTA]
└── "Contact Team" with member selector
```

### 6.4 Campaign Page Templates

**Template: Event Landing**
```
[Event Hero]
├── Event title
├── Date, time, location
├── Event image/graphic
└── Register CTA

[Event Details]
└── Description, agenda

[Host Profiles]
└── Grid of hosting loan officers

[Registration Form]
└── Name, email, phone, questions

[Thank You Message]
└── Shown after registration
```

---

## 7. Push-Button Creation Workflows

### 7.1 One-Click Personal Landing Page

**User Action:** Click "Create Personal Page" button
**System Actions:**
1. Create `wp_frs_landing_pages` record with default template
2. Pull all data from `wp_frs_profiles` for logged-in user
3. Generate slug: `{username}/landing`
4. Auto-populate all sections with profile data
5. Set default colors from profile settings
6. Publish immediately (or save as draft)
7. Redirect to page URL

**Code Flow:**
```php
// API Endpoint: POST /frs-users/v1/landing-pages/quick-create
public function quick_create_personal_page($request) {
    $current_user_id = get_current_user_id();
    $profile = Profile::get_by_user_id($current_user_id);

    // Create page with auto-populated data
    $landing_page = LandingPage::create([
        'profile_id' => $profile->id,
        'page_type' => 'personal',
        'page_slug' => $profile->profile_slug . '/landing',
        'page_title' => $profile->first_name . ' ' . $profile->last_name . ' - Loan Officer',
        'template' => 'modern',
        'settings' => [
            'color_primary' => '#2563eb',
            'color_secondary' => '#2dd4da',
            'enabled_sections' => ['hero', 'about', 'services', 'contact'],
        ],
        'content_blocks' => $this->generate_default_blocks($profile),
        'is_published' => true,
        'published_at' => now(),
    ]);

    return rest_ensure_response($landing_page);
}

private function generate_default_blocks($profile) {
    return [
        [
            'type' => 'hero',
            'data' => [
                'image' => $profile->cover_photo,
                'title' => $profile->first_name . ' ' . $profile->last_name,
                'subtitle' => $profile->professional_title,
                'cta_text' => 'Get Pre-Approved',
                'cta_url' => $profile->arrive,
            ]
        ],
        [
            'type' => 'about',
            'data' => [
                'photo' => $profile->profile_photo,
                'bio' => $profile->bio,
                'nmls' => $profile->nmls_id,
            ]
        ],
        [
            'type' => 'services',
            'data' => [
                'items' => $profile->specialties_lo,
            ]
        ],
        [
            'type' => 'contact_form',
            'data' => [
                'email' => $profile->email,
                'phone' => $profile->phone_number,
            ]
        ],
    ];
}
```

### 7.2 One-Click Partnership Page

**Pre-requisites:** Partnership must exist in `wp_frs_partnerships`

**User Action:** From partnership detail page, click "Create Landing Page"
**System Actions:**
1. Fetch both partner profiles
2. Create landing page with partnership template
3. Generate slug: `partnerships/{lo-slug}-{realtor-slug}`
4. Merge data from both profiles
5. Auto-populate partnership info
6. Publish

**Code Flow:**
```php
public function quick_create_partnership_page($request) {
    $partnership_id = $request->get_param('partnership_id');
    $partnership = Partnership::with(['loanOfficer', 'realtor'])->find($partnership_id);

    $landing_page = LandingPage::create([
        'profile_id' => $partnership->loan_officer_id,
        'page_type' => 'partnership',
        'page_slug' => 'partnerships/' . $partnership->loan_officer->profile_slug . '-' . $partnership->realtor->profile_slug,
        'page_title' => $partnership->partnership_name ?: 'Your Dream Team',
        'template' => 'dual_hero',
        'settings' => [
            'partnership_id' => $partnership->id,
            'display_order' => 'lo_first', // or 'realtor_first'
        ],
        'content_blocks' => $this->generate_partnership_blocks($partnership),
        'is_published' => true,
    ]);

    return rest_ensure_response($landing_page);
}
```

### 7.3 One-Click Team Page

**Pre-requisites:** User must create team first (or be invited to one)

**User Action:** From team page, click "Create Team Landing Page"
**System Actions:**
1. Fetch team and all member profiles
2. Create landing page with team template
3. Auto-populate with team data
4. Generate team stats (total loans, combined experience)
5. Publish

### 7.4 One-Click Campaign Page

**Wizard Flow:**
1. **Campaign Type:** Event | Promotion | Program
2. **Basic Info:** Name, dates, description
3. **Template:** Choose layout
4. **Registration:** Configure form fields
5. **Create:** Auto-publish

---

## 8. Vikinger Theme Integration

### 8.1 Where to Add Landing Pages in Vikinger

**Option A: New BuddyPress Component**
```php
// Add to functions.php
add_action('bp_setup_components', function() {
    buddypress()->landing_pages = new BP_Landing_Pages_Component();
});

class BP_Landing_Pages_Component extends BP_Component {
    public function __construct() {
        parent::start(
            'landing_pages',
            __('Landing Pages', 'frs-users'),
            VIKINGER_PATH
        );
    }

    public function setup_nav($main_nav = array(), $sub_nav = array()) {
        $main_nav = array(
            'name' => __('Landing Pages', 'frs-users'),
            'slug' => 'landing-pages',
            'position' => 80,
            'screen_function' => 'frs_landing_pages_screen',
            'default_subnav_slug' => 'my-pages'
        );

        parent::setup_nav($main_nav, $sub_nav);
    }
}
```

**Option B: Extend Profile Settings**
```php
// Add as submenu under Settings
add_action('bp_setup_nav', function() {
    bp_core_new_subnav_item(array(
        'name' => 'Landing Pages',
        'slug' => 'landing-pages',
        'parent_url' => bp_loggedin_user_domain() . 'settings/',
        'parent_slug' => 'settings',
        'screen_function' => 'frs_landing_pages_screen',
        'position' => 100,
    ));
});
```

### 8.2 Custom BuddyPress Template

**File:** `buddypress/members/single/landing-pages.php`
```php
<?php
/**
 * BuddyPress - Member Landing Pages
 */

$member = get_query_var('member');
$current_user = wp_get_current_user();
$is_own_profile = $member['id'] === $current_user->ID;
?>

<div class="content-grid">
  <!-- GRID -->
  <div class="grid grid-12 centered">
    <div class="grid-column">
      <?php if ($is_own_profile) : ?>
        <!-- React App Container -->
        <div id="frs-landing-pages-manager"
             data-user-id="<?php echo esc_attr($member['id']); ?>"
             data-profile-id="<?php echo esc_attr($member['profile_id']); ?>">
        </div>
      <?php else : ?>
        <p class="no-results-text">You can only manage your own landing pages.</p>
      <?php endif; ?>
    </div>
  </div>
</div>
```

### 8.3 Widget for Landing Page Links

**Add to Vikinger sidebar widgets:**

**File:** `template-part/widget/widget-landing-pages.php`
```php
<?php
/**
 * Widget: My Landing Pages
 */

$landing_pages = FRSUsers\Models\LandingPage::where('profile_id', $args['profile_id'])
    ->where('is_published', true)
    ->get();
?>

<div class="widget-box">
  <p class="widget-box-title">My Landing Pages</p>
  <div class="widget-box-content">
    <?php if (count($landing_pages) > 0) : ?>
      <div class="information-line-list">
        <?php foreach ($landing_pages as $page) : ?>
          <div class="information-line">
            <p class="information-line-title"><?php echo esc_html($page->page_title); ?></p>
            <a href="<?php echo home_url('/' . $page->page_slug); ?>" class="button small">View</a>
          </div>
        <?php endforeach; ?>
      </div>

      <a href="<?php echo bp_members_get_user_url($args['profile_id']) . 'landing-pages'; ?>"
         class="button secondary">
        Manage All Pages
      </a>
    <?php else : ?>
      <p class="no-results-text">No landing pages created yet</p>
      <a href="<?php echo bp_members_get_user_url($args['profile_id']) . 'landing-pages/new'; ?>"
         class="button primary">
        Create Your First Page
      </a>
    <?php endif; ?>
  </div>
</div>
```

**Add to profile sidebar:**
```php
// In buddypress/members/single/activity.php
get_template_part('template-part/widget/widget-landing-pages', null, [
    'profile_id' => $member['profile_id']
]);
```

---

## 9. Public Landing Page Routing

### 9.1 Custom Rewrite Rules

**Add to plugin activation:**
```php
// includes/Core/Activation.php
public static function add_landing_page_rewrites() {
    // Personal pages: /{username}/landing
    add_rewrite_rule(
        '^([^/]+)/landing/?$',
        'index.php?frs_landing_page=$matches[1]/landing',
        'top'
    );

    // Partnership pages: /partnerships/{slug}
    add_rewrite_rule(
        '^partnerships/([^/]+)/?$',
        'index.php?frs_landing_page=partnerships/$matches[1]',
        'top'
    );

    // Team pages: /teams/{slug}
    add_rewrite_rule(
        '^teams/([^/]+)/?$',
        'index.php?frs_landing_page=teams/$matches[1]',
        'top'
    );

    // Campaign pages: /campaigns/{slug}
    add_rewrite_rule(
        '^campaigns/([^/]+)/?$',
        'index.php?frs_landing_page=campaigns/$matches[1]',
        'top'
    );

    flush_rewrite_rules();
}

add_action('init', [Activation::class, 'add_landing_page_rewrites']);

// Register query var
add_filter('query_vars', function($vars) {
    $vars[] = 'frs_landing_page';
    return $vars;
});
```

### 9.2 Template Loader

**Intercept template loading:**
```php
// includes/Core/TemplateLoader.php
add_filter('template_include', function($template) {
    $landing_page_slug = get_query_var('frs_landing_page');

    if ($landing_page_slug) {
        $landing_page = LandingPage::where('page_slug', $landing_page_slug)
            ->where('is_published', true)
            ->first();

        if ($landing_page) {
            // Track view
            LandingPageView::create([
                'landing_page_id' => $landing_page->id,
                'visitor_ip' => $_SERVER['REMOTE_ADDR'],
                'user_agent' => $_SERVER['HTTP_USER_AGENT'],
                'referrer' => $_SERVER['HTTP_REFERER'] ?? null,
            ]);

            // Load landing page template
            return VIKINGER_PATH . '/frs-landing-page.php';
        } else {
            // 404 if page doesn't exist or not published
            global $wp_query;
            $wp_query->set_404();
            return get_404_template();
        }
    }

    return $template;
});
```

### 9.3 Landing Page Template

**File:** `vikinger/frs-landing-page.php` (create in Vikinger theme)
```php
<?php
/**
 * Template: FRS Landing Page
 */

get_header();

$landing_page_slug = get_query_var('frs_landing_page');
$landing_page = FRSUsers\Models\LandingPage::where('page_slug', $landing_page_slug)
    ->with('profile')
    ->first();

// Set page variables for React
set_query_var('landing_page', $landing_page);
?>

<!-- FRS LANDING PAGE -->
<div id="frs-landing-page-viewer"
     data-page-id="<?php echo esc_attr($landing_page->id); ?>"
     data-page-slug="<?php echo esc_attr($landing_page->page_slug); ?>"
     data-template="<?php echo esc_attr($landing_page->template); ?>">

  <!-- Server-side rendered loading state -->
  <div class="landing-page-loading">
    <div class="loader"></div>
    <p>Loading...</p>
  </div>

</div>
<!-- /FRS LANDING PAGE -->

<?php
get_footer();
?>
```

**React app renders into this container:**
```tsx
// src/frontend/landing-page-viewer/main.tsx
import { createRoot } from 'react-dom/client';
import { LandingPageViewer } from './LandingPageViewer';

const element = document.getElementById('frs-landing-page-viewer');
if (element) {
  const pageId = element.dataset.pageId;
  const pageSlug = element.dataset.pageSlug;
  const template = element.dataset.template;

  const root = createRoot(element);
  root.render(
    <LandingPageViewer
      pageId={pageId}
      pageSlug={pageSlug}
      template={template}
    />
  );
}
```

---

## 10. Analytics & Lead Management

### 10.1 Analytics Dashboard

**Metrics to Track:**
- Page views (daily, weekly, monthly)
- Unique visitors
- Traffic sources (referrers)
- Form submissions
- Conversion rate (views → leads)
- Average time on page
- Device breakdown (desktop/mobile/tablet)

**Dashboard Components:**
```tsx
<PageAnalytics>
  <StatsOverview>
    <StatCard title="Total Views" value={1234} change="+12%" />
    <StatCard title="Unique Visitors" value={892} change="+8%" />
    <StatCard title="Form Submissions" value={45} change="+25%" />
    <StatCard title="Conversion Rate" value="3.6%" change="+0.5%" />
  </StatsOverview>

  <ViewsChart
    data={viewsData}
    range="30d"
  />

  <ReferrerTable
    referrers={topReferrers}
  />

  <DeviceBreakdown
    desktop={60}
    mobile={35}
    tablet={5}
  />
</PageAnalytics>
```

### 10.2 Lead Management

**Leads Dashboard:**
```tsx
<LeadsTable>
  <LeadRow>
    <Avatar name="Jane Smith" />
    <ContactInfo email="jane@email.com" phone="555-1234" />
    <Message preview="I'm interested in refinancing..." />
    <Source page="Personal Landing Page" />
    <Timestamp>2 hours ago</Timestamp>
    <Actions>
      <Button onClick={markAsContacted}>Mark Contacted</Button>
      <Button onClick={exportLead}>Export</Button>
    </Actions>
  </LeadRow>
</LeadsTable>

<LeadFilters>
  <Filter by="page" />
  <Filter by="date" />
  <Filter by="contacted" />
  <SearchBox placeholder="Search leads..." />
</LeadFilters>

<ExportButton format="csv" />
```

**Email Notifications:**
```php
// Send email when new lead submitted
add_action('frs_landing_page_lead_submitted', function($lead) {
    $page = $lead->landingPage;
    $profile = $page->profile;

    wp_mail(
        $profile->email,
        'New Lead from ' . $page->page_title,
        "You have a new contact form submission:\n\n" .
        "Name: {$lead->lead_name}\n" .
        "Email: {$lead->lead_email}\n" .
        "Phone: {$lead->lead_phone}\n" .
        "Message: {$lead->lead_message}\n\n" .
        "View all leads: " . bp_members_get_user_url($profile->user_id) . 'landing-pages/leads'
    );
});
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create database migrations
- [ ] Build Eloquent models
- [ ] Create REST API endpoints
- [ ] Set up BuddyPress component
- [ ] Add rewrite rules
- [ ] Create basic template loader

### Phase 2: Personal Landing Pages (Week 3-4)
- [ ] Build React landing page manager app
- [ ] Create page creation wizard
- [ ] Develop 3 personal templates (Modern, Classic, Bold)
- [ ] Build visual editor with live preview
- [ ] Implement auto-save
- [ ] Add analytics tracking
- [ ] Create public viewer

### Phase 3: Editor Features (Week 5-6)
- [ ] Content block system
- [ ] Color customization
- [ ] Section toggle/reorder
- [ ] SEO settings
- [ ] Form builder
- [ ] Image upload/management
- [ ] Mobile responsive preview

### Phase 4: Partnership Pages (Week 7)
- [ ] Partnership templates
- [ ] Dual-profile data merging
- [ ] Partnership page wizard
- [ ] Co-branded customization

### Phase 5: Teams & Campaigns (Week 8-9)
- [ ] Team management UI
- [ ] Team roster templates
- [ ] Campaign creation wizard
- [ ] Event registration system
- [ ] Campaign templates

### Phase 6: Analytics & Leads (Week 10)
- [ ] Analytics dashboard
- [ ] Lead management interface
- [ ] Export functionality
- [ ] Email notifications
- [ ] Reporting features

### Phase 7: Vikinger Integration (Week 11-12)
- [ ] Style templates to match Vikinger
- [ ] Add widgets to profile sidebars
- [ ] Navigation menu integration
- [ ] Mobile optimization
- [ ] Testing across all Vikinger layouts

### Phase 8: Polish & Launch (Week 13-14)
- [ ] User testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation
- [ ] Video tutorials
- [ ] Launch

---

## 12. User Documentation Outline

### Quick Start Guides
1. **Creating Your First Landing Page** (5 min)
2. **Customizing Your Page** (10 min)
3. **Publishing & Sharing** (5 min)
4. **Managing Leads** (10 min)

### Video Tutorials
1. Personal Landing Page Creation
2. Partnership Page Setup
3. Team Page Management
4. Campaign Landing Pages
5. Advanced Customization
6. Analytics & Lead Follow-up

### Help Articles
- Understanding Templates
- SEO Best Practices
- Form Customization
- Lead Management
- Troubleshooting

---

## 13. Success Metrics

### User Adoption Goals
- 80% of loan officers create at least 1 landing page in first month
- 50% create 2+ pages within 3 months
- Average 5 leads per page per month

### Technical Performance
- Page load time < 2 seconds
- Mobile performance score > 90
- Zero critical bugs in production

### Business Impact
- 30% increase in inbound leads
- 50% reduction in support requests (vs custom page requests)
- High user satisfaction (4.5+ stars)

---

## Next Steps

1. **Review & Approve** this plan
2. **Prioritize features** (which phases to tackle first?)
3. **Set timeline** (aggressive vs conservative?)
4. **Resource allocation** (full-time vs part-time development?)
5. **Start Phase 1** (database & API foundation)

Would you like me to:
- A) Start implementing Phase 1 immediately
- B) Create detailed wireframes for the UI first
- C) Build a prototype of the page wizard
- D) Set up the database migrations and models

Let me know which direction to take!
