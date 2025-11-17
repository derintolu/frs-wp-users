/**
 * Portal Sidebar - Standalone Entry Point
 * Completely separate from other portal components
 * Renders a sidebar with WordPress menus for all logged-in users
 */

import { createRoot } from "react-dom/client";
import { PortalSidebarApp } from "./components/PortalSidebarApp";
import "./index.css";

// Look for the portal sidebar root element
const portalSidebarRoot = document.getElementById("lrh-portal-sidebar-root");

if (portalSidebarRoot) {
  // Get configuration passed from PHP
  const config = (window as any).lrhGlobalSidebarConfig || {};

  console.log('Portal Sidebar mounting with config:', config);

  createRoot(portalSidebarRoot).render(
    <PortalSidebarApp
      userId={config.userId}
      userName={config.userName}
      userEmail={config.userEmail}
      userAvatar={config.userAvatar}
      userRole={config.userRole}
      siteUrl={config.siteUrl}
      portalUrl={config.portalUrl}
      restNonce={config.restNonce}
      gradientUrl={config.gradientUrl}
      menuItems={config.menuItems || []}
    />
  );

  console.log('Portal Sidebar mounted successfully');
}
