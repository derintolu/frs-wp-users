import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Users,
  Wrench,
  Edit,
  Link,
  Calculator,
  Save,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  ExternalLink
} from 'lucide-react';
import type { User as UserType } from '@/frontend/portal/utils/dataService';
import { CollapsibleSidebar, MenuItem } from '@/components/ui/CollapsibleSidebar';
import { calculateProfileCompletion } from '@/frontend/portal/utils/profileCompletion';
import { CustomizerPreview, type Breakpoint } from './CustomizerPreview';
import { useProfileEdit } from '@/frontend/portal/contexts/ProfileEditContext';

interface ProfileCustomizerLayoutProps {
  currentUser: UserType;
  userId: string;
}

type SidebarView = 'menu' | 'edit-personal' | 'edit-professional' | 'edit-social' | 'tool-calculator' | 'tool-valuation' | 'settings';

export function ProfileCustomizerLayout({ currentUser, userId }: ProfileCustomizerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeSection, handleCancel, handleSave, isSaving, setActiveSection } = useProfileEdit();
  const [headerHeight, setHeaderHeight] = useState<string>('0px');

  // Check if running in content-only mode (no sidebar)
  const contentOnly = (window as any).frsPortalConfig?.contentOnly || false;

  // Start collapsed on mobile (< 768px), open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  // Sidebar view state - controls what content shows in sidebar
  const [sidebarView, setSidebarView] = useState<SidebarView>('menu');

  // Profile data state - shared between sidebar forms and preview
  const [profileData, setProfileData] = useState<any>(null);

  // Viewport preview state
  const [viewport, setViewport] = useState<Breakpoint>('desktop');

  // Watch for activeSection changes - return to menu when edit mode exits
  useEffect(() => {
    if (activeSection === null && sidebarView !== 'menu') {
      // Only return to menu if we're in an edit view
      if (sidebarView.startsWith('edit-')) {
        setSidebarView('menu');
      }
    }
  }, [activeSection, sidebarView]);

  // Get gradient URL from WordPress data
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || (window as any).frsSidebarData?.gradientUrl || '';

  // Calculate total offset (header + admin bar)
  useEffect(() => {
    const calculateHeaderHeight = () => {
      let totalOffset = 0;

      // Check for WordPress admin bar
      const adminBar = document.getElementById('wpadminbar');
      if (adminBar) {
        totalOffset += adminBar.getBoundingClientRect().height;
        console.log('Admin bar height:', adminBar.getBoundingClientRect().height);
      }

      // Try multiple Blocksy header selectors
      const selectors = [
        'header[data-id]',
        '.ct-header',
        'header.site-header',
        '#header',
        'header[id^="ct-"]',
        'header'
      ];

      let blocksyHeader = null;
      for (const selector of selectors) {
        blocksyHeader = document.querySelector(selector);
        if (blocksyHeader) {
          console.log('Found header with selector:', selector);
          break;
        }
      }

      if (blocksyHeader) {
        const height = blocksyHeader.getBoundingClientRect().height;
        totalOffset += height;
        console.log('Blocksy header height:', height);
      }

      console.log('Total offset (admin bar + header):', totalOffset);
      setHeaderHeight(`${totalOffset}px`);
    };

    // Calculate immediately
    calculateHeaderHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeaderHeight);

    // Cleanup
    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  // Determine if we're on a profile page
  const isProfilePage = location.pathname.startsWith('/profile');

  // Map currentUser to the format expected by ProfileCompletionCard
  const [profileMetadata, setProfileMetadata] = useState({
    bio: '',
    company: '',
    email: '',
    facebook_url: '',
    first_name: '',
    instagram_url: '',
    job_title: '',
    last_name: '',
    linkedin_url: '',
    nmls_id: '',
    phone: '',
  });

  // Profile completion card state
  const [isCardDismissed, setIsCardDismissed] = useState(false);
  const [hasReached100Percent, setHasReached100Percent] = useState(false);

  // Load complete profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Fetch from frs-users plugin profile endpoint
        const response = await fetch('/wp-json/frs-users/v1/profiles/user/me', {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
          }
        });

        if (response.ok) {
          const result = await response.json();
          const profileData = result.data || result;

          // Store full profile data for completion calculation
          setProfileMetadata(profileData);
        } else {
          // Fallback to basic user data if profile not found
          const nameParts = (currentUser.name || '').split(' ');
          setProfileMetadata({
            bio: '',
            company: '21st Century Lending',
            email: currentUser.email || '',
            facebook_url: '',
            first_name: nameParts[0] || '',
            instagram_url: '',
            job_title: '',
            last_name: nameParts.slice(1).join(' ') || '',
            linkedin_url: '',
            nmls_id: '',
            phone: '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile metadata:', error);
        // Fallback to basic user data
        const nameParts = (currentUser.name || '').split(' ');
        setProfileMetadata({
          bio: '',
          company: '21st Century Lending',
          email: currentUser.email || '',
          facebook_url: '',
          first_name: nameParts[0] || '',
          instagram_url: '',
          job_title: '',
          last_name: nameParts.slice(1).join(' ') || '',
          linkedin_url: '',
          nmls_id: '',
          phone: '',
        });
      }
    };

    loadProfileData();
  }, [currentUser]);

  // Check if user has reached 100% profile completion (persisted in user meta)
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const response = await fetch(`/wp-json/wp/v2/users/me`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const reached100 = userData.meta?.profile_completion_reached_100 === '1';
          setHasReached100Percent(reached100);
        }
      } catch (error) {
        console.error('Failed to check completion status:', error);
      }
    };

    checkCompletionStatus();
  }, []);

  // Update user meta when profile reaches 100% completion
  useEffect(() => {
    const updateCompletionStatus = async () => {
      // Calculate current completion
      const completion = calculateProfileCompletion(profileMetadata);

      // If reached 100% and not yet marked in user meta
      if (completion.percentage >= 100 && !hasReached100Percent) {
        try {
          const response = await fetch(`/wp-json/wp/v2/users/me`, {
            body: JSON.stringify({
              meta: {
                profile_completion_reached_100: '1'
              }
            }),
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
            },
            method: 'POST'
          });

          if (response.ok) {
            setHasReached100Percent(true);
            console.log('Profile completion 100% status saved');
          }
        } catch (error) {
          console.error('Failed to update completion status:', error);
        }
      }
    };

    // Only run if we have profile metadata
    if (profileMetadata.email) {
      updateCompletionStatus();
    }
  }, [profileMetadata, hasReached100Percent]);

  // Handle dismiss button click
  const handleDismissProfileCard = () => {
    setIsCardDismissed(true);
  };

  // Convert navigation items to CollapsibleSidebar MenuItem format
  // Show profile-specific menu when on profile page
  const shouldShowProfileCard = isProfilePage && !hasReached100Percent && !isCardDismissed;

  // Profile link viewer widget
  const profileUrl = currentUser?.profile_slug
    ? `${window.location.origin}/profile/${currentUser.profile_slug}`
    : '';

  const handleCopyProfileLink = async () => {
    if (profileUrl) {
      try {
        await navigator.clipboard.writeText(profileUrl);
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Profile link copied!';
        document.body.append(toast);
        setTimeout(() => toast.remove(), 3000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleOpenProfileLink = () => {
    if (profileUrl) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const profileLinkWidget = (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Profile Link
      </div>
      <div className="mb-2 rounded-md border border-gray-200 bg-white p-2">
        <div className="truncate text-xs text-gray-600" title={profileUrl}>
          {currentUser?.profile_slug || 'No profile slug'}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          className="flex flex-1 items-center justify-center gap-1.5"
          onClick={handleCopyProfileLink}
          size="sm"
          variant="outline"
        >
          <Copy className="size-3.5" />
          <span className="text-xs">Copy</span>
        </Button>
        <Button
          className="flex flex-1 items-center justify-center gap-1.5"
          onClick={handleOpenProfileLink}
          size="sm"
          variant="outline"
        >
          <ExternalLink className="size-3.5" />
          <span className="text-xs">Open</span>
        </Button>
      </div>
    </div>
  );

  // Device preview controls widget
  const devicePreviewWidget = (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Preview Size
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() => setViewport('desktop')}
          size="sm"
          style={viewport === 'desktop' ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            color: 'white'
          } : {}}
          variant={viewport === 'desktop' ? 'default' : 'outline'}
        >
          <Monitor className="size-4" />
        </Button>
        <Button
          className="flex-1"
          onClick={() => setViewport('tablet')}
          size="sm"
          style={viewport === 'tablet' ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            color: 'white'
          } : {}}
          variant={viewport === 'tablet' ? 'default' : 'outline'}
        >
          <Tablet className="size-4" />
        </Button>
        <Button
          className="flex-1"
          onClick={() => setViewport('mobile')}
          size="sm"
          style={viewport === 'mobile' ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            color: 'white'
          } : {}}
          variant={viewport === 'mobile' ? 'default' : 'outline'}
        >
          <Smartphone className="size-4" />
        </Button>
      </div>
    </div>
  );

  // Calculate live profile completion
  const currentCompletion = calculateProfileCompletion(profileMetadata);
  const completionPercentage = hasReached100Percent ? 100 : currentCompletion.percentage;

  // Thin horizontal progress bar widget
  const profileProgressWidget = (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Profile Completion
        </div>
        <div className="text-xs font-semibold text-gray-700">
          {completionPercentage}%
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            width: `${completionPercentage}%`,
          }}
        />
      </div>
    </div>
  );

  const menuItems: MenuItem[] = [
    // Device preview controls - only show on profile page
    ...(isProfilePage ? [{
      customWidget: devicePreviewWidget,
      id: 'device-preview-widget',
      label: ''
    }] : []),
    { icon: Users, id: 'edit-personal', label: 'Personal Information' },
    { icon: Edit, id: 'edit-professional', label: 'Professional Details' },
    { icon: Link, id: 'edit-social', label: 'Links & Social' },
    {
      children: [
        { id: 'tool-calculator', label: 'Mortgage Calculator' },
        { id: 'tool-valuation', label: 'Property Valuation' },
      ],
      icon: Calculator,
      id: 'tools',
      label: 'Tools'
    },
    { icon: Wrench, id: 'settings', label: 'Settings' },
    // Profile link viewer - below settings, only show on profile page
    ...(isProfilePage ? [{
      customWidget: profileLinkWidget,
      id: 'profile-link-widget',
      label: ''
    }] : []),
    // Thin progress bar - only show if not at 100% and not dismissed
    ...(shouldShowProfileCard ? [{
      customWidget: profileProgressWidget,
      id: 'profile-progress-widget',
      label: ''
    }] : []),
  ];

  // Check if on profile page
  const isOnProfile = location.pathname === '/profile' || location.pathname.startsWith('/profile/');

  // Header content - Compact horizontal layout
  const sidebarHeader = (
    <div className="relative w-full overflow-hidden">
      {/* Gradient Banner */}
      <div
        className="relative w-full overflow-visible"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
          height: '100px'
        }}
      >
        {/* Animated Video Background */}
        {gradientUrl && (
          <>
            <video
              autoPlay
              className="absolute inset-0 size-full object-cover"
              loop
              muted
              playsInline
              style={{ zIndex: 0 }}
            >
              <source src={gradientUrl} type="video/mp4" />
            </video>
            {/* Dark overlay for text readability */}
            <div
              className="absolute inset-0 bg-black/20"
              style={{ zIndex: 1 }}
            />
          </>
        )}

        {/* Avatar and Name - Horizontal Layout */}
        <div
          className="relative flex w-full items-center gap-3 p-4"
          style={{ zIndex: 10 }}
        >
          {/* Avatar with gradient border */}
          <div className="shrink-0">
            <div
              className="size-14 overflow-hidden rounded-full shadow-lg"
              style={{
                backgroundClip: 'padding-box, border-box',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundOrigin: 'padding-box, border-box',
                border: '2px solid transparent',
              }}
            >
              <img
                alt={currentUser.name || 'User'}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`;
                }}
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`}
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 truncate text-base font-bold text-white drop-shadow-md">{currentUser.name}</h3>
            <p className="truncate text-sm font-normal text-white drop-shadow-md">{profileMetadata.job_title || 'Loan Officer'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Sidebar footer
  const sidebarFooter = null;

  const handleItemClick = (item: MenuItem) => {
    // Map menu item IDs to sidebar views
    const viewMap: Record<string, SidebarView> = {
      'edit-personal': 'edit-personal',
      'edit-professional': 'edit-professional',
      'edit-social': 'edit-social',
      'settings': 'settings',
      'tool-calculator': 'tool-calculator',
      'tool-valuation': 'tool-valuation',
    };

    if (viewMap[item.id]) {
      setSidebarView(viewMap[item.id]);

      // Set active section for editing
      if (item.id === 'edit-personal') {
        setActiveSection('personal');
      } else if (item.id === 'edit-professional') {
        setActiveSection('professional');
      } else if (item.id === 'edit-social') {
        setActiveSection('social');
      } else {
        setActiveSection(null);
      }
    }
  };

  // Render sidebar content based on current view
  const renderSidebarContent = () => {
    if (sidebarView === 'menu') {
      // Return the normal menu (handled by CollapsibleSidebar)
      return null;
    }

    // Render edit forms or tools
    return (
      <div className="p-4">
        <button
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          onClick={() => {
            // If editing, cancel changes first
            if (activeSection && handleCancel) {
              handleCancel();
            }
            setSidebarView('menu');
            setActiveSection(null);
          }}
        >
          ← Back to Menu
        </button>

        {sidebarView === 'edit-personal' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Personal Information</h2>
            <p className="text-sm text-gray-600">Edit your name, contact details, job title, and location.</p>

            {/* Save and Cancel Buttons */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <Button
                className="h-11 w-full font-semibold text-white shadow-lg"
                disabled={isSaving || !handleSave}
                onClick={async () => {
                  if (handleSave) {
                    await handleSave();
                    // Sidebar will return to menu automatically via useEffect when activeSection becomes null
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                className="h-11 w-full border-2 border-gray-300 font-semibold transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-700"
                disabled={isSaving}
                onClick={() => {
                  if (handleCancel) {
                    handleCancel();
                  }
                  setSidebarView('menu');
                  setActiveSection(null);
                }}
                variant="outline"
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sidebarView === 'edit-professional' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Professional Details</h2>
            <p className="text-sm text-gray-600">Edit your biography, specialties, credentials, and service areas.</p>

            {/* Save and Cancel Buttons */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <Button
                className="h-11 w-full font-semibold text-white shadow-lg"
                disabled={isSaving || !handleSave}
                onClick={async () => {
                  if (handleSave) {
                    await handleSave();
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                className="h-11 w-full border-2 border-gray-300 font-semibold transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-700"
                disabled={isSaving}
                onClick={() => {
                  if (handleCancel) {
                    handleCancel();
                  }
                  setSidebarView('menu');
                  setActiveSection(null);
                }}
                variant="outline"
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sidebarView === 'edit-social' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Links & Social</h2>
            <p className="text-sm text-gray-600">Edit your social media profiles and custom links.</p>

            {/* Save and Cancel Buttons */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <Button
                className="h-11 w-full font-semibold text-white shadow-lg"
                disabled={isSaving || !handleSave}
                onClick={async () => {
                  if (handleSave) {
                    await handleSave();
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                className="h-11 w-full border-2 border-gray-300 font-semibold transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-700"
                disabled={isSaving}
                onClick={() => {
                  if (handleCancel) {
                    handleCancel();
                  }
                  setSidebarView('menu');
                  setActiveSection(null);
                }}
                variant="outline"
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sidebarView === 'tool-calculator' && (
          <div>
            <h2 className="mb-4 text-lg font-bold">Mortgage Calculator</h2>
            <p className="text-sm text-gray-600">Calculator coming soon...</p>
          </div>
        )}

        {sidebarView === 'tool-valuation' && (
          <div>
            <h2 className="mb-4 text-lg font-bold">Property Valuation</h2>
            <p className="text-sm text-gray-600">Tool coming soon...</p>
          </div>
        )}

        {sidebarView === 'settings' && (
          <div>
            <h2 className="mb-4 text-lg font-bold">Settings</h2>
            <p className="text-sm text-gray-600">Settings coming soon...</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'white',
        marginTop: 0,
        position: 'relative',
        width: '100%',
        zIndex: 1
      }}
    >
      {/* Sidebar removed - workspace theme provides navigation */}

      {/* Main Content */}
      <main className="m-0 p-0">
        <CustomizerPreview viewport={viewport}>
          <Outlet />
        </CustomizerPreview>
      </main>
    </div>
  );
}
