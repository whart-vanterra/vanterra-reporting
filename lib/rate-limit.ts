/**
 * Rate Limiting Implementation
 *
 * In-memory rate limiter with automatic cleanup
 * Prevents abuse and brute force attacks
 */

export interface RateLimitOptions {
  limit: number // Maximum number of requests
  window: number // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory store for rate limits
const store = new Map<string, RateLimitRecord>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check rate limit for a given identifier
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const key = `${identifier}:${options.limit}:${options.window}`

  let record = store.get(key)

  // If no record or expired, create new one
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + options.window,
    }
    store.set(key, record)
  }

  // Increment count
  record.count++

  return {
    success: record.count <= options.limit,
    remaining: Math.max(0, options.limit - record.count),
    reset: record.resetTime,
    limit: options.limit,
  }
}

/**
 * Get client identifier from request headers
 * Uses IP address or forwarded IP
 */
export function getClientIdentifier(headers: Headers): string {
  // Try various headers for IP address
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Predefined rate limits for different operations
 */
export const RATE_LIMITS = {
  AUTH_CALLBACK: {
    limit: 10, // 10 requests
    window: 60 * 1000, // per minute
  },
  API_REQUEST: {
    limit: 60, // 60 requests
    window: 60 * 1000, // per minute
  },
  LOGIN: {
    limit: 5, // 5 attempts
    window: 15 * 60 * 1000, // per 15 minutes
  },
} as const
