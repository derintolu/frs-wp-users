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
      gradientUrl={config.gradientUrl}
      menuItems={config.menuItems || []}
      portalUrl={config.portalUrl}
      restNonce={config.restNonce}
      siteUrl={config.siteUrl}
      userAvatar={config.userAvatar}
      userEmail={config.userEmail}
      userId={config.userId}
      userName={config.userName}
      userRole={config.userRole}
    />
  );

  console.log('Portal Sidebar mounted successfully');
}
