# Claude Code Instructions for FRS WP Users Plugin

## Critical Rules - READ FIRST

### 1. ALWAYS Check Existing Code Before Creating New Files
- **NEVER** create new files without first checking if they already exist
- **ALWAYS** use Read, Grep, or Glob tools to search for existing implementations
- If similar functionality exists elsewhere in the codebase, reuse or adapt it
- Example: Before creating ProfileEdit.php, check if ProfilesPage.php or similar admin files exist

### 2. Complete Features Before Declaring "Done"
A feature is NOT complete until ALL of the following are true:
- ✅ Backend database/model code works
- ✅ Frontend UI exists and is accessible to users
- ✅ All CRUD operations (Create, Read, Update, Delete) work
- ✅ All fields from the database are visible and editable in the UI
- ✅ User can actually perform the task without command line or code knowledge

**Example of INCOMPLETE work:**
- ❌ Creating Profile model + migration + CLI commands but NO admin edit page
- ❌ Creating edit page with only 7 fields when database has 45 fields
- ❌ Activating plugin before basic add/edit functionality exists

**Example of COMPLETE work:**
- ✅ Profile model + migration + admin list page + full edit/add forms + all 45 fields visible

### 3. Match All Fields in UI to Database Schema
- When creating edit forms, **ALWAYS** include ALL fields that exist in the database
- Cross-reference with:
  - Database migration files (database/Migrations/)
  - Model files (includes/Models/)
  - Field definition files (includes/Core/ProfileFields.php)
- If database has 45 fields, edit form must have 45 fields
- No excuses, no shortcuts, no "we'll add them later"

### 4. Use Plugin Boilerplate Properly
- This plugin uses a custom WordPress boilerplate structure
- **NEVER** copy entire plugins from other projects (like frs-lrg)
- **ALWAYS** clone clean boilerplate: `git clone https://github.com/derintolu/frs-wp-users.git`
- Only copy specific, relevant files when migrating functionality
- Keep plugin-specific code separate from boilerplate structure

### 5. Don't Migrate Data Without UI
- **NEVER** run database migrations that populate data before edit UI exists
- Users need to be able to view and edit migrated data immediately
- If you migrate 111 profiles with 45 fields each, the edit form must show all 45 fields

**Example of WRONG approach:**
1. Create database tables ✅
2. Migrate 111 profiles ✅
3. Create edit form with 7 fields ❌❌❌

**Example of RIGHT approach:**
1. Create database tables ✅
2. Create full edit/add forms with all fields ✅
3. Test forms work ✅
4. Then migrate data ✅

## Plugin Architecture

### File Structure
```
frs-wp-users/
├── frs-wp-users.php          # Main plugin bootstrap file
├── plugin.php                 # Main plugin class
├── composer.json              # Dependencies (Carbon Fields, etc.)
├── includes/
│   ├── Admin/
│   │   ├── Menu.php          # Admin menu registration
│   │   ├── ProfilesPage.php  # Main profiles admin page
│   │   ├── ProfileEdit.php   # Edit/add form (MUST have ALL fields)
│   │   └── ProfilesList.php  # WP_List_Table for profiles
│   ├── Core/
│   │   ├── ProfileFields.php # Carbon Fields definitions (ALL fields)
│   │   ├── ProfileStorage.php # Storage override for custom table
│   │   ├── CLI.php           # WP-CLI commands
│   │   └── Install.php       # Activation hooks
│   ├── Models/
│   │   ├── Profile.php       # Profile model with queries
│   │   └── Users.php         # User integration
│   └── Routes/
│       └── Api.php           # REST API endpoints
├── database/
│   └── Migrations/
│       ├── Profiles.php      # Create profiles table
│       ├── ProfileTypes.php  # Create profile_types junction
│       └── MigratePersonCPT.php # Migrate old CPT data
└── libs/                      # Utilities

```

### Database Schema

**wp_frs_profiles table** (45 fields):
- Contact: id, first_name, last_name, email, phone_number, mobile_number, office
- Professional: headshot_id, job_title, biography, date_of_birth, select_person_type, nmls, nmls_number, license_number, dre_license, specialties_lo (JSON), specialties, languages (JSON), awards, nar_designations, namb_certifications, brand, status
- Location: city_state, region
- Social: facebook_url, instagram_url, linkedin_url, twitter_url, youtube_url, tiktok_url
- Tools: arrive, canva_folder_link, niche_bio_content, personal_branding_images
- System: user_id, created_at, updated_at

**wp_frs_profile_types table** (junction):
- profile_id, profile_type

### Profile Types (Many-to-Many)
- loan_officer
- realtor_partner
- staff
- leadership
- assistant

### Terminology
- **Profile Only** = Profile without WordPress user account (old term: "Guest")
- **Profile+** = Profile linked to WordPress user account (old term: "Profile with User")
- Use these terms consistently in UI, code comments, and documentation

## Common Tasks

### Adding a New Field
1. Add column to database migration (database/Migrations/Profiles.php)
2. Add field to ProfileFields.php Carbon Fields definition
3. Add field to ProfileEdit.php edit form (in appropriate tab)
4. Add field to save_profile() method with proper sanitization
5. Update Profile model if special handling needed
6. Test create, read, update operations

### Creating Admin Pages
1. Create class in includes/Admin/
2. Extend WP_List_Table for list pages
3. Use WordPress form table markup for edit forms
4. Include nonce verification
5. Register in Menu.php
6. Initialize in plugin.php

### Database Migrations
1. Create migration class in database/Migrations/
2. Implement up() and down() methods
3. Use dbDelta() for table creation
4. Use $wpdb for data operations
5. Register in Install.php
6. Test both up and down migrations

## Code Standards

### WordPress Standards
- Follow WordPress Coding Standards
- Use WordPress functions (sanitize_text_field, esc_attr, wp_nonce_field, etc.)
- Use $wpdb for database operations
- Escape all output
- Sanitize all input

### PHP Standards
- PHP 8.1+ features (typed properties, readonly, constructor promotion)
- Use strict types: `declare(strict_types=1);`
- Proper namespacing: `namespace FRSUsers\Admin;`
- PSR-4 autoloading

### Security
- ✅ Always verify nonces for form submissions
- ✅ Check user capabilities (current_user_can)
- ✅ Use prepared statements for database queries
- ✅ Sanitize input, escape output
- ✅ Validate and sanitize $_POST, $_GET data

## Testing Checklist

Before declaring a feature "done", verify:
- [ ] Database tables exist and have correct schema
- [ ] Admin menu item appears and is clickable
- [ ] List page shows data correctly
- [ ] Add new form is accessible
- [ ] Add new form has ALL required fields
- [ ] Add new form saves data correctly
- [ ] Edit form is accessible from list page
- [ ] Edit form shows ALL existing data (not just 7 out of 45 fields)
- [ ] Edit form saves changes correctly
- [ ] Delete functionality works
- [ ] No PHP errors or warnings
- [ ] JavaScript console has no errors
- [ ] All user-facing text is translatable

## Previous Mistakes to NEVER Repeat

### Mistake #1: Copying Entire Plugin
**What happened:** Copied entire frs-lrg plugin including all LRG-specific code
**Why it was wrong:** Brought in irrelevant code, wrong namespace, wrong functionality
**Correct approach:** Clone clean boilerplate, only copy specific needed files

### Mistake #2: Incomplete Edit Form
**What happened:** Created ProfileEdit.php with only 7 fields when database had 45 fields
**Why it was wrong:** Made migrated data invisible and uneditable, wasted migration work
**Correct approach:** Always match UI fields to database schema exactly

### Mistake #3: Declaring Plugin "Functional" Prematurely
**What happened:** Activated plugin before edit/add functionality existed
**Why it was wrong:** Users couldn't actually use the plugin for its core purpose
**Correct approach:** Plugin is functional when users can complete all intended tasks via UI

### Mistake #4: Migrating Before UI Ready
**What happened:** Migrated 111 profiles before edit forms existed
**Why it was wrong:** Data was in database but no way to view or edit it
**Correct approach:** Build complete UI first, then migrate data

## Commit Message Format

Use conventional commits:
- `feat: add profile edit form with all 45 fields`
- `fix: correct profile type saving in edit form`
- `refactor: reorganize ProfileEdit into tabbed interface`
- `docs: add CLAUDE.md with development guidelines`
- `perf: optimize profile queries with proper indexing`
- `security: add nonce verification to profile deletion`

## Resources

- WordPress Coding Standards: https://developer.wordpress.org/coding-standards/
- Carbon Fields Documentation: https://carbonfields.net/
- WP-CLI Documentation: https://wp-cli.org/
- Plugin Boilerplate: https://github.com/derintolu/frs-wp-users
