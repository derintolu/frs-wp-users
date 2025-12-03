/**
 * Hybrid BuddyPress + FRS Profile Entry Point
 *
 * Combines FRS modern profile layout with traditional BuddyPress features
 */

import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { HybridProfile } from "./HybridProfile";
import { BuddyPressLayout } from "./components/BuddyPressLayout";
import { ProfileCustomizerLayout } from "./components/ProfileCustomizerLayout";
import { ProfileEditProvider } from "./contexts/ProfileEditContext";
import "./index.css";

// Get active tab from URL path (WordPress Interactivity API handles routing)
function getActiveTabFromPath(): string {
  const path = window.location.pathname;
  if (path.includes('/welcome')) return 'welcome';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/marketing')) return 'marketing';
  if (path.includes('/lead-tracking')) return 'lead-tracking';
  if (path.includes('/tools')) return 'tools';
  if (path.includes('/settings')) return 'settings';
  if (path.includes('/notifications')) return 'notifications';
  return 'welcome';
}

// Inner component - no router needed, WordPress handles navigation
function ProfileContent({ userId, slug, sidebarOnly, contentOnly }: { userId?: string; slug?: string; sidebarOnly?: boolean; contentOnly?: boolean }) {
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Listen for WordPress Interactivity API navigation events
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      if (event.detail?.subPage) {
        setActiveTab(event.detail.subPage);
      }
    };

    window.addEventListener('frsPortalNavigate', handleNavigation as EventListener);
    return () => window.removeEventListener('frsPortalNavigate', handleNavigation as EventListener);
  }, []);

  // Listen for edit mode on/off events from sidebar (separate React tree)
  useEffect(() => {
    const handleEditMode = (event: CustomEvent) => {
      setIsEditMode(event.detail?.isEditMode ?? false);
    };

    window.addEventListener('frsEditMode', handleEditMode as EventListener);
    return () => window.removeEventListener('frsEditMode', handleEditMode as EventListener);
  }, []);

  // Get current user info from WordPress (logged-in user)
  const config = (window as any).frsBPConfig || {};
  const currentUser = {
    id: config.userId || '', // Logged-in user's ID
    name: config.userName || 'User',
    email: config.userEmail || '',
    avatar: config.userAvatar || '',
    profile_slug: config.userSlug || '',
    job_title: config.userJobTitle || '',
  };

  // Determine if viewing own profile
  const displayedUserId = config.displayedUserId || userId;
  const isOwnProfile = displayedUserId === currentUser.id;

  // Callback for HybridProfile to pass viewed user data back up
  const handleProfileLoaded = (profile: any) => {
    if (profile) {
      setViewedUser({
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        avatar: profile.headshot_url,
        profile_slug: profile.profile_slug,
        job_title: profile.job_title,
      });
    }
  };

  // If sidebar-only mode, just return the sidebar without content
  if (sidebarOnly) {
    return (
      <ProfileEditProvider>
        <BuddyPressLayout
          currentUser={currentUser}
          viewedUser={viewedUser}
          isOwnProfile={isOwnProfile}
          sidebarOnly={true}
        >
          {() => null}
        </BuddyPressLayout>
      </ProfileEditProvider>
    );
  }

  // Handler to exit edit mode
  const exitEditMode = () => {
    setIsEditMode(false);
    // Notify sidebar
    window.dispatchEvent(new CustomEvent('frsEditMode', {
      detail: { isEditMode: false }
    }));
  };

  // Content-only mode: render just the content, respond to edit events from sidebar
  if (contentOnly) {
    return (
      <ProfileEditProvider>
        {isEditMode ? (
          <ProfileCustomizerLayout
            currentUser={currentUser}
            userId={userId || currentUser.id}
            onExitEditMode={exitEditMode}
          >
            <HybridProfile
              userId={userId}
              slug={slug}
              activeTab={activeTab}
              onProfileLoaded={handleProfileLoaded}
              isEditMode={isEditMode}
              viewport={viewport}
              isOwnProfile={isOwnProfile}
            />
          </ProfileCustomizerLayout>
        ) : (
          <HybridProfile
            userId={userId}
            slug={slug}
            activeTab={activeTab}
            onProfileLoaded={handleProfileLoaded}
            isEditMode={isEditMode}
            viewport={viewport}
            isOwnProfile={isOwnProfile}
          />
        )}
      </ProfileEditProvider>
    );
  }

  // Full mode (with sidebar) - use BuddyPressLayout's internal edit mode
  return (
    <ProfileEditProvider>
      <BuddyPressLayout
        currentUser={currentUser}
        viewedUser={viewedUser}
        isOwnProfile={isOwnProfile}
        contentOnly={false}
      >
      {({ isEditMode: layoutEditMode, viewport: layoutViewport, exitEditMode: layoutExitEditMode }: any) =>
        layoutEditMode ? (
          <ProfileCustomizerLayout
            currentUser={currentUser}
            userId={userId || currentUser.id}
            onExitEditMode={layoutExitEditMode}
          >
            <HybridProfile
              userId={userId}
              slug={slug}
              activeTab={activeTab}
              onProfileLoaded={handleProfileLoaded}
              isEditMode={layoutEditMode}
              viewport={layoutViewport}
              isOwnProfile={isOwnProfile}
            />
          </ProfileCustomizerLayout>
        ) : (
          <HybridProfile
            userId={userId}
            slug={slug}
            activeTab={activeTab}
            onProfileLoaded={handleProfileLoaded}
            isEditMode={layoutEditMode}
            viewport={layoutViewport}
            isOwnProfile={isOwnProfile}
          />
        )
      }
    </BuddyPressLayout>
  </ProfileEditProvider>
  );
}

// Function to mount profiles - no router needed, WordPress Interactivity API handles navigation
function mountProfiles() {
  const roots = document.querySelectorAll('[id^="frs-buddypress-profile-root"]');

  roots.forEach((container) => {
    // Skip if already mounted
    if (container.hasAttribute('data-mounted')) {
      return;
    }

    const userId = container.getAttribute('data-user-id') || undefined;
    const slug = container.getAttribute('data-slug') || undefined;
    const sidebarOnly = container.getAttribute('data-sidebar-only') === 'true';
    const contentOnly = container.getAttribute('data-content-only') === 'true';

    try {
      createRoot(container).render(
        <ProfileContent userId={userId} slug={slug} sidebarOnly={sidebarOnly} contentOnly={contentOnly} />
      );
      container.setAttribute('data-mounted', 'true');
    } catch (error) {
      console.error('[BP Profile] Failed to mount:', error);
    }
  });
}

// Try mounting immediately (for late-loaded scripts)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountProfiles);
} else {
  // DOM is already ready
  mountProfiles();
}
