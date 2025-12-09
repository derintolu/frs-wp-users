/**
 * State utilities for mapping names to abbreviations and SVG paths
 */

export const STATE_MAP: Record<string, string> = {
  'alabama': 'AL',
  'alaska': 'AK',
  'arizona': 'AZ',
  'arkansas': 'AR',
  'california': 'CA',
  'colorado': 'CO',
  'connecticut': 'CT',
  'delaware': 'DE',
  'district-of-columbia': 'DC',
  'florida': 'FL',
  'georgia': 'GA',
  'hawaii': 'HI',
  'idaho': 'ID',
  'illinois': 'IL',
  'indiana': 'IN',
  'iowa': 'IA',
  'kansas': 'KS',
  'kentucky': 'KY',
  'louisiana': 'LA',
  'maine': 'ME',
  'maryland': 'MD',
  'massachusetts': 'MA',
  'michigan': 'MI',
  'minnesota': 'MN',
  'mississippi': 'MS',
  'missouri': 'MO',
  'montana': 'MT',
  'nebraska': 'NE',
  'nevada': 'NV',
  'new-hampshire': 'NH',
  'new-jersey': 'NJ',
  'new-mexico': 'NM',
  'new-york': 'NY',
  'north-carolina': 'NC',
  'north-dakota': 'ND',
  'ohio': 'OH',
  'oklahoma': 'OK',
  'oregon': 'OR',
  'pennsylvania': 'PA',
  'rhode-island': 'RI',
  'south-carolina': 'SC',
  'south-dakota': 'SD',
  'tennessee': 'TN',
  'texas': 'TX',
  'utah': 'UT',
  'vermont': 'VT',
  'virginia': 'VA',
  'washington': 'WA',
  'west-virginia': 'WV',
  'wisconsin': 'WI',
  'wyoming': 'WY',
};

export const ABBR_TO_SLUG_MAP: Record<string, string> = {
  'AK': 'alaska',
  'AL': 'alabama',
  'AR': 'arkansas',
  'AZ': 'arizona',
  'CA': 'california',
  'CO': 'colorado',
  'CT': 'connecticut',
  'DC': 'district-of-columbia',
  'DE': 'delaware',
  'FL': 'florida',
  'GA': 'georgia',
  'HI': 'hawaii',
  'IA': 'iowa',
  'ID': 'idaho',
  'IL': 'illinois',
  'IN': 'indiana',
  'KS': 'kansas',
  'KY': 'kentucky',
  'LA': 'louisiana',
  'MA': 'massachusetts',
  'MD': 'maryland',
  'ME': 'maine',
  'MI': 'michigan',
  'MN': 'minnesota',
  'MO': 'missouri',
  'MS': 'mississippi',
  'MT': 'montana',
  'NC': 'north-carolina',
  'ND': 'north-dakota',
  'NE': 'nebraska',
  'NH': 'new-hampshire',
  'NJ': 'new-jersey',
  'NM': 'new-mexico',
  'NV': 'nevada',
  'NY': 'new-york',
  'OH': 'ohio',
  'OK': 'oklahoma',
  'OR': 'oregon',
  'PA': 'pennsylvania',
  'RI': 'rhode-island',
  'SC': 'south-carolina',
  'SD': 'south-dakota',
  'TN': 'tennessee',
  'TX': 'texas',
  'UT': 'utah',
  'VA': 'virginia',
  'VT': 'vermont',
  'WA': 'washington',
  'WI': 'wisconsin',
  'WV': 'west-virginia',
  'WY': 'wyoming',
};

/**
 * Get state abbreviation from state name or slug
 */
export function getStateAbbr(stateNameOrSlug: string): string | null {
  const normalized = stateNameOrSlug.toLowerCase().trim().replaceAll(/\s+/g, '-');
  return STATE_MAP[normalized] || null;
}

/**
 * Get state slug from abbreviation
 */
export function getStateSlug(abbr: string): string | null {
  const normalized = abbr.toUpperCase().trim();
  return ABBR_TO_SLUG_MAP[normalized] || null;
}

/**
 * Get state SVG URL from frs-lrg plugin
 */
export function getStateSvgUrl(stateNameOrSlugOrAbbr: string): string | null {
  // Try as abbreviation first
  let slug = getStateSlug(stateNameOrSlugOrAbbr);

  // If not found, try as name/slug
  if (!slug) {
    const normalized = stateNameOrSlugOrAbbr.toLowerCase().trim().replaceAll(/\s+/g, '-');
    slug = normalized;
  }

  if (!slug) {return null;}

  // Get WordPress content URL
  const contentUrl = (window as any).frsPortalConfig?.contentUrl || '/wp-content';
  return `${contentUrl}/plugins/frs-lrg/assets/images/states/${slug}.svg`;
}

/**
 * Parse service area string to extract state
 * Examples:
 * - "CA" -> { state: "CA", svg: "california.svg" }
 * - "California" -> { state: "CA", svg: "california.svg" }
 * - "Los Angeles, CA" -> { state: "CA", svg: "california.svg" }
 * - "90210" -> null (just zip code, no state)
 */
export function parseServiceAreaForState(area: string): { abbr: string; svgUrl: string } | null {
  const trimmed = area.trim();

  // Check if it's a 2-letter abbreviation at the end
  const abbrMatch = trimmed.match(/\b([a-z]{2})\b$/i);
  if (abbrMatch) {
    const abbr = abbrMatch[1].toUpperCase();
    const svgUrl = getStateSvgUrl(abbr);
    if (svgUrl) {
      return { abbr, svgUrl };
    }
  }

  // Check if entire string is a state name
  const abbr = getStateAbbr(trimmed);
  if (abbr) {
    const svgUrl = getStateSvgUrl(abbr);
    if (svgUrl) {
      return { abbr, svgUrl };
    }
  }

  return null;
}
