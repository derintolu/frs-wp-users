/**
 * Hybrid BuddyPress + FRS Profile Entry Point
 *
 * Combines FRS modern profile layout with traditional BuddyPress features
 */

import { createRoot } from "react-dom/client";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { HybridProfile } from "./HybridProfile";
import { BuddyPressLayout } from "./components/BuddyPressLayout";
import { ProfileCustomizerLayout } from "./components/ProfileCustomizerLayout";
import { ProfileEditProvider } from "./contexts/ProfileEditContext";
import "./index.css";

// Wrapper component to manage viewed user state
function ProfileWrapper({ userId, slug }: { userId?: string; slug?: string }) {
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

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

  return (
    <MemoryRouter>
      <ProfileEditProvider>
        <BuddyPressLayout
          currentUser={currentUser}
          viewedUser={viewedUser}
          isOwnProfile={isOwnProfile}
          onActiveTabChange={setActiveTab}
        >
        {({ isEditMode, viewport, exitEditMode }: any) =>
          isEditMode ? (
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
          )
        }
      </BuddyPressLayout>
    </ProfileEditProvider>
    </MemoryRouter>
  );
}

// Function to mount profiles
function mountProfiles() {
  const roots = document.querySelectorAll('[id^="frs-buddypress-profile-root"]');

  roots.forEach((container) => {
    // Skip if already mounted
    if (container.hasAttribute('data-mounted')) {
      return;
    }

    const userId = container.getAttribute('data-user-id') || undefined;
    const slug = container.getAttribute('data-slug') || undefined;

    try {
      createRoot(container).render(
        <ProfileWrapper userId={userId} slug={slug} />
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
