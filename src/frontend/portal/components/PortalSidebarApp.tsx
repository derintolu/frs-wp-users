/**
 * Portal Sidebar App - Standalone Component
 * Visually identical to ProfileCustomizerLayout sidebar
 * Uses menu items passed from PHP (not hardcoded here)
 */

import { useState, useEffect } from 'react';
import { CollapsibleSidebar, MenuItem } from './ui/CollapsibleSidebar';
import * as LucideIcons from 'lucide-react';

interface PortalSidebarAppProps {
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userRole: string;
  siteUrl: string;
  portalUrl: string;
  restNonce: string;
  gradientUrl: string;
  menuItems: any[];
}

export function PortalSidebarApp({
  userId,
  userName,
  userEmail,
  userAvatar,
  userRole,
  siteUrl,
  portalUrl,
  restNonce,
  gradientUrl,
  menuItems: phpMenuItems
}: PortalSidebarAppProps) {
  const [headerHeight, setHeaderHeight] = useState<string>('0px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>('home');

  // Debug logging
  console.log('[PortalSidebarApp] Props received:', {
    userId,
    userName,
    userEmail,
    gradientUrl,
    siteUrl,
    portalUrl,
  });

  // Calculate total offset (header + admin bar)
  useEffect(() => {
    const calculateHeaderHeight = () => {
      let totalOffset = 0;

      // Check for WordPress admin bar
      const adminBar = document.getElementById('wpadminbar');
      if (adminBar) {
        totalOffset += adminBar.getBoundingClientRect().height;
      }

      // Try multiple Blocksy header selectors
      const selectors = [
        'header[data-id]',
        '.ct-header',
        'header.site-header',
        '#header',
        'header[id^="ct-"]',
        'header'
      ];

      let blocksyHeader = null;
      for (const selector of selectors) {
        blocksyHeader = document.querySelector(selector);
        if (blocksyHeader) {
          break;
        }
      }

      if (blocksyHeader) {
        const height = blocksyHeader.getBoundingClientRect().height;
        totalOffset += height;
      }

      setHeaderHeight(`${totalOffset}px`);
    };

    // Calculate immediately
    calculateHeaderHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeaderHeight);

    // Cleanup
    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  // Convert PHP menu items to CollapsibleSidebar MenuItem format
  const convertMenuItems = (items: any[]): MenuItem[] => {
    return items.map(item => {
      // Get Lucide icon by name
      const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : null;

      const menuItem: MenuItem = {
        id: item.id,
        label: item.label,
        icon: IconComponent,
        url: item.url,
      };

      // Convert children if they exist
      if (item.children && item.children.length > 0) {
        menuItem.children = item.children.map((child: any) => ({
          id: child.id,
          label: child.label,
          url: child.url,
        }));
      }

      return menuItem;
    });
  };

  const menuItems = convertMenuItems(phpMenuItems);

  // Header content - User Profile Section with Gradient Background and Video
  const sidebarHeader = (
    <div
      className="relative p-6 flex flex-col items-center text-center w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
        minHeight: '200px',
      }}
    >
      {/* Animated Video Background */}
      {gradientUrl && (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src={gradientUrl} type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div
            className="absolute inset-0 bg-black/20"
            style={{ zIndex: 1 }}
          />
        </>
      )}

      {/* User Avatar */}
      <div className="relative mb-3 z-10">
        <img
          src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=2DD4DA&color=fff`}
          alt={userName || 'User'}
          className="size-20 rounded-full border-4 border-white shadow-lg"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=2DD4DA&color=fff`;
          }}
        />
      </div>

      {/* User Info */}
      <h3 className="font-semibold text-white text-lg mb-1 z-10 relative">{userName}</h3>
      <p className="text-white/80 text-xs mb-3 z-10 relative">{userEmail || 'User'}</p>

      {/* Action Buttons */}
      <div className="flex gap-2 z-10 relative">
        <a
          href={`${portalUrl || siteUrl}/profile`}
          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded border border-white/30 transition-all backdrop-blur-md shadow-lg no-underline"
        >
          View Profile
        </a>
        <a
          href={`${portalUrl || siteUrl}/profile/edit`}
          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded border border-white/30 transition-all backdrop-blur-md shadow-lg no-underline"
        >
          Edit Profile
        </a>
      </div>
    </div>
  );

  const handleItemClick = (item: MenuItem) => {
    setActiveView(item.id);
  };

  return (
    <CollapsibleSidebar
      menuItems={menuItems}
      activeItemId={activeView}
      onItemClick={handleItemClick}
      header={sidebarHeader}
      width="16rem"
      collapsedWidth="4rem"
      backgroundColor="hsl(var(--sidebar-background))"
      textColor="hsl(var(--sidebar-foreground))"
      activeItemColor="hsl(var(--sidebar-foreground))"
      activeItemBackground="linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))"
      position="left"
      topOffset={headerHeight}
      defaultCollapsed={sidebarCollapsed}
    />
  );
}
