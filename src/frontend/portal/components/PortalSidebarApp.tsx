/**
 * Portal Sidebar App - Standalone Component
 * Visually identical to ProfileCustomizerLayout sidebar
 * Uses menu items passed from PHP (not hardcoded here)
 */

import { useState, useEffect } from 'react';
import { CollapsibleSidebar, MenuItem } from './ui/CollapsibleSidebar';
import * as LucideIcons from 'lucide-react';

interface PortalSidebarAppProps {
  backgroundColor?: string;
  colorScheme?: 'blue' | 'gold';
  gradientUrl: string;
  menuItems: any[];
  portalUrl: string;
  restNonce: string;
  siteUrl: string;
  userAvatar: string;
  userEmail: string;
  userId: number;
  userName: string;
  userRole: string;
}

export function PortalSidebarApp({
  backgroundColor = '#252526',
  colorScheme = 'blue',
  gradientUrl,
  menuItems: phpMenuItems,
  portalUrl,
  restNonce,
  siteUrl,
  userAvatar,
  userEmail,
  userId,
  userName,
  userRole
}: PortalSidebarAppProps) {
  const [headerHeight, setHeaderHeight] = useState<string>('0px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>('home');

  // Debug logging
  console.log('[PortalSidebarApp] Props received:', {
    gradientUrl,
    portalUrl,
    siteUrl,
    userEmail,
    userId,
    userName,
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
        icon: IconComponent,
        id: item.id,
        label: item.label,
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

  // Color scheme configurations
  const colorConfigs = {
    blue: {
      gradient: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
      videoFilter: 'none',
      videoOverlay: 'bg-black/20',
    },
    gold: {
      gradient: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor} 100%)`,
      // Gold overlay
videoFilter: 'sepia(100%) saturate(150%) hue-rotate(10deg) brightness(0.9)', 
      videoOverlay: 'bg-[#beaf87]/40',
    },
  };

  const config = colorConfigs[colorScheme];

  // Header content - User Profile Section with Gradient Background and Video
  const sidebarHeader = (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden p-6 text-center"
      style={{
        background: config.gradient,
        minHeight: '200px',
      }}
    >
      {/* Animated Video Background */}
      {gradientUrl && (
        <>
          <video
            autoPlay
            className="absolute inset-0 size-full object-cover"
            loop
            muted
            playsInline
            style={{
              filter: config.videoFilter,
              zIndex: 0,
            }}
          >
            <source src={gradientUrl} type="video/mp4" />
          </video>
          {/* Gold shimmer overlay */}
          <div
            className={`absolute inset-0 ${config.videoOverlay}`}
            style={{
              mixBlendMode: colorScheme === 'gold' ? 'overlay' : 'normal',
              zIndex: 1,
            }}
          />
          {/* Additional gold shimmer layer for depth */}
          {colorScheme === 'gold' && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(190, 175, 135, 0.3) 0%, rgba(255, 215, 0, 0.2) 50%, rgba(190, 175, 135, 0.3) 100%)',
                mixBlendMode: 'screen',
                zIndex: 2,
              }}
            />
          )}
        </>
      )}

      {/* User Avatar */}
      <div className="relative z-10 mb-3 flex items-center justify-center">
        <img
          alt={userName || 'User'}
          className="size-[104px] rounded-full border-4 border-white shadow-lg"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=2DD4DA&color=fff`;
          }}
          src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=2DD4DA&color=fff`}
        />
      </div>

      {/* User Info */}
      <h3 className="relative z-10 mb-1 text-2xl font-semibold text-white">{userName}</h3>
      <p className="relative z-10 mb-3 text-base text-white/80">{userEmail || 'User'}</p>

      {/* Action Buttons */}
      <div className="relative z-10 flex gap-2">
        <a
          className="rounded border border-white/30 bg-white/10 px-3 py-1 text-xs text-white no-underline shadow-lg backdrop-blur-md transition-all hover:bg-white/20"
          href={`${portalUrl || siteUrl}/profile`}
        >
          View Profile
        </a>
        <a
          className="rounded border border-white/30 bg-white/10 px-3 py-1 text-xs text-white no-underline shadow-lg backdrop-blur-md transition-all hover:bg-white/20"
          href={`${portalUrl || siteUrl}/profile/edit`}
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
      activeItemBackground="linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))"
      activeItemColor="hsl(var(--sidebar-foreground))"
      activeItemId={activeView}
      backgroundColor="hsl(var(--sidebar-background))"
      collapsedWidth="4rem"
      defaultCollapsed={sidebarCollapsed}
      header={sidebarHeader}
      menuItems={menuItems}
      onItemClick={handleItemClick}
      position="left"
      textColor="hsl(var(--sidebar-foreground))"
      topOffset={headerHeight}
      width="16rem"
    />
  );
}
