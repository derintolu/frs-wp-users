import { createHashRouter, Navigate } from 'react-router-dom';
import { ProfileCustomizerLayout } from './components/ProfileCustomizerLayout';
import { MyProfile } from './components/MyProfile';
import type { User } from './utils/dataService';

interface RouteConfig {
  currentUser: User;
  userId: string;
  userRole: 'loan-officer' | 'realtor';
}

export const createRouter = (config: RouteConfig) => {
  const { currentUser, userId } = config;

  return createHashRouter([
    {
      path: '/',
      element: <ProfileCustomizerLayout currentUser={currentUser} userId={userId} />,
      children: [
        {
          index: true,
          element: <Navigate to="profile" replace />,
        },
        {
          path: 'profile',
          element: <MyProfile userId={userId} autoEdit={false} />,
        },
        {
          path: '*',
          element: <Navigate to="profile" replace />,
        },
      ],
    },
  ]);
};
