/**
 * Portal Entry Point
 *
 * Main entry for frs-wp-users profile management portal
 */

import { createRoot } from "react-dom/client";
import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createRouter } from './routes';
import { DataService, type User } from './utils/dataService';
import { ProfileEditProvider } from './contexts/ProfileEditContext';
import { MyProfile } from './components/MyProfile';
import "./index.css";

// WordPress integration - look for the portal root element
const portalRoot = document.getElementById("frs-users-portal-root");

function ProfilePortal() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in content-only mode
  const isContentOnlyMode = (window as any).frsPortalConfig?.contentOnly === true;

  // Remove WordPress/theme margins - always for content-only mode, mobile-only otherwise
  useEffect(() => {
    const applyStyles = () => {
      const root = document.getElementById('frs-users-portal-root');
      if (!root) {return;}

      // In content-only mode, always remove margins and center content
      if (isContentOnlyMode) {
        root.style.setProperty('margin-left', '0', 'important');
        root.style.setProperty('margin-right', '0', 'important');
        root.style.setProperty('width', '100%', 'important');
        root.style.setProperty('max-width', '100%', 'important');
        root.style.setProperty('padding-left', '0', 'important');
        root.style.setProperty('padding-right', '0', 'important');
      } else if (window.innerWidth <= 767) {
        // Mobile edge-to-edge layout
        root.style.setProperty('margin-left', '0', 'important');
        root.style.setProperty('margin-right', '0', 'important');
        root.style.setProperty('width', '100%', 'important');
        root.style.setProperty('max-width', '100%', 'important');
      } else {
        root.style.removeProperty('margin-left');
        root.style.removeProperty('margin-right');
        root.style.removeProperty('width');
        root.style.removeProperty('max-width');
        root.style.removeProperty('padding-left');
        root.style.removeProperty('padding-right');
      }
    };

    applyStyles();
    window.addEventListener('resize', applyStyles);

    return () => {
      window.removeEventListener('resize', applyStyles);
    };
  }, [isContentOnlyMode]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await DataService.getCurrentUser();
        console.log('Loaded user from DataService:', user);
        setCurrentUser(user);
      } catch (error_) {
        setError('Failed to load user data');
        console.error('Failed to load user:', error_);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen animate-pulse bg-background">
        {/* Sidebar Skeleton */}
        <div className="bg-sidebar hidden w-64 flex-col border-r md:flex">
          {/* Sidebar Header */}
          <div className="border-b p-4">
            <div className="h-8 w-3/4 rounded bg-gray-300"></div>
          </div>

          {/* Nav Items */}
          <div className="flex-1 space-y-2 p-4">
            <div className="h-10 rounded bg-gray-300"></div>
            <div className="h-10 rounded bg-gray-300"></div>
            <div className="h-10 rounded bg-gray-300"></div>
            <div className="h-10 rounded bg-gray-300"></div>
            <div className="h-10 rounded bg-gray-300"></div>
          </div>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gray-300"></div>
              <div className="flex-1">
                <div className="mb-1 h-4 w-3/4 rounded bg-gray-300"></div>
                <div className="h-3 w-1/2 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center gap-2 border-b bg-background px-4">
            <div className="size-8 rounded bg-gray-300"></div>
            <div className="mx-2 h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 rounded bg-gray-300"></div>
              <div className="size-4 rounded bg-gray-300"></div>
              <div className="h-4 w-20 rounded bg-gray-300"></div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 space-y-4 p-4">
            {/* Dashboard Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-300"></div>
                <div className="h-8 w-3/4 rounded bg-gray-300"></div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-300"></div>
                <div className="h-8 w-3/4 rounded bg-gray-300"></div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-300"></div>
                <div className="h-8 w-3/4 rounded bg-gray-300"></div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-300"></div>
                <div className="h-8 w-3/4 rounded bg-gray-300"></div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="space-y-4 rounded-lg border bg-card p-6">
              <div className="mb-4 h-6 w-1/4 rounded bg-gray-300"></div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-300"></div>
                <div className="h-4 rounded bg-gray-300"></div>
                <div className="h-4 w-5/6 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Error Loading Portal</h2>
          <p className="mb-4 text-gray-600">{error || 'Unable to load user data'}</p>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Determine user role
  const userRole = currentUser.role === 'realtor' ? 'realtor' : 'loan-officer';

  // Check if we're in content-only mode (no sidebar, no router)
  const isContentOnly = (window as any).frsPortalConfig?.contentOnly === true;

  if (isContentOnly) {
    // Content-only mode: Just render the profile component directly without router or layout
    return (
      <ProfileEditProvider>
        <div className="flex w-full justify-center">
          <MyProfile userId={currentUser.id} />
        </div>
      </ProfileEditProvider>
    );
  }

  // Full portal mode: Use router with sidebar
  const router = createRouter({
    currentUser,
    userId: currentUser.id,
    userRole,
  });

  return (
    <ProfileEditProvider>
      <RouterProvider router={router} />
    </ProfileEditProvider>
  );
}

// Mount Profile Portal
if (portalRoot) {
  const config = (window as any).frsUsersData || {};
  console.log('Profile Portal mounting with config:', config);

  createRoot(portalRoot).render(<ProfilePortal />);

  console.log('Profile Portal mounted successfully');
}
