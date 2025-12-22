# Weekend Sprint: BuddyPress Intranet Integration

**Timeline:** 48 hours (Saturday-Sunday)
**Goal:** Launch a functional intranet with core social features
**Approach:** Use BuddyBoss Platform for speed, minimal custom coding

---

## 🎯 Weekend MVP Scope

### What We're Building:

✅ **Saturday:**
- Activity feed / company newsfeed
- User profiles (leverage existing frs-wp-users)
- Private messaging
- Basic groups/departments

✅ **Sunday:**
- Notifications
- File sharing in groups
- Polish & launch

### What We're NOT Building (Yet):

❌ Custom React UI (use BuddyBoss default UI initially)
❌ Custom integrations beyond basic sync
❌ Advanced search
❌ Analytics
❌ Mobile app

**Strategy:** Get it working with BuddyBoss default UI this weekend, then progressively enhance with React later.

---

## 🛠️ Technology Decision for Weekend Sprint

**Use BuddyBoss Platform ($228/year)** instead of free BuddyPress

**Why:**
- ✅ Polished UI out of the box (no theme work needed)
- ✅ All features pre-configured
- ✅ Document management included
- ✅ Saves ~80% of weekend time
- ✅ Can always customize later

**Cost:** $228 for single site license = worth it to save 30+ hours of work

---

## ⏰ Hour-by-Hour Schedule

### Saturday (8 hours)

#### Morning (9am-12pm) - 3 hours
**Goal:** Installation & Basic Setup

**Hour 1: Purchase & Install (9am-10am)**
- [ ] Purchase BuddyBoss Platform license
- [ ] Download BuddyBoss Platform + Theme
- [ ] Install on staging site
- [ ] Activate BuddyBoss Platform plugin
- [ ] Activate BuddyBoss Theme

**Hour 2: Core Configuration (10am-11am)**
- [ ] Run BuddyBoss Setup Wizard
- [ ] Enable components:
  - ✅ Activity Feeds
  - ✅ Private Messaging
  - ✅ User Groups
  - ✅ Notifications
  - ✅ Media (photos/videos)
  - ✅ Document Uploads
  - ❌ Disable: Xprofile, Forums (for now)
- [ ] Configure privacy settings (private network)
- [ ] Set up email notifications

**Hour 3: User Sync (11am-12pm)**
- [ ] Create WordPress users for all guest profiles
- [ ] Write quick sync script
- [ ] Test user linking

#### Lunch Break (12pm-1pm)

#### Afternoon (1pm-5pm) - 4 hours

**Hour 4: Profile Integration (1pm-2pm)**
- [ ] Disable BuddyBoss Profiles (use frs-wp-users instead)
- [ ] Create profile override to redirect to frs-wp-users
- [ ] Add "View Profile" links from activity feed

**Hour 5: Groups Setup (2pm-3pm)**
- [ ] Create department groups:
  - Leadership
  - Loan Officers
  - Real Estate Agents
  - Operations Staff
  - Assistants
- [ ] Configure group settings
- [ ] Auto-assign users to groups based on person_type
- [ ] Enable group documents

**Hour 6: Activity Feed Customization (3pm-4pm)**
- [ ] Configure activity stream settings
- [ ] Set up activity types
- [ ] Test posting updates
- [ ] Configure @mentions

**Hour 7: Testing & Tweaks (4pm-5pm)**
- [ ] Test as different user types
- [ ] Fix any obvious issues
- [ ] Adjust settings as needed

#### Evening (7pm-9pm) - 2 hours

**Hour 8-9: Private Network & Access Control (7pm-9pm)**
- [ ] Configure private network settings
- [ ] Set up member directories
- [ ] Configure what's visible to whom
- [ ] Test permissions

**Saturday Total: 9 hours**

---

### Sunday (7 hours)

#### Morning (9am-12pm) - 3 hours

**Hour 1: Notifications (9am-10am)**
- [ ] Configure notification settings
- [ ] Set up email templates
- [ ] Test notification delivery
- [ ] Configure digest emails

**Hour 2: File Sharing (10am-11am)**
- [ ] Enable document uploads in groups
- [ ] Test file sharing
- [ ] Set file size limits
- [ ] Configure allowed file types

**Hour 3: Quick Wins (11am-12pm)**
- [ ] Add company logo
- [ ] Set up welcome message
- [ ] Create "Getting Started" group
- [ ] Post first company announcement

#### Lunch Break (12pm-1pm)

#### Afternoon (1pm-4pm) - 3 hours

**Hour 4: UI Polish (1pm-2pm)**
- [ ] Customize BuddyBoss theme colors
- [ ] Add company branding
- [ ] Configure navigation menus
- [ ] Set up widgets

**Hour 5: Content Seeding (2pm-3pm)**
- [ ] Create sample posts
- [ ] Set up initial groups
- [ ] Add welcome content
- [ ] Create user guide (quick)

**Hour 6: User Testing (3pm-4pm)**
- [ ] Test all core workflows:
  - [ ] Posting updates
  - [ ] Sending messages
  - [ ] Joining groups
  - [ ] Uploading files
  - [ ] Receiving notifications
- [ ] Fix critical bugs

#### Evening (6pm-7pm) - 1 hour

**Hour 7: Launch Prep (6pm-7pm)**
- [ ] Create user announcement email
- [ ] Set up help resources
- [ ] Schedule training session
- [ ] Go live!

**Sunday Total: 7 hours**

---

## 🚀 Implementation Code

### 1. Quick Install Script

```bash
#!/bin/bash
# run-weekend-sprint.sh

echo "🚀 Starting BuddyBoss Weekend Sprint Setup"

# Backup first!
echo "📦 Creating backup..."
wp db export backup-pre-buddyboss.sql

# Install BuddyBoss Platform
echo "📥 Installing BuddyBoss Platform..."
# (You'll need to manually upload the zip from BuddyBoss.com)
wp plugin install /path/to/buddyboss-platform.zip --activate

# Install BuddyBoss Theme
echo "🎨 Installing BuddyBoss Theme..."
wp theme install /path/to/buddyboss-theme.zip --activate

# Create users for guest profiles
echo "👥 Creating WordPress users for guest profiles..."
wp frs-users bulk-create-users

# Configure BuddyBoss components
echo "⚙️ Configuring components..."
wp bp component activate activity
wp bp component activate messages
wp bp component activate groups
wp bp component activate notifications
wp bp component deactivate xprofile

# Flush rewrite rules
wp rewrite flush

echo "✅ Basic installation complete!"
echo "👉 Next: Visit /wp-admin/ and run BuddyBoss Setup Wizard"
```

### 2. User Sync Integration

**File:** `includes/Integrations/BuddyBossSync.php`

```php
<?php
namespace FRSUsers\Integrations;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

/**
 * Quick BuddyBoss Sync for Weekend Sprint
 */
class BuddyBossSync {
    use Base;

    public function init() {
        // Redirect BP profiles to frs-wp-users
        add_filter('bp_core_get_user_domain', [$this, 'override_profile_url'], 10, 4);

        // Auto-assign groups based on person_type
        add_action('frs_users_profile_updated', [$this, 'auto_assign_groups'], 10, 2);

        // Sync display name
        add_action('frs_users_profile_updated', [$this, 'sync_display_name'], 10, 2);
    }

    /**
     * Override BuddyBoss profile URLs to use frs-wp-users
     */
    public function override_profile_url($domain, $user_id, $user_nicename, $user_login) {
        $profile = Profile::where('user_id', $user_id)->first();
        if ($profile && $profile->slug) {
            return home_url('/profile/' . $profile->slug . '/');
        }
        return $domain;
    }

    /**
     * Auto-assign users to groups based on person_type
     */
    public function auto_assign_groups($profile_id, $profile_data) {
        if (!function_exists('groups_join_group')) {
            return;
        }

        $profile = Profile::find($profile_id);
        if (!$profile || !$profile->user_id) {
            return;
        }

        // Map person types to group IDs (you'll set these up)
        $group_mapping = [
            'loan_officer' => get_option('frs_group_id_loan_officers'),
            'agent' => get_option('frs_group_id_agents'),
            'staff' => get_option('frs_group_id_staff'),
            'leadership' => get_option('frs_group_id_leadership'),
            'assistant' => get_option('frs_group_id_assistants'),
        ];

        $group_id = $group_mapping[$profile->select_person_type] ?? null;
        if ($group_id && !groups_is_user_member($profile->user_id, $group_id)) {
            groups_join_group($group_id, $profile->user_id);
        }
    }

    /**
     * Sync display name to BuddyBoss
     */
    public function sync_display_name($profile_id, $profile_data) {
        $profile = Profile::find($profile_id);
        if ($profile && $profile->user_id) {
            wp_update_user([
                'ID' => $profile->user_id,
                'display_name' => $profile->display_name ?: trim($profile->first_name . ' ' . $profile->last_name),
            ]);
        }
    }
}
```

**Activate it in `plugin.php`:**

```php
// In FRSUsers::init()
if (class_exists('BuddyPress') || function_exists('buddypress')) {
    \FRSUsers\Integrations\BuddyBossSync::get_instance()->init();
}
```

### 3. Bulk Create Users (WP-CLI Command)

**File:** `includes/Core/CLI.php` (add this method)

```php
/**
 * Create WordPress users for all guest profiles
 *
 * ## OPTIONS
 *
 * [--dry-run]
 * : Don't actually create users, just show what would happen
 *
 * [--send-email]
 * : Send password reset emails to new users
 *
 * ## EXAMPLES
 *
 *     wp frs-users bulk-create-users
 *     wp frs-users bulk-create-users --dry-run
 *     wp frs-users bulk-create-users --send-email
 */
public static function bulk_create_users($args, $assoc_args) {
    $dry_run = isset($assoc_args['dry-run']);
    $send_email = isset($assoc_args['send-email']);

    // Get all profiles without user_id
    $guest_profiles = Profile::whereNull('user_id')->get();

    WP_CLI::line(sprintf('Found %d guest profiles', count($guest_profiles)));

    $created = 0;
    $skipped = 0;
    $errors = 0;

    foreach ($guest_profiles as $profile) {
        if (!$profile->email) {
            WP_CLI::warning(sprintf('Profile #%d has no email, skipping', $profile->id));
            $skipped++;
            continue;
        }

        // Check if email already exists
        if (email_exists($profile->email)) {
            WP_CLI::warning(sprintf('User with email %s already exists', $profile->email));
            $skipped++;
            continue;
        }

        if ($dry_run) {
            WP_CLI::line(sprintf(
                'Would create user: %s (%s)',
                $profile->email,
                $profile->display_name ?: $profile->first_name . ' ' . $profile->last_name
            ));
            continue;
        }

        // Create user
        $username = sanitize_user(
            strtolower(str_replace(' ', '', $profile->first_name . $profile->last_name))
        );

        // Make username unique
        $base_username = $username;
        $counter = 1;
        while (username_exists($username)) {
            $username = $base_username . $counter;
            $counter++;
        }

        $user_id = wp_create_user(
            $username,
            wp_generate_password(20),
            $profile->email
        );

        if (is_wp_error($user_id)) {
            WP_CLI::error(sprintf(
                'Failed to create user for %s: %s',
                $profile->email,
                $user_id->get_error_message()
            ));
            $errors++;
            continue;
        }

        // Update profile with user_id
        $profile->user_id = $user_id;
        $profile->save();

        // Update user meta
        wp_update_user([
            'ID' => $user_id,
            'display_name' => $profile->display_name ?: trim($profile->first_name . ' ' . $profile->last_name),
            'first_name' => $profile->first_name,
            'last_name' => $profile->last_name,
        ]);

        // Send password reset email
        if ($send_email) {
            wp_send_new_user_notifications($user_id, 'user');
        }

        WP_CLI::success(sprintf(
            'Created user #%d (%s) for profile #%d',
            $user_id,
            $username,
            $profile->id
        ));
        $created++;
    }

    WP_CLI::success(sprintf(
        'Complete! Created: %d, Skipped: %d, Errors: %d',
        $created,
        $skipped,
        $errors
    ));
}
```

### 4. Quick Group Setup Script

```php
<?php
/**
 * Quick script to create department groups
 * Run once via: wp eval-file create-groups.php
 */

if (!function_exists('groups_create_group')) {
    die('BuddyBoss not installed');
}

$departments = [
    'Leadership' => [
        'description' => 'Company leadership and executives',
        'person_type' => 'leadership',
        'status' => 'private',
    ],
    'Loan Officers' => [
        'description' => 'All loan officers',
        'person_type' => 'loan_officer',
        'status' => 'private',
    ],
    'Real Estate Agents' => [
        'description' => 'Partner real estate agents',
        'person_type' => 'agent',
        'status' => 'private',
    ],
    'Operations Staff' => [
        'description' => 'Operations and support staff',
        'person_type' => 'staff',
        'status' => 'private',
    ],
    'Assistants' => [
        'description' => 'Administrative assistants',
        'person_type' => 'assistant',
        'status' => 'private',
    ],
];

foreach ($departments as $name => $config) {
    // Check if group exists
    $existing = groups_get_id($name);
    if ($existing) {
        echo "Group '$name' already exists (ID: $existing)\n";
        continue;
    }

    // Create group
    $group_id = groups_create_group([
        'name' => $name,
        'description' => $config['description'],
        'status' => $config['status'],
        'enable_forum' => 0,
        'date_created' => bp_core_current_time(),
    ]);

    if ($group_id) {
        echo "✓ Created group: $name (ID: $group_id)\n";

        // Save mapping
        update_option('frs_group_id_' . $config['person_type'], $group_id);

        // Enable group documents
        groups_update_groupmeta($group_id, 'bp_docs_enable', 1);

    } else {
        echo "✗ Failed to create group: $name\n";
    }
}

echo "\nDone! Now run: wp eval-file assign-users-to-groups.php\n";
```

### 5. Auto-Assign Users to Groups

```php
<?php
/**
 * Assign all users to their department groups
 * Run via: wp eval-file assign-users-to-groups.php
 */

require_once __DIR__ . '/vendor/autoload.php';

use FRSUsers\Models\Profile;

$group_mapping = [
    'loan_officer' => get_option('frs_group_id_loan_officer'),
    'agent' => get_option('frs_group_id_agent'),
    'staff' => get_option('frs_group_id_staff'),
    'leadership' => get_option('frs_group_id_leadership'),
    'assistant' => get_option('frs_group_id_assistant'),
];

$profiles = Profile::whereNotNull('user_id')->get();

foreach ($profiles as $profile) {
    $group_id = $group_mapping[$profile->select_person_type] ?? null;

    if (!$group_id) {
        echo "No group for person type: {$profile->select_person_type}\n";
        continue;
    }

    if (groups_is_user_member($profile->user_id, $group_id)) {
        echo "User {$profile->user_id} already in group {$group_id}\n";
        continue;
    }

    groups_join_group($group_id, $profile->user_id);
    echo "✓ Added {$profile->display_name} to group {$group_id}\n";
}

echo "Done!\n";
```

---

## 📋 Weekend Checklist

### Pre-Weekend Setup (Friday Night - 30 mins)

- [ ] Purchase BuddyBoss Platform license ($228)
- [ ] Download BuddyBoss Platform + Theme
- [ ] Create staging site backup
- [ ] Read BuddyBoss quick start guide
- [ ] Clear your calendar for weekend

### Saturday Morning

- [ ] Install BuddyBoss Platform
- [ ] Install BuddyBoss Theme
- [ ] Run setup wizard
- [ ] Configure components
- [ ] Create WordPress users for guest profiles
- [ ] Disable BuddyBoss profiles

### Saturday Afternoon

- [ ] Create department groups
- [ ] Auto-assign users to groups
- [ ] Configure activity feed
- [ ] Test posting & messaging
- [ ] Set up private network

### Sunday Morning

- [ ] Configure notifications
- [ ] Enable file sharing
- [ ] Add company branding
- [ ] Seed initial content

### Sunday Afternoon

- [ ] Full user testing
- [ ] Fix critical bugs
- [ ] Create user guide
- [ ] Launch announcement
- [ ] GO LIVE! 🚀

---

## ⚡ Quick Wins Configuration

### BuddyBoss Settings to Configure First:

**Settings → BuddyBoss → Components:**
```
✅ Activity Feeds
✅ Private Messaging
✅ User Groups
✅ Notifications
✅ Media
✅ Document Uploads
❌ Profile Fields (using frs-wp-users)
❌ Forums (add later with bbPress)
```

**Settings → BuddyBoss → Pages:**
- Set activity page
- Set members page
- Set groups page
- Set messages page

**Settings → BuddyBoss → Settings:**
- Enable Private Network: Yes
- Require login: Yes
- Hide admin bar for non-admins: No
- Enable @mentions: Yes
- Enable activity comments: Yes

---

## 🎨 Quick Branding (15 minutes)

### Appearance → Customize:

1. **Site Identity**
   - Upload logo
   - Add site icon

2. **Colors**
   - Primary color: Your brand color
   - Body text: #333333
   - Links: Your accent color

3. **Header**
   - Configure navigation
   - Set header style

4. **Activity Feed**
   - Choose layout style
   - Configure what's shown

---

## 🆘 Weekend Troubleshooting

### Issue: "Components not showing"
```bash
wp rewrite flush
wp cache flush
```

### Issue: "Users can't access site"
- Check Settings → BuddyBoss → Settings → Private Network
- Ensure users have WordPress accounts
- Check user roles

### Issue: "Activity feed empty"
- Post a test update as admin
- Check component is activated
- Clear cache

### Issue: "Can't upload files"
```bash
# Check PHP upload limits
wp eval 'echo "upload_max_filesize: " . ini_get("upload_max_filesize") . "\n";'
wp eval 'echo "post_max_size: " . ini_get("post_max_size") . "\n";'
```

---

## 📊 Success Metrics

By Sunday evening, you should have:

✅ **Functional Features:**
- [ ] Users can post updates
- [ ] Users can send private messages
- [ ] Users are in department groups
- [ ] Users can share files in groups
- [ ] Notifications working

✅ **Content:**
- [ ] 5+ department groups created
- [ ] All users assigned to groups
- [ ] Welcome post created
- [ ] Getting started guide posted

✅ **Configuration:**
- [ ] Private network enabled
- [ ] Email notifications configured
- [ ] Branding applied
- [ ] Navigation set up

---

## 🚀 Launch Announcement Email Template

```
Subject: 🎉 Introducing Our New Company Intranet!

Hi Team,

We're excited to announce the launch of our new company intranet powered by [Your Company Name]!

**What's New:**
✅ Company Activity Feed - Stay updated on company news and team activities
✅ Private Messaging - Chat with colleagues instantly
✅ Department Groups - Collaborate with your team
✅ File Sharing - Share documents and resources easily

**Getting Started:**
1. Visit: [your-intranet-url]
2. Log in with your email: [email]
3. Check your email for password setup link
4. Join your department group
5. Post your first update!

**Need Help?**
- Quick Start Guide: [link]
- Video Tutorial: [link]
- Support: [email/slack]

Let's stay connected!

[Your Name]
```

---

## 🔄 Post-Weekend Plan

### Week 1 After Launch:
- Gather user feedback
- Fix critical bugs
- Create more detailed user guides
- Schedule training sessions

### Week 2-4:
- Add more groups as needed
- Configure advanced features
- Integrate with other tools
- Monitor usage & engagement

### Month 2+:
- Start building custom React UI
- Add advanced search
- Implement analytics
- Mobile app (if using BuddyBoss)

---

## 💰 Weekend Budget

**Required:**
- BuddyBoss Platform: $228/year
- Your time: 16 hours
- Coffee: ☕☕☕☕

**Total Financial Cost:** $228 (+ caffeine)

**Time Saved vs Custom Build:** ~300 hours

**ROI:** Massive 👍

---

## 🎯 Realistic Expectations

**What You'll Have Sunday Night:**
- ✅ Working intranet
- ✅ Core social features
- ✅ All users onboarded
- ✅ Basic functionality tested
- ⚠️ Using BuddyBoss default UI (not your React SPA yet)
- ⚠️ Some rough edges to polish

**What Needs More Time:**
- Custom React UI integration (4-6 weeks)
- Advanced features (ongoing)
- Perfect polish (iterative)

**Bottom Line:** You'll have a functional intranet by Sunday night that people can start using Monday morning. Polish and enhance over the following weeks.

---

## 🚨 Critical Success Factor

**The One Thing That Must Work:**

People need to be able to:
1. Log in
2. See the activity feed
3. Post an update
4. Send a message

If these 4 things work, you've succeeded. Everything else is bonus.

---

## Final Pre-Launch Checklist

### Saturday Night Before Bed:
- [ ] All users have WordPress accounts
- [ ] All groups created
- [ ] Users assigned to groups
- [ ] Basic sync working
- [ ] Profile URLs redirecting correctly

### Sunday Before Launch:
- [ ] Full workflow tested as 3 different users
- [ ] No critical errors in logs
- [ ] Email notifications sending
- [ ] Help documentation ready
- [ ] Support plan in place

### Go/No-Go Decision (Sunday 6pm):
- [ ] Can users log in? YES/NO
- [ ] Can users post? YES/NO
- [ ] Can users message? YES/NO
- [ ] Are there critical bugs? YES/NO

**If all YES (except last one NO): LAUNCH! 🚀**
**If any NO: Delay launch, fix Monday**

---

## Let's Do This! 💪

You've got 48 hours to transform frs-wp-users into a full intranet.

**Start Saturday 9am.**
**Launch Sunday 7pm.**

Questions? Let's tackle them as we go!

Ready to start? First step: Purchase BuddyBoss license at buddyboss.com
