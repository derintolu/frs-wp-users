# WordPress Plugin Boilerplate - Vite Architecture Analysis

**Analysis Date:** 2025-11-17
**Boilerplate Repository:** https://github.com/prappo/wordpress-plugin-boilerplate
**Current Project:** frs-wp-users

---

## 1. Official Boilerplate Directory Structure

### Source Files (`src/`)

```
src/
├── admin/              # Admin React app source
│   └── main.jsx        # Admin entry point
├── blocks/             # WordPress Gutenberg blocks
│   └── block-1/        # Example block
├── components/         # Shared React components
├── frontend/           # Frontend React app source
│   └── main.jsx        # Frontend entry point
└── lib/                # Utility libraries
```

### Built Assets (`assets/`)

```
assets/
├── admin/
│   └── dist/           # Admin Vite build output
│       ├── assets/     # Compiled JS/CSS files
│       └── manifest.json
├── frontend/
│   └── dist/           # Frontend Vite build output
│       ├── assets/     # Compiled JS/CSS files
│       └── manifest.json
└── blocks/             # WordPress scripts block builds
    └── block-1/
```

---

## 2. Official Boilerplate Vite Configuration

### Admin Config (`vite.admin.config.js`)

```javascript
import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path"

export default {
  plugins: [
    v4wp({
      input: "src/admin/main.jsx",
      outDir: "assets/admin/dist",
    }),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
```

**Key Points:**
- **Entry:** `src/admin/main.jsx`
- **Output:** `assets/admin/dist`
- **Plugin:** `@kucrut/vite-for-wp` handles WordPress-specific bundling
- **React Support:** Enabled via `@vitejs/plugin-react`
- **Path Alias:** `@` maps to `./src` for clean imports

### Frontend Config (`vite.frontend.config.js`)

```javascript
import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path"

export default {
  plugins: [
    v4wp({
      input: "src/frontend/main.jsx",
      outDir: "assets/frontend/dist",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
```

**Key Points:**
- **Entry:** `src/frontend/main.jsx`
- **Output:** `assets/frontend/dist`
- **Identical structure** to admin config with different paths

---

## 3. Official Boilerplate Build Scripts

From `package.json`:

### Development Scripts

```json
{
  "dev": "concurrently \"vite -c vite.frontend.config.js --port 5173\" \"vite -c vite.admin.config.js --port 5174\"",
  "dev:admin": "vite -c vite.admin.config.js --port 5174",
  "dev:frontend": "vite -c vite.frontend.config.js --port 5173",
  "dev:all": "concurrently \"npm run dev\" \"npm run block:start\"",
  "dev:server": "concurrently \"npm run dev\" \"npx @wp-now/wp-now start\""
}
```

**Pattern:**
- Uses `concurrently` to run multiple Vite dev servers simultaneously
- Each config runs on a dedicated port (5173 for frontend, 5174 for admin)
- Separate scripts allow running admin/frontend independently

### Production Build Scripts

```json
{
  "build": "vite build -c vite.frontend.config.js && vite build -c vite.admin.config.js && npm run block:build",
  "block:build": "wp-scripts build --webpack-src-dir=src/blocks --output-path=assets/blocks",
  "release": "npm run build && grunt release"
}
```

**Pattern:**
- Sequential builds using `&&` (frontend → admin → blocks)
- WordPress blocks use `@wordpress/scripts` (Webpack-based)
- Release command builds everything, then packages with Grunt

---

## 4. Official Boilerplate Asset Loading (PHP)

### Admin Asset Enqueueing

From `includes/Assets/Admin.php`:

```php
<?php
namespace WordPressPluginBoilerplate\Assets;

use WordPressPluginBoilerplate\Traits\Base;
use WordPressPluginBoilerplate\Libs\Assets;

class Admin {
    use Base;

    const HANDLE = 'wordpress-plugin-boilerplate';
    const OBJ_NAME = 'wordpressPluginBoilerplate';
    const DEV_SCRIPT = 'src/admin/main.jsx';

    private $allowed_screens = array(
        'toplevel_page_wordpress-plugin-boilerplate',
    );

    public function bootstrap() {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_script'));
    }

    public function enqueue_script($screen) {
        if (in_array($screen, $this->allowed_screens, true)) {
            Assets\enqueue_asset(
                WORDPRESS_PLUGIN_BOILERPLATE_DIR . '/assets/admin/dist',
                self::DEV_SCRIPT,
                $this->get_config()
            );
            wp_localize_script(self::HANDLE, self::OBJ_NAME, $this->get_data());
        }
    }

    public function get_config() {
        return array(
            'dependencies' => array('react', 'react-dom'),
            'handle'       => self::HANDLE,
            'in-footer'    => true,
        );
    }

    public function get_data() {
        return array(
            'isAdmin' => is_admin(),
            'apiUrl'  => rest_url(),
            'nonce'   => wp_create_nonce('wp_rest'),
            'userInfo' => $this->get_user_data(),
        );
    }
}
```

**Key Patterns:**
1. **Manifest Directory:** Points to `assets/admin/dist` (where `manifest.json` lives)
2. **Dev Script Path:** Original source file path (`src/admin/main.jsx`)
3. **Helper Function:** `Assets\enqueue_asset()` from `libs/assets.php` handles manifest loading
4. **Screen Filtering:** Only loads on specific admin pages
5. **Data Localization:** Passes PHP data to React via `wp_localize_script()`

### Frontend Asset Enqueueing

From `includes/Assets/Frontend.php`:

```php
<?php
namespace WordPressPluginBoilerplate\Assets;

use WordPressPluginBoilerplate\Traits\Base;
use WordPressPluginBoilerplate\Libs\Assets;

class Frontend {
    use Base;

    const HANDLE = 'wordpress-plugin-boilerplate-frontend';
    const OBJ_NAME = 'wordpressPluginBoilerplate';
    const DEV_SCRIPT = 'src/frontend/main.jsx';

    public function bootstrap() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_script'));
    }

    public function enqueue_script() {
        Assets\enqueue_asset(
            WORDPRESS_PLUGIN_BOILERPLATE_DIR . '/assets/frontend/dist',
            self::DEV_SCRIPT,
            $this->get_config()
        );
        wp_localize_script(self::HANDLE, self::OBJ_NAME, $this->get_data());
    }

    public function get_config() {
        return array(
            'dependencies' => array('react', 'react-dom'),
            'handle'       => self::HANDLE,
            'in-footer'    => true,
        );
    }
}
```

**Key Patterns:**
1. Identical structure to admin loader
2. Uses `wp_enqueue_scripts` hook (frontend)
3. Points to `assets/frontend/dist`

---

## 5. Manifest Loading System

The boilerplate uses a custom manifest loader in `libs/assets.php`:

### How It Works

1. **Development Mode Detection:**
   - Checks for `vite-dev-server.json` in manifest directory
   - If found, loads from Vite dev server (HMR enabled)
   - Dev server config contains: `{"origin": "http://localhost:5173", "base": "/"}`

2. **Production Mode:**
   - Loads `manifest.json` generated by Vite build
   - Maps entry points to hashed filenames
   - Automatically loads CSS chunks

3. **Asset Registration:**
   - Registers scripts with `wp_register_script()`
   - Adds `type="module"` attribute for ES modules
   - Handles CSS dependencies from Vite

### Example Manifest (Production)

```json
{
  "src/admin/main.jsx": {
    "file": "assets/main-55855139.js",
    "css": ["assets/main-d61fdff0.css"],
    "isEntry": true,
    "src": "src/admin/main.jsx"
  }
}
```

---

## 6. Current Project (frs-wp-users) Implementation

### Deviations from Official Boilerplate

#### 6.1 Multiple Additional Vite Configs

**Official Boilerplate:**
- 2 configs: `vite.admin.config.js`, `vite.frontend.config.js`

**Current Project:**
- 5 configs total:
  1. `vite.admin.config.js` ✅ (matches boilerplate)
  2. `vite.frontend.config.js` ⚠️ (modified - see below)
  3. `vite.widget.config.js` ❌ (custom addition)
  4. `vite.profile-editor.config.js` ❌ (custom addition)
  5. `vite.portal.config.js` ❌ (custom addition - OVERWRITES frontend config)

#### 6.2 Portal Config Overwrites Frontend Output

**CRITICAL ISSUE:**

`vite.portal.config.js`:
```javascript
export default {
  plugins: [
    v4wp({
      input: {
        'portal': "src/frontend/portal/main.tsx",
        'public-profile': "src/frontend/portal/public-main.tsx"
      },
      outDir: "assets/frontend/dist",  // ⚠️ SAME as frontend config!
    }),
    react(),
  ],
}
```

**Problem:**
- Both `vite.frontend.config.js` and `vite.portal.config.js` output to `assets/frontend/dist`
- Last build wins (overwrites previous build)
- Frontend config builds: `src/frontend/main.jsx`
- Portal config builds: `src/frontend/portal/main.tsx` + `src/frontend/portal/public-main.tsx`

**Current Build Script:**
```json
"build": "vite build -c vite.frontend.config.js && vite build -c vite.admin.config.js && npm run block:build && npm run widget:build && npm run build:profile-editor && npm run build:portal"
```

**Result:**
- `frontend.config.js` builds `main.jsx` → `assets/frontend/dist`
- Then `portal.config.js` **OVERWRITES** it with `portal/main.tsx` + `portal/public-main.tsx`
- The `src/frontend/main.jsx` build is lost!

#### 6.3 Widget Config Uses Different Pattern

`vite.widget.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'assets/widget'),
    lib: {
      entry: resolve(__dirname, 'src/widget/loan-officer-directory-widget.tsx'),
      name: 'FRSLoanOfficerDirectoryWidget',
      fileName: 'loan-officer-directory-widget',
      formats: ['iife'],  // Self-executing function
    },
  },
});
```

**Pattern:**
- Uses Vite's **library mode** (not `v4wp` plugin)
- Outputs IIFE (Immediately Invoked Function Expression)
- Different pattern than admin/frontend (non-standard)

#### 6.4 Profile Editor Config

`vite.profile-editor.config.js`:
```javascript
export default {
  plugins: [
    v4wp({
      input: "src/frontend/profile-editor/main.tsx",
      outDir: "assets/profile-editor/dist",  // ✅ Unique output directory
    }),
    react(),
  ],
}
```

**Pattern:**
- Follows boilerplate pattern correctly
- Has unique output directory (no conflicts)

#### 6.5 Modified Frontend Config

`vite.frontend.config.js`:
```javascript
export default {
  plugins: [
    v4wp({
      input: "src/frontend/main.jsx",
      outDir: "assets/frontend/dist",  // ⚠️ Shared with portal config
    }),
    react(),
  ],
}
```

**Issue:**
- Missing `base: "./"` from admin config
- Shares output directory with portal config

---

## 7. Directory Structure Comparison

### Official Boilerplate

```
assets/
├── admin/
│   └── dist/              # Single admin build
│       ├── assets/
│       └── manifest.json
├── frontend/
│   └── dist/              # Single frontend build
│       ├── assets/
│       └── manifest.json
└── blocks/
```

### Current Project

```
assets/
├── admin/
│   └── dist/              # Admin React SPA
│       ├── assets/
│       └── manifest.json
├── frontend/
│   └── dist/              # ⚠️ CONFLICT: frontend.config vs portal.config
│       ├── assets/
│       └── vite-dev-server.json  # (dev mode active)
├── profile-editor/
│   └── dist/              # Separate profile editor app
│       └── assets/
├── widget/                # Widget build (library mode)
└── blocks/
```

---

## 8. Asset Loading in Current Project

### Admin Assets
**File:** `includes/Assets/Admin.php`

✅ **CORRECT** - Follows boilerplate pattern exactly:
```php
Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/admin/dist',
    'src/admin/main.jsx',
    $this->get_config()
);
```

### Portal Assets (Shortcode)
**File:** `includes/Controllers/Shortcodes.php`

⚠️ **ISSUE** - Tries to load from `assets/frontend/dist`:
```php
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/frontend/dist',
    'src/frontend/portal/main.tsx',  // But manifest has different entry!
    array(
        'handle'       => 'frs-profile-portal',
        'dependencies' => array('react', 'react-dom'),
        'in-footer'    => true,
    )
);
```

**Problem:**
- Looking for entry `src/frontend/portal/main.tsx`
- But manifest was created by portal config with entries named `portal` and `public-profile`
- Mismatch between entry name and manifest key

### Profile Editor Assets
**File:** `includes/Controllers/Shortcodes.php`

✅ **CORRECT** - Follows boilerplate pattern:
```php
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/profile-editor/dist',
    'src/frontend/profile-editor/main.tsx',
    array(
        'handle'       => 'frs-profile-editor',
        'dependencies' => array('react', 'react-dom'),
        'in-footer'    => true,
    )
);
```

---

## 9. Source Directory Structure

### Official Boilerplate
```
src/
├── admin/
│   └── main.jsx           # Single entry point
├── frontend/
│   └── main.jsx           # Single entry point
├── blocks/
├── components/
└── lib/
```

### Current Project
```
src/
├── admin/
│   ├── main.jsx           # Admin SPA entry ✅
│   ├── pages/             # Admin page components
│   └── types/
├── frontend/
│   ├── main.jsx           # ⚠️ Never used (overwritten)
│   ├── portal/
│   │   ├── main.tsx       # Portal entry (used)
│   │   ├── public-main.tsx # Public profile entry (used)
│   │   ├── components/
│   │   ├── utils/
│   │   └── types/
│   ├── profile-editor/
│   │   ├── main.tsx       # Profile editor entry ✅
│   │   └── sections/
│   └── pages/
├── blocks/
├── components/            # Shared components (shadcn/ui)
├── lib/
└── widget/
    └── loan-officer-directory-widget.tsx  # Widget entry ✅
```

---

## 10. Key Issues & Recommendations

### Issue 1: Output Directory Conflict ⚠️ CRITICAL

**Problem:**
- `vite.frontend.config.js` and `vite.portal.config.js` both output to `assets/frontend/dist`
- Portal build overwrites frontend build
- `src/frontend/main.jsx` is never used

**Solutions:**

#### Option A: Consolidate Portal into Frontend Config (RECOMMENDED)
```javascript
// vite.frontend.config.js
export default {
  plugins: [
    v4wp({
      input: {
        'main': "src/frontend/main.jsx",  // Optional: original frontend app
        'portal': "src/frontend/portal/main.tsx",
        'public-profile': "src/frontend/portal/public-main.tsx"
      },
      outDir: "assets/frontend/dist",
    }),
    react(),
  ],
}
```

Then delete `vite.portal.config.js` and update build script:
```json
"build": "vite build -c vite.frontend.config.js && vite build -c vite.admin.config.js && ..."
```

#### Option B: Give Portal Its Own Directory
```javascript
// vite.portal.config.js
export default {
  plugins: [
    v4wp({
      input: {
        'portal': "src/frontend/portal/main.tsx",
        'public-profile': "src/frontend/portal/public-main.tsx"
      },
      outDir: "assets/portal/dist",  // ✅ Unique directory
    }),
    react(),
  ],
}
```

Update PHP loader:
```php
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/portal/dist',
    'portal',  // Use manifest key name
    array(...)
);
```

### Issue 2: Entry Name Mismatch

**Current Portal Config:**
```javascript
input: {
  'portal': "src/frontend/portal/main.tsx",
  'public-profile': "src/frontend/portal/public-main.tsx"
}
```

**Current PHP Loader:**
```php
'src/frontend/portal/main.tsx'  // ❌ Wrong - this is the file path, not manifest key
```

**Fix:**
```php
'portal'  // ✅ Use the manifest key name from input object
```

### Issue 3: Widget Build Pattern

**Current:** Uses library mode (different from boilerplate)

**Recommendation:**
- If widget is for external embedding, keep library mode
- If widget is for WordPress only, consider using `v4wp` pattern for consistency

### Issue 4: Admin Config Missing `base` Property

**Current:**
```javascript
export default {
  plugins: [...],
  resolve: {...},
  // Missing base
}
```

**Boilerplate Has:**
```javascript
export default {
  base: "./",
  plugins: [...],
}
```

**Fix:**
```javascript
export default {
  base: "./",  // ✅ Add this
  plugins: [
    v4wp({
      input: "src/admin/main.jsx",
      outDir: "assets/admin/dist",
    }),
    react(),
  ],
}
```

---

## 11. Recommended Fixes

### Priority 1: Fix Output Directory Conflict

**Step 1:** Decide on consolidation approach (Option A or B from Issue 1)

**Step 2:** Update build script:
```json
{
  "build": "vite build -c vite.frontend.config.js && vite build -c vite.admin.config.js && npm run block:build && npm run widget:build && npm run build:profile-editor"
}
```

**Step 3:** Update `package.json` dev scripts:
```json
{
  "dev:portal": "vite -c vite.frontend.config.js --port 5173"
}
```

### Priority 2: Fix Entry Name in PHP

**File:** `includes/Controllers/Shortcodes.php`

**Change:**
```php
// FROM:
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/frontend/dist',
    'src/frontend/portal/main.tsx',  // ❌
    array(...)
);

// TO (if using Option A):
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/frontend/dist',
    'portal',  // ✅ Matches input key
    array(...)
);

// TO (if using Option B):
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/portal/dist',
    'portal',  // ✅
    array(...)
);
```

### Priority 3: Add `base` to Admin Config

**File:** `vite.admin.config.js`

```javascript
export default {
  base: "./",  // ✅ Add this line
  plugins: [
    v4wp({
      input: "src/admin/main.jsx",
      outDir: "assets/admin/dist",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
};
```

### Priority 4: Document Build Architecture

Add to `CLAUDE.md`:

```markdown
## Vite Build Architecture

### Entry Points
- **Admin:** `src/admin/main.jsx` → `assets/admin/dist`
- **Frontend/Portal:** `src/frontend/portal/main.tsx` → `assets/frontend/dist` (entry: `portal`)
- **Profile Editor:** `src/frontend/profile-editor/main.tsx` → `assets/profile-editor/dist`
- **Widget:** `src/widget/loan-officer-directory-widget.tsx` → `assets/widget` (library mode)

### Build Commands
- `npm run dev` - Run frontend + admin dev servers (ports 5173, 5174)
- `npm run build` - Production build of all apps
- `npm run dev:admin` - Admin only (port 5174)
- `npm run dev:frontend` - Frontend/Portal only (port 5173)

### Asset Loading
Always use manifest key names (NOT file paths) when calling `enqueue_asset()`:
```php
// ✅ CORRECT
enqueue_asset(DIR . '/assets/frontend/dist', 'portal', $config);

// ❌ WRONG
enqueue_asset(DIR . '/assets/frontend/dist', 'src/frontend/portal/main.tsx', $config);
```
```

---

## 12. Summary

### What the Boilerplate Does Right
1. **Clear separation** of admin/frontend with dedicated configs
2. **Consistent pattern** using `@kucrut/vite-for-wp`
3. **Simple build orchestration** using sequential builds
4. **Manifest-based loading** with dev/prod detection
5. **Standard directory structure** (`src/` → `assets/`)

### Current Project Deviations
1. ✅ **Good:** Multiple React apps for different purposes
2. ⚠️ **Issue:** Output directory conflicts (frontend vs portal)
3. ⚠️ **Issue:** Entry name mismatches in PHP
4. ⚠️ **Issue:** Inconsistent patterns (library mode for widget)
5. ⚠️ **Issue:** Missing `base` property in admin config

### Quick Fix Checklist
- [ ] Consolidate portal config into frontend config OR give it unique output dir
- [ ] Update PHP loaders to use manifest keys (not file paths)
- [ ] Add `base: "./"` to admin config
- [ ] Update build scripts to remove portal config if consolidated
- [ ] Test all builds to verify no conflicts
- [ ] Document the architecture in CLAUDE.md

---

## 13. Additional Resources

- **Vite for WP Plugin:** https://github.com/kucrut/vite-for-wp
- **Official Boilerplate:** https://github.com/prappo/wordpress-plugin-boilerplate
- **Vite Docs:** https://vitejs.dev/guide/
- **WordPress Scripts:** https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/
