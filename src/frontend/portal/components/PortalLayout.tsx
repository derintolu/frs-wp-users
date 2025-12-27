/**
 * Portal Layout Component
 * Main layout wrapper with sidebar and content viewport
 */

import * as React from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PortalSidebar } from "@/components/PortalSidebar";
import { WordPressContent } from "@/components/WordPressContent";
import { Dashboard } from "@/components/portal-v3/Dashboard";
import { Profile } from "@/components/portal-v3/Profile";
import { Settings } from "@/components/portal-v3/Settings";

// Wrapper component to access route params and render appropriate content
function ContentRenderer({ userName, userRole }: { userName?: string; userRole?: string }) {
  const { slug } = useParams<{ slug: string }>();

  console.log('ContentRenderer - slug:', slug);

  // Route to React component mapping
  const reactRoutes: Record<string, React.ReactNode> = {
    'dashboard': <Dashboard userName={userName} userRole={userRole} />,
    'profile': <Profile userRole={userRole} />,
    'settings': <Settings userRole={userRole} />,
  };

  // If no slug, show dashboard by default
  if (!slug) {
    console.log('No slug - showing dashboard');
    return <Dashboard userName={userName} userRole={userRole} />;
  }

  // Check if this route should render a React component
  if (reactRoutes[slug]) {
    console.log('Found React route for:', slug);
    return <>{reactRoutes[slug]}</>;
  }

  // Otherwise, fetch and render WordPress content
  console.log('Fetching WordPress content for:', slug);
  return <WordPressContent identifier={slug} postType="pages" useSlug={true} />;
}

interface PortalLayoutProps {
  siteLogo?: string;
  siteName?: string;
  userAvatar?: string;
  userEmail?: string;
  userName?: string;
  userRole: 'loan_officer' | 'realtor_partner' | 'manager' | 'frs_admin';
  workspaceSlug?: string;
}

export function PortalLayout({
  siteLogo,
  siteName,
  userAvatar,
  userEmail,
  userName,
  userRole,
  workspaceSlug,
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  console.log('PortalLayout - window.location.pathname:', window.location.pathname);
  console.log('PortalLayout - workspaceSlug:', workspaceSlug);

  return (
    <BrowserRouter basename="/hub">
      <SidebarProvider onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <PortalSidebar
          siteLogo={siteLogo}
          siteName={siteName}
          userAvatar={userAvatar}
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          workspaceSlug={workspaceSlug}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1 size-8" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Portal</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <Routes>
              {/* Default route - show dashboard */}
              <Route element={<ContentRenderer userName={userName} userRole={userRole} />} path="/" />

              {/* Dynamic content routes (React components or WordPress pages) */}
              <Route element={<ContentRenderer userName={userName} userRole={userRole} />} path="/:slug" />

              {/* Catch-all route */}
              <Route
                element={
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-8 shadow-sm">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <h3 className="text-2xl font-bold tracking-tight">
                        Page Not Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The page you&apos;re looking for doesn&apos;t exist.
                      </p>
                    </div>
                  </div>
                }
                path="*"
              />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BrowserRouter>
  );
}
