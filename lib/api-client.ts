import type {
  MetricsSummaryResponse,
  AttributionBreakdownResponse,
  LeadsResponse,
  AppointmentsResponse,
  LeadsWithAppointmentsResponse,
  CallRailLookupRequest,
  CallRailLookupResponse,
  BrandsResponse,
  BrandResponse,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Cache for brands data (1 hour TTL to match API cache)
let brandsCache: { data: BrandsResponse; timestamp: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Add API key when authentication is implemented:
      // 'X-API-Key': process.env.API_KEY || '',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

export async function getMetricsSummary(params: {
  brand: string
  start: string
  end: string
  include_trend?: boolean
}): Promise<MetricsSummaryResponse> {
  const searchParams = new URLSearchParams({
    brand: params.brand,
    start: params.start,
    end: params.end,
    ...(params.include_trend !== undefined && { include_trend: String(params.include_trend) }),
  })

  return fetchAPI<MetricsSummaryResponse>(`/reporting/metrics/summary?${searchParams}`)
}

export async function getAttributionBreakdown(params: {
  brand: string
  start: string
  end: string
  group_by?: 'channel' | 'source' | 'campaign' | 'location' | 'click_id_type'
}): Promise<AttributionBreakdownResponse> {
  const searchParams = new URLSearchParams({
    brand: params.brand,
    start: params.start,
    end: params.end,
    ...(params.group_by && { group_by: params.group_by }),
  })

  return fetchAPI<AttributionBreakdownResponse>(`/reporting/attribution/breakdown?${searchParams}`)
}

export async function getLeads(params: {
  brand: string
  start: string
  end: string
  type?: 'call' | 'form'
  limit?: number
  offset?: number
}): Promise<LeadsResponse> {
  const searchParams = new URLSearchParams({
    brand: params.brand,
    start: params.start,
    end: params.end,
    ...(params.type && { type: params.type }),
    ...(params.limit !== undefined && { limit: String(params.limit) }),
    ...(params.offset !== undefined && { offset: String(params.offset) }),
  })

  return fetchAPI<LeadsResponse>(`/reporting/leads?${searchParams}`)
}

export async function getAppointments(params: {
  brand: string
  start: string
  end: string
  limit?: number
  offset?: number
}): Promise<AppointmentsResponse> {
  const searchParams = new URLSearchParams({
    brand: params.brand,
    start: params.start,
    end: params.end,
    ...(params.limit !== undefined && { limit: String(params.limit) }),
    ...(params.offset !== undefined && { offset: String(params.offset) }),
  })

  return fetchAPI<AppointmentsResponse>(`/reporting/appointments?${searchParams}`)
}

export async function getLeadsWithAppointments(params: {
  brand: string
  start: string
  end: string
  lookforward_days?: number
}): Promise<LeadsWithAppointmentsResponse> {
  const searchParams = new URLSearchParams({
    brand: params.brand,
    start: params.start,
    end: params.end,
    ...(params.lookforward_days !== undefined && { lookforward_days: String(params.lookforward_days) }),
  })

  return fetchAPI<LeadsWithAppointmentsResponse>(`/reporting/leads-with-appointments?${searchParams}`)
}

export async function lookupCallRail(
  data: CallRailLookupRequest
): Promise<CallRailLookupResponse> {
  return fetchAPI<CallRailLookupResponse>('/reporting/callrail/lookup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getBrands(useCache: boolean = true): Promise<BrandsResponse> {
  // Check cache first
  if (useCache && brandsCache) {
    const age = Date.now() - brandsCache.timestamp
    if (age < CACHE_TTL) {
      return brandsCache.data
    }
  }

  // Fetch from API
  const data = await fetchAPI<BrandsResponse>('/brands')

  // Update cache
  brandsCache = {
    data,
    timestamp: Date.now(),
  }

  return data
}

export async function getBrand(shortcode: string): Promise<BrandResponse> {
  return fetchAPI<BrandResponse>(`/brands/${shortcode}`)
}

export async function getBrandByDomain(domain: string): Promise<BrandResponse> {
  return fetchAPI<BrandResponse>(`/brands/by-domain/${encodeURIComponent(domain)}`)
}
