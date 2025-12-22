import { Navigate } from 'react-router-dom';
import { RealtorDashboardLayout } from './RealtorDashboardLayout';
import { RealtorOverview } from './RealtorOverview';
import type { User } from '../../utils/dataService';

interface RoutesConfig {
  currentUser: User;
  userId: string;
}

export const getRealtorRoutes = ({ currentUser, userId }: RoutesConfig) => [
  {
    path: '/',
    element: <RealtorDashboardLayout currentUser={currentUser} />,
    children: [
      {
        path: '/',
        element: <RealtorOverview userId={userId} />,
      },
      {
        path: '/marketing/*',
        element: <div className="p-8">Marketing section coming soon...</div>,
      },
      {
        path: '/loan-officers',
        element: <div className="p-8">Loan Officers section coming soon...</div>,
      },
      {
        path: '/leads',
        element: <div className="p-8">Lead Tracking coming soon...</div>,
      },
      {
        path: '/tools/*',
        element: <div className="p-8">Tools section coming soon...</div>,
      },
      {
        path: '/resources',
        element: <div className="p-8">Resources section coming soon...</div>,
      },
    ],
  },
];
