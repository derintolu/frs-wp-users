# MONDAY MVP SPRINT: Landing Pages

**Deadline:** Monday morning
**Timeline:** Friday night through Sunday
**Goal:** Push-button landing page generation for Personal, Partnership, and Team pages

---

## 🎯 MUST-HAVE Features by Monday

### 1. Personal Landing Pages ✅
- One-click "Create My Landing Page" button
- Auto-populate from FRS profile (all 45+ fields)
- Public URL: `/{username}/landing`
- Uses Vikinger theme components
- Shows: Hero, Bio, NMLS, Service Areas, Contact Form

### 2. Partnership Landing Pages ✅
- One-click "Create Partnership Page" from partnership detail
- Pulls both loan officer + realtor profiles
- Public URL: `/partnerships/{lo-slug}-{realtor-slug}`
- Dual hero layout
- Combined service areas
- Dual CTA (Get Pre-Approved | Contact Realtor)

### 3. Team Landing Pages ✅
- One-click "Create Team Page"
- Team roster with all member profiles
- Public URL: `/teams/{team-slug}`
- Team stats (combined experience, loans, etc.)
- Member grid layout

---

## 🚫 NOT Building Yet (Post-Monday)

- ❌ Visual editor (use default templates only)
- ❌ Multiple template choices (one template per type)
- ❌ Campaign pages
- ❌ Analytics dashboard
- ❌ Lead management
- ❌ Custom React UI for editing
- ❌ SEO customization

**Strategy:** Get working pages live by Monday, add features next week.

---

## 📅 Hour-by-Hour Sprint Schedule

### Friday Night (2 hours - 7pm-9pm)

**Hour 1: Vikinger Setup (7pm-8pm)**
- [ ] Install Vikinger theme
- [ ] Activate theme
- [ ] Configure basic settings
- [ ] Test with current BuddyPress setup

**Hour 2: Database Setup (8pm-9pm)**
- [ ] Create migration for wp_frs_landing_pages
- [ ] Create migration for wp_frs_teams
- [ ] Create migration for wp_frs_team_members
- [ ] Run migrations
- [ ] Create Eloquent models

---

### Saturday (10 hours - 9am-7pm)

#### Morning Session (9am-12pm - 3 hours)

**Hour 1: REST API Foundation (9am-10am)**
- [ ] Create LandingPageController
- [ ] Add REST endpoints for CRUD
- [ ] Add permission callbacks
- [ ] Test with Postman/curl

**Hour 2: Personal Page Generator (10am-11am)**
- [ ] Create quick-create endpoint
- [ ] Build auto-population logic
- [ ] Test creating page from profile data
- [ ] Verify database records

**Hour 3: Personal Page Template (11am-12pm)**
- [ ] Create Vikinger-based template file
- [ ] Use existing Vikinger widgets
- [ ] Map FRS profile fields to template
- [ ] Test rendering

#### Lunch (12pm-1pm)

#### Afternoon Session (1pm-5pm - 4 hours)

**Hour 4: Public Routing (1pm-2pm)**
- [ ] Add rewrite rules for /{username}/landing
- [ ] Create template loader
- [ ] Test public access
- [ ] Add view tracking

**Hour 5: BuddyPress Integration (2pm-3pm)**
- [ ] Add "Create Landing Page" button to profile
- [ ] Add widget showing landing page links
- [ ] Test from BuddyPress UI

**Hour 6: Partnership Pages Foundation (3pm-4pm)**
- [ ] Create partnership page generator
- [ ] Pull both partner profiles
- [ ] Merge data logic
- [ ] Test with existing partnership

**Hour 7: Partnership Template (4pm-5pm)**
- [ ] Create dual-hero Vikinger template
- [ ] Display both profiles
- [ ] Combined service areas
- [ ] Dual CTAs

#### Evening Session (7pm-9pm - 2 hours)

**Hour 8: Team Database (7pm-8pm)**
- [ ] Create sample teams
- [ ] Add team members
- [ ] Test team queries

**Hour 9: Team Page Generator (8pm-9pm)**
- [ ] Create team page generator
- [ ] Pull all team member profiles
- [ ] Calculate team stats
- [ ] Test generation

---

### Sunday (8 hours - 10am-6pm)

#### Morning Session (10am-1pm - 3 hours)

**Hour 1: Team Template (10am-11am)**
- [ ] Create team roster Vikinger template
- [ ] Display all members
- [ ] Show team stats
- [ ] Company branding area

**Hour 2: Polish Personal Pages (11am-12pm)**
- [ ] Add all profile fields to template
- [ ] Service area map/icons
- [ ] NMLS badge
- [ ] Contact form

**Hour 3: Polish Partnership Pages (12pm-1pm)**
- [ ] Perfect dual layout
- [ ] Combined stats
- [ ] Partnership tagline
- [ ] Test with 3 partnerships

#### Lunch (1pm-2pm)

#### Afternoon Session (2pm-6pm - 4 hours)

**Hour 4: Polish Team Pages (2pm-3pm)**
- [ ] Member grid layout
- [ ] Featured members
- [ ] Team bio section
- [ ] Test with 2 teams

**Hour 5: Full Testing (3pm-4pm)**
- [ ] Test all 3 page types
- [ ] Test with real data
- [ ] Mobile responsive check
- [ ] Fix critical bugs

**Hour 6: Deploy Prep (4pm-5pm)**
- [ ] Create user documentation
- [ ] Test on staging
- [ ] Backup database
- [ ] Prepare for production

**Hour 7: Go Live (5pm-6pm)**
- [ ] Deploy to production
- [ ] Test live URLs
- [ ] Create sample pages
- [ ] Send announcement

---

## 🗄️ Database Schema (Minimal)

### wp_frs_landing_pages

```sql
CREATE TABLE wp_frs_landing_pages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id BIGINT UNSIGNED NOT NULL,
  page_type ENUM('personal', 'partnership', 'team') NOT NULL,
  page_slug VARCHAR(255) UNIQUE NOT NULL,
  page_title VARCHAR(255) NOT NULL,
  settings JSON,
  is_published BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profile (profile_id),
  INDEX idx_slug (page_slug),
  FOREIGN KEY (profile_id) REFERENCES wp_frs_profiles(id) ON DELETE CASCADE
);
```

### wp_frs_teams

```sql
CREATE TABLE wp_frs_teams (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  team_slug VARCHAR(255) UNIQUE NOT NULL,
  team_bio TEXT,
  team_lead_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (team_slug),
  FOREIGN KEY (team_lead_id) REFERENCES wp_frs_profiles(id) ON DELETE SET NULL
);
```

### wp_frs_team_members

```sql
CREATE TABLE wp_frs_team_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id BIGINT UNSIGNED NOT NULL,
  profile_id BIGINT UNSIGNED NOT NULL,
  is_featured BOOLEAN DEFAULT 0,
  display_order INT DEFAULT 0,
  UNIQUE KEY unique_team_member (team_id, profile_id),
  FOREIGN KEY (team_id) REFERENCES wp_frs_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES wp_frs_profiles(id) ON DELETE CASCADE
);
```

---

## 🔌 REST API Endpoints (Monday MVP)

```php
// Personal Pages
POST   /frs-users/v1/landing-pages/quick-create-personal
GET    /frs-users/v1/landing-pages/my-pages
DELETE /frs-users/v1/landing-pages/{id}

// Partnership Pages
POST   /frs-users/v1/landing-pages/quick-create-partnership
       Body: { partnership_id: 123 }

// Team Pages
POST   /frs-users/v1/teams
       Body: { team_name, members: [1,2,3] }
POST   /frs-users/v1/landing-pages/quick-create-team
       Body: { team_id: 456 }

// Public
GET    /frs-users/v1/landing-pages/slug/{slug}  (public, no auth)
```

---

## 📝 Implementation Code Snippets

### 1. Database Migration

**File:** `database/Migrations/LandingPages.php`

```php
<?php
namespace FRSUsers\Database\Migrations;

class LandingPages {
    public static function up() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        // Landing Pages
        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}frs_landing_pages (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            profile_id BIGINT UNSIGNED NOT NULL,
            page_type ENUM('personal', 'partnership', 'team') NOT NULL,
            page_slug VARCHAR(255) UNIQUE NOT NULL,
            page_title VARCHAR(255) NOT NULL,
            settings JSON,
            is_published BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_profile (profile_id),
            INDEX idx_slug (page_slug),
            FOREIGN KEY (profile_id) REFERENCES {$wpdb->prefix}frs_profiles(id) ON DELETE CASCADE
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Teams
        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}frs_teams (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_name VARCHAR(255) NOT NULL,
            team_slug VARCHAR(255) UNIQUE NOT NULL,
            team_bio TEXT,
            team_lead_id BIGINT UNSIGNED,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_slug (team_slug),
            FOREIGN KEY (team_lead_id) REFERENCES {$wpdb->prefix}frs_profiles(id) ON DELETE SET NULL
        ) $charset_collate;";
        dbDelta($sql);

        // Team Members
        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}frs_team_members (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            profile_id BIGINT UNSIGNED NOT NULL,
            is_featured BOOLEAN DEFAULT 0,
            display_order INT DEFAULT 0,
            UNIQUE KEY unique_team_member (team_id, profile_id),
            FOREIGN KEY (team_id) REFERENCES {$wpdb->prefix}frs_teams(id) ON DELETE CASCADE,
            FOREIGN KEY (profile_id) REFERENCES {$wpdb->prefix}frs_profiles(id) ON DELETE CASCADE
        ) $charset_collate;";
        dbDelta($sql);
    }

    public static function down() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}frs_team_members");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}frs_teams");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}frs_landing_pages");
    }
}
```

### 2. Eloquent Models

**File:** `includes/Models/LandingPage.php`

```php
<?php
namespace FRSUsers\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPage extends Model {
    protected $table = 'frs_landing_pages';
    protected $fillable = [
        'profile_id', 'page_type', 'page_slug', 'page_title',
        'settings', 'is_published'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_published' => 'boolean'
    ];

    public function profile() {
        return $this->belongsTo(Profile::class);
    }

    public static function quick_create_personal($profile_id) {
        $profile = Profile::find($profile_id);
        if (!$profile) return null;

        return self::create([
            'profile_id' => $profile->id,
            'page_type' => 'personal',
            'page_slug' => $profile->profile_slug . '/landing',
            'page_title' => $profile->first_name . ' ' . $profile->last_name . ' - Loan Officer',
            'settings' => [
                'template' => 'modern',
                'created_via' => 'quick_create'
            ],
            'is_published' => true
        ]);
    }

    public static function quick_create_partnership($partnership_id) {
        $partnership = Partnership::with(['loanOfficer', 'realtor'])->find($partnership_id);
        if (!$partnership) return null;

        $lo_slug = $partnership->loanOfficer->profile_slug;
        $realtor_slug = $partnership->realtor->profile_slug;

        return self::create([
            'profile_id' => $partnership->loan_officer_id,
            'page_type' => 'partnership',
            'page_slug' => "partnerships/{$lo_slug}-{$realtor_slug}",
            'page_title' => ($partnership->partnership_name ?: 'Partnership') . ' Landing Page',
            'settings' => [
                'partnership_id' => $partnership->id,
                'template' => 'dual_hero'
            ],
            'is_published' => true
        ]);
    }

    public static function quick_create_team($team_id) {
        $team = Team::find($team_id);
        if (!$team) return null;

        return self::create([
            'profile_id' => $team->team_lead_id ?: $team->members->first()->id,
            'page_type' => 'team',
            'page_slug' => "teams/{$team->team_slug}",
            'page_title' => $team->team_name . ' - Team Page',
            'settings' => [
                'team_id' => $team->id,
                'template' => 'roster'
            ],
            'is_published' => true
        ]);
    }
}
```

**File:** `includes/Models/Team.php`

```php
<?php
namespace FRSUsers\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model {
    protected $table = 'frs_teams';
    protected $fillable = ['team_name', 'team_slug', 'team_bio', 'team_lead_id'];

    public function lead() {
        return $this->belongsTo(Profile::class, 'team_lead_id');
    }

    public function members() {
        return $this->belongsToMany(Profile::class, 'frs_team_members', 'team_id', 'profile_id')
                    ->withPivot('is_featured', 'display_order');
    }

    public function getTotalLoansAttribute() {
        // Calculate from all members
        return $this->members->sum(function($member) {
            return $member->total_loans_closed ?? 0;
        });
    }

    public function getCombinedExperienceAttribute() {
        // Sum years of experience
        return $this->members->sum(function($member) {
            return $member->years_of_experience ?? 0;
        });
    }
}
```

### 3. REST API Controller

**File:** `includes/Controllers/LandingPages/QuickCreate.php`

```php
<?php
namespace FRSUsers\Controllers\LandingPages;

use FRSUsers\Models\LandingPage;
use WP_REST_Request;

class QuickCreate {

    public function create_personal(WP_REST_Request $request) {
        $current_user_id = get_current_user_id();
        $profile = \FRSUsers\Models\Profile::get_by_user_id($current_user_id);

        if (!$profile) {
            return new \WP_Error('no_profile', 'No profile found', ['status' => 404]);
        }

        // Check if already exists
        $existing = LandingPage::where('profile_id', $profile->id)
            ->where('page_type', 'personal')
            ->first();

        if ($existing) {
            return rest_ensure_response([
                'success' => true,
                'message' => 'Landing page already exists',
                'landing_page' => $existing,
                'url' => home_url('/' . $existing->page_slug)
            ]);
        }

        $landing_page = LandingPage::quick_create_personal($profile->id);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Landing page created successfully',
            'landing_page' => $landing_page,
            'url' => home_url('/' . $landing_page->page_slug)
        ]);
    }

    public function create_partnership(WP_REST_Request $request) {
        $partnership_id = $request->get_param('partnership_id');

        if (!$partnership_id) {
            return new \WP_Error('missing_param', 'Partnership ID required', ['status' => 400]);
        }

        $landing_page = LandingPage::quick_create_partnership($partnership_id);

        if (!$landing_page) {
            return new \WP_Error('create_failed', 'Failed to create partnership page', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Partnership page created',
            'landing_page' => $landing_page,
            'url' => home_url('/' . $landing_page->page_slug)
        ]);
    }

    public function create_team(WP_REST_Request $request) {
        $team_id = $request->get_param('team_id');

        if (!$team_id) {
            return new \WP_Error('missing_param', 'Team ID required', ['status' => 400]);
        }

        $landing_page = LandingPage::quick_create_team($team_id);

        if (!$landing_page) {
            return new \WP_Error('create_failed', 'Failed to create team page', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Team page created',
            'landing_page' => $landing_page,
            'url' => home_url('/' . $landing_page->page_slug)
        ]);
    }
}
```

### 4. Register REST Routes

**File:** `includes/Routes/Api.php` (add to existing)

```php
// Landing Pages Quick Create
register_rest_route('frs-users/v1', '/landing-pages/quick-create-personal', [
    'methods' => 'POST',
    'callback' => [new \FRSUsers\Controllers\LandingPages\QuickCreate(), 'create_personal'],
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);

register_rest_route('frs-users/v1', '/landing-pages/quick-create-partnership', [
    'methods' => 'POST',
    'callback' => [new \FRSUsers\Controllers\LandingPages\QuickCreate(), 'create_partnership'],
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);

register_rest_route('frs-users/v1', '/landing-pages/quick-create-team', [
    'methods' => 'POST',
    'callback' => [new \FRSUsers\Controllers\LandingPages\QuickCreate(), 'create_team'],
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);

// Public endpoint to get landing page by slug
register_rest_route('frs-users/v1', '/landing-pages/slug/(?P<slug>[a-zA-Z0-9-/]+)', [
    'methods' => 'GET',
    'callback' => function($request) {
        $slug = $request->get_param('slug');
        $page = \FRSUsers\Models\LandingPage::where('page_slug', $slug)
            ->where('is_published', true)
            ->with('profile')
            ->first();

        if (!$page) {
            return new \WP_Error('not_found', 'Page not found', ['status' => 404]);
        }

        return rest_ensure_response($page);
    },
    'permission_callback' => '__return_true' // Public
]);
```

### 5. Rewrite Rules

**File:** `includes/Core/LandingPageRouter.php` (new file)

```php
<?php
namespace FRSUsers\Core;

use FRSUsers\Models\LandingPage;

class LandingPageRouter {

    public static function init() {
        add_action('init', [self::class, 'add_rewrite_rules']);
        add_filter('query_vars', [self::class, 'add_query_vars']);
        add_filter('template_include', [self::class, 'template_loader']);
    }

    public static function add_rewrite_rules() {
        // Personal: /{username}/landing
        add_rewrite_rule(
            '^([^/]+)/landing/?$',
            'index.php?frs_landing_page=$matches[1]/landing',
            'top'
        );

        // Partnership: /partnerships/{slug}
        add_rewrite_rule(
            '^partnerships/([^/]+)/?$',
            'index.php?frs_landing_page=partnerships/$matches[1]',
            'top'
        );

        // Team: /teams/{slug}
        add_rewrite_rule(
            '^teams/([^/]+)/?$',
            'index.php?frs_landing_page=teams/$matches[1]',
            'top'
        );
    }

    public static function add_query_vars($vars) {
        $vars[] = 'frs_landing_page';
        return $vars;
    }

    public static function template_loader($template) {
        $slug = get_query_var('frs_landing_page');

        if (!$slug) {
            return $template;
        }

        $landing_page = LandingPage::where('page_slug', $slug)
            ->where('is_published', true)
            ->with('profile')
            ->first();

        if (!$landing_page) {
            global $wp_query;
            $wp_query->set_404();
            return get_404_template();
        }

        // Set global for template to use
        $GLOBALS['frs_landing_page'] = $landing_page;

        // Load appropriate template based on type
        if ($landing_page->page_type === 'personal') {
            return locate_template(['frs-landing-personal.php']);
        } elseif ($landing_page->page_type === 'partnership') {
            return locate_template(['frs-landing-partnership.php']);
        } elseif ($landing_page->page_type === 'team') {
            return locate_template(['frs-landing-team.php']);
        }

        return $template;
    }
}
```

**Activate in plugin.php:**

```php
\FRSUsers\Core\LandingPageRouter::init();
```

---

## 🎨 Vikinger Template Files

Create these in your Vikinger theme folder:

### frs-landing-personal.php

```php
<?php
/**
 * Template: Personal Landing Page
 */

get_header();

$landing_page = $GLOBALS['frs_landing_page'];
$profile = $landing_page->profile;
?>

<div class="content-grid">
  <!-- HERO SECTION -->
  <div class="profile-header">
    <div class="profile-header-cover" style="background: url(<?php echo $profile->cover_photo; ?>) center/cover;"></div>

    <div class="profile-header-info">
      <div class="user-short-description big">
        <?php
        get_template_part('template-part/avatar/avatar', 'big', [
          'user' => [
            'avatar_url' => $profile->profile_photo,
            'name' => $profile->first_name . ' ' . $profile->last_name
          ]
        ]);
        ?>

        <p class="user-short-description-title">
          <?php echo esc_html($profile->first_name . ' ' . $profile->last_name); ?>
        </p>

        <p class="user-short-description-text">
          <?php echo esc_html($profile->professional_title); ?>
          <?php if ($profile->nmls_id): ?>
            • NMLS# <?php echo esc_html($profile->nmls_id); ?>
          <?php endif; ?>
        </p>
      </div>

      <!-- CTA Button -->
      <?php if ($profile->arrive): ?>
        <a href="<?php echo esc_url($profile->arrive); ?>"
           class="button primary"
           target="_blank">
          Get Pre-Approved
        </a>
      <?php endif; ?>
    </div>
  </div>

  <!-- MAIN CONTENT GRID -->
  <div class="grid grid-3-6-3 mobile-prefer-content">

    <!-- LEFT SIDEBAR -->
    <div class="grid-column">
      <?php
      // About Widget
      get_template_part('template-part/widget/widget-info', null, [
        'widget_title' => 'About Me',
        'widget_text' => $profile->bio,
        'information_items' => [
          ['title' => 'Email', 'value' => $profile->email, 'type' => 'text'],
          ['title' => 'Phone', 'value' => $profile->phone_number, 'type' => 'text'],
          ['title' => 'NMLS', 'value' => $profile->nmls_id, 'type' => 'text'],
        ]
      ]);

      // Specialties
      if ($profile->specialties_lo) {
        get_template_part('template-part/widget/widget-info', null, [
          'widget_title' => 'Specialties',
          'information_items' => array_map(function($spec) {
            return ['title' => $spec, 'value' => '✓', 'type' => 'text'];
          }, json_decode($profile->specialties_lo, true) ?: [])
        ]);
      }
      ?>
    </div>

    <!-- CENTER CONTENT -->
    <div class="grid-column">
      <div class="widget-box">
        <p class="widget-box-title">Get Started Today</p>
        <div class="widget-box-content">
          <p class="paragraph"><?php echo nl2br(esc_html($profile->bio)); ?></p>

          <!-- Contact Form -->
          <form class="form" method="post" action="/wp-json/frs-users/v1/landing-pages/submit">
            <div class="form-row">
              <input type="text" name="name" placeholder="Your Name" required />
            </div>
            <div class="form-row">
              <input type="email" name="email" placeholder="Your Email" required />
            </div>
            <div class="form-row">
              <input type="tel" name="phone" placeholder="Your Phone" />
            </div>
            <div class="form-row">
              <textarea name="message" placeholder="How can I help you?" rows="4"></textarea>
            </div>
            <button type="submit" class="button primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDEBAR -->
    <div class="grid-column">
      <?php
      // Service Areas
      if ($profile->service_areas) {
        $states = json_decode($profile->service_areas, true) ?: [];
        ?>
        <div class="widget-box">
          <p class="widget-box-title">Licensed States</p>
          <div class="widget-box-content">
            <div class="badge-item-list">
              <?php foreach ($states as $state): ?>
                <div class="badge-item">
                  <p class="badge-item-text"><?php echo esc_html($state); ?></p>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
        <?php
      }
      ?>
    </div>

  </div>
</div>

<?php get_footer(); ?>
```

### frs-landing-partnership.php

```php
<?php
/**
 * Template: Partnership Landing Page
 */

get_header();

$landing_page = $GLOBALS['frs_landing_page'];
$partnership_id = $landing_page->settings['partnership_id'] ?? null;
$partnership = \FRSUsers\Models\Partnership::with(['loanOfficer', 'realtor'])->find($partnership_id);
$lo = $partnership->loanOfficer;
$realtor = $partnership->realtor;
?>

<div class="content-grid">
  <!-- DUAL HERO -->
  <div class="grid grid-2">
    <!-- Loan Officer Side -->
    <div class="profile-header" style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);">
      <div class="profile-header-info" style="padding: 40px;">
        <?php
        get_template_part('template-part/avatar/avatar', 'big', [
          'user' => ['avatar_url' => $lo->profile_photo, 'name' => $lo->first_name]
        ]);
        ?>
        <h2 style="color: white;"><?php echo esc_html($lo->first_name . ' ' . $lo->last_name); ?></h2>
        <p style="color: rgba(255,255,255,0.9);">Loan Officer</p>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px;">NMLS# <?php echo esc_html($lo->nmls_id); ?></p>
        <a href="<?php echo esc_url($lo->arrive); ?>" class="button primary" style="margin-top: 20px;">
          Get Pre-Approved
        </a>
      </div>
    </div>

    <!-- Realtor Side -->
    <div class="profile-header" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);">
      <div class="profile-header-info" style="padding: 40px;">
        <?php
        get_template_part('template-part/avatar/avatar', 'big', [
          'user' => ['avatar_url' => $realtor->profile_photo, 'name' => $realtor->first_name]
        ]);
        ?>
        <h2 style="color: white;"><?php echo esc_html($realtor->first_name . ' ' . $realtor->last_name); ?></h2>
        <p style="color: rgba(255,255,255,0.9);">Real Estate Agent</p>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px;"><?php echo esc_html($realtor->professional_title); ?></p>
        <a href="mailto:<?php echo esc_attr($realtor->email); ?>" class="button primary" style="margin-top: 20px;">
          Contact Agent
        </a>
      </div>
    </div>
  </div>

  <!-- PARTNERSHIP CONTENT -->
  <div class="grid grid-12 centered" style="margin-top: 40px;">
    <div class="grid-column">
      <div class="widget-box">
        <p class="widget-box-title">Your Dream Team</p>
        <div class="widget-box-content">
          <p class="paragraph">
            <?php echo nl2br(esc_html($partnership->partnership_bio ?:
              "Together, we make homeownership dreams come true. Combining expert mortgage guidance with exceptional real estate service.")); ?>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<?php get_footer(); ?>
```

### frs-landing-team.php

```php
<?php
/**
 * Template: Team Landing Page
 */

get_header();

$landing_page = $GLOBALS['frs_landing_page'];
$team_id = $landing_page->settings['team_id'] ?? null;
$team = \FRSUsers\Models\Team::with('members')->find($team_id);
?>

<div class="content-grid">
  <!-- TEAM HEADER -->
  <div class="section-banner">
    <div class="section-banner-icon">
      <img src="<?php echo get_template_directory_uri(); ?>/img/banner/team-icon.png" alt="Team">
    </div>
    <p class="section-banner-title"><?php echo esc_html($team->team_name); ?></p>
    <p class="section-banner-text"><?php echo esc_html($team->team_bio); ?></p>
  </div>

  <!-- TEAM STATS -->
  <div class="grid grid-4" style="margin: 40px 0;">
    <div class="widget-box">
      <div class="widget-box-content text-center">
        <p class="user-stat-title"><?php echo count($team->members); ?></p>
        <p class="user-stat-text">Team Members</p>
      </div>
    </div>
    <div class="widget-box">
      <div class="widget-box-content text-center">
        <p class="user-stat-title"><?php echo $team->total_loans; ?>+</p>
        <p class="user-stat-text">Loans Closed</p>
      </div>
    </div>
    <div class="widget-box">
      <div class="widget-box-content text-center">
        <p class="user-stat-title"><?php echo $team->combined_experience; ?>+</p>
        <p class="user-stat-text">Years Experience</p>
      </div>
    </div>
    <div class="widget-box">
      <div class="widget-box-content text-center">
        <p class="user-stat-title">5.0</p>
        <p class="user-stat-text">Client Rating</p>
      </div>
    </div>
  </div>

  <!-- TEAM ROSTER -->
  <div class="grid grid-4">
    <?php foreach ($team->members as $member): ?>
      <div class="user-preview">
        <?php
        get_template_part('template-part/avatar/avatar', 'medium', [
          'user' => ['avatar_url' => $member->profile_photo, 'name' => $member->first_name]
        ]);
        ?>
        <p class="user-preview-title">
          <a href="<?php echo home_url('/' . $member->profile_slug); ?>">
            <?php echo esc_html($member->first_name . ' ' . $member->last_name); ?>
          </a>
        </p>
        <p class="user-preview-text"><?php echo esc_html($member->professional_title); ?></p>
        <?php if ($member->nmls_id): ?>
          <p class="user-preview-text small">NMLS# <?php echo esc_html($member->nmls_id); ?></p>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<?php get_footer(); ?>
```

---

## ✅ Monday Morning Checklist

### Must Work:
- [ ] Personal pages generating with one click
- [ ] Partnership pages generating from partnerships
- [ ] Team pages generating from teams
- [ ] All public URLs loading
- [ ] Vikinger styling applied
- [ ] Mobile responsive
- [ ] No critical errors

### Demo Ready:
- [ ] 3 personal pages created
- [ ] 2 partnership pages created
- [ ] 1 team page created
- [ ] All pages look professional
- [ ] Contact forms working

---

## 🚀 Deployment Steps

### Sunday 5pm:
```bash
# Backup
wp db export backup-before-landing-pages.sql

# Deploy
git add .
git commit -m "feat: Add one-click landing page generation"
git push origin main

# Run migrations
wp eval '\FRSUsers\Database\Migrations\LandingPages::up();'

# Flush rewrite rules
wp rewrite flush

# Test
curl http://hub21.local/derintolu/landing
```

---

## 🎯 Success = Push Button Works

**Monday Demo:**
1. Show profile page
2. Click "Create Landing Page"
3. Page generates instantly
4. Visit public URL
5. Professional page with all profile data

**That's it. Everything else is bonus.**

Ready to start? What's first - database setup or Vikinger install?
