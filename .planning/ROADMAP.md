# FRS User Profiles - Roadmap

## Milestone 1: Avatar & Directory Stabilization

### Phase 01: Fix Avatar Sync & Broken Methods
**Goal:** All avatar reads/writes work correctly across hub and marketing sites, no fatal errors from dead method calls.
**Requirements:** [AVATAR-01, AVATAR-02, AVATAR-03, AVATAR-04]
**Plans:** 1 plan

Plans:
- [ ] 01-01-PLAN.md -- Fix broken Avatar method calls, cross-site sync, and dead code cleanup

### Phase 02: Fix Directory Block Rendering & QR Popup
**Goal:** Directory grid block uses Interactivity API correctly -- QR popup works after search/filter/load-more, no manual DOM manipulation.
**Requirements:** [DIR-01, DIR-02]
**Plans:** 1 plan

Plans:
- [ ] 02-01-PLAN.md -- Rewrite grid rendering to use Interactivity API directives instead of innerHTML

---

## Requirements

### Avatar
- **AVATAR-01**: `Avatar::set_avatar()` calls in CLI.php and CsvImportExport.php must not fatal error
- **AVATAR-02**: Cross-site webhook sync must not set hub-side attachment IDs on marketing sites (use headshot_url download path)
- **AVATAR-03**: `ProfileApi::get_profiles()` must not call non-existent `Profile::query()` 
- **AVATAR-04**: Dead `R2Storage::filter_avatar_data()` and legacy `frs_headshot_url` references cleaned up

### Directory Block
- **DIR-01**: QR popup must work on all cards including after search, filter, and load-more interactions
- **DIR-02**: Grid rendering must use Interactivity API directives (no innerHTML DOM manipulation)
