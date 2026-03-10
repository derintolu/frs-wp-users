# External Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

**Twenty CRM (Primary CRM):**
- Purpose: Bidirectional sync of professional profiles, source of truth for marketing sites
- SDK/Client: Custom GraphQL client in `includes/RemoteData/TwentyDataSource.php`
- Sync handler: `includes/Integrations/TwentyCRMSync.php`
- REST routes: `includes/Routes/TwentyCRMApi.php`
- Admin settings: `includes/Admin/TwentyCRMSettingsPage.php`
- Auth: `FRS_TWENTY_CRM_API_KEY` constant (JWT bearer token)
- API URL: `FRS_TWENTY_CRM_URL` constant (default: `https://data.c21frs.com`)
- GraphQL endpoint: `{api_url}/api`
- Features: Push profile changes to CRM, pull profiles for marketing sites, webhook receiver

**FluentCRM (Email Marketing):**
- Purpose: Real-time contact sync on user create/update/role change
- Handler: `includes/Integrations/FluentCRMSync.php`
- Notifications: `includes/Integrations/FluentCRMNotifications.php`
- Auth: Uses `FluentCrmApi()` PHP function (plugin must be active)
- Hooks: `user_register`, `profile_update`, `set_user_role`, `frs_profile_saved`
- Features: Auto-create contacts, update tags, set lists, admin alerts

**FluentBooking (Calendar/Scheduling):**
- Purpose: OAuth proxy for Outlook calendar integration, auto-host creation
- Handler: `includes/Integrations/FluentBookingSync.php`
- Auth: Proxies through WPO365 Azure AD credentials
- OAuth proxy route: `frs-users/v1/calendar/oauth-proxy`
- Features: Bypasses `fluentbooking.com` OAuth proxy, uses hub's Azure AD app

**Follow Up Boss (Lead CRM):**
- Purpose: Per-agent lead routing and CRM integration
- Handler: `includes/Integrations/FollowUpBoss.php`
- Auth: Per-user API key stored in `frs_followupboss_api_key` user meta
- API URL: `https://api.followupboss.com/v1`
- REST routes: `frs-users/v1/profiles/me/integrations/followupboss`
- Features: Store/validate API keys, send events, status endpoint

**Arrive (Loan Applications):**
- Purpose: Auto-generate loan application URLs from NMLS numbers
- Handler: `includes/Integrations/ArriveAutoPopulate.php`
- URL pattern: `https://21stcenturylending.my1003app.com/{nmls}/register`
- No auth required (URL generation only)

## Data Storage

**Primary Database:**
- WordPress `wp_users` + `wp_usermeta` tables
- All profile data stored as user meta with `frs_` prefix
- No custom profiles table (migrated to WordPress-native storage)

**Custom Tables:**
- `wp_frs_user_tasks` - Admin-assigned tasks and profile completion checklist
  - Created by: `includes/Core/UserTasks.php::maybe_create_table()`
- `wp_frs_activity_log` - Append-only activity log for user events
  - Created by: `includes/Models/ActivityLog.php::maybe_create_table()`
  - Migration triggered at db_version `3.2.0` in `plugin.php::maybe_run_migrations()`

**File Storage:**
- Cloudflare R2 via Worker endpoint at `media.myhub21.com`
  - Handler: `includes/Core/R2Storage.php`
  - Worker source: `workers/media-cdn/`
  - Used for: Headshot images (CDN delivery across sites)
  - Config: `frs_r2_cdn_url`, `frs_r2_api_key`, `frs_r2_enabled` options
- WordPress Media Library (local fallback)
  - Avatar/headshot management: `includes/Core/Avatar.php`

**Caching:**
- WordPress transients for remote profile data (Twenty CRM)
  - Cache TTL: `frs_remote_cache_ttl` option (default: 3600 seconds)
  - Transient locks for concurrent image downloads: `frs_img_sync_{hash}`

## Authentication & Identity

**Auth Provider:**
- WPO365 (Microsoft Azure AD SSO) - External plugin, NOT managed by FRS
- WordPress native authentication for REST API
- HMAC-SHA256 signature verification for webhook endpoints

**REST API Auth:**
- Public endpoints: `__return_true` permission callback
  - GET `/profiles/slug/{slug}`
  - GET `/service-areas`
  - GET `/vcard/{id}`
  - POST `/meeting-request`
- Editor-level endpoints: `current_user_can('edit_users')`
  - POST/PUT/DELETE on `/profiles`
  - Webhook management
- Authenticated endpoints: `is_user_logged_in()`
  - GET/PUT `/profiles/me/settings`
  - Activity feed
- Webhook auth: HMAC-SHA256 via `X-FRS-Signature` header
  - Secret stored in `frs_webhook_secret` option

## Monitoring & Observability

**Error Tracking:**
- `error_log()` calls throughout (standard WordPress error logging)
- Format: `[FRS Sync]`, `[FRS Users]` prefixes in log messages

**Logs:**
- `frs_activity_log` custom table for user-facing activity feed
- WordPress error log for system errors
- No structured logging or external log aggregation

## CI/CD & Deployment

**Hosting:**
- WordPress on Local by Flywheel (development)
- Production deployment target not specified in codebase

**CI Pipeline:**
- No CI configuration files found (no `.github/workflows/`, no `.gitlab-ci.yml`)

## Environment Configuration

**Required constants (wp-config.php):**
- `FRS_SITE_CONTEXT` - Site context (`development`, `hub`, `21stcenturylending`, `c21masters`)

**Optional constants:**
- `FRS_TWENTY_CRM_URL` - Twenty CRM URL (has default)
- `FRS_TWENTY_CRM_API_KEY` - Twenty CRM API key (has hardcoded default)

**wp_options used:**
- `frs_webhook_secret` - HMAC secret for webhook verification
- `frs_hub_url` - Hub site URL for pull-sync
- `frs_webhook_endpoints` - Array of webhook endpoint URLs
- `frs_r2_cdn_url`, `frs_r2_api_key`, `frs_r2_enabled` - R2 CDN config
- `frs_twenty_crm_enabled` - Toggle Twenty CRM sync
- `frs_twenty_crm_sync_roles` - Which roles to sync to Twenty CRM
- `frs_users_db_version` - Database migration version tracking
- `frs_users_version` - Plugin version for rewrite rule flushing
- `frs_users_webhooks` - Global webhook registrations (separate from sync webhooks)
- `frs_site_context` - Admin-configurable context (lower precedence than constant)
- `frs_remote_cache_ttl` - Cache TTL for remote profile data

## Webhooks & Callbacks

**Incoming:**
- `POST /wp-json/frs-users/v1/webhook/profile-updated` - Receives profile sync from hub
  - Auth: HMAC-SHA256 signature verification
  - Handler: `includes/Core/ProfileSync.php::handle_webhook()`
  - Events: `profile_updated`, `profile_deleted`
- Twenty CRM webhook receiver (via `TwentyCRMSync::register_webhook_endpoint()`)

**Outgoing:**
- Hub → Marketing sites: Profile update webhooks on `frs_profile_saved` and `profile_update`
  - Handler: `includes/Core/ProfileSync.php::send_profile_webhook()`
  - Endpoints stored in `frs_webhook_endpoints` option
- Global webhooks: `profile.created`, `profile.updated`, `profile.deleted`, `arrive.generated`
  - Handler: `includes/Core/ProfileApi.php::trigger_global_webhooks()`
  - Endpoints stored in `frs_users_webhooks` option
- Twenty CRM: Profile data pushed on save
  - Handler: `includes/Integrations/TwentyCRMSync.php::sync_to_twenty()`
- FluentCRM: Contact sync on user events (internal PHP API, no HTTP)

## Plugin Dependencies

**Required:**
- None (all integrations degrade gracefully)

**Optional (enhance functionality):**
- FluentCRM - Contact sync (`FluentCrmApi()` function check)
- FluentBooking - Calendar integration
- WPO365 - Azure AD credentials for FluentBooking OAuth proxy
- Simple Local Avatars - Legacy avatar support (migrated to native system)

---

*Integration audit: 2026-03-09*
