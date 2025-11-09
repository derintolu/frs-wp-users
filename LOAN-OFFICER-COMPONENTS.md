# Loan Officer Profile Components

This document describes the reusable Loan Officer profile components available in the `frs-wp-users` plugin, which can be used in both `frs-wp-users` and `frs-lrg` plugins.

## Overview

The loan officer components provide a flexible, reusable way to display loan officer profiles with multiple size variants, detail levels, and filtering capabilities.

## Components

### 1. LoanOfficerCard

A profile card component with configurable size and detail levels.

**Location**: `src/components/loan-officer/LoanOfficerCard.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `profile` | `LoanOfficerProfile` | required | Profile data object |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Card size variant |
| `audience` | `'internal' \| 'external'` | `'external'` | Target audience (affects styling) |
| `detailLevel` | `'minimal' \| 'standard' \| 'full'` | `'standard'` | Amount of profile detail to display |
| `showContactButtons` | `boolean` | `true` | Whether to show contact action buttons |
| `onContactClick` | `(profile, method) => void` | - | Callback when contact button is clicked |

#### Size Variants

- **Small**: Compact card for grid layouts (max-width: 384px)
  - 64px avatar
  - Name and title only
  - 2 specialties max
  - Vertical layout

- **Medium**: Standard card for most uses (max-width: 448px)
  - 80px avatar
  - Name, title, contact info
  - 4 specialties max
  - Vertical layout

- **Large**: Full-featured card for details (max-width: 672px)
  - 96px avatar
  - Full profile information
  - 6 specialties max
  - Horizontal layout

#### Detail Levels

- **Minimal**: Name, title, avatar only
  - No contact information
  - No specialties or additional details
  - Perfect for quick overviews

- **Standard**: Basic professional information
  - Contact information (email, phone, location)
  - Specialties
  - Social media links
  - NMLS number badge

- **Full**: Complete profile details
  - Everything in Standard, plus:
  - Biography
  - Languages spoken
  - Awards and recognition
  - All available metadata

#### Usage Example

```tsx
import { LoanOfficerCard } from '@/components/loan-officer';

// Small card with minimal details
<LoanOfficerCard
  profile={profile}
  size="small"
  detailLevel="minimal"
  audience="external"
/>

// Medium card with standard details
<LoanOfficerCard
  profile={profile}
  size="medium"
  detailLevel="standard"
  showContactButtons={true}
  onContactClick={(profile, method) => {
    console.log(`Contact ${profile.full_name} via ${method}`);
  }}
/>

// Large card with full details (internal use)
<LoanOfficerCard
  profile={profile}
  size="large"
  detailLevel="full"
  audience="internal"
/>
```

### 2. LoanOfficerDirectory

A filterable directory of loan officers with search and filtering capabilities.

**Location**: `src/components/loan-officer/LoanOfficerDirectory.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `profiles` | `LoanOfficerProfile[]` | required | Array of profiles to display |
| `audience` | `'internal' \| 'external'` | `'external'` | Target audience (affects available filters) |
| `showFilters` | `boolean` | `true` | Whether to show filter controls |
| `initialCardSize` | `CardSize` | `'medium'` | Initial card size |
| `initialLayout` | `'grid' \| 'list'` | `'grid'` | Initial layout mode |
| `detailLevel` | `DetailLevel` | `'standard'` | Detail level for all cards |
| `onProfileClick` | `(profile) => void` | - | Callback when profile card is clicked |
| `onContactClick` | `(profile, method) => void` | - | Callback when contact button is clicked |

#### Features

- **Search**: Search by name, email, NMLS number, city/state, or job title
- **Filters**:
  - Region (dropdown)
  - Specialty (dropdown)
  - Language (dropdown)
  - Person Type (internal audience only)
- **Active Filter Display**: Shows applied filters as removable badges
- **Clear All**: One-click filter reset
- **View Controls**: Switch between small/medium/large card sizes
- **Responsive Grid**: Automatically adjusts columns based on card size
- **Empty State**: Helpful message when no results found

#### Usage Example

```tsx
import { LoanOfficerDirectory } from '@/components/loan-officer';

// External directory (public-facing)
<LoanOfficerDirectory
  profiles={profiles}
  audience="external"
  showFilters={true}
  initialCardSize="medium"
  detailLevel="standard"
  onProfileClick={(profile) => {
    // Navigate to profile details page
    window.location.href = `/loan-officers/${profile.id}`;
  }}
/>

// Internal directory (admin/staff use)
<LoanOfficerDirectory
  profiles={profiles}
  audience="internal"
  showFilters={true}
  initialCardSize="small"
  detailLevel="full"
  onProfileClick={(profile) => {
    // Open profile edit modal
    openEditModal(profile);
  }}
/>
```

## Data Structure

### LoanOfficerProfile Interface

```typescript
interface LoanOfficerProfile {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  job_title?: string;
  headshot_url?: string;
  biography?: string;
  nmls_number?: string;
  license_number?: string;
  city_state?: string;
  region?: string;
  specialties_lo?: string[];
  languages?: string[];
  awards?: string[];
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  select_person_type?: string;
}
```

## REST API

The components fetch data from the FRS Users REST API.

### Get All Profiles

```
GET /wp-json/frs-users/v1/profiles
```

**Query Parameters**:
- `type` (string): Filter by profile type
- `guests_only` (boolean): Get only guest profiles
- `per_page` (integer): Results per page (default: 50, max: 100)
- `page` (integer): Page number (default: 1)

**Example**:
```javascript
// Fetch all loan officers
const response = await fetch('/wp-json/frs-users/v1/profiles?type=loan_officer&per_page=100');
const data = await response.json();
const profiles = data.profiles;
```

### Get Single Profile

```
GET /wp-json/frs-users/v1/profiles/{id}
```

**Example**:
```javascript
const response = await fetch('/wp-json/frs-users/v1/profiles/123');
const profile = await response.json();
```

## Using in frs-lrg Plugin

To use these components in the `frs-lrg` plugin, you have several options:

### Option 1: Direct Import (Recommended for Shared Build)

If both plugins share the same node_modules and build process:

```tsx
import { LoanOfficerCard, LoanOfficerDirectory } from '../../../../frs-wp-users/src/components/loan-officer';
```

### Option 2: Copy Components (Independent Builds)

Copy the component files to `frs-lrg/src/components/loan-officer/` and maintain them independently.

### Option 3: Shared Package

Create a shared npm package that both plugins can import:

```bash
# In frs-wp-users
npm link

# In frs-lrg
npm link frs-wp-users
```

Then import:
```tsx
import { LoanOfficerCard } from 'frs-wp-users/components/loan-officer';
```

## Styling

Components use **Tailwind CSS** and **shadcn/ui** components. Ensure your project has:

1. Tailwind CSS configured
2. shadcn/ui components installed:
   - Card
   - Avatar
   - Badge
   - Button
   - Input
   - Select
   - Tabs

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported (uses modern JS/CSS features)

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Performance

- Optimized re-renders with React.memo where appropriate
- Efficient filtering with useMemo
- Lazy loading compatible
- Responsive images

## Examples

### Basic Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {profiles.map(profile => (
    <LoanOfficerCard
      key={profile.id}
      profile={profile}
      size="medium"
      detailLevel="standard"
    />
  ))}
</div>
```

### Featured Section

```tsx
<div className="container mx-auto py-12">
  <h2 className="text-3xl font-bold mb-8">Meet Our Team</h2>
  <LoanOfficerDirectory
    profiles={profiles}
    audience="external"
    initialCardSize="large"
    detailLevel="full"
    showFilters={false}
  />
</div>
```

### Admin Management

```tsx
<LoanOfficerDirectory
  profiles={allProfiles}
  audience="internal"
  showFilters={true}
  initialCardSize="small"
  detailLevel="minimal"
  onProfileClick={(profile) => router.push(`/admin/profiles/${profile.id}/edit`)}
/>
```

## Troubleshooting

### Components not rendering

1. Check that Profile model exists in database
2. Verify REST API is accessible
3. Check browser console for errors
4. Ensure all shadcn/ui dependencies are installed

### Styling issues

1. Verify Tailwind CSS is configured correctly
2. Check that all utility classes are included in build
3. Ensure CSS is loaded before component renders

### TypeScript errors

1. Install required types: `@types/react`, `@types/react-dom`
2. Check tsconfig.json includes component directory
3. Verify all interfaces are properly exported

## License

Same as parent plugin (frs-wp-users)
