/**
 * Portal Layout Component
 * Main layout wrapper with sidebar and content viewport
 */

import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
  userRole: 'loan_officer' | 'realtor_partner' | 'manager' | 'frs_admin';
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  siteName?: string;
  siteLogo?: string;
}

export function PortalLayout({
  userRole,
  userName,
  userEmail,
  userAvatar,
  siteName,
  siteLogo,
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  console.log('PortalLayout - window.location.pathname:', window.location.pathname);

  return (
    <BrowserRouter basename="/hub">
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <PortalSidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          siteName={siteName}
          siteLogo={siteLogo}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger className="-ml-1 h-8 w-8" />
            <Separator orientation="vertical" className="mr-2 h-4" />
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
              <Route path="/" element={<ContentRenderer userName={userName} userRole={userRole} />} />

              {/* Dynamic content routes (React components or WordPress pages) */}
              <Route path="/:slug" element={<ContentRenderer userName={userName} userRole={userRole} />} />

              {/* Catch-all route */}
              <Route
                path="*"
                element={
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <h3 className="text-2xl font-bold tracking-tight">
                        Page Not Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The page you're looking for doesn't exist.
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BrowserRouter>
  );
}
