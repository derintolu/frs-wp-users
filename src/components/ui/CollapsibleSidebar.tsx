import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItem {
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: MenuItem[];
  customWidget?: React.ReactNode;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  id: string;
  label: string;
  url?: string;
}

export interface CollapsibleSidebarProps {
  activeItemBackground?: string;
  activeItemColor?: string;
  activeItemId?: string;
  backgroundColor?: string;
  className?: string;
  collapsedWidth?: string;
  defaultCollapsed?: boolean;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  integrated?: boolean;
  menuItems: MenuItem[];
  onCollapsedChange?: (collapsed: boolean) => void;
  onItemClick?: (item: MenuItem) => void;
  position?: 'left' | 'right';
  textColor?: string;
  topOffset?: string;
  width?: string; // If true, renders as a regular div without fixed positioning
}

export function CollapsibleSidebar({
  activeItemBackground = 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
  activeItemColor = '#ffffff',
  activeItemId,
  backgroundColor = '#ffffff',
  className = '',
  collapsedWidth = '4rem',
  defaultCollapsed = false,
  footer,
  header,
  integrated = false,
  menuItems,
  onCollapsedChange,
  onItemClick,
  position = 'left',
  textColor = '#374151',
  topOffset = '0',
  width = '16rem',
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
        <div className="my-2" key={item.id}>
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
            'inline-flex h-8 w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            isChild && 'ml-6 h-7 px-2 text-[11px]',
            shouldShowCollapsed && !isChild && 'justify-center px-2',
            !isActive && 'hover:bg-accent hover:text-accent-foreground',
            isActive && 'shadow-sm',
            Element === 'a' && 'no-underline'
          )}
          style={{
            backgroundColor: isActive ? 'transparent' : 'transparent',
            backgroundImage: isActive ? activeItemBackground : 'none',
            border: 'none',
            color: isActive ? activeItemColor : textColor,
            cursor: 'pointer',
            outline: 'none',
          }}
          title={shouldShowCollapsed ? item.label : undefined}
        >
          {Icon && <Icon className="size-3.5 shrink-0" />}
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
                    'rounded-full px-2 py-0.5 text-xs',
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
            'fixed inset-0 z-40 bg-black/50 transition-opacity duration-500 ease-out',
            isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => {
            setIsMobileOpen(false);
            window.location.hash = '';
          }}
        />

        {/* Mobile Bottom Panel */}
        <aside
          className={cn(
            'fixed inset-x-0 z-50 transition-all duration-500 ease-out',
            'overflow-hidden bg-white shadow-2xl',
            isMobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
            className
          )}
          id="frs-mobile-sidebar"
          style={{
            backgroundColor: '#ffffff',
            bottom: 0,
            color: textColor,
            maxHeight: `calc(100vh - ${topOffset})`,
            top: isResizing ? `calc(${topOffset} + 2px)` : topOffset,
          }}
        >
          {/* Close X Button - Top Right */}
          <button
            aria-label="Close menu"
            className="absolute right-4 top-4 z-50 flex items-center justify-center rounded-full transition-all hover:scale-110"
            onClick={() => {
              setIsMobileOpen(false);
              window.location.hash = '';
            }}
            style={{
              WebkitBackdropFilter: 'blur(10px)',
              backdropFilter: 'blur(10px)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              height: '40px',
              width: '40px',
            }}
          >
            <X className="size-5 text-white" />
          </button>

          <div className="flex h-full flex-col overflow-hidden">
            {/* Header Section - Edge to Edge */}
            {header && <div className="w-full">{header}</div>}

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2 overflow-y-auto p-4">
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
        !integrated && 'fixed z-50 transition-all duration-300 ease-in-out',
        !integrated && 'overflow-visible border shadow-lg',
        !integrated && (position === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border'),
        integrated && 'flex h-full flex-col',
        className
      )}
      style={{
        backgroundColor,
        boxShadow: !integrated ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : undefined,
        color: textColor,
        height: !integrated ? `calc(100vh - ${topOffset})` : undefined,
        top: !integrated ? topOffset : undefined,
        width: !integrated && isCollapsed ? collapsedWidth : !integrated ? width : undefined,
      }}
    >
      {/* Toggle Button - Hidden in integrated mode */}
      {!integrated && (
        <a
          aria-label="Toggle sidebar navigation"
          className={cn(
            'frs-portal-sidebar-toggle',
            'frs-sidebar-toggle-btn',
            'absolute top-[30px] z-50 size-8 rounded-full border bg-white shadow-md hover:bg-gray-50',
            'flex cursor-pointer items-center justify-center no-underline transition-colors',
            '-right-4'
          )}
          data-frs-component="sidebar-toggle"
          href="#frs-portal-sidebar-toggle"
          id="frs-portal-sidebar-toggle"
          onClick={(e) => {
            e.preventDefault();
            const newCollapsedState = !isCollapsed;
            setIsCollapsed(newCollapsedState);
            onCollapsedChange?.(newCollapsedState);
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </a>
      )}

      <div className="flex h-full flex-col overflow-hidden">
        {/* Header Section */}
        {header && (
          <div className={cn(isCollapsed && 'hidden')}>
            {header}
          </div>
        )}

        {/* Navigation Items */}
        <nav
          className={cn(
            'flex-1 space-y-2 overflow-y-auto p-4',
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
