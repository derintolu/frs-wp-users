/**
 * Menu Types for Portal Sidebar
 * Supports WordPress menus fetched via workspaces REST API
 */

/**
 * WordPress menu item from workspaces REST API
 */
export interface WordPressMenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
  classes: string[];
  parent: number;
  order: number;
  type: string;
  object: string;
  object_id: number;
  icon: string;
  description: string;
  items: WordPressMenuItem[];
}

/**
 * Processed menu item for sidebar component
 */
export interface SidebarMenuItem {
  id: number;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  isExternal?: boolean;
  target?: string;
  isActive?: boolean;
  items?: SidebarMenuItem[];
}

/**
 * Workspace menu API response
 */
export interface WorkspaceMenuResponse {
  workspace: {
    id: number;
    name: string;
    slug: string;
  };
  menu_location: string;
  menu_assigned: boolean;
  items: WordPressMenuItem[];
}
