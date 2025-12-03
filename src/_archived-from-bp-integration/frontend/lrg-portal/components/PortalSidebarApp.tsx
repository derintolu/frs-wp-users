/**
 * Portal Sidebar App - Standalone Component
 * Visually identical to DashboardLayout sidebar
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

  // Header content - Compact horizontal layout
  const sidebarHeader = (
    <div className="relative w-full overflow-hidden">
      {/* Gradient Banner */}
      <div
        className="relative w-full overflow-visible"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
          height: '100px'
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

        {/* Avatar and Name - Horizontal Layout */}
        <div
          className="relative w-full px-4 py-4 flex items-center gap-3"
          style={{ zIndex: 10 }}
        >
          {/* Avatar with gradient border */}
          <div className="flex-shrink-0">
            <div
              className="size-14 rounded-full overflow-hidden shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <img
                src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=2DD4DA&color=fff`}
                alt={userName || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=2DD4DA&color=fff`;
                }}
              />
            </div>
          </div>

          {/* Name and Email */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-0.5 drop-shadow-md truncate">{userName}</h3>
            <p className="font-normal text-white text-sm drop-shadow-md truncate">{userEmail || 'User'}</p>
          </div>
        </div>
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
      width="320px"
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
