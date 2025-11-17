# Database Schema

## Custom Table: `wp_frs_profiles`

**51 fields total** - When creating view/edit forms, **ALL fields must be shown**.

### Contact Information
- `id` (BIGINT UNSIGNED, AUTO_INCREMENT, PRIMARY KEY)
- `user_id` (BIGINT UNSIGNED, NULL) - Links to wp_users.ID (NULL for guest profiles)
- `frs_agent_id` (VARCHAR 100, NULL) - External system ID
- `email` (VARCHAR 255, NOT NULL, UNIQUE)
- `first_name` (VARCHAR 255)
- `last_name` (VARCHAR 255)
- `display_name` (VARCHAR 255) - Public display name
- `phone_number` (VARCHAR 50)
- `mobile_number` (VARCHAR 50)
- `office` (VARCHAR 255)

### Profile
- `headshot_id` (BIGINT UNSIGNED) - References wp_posts.ID (attachment)
- `job_title` (VARCHAR 255)
- `biography` (TEXT)
- `date_of_birth` (DATE)
- `select_person_type` (VARCHAR 50) - loan_officer|agent|staff|leadership|assistant

### Professional Details
- `nmls` (VARCHAR 50)
- `nmls_number` (VARCHAR 50)
- `license_number` (VARCHAR 50)
- `dre_license` (VARCHAR 50)
- `specialties_lo` (JSON) - Loan officer specialties
- `specialties` (JSON) - Agent specialties
- `languages` (JSON) - Languages spoken
- `awards` (JSON)
- `nar_designations` (JSON) - NAR designations
- `namb_certifications` (JSON) - NAMB certifications
- `brand` (VARCHAR 255)
- `status` (VARCHAR 50, DEFAULT 'active')

### Location
- `city_state` (VARCHAR 255)
- `region` (VARCHAR 255)

### Social Media
- `facebook_url` (VARCHAR 500)
- `instagram_url` (VARCHAR 500)
- `linkedin_url` (VARCHAR 500)
- `twitter_url` (VARCHAR 500)
- `youtube_url` (VARCHAR 500)
- `tiktok_url` (VARCHAR 500)

### Tools & Platforms
- `arrive` (VARCHAR 500) - ARRIVE platform URL
- `canva_folder_link` (VARCHAR 500)
- `niche_bio_content` (LONGTEXT)
- `personal_branding_images` (JSON)

### Additional
- `loan_officer_profile` (BIGINT UNSIGNED)
- `loan_officer_user` (BIGINT UNSIGNED)

### Public Profile Settings
- `profile_slug` (VARCHAR 255, UNIQUE) - URL slug for public profile
- `profile_headline` (TEXT) - Public profile headline
- `profile_visibility` (JSON) - Field visibility settings
- `profile_theme` (VARCHAR 50, DEFAULT 'default') - Profile theme
- `custom_links` (JSON) - Custom links for profile
- `service_areas` (JSON) - Geographic service areas

### Metadata
- `is_active` (BOOLEAN, DEFAULT 1)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, ON UPDATE CURRENT_TIMESTAMP)
- `synced_to_fluentcrm_at` (DATETIME)

### Indexes
- PRIMARY KEY: `id`
- UNIQUE KEY: `email`, `profile_slug`
- KEY: `user_id`, `frs_agent_id`, `is_active`, `created_at`

## Verification

Count database fields to ensure completeness:

```bash
grep -E "^\s+\w+\s+(VARCHAR|TEXT|JSON|BIGINT|DATE|BOOLEAN)" database/Migrations/Profiles.php | wc -l
# Should show 51 fields
```

## Using the Profile Model

See the main CLAUDE.md file for Eloquent ORM examples.
