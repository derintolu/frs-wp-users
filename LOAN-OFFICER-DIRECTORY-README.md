# Loan Officer Directory

A flexible loan officer directory that can be used as a WordPress Gutenberg block or embedded on any website via a JavaScript widget.

## Table of Contents
- [WordPress Block Usage](#wordpress-block-usage)
- [Embeddable Widget Usage](#embeddable-widget-usage)
- [Configuration Options](#configuration-options)
- [Styling & Customization](#styling--customization)
- [API Endpoints](#api-endpoints)

---

## WordPress Block Usage

### Adding the Block

1. Edit any page or post in WordPress
2. Click the "+" button to add a block
3. Search for "Loan Officer Directory"
4. Click to add it to your page

### Block Settings

The block can be configured using the WordPress block settings panel:

#### Person Type
Filter officers by type:
- **All Types** (default)
- **Loan Officer**
- **Realtor**

#### Region
Filter by geographic region:
- **All Regions** (default)
- **Pacific**
- **Mountain**
- **Southwest**

#### Card Size
Control the size of profile cards:
- **Small** - Compact cards, 4 columns on large screens
- **Medium** - Default size, 3 columns on large screens
- **Large** - Full-width cards, 2 columns on large screens

#### Detail Level
Control how much information to show:
- **Minimal** - Name, title, avatar only
- **Standard** - Name, title, location, NMLS, social media (default)
- **Full** - All info plus biography

#### Audience
Optimize for internal or external viewers:
- **Internal** - More detailed information
- **External** - Public-facing information (default)

#### Display Options
- **Show Filters** - Display filter dropdowns (default: true)
- **Show Contact Buttons** - Display Call/Email buttons (default: true)
- **Per Page** - Number of profiles to display (default: 12)

---

## Embeddable Widget Usage

### Basic Embedding

To embed the directory on any website (WordPress or non-WordPress):

```html
<!-- 1. Add the container div with data attributes -->
<div data-frs-lo-directory
     data-api-url="https://yoursite.com/wp-json"
     data-person-type="loan_officer"
     data-card-size="medium"
     data-detail-level="standard"
     data-show-filters="true"
     data-show-contact-buttons="true"
     data-per-page="12">
</div>

<!-- 2. Add the widget script -->
<script src="https://yoursite.com/wp-content/plugins/frs-wp-users/assets/widget/loan-officer-directory-widget.iife.js"></script>
```

### External Website Embedding

For websites outside your WordPress installation:

```html
<div data-frs-lo-directory
     data-api-url="https://your-wordpress-site.com/wp-json">
</div>
<script src="https://your-wordpress-site.com/wp-content/plugins/frs-wp-users/assets/widget/loan-officer-directory-widget.iife.js"></script>
```

### Multiple Instances

You can embed multiple directories on the same page with different configurations:

```html
<!-- Loan Officers Only -->
<div data-frs-lo-directory
     data-api-url="https://yoursite.com/wp-json"
     data-person-type="loan_officer"
     data-card-size="small">
</div>

<!-- Realtors Only -->
<div data-frs-lo-directory
     data-api-url="https://yoursite.com/wp-json"
     data-person-type="realtor"
     data-card-size="small">
</div>

<!-- Single script tag needed -->
<script src="https://yoursite.com/wp-content/plugins/frs-wp-users/assets/widget/loan-officer-directory-widget.iife.js"></script>
```

---

## Configuration Options

### Data Attributes Reference

| Attribute | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `data-api-url` | string | Current site + `/wp-json` | Any URL | WordPress REST API base URL |
| `data-person-type` | string | `""` (all) | `loan_officer`, `realtor` | Filter by person type |
| `data-region` | string | `""` (all) | `pacific`, `mountain`, `southwest` | Filter by region |
| `data-card-size` | string | `medium` | `small`, `medium`, `large` | Size of profile cards |
| `data-detail-level` | string | `standard` | `minimal`, `standard`, `full` | Amount of info shown |
| `data-show-filters` | boolean | `true` | `true`, `false` | Show/hide filter dropdowns |
| `data-show-contact-buttons` | boolean | `true` | `true`, `false` | Show/hide Call/Email buttons |
| `data-per-page` | number | `12` | Any number | Profiles per page |

### Examples

#### Minimal Directory (Names Only)
```html
<div data-frs-lo-directory
     data-detail-level="minimal"
     data-show-filters="false"
     data-show-contact-buttons="false"
     data-card-size="small"
     data-per-page="20">
</div>
```

#### Full Directory (All Info)
```html
<div data-frs-lo-directory
     data-detail-level="full"
     data-card-size="large"
     data-per-page="6">
</div>
```

#### Regional Directory
```html
<div data-frs-lo-directory
     data-region="pacific"
     data-show-filters="false">
</div>
```

---

## Styling & Customization

### Widget Styling

The widget uses prefixed CSS classes (`frs-lo-*`) to avoid conflicts with host site styles. All styles are self-contained within the widget bundle.

### Custom Styling

To override widget styles, use CSS with higher specificity:

```css
/* Custom card styling */
.frs-loan-officer-directory .frs-lo-border {
  border-color: #your-brand-color !important;
}

/* Custom button colors */
.frs-loan-officer-directory .frs-lo-bg-blue-600 {
  background-color: #your-brand-color !important;
}

/* Custom heading font */
.frs-loan-officer-directory h2 {
  font-family: 'Your Font', sans-serif !important;
}
```

### Responsive Breakpoints

- **Mobile**: < 640px - Single column
- **Tablet**: 640px - 1024px - 2 columns (small/medium cards)
- **Desktop**: > 1024px - 3-4 columns (depending on card size)

---

## API Endpoints

### Get Profiles

**Endpoint:** `GET /wp-json/frs-users/v1/profiles`

**Parameters:**
- `page` (integer) - Page number (default: 1)
- `per_page` (integer) - Results per page (default: 20)
- `search` (string) - Search query
- `status` (string) - Filter by status
- `type` (string) - Filter by person type
- `with_users_only` (boolean) - Only profiles with WordPress users

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "first_name": "Derin",
      "last_name": "Tolu",
      "full_name": "Derin Tolu",
      "email": "derin@example.com",
      "phone_number": "(555) 123-4567",
      "job_title": "Digital Director",
      "headshot_url": "https://example.com/image.jpg",
      "nmls_number": "123456",
      "city_state": "United States",
      "region": "pacific",
      "biography": "Add a short bio...",
      "office": "Full Realty Services",
      "linkedin_url": "https://linkedin.com/in/...",
      "facebook_url": "https://facebook.com/...",
      "instagram_url": "https://instagram.com/...",
      "twitter_url": "https://twitter.com/...",
      "youtube_url": "https://youtube.com/...",
      "specialties_lo": ["FHA", "VA", "Conventional"]
    }
  ],
  "pagination": {
    "total": 50,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 3
  }
}
```

### Authentication

The widget requires no authentication for public profiles. Internal/authenticated endpoints may require WordPress cookies or nonce verification.

---

## Features

### Profile Card Features

Each profile card includes:

✅ **Profile Photo** - Circular avatar with initials fallback
✅ **Name & Title** - Full name and job title
✅ **NMLS Number** - Badge display for loan officers
✅ **Location** - City/state with map pin icon
✅ **Office/Company** - Linked company name
✅ **Social Media Icons** - LinkedIn, Facebook, Instagram, Twitter, YouTube
✅ **Biography** - Truncated bio text (full detail level)
✅ **Specialties** - Badge display of specializations
✅ **Contact Buttons** - One-click call/email buttons

### Directory Features

✅ **Responsive Grid** - Auto-adjusts for mobile, tablet, desktop
✅ **Live Filtering** - Filter by person type and region
✅ **Loading States** - Animated spinner during data fetch
✅ **Error Handling** - Graceful error messages
✅ **Empty States** - Helpful messages when no profiles found
✅ **Multiple Instances** - Support for multiple directories per page
✅ **No jQuery Required** - Pure React, modern JavaScript
✅ **Scoped Styles** - Prefixed CSS prevents conflicts

---

## Development

### Building from Source

```bash
# Navigate to plugin directory
cd /path/to/wp-content/plugins/frs-wp-users

# Install dependencies
npm install

# Build blocks
npm run block:build

# Build widget
npm run widget:build

# Build everything
npm run build
```

### Development Mode

```bash
# Watch blocks for changes
npm run block:start

# No widget watch mode (build after changes)
npm run widget:build
```

---

## Troubleshooting

### Widget Not Loading

**Check:**
1. Script tag URL is correct
2. API URL is accessible (check CORS if external site)
3. Browser console for JavaScript errors
4. Network tab for failed API requests

### Profiles Not Showing

**Check:**
1. REST API endpoint is accessible: `/wp-json/frs-users/v1/profiles`
2. Profiles exist in WordPress
3. Profiles have required fields (name, email)
4. Network tab shows successful API response

### Styling Issues

**Common fixes:**
1. Add `!important` to override styles
2. Check browser DevTools for CSS conflicts
3. Verify widget CSS file is loading
4. Increase CSS specificity

### CORS Errors (External Sites)

If embedding on an external website, you may need to enable CORS on your WordPress site:

```php
// Add to functions.php or plugin
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

---

## Support

For issues, questions, or feature requests, please contact your development team.

---

## License

Proprietary - Full Realty Services
