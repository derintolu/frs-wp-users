# BuddyPress Profile React App

React application that displays combined FRS + BuddyPress profile data using REST APIs.

## Features

- **Dynamic Namespace Support** - Automatically detects and uses custom BuddyPress REST API namespaces
- **FRS Profile Data** - Fetches from `wp_frs_profiles` table via Eloquent ORM
- **BuddyPress Data** - Fetches member info and activity via BP REST API
- **TypeScript** - Fully typed interfaces for all data
- **Tailwind CSS** - Styled with Tailwind utility classes

## API Configuration

The app receives configuration from PHP via `wp_localize_script`:

```javascript
window.frsBPConfig = {
  userId: 1,                      // WordPress user ID
  apiUrl: '/wp-json/',            // REST API base URL
  restNonce: '...',               // WP REST nonce for authentication
  bpNamespace: 'buddypress/v1',   // BuddyPress namespace (customizable!)
  frsNamespace: 'frs-users/v1',   // FRS Users namespace
  bpSlugs: {                      // BuddyPress route slugs (customizable!)
    members: 'members',
    activity: 'activity',
    groups: 'groups',
    attachments: 'attachments'
  }
};
```

### Custom BuddyPress Namespace

BuddyPress allows renaming the REST API namespace. This app automatically detects it using:

**PHP Side** (`includes/Controllers/Shortcodes.php`):
```php
// Detects custom namespace via bp_rest_namespace() and bp_rest_version()
$bp_namespace = bp_rest_namespace() . '/' . bp_rest_version();
```

**React Side** (`BuddyPressProfile.tsx`):
```typescript
function getAPIConfig() {
  const config = window.frsBPConfig || {};
  return {
    bpNamespace: config.bpNamespace || 'buddypress/v1', // Falls back to default
  };
}
```

### Custom BuddyPress Route Slugs

BuddyPress also allows renaming individual route slugs (members, activity, groups, attachments). This app automatically detects them by parsing the REST API:

**PHP Side** (`includes/Controllers/Shortcodes.php`):
```php
// Auto-detects route slugs from REST API routes
$bp_slugs = $this->get_bp_route_slugs($bp_namespace);
// Returns: ['members' => 'members', 'activity' => 'activity', ...]
```

**React Side** (`BuddyPressProfile.tsx`):
```typescript
function getAPIConfig() {
  const config = window.frsBPConfig || {};
  return {
    bpSlugs: config.bpSlugs || {
      members: 'members',
      activity: 'activity',
      groups: 'groups',
      attachments: 'attachments',
    },
  };
}

// Used in API calls:
const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs.members}/${userId}`;
```

## REST API Endpoints Used

### FRS Users API
- `GET /wp-json/{frsNamespace}/profiles/user/{id}` - Get profile by user ID

### BuddyPress API
- `GET /wp-json/{bpNamespace}/{bpSlugs.members}/{id}` - Get member data
- `GET /wp-json/{bpNamespace}/{bpSlugs.activity}?user_id={id}` - Get user activity

All endpoints use the **dynamic namespace AND route slugs** from config!

**Example with default slugs:**
- `/wp-json/buddypress/v1/members/1`
- `/wp-json/buddypress/v1/activity?user_id=1`

**Example with custom slugs:**
- `/wp-json/my-api/v2/users/1` (renamed namespace + members slug)
- `/wp-json/my-api/v2/feed?user_id=1` (renamed namespace + activity slug)

## Data Flow

```
Shortcode renders
    ↓
PHP enqueues React app via Vite
    ↓
PHP detects BP namespace via bp_rest_namespace()
    ↓
PHP passes config to React via wp_localize_script
    ↓
React fetches:
  - FRS profile (Eloquent → REST API)
  - BP member (BP REST API)
  - BP activity (BP REST API)
    ↓
React renders combined profile
```

## Component Structure

```
BuddyPressProfile (main component)
  ├── Profile Header
  │   ├── Avatar (from BP)
  │   ├── Name (from FRS)
  │   ├── Person Type Badge (from FRS)
  │   ├── NMLS # (from FRS)
  │   ├── Contact Info (from FRS)
  │   └── Last Activity (from BP)
  ├── Bio Section (from FRS)
  └── Activity Feed (from BP)
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Usage

```php
// In WordPress page/post
[frs_bp_profile user_id="1"]

// Current logged-in user
[frs_bp_profile]
```

## TypeScript Interfaces

```typescript
interface FRSProfile {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  nmls_id?: string;
  select_person_type?: string;
}

interface BPMember {
  id: number;
  name: string;
  link: string;
  user_avatar: {
    full: string;
    thumb: string;
  };
  last_activity: {
    date: string;
    timediff: string;
  };
}

interface BPActivity {
  id: number;
  user_id: number;
  content: string;
  date: string;
  component: string;
  type: string;
}
```

## Customization Examples

### Change Activity Limit

```typescript
// In fetchBPActivity()
const url = `${config.apiUrl}${config.bpNamespace}/activity?user_id=${userId}&per_page=20`;
```

### Add Custom Fields

```typescript
interface FRSProfile {
  // ... existing fields
  custom_field?: string;
}
```

### Style Changes

The component uses Tailwind CSS classes. Edit directly in `BuddyPressProfile.tsx`:

```tsx
<div className="max-w-6xl mx-auto p-8"> {/* Changed max-width and padding */}
```

## Troubleshooting

### "Profile not found"
- User doesn't have a WordPress account (`user_id` is null)
- Run: `wp frs-users create-user {profile_id}`

### "Failed to fetch BuddyPress member"
- User doesn't exist in WordPress
- BuddyPress namespace is incorrect (check `wp-json/` root)
- BuddyPress route slugs are incorrect
- REST API nonce is invalid (user needs to refresh page)

### Custom namespace not working
- Check if `bp_rest_namespace()` function exists
- Verify BuddyPress REST API is enabled
- Check `window.frsBPConfig.bpNamespace` in browser console

### Custom route slugs not working
- Check `window.frsBPConfig.bpSlugs` in browser console
- Verify the slugs match actual BP routes at `/wp-json/`
- Check for errors in `get_bp_route_slugs()` method
- Ensure `rest_get_server()->get_routes()` returns BP routes

## Notes

- Always uses **dynamic namespaces AND route slugs** (never hardcoded!)
- Automatically detects custom BP REST API configuration
- Requires both FRS WP Users and BuddyPress plugins
- User must have WordPress account (not guest profile)
- REST API nonce is required for all requests
