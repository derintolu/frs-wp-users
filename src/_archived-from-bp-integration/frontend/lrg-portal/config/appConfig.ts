// Application configuration and constants
export const APP_CONFIG = {
  name: '21st Century Lending Partnership Portal',
  version: '1.0.0',
  
  // API Configuration
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api.21stcenturylending.com' 
      : 'http://localhost:3000/api',
    timeout: 10000,
    retryAttempts: 3
  },

  // Features flags
  features: {
    enableRealTimeNotifications: true,
    enableAnalytics: true,
    enableMobileApp: true,
    enableWhiteLabeling: false,
    enableMultipleLOs: false // Realtors can only have 1 LO
  },

  // Business rules
  businessRules: {
    maxPartnershipsPerLO: 100,
    maxLandingPagesPerLO: 50,
    maxIndividualPagesPerRealtor: 20,
    inviteExpirationDays: 7,
    maxInviteResends: 3
  },

  // UI Configuration
  ui: {
    itemsPerPage: 12,
    maxTableRows: 50,
    animationDuration: 200,
    defaultPageSize: 8,
    
    // Breakpoints
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  },

  // Contact information
  support: {
    email: 'support@21stcenturylending.com',
    phone: '1-800-21ST-LOAN',
    hours: 'Monday-Friday 8AM-6PM PST'
  },

  // Legal
  legal: {
    companyName: '21st Century Lending',
    address: '123 Finance Street, Suite 100, Los Angeles, CA 90210',
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms'
  },

  // Social links
  social: {
    linkedin: 'https://linkedin.com/company/21st-century-lending',
    twitter: 'https://twitter.com/21stcenturylend',
    facebook: 'https://facebook.com/21stcenturylending'
  }
};

// User role permissions
export const PERMISSIONS = {
  'loan-officer': {
    canInvitePartners: true,
    canCreateCoBrandedPages: true,
    canViewAllPartnerships: true,
    canManageNotifications: false, // Can't change realtor's notification settings
    canDeletePartnerships: true,
    canViewAnalytics: true,
    canExportData: true
  },
  'realtor': {
    canInvitePartners: false,
    canCreateCoBrandedPages: false,
    canViewAllPartnerships: false,
    canManageNotifications: true, // Can manage their own notifications
    canDeletePartnerships: false,
    canViewAnalytics: true,
    canExportData: false
  }
};

// Page types and categories
export const PAGE_TYPES = {
  EDUCATIONAL: 'Educational',
  TOOL: 'Tool', 
  SERVICE: 'Service',
  APPLICATION: 'Application',
  PORTFOLIO: 'Portfolio',
  PROMOTIONAL: 'Promotional'
};

export const PAGE_CATEGORIES = {
  FIRST_TIME_BUYERS: 'First-Time Buyers',
  REFINANCING: 'Refinancing',
  VA_LOANS: 'VA Loans',
  JUMBO_LOANS: 'Jumbo Loans',
  INVESTMENT: 'Investment Properties',
  LUXURY: 'Luxury Homes',
  COMMERCIAL: 'Commercial Real Estate'
};

// Status configurations
export const STATUS_CONFIG = {
  partnership: {
    ACTIVE: { color: 'bg-[var(--brand-cyan)]', label: 'Active' },
    PENDING: { color: 'bg-orange-500', label: 'Pending' },
    INACTIVE: { color: 'bg-gray-400', label: 'Inactive' }
  },
  user: {
    ACTIVE: { color: 'bg-green-500', label: 'Active' },
    PENDING: { color: 'bg-yellow-500', label: 'Pending' },
    INACTIVE: { color: 'bg-red-500', label: 'Inactive' }
  }
};

// Default notification settings
export const DEFAULT_NOTIFICATIONS = {
  email: true,
  sms: false,
  push: false,
  weekly_digest: true,
  marketing: false
};

// Environment configuration
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

// WordPress plugin specific configuration (for future conversion)
export const WORDPRESS_CONFIG = {
  pluginSlug: '21st-century-partnership-portal',
  textDomain: '21st-century-pp',
  version: '1.0.0',
  minimumWpVersion: '5.0',
  minimumPhpVersion: '7.4',
  
  // Database table names (will be prefixed with wp_)
  tables: {
    users: 'lcp_users',
    partnerships: 'lcp_partnerships', 
    landingPages: 'lcp_landing_pages',
    analytics: 'lcp_analytics'
  },
  
  // Custom post types
  postTypes: {
    landingPage: 'lcp_landing_page',
    partnership: 'lcp_partnership'
  },

  // User roles
  userRoles: {
    loanOfficer: 'lcp_loan_officer',
    realtor: 'lcp_realtor'
  }
};