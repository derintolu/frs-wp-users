/**
 * BuddyPress Profile Layout with Sidebar
 * Wraps the BuddyPress profile content with the FRS sidebar
 * Pattern: Sidebar view transforms when entering Settings mode
 */

import { useState, useEffect } from 'react';
import { CollapsibleSidebar, MenuItem } from '@/components/ui/CollapsibleSidebar';
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
  Home,
  TrendingUp,
  Zap,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react';
import { useProfileEdit } from '@/frontend/buddypress/contexts/ProfileEditContext';
import { Button } from '@/components/ui/button';

interface BuddyPressLayoutProps {
  currentUser: {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
    profile_slug?: string;
    job_title?: string;
  };
  viewedUser?: {
    name: string;
    email: string;
    avatar?: string;
    profile_slug?: string;
    job_title?: string;
  };
  isOwnProfile: boolean;
  children?: React.ReactNode | ((props: { isEditMode: boolean; viewport: string; exitEditMode: () => void }) => React.ReactNode);
  sidebarOnly?: boolean;
  contentOnly?: boolean;
}

export function BuddyPressLayout({ currentUser, viewedUser, isOwnProfile, children, sidebarOnly, contentOnly }: BuddyPressLayoutProps) {
  const { activeSection, setActiveSection, handleCancel } = useProfileEdit();

  // Derive activeTab from current URL path
  const getActiveTabFromPath = () => {
    const path = window.location.pathname;
    if (path.includes('/welcome')) return 'welcome';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/marketing')) return 'marketing';
    if (path.includes('/lead-tracking')) return 'lead-tracking';
    if (path.includes('/tools')) return 'tools';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/notifications')) return 'notifications';
    return 'welcome'; // Default to welcome instead of profile
  };

  const activeTab = getActiveTabFromPath();
  const [headerHeight, setHeaderHeight] = useState<string>('0px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
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

  // Get base portal URL based on user role
  const getPortalBase = () => {
    // TODO: Determine portal type from user role (lo or re)
    // For now, default to 'lo'
    return 'lo';
  };

  // Menu items for sidebar - Different tabs for own profile vs viewing others
  // Menu items change based on edit mode
  const normalMenuItems: MenuItem[] = isOwnProfile
    ? [
        // Own profile - full access
        { id: 'welcome', label: 'Welcome', icon: Home, page: 'welcome' },
        { id: 'profile', label: 'Profile', icon: User, page: 'profile' },
        {
          id: 'marketing',
          label: 'Marketing',
          icon: TrendingUp,
          page: 'marketing',
          children: [
            { id: 'marketing-calendar', label: 'Calendar', subpage: 'marketing-calendar' },
            { id: 'landing-pages', label: 'Landing Pages', subpage: 'landing-pages' },
            { id: 'email-campaigns', label: 'Email Campaigns', subpage: 'email-campaigns' },
            { id: 'local-seo', label: 'Local SEO', subpage: 'local-seo' },
            { id: 'brand-guide', label: 'Brand Guide', subpage: 'brand-guide' },
            { id: 'orders', label: 'Orders', subpage: 'orders' },
          ]
        },
        { id: 'lead-tracking', label: 'Lead Tracking', icon: UserCheck, page: 'lead-tracking' },
        {
          id: 'tools',
          label: 'Tools',
          icon: Zap,
          subpage: 'tools',
          children: [
            { id: 'mortgage-calculator', label: 'Mortgage Calculator', subpage: 'mortgage-calculator' },
            { id: 'property-valuation', label: 'Property Valuation', subpage: 'property-valuation' },
          ]
        },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, subpage: 'settings' },
        { id: 'notifications', label: 'Notifications', icon: Bell, subpage: 'notifications' },
      ]
    : [
        // Viewing someone else - public tabs only
        { id: 'profile', label: 'Profile', icon: User },
      ];

  // Edit mode menu items
  const editMenuItems: MenuItem[] = [
    { id: 'edit-personal', label: 'Personal Information', icon: UserCircle },
    { id: 'edit-professional', label: 'Professional Details', icon: Briefcase },
    { id: 'edit-social', label: 'Links & Social', icon: Share2 },
  ];

  const menuItems = isEditMode ? editMenuItems : normalMenuItems;

  // Profile URL and handlers
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

  // Profile link widget
  const profileLinkWidget = (
    <div className="px-4 py-3" style={{
      backgroundColor: '#0B102C'
    }}>
      <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
        Profile Link
      </div>
        <div className="text-sm text-white mb-2 p-2 bg-white/10 rounded border border-[#0B102C] truncate">
          {displayUser?.profile_slug || 'No profile slug'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyProfileLink}
            disabled={!profileUrl}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
          <button
            onClick={handleOpenProfileLink}
            disabled={!profileUrl}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </button>
        </div>
    </div>
  );

  // Profile completion widget (placeholder - would need real data)
  const profileCompletionWidget = (
    <div className="relative px-4 py-3 border-y border-white/10 overflow-hidden" style={{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      background: gradientUrl ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
    }}>
      {/* Video Background */}
      {gradientUrl ? (
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
          {/* Translucent white overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1
            }}
          />
        </>
      ) : null}

      {/* Content */}
      <div className="relative" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-white uppercase tracking-wider drop-shadow-md">
            Profile Completion
          </div>
          <div className="text-sm font-semibold text-white drop-shadow-md">50%</div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 border border-white/30">
          <div
            className="h-2 rounded-full bg-white shadow-sm"
            style={{
              width: '50%',
            }}
          />
        </div>
      </div>
    </div>
  );

  // Sidebar header
  const sidebarHeader = (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#0B102C', width: '320px' }}>
      {/* Header Background */}
      <div
        className="relative overflow-visible"
        style={{
          backgroundColor: '#0B102C',
          height: '100px',
          width: '320px'
        }}
      >
        {/* Animated Video Background */}
        {gradientUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 object-cover"
            style={{ zIndex: 0, width: '320px', height: '100px' }}
          >
            <source src={gradientUrl} type="video/mp4" />
          </video>
        )}

        {/* Avatar and Name - Horizontal Layout */}
        <div
          className="relative w-full h-full px-4 flex items-center justify-center gap-3"
          style={{ zIndex: 10 }}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-[42px] h-[42px] rounded-full overflow-hidden shadow-lg border-2 border-white/20"
            >
              <img
                src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'User')}&background=2DD4DA&color=fff`}
                alt={displayUser.name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'User')}&background=2DD4DA&color=fff`;
                }}
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-0.5 truncate">{displayUser.name}</h3>
            <p className="font-normal text-white text-sm truncate">{displayUser.job_title || ''}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile / Exit Customizer Button - Only show on own profile */}
      {isOwnProfile && (
        <div className="px-4 py-2 border-y border-white/10" style={{
          backgroundColor: '#0B102C'
        }}>
          <button
            onClick={() => {
              const newEditMode = !isEditMode;
              setIsEditMode(newEditMode);
              setSidebarView('menu');
              setActiveSection(null);
              // Dispatch event for content area (separate React tree)
              window.dispatchEvent(new CustomEvent('frsEditMode', {
                detail: { isEditMode: newEditMode }
              }));
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium text-white border border-white/20"
          >
            {isEditMode ? (
              <>
                <X className="h-4 w-4" />
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Exit Customizer</span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" style={{
                  color: '#2563eb',
                }} />
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Edit Profile</span>
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
        // Dispatch event for content area (separate React tree) to show overlay
        window.dispatchEvent(new CustomEvent('frsEditSection', {
          detail: { section, sidebarView: item.id }
        }));
      }
    } else if (item.id === 'settings') {
      // Enter settings mode - transform sidebar
      setSidebarView('settings-menu');
      // Dispatch event for WordPress Interactivity API
      window.dispatchEvent(new CustomEvent('frsPortalNavigate', {
        detail: { subPage: item.id }
      }));
    } else {
      // Dispatch event for WordPress Interactivity API
      window.dispatchEvent(new CustomEvent('frsPortalNavigate', {
        detail: { subPage: item.id }
      }));
    }
  };

  // Handle clicking a settings section item
  const handleSettingsSectionClick = (section: 'personal' | 'professional' | 'social') => {
    const viewMap = {
      'personal': 'edit-personal',
      'professional': 'edit-professional',
      'social': 'edit-social',
    } as const;

    setSidebarView(viewMap[section]);
    setActiveSection(section);
    // State change is sufficient, no URL change needed
  };

  // Handle clicking an edit profile section item
  const handleEditProfileSectionClick = (section: 'personal' | 'professional' | 'social') => {
    const viewMap = {
      'personal': 'edit-profile-personal',
      'professional': 'edit-profile-professional',
      'social': 'edit-profile-social',
    } as const;

    setSidebarView(viewMap[section]);
    setActiveSection(section);
    // State change is sufficient, no URL change needed
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
            onClick={() => {
              setSidebarView('menu');
              setActiveTab('profile');
              if (onActiveTabChange) {
                onActiveTabChange('profile');
              }
            }}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Menu
          </button>

          <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
          <p className="text-sm text-gray-600 mb-6">Choose a section to edit:</p>

          <div className="space-y-2">
            <button
              onClick={() => handleSettingsSectionClick('personal')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <UserCircle className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Personal Information</div>
                <div className="text-xs text-gray-500">Name, contact, location, service areas</div>
              </div>
            </button>

            <button
              onClick={() => handleSettingsSectionClick('professional')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Briefcase className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Professional Details</div>
                <div className="text-xs text-gray-500">Bio, specialties, credentials</div>
              </div>
            </button>

            <button
              onClick={() => handleSettingsSectionClick('social')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
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
        title: 'Personal Information',
        description: 'Edit your name, contact details, job title, location, and service areas.',
      },
      'edit-professional': {
        title: 'Professional Details',
        description: 'Edit your biography, specialties, and credentials.',
      },
      'edit-social': {
        title: 'Links & Social',
        description: 'Edit your social media profiles and custom links.',
      },
    };

    const info = sectionInfo[sidebarView as keyof typeof sectionInfo];
    if (!info) return null;

    return (
      <div className="p-4">
        <button
          onClick={() => {
            // If editing, cancel changes first
            if (activeSection && handleCancel) {
              handleCancel();
            }
            setSidebarView('settings-menu');
            setActiveSection(null);
            // State change is sufficient, no URL change needed
          }}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
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

  // Render edit profile sidebar content
  const renderEditProfileSidebarContent = () => {
    if (sidebarView === 'edit-profile-menu') {
      // Edit profile menu - show section options with responsive preview
      return (
        <>
          {devicePreviewWidget}
          <div className="p-4">
            <button
              onClick={() => {
                setSidebarView('menu');
                setActiveTab('profile');
                setActiveSection(null);
                if (onActiveTabChange) {
                  onActiveTabChange('profile');
                }
              }}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Menu
            </button>

            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <p className="text-sm text-gray-600 mb-6">Choose a section to edit:</p>

            <div className="space-y-2">
              <button
                onClick={() => handleEditProfileSectionClick('personal')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <UserCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Personal Information</div>
                  <div className="text-xs text-gray-500">Name, contact, location, service areas</div>
                </div>
              </button>

              <button
                onClick={() => handleEditProfileSectionClick('professional')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <Briefcase className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Professional Details</div>
                  <div className="text-xs text-gray-500">Bio, specialties, credentials</div>
                </div>
              </button>

              <button
                onClick={() => handleEditProfileSectionClick('social')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Links & Social</div>
                  <div className="text-xs text-gray-500">Social media, custom links</div>
                </div>
              </button>
            </div>
          </div>
        </>
      );
    }

    // Edit views - show back button, title, description, and viewport controls
    const sectionInfo = {
      'edit-profile-personal': {
        title: 'Personal Information',
        description: 'Edit your name, contact details, job title, location, and service areas.',
      },
      'edit-profile-professional': {
        title: 'Professional Details',
        description: 'Edit your biography, specialties, and credentials.',
      },
      'edit-profile-social': {
        title: 'Links & Social',
        description: 'Edit your social media profiles and custom links.',
      },
    };

    const info = sectionInfo[sidebarView as keyof typeof sectionInfo];
    if (!info) return null;

    return (
      <>
        {devicePreviewWidget}
        <div className="p-4">
          <button
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
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Edit Menu
          </button>

          <div className="space-y-4">
            <h2 className="text-lg font-bold">{info.title}</h2>
            <p className="text-sm text-gray-600">{info.description}</p>
          </div>

          {/* Save and Cancel Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full text-white shadow-lg font-semibold h-11 gap-2"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)' }}
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              onClick={handleCancelProfile}
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-700 font-semibold h-11 gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Handle subpage navigation (for sub-pages within a main page)
  const handleSubPageNavigate = (subpage: string) => {
    window.dispatchEvent(new CustomEvent('frsPortalNavigate', {
      detail: { subPage: subpage }
    }));
  };

  // Content-only mode: render just the children without sidebar or header
  if (contentOnly) {
    return (
      <div className="w-full">
        {typeof children === 'function'
          ? children({ isEditMode, viewport, exitEditMode: () => setIsEditMode(false) })
          : children}
      </div>
    );
  }

  // Sidebar-only mode: render the same sidebar structure as full profile
  if (sidebarOnly) {
    return (
      <div
        className="overflow-hidden scrollbar-hide flex flex-col"
        style={{ height: 'calc(100dvh - 60px)', backgroundColor: '#0B102C' }}
      >
        {sidebarHeader}

        {/* Sidebar content - split into scrollable menu and fixed bottom widgets */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          {/* Menu items - take available space */}
          <div className="flex flex-col flex-1">
            {menuItems.map((item) => {
              // Edit mode items use buttons, normal items use links
              const isEditItem = item.id.startsWith('edit-');
              const url = item.page ? `/${getPortalBase()}/${item.page}/` : '#';

              if (isEditItem) {
                // Edit mode items - use button to trigger overlay
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors text-left w-full ${
                      sidebarView === item.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              }

              // Normal menu items - use links for page navigation
              // Add data-wp-router-link for WordPress Interactivity API client-side navigation
              return (
                <a
                  key={item.id}
                  href={url}
                  data-wp-router-link
                  onClick={(e) => {
                    if (item.subpage) {
                      e.preventDefault();
                      handleSubPageNavigate(item.subpage);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors text-left w-full no-underline ${
                    activeTab === item.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Bottom widgets - stick to bottom */}
          {isOwnProfile && (
            <div className="mt-auto">
              {/* Profile Completion - with video background - first */}
              <div
                className="relative overflow-hidden"
                style={{
                  minHeight: '80px',
                  background: gradientUrl ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
                }}
              >
                {/* Video Background */}
                {gradientUrl && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                  >
                    <source src={gradientUrl} type="video/mp4" />
                  </video>
                )}

                <div className="relative px-4 py-3" style={{ zIndex: 10 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-white uppercase tracking-wider drop-shadow-md">
                      Profile Completion
                    </div>
                    <div className="text-sm font-semibold text-white drop-shadow-md">50%</div>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-white"
                      style={{
                        width: '50%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Link - below profile completion */}
              {profileLinkWidget}
            </div>
          )}
        </div>

      </div>
    );
  }

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
      {/* Single sidebar - only show BuddyPress sidebar when NOT in edit mode */}
      {!isEditMode && (
        <>
        <div
          className="fixed left-0 bg-white scrollbar-hide"
          style={{
            width: '320px',
            top: headerHeight,
            bottom: 0,
            zIndex: 40,
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {sidebarHeader}

        {/* Sidebar content wrapper for animation */}
        <div className="relative overflow-hidden" style={{ height: 'calc(100% - 100px)' }}>
          {/* Menu view - slides left when edit section opens */}
          <div
            className="absolute inset-0 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out"
            style={{
              transform: sidebarView !== 'menu' ? 'translateX(-100%)' : 'translateX(0)',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              paddingBottom: isOwnProfile ? '200px' : '0'
            }}
          >
            {/* Preview Size widget - only in edit mode, at top */}
            {isEditMode && isOwnProfile && devicePreviewWidget}

            {/* Normal menu or edit mode menu */}
            <div className="flex flex-col">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    activeTab === item.id || sidebarView === item.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit section - slides in from right */}
          <div
            className="absolute inset-0 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out bg-white"
            style={{
              transform: sidebarView !== 'menu' ? 'translateX(0)' : 'translateX(100%)',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <div className="p-4">
              <h2 className="text-lg font-bold mb-2">
                {sidebarView === 'edit-personal' && 'Personal Information'}
                {sidebarView === 'edit-professional' && 'Professional Details'}
                {sidebarView === 'edit-social' && 'Links & Social'}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {sidebarView === 'edit-personal' && 'Edit your name, contact info, and bio.'}
                {sidebarView === 'edit-professional' && 'Edit your job title, company, and NMLS.'}
                {sidebarView === 'edit-social' && 'Edit your social media profiles and custom links.'}
              </p>

              {/* Save and Cancel Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Button
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
                  disabled={isSaving}
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
          </div>
        </div>

        </div>

        {/* Profile Completion - Fixed above Profile Link */}
        {isOwnProfile && (
          <div
            className="fixed left-0 overflow-hidden"
            style={{
              bottom: '120px',
              width: '320px',
              zIndex: 100,
              minHeight: '80px',
              background: gradientUrl ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
            }}
          >
            {/* Video Background */}
            {gradientUrl && (
              <>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
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

            <div className="relative px-4 py-3" style={{ zIndex: 10 }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Profile Completion
                </div>
                <div className="text-sm font-semibold text-white">50%</div>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{
                    width: '50%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile Link - Fixed at bottom, outside sidebar nav */}
        {isOwnProfile && (
          <div
            className="fixed left-0 bg-white"
            style={{
              bottom: 0,
              width: '320px',
              zIndex: 41
            }}
          >
            {profileLinkWidget}
          </div>
        )}
        </>
      )}

      {/* Main Content with slide animation */}
      <main
        className={`max-md:p-0 max-md:m-0 md:pt-4 md:pb-8 md:pl-8 md:pr-8 ${!isEditMode ? 'md:ml-[320px]' : ''} md:mr-0`}
        style={!isEditMode ? {
          transform: 'translateX(0)',
          transition: 'transform 300ms ease-in-out'
        } : undefined}
      >
        {/* Pass edit mode and viewport to children */}
        {typeof children === 'function'
          ? children({ isEditMode, viewport, exitEditMode: () => setIsEditMode(false) })
          : children}
      </main>

    </div>
  );
}
