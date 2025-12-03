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

  // Remove WordPress/theme margins on mobile for edge-to-edge layout
  useEffect(() => {
    const applyMobileStyles = () => {
      const root = document.getElementById('frs-users-portal-root');
      if (!root) return;

      if (window.innerWidth <= 767) {
        root.style.setProperty('margin-left', '0', 'important');
        root.style.setProperty('margin-right', '0', 'important');
        root.style.setProperty('width', '100%', 'important');
        root.style.setProperty('max-width', '100%', 'important');
      } else {
        root.style.removeProperty('margin-left');
        root.style.removeProperty('margin-right');
        root.style.removeProperty('width');
        root.style.removeProperty('max-width');
      }
    };

    applyMobileStyles();
    window.addEventListener('resize', applyMobileStyles);

    return () => {
      window.removeEventListener('resize', applyMobileStyles);
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await DataService.getCurrentUser();
        console.log('Loaded user from DataService:', user);
        setCurrentUser(user);
      } catch (err) {
        setError('Failed to load user data');
        console.error('Failed to load user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background animate-pulse">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex w-64 flex-col border-r bg-sidebar">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          </div>

          {/* Nav Items */}
          <div className="flex-1 p-4 space-y-2">
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex h-16 items-center gap-2 border-b px-4 bg-background">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-4 space-y-4">
            {/* Dashboard Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Portal</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load user data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <MyProfile userId={currentUser.id} />
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
