# Troubleshooting Common Issues

## React admin not loading / Blank screen

**Symptoms:** Admin page shows empty `#frs-users-admin-root` div

**Check:**
1. Verify React app is built:
   ```bash
   npm run build
   # OR for development
   npm run dev:admin
   ```
2. Check browser console for errors
3. Verify `assets/admin/dist/` directory exists with built files
4. Check `includes/Assets/Admin.php` is enqueuing assets correctly
5. Verify `#frs-users-admin-root` element exists in page source

**Fix:**
```bash
# Rebuild admin assets
npm run build

# If still not working, clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## React Router not working (404 on routes)

**Symptoms:** Clicking links shows 404 or doesn't navigate

**Check:**
1. Verify using HashRouter (URLs should have `#/` in them)
2. Check routes are defined in `src/admin/routes.jsx`
3. Verify menu links use hash format: `frs-profiles#/route`
4. Check `data-route` attribute is set correctly in PHP

**Example:**
```php
// PHP menu item - note the #/
'frs-profiles#/profiles'

// PHP template
<div id="frs-users-admin-root" data-route="/profiles/<?php echo $id; ?>"></div>
```

## REST API returns 404

**Symptoms:** `fetch('/wp-json/frs-users/v1/profiles')` returns 404

**Check:**
1. Routes registered in `includes/Routes/Api.php`
2. Controller methods exist in `includes/Controllers/Profiles/Actions.php`
3. Flush permalinks: WP Admin → Settings → Permalinks → Save Changes
4. Verify REST API is working: Visit `/wp-json/` in browser

**Fix:**
```bash
# Via WP-CLI
wp rewrite flush

# Via browser
# Go to: WP Admin > Settings > Permalinks > Click "Save Changes"
```

## Vite dev server not working

**Cause:** SSL certificate issue or domain mismatch in Local WP

**Fix:** Change Router mode to `localhost` in Local WP settings

See [VITE-DEV-SERVER.md](./VITE-DEV-SERVER.md) for complete troubleshooting.

## TypeScript errors in React components

**Check:**
1. Verify TypeScript is configured: `tsconfig.json` exists
2. Check imports use correct paths (use `@/` alias)
3. Verify interfaces are properly defined
4. Check shadcn/ui components are installed correctly

**Fix:**
```bash
# Reinstall dependencies
npm install

# Check TypeScript
npx tsc --noEmit
```

## Database table not created

**Fix:**
```bash
# Deactivate and reactivate plugin
wp plugin deactivate frs-wp-users
wp plugin activate frs-wp-users
```

## Profile data not saving

**Check:**
1. Verify Eloquent model has `$fillable` array with all fields
2. Check REST API endpoint has permission callback
3. Verify data is being sanitized on server side
4. Check browser console for API errors
5. Verify `ProfileStorage.php` is intercepting Carbon Fields saves correctly

**Debug:**
```php
// Add to controller method
error_log('Profile data: ' . print_r($request->get_params(), true));
```

## Carbon Fields not showing/saving data

**Check:**
1. Verify `ProfileFields.php` is loaded in `plugin.php`
2. Check `ProfileStorage.php` is registered correctly
3. Verify field names match database columns
4. Check if data is in `wp_frs_profiles` table (not postmeta)

**Query to verify:**
```sql
SELECT * FROM wp_frs_profiles WHERE email = 'test@example.com';
```
