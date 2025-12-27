import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { User } from './utils/dataService';

// Lazy load heavy components
const ProfileCustomizerLayout = lazy(() => import('./components/ProfileCustomizerLayout').then(m => ({ default: m.ProfileCustomizerLayout })));
const MyProfile = lazy(() => import('./components/MyProfile').then(m => ({ default: m.MyProfile })));

// Skeleton loader for layout
const LayoutSkeleton = () => (
  <div className="flex h-screen animate-pulse bg-background">
    <div className="hidden w-64 flex-col border-r bg-sidebar md:flex">
      <div className="border-b p-4"><div className="h-8 w-3/4 rounded bg-gray-200" /></div>
      <div className="flex-1 space-y-2 p-4">
        {[1,2,3,4].map(i => <div key={i} className="h-10 rounded bg-gray-200" />)}
      </div>
    </div>
    <div className="flex-1 p-4"><div className="h-full rounded bg-gray-100" /></div>
  </div>
);

const LazyMyProfile = ({ autoEdit, userId }: { autoEdit: boolean; userId: string }) => (
  <Suspense fallback={<div className="animate-pulse p-8">Loading...</div>}>
    <MyProfile autoEdit={autoEdit} userId={userId} />
  </Suspense>
);

interface RouteConfig {
  currentUser: User;
  userId: string;
  userRole: 'loan-officer' | 'realtor';
}

export const createRouter = (config: RouteConfig) => {
  const { currentUser, userId } = config;

  const LazyLayout = () => (
    <Suspense fallback={<LayoutSkeleton />}>
      <ProfileCustomizerLayout currentUser={currentUser} userId={userId} />
    </Suspense>
  );

  return createBrowserRouter([
    {
      children: [
        {
          element: <Navigate replace to="profile" />,
          index: true,
        },
        {
          element: <LazyMyProfile autoEdit={false} userId={userId} />,
          path: 'profile',
        },
        {
          element: <Navigate replace to="profile" />,
          path: '*',
        },
      ],
      element: <LazyLayout />,
      path: '/',
    },
  ]);
};
