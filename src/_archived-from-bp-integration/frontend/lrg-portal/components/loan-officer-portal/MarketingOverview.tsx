import { Card } from '../ui/card';
import { Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingCalendarCard, LandingPagesCard, BrandGuideCard, PrintSocialMediaCard } from '../features';

interface MarketingOverviewProps {
  userId: string;
}

export function MarketingOverview({ userId }: MarketingOverviewProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {/* Header Section */}
      <div className="brand-page-header max-w-7xl mx-auto">
        <h1 className="brand-page-title">Marketing Hub</h1>
        <p className="brand-page-subtitle">Choose a tool to get started</p>
      </div>

      {/* Feature Cards Grid - 3 column system with asymmetric layout */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Booking Calendar (2 cols) + Landing Pages (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div onClick={() => navigate('/marketing/calendar')} className="cursor-pointer lg:col-span-2">
            <BookingCalendarCard />
          </div>

          <div onClick={() => navigate('/marketing/landing-pages')} className="cursor-pointer lg:col-span-1">
            <LandingPagesCard />
          </div>
        </div>

        {/* Row 2: Brand Guide (1 col) + Print & Social Media (2 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div onClick={() => navigate('/marketing/brand-guide')} className="cursor-pointer lg:col-span-1">
            <BrandGuideCard />
          </div>

          <div onClick={() => navigate('/marketing/orders')} className="cursor-pointer lg:col-span-2">
            <PrintSocialMediaCard />
          </div>
        </div>
      </div>
    </div>
  );
}
