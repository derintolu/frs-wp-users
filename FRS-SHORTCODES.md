# FRS Shortcodes Reference

Complete list of all shortcodes available across FRS plugins for use in SureDash and other WordPress pages.

---

## 🎯 frs-wp-users Plugin

### Profile Portal Shortcodes

#### `[frs_profile]`
**Full portal with sidebar and navigation**
- Displays complete user profile management interface
- Includes sidebar navigation, header, and all sections
- Best for: Standalone profile pages

```
[frs_profile]
```

---

#### `[frs_my_profile]` ✨ NEW
**My Profile content only (no sidebar)**
- Personal, Professional, and Social profile sections
- Allows editing profile information
- No sidebar or navigation
- Best for: Embedding in SureDash pages

```
[frs_my_profile]
```

---

#### `[frs_profile_settings]` ✨ NEW
**Settings content only (no sidebar)**
- User account settings
- Privacy and notification preferences
- No sidebar or navigation
- Best for: Embedding in SureDash pages

```
[frs_profile_settings]
```

---

#### `[frs_welcome]` ✨ NEW
**Welcome dashboard content only (no sidebar)**
- Welcome bento cards
- Quick stats and overview
- No sidebar or navigation
- Best for: Embedding in SureDash pages

```
[frs_welcome]
```

---

### Directory Shortcodes

#### `[frs_profile_directory]`
**React-based profile directory with search and filters**
- Interactive directory of all profiles
- Search and filter capabilities
- Responsive grid layout

```
[frs_profile_directory]
```

---

#### `[frs_profiles_directory]`
**DataKit-powered directory**
- Advanced data table with sorting
- Filtering by profile type
- Pagination support

```
[frs_profiles_directory]
```

---

#### `[frs_profiles_dataview]`
**DataKit DataView component**
- Customizable data view
- Advanced filtering and sorting
- Export capabilities

```
[frs_profiles_dataview]
```

---

## 🤝 frs-buddypress-integration Plugin

### BuddyPress Profile Shortcodes

#### `[frs_bp_profile]`
**BuddyPress profile integration**
- Displays BuddyPress member profile
- Syncs with FRS profile data

```
[frs_bp_profile]
```

---

#### `[frs_bp_profile_view]`
**BuddyPress profile view**
- Read-only profile display
- Optimized for public viewing

```
[frs_bp_profile_view]
```

---

#### `[frs_bp_profile_card]`
**BuddyPress profile card**
- Compact profile card widget
- Shows avatar, name, title

```
[frs_bp_profile_card]
```

---

### BuddyPress Activity Shortcodes

#### `[frs_bp_activity]`
**Activity stream**
- Displays BuddyPress activity feed
- Filterable by type

```
[frs_bp_activity]
```

---

#### `[frs_bp_members]`
**Members directory**
- Lists BuddyPress members
- Search and filter support

```
[frs_bp_members]
```

---

## 🏘️ frs-partnership-portal Plugin

### Portal Shortcodes

#### `[frs_partnership_portal]`
**Complete partnership portal**
- Full partnership management interface
- Loan Officer + Realtor collaboration
- Document sharing and communication

```
[frs_partnership_portal]
```

---

#### `[frs_biolink_dashboard]`
**Bio link landing page dashboard**
- Personal landing page builder
- Link-in-bio style interface
- Analytics and customization

```
[frs_biolink_dashboard]
```

---

#### `[frs_portal_router]`
**Portal routing system**
- Handles navigation between portal sections
- React Router integration

```
[frs_portal_router]
```

---

#### `[frs_hub]`
**Partnership hub**
- Central collaboration space
- File sharing and messaging
- Partnership status tracking

```
[frs_hub]
```

---

#### `[frs_agent_signup]`
**Agent registration form**
- New agent signup process
- Profile creation workflow
- Onboarding steps

```
[frs_agent_signup]
```

---

#### `[frs_portal_sidebar]`
**Portal sidebar component**
- Reusable sidebar navigation
- Can be embedded independently

```
[frs_portal_sidebar]
```

---

### Pre-Qualification Form Shortcodes

#### `[frs_prequal_form]`
**Complete pre-qualification form**
- Full mortgage pre-qualification form
- Multi-step wizard
- Validation and submission

```
[frs_prequal_form]
```

---

#### `[frs_realtor_name]`
**Realtor name display**
- Shows current realtor's name
- Pulls from partnership data

```
[frs_realtor_name]
```

---

#### `[frs_loan_officer_name]`
**Loan officer name display**
- Shows current loan officer's name
- Pulls from profile data

```
[frs_loan_officer_name]
```

---

#### `[frs_realtor_avatar]`
**Realtor avatar display**
- Shows realtor's profile picture
- Responsive sizing

```
[frs_realtor_avatar]
```

---

#### `[frs_loan_officer_avatar]`
**Loan officer avatar display**
- Shows loan officer's profile picture
- Responsive sizing

```
[frs_loan_officer_avatar]
```

---

#### `[frs_prequal_heading_line1]`
**Pre-qual form heading line 1**
- Customizable heading text
- First line of form title

```
[frs_prequal_heading_line1]
```

---

#### `[frs_prequal_heading_line2]`
**Pre-qual form heading line 2**
- Customizable heading text
- Second line of form title

```
[frs_prequal_heading_line2]
```

---

#### `[frs_prequal_subheading]`
**Pre-qual form subheading**
- Form description text
- Explains pre-qualification process

```
[frs_prequal_subheading]
```

---

## 🏠 21c-property-tools Plugin

### Property Tools Shortcodes

#### `[property_valuation]`
**Property valuation calculator**
- Estimate home value
- Market analysis
- Comparative data

```
[property_valuation]
```

---

#### `[mortgage_calculator]`
**Mortgage payment calculator**
- Monthly payment estimates
- Interest rate calculations
- Amortization schedules

```
[mortgage_calculator]
```

---

#### `[property_landing_page]`
**Property landing page generator**
- Creates custom property pages
- Listing details and photos
- Contact forms

```
[property_landing_page]
```

---

## 📋 Usage in SureDash

### Best Practices for SureDash Integration

1. **Use content-only shortcodes** for embedding in SureDash pages:
   - `[frs_my_profile]`
   - `[frs_profile_settings]`
   - `[frs_welcome]`

2. **Create separate SureDash pages** for each content area:
   - Dashboard → `[frs_welcome]`
   - My Profile → `[frs_my_profile]`
   - Settings → `[frs_profile_settings]`
   - Directory → `[frs_profile_directory]`

3. **Let SureDash handle navigation** - Use content-only shortcodes and rely on SureDash's sidebar

4. **Combine with SureDash blocks** - Mix FRS shortcodes with SureDash identity, navigation, and content blocks

---

## 🔧 Advanced Usage

### Combining Shortcodes

Some shortcodes can be combined on the same page:

```html
<div class="profile-header">
    [frs_loan_officer_avatar]
    [frs_loan_officer_name]
</div>

<div class="tools">
    [mortgage_calculator]
    [property_valuation]
</div>
```

### Custom Attributes

Some shortcodes support custom attributes (check individual plugin documentation):

```
[frs_profile_directory class="custom-class"]
[frs_bp_activity type="updates"]
```

---

## 📚 Documentation Links

- **frs-wp-users**: See `/docs` folder for detailed guides
- **frs-buddypress-integration**: BuddyPress integration documentation
- **frs-partnership-portal**: Partnership portal setup guide
- **21c-property-tools**: Property tools configuration

---

## 🆘 Troubleshooting

### Shortcode Not Rendering

1. **Check plugin is active**: Go to Plugins → Make sure the plugin is activated
2. **Clear cache**: Run `wp cache flush` or clear your caching plugin
3. **Check for conflicts**: Temporarily disable other plugins to test
4. **Review shortcode name**: Ensure correct spelling and underscores (not hyphens)

### Styling Issues

1. **Check theme compatibility**: Some themes may override styles
2. **Use content-only shortcodes in SureDash**: Avoid sidebar conflicts
3. **Add custom CSS**: Target shortcode containers with custom classes

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
