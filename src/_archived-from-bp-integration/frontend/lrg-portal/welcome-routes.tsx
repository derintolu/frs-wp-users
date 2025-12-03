import { createHashRouter } from 'react-router-dom';
import { WelcomeDashboardLayout } from './components/loan-officer-portal/WelcomeDashboardLayout';
import { WelcomeBento } from './components/loan-officer-portal/WelcomeBento';
import { OnboardingSection } from './components/OnboardingSection';
import type { User } from './utils/dataService';

interface RouteConfig {
  currentUser: User;
  userId: string;
  userRole: 'loan-officer' | 'realtor';
}

export const createWelcomeRouter = (config: RouteConfig) => {
  const { currentUser, userId } = config;

  // Check if we're in WordPress Customizer - skip URL manipulation if so
  const wpData = (window as any).frsPortalConfig;
  const isCustomizer = wpData?.isCustomizer || false;

  // Ensure the current URL has a trailing slash before the hash
  // Skip this in the WordPress Customizer to prevent breaking the customizer
  if (!isCustomizer && window.location.pathname && !window.location.pathname.endsWith('/')) {
    const newUrl = window.location.pathname + '/' + window.location.hash;
    window.history.replaceState(null, '', newUrl);
  }

  return createHashRouter([
    {
      path: '/',
      element: <WelcomeDashboardLayout currentUser={currentUser} />,
      errorElement: <WelcomeDashboardLayout currentUser={currentUser}><WelcomeBento userId={userId} /></WelcomeDashboardLayout>,
      children: [
        {
          path: '/',
          element: <WelcomeBento userId={userId} />,
        },
        {
          path: 'onboarding',
          element: <OnboardingSection userId={userId} />,
        },
        // Sidebar control hash routes - these prevent 404 errors when opening mobile menu
        {
          path: 'open-menu',
          element: <WelcomeBento userId={userId} />,
        },
        {
          path: 'close-menu',
          element: <WelcomeBento userId={userId} />,
        },
        {
          path: 'open-sidebar',
          element: <WelcomeBento userId={userId} />,
        },
        {
          path: 'close-sidebar',
          element: <WelcomeBento userId={userId} />,
        },
        // Catch-all route for any unmatched paths
        {
          path: '*',
          element: <WelcomeBento userId={userId} />,
        },
      ],
    },
  ]);
};
