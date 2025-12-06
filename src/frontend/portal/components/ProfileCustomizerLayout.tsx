import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Users,
  Wrench,
  Eye,
  Edit,
  Link,
  Calculator,
  Home,
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
import { ProfileCompletionCard } from './ProfileCompletionCard';
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
  const { activeSection, setActiveSection, isSaving, handleSave, handleCancel } = useProfileEdit();
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
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    company: '',
    nmls_id: '',
    bio: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
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
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: currentUser.email || '',
            phone: '',
            job_title: '',
            company: '21st Century Lending',
            nmls_id: '',
            bio: '',
            linkedin_url: '',
            facebook_url: '',
            instagram_url: '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile metadata:', err);
        // Fallback to basic user data
        const nameParts = (currentUser.name || '').split(' ');
        setProfileMetadata({
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: currentUser.email || '',
          phone: '',
          job_title: '',
          company: '21st Century Lending',
          nmls_id: '',
          bio: '',
          linkedin_url: '',
          facebook_url: '',
          instagram_url: '',
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
      } catch (err) {
        console.error('Failed to check completion status:', err);
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
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
            },
            body: JSON.stringify({
              meta: {
                profile_completion_reached_100: '1'
              }
            })
          });

          if (response.ok) {
            setHasReached100Percent(true);
            console.log('Profile completion 100% status saved');
          }
        } catch (err) {
          console.error('Failed to update completion status:', err);
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
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleOpenProfileLink = () => {
    if (profileUrl) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const profileLinkWidget = (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Profile Link
      </div>
      <div className="bg-white rounded-md border border-gray-200 p-2 mb-2">
        <div className="text-xs text-gray-600 truncate" title={profileUrl}>
          {currentUser?.profile_slug || 'No profile slug'}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyProfileLink}
          className="flex-1 flex items-center justify-center gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="text-xs">Copy</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenProfileLink}
          className="flex-1 flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="text-xs">Open</span>
        </Button>
      </div>
    </div>
  );

  // Device preview controls widget
  const devicePreviewWidget = (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Preview Size
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewport === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewport('desktop')}
          className="flex-1"
          style={viewport === 'desktop' ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            color: 'white'
          } : {}}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewport('tablet')}
          className="flex-1"
          style={viewport === 'tablet' ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            color: 'white'
          } : {}}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewport('mobile')}
          className="flex-1"
          style={viewport === 'mobile' ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            color: 'white'
          } : {}}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Calculate live profile completion
  const currentCompletion = calculateProfileCompletion(profileMetadata);
  const completionPercentage = hasReached100Percent ? 100 : currentCompletion.percentage;

  // Thin horizontal progress bar widget
  const profileProgressWidget = (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Profile Completion
        </div>
        <div className="text-xs font-semibold text-gray-700">
          {completionPercentage}%
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${completionPercentage}%`,
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
          }}
        />
      </div>
    </div>
  );

  const menuItems: MenuItem[] = [
    // Device preview controls - only show on profile page
    ...(isProfilePage ? [{
      id: 'device-preview-widget',
      label: '',
      customWidget: devicePreviewWidget
    }] : []),
    { id: 'edit-personal', label: 'Personal Information', icon: Users },
    { id: 'edit-professional', label: 'Professional Details', icon: Edit },
    { id: 'edit-social', label: 'Links & Social', icon: Link },
    {
      id: 'tools',
      label: 'Tools',
      icon: Calculator,
      children: [
        { id: 'tool-calculator', label: 'Mortgage Calculator' },
        { id: 'tool-valuation', label: 'Property Valuation' },
      ]
    },
    { id: 'settings', label: 'Settings', icon: Wrench },
    // Profile link viewer - below settings, only show on profile page
    ...(isProfilePage ? [{
      id: 'profile-link-widget',
      label: '',
      customWidget: profileLinkWidget
    }] : []),
    // Thin progress bar - only show if not at 100% and not dismissed
    ...(shouldShowProfileCard ? [{
      id: 'profile-progress-widget',
      label: '',
      customWidget: profileProgressWidget
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
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
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
          className="relative w-full px-4 py-4 flex items-center gap-3"
          style={{ zIndex: 10 }}
        >
          {/* Avatar with gradient border */}
          <div className="flex-shrink-0">
            <div
              className="size-14 rounded-full overflow-hidden shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`}
                alt={currentUser.name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`;
                }}
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-0.5 drop-shadow-md truncate">{currentUser.name}</h3>
            <p className="font-normal text-white text-sm drop-shadow-md truncate">{profileMetadata.job_title || 'Loan Officer'}</p>
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
      'tool-calculator': 'tool-calculator',
      'tool-valuation': 'tool-valuation',
      'settings': 'settings',
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
          onClick={() => {
            // If editing, cancel changes first
            if (activeSection && handleCancel) {
              handleCancel();
            }
            setSidebarView('menu');
            setActiveSection(null);
          }}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Menu
        </button>

        {sidebarView === 'edit-personal' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Personal Information</h2>
            <p className="text-sm text-gray-600">Edit your name, contact details, job title, and location.</p>

            {/* Save and Cancel Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Button
                onClick={async () => {
                  if (handleSave) {
                    await handleSave();
                    // Sidebar will return to menu automatically via useEffect when activeSection becomes null
                  }
                }}
                disabled={isSaving || !handleSave}
                className="w-full text-white shadow-lg font-semibold h-11"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  if (handleCancel) {
                    handleCancel();
                  }
                  setSidebarView('menu');
                  setActiveSection(null);
                }}
                disabled={isSaving}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-700 font-semibold h-11 transition-all"
              >
                <X className="h-4 w-4 mr-2" />
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
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Button
                onClick={async () => {
                  if (handleSave) {
                    await handleSave();
                  }
                }}
                disabled={isSaving || !handleSave}
                className="w-full text-white shadow-lg font-semibold h-11"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  if (handleCancel) {
                    handleCancel();
                  }
                  setSidebarView('menu');
                  setActiveSection(null);
                }}
                disabled={isSaving}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-700 font-semibold h-11 transition-all"
              >
                <X className="h-4 w-4 mr-2" />
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
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Button
                onClick={async () => {
                  if (handleSave) {
                    await handleSave();
                  }
                }}
                disabled={isSaving || !handleSave}
                className="w-full text-white shadow-lg font-semibold h-11"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  if (handleCancel) {
                    handleCancel();
                  }
                  setSidebarView('menu');
                  setActiveSection(null);
                }}
                disabled={isSaving}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-700 font-semibold h-11 transition-all"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sidebarView === 'tool-calculator' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Mortgage Calculator</h2>
            <p className="text-sm text-gray-600">Calculator coming soon...</p>
          </div>
        )}

        {sidebarView === 'tool-valuation' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Property Valuation</h2>
            <p className="text-sm text-gray-600">Tool coming soon...</p>
          </div>
        )}

        {sidebarView === 'settings' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Settings</h2>
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
        position: 'relative',
        zIndex: 1,
        width: '100%',
        marginTop: 0
      }}
    >
      {/* Conditionally render sidebar based on view and contentOnly mode */}
      {!contentOnly && (sidebarView === 'menu' ? (
        <CollapsibleSidebar
          menuItems={menuItems}
          activeItemId={location.pathname}
          onItemClick={handleItemClick}
          header={sidebarHeader}
          footer={sidebarFooter}
          width="320px"
          collapsedWidth="4rem"
          backgroundColor="hsl(var(--sidebar-background))"
          textColor="hsl(var(--sidebar-foreground))"
          activeItemColor="hsl(var(--sidebar-foreground))"
          activeItemBackground="linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))"
          position="left"
          topOffset={headerHeight}
          defaultCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      ) : (
        <div
          className="fixed left-0 bg-white border-r shadow-sm overflow-y-auto"
          style={{
            width: '320px',
            top: headerHeight,
            bottom: 0,
            zIndex: 40
          }}
        >
          {sidebarHeader}
          {renderSidebarContent()}
        </div>
      ))}

      {/* Main Content - ALWAYS shows profile preview in customizer style */}
      <main className={contentOnly ? "p-0 m-0 flex items-center justify-center min-h-screen" : "max-md:p-0 max-md:m-0 md:pt-8 md:pb-8 md:pl-8 md:pr-8 md:ml-[320px] md:mr-0"}>
        <CustomizerPreview viewport={viewport}>
          <Outlet />
        </CustomizerPreview>
      </main>
    </div>
  );
}
