# Vite Dev Server Setup Guide

**This is MANDATORY reading. Dev server issues have caused repeated problems.**

## How @kucrut/vite-for-wp Works

The plugin uses `@kucrut/vite-for-wp` for Vite integration. Here's how it works:

1. **Dev Mode:** When `npm run dev:portal` is running, Vite serves files from http://hub21.local:5176
2. **WordPress Detection:** WordPress checks for `vite-dev-server.json` OR `.vite-for-wp` in the dist directory
3. **File Loading:** If dev server file exists, WordPress loads from Vite server. Otherwise, it loads built files.

## Dev Server File Format

**Location:** `assets/portal/dist/vite-dev-server.json`

**Required Content:**
```json
{
  "origin": "http://hub21.local:5176",
  "base": "/"
}
```

## Portal Dev Server Setup (CRITICAL STEPS)

**EVERY TIME you start working on portal components:**

```bash
# 1. Start dev server
npm run dev:portal

# 2. VERIFY vite-dev-server.json exists
cat assets/portal/dist/vite-dev-server.json

# 3. If missing, CREATE IT:
echo '{
  "origin": "http://hub21.local:5176",
  "base": "/"
}' > assets/portal/dist/vite-dev-server.json

# 4. Verify dev server is running
curl http://hub21.local:5176
```

## How WordPress Loads Portal Assets

**File:** `includes/Controllers/Shortcodes.php`

```php
\FRSUsers\Libs\Assets\enqueue_asset(
    FRS_USERS_DIR . '/assets/portal/dist',
    'src/frontend/portal/main.tsx',
    array(
        'handle'       => 'frs-profile-portal',
        'dependencies' => array( 'react', 'react-dom' ),
        'in-footer'    => true,
    )
);
```

**File:** `libs/assets.php` (lines 29-53)

The `get_manifest()` function looks for files in this order:
1. `vite-dev-server.json` - If found, loads from dev server
2. `manifest.json` - If found, loads built production files
3. If neither found, throws error: `[Vite] No manifest found in {dir}`

## Troubleshooting Dev Server Issues

### Error: "[Vite] No manifest found in assets/portal/dist"

**Solution:**
```bash
# Check what's in dist directory
ls -la assets/portal/dist/

# Should see vite-dev-server.json
# If not, create it:
echo '{
  "origin": "http://hub21.local:5176",
  "base": "/"
}' > assets/portal/dist/vite-dev-server.json

# Verify dev server is running on that port
npm run dev:portal
```

### Error: "Changes not showing / Old code loading"

**Solution (in this order):**
1. Check if `vite-dev-server.json` exists in dist directory
2. Verify dev server is actually running: `curl http://hub21.local:5176`
3. Check browser console for 404 errors from Vite server
4. Verify port in `vite-dev-server.json` matches `vite.portal.config.js`
5. LAST RESORT: Hard refresh browser (Cmd+Shift+R)

### Error: "Connection refused on port 5176"

**Solution:**
```bash
# Kill any existing dev servers
lsof -ti:5176 | xargs kill -9

# Restart dev server
npm run dev:portal

# Recreate vite-dev-server.json
echo '{
  "origin": "http://hub21.local:5176",
  "base": "/"
}' > assets/portal/dist/vite-dev-server.json
```

## NEVER Do These Things

❌ **NEVER** run `npm run build:portal` when you want dev server
❌ **NEVER** delete the entire `assets/portal/dist/` directory
❌ **NEVER** assume caching is the problem without checking dev server file first
❌ **NEVER** guess about how Vite integration works - read `libs/assets.php`
❌ **NEVER** blame WordPress for not loading files - check YOUR dev server setup first

## Always Do These Things

✅ **ALWAYS** verify `vite-dev-server.json` exists when dev server is running
✅ **ALWAYS** check actual dev server is running: `curl http://hub21.local:5176`
✅ **ALWAYS** read error messages carefully - they tell you exactly what file is missing
✅ **ALWAYS** assume your last change broke it - check YOUR code first
✅ **ALWAYS** check browser console for actual errors before guessing solutions

## Available Dev Servers

```bash
npm run dev              # Frontend + Admin (ports 5173 + 5174)
npm run dev:admin        # Admin only (port 5174)
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:portal       # Portal only (port 5176)
npm run dev:profile-editor  # Profile editor (port 5175)
```

Each needs its own `vite-dev-server.json` in its respective dist directory:
- Admin: `assets/admin/dist/vite-dev-server.json` (port 5174)
- Frontend: `assets/frontend/dist/vite-dev-server.json` (port 5173)
- Portal: `assets/portal/dist/vite-dev-server.json` (port 5176)
- Profile Editor: `assets/profile-editor/dist/vite-dev-server.json` (port 5175)
