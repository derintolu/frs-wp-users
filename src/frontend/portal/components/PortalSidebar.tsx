/**
 * Portal Sidebar Component
 * Dynamic sidebar that loads WordPress menus based on workspace
 */

import * as React from "react";
import { useEffect, useState } from "react";
import { Building2, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { fetchWorkspaceMenuCached } from "@/services/menuService";
import type { SidebarMenuItem } from "@/types/menu";

interface PortalSidebarProps extends React.ComponentProps<typeof Sidebar> {
  siteLogo?: string;
  siteName?: string;
  userAvatar?: string;
  userEmail?: string;
  userName?: string;
  userRole: 'loan_officer' | 'realtor_partner' | 'manager' | 'frs_admin';
  workspaceSlug?: string;
}

export function PortalSidebar({
  siteLogo = '',
  siteName = 'Portal',
  userAvatar = '',
  userEmail = '',
  userName = 'User',
  userRole,
  workspaceSlug,
  ...props
}: PortalSidebarProps) {
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no workspace slug provided
    if (!workspaceSlug) {
      console.log('PortalSidebar: No workspace slug provided');
      setLoading(false);
      return;
    }

    console.log('PortalSidebar mounted, workspace:', workspaceSlug);

    async function loadMenu() {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching menu for workspace:', workspaceSlug);
        const items = await fetchWorkspaceMenuCached(workspaceSlug);

        console.log('Menu items loaded:', items);
        setMenuItems(items);
      } catch (error_) {
        const errorMessage = error_ instanceof Error ? error_.message : 'Failed to load menu';
        setError(errorMessage);
        console.error('Menu loading error:', error_);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [workspaceSlug]);

  // User data for footer
  const userData = {
    avatar: userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`,
    email: userEmail,
    name: userName,
  };

  // Site/company data for team switcher
  // If we have a logo URL, create a custom component to render it
  const SiteLogo = siteLogo
    ? () => <img alt={siteName} className="size-8 object-contain" src={siteLogo} />
    : Building2;

  // Simplify role names
  const getRoleName = (role: string): string => {
    switch (role) {
      case 'loan_officer':
        return 'Lender';
      case 'realtor_partner':
        return 'Partner';
      case 'manager':
        return 'Manager';
      case 'frs_admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  const sites = [
    {
      logo: SiteLogo,
      name: siteName,
      plan: getRoleName(userRole),
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sites} />
      </SidebarHeader>

      <SidebarContent>
        {/* Always show Dashboard link at top */}
        <nav className="grid gap-0.5 p-2">
          <Link
            className="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm outline-none transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium"
            to="/"
          >
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">Loading menu...</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 text-sm text-destructive">Failed to load menu</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        )}

        {!loading && !error && menuItems.length > 0 && (
          <NavMain items={menuItems} />
        )}

        {!loading && !error && menuItems.length === 0 && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 text-sm text-muted-foreground">No menu configured</div>
            <div className="text-xs text-muted-foreground">
              {workspaceSlug
                ? `Go to Appearance → Menus to assign a menu to "Workspace: ${workspaceSlug}"`
                : 'No workspace selected'
              }
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
