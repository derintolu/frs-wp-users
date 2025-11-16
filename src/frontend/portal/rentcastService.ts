/**
 * Rentcast API Service
 *
 * Provides methods to interact with the Rentcast API for property valuations
 * and rent estimates.
 *
 * API Documentation: https://developers.rentcast.io/reference/introduction
 */

const RENTCAST_API_BASE = 'https://api.rentcast.io/v1';

export interface RentcastPropertyData {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface RentcastValueEstimate {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  priceRangeExtended: {
    lower: number;
    upper: number;
  };
  price75: number;
  price95: number;
  confidence: number;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  yearBuilt: number;
  comparables: RentcastComparable[];
}

export interface RentcastRentEstimate {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  rentRange75: {
    lower: number;
    upper: number;
  };
  rentRange95: {
    lower: number;
    upper: number;
  };
  confidence: number;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  comparables: RentcastRentalComparable[];
}

export interface RentcastComparable {
  id: string;
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  distance: number;
  price: number;
  lastSaleDate: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  pricePerSquareFoot: number;
  latitude: number;
  longitude: number;
}

export interface RentcastRentalComparable {
  id: string;
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  distance: number;
  monthlyRent: number;
  listedDate: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  rentPerSquareFoot: number;
  latitude: number;
  longitude: number;
}

/**
 * Get value estimate for a property
 */
export async function getValueEstimate(
  propertyData: RentcastPropertyData,
  apiKey: string
): Promise<RentcastValueEstimate> {
  const params = new URLSearchParams({
    address: propertyData.address,
    ...(propertyData.city && { city: propertyData.city }),
    ...(propertyData.state && { state: propertyData.state }),
    ...(propertyData.zipCode && { zipCode: propertyData.zipCode }),
  });

  const response = await fetch(
    `${RENTCAST_API_BASE}/avm/value?${params.toString()}`,
    {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Rentcast API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get rent estimate for a property
 */
export async function getRentEstimate(
  propertyData: RentcastPropertyData,
  apiKey: string
): Promise<RentcastRentEstimate> {
  const params = new URLSearchParams({
    address: propertyData.address,
    ...(propertyData.city && { city: propertyData.city }),
    ...(propertyData.state && { state: propertyData.state }),
    ...(propertyData.zipCode && { zipCode: propertyData.zipCode }),
  });

  const response = await fetch(
    `${RENTCAST_API_BASE}/avm/rent/long-term?${params.toString()}`,
    {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Rentcast API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * WordPress proxy method - call through WordPress REST API
 * This avoids exposing the API key on the frontend
 */
export async function getValuationViaWordPress(
  propertyData: RentcastPropertyData,
  valuationType: 'sale' | 'rent'
): Promise<RentcastValueEstimate | RentcastRentEstimate> {
  const nonce = (window as any).frsPortalConfig?.restNonce;

  const response = await fetch('/wp-json/frs/v1/rentcast/valuation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(nonce && { 'X-WP-Nonce': nonce }),
    },
    body: JSON.stringify({
      ...propertyData,
      valuationType,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get property valuation');
  }

  return response.json();
}
