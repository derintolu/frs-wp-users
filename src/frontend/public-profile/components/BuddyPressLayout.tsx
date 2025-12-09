/**
 * BuddyPress Profile Layout with Sidebar
 * Wraps the BuddyPress profile content with the FRS sidebar
 * Pattern: Sidebar view transforms when entering Settings mode
 */

import { useState, useEffect } from 'react';
import { MenuItem } from '@/components/ui/CollapsibleSidebar';
import {
  User,
  Users,
  Calendar,
  UserCheck,
  MessageSquare,
  Settings as SettingsIcon,
  Bell,
  UserCircle,
  Briefcase,
  Share2,
  Edit,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  ExternalLink,
  Save,
  X,
} from 'lucide-react';
import { useProfileEdit } from '@/frontend/portal/contexts/ProfileEditContext';
import { Button } from '@/components/ui/button';

interface BuddyPressLayoutProps {
  children: React.ReactNode;
  currentUser: {
    avatar?: string;
    email: string;
    id?: string;
    job_title?: string;
    name: string;
    profile_slug?: string;
  };
  isOwnProfile: boolean;
  onActiveTabChange?: (tabId: string) => void;
  viewedUser?: {
    avatar?: string;
    email: string;
    job_title?: string;
    name: string;
    profile_slug?: string;
  };
}

export function BuddyPressLayout({ children, currentUser, isOwnProfile, onActiveTabChange, viewedUser }: BuddyPressLayoutProps) {
  const { activeSection, handleCancel, setActiveSection } = useProfileEdit();
  const [headerHeight, setHeaderHeight] = useState<string>('0px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [sidebarView, setSidebarView] = useState<string>('menu');
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  // Get gradient URL from WordPress data
  const gradientUrl = (window as any).frsBPConfig?.gradientUrl || '';

  // Use viewedUser if provided, otherwise use currentUser
  const displayUser = viewedUser || currentUser;

  // Watch for activeSection changes - return to settings menu when edit mode exits
  useEffect(() => {
    if (activeSection === null && sidebarView.startsWith('edit-')) {
      setSidebarView('settings-menu');
    }
  }, [activeSection, sidebarView]);

  // Calculate total offset (header + admin bar)
  useEffect(() => {
    const calculateHeaderHeight = () => {
      let totalOffset = 0;

      // Check for WordPress admin bar
      const adminBar = document.getElementById('wpadminbar');
      if (adminBar) {
        totalOffset += adminBar.getBoundingClientRect().height;
      }

      // Try multiple header selectors
      const selectors = [
        'header[data-id]',
        '.ct-header',
        'header.site-header',
        '#header',
        'header[id^="ct-"]',
        'header'
      ];

      let header = null;
      for (const selector of selectors) {
        header = document.querySelector(selector);
        if (header) {
          break;
        }
      }

      if (header) {
        const height = header.getBoundingClientRect().height;
        totalOffset += height;
      }

      setHeaderHeight(`${totalOffset}px`);
    };

    calculateHeaderHeight();
    window.addEventListener('resize', calculateHeaderHeight);
    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  // Menu items for sidebar - Different tabs for own profile vs viewing others
  // Menu items change based on edit mode
  const normalMenuItems: MenuItem[] = isOwnProfile
    ? [
        // Own profile - full access
        { icon: User, id: 'profile', label: 'Profile' },
        { icon: Calendar, id: 'experience', label: 'Experience' },
        { icon: Users, id: 'organization', label: 'Organization' },
        { icon: UserCheck, id: 'connections', label: 'Connections' },
        { icon: MessageSquare, id: 'messages', label: 'Messages' },
        { icon: SettingsIcon, id: 'settings', label: 'Settings' },
        { icon: Bell, id: 'notifications', label: 'Notifications' },
      ]
    : [
        // Viewing someone else - public tabs only
        { icon: User, id: 'profile', label: 'Profile' },
        { icon: Calendar, id: 'experience', label: 'Experience' },
        { icon: Users, id: 'organization', label: 'Organization' },
        { icon: UserCheck, id: 'connections', label: 'Connections' },
        { icon: MessageSquare, id: 'send-message', label: 'Send Message' },
      ];

  // Edit mode menu items
  const editMenuItems: MenuItem[] = [
    { icon: UserCircle, id: 'edit-personal', label: 'Personal Information' },
    { icon: Briefcase, id: 'edit-professional', label: 'Professional Details' },
    { icon: Share2, id: 'edit-social', label: 'Links & Social' },
  ];

  const menuItems = isEditMode ? editMenuItems : normalMenuItems;

  // Sidebar header
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
                alt={displayUser.name || 'User'}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'User')}&background=2DD4DA&color=fff`;
                }}
                src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'User')}&background=2DD4DA&color=fff`}
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 truncate text-base font-bold text-white drop-shadow-md">{displayUser.name}</h3>
            <p className="truncate text-sm font-normal text-white drop-shadow-md">{displayUser.job_title || 'Member'}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile / Exit Customizer Button - Only show on own profile */}
      {isOwnProfile && (
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => {
              const newEditMode = !isEditMode;
              setIsEditMode(newEditMode);
              setSidebarView('menu');
              setActiveSection(null);
              if (newEditMode) {
                setActiveTab('edit-profile');
                if (onActiveTabChange) {
                  onActiveTabChange('edit-profile');
                }
              } else {
                setActiveTab('profile');
                if (onActiveTabChange) {
                  onActiveTabChange('profile');
                }
              }
            }}
          >
            {isEditMode ? (
              <>
                <X className="size-4" />
                Exit Customizer
              </>
            ) : (
              <>
                <Edit className="size-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const handleItemClick = (item: MenuItem) => {
    // In edit mode, handle edit menu items
    if (isEditMode && item.id.startsWith('edit-')) {
      const sectionMap = {
        'edit-personal': 'personal',
        'edit-professional': 'professional',
        'edit-social': 'social',
      } as const;

      const section = sectionMap[item.id as keyof typeof sectionMap];
      if (section) {
        setActiveSection(section);
        setSidebarView(item.id);
      }
    } else if (item.id === 'settings') {
      // Enter settings mode - transform sidebar
      setSidebarView('settings-menu');
      setActiveTab('settings');
      if (onActiveTabChange) {
        onActiveTabChange('settings');
      }
    } else {
      setActiveTab(item.id);
      if (onActiveTabChange) {
        onActiveTabChange(item.id);
      }
    }
  };

  // Handle clicking a settings section item
  const handleSettingsSectionClick = (section: 'personal' | 'professional' | 'social') => {
    const viewMap = {
      'personal': 'edit-personal',
      'professional': 'edit-professional',
      'social': 'edit-social',
    } as const;

    const tabMap = {
      'personal': 'settings-personal',
      'professional': 'settings-professional',
      'social': 'settings-social',
    };

    setSidebarView(viewMap[section]);
    setActiveSection(section);
    setActiveTab(tabMap[section]);

    if (onActiveTabChange) {
      onActiveTabChange(tabMap[section]);
    }
  };

  // Handle clicking an edit profile section item
  const handleEditProfileSectionClick = (section: 'personal' | 'professional' | 'social') => {
    const viewMap = {
      'personal': 'edit-profile-personal',
      'professional': 'edit-profile-professional',
      'social': 'edit-profile-social',
    } as const;

    const tabMap = {
      'personal': 'edit-profile-personal',
      'professional': 'edit-profile-professional',
      'social': 'edit-profile-social',
    };

    setSidebarView(viewMap[section]);
    setActiveSection(section);
    setActiveTab(tabMap[section]);

    if (onActiveTabChange) {
      onActiveTabChange(tabMap[section]);
    }
  };

  // Handle save in edit profile views
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // The actual save will be handled by the ProfileEditorView component
      // This is just for UI feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return to menu after save
      setSidebarView('edit-profile-menu');
      setActiveSection(null);
      setActiveTab('edit-profile');
      if (onActiveTabChange) {
        onActiveTabChange('edit-profile');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel in edit profile views
  const handleCancelProfile = () => {
    if (activeSection && handleCancel) {
      handleCancel();
    }
    setSidebarView('edit-profile-menu');
    setActiveSection(null);
    setActiveTab('edit-profile');
    if (onActiveTabChange) {
      onActiveTabChange('edit-profile');
    }
  };

  // Render sidebar content based on current view
  const renderSettingsSidebarContent = () => {
    if (sidebarView === 'settings-menu') {
      // Settings menu - show section options
      return (
        <div className="p-4">
          <button
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            onClick={() => {
              setSidebarView('menu');
              setActiveTab('profile');
              if (onActiveTabChange) {
                onActiveTabChange('profile');
              }
            }}
          >
            ← Back to Menu
          </button>

          <h2 className="mb-4 text-lg font-bold">Edit Profile</h2>
          <p className="mb-6 text-sm text-gray-600">Choose a section to edit:</p>

          <div className="space-y-2">
            <button
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
              onClick={() => handleSettingsSectionClick('personal')}
            >
              <UserCircle className="size-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Personal Information</div>
                <div className="text-xs text-gray-500">Name, contact, location, service areas</div>
              </div>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
              onClick={() => handleSettingsSectionClick('professional')}
            >
              <Briefcase className="size-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Professional Details</div>
                <div className="text-xs text-gray-500">Bio, specialties, credentials</div>
              </div>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
              onClick={() => handleSettingsSectionClick('social')}
            >
              <Share2 className="size-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Links & Social</div>
                <div className="text-xs text-gray-500">Social media, custom links</div>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // Edit views - show back button, title, and save/cancel
    const sectionInfo = {
      'edit-personal': {
        description: 'Edit your name, contact details, job title, location, and service areas.',
        title: 'Personal Information',
      },
      'edit-professional': {
        description: 'Edit your biography, specialties, and credentials.',
        title: 'Professional Details',
      },
      'edit-social': {
        description: 'Edit your social media profiles and custom links.',
        title: 'Links & Social',
      },
    };

    const info = sectionInfo[sidebarView as keyof typeof sectionInfo];
    if (!info) {return null;}

    return (
      <div className="p-4">
        <button
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          onClick={() => {
            // If editing, cancel changes first
            if (activeSection && handleCancel) {
              handleCancel();
            }
            setSidebarView('settings-menu');
            setActiveSection(null);
            setActiveTab('settings');
            if (onActiveTabChange) {
              onActiveTabChange('settings');
            }
          }}
        >
          ← Back to Settings
        </button>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">{info.title}</h2>
          <p className="text-sm text-gray-600">{info.description}</p>
        </div>
      </div>
    );
  };

  // Profile link widget
  const profileUrl = displayUser?.profile_slug
    ? `${window.location.origin}/member/${displayUser.profile_slug}`
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
      <div className="mb-2 truncate rounded border border-gray-200 bg-white p-2 text-sm text-gray-600">
        {displayUser?.profile_slug || 'No profile slug'}
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={!profileUrl}
          onClick={handleCopyProfileLink}
          size="sm"
          variant="outline"
        >
          <Copy className="mr-1 size-3" />
          Copy
        </Button>
        <Button
          className="flex-1"
          disabled={!profileUrl}
          onClick={handleOpenProfileLink}
          size="sm"
          variant="outline"
        >
          <ExternalLink className="mr-1 size-3" />
          Open
        </Button>
      </div>
    </div>
  );

  // Profile completion widget (placeholder - would need real data)
  const profileCompletionWidget = (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Profile Completion
        </div>
        <div className="text-sm font-semibold text-gray-700">50%</div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
            width: '50%',
          }}
        />
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

  // Render edit profile sidebar content
  const renderEditProfileSidebarContent = () => {
    if (sidebarView === 'edit-profile-menu') {
      // Edit profile menu - show section options with responsive preview
      return (
        <>
          {devicePreviewWidget}
          <div className="p-4">
            <button
              className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => {
                setSidebarView('menu');
                setActiveTab('profile');
                setActiveSection(null);
                if (onActiveTabChange) {
                  onActiveTabChange('profile');
                }
              }}
            >
              ← Back to Menu
            </button>

            <h2 className="mb-4 text-lg font-bold">Edit Profile</h2>
            <p className="mb-6 text-sm text-gray-600">Choose a section to edit:</p>

            <div className="space-y-2">
              <button
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
                onClick={() => handleEditProfileSectionClick('personal')}
              >
                <UserCircle className="size-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Personal Information</div>
                  <div className="text-xs text-gray-500">Name, contact, location, service areas</div>
                </div>
              </button>

              <button
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
                onClick={() => handleEditProfileSectionClick('professional')}
              >
                <Briefcase className="size-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Professional Details</div>
                  <div className="text-xs text-gray-500">Bio, specialties, credentials</div>
                </div>
              </button>

              <button
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
                onClick={() => handleEditProfileSectionClick('social')}
              >
                <Share2 className="size-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Links & Social</div>
                  <div className="text-xs text-gray-500">Social media, custom links</div>
                </div>
              </button>
            </div>
          </div>
          {profileCompletionWidget}
          {profileLinkWidget}
        </>
      );
    }

    // Edit views - show back button, title, description, and viewport controls
    const sectionInfo = {
      'edit-profile-personal': {
        description: 'Edit your name, contact details, job title, location, and service areas.',
        title: 'Personal Information',
      },
      'edit-profile-professional': {
        description: 'Edit your biography, specialties, and credentials.',
        title: 'Professional Details',
      },
      'edit-profile-social': {
        description: 'Edit your social media profiles and custom links.',
        title: 'Links & Social',
      },
    };

    const info = sectionInfo[sidebarView as keyof typeof sectionInfo];
    if (!info) {return null;}

    return (
      <>
        {devicePreviewWidget}
        <div className="p-4">
          <button
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            onClick={() => {
              // If editing, cancel changes first
              if (activeSection && handleCancel) {
                handleCancel();
              }
              setSidebarView('edit-profile-menu');
              setActiveSection(null);
              setActiveTab('edit-profile');
              if (onActiveTabChange) {
                onActiveTabChange('edit-profile');
              }
            }}
          >
            ← Back to Edit Menu
          </button>

          <div className="space-y-4">
            <h2 className="text-lg font-bold">{info.title}</h2>
            <p className="text-sm text-gray-600">{info.description}</p>
          </div>

          {/* Save and Cancel Buttons */}
          <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
            <Button
              className="h-11 w-full gap-2 font-semibold text-white shadow-lg"
              disabled={isSaving}
              onClick={handleSaveProfile}
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)' }}
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              className="h-11 w-full gap-2 border-2 border-gray-300 font-semibold hover:border-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancelProfile}
              variant="outline"
            >
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        </div>
      </>
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
      {/* Single sidebar - only show BuddyPress sidebar when NOT in edit mode */}
      {!isEditMode && (
        <div
          className="scrollbar-hide fixed left-0 overflow-hidden bg-white"
          style={{
            WebkitOverflowScrolling: 'touch',
            bottom: 0,
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            top: headerHeight,
            width: '320px',
            zIndex: 40
          }}
        >
          {sidebarHeader}

        {/* Sidebar content wrapper for animation */}
        <div className="relative" style={{ height: 'calc(100% - 100px)' }}>
          {/* Menu view - slides left when edit section opens */}
          <div
            className="scrollbar-hide absolute inset-0 overflow-y-auto transition-transform duration-300 ease-in-out"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              transform: sidebarView !== 'menu' ? 'translateX(-100%)' : 'translateX(0)'
            }}
          >
            {/* Preview Size widget - only in edit mode, at top */}
            {isEditMode && isOwnProfile && devicePreviewWidget}

            {/* Normal menu or edit mode menu */}
            <div className="flex flex-col">
              {menuItems.map((item) => (
                <button
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    activeTab === item.id || sidebarView === item.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                >
                  <item.icon className="size-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Profile Link and Completion - always visible when viewing own profile */}
            {isOwnProfile && (
              <>
                {profileCompletionWidget}
                {profileLinkWidget}
              </>
            )}
          </div>

          {/* Edit section - slides in from right */}
          <div
            className="scrollbar-hide absolute inset-0 overflow-y-auto bg-white transition-transform duration-300 ease-in-out"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              transform: sidebarView !== 'menu' ? 'translateX(0)' : 'translateX(100%)'
            }}
          >
            <div className="p-4">
              <h2 className="mb-2 text-lg font-bold">
                {sidebarView === 'edit-personal' && 'Personal Information'}
                {sidebarView === 'edit-professional' && 'Professional Details'}
                {sidebarView === 'edit-social' && 'Links & Social'}
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                {sidebarView === 'edit-personal' && 'Edit your name, contact info, and bio.'}
                {sidebarView === 'edit-professional' && 'Edit your job title, company, and NMLS.'}
                {sidebarView === 'edit-social' && 'Edit your social media profiles and custom links.'}
              </p>

              {/* Save and Cancel Buttons */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <Button
                  className="h-11 w-full font-semibold text-white shadow-lg"
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await new Promise(resolve => setTimeout(resolve, 500));
                      setSidebarView('menu');
                      setActiveSection(null);
                    } finally {
                      setIsSaving(false);
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
          </div>
        </div>
        </div>
      )}

      {/* Main Content with slide animation */}
      <main
        className={`max-md:m-0 max-md:p-0 md:px-8 md:pb-8 md:pt-4 ${!isEditMode ? 'md:ml-[320px]' : ''} md:mr-0`}
        style={!isEditMode ? {
          transform: 'translateX(0)',
          transition: 'transform 300ms ease-in-out'
        } : undefined}
      >
        {/* Pass edit mode and viewport to children */}
        {typeof children === 'function'
          ? children({ exitEditMode: () => setIsEditMode(false), isEditMode, viewport })
          : children}
      </main>
    </div>
  );
}
