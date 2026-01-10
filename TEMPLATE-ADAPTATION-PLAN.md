# LO Profile Template Adaptation Plan

**Source**: `/Users/cedarstone/Local Sites/21stcenturylending/app/public/wp-content/plugins/frs-profile-directory/templates/lo-profile.php`
**Destination**: `/Users/cedarstone/Local Sites/21stcenturylending/app/public/wp-content/plugins/frs-wp-users/templates/profile-loan_officer.php`
**Lines**: 1,306 lines (comprehensive bento card layout)

---

## Current Template Structure

### Data Source (CURRENT)
```php
// Currently pulls from API response array
$profile = // API response from frs-users REST API

// Extracts data like:
$first_name = $profile['first_name'] ?? '';
$last_name = $profile['last_name'] ?? '';
$email = $profile['email'] ?? '';
$phone = $profile['phone_number'] ?? '';
$headshot_url = $profile['headshot_url'] ?? '';
// ... 51 more fields
```

### Required Changes

#### 1. Data Source Migration (FROM API → TO WordPress User)

**BEFORE** (API-based):
```php
// Expects $profile array from API client
$first_name = $profile['first_name'] ?? '';
$last_name = $profile['last_name'] ?? '';
$headshot_url = $profile['headshot_url'] ?? '';
```

**AFTER** (WordPress User-based):
```php
// Get current author being viewed
$author = get_queried_object(); // WP_User object on author pages

// Use UserProfile model wrapper
$user_profile = new \FRSUsers\Models\UserProfile($author->ID);

// Extract data from wp_users + wp_usermeta
$first_name = get_user_meta($author->ID, 'first_name', true);
$last_name = get_user_meta($author->ID, 'last_name', true);
$headshot_url = $user_profile->get_headshot_url();

// OR use helper methods
$first_name = $user_profile->get_first_name();
$last_name = $user_profile->get_last_name();
$email = $author->user_email;
$phone = $user_profile->get_phone_number();
$nmls = $user_profile->get_nmls();
$bio = $user_profile->get_biography();
// etc.
```

#### 2. Field Mapping Table

| Current API Field | WordPress Source | Notes |
|-------------------|------------------|-------|
| `$profile['first_name']` | `get_user_meta($id, 'first_name', true)` | Core WP field |
| `$profile['last_name']` | `get_user_meta($id, 'last_name', true)` | Core WP field |
| `$profile['email']` | `$author->user_email` | Core WP field |
| `$profile['display_name']` | `$author->display_name` | Core WP field |
| `$profile['headshot_url']` | `$user_profile->get_headshot_url()` | From `frs_headshot_id` |
| `$profile['phone_number']` | `get_user_meta($id, 'frs_phone_number', true)` | Custom meta |
| `$profile['mobile_number']` | `get_user_meta($id, 'frs_mobile_number', true)` | Custom meta |
| `$profile['job_title']` | `get_user_meta($id, 'frs_job_title', true)` | Custom meta |
| `$profile['biography']` | `get_user_meta($id, 'frs_biography', true)` | Custom meta |
| `$profile['nmls']` | `get_user_meta($id, 'frs_nmls', true)` | Custom meta |
| `$profile['city_state']` | `get_user_meta($id, 'frs_city_state', true)` | Custom meta |
| `$profile['arrive']` | `get_user_meta($id, 'frs_arrive', true)` | Custom meta |
| `$profile['qr_code_data']` | `get_user_meta($id, 'frs_qr_code_data', true)` | Custom meta |
| `$profile['website']` | `$author->user_url` OR `frs_website` | Core or custom |
| `$profile['facebook_url']` | `get_user_meta($id, 'frs_facebook_url', true)` | Custom meta |
| `$profile['instagram_url']` | `get_user_meta($id, 'frs_instagram_url', true)` | Custom meta |
| `$profile['linkedin_url']` | `get_user_meta($id, 'frs_linkedin_url', true)` | Custom meta |
| `$profile['twitter_url']` | `get_user_meta($id, 'frs_twitter_url', true)` | Custom meta |
| `$profile['specialties_lo']` | `json_decode(get_user_meta($id, 'frs_specialties_lo', true), true)` | JSON array |
| `$profile['namb_certifications']` | `json_decode(get_user_meta($id, 'frs_namb_certifications', true), true)` | JSON array |
| `$profile['service_areas']` | `json_decode(get_user_meta($id, 'frs_service_areas', true), true)` | JSON array |
| `$profile['custom_links']` | `json_decode(get_user_meta($id, 'frs_custom_links', true), true)` | JSON array |
| `$profile['profile_slug']` | `$author->user_nicename` OR `frs_custom_slug` | Core or custom |

#### 3. Template Sections to Adapt

**Section 1: Profile Header** (Lines 117-224)
- ✅ Video background header
- ✅ Avatar with QR flip functionality
- ✅ Name, title, NMLS display
- ✅ Contact info (email, phone)
- **Change**: Pull from `$author` and `get_user_meta()` instead of `$profile` array

**Section 2: Sidebar** (Lines 227-283)
- ✅ Contact buttons
- ✅ Service areas card with state SVGs
- **Change**: Pull service areas from `frs_service_areas` usermeta

**Section 3: Biography** (Lines 287-299+)
- ✅ Professional bio display
- **Change**: Pull from `frs_biography` usermeta

**Section 4: Specialties & Certifications** (Continues after line 299)
- ✅ Loan officer specialties
- ✅ NAMB certifications display
- **Change**: Pull from `frs_specialties_lo` and `frs_namb_certifications` usermeta (JSON decode)

**Section 5: Social Links** (Throughout)
- ✅ Facebook, Instagram, LinkedIn, Twitter links
- **Change**: Pull from `frs_*_url` usermeta fields

**Section 6: Contact Form Modal** (Later in file)
- ✅ JavaScript-based contact form
- **Change**: Form submission endpoint stays same (REST API)

**Section 7: NEW - Published Posts** (TO ADD)
- ❌ Currently not in template
- ✅ Need to add section showing author's published blog posts
- Display after bio or as separate card
- Use WordPress loop:
```php
// Get posts by this author
$author_posts = new WP_Query([
    'author' => $author->ID,
    'posts_per_page' => 5,
    'post_status' => 'publish',
]);

if ($author_posts->have_posts()) : ?>
    <div class="frs-profile__card frs-profile__card--posts">
        <h3 class="frs-profile__card-title">Latest Posts</h3>
        <div class="frs-profile__posts-grid">
            <?php while ($author_posts->have_posts()) : $author_posts->the_post(); ?>
                <article class="frs-profile__post-card">
                    <a href="<?php the_permalink(); ?>">
                        <?php if (has_post_thumbnail()) : ?>
                            <?php the_post_thumbnail('medium'); ?>
                        <?php endif; ?>
                        <h4><?php the_title(); ?></h4>
                        <p><?php echo wp_trim_words(get_the_excerpt(), 20); ?></p>
                        <span class="frs-profile__post-date"><?php echo get_the_date(); ?></span>
                    </a>
                </article>
            <?php endwhile; ?>
        </div>
    </div>
<?php endif; wp_reset_postdata(); ?>
```

#### 4. URL Handling Changes

**BEFORE** (Custom routing):
```php
// Profile accessed via /directory/lo/{slug}
// Fetches data from hub API
$api_url = trailingslashit($hub_url) . 'wp-json/frs-users/v1/profiles/slug/' . $slug;
$response = wp_remote_get($api_url);
$profile = json_decode(wp_remote_retrieve_body($response), true);
```

**AFTER** (WordPress author page with masked URL):
```php
// Profile accessed via /lo/{slug} (rewritten to author_name query)
// WordPress automatically loads author data
$author = get_queried_object(); // WP_User object

// No API call needed - data is local
```

---

## Implementation Steps

### Step 1: Create UserProfile Helper Class

```php
// includes/Models/UserProfile.php
namespace FRSUsers\Models;

class UserProfile {
    private $user;
    private $user_id;

    public function __construct($user_id_or_email) {
        if (is_numeric($user_id_or_email)) {
            $this->user = get_userdata($user_id_or_email);
        } else {
            $this->user = get_user_by('email', $user_id_or_email);
        }

        if (!$this->user) {
            throw new \Exception('User not found');
        }

        $this->user_id = $this->user->ID;
    }

    // Core WP fields
    public function get_first_name(): string {
        return get_user_meta($this->user_id, 'first_name', true) ?: '';
    }

    public function get_last_name(): string {
        return get_user_meta($this->user_id, 'last_name', true) ?: '';
    }

    public function get_display_name(): string {
        return $this->user->display_name ?: '';
    }

    public function get_email(): string {
        return $this->user->user_email;
    }

    public function get_user_nicename(): string {
        return $this->user->user_nicename;
    }

    // FRS custom fields
    public function get_phone_number(): string {
        return get_user_meta($this->user_id, 'frs_phone_number', true) ?: '';
    }

    public function get_mobile_number(): string {
        return get_user_meta($this->user_id, 'frs_mobile_number', true) ?: '';
    }

    public function get_job_title(): string {
        return get_user_meta($this->user_id, 'frs_job_title', true) ?: 'Loan Officer';
    }

    public function get_nmls(): string {
        return get_user_meta($this->user_id, 'frs_nmls', true) ?: '';
    }

    public function get_biography(): string {
        return get_user_meta($this->user_id, 'frs_biography', true) ?: '';
    }

    public function get_city_state(): string {
        return get_user_meta($this->user_id, 'frs_city_state', true) ?: '';
    }

    public function get_headshot_url(): string {
        $headshot_id = get_user_meta($this->user_id, 'frs_headshot_id', true);
        if ($headshot_id) {
            return wp_get_attachment_url($headshot_id) ?: '';
        }
        return '';
    }

    public function get_qr_code_data(): string {
        return get_user_meta($this->user_id, 'frs_qr_code_data', true) ?: '';
    }

    public function get_arrive_url(): string {
        return get_user_meta($this->user_id, 'frs_arrive', true) ?: '';
    }

    // Social media
    public function get_facebook_url(): string {
        return get_user_meta($this->user_id, 'frs_facebook_url', true) ?: '';
    }

    public function get_instagram_url(): string {
        return get_user_meta($this->user_id, 'frs_instagram_url', true) ?: '';
    }

    public function get_linkedin_url(): string {
        return get_user_meta($this->user_id, 'frs_linkedin_url', true) ?: '';
    }

    public function get_twitter_url(): string {
        return get_user_meta($this->user_id, 'frs_twitter_url', true) ?: '';
    }

    public function get_website(): string {
        return $this->user->user_url ?: get_user_meta($this->user_id, 'frs_website', true) ?: '';
    }

    // Arrays (JSON fields)
    public function get_specialties_lo(): array {
        $json = get_user_meta($this->user_id, 'frs_specialties_lo', true);
        return $json ? json_decode($json, true) : [];
    }

    public function get_namb_certifications(): array {
        $json = get_user_meta($this->user_id, 'frs_namb_certifications', true);
        return $json ? json_decode($json, true) : [];
    }

    public function get_service_areas(): array {
        $json = get_user_meta($this->user_id, 'frs_service_areas', true);
        return $json ? json_decode($json, true) : [];
    }

    public function get_custom_links(): array {
        $json = get_user_meta($this->user_id, 'frs_custom_links', true);
        return $json ? json_decode($json, true) : [];
    }

    // Get initials
    public function get_initials(): string {
        $first = $this->get_first_name();
        $last = $this->get_last_name();
        return strtoupper(substr($first, 0, 1) . substr($last, 0, 1));
    }

    // Get full name
    public function get_full_name(): string {
        return trim($this->get_first_name() . ' ' . $this->get_last_name());
    }
}
```

### Step 2: Adapt Template Header

**BEFORE**:
```php
// Profile data
$first_name = $profile['first_name'] ?? '';
$last_name = $profile['last_name'] ?? '';
$full_name = trim($first_name . ' ' . $last_name);
// ... etc
```

**AFTER**:
```php
// Get WordPress author
$author = get_queried_object(); // WP_User object

// Initialize UserProfile helper
$user_profile = new \FRSUsers\Models\UserProfile($author->ID);

// Extract profile data
$first_name = $user_profile->get_first_name();
$last_name = $user_profile->get_last_name();
$full_name = $user_profile->get_full_name();
$initials = $user_profile->get_initials();
$job_title = $user_profile->get_job_title();
$nmls = $user_profile->get_nmls();
$email = $user_profile->get_email();
$phone = $user_profile->get_phone_number();
$location = $user_profile->get_city_state();
$bio = $user_profile->get_biography();
$headshot_url = $user_profile->get_headshot_url();
$qr_code_data = $user_profile->get_qr_code_data();
$apply_url = $user_profile->get_arrive_url();

// Social links
$website = $user_profile->get_website();
$facebook = $user_profile->get_facebook_url();
$instagram = $user_profile->get_instagram_url();
$linkedin = $user_profile->get_linkedin_url();
$twitter = $user_profile->get_twitter_url();

// Arrays
$specialties = $user_profile->get_specialties_lo();
$certifications = $user_profile->get_namb_certifications();
$service_areas = $user_profile->get_service_areas();
$custom_links = $user_profile->get_custom_links();

// Video URL (keep as-is, no change needed)
$video_url = defined('FRS_USERS_URL') ? FRS_USERS_URL . 'assets/images/Blue-Dark-Blue-Gradient-Color-and-Style-Video-Background-1.mp4' : '';

// State mapping (keep as-is, no change needed)
$abbr_to_slug = [ /* ... */ ];
$state_map = [ /* ... */ ];
$state_svg_base = content_url('/plugins/frs-lrg/assets/images/states/');
```

### Step 3: Test Template Isolation

Create a standalone test file to verify the adaptation works:

```php
// test-user-profile-template.php
<?php
require_once '../../../wp-load.php';

// Get a test user (loan officer)
$test_user = get_user_by('email', 'test-loan-officer@example.com');

if (!$test_user) {
    die('Test user not found. Create a user with loan_officer role first.');
}

// Simulate author page query
global $wp_query;
$wp_query->queried_object = $test_user;
$wp_query->queried_object_id = $test_user->ID;
$wp_query->is_author = true;
$wp_query->is_archive = true;

// Load adapted template
include 'templates/profile-loan_officer.php';
```

---

## Backwards Compatibility

### URL Redirects

Add 301 redirects from old URLs to new masked author URLs:

```php
// Core/Template.php
public function redirect_legacy_urls() {
    // Redirect /profile/{slug} → /lo/{slug}
    if (get_query_var('frs_profile_legacy')) {
        $slug = get_query_var('frs_profile_legacy');
        $user = get_user_by('slug', $slug);

        if ($user && in_array('loan_officer', $user->roles)) {
            wp_redirect(home_url("/lo/{$slug}"), 301);
            exit;
        }
    }

    // Redirect /directory/lo/{slug} → /lo/{slug}
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('#^/directory/lo/([^/]+)#', $request_uri, $matches)) {
        $slug = $matches[1];
        wp_redirect(home_url("/lo/{$slug}"), 301);
        exit;
    }
}
```

---

## Testing Checklist

- [ ] UserProfile class loads all fields correctly
- [ ] Template displays profile header (name, title, NMLS)
- [ ] Avatar/QR flip works
- [ ] Contact buttons function
- [ ] Service areas display with state SVGs
- [ ] Biography displays
- [ ] Specialties and certifications display
- [ ] Social media links work
- [ ] Contact form modal functions
- [ ] vCard download works
- [ ] Published posts section displays (NEW)
- [ ] URL masking works (/lo/{slug} instead of /author/{slug})
- [ ] Legacy URL redirects work (301 redirects)
- [ ] SEO meta tags correct
- [ ] Mobile responsive

---

## File Structure After Adaptation

```
frs-wp-users/
├── includes/
│   ├── Models/
│   │   └── UserProfile.php (NEW - helper class)
│   └── Core/
│       └── Template.php (UPDATED - URL masking + redirects)
├── templates/
│   ├── profile-loan_officer.php (ADAPTED from lo-profile.php)
│   ├── profile-realtor_partner.php (CREATE - copy and adapt)
│   ├── profile-staff.php (CREATE - copy and adapt)
│   ├── profile-leadership.php (CREATE - copy and adapt)
│   └── partials/ (EXTRACT from adapted template)
│       ├── profile-header.php
│       ├── profile-bio.php
│       ├── profile-specialties.php
│       ├── profile-social.php
│       ├── profile-contact-form.php
│       └── profile-posts.php (NEW)
└── assets/
    └── css/
        └── profile.css (MOVE from frs-profile-directory)
```

---

## Next Steps

1. ✅ Create UserProfile helper class
2. ✅ Copy lo-profile.php → profile-loan_officer.php
3. ✅ Replace all `$profile[...]` references with `$user_profile->get_*()`
4. ✅ Add published posts section
5. ✅ Implement URL masking filter
6. ✅ Add legacy URL redirects
7. ✅ Test on staging with real user data
8. ✅ Copy CSS/JS assets from frs-profile-directory
9. ✅ Create templates for other roles (agent, staff, leader)
10. ✅ Deploy to production
