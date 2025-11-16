/**
 * Portal Routes
 *
 * React Router configuration for frs-wp-users profile management portal
 */

import { createHashRouter } from 'react-router-dom';
import { PortalLayout } from './components/PortalLayout';
import { Dashboard } from './components/Dashboard';
import { ProfileSection } from './components/ProfileSection';

export const router = createHashRouter([
  {
    path: '/',
    element: <PortalLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <ProfileSection userRole="loan-officer" userId="me" activeTab="personal" autoEdit={false} />,
      },
      {
        path: 'profile/edit',
        element: <ProfileSection userRole="loan-officer" userId="me" activeTab="personal" autoEdit={true} />,
      },
      {
        path: 'settings',
        element: <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">Settings page coming soon...</p></div>,
      },
    ],
  },
]);
