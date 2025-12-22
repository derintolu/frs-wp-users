import { createRoot } from "react-dom/client";
import LoanOfficerPortal from "./LoanOfficerPortal.tsx";
import { MyProfile } from './components/loan-officer-portal/MyProfile';
import { MarketingOverview } from './components/loan-officer-portal/MarketingOverview';
import { LeadTracking } from './components/loan-officer-portal/LeadTracking';
import { FluentBookingCalendar } from './components/loan-officer-portal/FluentBookingCalendar';
import { LandingPagesMarketing } from './components/loan-officer-portal/LandingPagesMarketing';
import { EmailCampaignsMarketing } from './components/loan-officer-portal/EmailCampaignsMarketing';
import { LocalSEOMarketing } from './components/loan-officer-portal/LocalSEOMarketing';
import { BrandShowcase } from './components/loan-officer-portal/BrandShowcase';
import { MarketingOrders } from './components/loan-officer-portal/MarketingOrders';
import { MortgageCalculator } from './components/loan-officer-portal/MortgageCalculator';
import { PropertyValuation } from './components/loan-officer-portal/PropertyValuation';
import { Settings } from './components/loan-officer-portal/Settings';
import { MarketingSubnav } from './components/loan-officer-portal/MarketingSubnav';
import { DataService } from './utils/dataService';
import "./index.css";

// WordPress integration - look for the portal root element
// Support both new and legacy root element IDs for backward compatibility
const partnershipPortalRoot =
  document.getElementById("lrh-portal-root") ||
  document.getElementById("frs-partnership-portal-root");

// Mount Loan Officer Portal (uses [lrh_portal] or [frs_partnership_portal] shortcode)
if (partnershipPortalRoot) {
  // Remove WordPress/theme margins on mobile for edge-to-edge layout
  // Parent has .is-layout-constrained with margin: auto !important, so we need to use setProperty with priority
  const applyMobileStyles = () => {
    if (window.innerWidth <= 767) {
      partnershipPortalRoot.style.setProperty('margin-left', '0', 'important');
      partnershipPortalRoot.style.setProperty('margin-right', '0', 'important');
    } else {
      // Reset to default on desktop
      partnershipPortalRoot.style.removeProperty('margin-left');
      partnershipPortalRoot.style.removeProperty('margin-right');
    }
  };

  // Apply immediately
  applyMobileStyles();

  // Also apply on window resize
  window.addEventListener('resize', applyMobileStyles);

  const config = (window as any).frsPortalConfig || {
    userId: 0,
    userName: '',
    userEmail: '',
    userAvatar: '',
    userRole: 'loan_officer',
    restNonce: '',
    apiUrl: '/wp-json/lrh/v1/'
  };

  console.log('Loan Officer Portal mounting with config:', config);
  console.log('Mounting to element:', partnershipPortalRoot.id);

  createRoot(partnershipPortalRoot).render(
    <LoanOfficerPortal {...config} />
  );

  console.log('Loan Officer Portal mounted successfully');
}

// Mount content-only pages (uses [lrh_content_*] shortcodes)
document.addEventListener('DOMContentLoaded', async () => {
  const contentRoots = document.querySelectorAll('[data-lrh-content]');

  if (contentRoots.length === 0) return;

  // Load current user data
  let currentUser;
  try {
    currentUser = await DataService.getCurrentUser();
  } catch (err) {
    console.error('Failed to load user for content pages:', err);
    return;
  }

  const userId = currentUser.id;

  contentRoots.forEach((root) => {
    const contentType = root.getAttribute('data-lrh-content');
    let component = null;

    switch (contentType) {
      case 'profile':
        component = <MyProfile userId={userId} autoEdit={false} />;
        break;
      case 'marketing':
        component = <MarketingOverview userId={userId} />;
        break;
      case 'calendar':
        component = <FluentBookingCalendar userId={userId} />;
        break;
      case 'landing-pages':
        component = <LandingPagesMarketing userId={userId} currentUser={currentUser} />;
        break;
      case 'email-campaigns':
        component = <EmailCampaignsMarketing userId={userId} currentUser={currentUser} />;
        break;
      case 'local-seo':
        component = <LocalSEOMarketing userId={userId} currentUser={currentUser} />;
        break;
      case 'brand-guide':
        component = <BrandShowcase />;
        break;
      case 'orders':
        component = <MarketingOrders userId={userId} currentUser={currentUser} />;
        break;
      case 'lead-tracking':
        component = <LeadTracking userId={userId} />;
        break;
      case 'tools':
        component = <MortgageCalculator />;
        break;
      case 'settings':
        component = <Settings userId={userId} />;
        break;
      default:
        console.warn(`Unknown content type: ${contentType}`);
        return;
    }

    if (component) {
      console.log(`Mounting content-only page: ${contentType}`);
      createRoot(root as HTMLElement).render(component);
    }
  });

  // Mount subnav panels
  const subnavRoots = document.querySelectorAll('[data-lrh-subnav]');
  subnavRoots.forEach((root) => {
    const subnavType = root.getAttribute('data-lrh-subnav');
    let component = null;

    switch (subnavType) {
      case 'marketing':
        component = <MarketingSubnav />;
        break;
      default:
        console.warn(`Unknown subnav type: ${subnavType}`);
        return;
    }

    if (component) {
      console.log(`Mounting subnav: ${subnavType}`);
      createRoot(root as HTMLElement).render(component);
    }
  });
});
