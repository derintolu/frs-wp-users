/**
 * Portal Layout
 *
 * Main layout component with sidebar for profile management portal
 */

import { Outlet } from 'react-router-dom';
import { PortalSidebar } from './PortalSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export function PortalLayout() {
  // Get user data from window object (set by PHP)
  const userData = (window as any).frsUsersData || {};

  const userName = userData.userName || 'User';
  const userEmail = userData.userEmail || '';
  const userAvatar = userData.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;
  const userRole = userData.userRole || 'loan_officer';
  const siteName = userData.siteName || '21st Century Lending';
  const siteLogo = userData.siteLogo || '';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PortalSidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          siteName={siteName}
          siteLogo={siteLogo}
        />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
