/**
 * Menu Types for Portal v3
 * Defines the structure of WordPress menus with icon support
 */

import type { LucideIcon } from 'lucide-react';

/**
 * WordPress menu item from REST API
 */
export interface WordPressMenuItem {
  children?: WordPressMenuItem[];
  classes: string[];
  id: number;
  menu_order: number;
  // 'post_type', 'custom', 'taxonomy', etc.
  meta: {
    badge?: string; 
    badge_variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    description?: string;
    icon?: string;
    // Lucide icon name
    icon_color?: string;
  };
  object: string;
  // 'page', 'post', 'custom', etc.
  object_id: number;
  parent: number;
  slug: string; 
  target: string;
  title: string; 
  type: string;
  url: string;
}

/**
 * Processed menu item for sidebar component
 */
export interface SidebarMenuItem {
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  description?: string;
  // React Router path (e.g., '/dashboard', '/partnerships')
  icon?: string; 
  // Lucide icon name
  iconColor?: string; 
  id: number;
  isActive?: boolean;
  isExternal?: boolean;
  items?: SidebarMenuItem[];
  route?: string;
  target?: string;
  title: string;
  url: string; // Nested menu items
}

/**
 * Menu location configuration
 */
export interface MenuLocation {
  description: string;
  location: 'portal_loan_officer' | 'portal_realtor';
  name: string;
}

/**
 * Portal menu API response
 */
export interface PortalMenuResponse {
  data: {
    items: WordPressMenuItem[];
    location: string;
    user_role: 'loan_officer' | 'realtor_partner';
  };
  success: boolean;
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
  allowedRoles?: string[];
  component: React.ComponentType;
  path: string;
  requiresAuth?: boolean;
  title: string;
}
