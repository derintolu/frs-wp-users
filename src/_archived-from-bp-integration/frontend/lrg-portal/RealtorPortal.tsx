import { useState, useEffect } from 'react';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { DataService, User } from './utils/dataService';
import { getRealtorRoutes } from './components/realtor-portal/routes';

interface RealtorPortalConfig {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  restNonce: string;
}

export default function RealtorPortal(config: RealtorPortalConfig) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await DataService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load portal'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const routes = getRealtorRoutes({
    currentUser,
    userId: config.userId,
  });

  const router = createHashRouter(routes);

  return <RouterProvider router={router} />;
}
