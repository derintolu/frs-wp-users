import { useState, useEffect } from 'react';
import { CollapsibleSidebar, MenuItem } from '@/components/ui/CollapsibleSidebar';
import { FloatingInput } from '@/components/ui/floating-input';
import { Search, Users } from 'lucide-react';

interface DirectorySidebarProps {
  currentPage?: number;
  onSearchChange: (value: string) => void;
  profileCount: number;
  searchQuery: string;
  totalPages?: number;
}

export function DirectorySidebar({
  currentPage,
  onSearchChange,
  profileCount,
  searchQuery,
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
      customWidget: (
        <div className="px-4 py-3">
          <FloatingInput
            icon={<Search className="size-4" />}
            label="Search by name, title, or location"
            onChange={(e) => onSearchChange(e.target.value)}
            type="text"
            value={searchQuery}
          />
        </div>
      ),
      icon: Search,
      id: 'search',
      label: 'Search',
    },
    {
      customWidget: (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
      id: 'stats',
      label: '',
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
              className="absolute inset-0 size-full object-cover"
              loop
              muted
              playsInline
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
          className="relative flex w-full items-center gap-3 p-4"
          style={{ zIndex: 10 }}
        >
          {/* Icon with gradient border */}
          <div className="shrink-0">
            <div
              className="flex size-14 items-center justify-center overflow-hidden rounded-full shadow-lg"
              style={{
                backgroundClip: 'padding-box, border-box',
                backgroundColor: 'white',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundOrigin: 'padding-box, border-box',
                border: '2px solid transparent'
              }}
            >
              <Users className="size-8 text-[#2563eb]" />
            </div>
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 truncate text-base font-bold text-white drop-shadow-md">Team Directory</h3>
            <p className="truncate text-sm font-normal text-white drop-shadow-md">Find your team members</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CollapsibleSidebar
      activeItemBackground="linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))"
      activeItemColor="hsl(var(--sidebar-foreground))"
      backgroundColor="hsl(var(--sidebar-background))"
      collapsedWidth="4rem"
      defaultCollapsed={sidebarCollapsed}
      header={sidebarHeader}
      menuItems={menuItems}
      onCollapsedChange={setSidebarCollapsed}
      position="left"
      textColor="hsl(var(--sidebar-foreground))"
      topOffset={headerHeight}
      width="320px"
    />
  );
}
