import { createBrowserRouter, Navigate } from 'react-router-dom';
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

  return createBrowserRouter([
    {
      children: [
        {
          element: <Navigate replace to="profile" />,
          index: true,
        },
        {
          element: <MyProfile autoEdit={false} userId={userId} />,
          path: 'profile',
        },
        {
          element: <Navigate replace to="profile" />,
          path: '*',
        },
      ],
      element: <ProfileCustomizerLayout currentUser={currentUser} userId={userId} />,
      path: '/',
    },
  ]);
};
