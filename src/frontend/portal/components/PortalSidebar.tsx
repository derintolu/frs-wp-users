/**
 * Portal Sidebar Component
 * Dynamic sidebar that loads WordPress menus based on user role
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
import { fetchPortalMenuCached, getMenuLocationForRole } from "@/services/menuService";
import type { SidebarMenuItem } from "@/types/menu";

interface PortalSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: 'loan_officer' | 'realtor_partner' | 'manager' | 'frs_admin';
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  siteName?: string;
  siteLogo?: string;
}

export function PortalSidebar({
  userRole,
  userName = 'User',
  userEmail = '',
  userAvatar = '',
  siteName = 'Portal',
  siteLogo = '',
  ...props
}: PortalSidebarProps) {
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PortalSidebar mounted, userRole:', userRole);

    async function loadMenu() {
      try {
        setLoading(true);
        setError(null);

        const location = getMenuLocationForRole(userRole);
        console.log('Fetching menu for location:', location);
        const items = await fetchPortalMenuCached(location);

        console.log('Menu items loaded:', items);
        setMenuItems(items);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load menu';
        setError(errorMessage);
        console.error('Menu loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [userRole]);

  // User data for footer
  const userData = {
    name: userName,
    email: userEmail,
    avatar: userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`,
  };

  // Site/company data for team switcher
  // If we have a logo URL, create a custom component to render it
  const SiteLogo = siteLogo
    ? () => <img src={siteLogo} alt={siteName} className="size-8 object-contain" />
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
      name: siteName,
      logo: SiteLogo,
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
            to="/"
            className="group flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
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
            <div className="text-sm text-destructive mb-2">Failed to load menu</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        )}

        {!loading && !error && menuItems.length > 0 && (
          <NavMain items={menuItems} />
        )}

        {!loading && !error && menuItems.length === 0 && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="text-sm text-muted-foreground mb-2">No menu configured</div>
            <div className="text-xs text-muted-foreground">
              Go to Appearance → Menus in WordPress admin to create a menu and assign it to "Portal - {userRole === 'loan_officer' ? 'Loan Officer' : 'Realtor Partner'}"
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
