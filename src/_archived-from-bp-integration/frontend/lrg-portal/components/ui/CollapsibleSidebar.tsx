import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from './utils';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  url?: string;
  children?: MenuItem[];
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  description?: string;
  customWidget?: React.ReactNode;
}

export interface CollapsibleSidebarProps {
  menuItems: MenuItem[];
  activeItemId?: string;
  onItemClick?: (item: MenuItem) => void;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  collapsedWidth?: string;
  backgroundColor?: string;
  textColor?: string;
  activeItemColor?: string;
  activeItemBackground?: string;
  position?: 'left' | 'right';
  topOffset?: string;
}

export function CollapsibleSidebar({
  menuItems,
  activeItemId,
  onItemClick,
  defaultCollapsed = false,
  onCollapsedChange,
  className = '',
  header,
  footer,
  width = '16rem',
  collapsedWidth = '4rem',
  backgroundColor = '#ffffff',
  textColor = '#374151',
  activeItemColor = '#ffffff',
  activeItemBackground = 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
  position = 'left',
  topOffset = '0',
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Detect mobile/tablet viewport and handle resize animation
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      // Set resizing state
      setIsResizing(true);

      // Clear existing timer
      clearTimeout(resizeTimer);

      // Reset resizing state after resize ends
      resizeTimer = setTimeout(() => {
        setIsResizing(false);
      }, 150);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Handle hash-based mobile panel opening
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#open-sidebar' || window.location.hash === '#open-menu') {
        setIsMobileOpen(true);
      } else if (window.location.hash === '#close-sidebar' || window.location.hash === '#close-menu') {
        setIsMobileOpen(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update body padding when sidebar collapses/expands (desktop only)
  // DISABLED - was pushing header to the right
  // useEffect(() => {
  //   if (isMobile) {
  //     // On mobile, remove body padding
  //     const paddingProperty = position === 'left' ? 'paddingLeft' : 'paddingRight';
  //     document.body.style[paddingProperty] = '';
  //     return;
  //   }

  //   const currentWidth = isCollapsed ? collapsedWidth : width;
  //   const paddingProperty = position === 'left' ? 'paddingLeft' : 'paddingRight';

  //   document.body.style[paddingProperty] = currentWidth;
  //   document.body.style.transition = 'padding 300ms ease-in-out';

  //   return () => {
  //     document.body.style[paddingProperty] = '';
  //     document.body.style.transition = '';
  //   };
  // }, [isCollapsed, width, collapsedWidth, position, isMobile]);

  // Auto-expand parent menu if child is active, or if item itself is active and has customWidget
  useEffect(() => {
    if (activeItemId) {
      menuItems.forEach((item) => {
        // Auto-expand if child is active
        if (item.children?.some((child) => child.id === activeItemId)) {
          setExpandedMenus((prev) => [...new Set([...prev, item.id])]);
        }
        // Auto-expand if this item is active and has customWidget
        if (item.id === activeItemId && item.customWidget) {
          setExpandedMenus((prev) => [...new Set([...prev, item.id])]);
        }
      });
    }
  }, [activeItemId, menuItems]);

  const handleItemClick = (item: MenuItem) => {
    // Toggle submenu if it has children or customWidget
    if ((item.children && item.children.length > 0) || item.customWidget) {
      setExpandedMenus((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );

      // Still navigate if customWidget but no children
      if (item.customWidget && (!item.children || item.children.length === 0)) {
        if (onItemClick) {
          onItemClick(item);
        }
      }
      return; // Don't navigate for parent items with children
    }

    // Close mobile sidebar on navigation
    if (isMobile) {
      setIsMobileOpen(false);
    }

    // Call the click handler if provided
    if (onItemClick) {
      onItemClick(item);
    }

    // Always allow regular navigation to happen
    // The link will naturally reload the page, and the sidebar will persist
  };

  const renderMenuItem = (item: MenuItem, isChild = false, forceExpanded = false) => {
    const Icon = item.icon;
    const isActive = activeItemId === item.id;
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const hasCustomWidget = !!item.customWidget;

    // On mobile or when forceExpanded, always show full text; on desktop, respect isCollapsed
    const shouldShowCollapsed = !forceExpanded && !isMobile && isCollapsed;

    // If item has no label and only customWidget, render just the widget
    if (!item.label && hasCustomWidget && !shouldShowCollapsed) {
      return (
        <div key={item.id} className="my-2">
          {item.customWidget}
        </div>
      );
    }

    // Use 'a' tag for items with URLs (and no children/widget), button for parent items with children or customWidget
    const Element = (item.url && !hasChildren && !hasCustomWidget) ? 'a' : 'button';
    const elementProps = Element === 'a' ? { href: item.url } : { onClick: () => handleItemClick(item) };

    return (
      <div key={item.id}>
        <Element
          {...elementProps}
          className={cn(
            'w-full inline-flex items-center gap-2 text-sm font-medium transition-all rounded-md h-9 px-4 py-2',
            isChild && 'h-8 px-3 ml-6',
            shouldShowCollapsed && !isChild && 'justify-center px-2',
            !isActive && 'hover:bg-accent hover:text-accent-foreground',
            isActive && 'shadow-sm',
            Element === 'a' && 'no-underline'
          )}
          style={{
            backgroundColor: isActive ? 'transparent' : 'transparent',
            backgroundImage: isActive ? activeItemBackground : 'none',
            color: isActive ? activeItemColor : textColor,
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
          }}
          title={shouldShowCollapsed ? item.label : undefined}
        >
          {Icon && <Icon className="size-4 flex-shrink-0" />}
          {!shouldShowCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {(hasChildren || hasCustomWidget) && (
                <ChevronRight
                  className={cn(
                    'size-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              )}
              {item.badge && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    item.badgeVariant === 'destructive' && 'bg-red-100 text-red-700',
                    item.badgeVariant === 'secondary' && 'bg-gray-100 text-gray-700',
                    item.badgeVariant === 'outline' && 'border border-gray-300 text-gray-700',
                    !item.badgeVariant && 'bg-blue-100 text-blue-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Element>

        {/* Render children if expanded and not collapsed */}
        {hasChildren && isExpanded && !shouldShowCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, true, forceExpanded))}
          </div>
        )}

        {/* Render custom widget after children (or after item if no children) */}
        {item.customWidget && isExpanded && !shouldShowCollapsed && (
          <div className={cn("mt-2", hasChildren && "ml-0")}>
            {item.customWidget}
          </div>
        )}
      </div>
    );
  };

  // Mobile: Bottom panel mode
  if (isMobile) {
    return (
      <>
        {/* Backdrop overlay */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-out',
            isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => {
            setIsMobileOpen(false);
            window.location.hash = '';
          }}
        />

        {/* Mobile Bottom Panel */}
        <aside
          id="frs-mobile-sidebar"
          className={cn(
            'fixed left-0 right-0 z-50 transition-all duration-500 ease-out',
            'shadow-2xl overflow-hidden bg-white',
            isMobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
            className
          )}
          style={{
            bottom: 0,
            backgroundColor: '#ffffff',
            color: textColor,
            maxHeight: `calc(100vh - ${topOffset})`,
            top: isResizing ? `calc(${topOffset} + 2px)` : topOffset,
          }}
        >
          {/* Close X Button - Top Right */}
          <button
            onClick={() => {
              setIsMobileOpen(false);
              window.location.hash = '';
            }}
            className="absolute top-4 right-4 z-50 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="h-full flex flex-col overflow-hidden">
            {/* Header Section - Edge to Edge */}
            {header && <div className="w-full">{header}</div>}

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => renderMenuItem(item, false, true))}
            </nav>
          </div>
        </aside>
      </>
    );
  }

  // Tablet & Desktop: Sidebar mode
  return (
    <aside
      className={cn(
        'fixed transition-all duration-300 ease-in-out z-[50]',
        'border shadow-lg overflow-visible',
        position === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border',
        className
      )}
      style={{
        width: isCollapsed ? collapsedWidth : width,
        backgroundColor,
        color: textColor,
        top: topOffset,
        height: `calc(100vh - ${topOffset})`,
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Toggle Button */}
      <a
        href="#frs-portal-sidebar-toggle"
        id="frs-portal-sidebar-toggle"
        className={cn(
          'frs-portal-sidebar-toggle',
          'frs-sidebar-toggle-btn',
          'absolute top-[30px] z-50 h-8 w-8 rounded-full border bg-white shadow-md hover:bg-gray-50',
          'flex items-center justify-center transition-colors cursor-pointer no-underline',
          '-right-4'
        )}
        onClick={(e) => {
          e.preventDefault();
          const newCollapsedState = !isCollapsed;
          setIsCollapsed(newCollapsedState);
          onCollapsedChange?.(newCollapsedState);
        }}
        aria-label="Toggle sidebar navigation"
        data-frs-component="sidebar-toggle"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </a>

      <div className="h-full flex flex-col overflow-hidden">
        {/* Header Section */}
        {header && (
          <div className={cn(isCollapsed && 'hidden')}>
            {header}
          </div>
        )}

        {/* Navigation Items */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto p-4 space-y-2',
            isCollapsed && 'px-2'
          )}
        >
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Footer Section */}
        {footer && (
          <div className={cn(isCollapsed && 'hidden')}>
            {footer}
          </div>
        )}
      </div>
    </aside>
  );
}
