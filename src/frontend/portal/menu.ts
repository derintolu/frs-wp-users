/**
 * Menu Types for Portal v3
 * Defines the structure of WordPress menus with icon support
 */

import type { LucideIcon } from 'lucide-react';

/**
 * WordPress menu item from REST API
 */
export interface WordPressMenuItem {
  id: number;
  title: string;
  url: string;
  slug: string;
  target: string;
  classes: string[];
  parent: number;
  menu_order: number;
  object: string; // 'page', 'post', 'custom', etc.
  object_id: number;
  type: string; // 'post_type', 'custom', 'taxonomy', etc.
  meta: {
    icon?: string; // Lucide icon name
    icon_color?: string;
    badge?: string;
    badge_variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    description?: string;
  };
  children?: WordPressMenuItem[];
}

/**
 * Processed menu item for sidebar component
 */
export interface SidebarMenuItem {
  id: number;
  title: string;
  url: string;
  route?: string; // React Router path (e.g., '/dashboard', '/partnerships')
  icon?: string; // Lucide icon name
  iconColor?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  description?: string;
  isActive?: boolean;
  isExternal?: boolean;
  target?: string;
  items?: SidebarMenuItem[]; // Nested menu items
}

/**
 * Menu location configuration
 */
export interface MenuLocation {
  location: 'portal_loan_officer' | 'portal_realtor';
  name: string;
  description: string;
}

/**
 * Portal menu API response
 */
export interface PortalMenuResponse {
  success: boolean;
  data: {
    location: string;
    items: WordPressMenuItem[];
    user_role: 'loan_officer' | 'realtor_partner';
  };
}

/**
 * Icon mapping for WordPress menu items
 */
export interface IconMapping {
  [key: string]: LucideIcon;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  requiresAuth?: boolean;
  allowedRoles?: string[];
}
