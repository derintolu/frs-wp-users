import { useState, useEffect } from 'react';
import { CollapsibleSidebar, MenuItem } from '@/components/ui/CollapsibleSidebar';
import { FloatingInput } from '@/components/ui/floating-input';
import { Search, Users } from 'lucide-react';

interface DirectorySidebarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  profileCount: number;
  currentPage?: number;
  totalPages?: number;
}

export function DirectorySidebar({
  searchQuery,
  onSearchChange,
  profileCount,
  currentPage,
  totalPages,
}: DirectorySidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<string>('0px');

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

  // Create menu items with search widget
  const menuItems: MenuItem[] = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      customWidget: (
        <div className="px-4 py-3">
          <FloatingInput
            type="text"
            label="Search by name, title, or location"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      ),
    },
    {
      id: 'stats',
      label: '',
      customWidget: (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Results
            </div>
            <div className="text-xs font-semibold text-gray-700">
              {profileCount} {profileCount === 1 ? 'profile' : 'profiles'}
            </div>
          </div>
          {totalPages && totalPages > 1 && (
            <div className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      ),
    },
  ];

  // Header with gradient banner matching portal style
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

        {/* Icon and Title - Horizontal Layout */}
        <div
          className="relative w-full px-4 py-4 flex items-center gap-3"
          style={{ zIndex: 10 }}
        >
          {/* Icon with gradient border */}
          <div className="flex-shrink-0">
            <div
              className="size-14 rounded-full overflow-hidden shadow-lg flex items-center justify-center"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
                backgroundColor: 'white'
              }}
            >
              <Users className="h-8 w-8 text-[#2563eb]" />
            </div>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-0.5 drop-shadow-md truncate">Team Directory</h3>
            <p className="font-normal text-white text-sm drop-shadow-md truncate">Find your team members</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CollapsibleSidebar
      menuItems={menuItems}
      header={sidebarHeader}
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
  );
}
