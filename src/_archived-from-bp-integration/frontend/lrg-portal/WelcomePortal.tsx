import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { type User } from './utils/dataService';
import { createWelcomeRouter } from './welcome-routes';

interface WelcomePortalConfig {
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar: string;
  restNonce: string;
}

export default function WelcomePortal(config: WelcomePortalConfig) {
  // Create user object from config
  const currentUser: User = {
    id: config.userId,
    name: config.userName,
    email: config.userEmail,
    avatar: config.userAvatar,
    role: 'loan_officer'
  };

  // Remove WordPress/theme margins and width constraints on mobile for edge-to-edge layout
  useEffect(() => {
    const applyMobileStyles = () => {
      const root = document.getElementById('lrh-welcome-portal-root');
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

    // Apply immediately
    applyMobileStyles();

    // Apply on window resize
    window.addEventListener('resize', applyMobileStyles);

    return () => {
      window.removeEventListener('resize', applyMobileStyles);
    };
  }, []);

  // Determine user role - realtor or loan-officer
  const userRole = currentUser.role === 'realtor' ? 'realtor' : 'loan-officer';

  // Create router with configuration
  const router = createWelcomeRouter({
    currentUser,
    userId: String(currentUser.id),
    userRole,
  });

  return <RouterProvider router={router} />;
}
