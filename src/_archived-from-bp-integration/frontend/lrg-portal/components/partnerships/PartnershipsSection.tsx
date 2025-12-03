import { RouterProvider, createHashRouter } from 'react-router-dom';
import { PartnershipsLayout } from './PartnershipsLayout';
import { PartnershipsList } from './PartnershipsList';
import { HybridGroupManagement } from '../loan-officer-portal/HybridGroupManagement';
import type { User } from '../../utils/dataService';

interface PartnershipsSectionProps {
  userId: string;
  currentUser: User;
}

export function PartnershipsSection({ userId, currentUser }: PartnershipsSectionProps) {
  // Create router for partnerships section
  const router = createHashRouter([
    {
      path: '/',
      element: <PartnershipsLayout currentUser={currentUser} />,
      children: [
        {
          path: '/',
          element: <PartnershipsList userId={userId} />,
        },
        {
          path: '/:slug',
          element: <HybridGroupManagement />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
