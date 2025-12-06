# FRS WP Users - Production Package

Production-ready version of the FRS WP Users plugin with only necessary files.

## ✅ What's Included

### Directories:
- **`assets/`** - Built frontend JavaScript and CSS
- **`database/`** - Database migration files
- **`includes/`** - Core PHP backend code
- **`libs/`** - PHP utility libraries
- **`vendor/`** - Composer dependencies
- **`views/`** - PHP template files
- **`config/`** - Configuration files

### Files:
- **`plugin.php`** - Main plugin entry point
- **`frs-wp-users.php`** - Plugin loader
- **`composer.json`** - PHP dependency manifest
- **`uninstall.php`** - Cleanup script

## 🚀 Deployment

Upload the `frs-wp-users/` folder to:
```
server: my.frs.works:222
path: public_html/wp-content/plugins/
```

## ❌ Excluded (Development Only)

- `src/` - React/TypeScript source
- `node_modules/` - NPM dependencies
- `documentation/`, `docs/` - Dev documentation
- `.git/`, `.github/` - Git files
- Build configs and dev tools

---

Generated: December 5, 2025
