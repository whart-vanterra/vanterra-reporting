/**
 * Admin API Client
 *
 * This client is used ONLY on the server-side (API routes, Server Components, Server Actions)
 * to interact with the webhook admin API.
 *
 * NEVER use this directly from client components - it requires ADMIN_API_TOKEN which
 * must remain secret.
 */

import type {
  AdminBrandsListResponse,
  AdminBrandDetailResponse,
  AdminLocationDetailResponse,
  AdminLocationsListResponse,
  CreateBrandInput,
  UpdateBrandInput,
  CreateLocationInput,
  UpdateLocationInput,
  AdminApiResponse,
} from './admin-types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.vanterrafoundations.com'
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN

if (!ADMIN_TOKEN) {
  console.warn('⚠️ ADMIN_API_TOKEN not configured. Admin API calls will fail.')
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

async function fetchAdminAPI<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)

  // Add query parameters if provided
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Request failed',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(error.message || error.error || `API error: ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// BRAND MANAGEMENT
// ============================================================================

/**
 * Get all brands
 */
export async function getAdminBrands(): Promise<AdminBrandsListResponse> {
  return fetchAdminAPI<AdminBrandsListResponse>('/admin/brands')
}

/**
 * Get a single brand by shortcode
 */
export async function getAdminBrand(
  shortcode: string
): Promise<AdminBrandDetailResponse> {
  return fetchAdminAPI<AdminBrandDetailResponse>(`/admin/brands/${shortcode}`)
}

/**
 * Create a new brand
 */
export async function createBrand(
  data: CreateBrandInput
): Promise<AdminBrandDetailResponse> {
  return fetchAdminAPI<AdminBrandDetailResponse>('/admin/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update an existing brand
 */
export async function updateBrand(
  shortcode: string,
  data: UpdateBrandInput
): Promise<AdminBrandDetailResponse> {
  return fetchAdminAPI<AdminBrandDetailResponse>(`/admin/brands/${shortcode}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a brand (and all its locations)
 */
export async function deleteBrand(
  shortcode: string
): Promise<AdminApiResponse> {
  return fetchAdminAPI<AdminApiResponse>(`/admin/brands/${shortcode}`, {
    method: 'DELETE',
  })
}

// ============================================================================
// LOCATION MANAGEMENT
// ============================================================================

/**
 * Get all locations for a brand
 */
export async function getAdminLocations(
  shortcode: string
): Promise<AdminLocationsListResponse> {
  return fetchAdminAPI<AdminLocationsListResponse>(
    `/admin/brands/${shortcode}/locations`
  )
}

/**
 * Create a new location for a brand
 */
export async function createLocation(
  shortcode: string,
  data: CreateLocationInput
): Promise<AdminLocationDetailResponse> {
  return fetchAdminAPI<AdminLocationDetailResponse>(
    `/admin/brands/${shortcode}/locations`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )
}

/**
 * Update an existing location
 */
export async function updateLocation(
  shortcode: string,
  locationId: number,
  data: UpdateLocationInput
): Promise<AdminLocationDetailResponse> {
  return fetchAdminAPI<AdminLocationDetailResponse>(
    `/admin/brands/${shortcode}/locations/${locationId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  )
}

/**
 * Delete a location
 */
export async function deleteLocation(
  shortcode: string,
  locationId: number
): Promise<AdminApiResponse> {
  return fetchAdminAPI<AdminApiResponse>(
    `/admin/brands/${shortcode}/locations/${locationId}`,
    {
      method: 'DELETE',
    }
  )
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Force refresh the config cache
 */
export async function refreshConfigCache(): Promise<AdminApiResponse> {
  return fetchAdminAPI<AdminApiResponse>('/admin/brands/cache/refresh', {
    method: 'POST',
  })
}
