import { format, parse, isValid, subDays, startOfDay, endOfDay } from 'date-fns'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import type { DateRange, Filters } from './types'
import { getPresetByValue } from './date-presets'

const DATE_FORMAT = 'yyyy-MM-dd'

export interface URLParams {
  brand?: string
  start?: string
  end?: string
  preset?: string
}

/**
 * Encode filters to URL search params
 */
export function filtersToURLParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.brand) {
    params.set('brand', filters.brand)
  }

  if (filters.dateRange.from) {
    params.set('start', format(filters.dateRange.from, DATE_FORMAT))
  }

  if (filters.dateRange.to) {
    params.set('end', format(filters.dateRange.to, DATE_FORMAT))
  }

  return params
}

/**
 * Get default date range (Last 30 Days)
 */
export function getDefaultDateRange(): DateRange {
  const today = new Date()
  return {
    from: startOfDay(subDays(today, 29)),
    to: endOfDay(today),
  }
}

/**
 * Decode URL search params to filters
 * Can handle ReadonlyURLSearchParams from useSearchParams()
 * Always returns a valid date range (defaults to Last 30 Days)
 */
export function urlParamsToFilters(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  defaultBrand: string = '58'
): Filters {
  const brand = searchParams.get('brand') || defaultBrand
  const preset = searchParams.get('preset')
  const startStr = searchParams.get('start')
  const endStr = searchParams.get('end')

  let dateRange: DateRange | null = null

  // Try preset first
  if (preset) {
    const presetObj = getPresetByValue(preset)
    if (presetObj) {
      dateRange = presetObj.getRange()
    }
  }

  // Override with explicit dates if provided
  if (startStr && endStr) {
    const from = parse(startStr, DATE_FORMAT, new Date())
    const to = parse(endStr, DATE_FORMAT, new Date())
    if (isValid(from) && isValid(to)) {
      dateRange = { from, to }
    }
  }

  // Use default if no valid date range found
  if (!dateRange || !dateRange.from || !dateRange.to) {
    dateRange = getDefaultDateRange()
  }

  return {
    brand,
    dateRange,
  }
}

/**
 * Update URL without page reload
 */
export function updateURL(filters: Filters, router: any) {
  const params = filtersToURLParams(filters)
  const newURL = `${window.location.pathname}?${params.toString()}`

  // Use router.replace to avoid adding to history stack
  router.replace(newURL, { scroll: false })
}

/**
 * Get shareable URL
 */
export function getShareableURL(filters: Filters): string {
  const params = filtersToURLParams(filters)
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}

/**
 * Parse date from URL param
 */
export function parseDateFromURL(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined

  const date = parse(dateStr, DATE_FORMAT, new Date())
  return isValid(date) ? date : undefined
}

/**
 * Format date for URL param
 */
export function formatDateForURL(date: Date | undefined): string | undefined {
  if (!date || !isValid(date)) return undefined
  return format(date, DATE_FORMAT)
}
