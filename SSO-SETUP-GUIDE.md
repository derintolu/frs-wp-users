# SSO Setup Guide - FRS User Profiles + OpenID Connect

**Status:** ✅ OpenID Connect Server installed and integrated with frs-wp-users

---

## ✅ What's Already Done

1. ✅ OpenID Connect Server plugin installed (v2.0.0)
2. ✅ Required dependency check added to frs-wp-users
3. ✅ OpenID Connect integration class created
4. ✅ Profile data automatically added to SSO claims
5. ✅ Custom scopes created (profile_professional, profile_contact, profile_full)

---

## 🚀 Quick Start: Setup SSO Provider (hub21.local)

### Step 1: Configure OpenID Connect Server (5 minutes)

1. Go to: **WP Admin → Settings → OpenID Connect Server**
2. Click **"Generate Keys"** button (creates RSA public/private keys automatically)
3. **Save Changes**

### Step 2: Register Your First Client Site (3 minutes per site)

1. Go to: **OpenID Connect Server → Clients → Add New**

2. Fill in the form:
   ```
   Client Name: My Test Site
   Redirect URI: https://mysite.local/wp-admin/admin-ajax.php?action=openid-connect-authorize
   Grant Types: ☑ Authorization Code
   Scopes:
     ☑ openid
     ☑ profile
     ☑ email
     ☑ profile_full (custom - includes all frs-wp-users data)
   ```

3. Click **"Add Client"**

4. **IMPORTANT:** Copy the generated **Client ID** and **Client Secret**
   - You'll need these for the client site setup
   - Keep them secure!

---

## 🔌 Setup SSO Client (Other WordPress Sites)

### Step 1: Install Client Plugin (2 minutes)

On each site that needs SSO:

```bash
wp plugin install daggerhart-openid-connect-generic --activate --allow-root
```

Or install from WP Admin:
- **Plugins → Add New**
- Search: **"OpenID Connect Generic"**
- Install and Activate

### Step 2: Configure Client (5 minutes)

1. Go to: **Settings → OpenID Connect Client**

2. **Client Settings:**
   ```
   Client ID: [paste from hub21.local]
   Client Secret: [paste from hub21.local]
   Scope: openid profile email profile_full
   ```

3. **OpenID Connect Endpoints:**
   ```
   Login Endpoint URL:
   https://hub21.local/openid-connect/authorize

   Userinfo Endpoint URL:
   https://hub21.local/openid-connect/userinfo

   Token Validation Endpoint URL:
   https://hub21.local/openid-connect/token

   End Session Endpoint URL:
   https://hub21.local/wp-login.php?action=logout
   ```

4. **Identity Settings:**
   ```
   Nickname Key: preferred_username
   Email Formatting: {email}
   Display Name Formatting: {given_name} {family_name}
   ```

5. **User Settings:**
   ```
   ☑ Link Existing Users (by email)
   ☑ Create user if doesn't exist
   ☑ Redirect Back to Origin Page
   ```

6. **Save Changes**

### Step 3: Test SSO Login (2 minutes)

1. **Logout** of the client site
2. Look for **"Login with OpenID Connect"** button
3. Click it
4. Should redirect to hub21.local login
5. Login with your credentials
6. Redirects back to client site
7. **You're logged in!** ✅

---

## 📊 Available Profile Scopes

When registering clients, you can choose what profile data they receive:

### Basic Scopes (Standard OpenID Connect)
- **openid** - Required for SSO
- **profile** - Basic profile (name, job title, office, city)
- **email** - Email address

### Custom FRS Scopes (from frs-wp-users)
- **profile_professional** - NMLS, licenses, specialties, languages
- **profile_contact** - Phone, mobile, social media URLs
- **profile_full** - Everything (all profile data)

---

## 🔐 Profile Data Included in SSO Claims

When a user logs in via SSO, client sites receive this data:

### Always Included:
- `profile_id` - frs-wp-users profile ID
- `person_type` - loan_officer, agent, staff, etc.
- `phone_number`
- `given_name` (first name)
- `family_name` (last name)
- `email`

### With "profile" or "profile_full" scope:
- `job_title`
- `office`
- `city_state`
- `headshot_url`

### With "profile_professional" or "profile_full" scope:
- `nmls`
- `license_number`
- `dre_license`
- `specialties` (array)
- `languages` (array)

### With "profile_contact" or "profile_full" scope:
- `mobile_number`
- `facebook_url`
- `instagram_url`
- `linkedin_url`
- `twitter_url`

---

## ⚡ Automated Client Setup Script

Save time when adding multiple sites! Create this script:

**File:** `setup-sso-client.sh`
```bash
#!/bin/bash
# Quick SSO client setup

SITE_URL=$1
CLIENT_ID=$2
CLIENT_SECRET=$3

if [ -z "$SITE_URL" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "Usage: ./setup-sso-client.sh <site-url> <client-id> <client-secret>"
    exit 1
fi

echo "Setting up SSO for $SITE_URL..."

# Install plugin
wp plugin install daggerhart-openid-connect-generic --activate --allow-root --url=$SITE_URL

# Configure settings
wp option update oidc_settings '{
  "client_id":"'$CLIENT_ID'",
  "client_secret":"'$CLIENT_SECRET'",
  "scope":"openid profile email profile_full",
  "login_endpoint":"https://hub21.local/openid-connect/authorize",
  "userinfo_endpoint":"https://hub21.local/openid-connect/userinfo",
  "token_validation_endpoint":"https://hub21.local/openid-connect/token",
  "end_session_endpoint":"https://hub21.local/wp-login.php?action=logout",
  "nickname_key":"preferred_username",
  "email_format":"{email}",
  "displayname_format":"{given_name} {family_name}",
  "link_existing_users":"1",
  "create_if_does_not_exist":"1",
  "redirect_user_back":"1"
}' --format=json --allow-root --url=$SITE_URL

echo "✅ SSO configured for $SITE_URL"
```

**Usage:**
```bash
chmod +x setup-sso-client.sh
./setup-sso-client.sh site1.local abc123 xyz789
./setup-sso-client.sh site2.local abc123 xyz789
```

---

## 🔍 Troubleshooting

### Issue: "Login with OpenID Connect" button doesn't appear
**Solution:** Make sure OpenID Connect Generic Client plugin is activated

### Issue: Redirect loop after login
**Solution:**
1. Check that redirect URI in hub21.local exactly matches client site URL
2. Verify SSL certificates are valid
3. Try clearing browser cookies

### Issue: "Invalid redirect URI" error
**Solution:** The redirect URI must be exact:
```
https://yoursite.local/wp-admin/admin-ajax.php?action=openid-connect-authorize
```

### Issue: User not created on client site
**Solution:**
1. Make sure "Create user if doesn't exist" is checked
2. Verify email scope is requested
3. Check that user doesn't already exist with different email

### Issue: Profile data not appearing in claims
**Solution:**
1. Verify profile exists in frs-wp-users for that user
2. Check that correct scopes are requested (profile_full for all data)
3. Clear browser cache and try again

---

## 📈 Next Steps

### Phase 1: Basic SSO (DONE ✅)
- ✅ OpenID Connect Server installed
- ✅ Integration with frs-wp-users
- ✅ Custom scopes configured

### Phase 2: Add More Sites (This Week)
- [ ] Register all company WordPress sites as OAuth clients
- [ ] Install and configure client plugin on each site
- [ ] Test SSO flow across all sites

### Phase 3: SSO Dashboard (Next Week)
- [ ] Build React dashboard showing all connected sites
- [ ] One-click access to any site from dashboard
- [ ] Activity monitoring and audit logging

### Phase 4: Advanced Features (Future)
- [ ] Multi-factor authentication (MFA)
- [ ] Session management (force logout across all sites)
- [ ] User consent management
- [ ] Advanced permission scopes

---

## 🎯 Benefits You Get

1. **Single Sign-On** - Login once, access all company sites
2. **Centralized User Management** - Manage all users from hub21.local
3. **Rich Profile Data** - All frs-wp-users data available via SSO
4. **Secure** - OpenID Connect industry standard, Automattic-maintained
5. **Scalable** - Add unlimited sites as OAuth clients
6. **No Additional Costs** - Free, open source plugins

---

## 📚 Resources

- **OpenID Connect Server Docs:** https://wordpress.org/plugins/openid-connect-server/
- **OpenID Connect Client Docs:** https://wordpress.org/plugins/daggerhart-openid-connect-generic/
- **OpenID Connect Spec:** https://openid.net/connect/

---

## 🆘 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify both plugins are active and up to date
3. Check WordPress debug.log for errors
4. Test with a fresh browser (clear cache/cookies)

---

**Ready to add your first client site?** Follow the "Setup SSO Client" section above! 🚀
