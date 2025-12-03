import { useState, useEffect } from 'react';
import { LoanOfficerDashboard } from './LoanOfficerDashboard';
import { BiolinkDashboard } from './BiolinkDashboard';
import { RealtorDashboard } from './RealtorDashboard';
import { DataService } from '../utils/dataService';
import type { User } from '../utils/dataService';

interface DashboardRouterProps {
  userId: string;
  basePath?: string; // e.g., 'portal'
}

export function DashboardRouter({ userId, basePath = 'portal' }: DashboardRouterProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await DataService.getCurrentUser();
        setCurrentUser(user);

        // Determine the correct route based on user role
        const userRole = getUserPrimaryRole(user);
        const expectedRoute = getRouteForRole(userRole);

        // Check current URL path
        const currentPath = window.location.pathname;
        const expectedPath = `/${basePath}/${expectedRoute}`;

        // If we're not on the correct path, redirect
        if (!currentPath.endsWith(expectedPath)) {
          redirectToCorrectDashboard(basePath, expectedRoute);
        } else {
          setCurrentRoute(expectedRoute);
        }

      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId, basePath]);

  const getUserPrimaryRole = (user: User | null): string => {
    if (!user?.roles || !Array.isArray(user.roles)) return 'unknown';

    // Priority order: realtor_partner > loan_officer > other roles
    if (user.roles.includes('realtor_partner')) return 'realtor_partner';
    if (user.roles.includes('loan_officer')) return 'loan_officer';
    return user.roles[0] || 'unknown';
  };

  const getRouteForRole = (role: string): string => {
    switch (role) {
      case 'loan_officer':
        return 'lo'; // portal/lo
      case 'realtor_partner':
        return 're'; // portal/re
      default:
        return 'lo'; // Default to loan officer
    }
  };

  const redirectToCorrectDashboard = (basePath: string, route: string) => {
    const newUrl = `/${basePath}/${route}`;

    // Use pushState to update URL without page refresh
    window.history.pushState({}, '', newUrl);
    setCurrentRoute(route);

    // Update page title
    const titles = {
      'lo': 'Loan Officer Portal',
      're': 'Realtor Partner Portal'
    };
    document.title = titles[route as keyof typeof titles] || 'Partnership Portal';

    // Update body classes based on route
    updateBodyClassesForRoute(route);
  };

  const updateBodyClassesForRoute = (route: string) => {
    // Remove existing portal classes
    document.body.classList.remove('frs-fullpage-portal', 'frs-content-portal');

    // Add appropriate class based on route
    if (route === 'lo') {
      document.body.classList.add('frs-fullpage-portal');
    } else if (route === 're') {
      document.body.classList.add('frs-content-portal');
    }
  };

  const renderDashboardForRoute = () => {
    if (!currentUser) return null;

    switch (currentRoute) {
      case 'lo':
        // Loan officers get full-page biolink dashboard with its own header
        return (
          <div className="frs-fullpage-portal">
            <BiolinkDashboard userId={userId} currentUser={currentUser} />
          </div>
        );

      case 're':
        // Realtor partners get dashboard within WordPress content area using original dashboard header
        return (
          <div className="frs-content-portal">
            <div className="container mx-auto px-4 py-6">
              {/* Original Dashboard Header for Realtor Portal */}
              <header className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Realtor Partner Portal</h1>
                    <p className="text-gray-600 mt-2">
                      Welcome back, {currentUser.name}. Manage your partnership and marketing materials.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`}
                        alt={currentUser.name || 'User'}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`;
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                        <div className="text-xs text-gray-500">Realtor Partner</div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* Realtor Dashboard Content */}
              <RealtorDashboard userId={userId} />
            </div>
          </div>
        );

      default:
        // Default to biolink for unknown routes
        return (
          <div className="frs-fullpage-portal">
            <BiolinkDashboard userId={userId} currentUser={currentUser} />
          </div>
        );
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading portal...</p>
        </div>
      </div>
    );
  }

  // For development/testing: Add route info
  const renderRouteInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    const userRole = getUserPrimaryRole(currentUser);

    return (
      <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded text-xs">
        <div>Route: /{basePath}/{currentRoute}</div>
        <div>Role: {userRole}</div>
        <div>User: {currentUser?.display_name}</div>
      </div>
    );
  };

  return (
    <>
      {renderRouteInfo()}
      {renderDashboardForRoute()}
    </>
  );
}