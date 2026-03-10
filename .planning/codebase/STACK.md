# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**
- PHP 8.0+ - Backend plugin logic, REST API, models, templates
- JavaScript (ES6+/JSX) - Admin React UI, Gutenberg blocks, Interactivity API

**Secondary:**
- SCSS - Admin styling (`assets/admin/src/style.scss`, `assets/admin/src/profile-edit.scss`)
- CSS - Frontend styles (`assets/css/frankenstyle-kit.min.css`)

## Runtime

**Environment:**
- WordPress 6.4+ (uses DataViews API, Interactivity API, Block Patterns)
- PHP 8.0+ (typed properties, union types, arrow functions used throughout)
- Node.js - Required for QR code generation (`scripts/generate-qr.js`), admin/block builds

**Package Manager:**
- Composer (PHP) - Lockfile present: `composer.lock`
- npm (JavaScript) - Three separate package.json locations:
  - Root: `package.json` (frankenstyle dependency only)
  - Admin: `assets/admin/package.json` (React admin interface)
  - Blocks: `assets/blocks/package.json` (Gutenberg blocks)
  - Scripts: `scripts/package.json` (QR code generation)
  - Worker: `workers/media-cdn/package.json` (Cloudflare Worker)

## Frameworks

**Core:**
- WordPress Plugin API - Hooks, filters, REST API, WP_User, usermeta
- React (via @wordpress/element) - Admin DataViews interface
- WordPress Interactivity API - Frontend directory/profile interactions (`view.js`)

**Testing:**
- PHPUnit 9.6 - Unit and integration tests
- Brain\Monkey 2.6 - WordPress function mocking for unit tests
- Mockery 1.6 - PHP mocking library
- Yoast PHPUnit Polyfills 2.0 - Cross-version compatibility

**Build/Dev:**
- @wordpress/scripts 27.0 - Build tooling for admin and blocks
- webpack (via wp-scripts) - Custom config at `assets/blocks/webpack.config.js`
- PHPCS 3.7 + WPCS 3.0 - PHP code style enforcement
- PHPCompatibility-WP 2.1 - PHP version compatibility checks

## Key Dependencies

**Critical (PHP - composer.json require-dev only, no runtime deps):**
- Plugin uses no external PHP runtime dependencies
- All functionality built on WordPress core APIs

**Critical (JS - assets/admin/package.json):**
- `@wordpress/api-fetch` ^7.0.0 - REST API communication
- `@wordpress/components` ^28.0.0 - UI components
- `@wordpress/dataviews` ^4.0.0 - DataViews-based admin list
- `@wordpress/block-editor` ^14.0.0 - Block editor for post composer
- `@wordpress/element` ^6.0.0 - React abstraction
- `@wordpress/i18n` ^5.0.0 - Internationalization

**Infrastructure:**
- `frankenstyle` ^0.3.0 - CSS framework (root package.json)
- Cloudflare Workers/R2 - Media CDN (`workers/media-cdn/`)

## Configuration

**Environment:**
- `FRS_SITE_CONTEXT` constant in wp-config.php - Controls which roles/features are active
- `FRS_TWENTY_CRM_URL` constant - Twenty CRM API URL (default: `https://data.c21frs.com`)
- `FRS_TWENTY_CRM_API_KEY` constant - Twenty CRM API key (hardcoded default in `frs-wp-users.php`)
- `frs_webhook_secret` option - HMAC signing key for webhook auth
- `frs_hub_url` option - Hub site URL for sync
- `frs_r2_cdn_url` option - Cloudflare R2 CDN URL (default: `https://media.myhub21.com`)
- `frs_r2_api_key` option - R2 Worker API key
- `frs_r2_enabled` option - Toggle R2 CDN
- `.env` files: Not present (configuration via wp-config.php constants and wp_options)

**Build:**
- `assets/admin/package.json` - Build with `npm run build` (wp-scripts, multiple entry points)
- `assets/blocks/package.json` - Build with `npm run build` (wp-scripts with experimental modules)
- `composer.json` - PHP autoloading (PSR-4: `FRSUsers\` → `includes/`)

## Platform Requirements

**Development:**
- WordPress 6.4+ with Local by Flywheel or similar
- PHP 8.0+
- Node.js (for admin UI builds and QR code generation)
- Composer (for dev dependencies: PHPCS, PHPUnit)

**Production:**
- WordPress multisite or single-site
- PHP 8.0+
- Cloudflare R2 + Worker (optional, for CDN headshot delivery)
- Twenty CRM instance (optional, for remote profile data on marketing sites)

---

*Stack analysis: 2026-03-09*
