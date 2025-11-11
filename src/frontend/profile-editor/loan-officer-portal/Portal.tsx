import { RouterProvider } from 'react-router-dom';
import { createRouter } from '../../routes';
import type { User } from '../../utils/dataService';

interface PortalProps {
  userId: string;
  currentUser: User;
}

export function Portal({ userId, currentUser }: PortalProps) {
  // Determine user role - realtor or loan-officer
  const userRole = currentUser.role === 'realtor' ? 'realtor' : 'loan-officer';

  // Create router with configuration
  const router = createRouter({
    currentUser,
    userId,
    userRole,
  });

  return <RouterProvider router={router} />;
}
