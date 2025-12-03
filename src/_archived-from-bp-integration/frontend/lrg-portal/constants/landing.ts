/**
 * Landing Page Constants and Utilities
 * Used by MarketingMaterials and LandingPageEditor components
 */

export const PAGE_TYPE_LABELS = {
  biolink: 'Bio Link Page',
  loan_officer: 'Loan Officer Page',
  realtor_partner: 'Realtor Partner Page',
  prequal: 'Pre-Qualification Page',
  openhouse: 'Open House Page',
  cobranded: 'Co-Branded Page',
  landing_page: 'Landing Page',
  'loan-officer': 'Loan Officer Page',
  'realtor-partner': 'Realtor Partner Page'
} as const;

export type PageType = keyof typeof PAGE_TYPE_LABELS;

/**
 * Build URL for landing page editor iframe
 */
export function buildLandingEditorUrl(pageId: string, editMode: boolean = true, pageType?: string): string {
  const baseUrl = window.location.origin;

  // For biolink pages, use direct WordPress admin editor
  if (pageType === 'biolink') {
    return `${baseUrl}/wp-admin/post.php?post=${pageId}&action=edit`;
  }

  // For other page types, we'll define their editors when we get to them
  // For now, return a placeholder or disable editing
  return `${baseUrl}/?p=${pageId}`; // Just show the page for now
}

/**
 * Page type configuration for different landing page types
 */
export const PAGE_TYPE_CONFIG = {
  biolink: {
    label: 'Bio Link Page',
    description: 'Personal profile page with contact information and links',
    icon: 'user',
    allowMultiple: false
  },
  prequal: {
    label: 'Pre-Qualification Page',
    description: 'Lead capture page for mortgage pre-qualification',
    icon: 'home',
    allowMultiple: true
  },
  openhouse: {
    label: 'Open House Page',
    description: 'Event page for real estate open houses',
    icon: 'calendar',
    allowMultiple: true
  },
  cobranded: {
    label: 'Co-Branded Page',
    description: 'Joint marketing page with realtor partner',
    icon: 'users',
    allowMultiple: true
  }
} as const;

/**
 * Default landing page templates
 */
export const DEFAULT_TEMPLATES = {
  biolink: 'biolink-default',
  prequal: 'prequal-default',
  openhouse: 'openhouse-default',
  cobranded: 'cobranded-default'
} as const;