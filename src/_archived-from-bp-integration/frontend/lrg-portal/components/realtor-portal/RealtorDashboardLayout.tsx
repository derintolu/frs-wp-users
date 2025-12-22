import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Calculator,
  TrendingUp,
  Wrench
} from 'lucide-react';
import type { User as UserType } from '../../utils/dataService';
import { CollapsibleSidebar, MenuItem } from '../ui/CollapsibleSidebar';

interface RealtorDashboardLayoutProps {
  currentUser: UserType;
}

export function RealtorDashboardLayout({ currentUser }: RealtorDashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState<string>('0px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  // Safety check
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Ensure name is always a string
  const userName = currentUser.name || currentUser.email || 'User';
  const userAvatar = currentUser.avatar || currentUser.headshot_url || '';

  // Get gradient URL from WordPress data
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || (window as any).frsSidebarData?.gradientUrl || '';

  // Calculate total offset (header + admin bar)
  useEffect(() => {
    const calculateHeaderHeight = () => {
      let totalOffset = 0;

      // Check for WordPress admin bar
      const adminBar = document.getElementById('wpadminbar');
      if (adminBar) {
        totalOffset += adminBar.getBoundingClientRect().height;
      }

      // Try multiple Blocksy header selectors
      const selectors = [
        'header[data-id]',
        '.ct-header',
        'header.site-header',
        '#header',
        'header[id^="ct-"]',
        'header'
      ];

      let blocksyHeader = null;
      for (const selector of selectors) {
        blocksyHeader = document.querySelector(selector);
        if (blocksyHeader) {
          break;
        }
      }

      if (blocksyHeader) {
        const height = blocksyHeader.getBoundingClientRect().height;
        totalOffset += height;
      }

      setHeaderHeight(`${totalOffset}px`);
    };

    calculateHeaderHeight();
    window.addEventListener('resize', calculateHeaderHeight);

    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  const menuItems: MenuItem[] = [
    { id: '/', label: 'Overview', icon: Home },
    {
      id: '/marketing',
      label: 'Marketing',
      icon: Briefcase,
      children: [
        { id: '/marketing/landing-pages', label: 'Landing Pages' },
        { id: '/marketing/cobranded', label: 'Co-branded Materials' },
        { id: '/marketing/social-media', label: 'Social Media Assets' },
      ]
    },
    { id: '/loan-officers', label: 'My Loan Officers', icon: Users },
    { id: '/leads', label: 'Lead Tracking', icon: TrendingUp },
    {
      id: '/tools',
      label: 'Tools',
      icon: Wrench,
      children: [
        { id: '/tools/mortgage-calculator', label: 'Mortgage Calculator' },
        { id: '/tools/property-valuation', label: 'Property Valuation' },
      ]
    },
    { id: '/resources', label: 'Resources', icon: FileText },
  ];

  const sidebarHeader = (
    <div className="relative w-full overflow-hidden">
      {/* Gradient Banner */}
      <div
        className="relative w-full overflow-visible"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
          height: '100px'
        }}
      >
        {/* Animated Video Background */}
        {gradientUrl && (
          <>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 0 }}
            >
              <source src={gradientUrl} type="video/mp4" />
            </video>
            {/* Dark overlay for text readability */}
            <div
              className="absolute inset-0 bg-black/20"
              style={{ zIndex: 1 }}
            />
          </>
        )}

        {/* Avatar and Name - Horizontal Layout */}
        <div
          className="relative w-full px-4 py-4 flex items-center gap-3"
          style={{ zIndex: 10 }}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="size-14 rounded-full overflow-hidden shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <img
                src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2DD4DA&color=fff`}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2DD4DA&color=fff`;
                }}
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-0.5 drop-shadow-md truncate">
              {userName}
            </h3>
            <p className="font-normal text-white text-sm drop-shadow-md truncate">
              Real Estate Agent
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const sidebarFooter = null;

  const handleItemClick = (item: MenuItem) => {
    navigate(item.id);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--brand-page-background)',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        marginTop: 0
      }}
    >
      <CollapsibleSidebar
        menuItems={menuItems}
        activeItemId={location.pathname}
        onItemClick={handleItemClick}
        header={sidebarHeader}
        footer={sidebarFooter}
        width="320px"
        collapsedWidth="4rem"
        backgroundColor="hsl(var(--sidebar-background))"
        textColor="hsl(var(--sidebar-foreground))"
        activeItemColor="hsl(var(--sidebar-foreground))"
        activeItemBackground="linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))"
        position="left"
        topOffset={headerHeight}
        defaultCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className="max-md:p-0 max-md:m-0 md:pt-8 md:pb-6 md:pl-0 md:pr-0 md:ml-[320px] md:mr-0">
        <Outlet />
      </main>
    </div>
  );
}
