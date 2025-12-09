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
function ProfileWrapper({ slug, userId }: { slug?: string, userId?: string; }) {
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Get current user info from WordPress (logged-in user)
  const config = (window as any).frsBPConfig || {};
  const currentUser = {
    avatar: config.userAvatar || '', 
    email: config.userEmail || '',
    
id: config.userId || '',
    
job_title: config.userJobTitle || '',
    // Logged-in user's ID
name: config.userName || 'User',
    profile_slug: config.userSlug || '',
  };

  // Determine if viewing own profile
  const displayedUserId = config.displayedUserId || userId;
  const isOwnProfile = displayedUserId === currentUser.id;

  // Callback for HybridProfile to pass viewed user data back up
  const handleProfileLoaded = (profile: any) => {
    if (profile) {
      setViewedUser({
        avatar: profile.headshot_url,
        email: profile.email,
        job_title: profile.job_title,
        name: `${profile.first_name} ${profile.last_name}`,
        profile_slug: profile.profile_slug,
      });
    }
  };

  return (
    <MemoryRouter>
      <ProfileEditProvider>
        <BuddyPressLayout
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          onActiveTabChange={setActiveTab}
          viewedUser={viewedUser}
        >
        {({ exitEditMode, isEditMode, viewport }: any) =>
          isEditMode ? (
            <ProfileCustomizerLayout
              currentUser={currentUser}
              onExitEditMode={exitEditMode}
              userId={userId || currentUser.id}
            >
              <HybridProfile
                activeTab={activeTab}
                isEditMode={isEditMode}
                isOwnProfile={isOwnProfile}
                onProfileLoaded={handleProfileLoaded}
                slug={slug}
                userId={userId}
                viewport={viewport}
              />
            </ProfileCustomizerLayout>
          ) : (
            <HybridProfile
              activeTab={activeTab}
              isEditMode={isEditMode}
              isOwnProfile={isOwnProfile}
              onProfileLoaded={handleProfileLoaded}
              slug={slug}
              userId={userId}
              viewport={viewport}
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
        <ProfileWrapper slug={slug} userId={userId} />
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
