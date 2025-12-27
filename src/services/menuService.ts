/**
 * Menu Service for Portal Sidebar
 * Fetches WordPress menus via the workspaces REST API
 */

import type { SidebarMenuItem, WordPressMenuItem, WorkspaceMenuResponse } from '@/types/menu';

// Cache for menu data
const menuCache: Map<string, { data: SidebarMenuItem[]; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get API base URL
 */
function getApiBaseUrl(): string {
  // Use wpApiSettings if available (set by wp_localize_script)
  if (typeof window !== 'undefined' && (window as any).wpApiSettings?.root) {
    return (window as any).wpApiSettings.root;
  }
  // Fallback to relative URL
  return '/wp-json/';
}

/**
 * Get REST nonce
 */
function getRestNonce(): string {
  if (typeof window !== 'undefined') {
    // Try wpApiSettings first
    if ((window as any).wpApiSettings?.nonce) {
      return (window as any).wpApiSettings.nonce;
    }
    // Try frsPortalConfig
    if ((window as any).frsPortalConfig?.restNonce) {
      return (window as any).frsPortalConfig.restNonce;
    }
  }
  return '';
}

/**
 * Transform WordPress menu item to sidebar menu item
 */
function transformMenuItem(item: WordPressMenuItem): SidebarMenuItem {
  const isExternal = item.url.startsWith('http') && !item.url.includes(window.location.host);

  return {
    id: item.id,
    title: item.title,
    url: item.url,
    icon: item.icon || undefined,
    description: item.description || undefined,
    isExternal,
    target: item.target || undefined,
    items: item.items?.length > 0 ? item.items.map(transformMenuItem) : undefined,
  };
}

/**
 * Fetch menu for a workspace by slug
 */
export async function fetchWorkspaceMenu(workspaceSlug: string): Promise<SidebarMenuItem[]> {
  const apiUrl = getApiBaseUrl();
  const nonce = getRestNonce();

  const response = await fetch(`${apiUrl}workspaces/v1/menu/${workspaceSlug}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workspace menu: ${response.statusText}`);
  }

  const data: WorkspaceMenuResponse = await response.json();

  if (!data.menu_assigned || !data.items?.length) {
    return [];
  }

  return data.items.map(transformMenuItem);
}

/**
 * Fetch menu for a workspace with caching
 */
export async function fetchWorkspaceMenuCached(workspaceSlug: string): Promise<SidebarMenuItem[]> {
  const cacheKey = `workspace_${workspaceSlug}`;
  const cached = menuCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const items = await fetchWorkspaceMenu(workspaceSlug);
  menuCache.set(cacheKey, { data: items, timestamp: Date.now() });

  return items;
}

/**
 * Legacy function - get menu location for role
 * @deprecated Use workspace-based menus instead
 */
export function getMenuLocationForRole(role: string): string {
  const roleLocations: Record<string, string> = {
    loan_officer: 'portal_loan_officer',
    realtor_partner: 'portal_realtor',
    manager: 'portal_manager',
    frs_admin: 'portal_admin',
  };

  return roleLocations[role] || 'portal_loan_officer';
}

/**
 * Legacy function - fetch portal menu by location
 * @deprecated Use fetchWorkspaceMenuCached instead
 */
export async function fetchPortalMenuCached(location: string): Promise<SidebarMenuItem[]> {
  // For backwards compatibility, try to map location to workspace
  // This is a temporary bridge until all code uses workspace-based menus
  console.warn('fetchPortalMenuCached is deprecated. Use fetchWorkspaceMenuCached instead.');

  // Return empty array - sidebar should be updated to use workspace menus
  return [];
}

/**
 * Clear menu cache
 */
export function clearMenuCache(): void {
  menuCache.clear();
}

/**
 * Clear cache for a specific workspace
 */
export function clearWorkspaceMenuCache(workspaceSlug: string): void {
  menuCache.delete(`workspace_${workspaceSlug}`);
}
