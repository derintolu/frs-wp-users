import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from './components/loan-officer-portal/DashboardLayout';
import { MyProfile } from './components/loan-officer-portal/MyProfile';
import { MarketingOverview } from './components/loan-officer-portal/MarketingOverview';
import { LandingPagesMarketing } from './components/loan-officer-portal/LandingPagesMarketing';
import { EmailCampaignsMarketing } from './components/loan-officer-portal/EmailCampaignsMarketing';
import { LocalSEOMarketing } from './components/loan-officer-portal/LocalSEOMarketing';
import { LeadTracking } from './components/loan-officer-portal/LeadTracking';
import { MarketingOrders } from './components/loan-officer-portal/MarketingOrders';
import { BrandShowcase } from './components/loan-officer-portal/BrandShowcase';
import { MortgageCalculator } from './components/loan-officer-portal/MortgageCalculator';
import { PropertyValuation } from './components/loan-officer-portal/PropertyValuation';
import { FluentBookingCalendar } from './components/loan-officer-portal/FluentBookingCalendar';
import { Settings } from './components/loan-officer-portal/Settings';
import type { User } from './utils/dataService';

interface RouteConfig {
  currentUser: User;
  userId: string;
  userRole: 'loan-officer' | 'realtor';
}

export const createRouter = (config: RouteConfig) => {
  const { currentUser, userId, userRole } = config;

  return createBrowserRouter([
    {
      path: '/',
      element: <DashboardLayout currentUser={currentUser} />,
      errorElement: <DashboardLayout currentUser={currentUser}><MarketingOverview userId={userId} /></DashboardLayout>,
      children: [
        {
          path: '/',
          element: <MarketingOverview userId={userId} />,
        },
        {
          path: 'profile',
          element: <MyProfile userId={userId} autoEdit={false} />,
        },
        {
          path: 'profile/edit',
          element: <MyProfile userId={userId} autoEdit={true} />,
        },
        {
          path: 'profile/settings',
          element: <Settings userId={userId} />,
        },
        {
          path: 'leads',
          element: <LeadTracking userId={userId} />,
        },
        {
          path: 'marketing',
          children: [
            {
              path: '',
              element: <MarketingOverview userId={userId} />,
            },
            {
              path: 'calendar',
              element: <FluentBookingCalendar userId={userId} />,
            },
            {
              path: 'landing-pages',
              element: <LandingPagesMarketing userId={userId} currentUser={currentUser} />,
            },
            {
              path: 'email-campaigns',
              element: <EmailCampaignsMarketing userId={userId} currentUser={currentUser} />,
            },
            {
              path: 'local-seo',
              element: <LocalSEOMarketing userId={userId} currentUser={currentUser} />,
            },
            {
              path: 'brand-guide',
              element: <BrandShowcase />,
            },
            {
              path: 'orders',
              element: <MarketingOrders userId={userId} currentUser={currentUser} />,
            },
          ],
        },
        {
          path: 'tools',
          children: [
            {
              path: '',
              element: <MortgageCalculator />,
            },
            {
              path: 'mortgage-calculator',
              element: <MortgageCalculator />,
            },
            {
              path: 'property-valuation',
              element: <PropertyValuation />,
            },
          ],
        },
        // Sidebar control hash routes - these prevent 404 errors when opening mobile menu
        {
          path: 'open-menu',
          element: <MarketingOverview userId={userId} />,
        },
        {
          path: 'close-menu',
          element: <MarketingOverview userId={userId} />,
        },
        {
          path: 'open-sidebar',
          element: <MarketingOverview userId={userId} />,
        },
        {
          path: 'close-sidebar',
          element: <MarketingOverview userId={userId} />,
        },
        // Catch-all route for any unmatched paths
        {
          path: '*',
          element: <MarketingOverview userId={userId} />,
        },
      ],
    },
  ]);
};
