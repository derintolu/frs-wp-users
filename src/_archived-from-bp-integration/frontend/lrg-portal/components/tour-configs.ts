import { Calendar, Mail, Video, Clock, FileText, User, Bell, Link, Edit } from 'lucide-react';
import { TourConfig } from './OnboardingTour';

/**
 * Profile Tour - Welcome tour for profile management
 */
export const profileTourConfig: TourConfig = {
  id: 'profile-welcome',
  variant: 'default',
  steps: [
    {
      id: 'profile-summary',
      title: 'Your Profile Info',
      description: 'This shows your current contact details and bio. You can see how your profile appears to others.',
      target: '[data-tour="profile-summary"]',
      position: 'right',
    },
    {
      id: 'announcements',
      title: 'Company Updates',
      description: 'Important announcements from your company appear here. Click any announcement to read more.',
      target: '[data-tour="announcements"]',
      position: 'right',
    },
    {
      id: 'biolink-tab',
      title: 'Manage Your Biolink',
      description: 'This tab shows your personal biolink page and any leads you receive.',
      target: '[data-tour="biolink-tab"]',
      position: 'bottom',
    },
    {
      id: 'edit-profile-tab',
      title: 'Edit Your Profile',
      description: 'Click this tab to update your personal information, contact details, and bio.',
      target: '[data-tour="edit-profile-tab"]',
      position: 'bottom',
    },
  ],
};

/**
 * Calendar Tour - Onboarding for FluentBooking calendar setup
 */
export const calendarTourConfig: TourConfig = {
  id: 'calendar-setup',
  variant: 'centered',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Your Calendar',
      description: 'Your FluentBooking calendar is ready! Let\'s set it up so clients can book appointments with you. This will only take a few minutes.',
      target: 'body',
      position: 'center',
      icon: Calendar,
    },
    {
      id: 'integrations',
      title: 'Connect Your Email Calendar',
      description: 'Sync with Google Calendar or Outlook so your availability stays up-to-date automatically. This prevents double bookings.',
      target: 'body',
      position: 'center',
      icon: Mail,
      action: {
        label: 'Open Integrations',
        url: '/wp-admin/admin.php?page=fluent-booking#/settings/integrations',
      },
    },
    {
      id: 'video-conferencing',
      title: 'Set Up Video Meetings',
      description: 'Connect Zoom or Google Meet to automatically create meeting links for your appointments.',
      target: 'body',
      position: 'center',
      icon: Video,
      action: {
        label: 'Connect Video',
        url: '/wp-admin/admin.php?page=fluent-booking#/settings/integrations',
      },
    },
    {
      id: 'availability',
      title: 'Set Your Availability',
      description: 'Tell FluentBooking when you\'re available for appointments. Set your working hours, breaks, and time off.',
      target: 'body',
      position: 'center',
      icon: Clock,
      action: {
        label: 'Set Availability',
        url: '/wp-admin/admin.php?page=fluent-booking#/settings/availability',
      },
    },
    {
      id: 'event-types',
      title: 'Create Appointment Types',
      description: 'Set up different types of appointments (15-min call, 30-min consultation, etc.) with custom durations and settings.',
      target: 'body',
      position: 'center',
      icon: FileText,
      action: {
        label: 'Create Events',
        url: '/wp-admin/admin.php?page=fluent-booking#/calendars',
      },
    },
    {
      id: 'done',
      title: 'You\'re All Set!',
      description: 'Your calendar is configured! Clients can now book appointments with you. Visit the calendar dashboard to manage bookings and settings anytime.',
      target: 'body',
      position: 'center',
      icon: Calendar,
    },
  ],
};

/**
 * Biolink Tour - Guide for biolink page creation
 */
export const biolinkTourConfig: TourConfig = {
  id: 'biolink-welcome',
  variant: 'default',
  steps: [
    {
      id: 'biolink-intro',
      title: 'Your Personal Biolink',
      description: 'Your biolink is a mobile-friendly page that consolidates all your important links in one place - perfect for Instagram, TikTok, and social media bios.',
      target: '[data-tour="biolink-preview"]',
      position: 'right',
    },
    {
      id: 'biolink-customize',
      title: 'Customize Your Links',
      description: 'Add, remove, and reorder your links. Each link can have a custom title, icon, and destination URL.',
      target: '[data-tour="biolink-links"]',
      position: 'right',
    },
    {
      id: 'biolink-design',
      title: 'Design Your Page',
      description: 'Choose colors, fonts, and background images to match your personal brand.',
      target: '[data-tour="biolink-design"]',
      position: 'right',
    },
    {
      id: 'biolink-share',
      title: 'Share Your Biolink',
      description: 'Copy your biolink URL and add it to your social media profiles. Track clicks and engagement from your analytics dashboard.',
      target: '[data-tour="biolink-share"]',
      position: 'bottom',
    },
  ],
};

/**
 * Partnership Tour - Guide for partnership management
 */
export const partnershipTourConfig: TourConfig = {
  id: 'partnership-welcome',
  variant: 'default',
  steps: [
    {
      id: 'partnerships-intro',
      title: 'Your Partnerships',
      description: 'Connect with realtors to generate referrals and co-market your services. Build your referral network here.',
      target: '[data-tour="partnerships-list"]',
      position: 'right',
    },
    {
      id: 'find-partners',
      title: 'Find Partners',
      description: 'Search our directory of realtors in your area and send partnership requests.',
      target: '[data-tour="find-partners"]',
      position: 'right',
    },
    {
      id: 'partnership-pages',
      title: 'Co-Branded Pages',
      description: 'Create joint marketing pages with your partners to capture more leads together.',
      target: '[data-tour="partnership-pages"]',
      position: 'right',
    },
    {
      id: 'partnership-leads',
      title: 'Track Referrals',
      description: 'See all leads and referrals from your partners in one dashboard.',
      target: '[data-tour="partnership-leads"]',
      position: 'bottom',
    },
  ],
};

/**
 * First-Time Welcome Tour - For brand new users
 */
export const welcomeTourConfig: TourConfig = {
  id: 'first-time-welcome',
  variant: 'centered',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Your Portal!',
      description: 'This is your command center for managing your professional presence, partnerships, and lead generation. Let\'s take a quick tour!',
      target: 'body',
      position: 'center',
      icon: User,
    },
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'First, let\'s make sure your profile is complete. Add your photo, bio, contact info, and professional details.',
      target: 'body',
      position: 'center',
      icon: Edit,
      action: {
        label: 'Edit Profile',
        onClick: () => {
          // This will be overridden by the component using the tour
          console.log('Navigate to profile edit');
        },
      },
    },
    {
      id: 'create-biolink',
      title: 'Create Your Biolink',
      description: 'Build a mobile-friendly page with all your important links - perfect for social media bios.',
      target: 'body',
      position: 'center',
      icon: Link,
    },
    {
      id: 'find-partners',
      title: 'Build Partnerships',
      description: 'Connect with realtors to grow your referral network and generate more leads.',
      target: 'body',
      position: 'center',
      icon: User,
    },
    {
      id: 'setup-calendar',
      title: 'Enable Appointment Booking',
      description: 'Set up your calendar so clients can book appointments with you directly.',
      target: 'body',
      position: 'center',
      icon: Calendar,
    },
    {
      id: 'ready',
      title: 'You\'re Ready!',
      description: 'That\'s the overview! Explore your portal and let us know if you need any help. You can always retake this tour from the help menu.',
      target: 'body',
      position: 'center',
      icon: Bell,
    },
  ],
};

/**
 * Get tour config by ID
 */
export function getTourConfig(tourId: string): TourConfig | undefined {
  const configs: Record<string, TourConfig> = {
    'profile-welcome': profileTourConfig,
    'calendar-setup': calendarTourConfig,
    'biolink-welcome': biolinkTourConfig,
    'partnership-welcome': partnershipTourConfig,
    'first-time-welcome': welcomeTourConfig,
  };

  return configs[tourId];
}
