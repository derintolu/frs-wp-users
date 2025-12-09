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
  bathrooms: number;
  bedrooms: number;
  comparables: RentcastComparable[];
  confidence: number;
  latitude: number;
  longitude: number;
  price: number;
  price75: number;
  price95: number;
  priceRangeExtended: {
    lower: number;
    upper: number;
  };
  priceRangeHigh: number;
  priceRangeLow: number;
  propertyType: string;
  squareFootage: number;
  yearBuilt: number;
}

export interface RentcastRentEstimate {
  bathrooms: number;
  bedrooms: number;
  comparables: RentcastRentalComparable[];
  confidence: number;
  latitude: number;
  longitude: number;
  propertyType: string;
  rent: number;
  rentRange75: {
    lower: number;
    upper: number;
  };
  rentRange95: {
    lower: number;
    upper: number;
  };
  rentRangeHigh: number;
  rentRangeLow: number;
  squareFootage: number;
}

export interface RentcastComparable {
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  bathrooms: number;
  bedrooms: number;
  distance: number;
  id: string;
  lastSaleDate: string;
  latitude: number;
  longitude: number;
  price: number;
  pricePerSquareFoot: number;
  squareFootage: number;
}

export interface RentcastRentalComparable {
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  bathrooms: number;
  bedrooms: number;
  distance: number;
  id: string;
  latitude: number;
  listedDate: string;
  longitude: number;
  monthlyRent: number;
  rentPerSquareFoot: number;
  squareFootage: number;
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
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
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
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
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
    body: JSON.stringify({
      ...propertyData,
      valuationType,
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(nonce && { 'X-WP-Nonce': nonce }),
    },
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get property valuation');
  }

  return response.json();
}
