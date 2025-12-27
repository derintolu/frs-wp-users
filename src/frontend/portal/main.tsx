/**
 * Portal Entry Point - Simplified
 */

import { createRoot } from "react-dom/client";
import { useState, useEffect } from 'react';
import { DataService, type User } from './utils/dataService';
import { ProfileEditProvider } from './contexts/ProfileEditContext';
import { MyProfile } from './components/MyProfile';
import "./index.css";

const portalRoot = document.getElementById("frs-users-portal-root");

function ProfilePortal() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await DataService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
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

  return (
    <ProfileEditProvider>
      <MyProfile userId={currentUser.id} />
    </ProfileEditProvider>
  );
}

if (portalRoot) {
  createRoot(portalRoot).render(<ProfilePortal />);
}
