# FRS User Profiles - Project Context

## What
WordPress plugin managing professional profiles (loan officers, real estate agents, staff, leadership) across hub + marketing sites with synchronized data.

## Architecture
- **Hub site** (myhub21.com): Source of truth, editing enabled
- **Marketing sites** (21stcenturylending, c21masters): Read-only consumers via webhook sync
- **Storage**: WordPress-native `wp_users` + `wp_usermeta` with `frs_` prefix
- **Avatar system**: `Avatar.php` is single source of truth, hooks `pre_get_avatar_data`
- **Directory**: Interactivity API blocks (`directory-grid`, `directory-search`)

## Current Focus
1. Avatar syncing and universal WordPress avatar integration
2. Directory block feature completeness (QR popup broken)

## Key Coupling Points
- `frs_profile_saved` action: consumed by ProfileSync, FluentCRMSync, TwentyCRMSync, R2Storage, ProfileStorage
- `profile_update` action: consumed by ProfileSync, FluentCRMSync, TwentyCRMSync
- `pre_get_avatar_data` filter: Avatar class hooks here globally
- Avatar meta keys: `frs_headshot_id` (attachment), `frs_headshot_cdn_url` (CDN), legacy `frs_headshot_url` (dead)
