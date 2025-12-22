# ProfileCard Component

A modern, professional profile card component based on the Figma design. Features a blurred background header, circular avatar, social media links, and contact buttons.

## Features

✅ **Blurred Background Header** - Uses profile headshot for dynamic background
✅ **Circular Avatar** - With fallback to initials
✅ **Social Media Icons** - LinkedIn, Twitter, Facebook, Instagram, YouTube
✅ **Verified Badge** - Professional trust indicator
✅ **Biography Section** - With placeholder text
✅ **Contact Buttons** - Call and Email CTAs
✅ **QR Code Button** - Optional QR code overlay
✅ **Responsive Design** - Mobile-friendly layout

---

## Usage

### Basic Usage

```tsx
import { ProfileCard } from '@/components/ProfileCard';

function MyPage() {
  const profile = {
    id: 1,
    first_name: 'Derin',
    last_name: 'Tolu',
    full_name: 'Derin Tolu',
    email: 'derin@example.com',
    phone_number: '(555) 123-4567',
    job_title: 'Digital Director',
    office: 'Full Realty Services',
    city_state: 'United States',
    headshot_url: 'https://example.com/avatar.jpg',
    biography: 'Experienced digital director with a passion for innovation.',
    linkedin_url: 'https://linkedin.com/in/derintolu',
    twitter_url: 'https://twitter.com/derintolu',
    facebook_url: 'https://facebook.com/derintolu',
    instagram_url: 'https://instagram.com/derintolu',
  };

  return <ProfileCard profile={profile} />;
}
```

### With Options

```tsx
<ProfileCard
  profile={profile}
  showQRCode={true}           // Show QR code button overlay
  showContactButtons={true}   // Show Call/Email buttons
  className="shadow-xl"       // Additional Tailwind classes
/>
```

### Without Contact Buttons

```tsx
<ProfileCard
  profile={profile}
  showContactButtons={false}
/>
```

---

## Props

### `ProfileCardProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `profile` | `Profile` | **required** | Profile data object |
| `showQRCode` | `boolean` | `false` | Show QR code button overlay on avatar |
| `showContactButtons` | `boolean` | `true` | Show Call/Email buttons |
| `className` | `string` | `""` | Additional CSS classes |

### `Profile` Object

```typescript
interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  job_title?: string;
  headshot_url?: string;
  city_state?: string;
  office?: string;
  biography?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
}
```

---

## Integration Examples

### In a Block (Gutenberg)

```tsx
// src/blocks/profile-showcase/edit.tsx
import { ProfileCard } from '@/components/ProfileCard';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export default function Edit({ attributes }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiFetch({ path: `/frs-users/v1/profiles/${attributes.profileId}` })
      .then(response => setProfile(response.data));
  }, [attributes.profileId]);

  if (!profile) return <div>Loading...</div>;

  return <ProfileCard profile={profile} showQRCode={true} />;
}
```

### In Admin Interface (React SPA)

```tsx
// src/admin/pages/ProfileView.tsx
import { ProfileCard } from '@/components/ProfileCard';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProfileView() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`/wp-json/frs-users/v1/profiles/${id}`)
      .then(res => res.json())
      .then(data => setProfile(data.data));
  }, [id]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <ProfileCard
        profile={profile}
        showQRCode={true}
        showContactButtons={true}
      />
    </div>
  );
}
```

### In Widget

```tsx
// src/widget/profile-card-widget.tsx
import { createRoot } from 'react-dom/client';
import { ProfileCard } from '@/components/ProfileCard';

function ProfileCardWidget({ config }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${config.apiUrl}/frs-users/v1/profiles/${config.profileId}`)
      .then(res => res.json())
      .then(data => setProfile(data.data));
  }, [config.profileId]);

  if (!profile) return <div>Loading...</div>;

  return <ProfileCard profile={profile} />;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const widgets = document.querySelectorAll('[data-frs-profile-card]');

  widgets.forEach(widget => {
    const config = JSON.parse(widget.dataset.config || '{}');
    const root = createRoot(widget);
    root.render(<ProfileCardWidget config={config} />);
  });
});
```

---

## Styling

### Custom Colors

Override the default blue color scheme:

```tsx
<ProfileCard
  profile={profile}
  className="[&_.text-blue-600]:text-purple-600 [&_.border-blue-600]:border-purple-600 [&_.bg-blue-600]:bg-purple-600"
/>
```

### Custom Size

```tsx
<ProfileCard
  profile={profile}
  className="max-w-sm"  // Smaller
/>

<ProfileCard
  profile={profile}
  className="max-w-2xl" // Larger
/>
```

### Shadow and Border

```tsx
<ProfileCard
  profile={profile}
  className="shadow-2xl border border-gray-200"
/>
```

---

## Design Specifications

### Colors
- **Primary:** `#4678EB` (Royal Blue)
- **Secondary:** `#1D4FC4` (Persian Blue)
- **Text:** `#1A1A1A` (Cod Gray)
- **Background:** `#FFFFFF` to `#F4F4F5` gradient

### Typography
- **Name:** Roboto Bold, 34px, -0.34px tracking
- **Job Title:** Roboto Regular, 16px, -0.32px tracking
- **Body:** Roboto Regular, 16px, 22.4px line height

### Spacing
- **Container Padding:** 40px horizontal
- **Avatar Size:** 148px (w-36)
- **Button Height:** 42px
- **Gap Between Elements:** 16px (gap-4)

---

## Accessibility

- ✅ Semantic HTML structure
- ✅ Alt text for images
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Color contrast WCAG AA compliant
- ✅ Screen reader friendly

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari
- ✅ Chrome Mobile

---

## Example Variations

### Minimal (No Bio, No Buttons)

```tsx
<ProfileCard
  profile={{ ...profile, biography: undefined }}
  showContactButtons={false}
/>
```

### Full Featured

```tsx
<ProfileCard
  profile={profile}
  showQRCode={true}
  showContactButtons={true}
  className="shadow-2xl"
/>
```

### Grid Layout (Multiple Cards)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {profiles.map(profile => (
    <ProfileCard
      key={profile.id}
      profile={profile}
      showContactButtons={false}
    />
  ))}
</div>
```

---

## Future Enhancements

- [ ] QR code generation functionality
- [ ] Share button with copy link
- [ ] Download vCard functionality
- [ ] Print-friendly version
- [ ] Dark mode support
- [ ] Animation on scroll
- [ ] Skeleton loading state
- [ ] Error boundary handling

---

## Related Components

- **LoanOfficerCard** - `src/blocks/loan-officer-card/`
- **LoanOfficerDirectory** - `src/blocks/loan-officer-directory/`
- **ProfileView** - `src/admin/pages/ProfileView.tsx`

---

## Credits

Design based on Figma mockup from hub21.local project.
