# FigmaProfileCard Component

A React TypeScript profile card component that matches your Figma design specifications exactly.

## Overview

This component was generated from the Figma design and converted to use your project's tech stack:
- **React 18** with **TypeScript**
- **shadcn/ui** Button component
- **Tailwind CSS** for styling
- **QRCodeStyling** for QR code generation
- Existing project patterns and utilities

## Features

✅ **Exact Figma Match**
- 437px × 431px dimensions
- Blue border (#4678eb)
- 4px border radius
- Gradient background header with blur effect

✅ **Interactive Elements**
- Avatar flips to QR code on button click
- 3-dot menu button in top right
- Two action buttons (Schedule a Meeting, Apply Now)
- Clickable contact info (email, phone)

✅ **Design Details**
- Gradient text for job title and NMLS
- Custom icon badges for email, phone, location
- Mona Sans and Roboto fonts
- Gradient colors: `#2dd4da` → `#2563eb`

## Usage

### Basic Example

```tsx
import { FigmaProfileCard } from '@/components/FigmaProfileCard';

function App() {
  return (
    <FigmaProfileCard
      first_name="Derin"
      last_name="Tolu"
      job_title="Digital Director"
      nmls_number="959695"
      email="derin@fullrealtyservices.com"
      phone_number="917-297-7692"
      city_state="San Francisco, CA"
      headshot_url="/path/to/avatar.jpg"
      onScheduleMeeting={() => console.log('Schedule clicked')}
      onApplyNow={() => console.log('Apply clicked')}
      onMenuClick={() => console.log('Menu clicked')}
    />
  );
}
```

### With REST API

```tsx
import { useEffect, useState } from 'react';
import { FigmaProfileCard } from '@/components/FigmaProfileCard';

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/wp-json/frs-users/v1/profiles/1')
      .then(res => res.json())
      .then(data => setProfile(data.data));
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <FigmaProfileCard
      {...profile}
      onScheduleMeeting={() => {
        // Open Calendly or scheduling modal
        window.open('https://calendly.com/your-link', '_blank');
      }}
      onApplyNow={() => {
        // Redirect to application page
        window.location.href = '/apply';
      }}
      onMenuClick={() => {
        // Show dropdown menu
      }}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `first_name` | `string` | ✅ | - | First name |
| `last_name` | `string` | ✅ | - | Last name |
| `email` | `string` | ✅ | - | Email address |
| `job_title` | `string` | ❌ | `'Digital Director'` | Job title |
| `nmls_number` | `string` | ❌ | - | NMLS license number |
| `phone_number` | `string` | ❌ | - | Primary phone number |
| `mobile_number` | `string` | ❌ | - | Mobile number (fallback) |
| `city_state` | `string` | ❌ | `'San Francisco, CA'` | Location |
| `headshot_url` | `string` | ❌ | placeholder | Avatar image URL |
| `profile_slug` | `string` | ❌ | - | URL slug for profile |
| `id` | `number` | ❌ | - | Profile ID |
| `onScheduleMeeting` | `() => void` | ❌ | - | Schedule button click handler |
| `onApplyNow` | `() => void` | ❌ | - | Apply button click handler |
| `onMenuClick` | `() => void` | ❌ | - | Menu button click handler |

## Key Differences from Raw Figma Output

The Figma tool generated raw React code with Tailwind classes. This component has been adapted to:

1. ✅ **Use shadcn/ui Button** - Replaces raw button elements
2. ✅ **TypeScript Interface** - Strongly typed props based on your Profile model
3. ✅ **QR Code Integration** - Uses `QRCodeStyling` library (same as existing cards)
4. ✅ **Project Utilities** - Uses `frsPortalConfig` for gradient video and content URLs
5. ✅ **REST API Ready** - Props match your profile database schema
6. ✅ **Event Handlers** - Proper callbacks for user interactions
7. ✅ **Accessibility** - Added ARIA labels and semantic HTML
8. ✅ **Responsive Images** - Proper image handling with fallbacks

## Design System Integration

This component uses your existing design tokens:

```tsx
// Colors
const gradientBlue = '#2563eb';
const gradientCyan = '#2dd4da';
const accentCyan = '#5ce1e6';
const textBlue = '#4678eb';
const darkBlue = '#1d4fc4';

// Fonts
const titleFont = 'Mona Sans, sans-serif';
const bodyFont = 'Roboto, sans-serif';

// Border Radius
const cardRadius = '4px';
const avatarRadius = '50%';
const buttonRadius = '4px';
```

## File Locations

- Component: `src/components/FigmaProfileCard.tsx`
- Example Usage: `src/components/FigmaProfileCard.example.tsx`
- Icons: `assets/images/Button.svg`, `Email.svg`, `Phne.svg`

## Next Steps

1. **Test the Component**
   ```bash
   npm run dev:admin  # or npm run dev:portal
   ```

2. **Import in Your App**
   ```tsx
   import { FigmaProfileCard } from '@/components/FigmaProfileCard';
   ```

3. **Customize Interactions**
   - Integrate scheduling system (Calendly, etc.)
   - Add application flow
   - Implement menu dropdown

4. **Build for Production**
   ```bash
   npm run build
   ```

## Comparison with Existing Cards

| Feature | ProfileCard | DirectoryProfileCard | StandardProfileCard | **FigmaProfileCard** |
|---------|-------------|----------------------|---------------------|----------------------|
| Width | Variable | 300px | 370px | **437px** |
| Height | Variable | 420px | 520px | **431px** |
| QR Flip | ✅ | ✅ | ❌ | ✅ |
| Social Links | ✅ | ❌ | ❌ | ❌ |
| Gradient Text | ❌ | ✅ | ❌ | ✅ |
| Icon Badges | ❌ | ✅ | ❌ | ✅ |
| Menu Button | ❌ | ❌ | ❌ | ✅ |
| Border Style | Gray | None | None | **Blue** |

## Notes

- The component maintains exact Figma dimensions for pixel-perfect design
- All measurements use px values as specified in the design
- Gradient directions match Figma specifications exactly
- Icon SVGs should be added to `assets/images/` directory
