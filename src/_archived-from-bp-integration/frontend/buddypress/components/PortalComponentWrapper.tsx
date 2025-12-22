/**
 * Wrapper to make frs-lrg portal components work in BuddyPress context
 * Provides router context and navigation compatibility
 */

import { useNavigate as useRouterNavigate } from 'react-router-dom';

// Create a compatible navigate function that works in our context
export function useNavigate() {
  const routerNavigate = useRouterNavigate();

  return (path: string | number) => {
    if (typeof path === 'number') {
      // Handle back/forward navigation
      window.history.go(path);
    } else {
      // Handle route navigation
      routerNavigate(path);
    }
  };
}

// Re-export other router hooks that components might need
export { useLocation, useParams } from 'react-router-dom';
