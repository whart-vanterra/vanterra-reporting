/**
 * Client-side Admin API helpers
 *
 * These functions make requests to our Next.js API routes,
 * which in turn call the webhook admin API with the secure token.
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

async function fetchClientAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

export async function fetchBrands(): Promise<AdminBrandsListResponse> {
  return fetchClientAPI<AdminBrandsListResponse>('/api/admin/brands')
}

export async function fetchBrand(
  shortcode: string
): Promise<AdminBrandDetailResponse> {
  return fetchClientAPI<AdminBrandDetailResponse>(`/api/admin/brands/${shortcode}`)
}

export async function createBrandClient(
  data: CreateBrandInput
): Promise<AdminBrandDetailResponse> {
  return fetchClientAPI<AdminBrandDetailResponse>('/api/admin/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBrandClient(
  shortcode: string,
  data: UpdateBrandInput
): Promise<AdminBrandDetailResponse> {
  return fetchClientAPI<AdminBrandDetailResponse>(`/api/admin/brands/${shortcode}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteBrandClient(
  shortcode: string
): Promise<AdminApiResponse> {
  return fetchClientAPI<AdminApiResponse>(`/api/admin/brands/${shortcode}`, {
    method: 'DELETE',
  })
}

// ============================================================================
// LOCATION MANAGEMENT
// ============================================================================

export async function fetchLocations(
  shortcode: string
): Promise<AdminLocationsListResponse> {
  return fetchClientAPI<AdminLocationsListResponse>(
    `/api/admin/brands/${shortcode}/locations`
  )
}

export async function createLocationClient(
  shortcode: string,
  data: CreateLocationInput
): Promise<AdminLocationDetailResponse> {
  return fetchClientAPI<AdminLocationDetailResponse>(
    `/api/admin/brands/${shortcode}/locations`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )
}

export async function updateLocationClient(
  shortcode: string,
  locationId: number,
  data: UpdateLocationInput
): Promise<AdminLocationDetailResponse> {
  return fetchClientAPI<AdminLocationDetailResponse>(
    `/api/admin/brands/${shortcode}/locations/${locationId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  )
}

export async function deleteLocationClient(
  shortcode: string,
  locationId: number
): Promise<AdminApiResponse> {
  return fetchClientAPI<AdminApiResponse>(
    `/api/admin/brands/${shortcode}/locations/${locationId}`,
    {
      method: 'DELETE',
    }
  )
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

export async function refreshCacheClient(): Promise<AdminApiResponse> {
  return fetchClientAPI<AdminApiResponse>('/api/admin/cache', {
    method: 'POST',
  })
}
