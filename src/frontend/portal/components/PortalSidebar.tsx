/**
 * Portal Sidebar Component
 * Simplified sidebar with hardcoded menu items for profile management
 */

import * as React from "react";
import { Building2, LayoutDashboard, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

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
  // Hardcoded menu items for profile management
  const menuItems = [
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      isActive: true,
      items: [
        {
          title: "View Profile",
          url: "/profile",
        },
        {
          title: "Edit Profile",
          url: "/profile/edit",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [],
    },
  ];

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

        <NavMain items={menuItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
