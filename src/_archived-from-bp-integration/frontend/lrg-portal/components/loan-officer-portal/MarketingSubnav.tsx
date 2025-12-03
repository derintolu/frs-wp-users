/**
 * Marketing Subnavigation Panel
 *
 * Overlays the main sidebar when on marketing subpages
 * Provides drill-down navigation for marketing section
 */

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MarketingSubnavProps {
  currentPath?: string;
}

export function MarketingSubnav({ currentPath = '' }: MarketingSubnavProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const marketingLinks = [
    { id: 'calendar', label: 'Booking Calendar', path: '/lo/calendar' },
    { id: 'landing-pages', label: 'Landing Pages', path: '/lo/landing-pages' },
    { id: 'email-campaigns', label: 'Email Campaigns', path: '/lo/email-campaigns' },
    { id: 'local-seo', label: 'Local SEO', path: '/lo/local-seo' },
    { id: 'brand-guide', label: 'Brand Guide', path: '/lo/brand-guide' },
    { id: 'orders', label: 'Orders & Print', path: '/lo/marketing-orders' },
  ];

  useEffect(() => {
    // Check if we're on a marketing subpage
    const checkPath = () => {
      const path = window.location.pathname;
      const isMarketingPage = marketingLinks.some(link => path.includes(link.path));
      setIsVisible(isMarketingPage);
    };

    checkPath();

    // Listen for navigation events
    window.addEventListener('popstate', checkPath);

    return () => {
      window.removeEventListener('popstate', checkPath);
    };
  }, []);

  const isCurrentPath = (path: string) => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.includes(path) || currentPath === path;
    }
    return false;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 h-full w-64 z-50 p-4"
      style={{ backgroundColor: '#0B102C' }}
    >
      <div className="rounded-lg shadow-sm p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-lg font-semibold text-white mb-3 hover:text-blue-300 transition-colors"
        >
          <span>Marketing</span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {isOpen && (
          <nav className="space-y-1">
            {marketingLinks.map((link) => (
              <a
                key={link.id}
                href={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCurrentPath(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
