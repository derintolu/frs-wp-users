import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Building2, Home, Users, Activity, UserPlus, Mail, Settings } from 'lucide-react';
import type { User as UserType } from '../../utils/dataService';
import { CollapsibleSidebar, MenuItem } from '../ui/CollapsibleSidebar';

interface PartnershipsLayoutProps {
  currentUser: UserType;
}

interface CompanyData {
  id: number;
  name: string;
  slug: string;
  user_role: 'admin' | 'mod' | 'member' | 'non-member';
}

export function PartnershipsLayout({ currentUser }: PartnershipsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const [headerHeight, setHeaderHeight] = useState<string>('0px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  // Get gradient URL from WordPress data
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || (window as any).frsSidebarData?.gradientUrl || '';

  // Load company data if viewing a specific company
  useEffect(() => {
    if (slug) {
      loadCompanyData(slug);
    } else {
      setCompanyData(null);
    }
  }, [slug]);

  const loadCompanyData = async (companySlug: string) => {
    try {
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${companySlug}`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCompanyData(result.data);
      }
    } catch (err) {
      console.error('Failed to load company data:', err);
    }
  };

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

  // Dynamic menu items based on route
  const isViewingCompany = !!slug && !!companyData;
  const canManage = companyData && (companyData.user_role === 'admin' || companyData.user_role === 'mod');

  const menuItems: MenuItem[] = isViewingCompany
    ? [
        // Viewing a company - show company tabs
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'activity', label: 'Activity', icon: Activity },
        ...(canManage ? [{ id: 'invites', label: 'Invites', icon: Mail }] : []),
        ...(canManage ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
      ]
    : [
        // Viewing list - show all companies
        { id: '/', label: 'All Companies', icon: Building2 },
      ];

  // Sidebar header with user info or company info
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
          {/* Avatar or Company Icon */}
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
              {isViewingCompany ? (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              ) : (
                <img
                  src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`}
                  alt={currentUser.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`;
                  }}
                />
              )}
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-0.5 drop-shadow-md truncate">
              {isViewingCompany ? companyData?.name : currentUser.name}
            </h3>
            <p className="font-normal text-white text-sm drop-shadow-md truncate">
              {isViewingCompany ? 'Partner Company' : 'Partnerships'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const sidebarFooter = null;

  const handleItemClick = (item: MenuItem) => {
    if (item.id === '/') {
      // Navigate back to list
      navigate('/');
    } else {
      // Tab within company view
      setActiveTab(item.id);
      // Trigger tab change in child component via event or context if needed
      window.dispatchEvent(new CustomEvent('partnerships-tab-change', { detail: { tab: item.id } }));
    }
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
        activeItemId={activeTab}
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
