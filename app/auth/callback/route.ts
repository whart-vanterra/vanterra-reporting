import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limit auth callbacks to prevent abuse
  const identifier = getClientIdentifier(request.headers)
  const rateLimitResult = rateLimit(identifier, RATE_LIMITS.AUTH_CALLBACK)

  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        reset: rateLimitResult.reset,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          ).toString(),
        },
      }
    )
  }

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const access_token = requestUrl.searchParams.get('access_token')
  const refresh_token = requestUrl.searchParams.get('refresh_token')

  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // noop - cookies cannot be set during Server Component render
          }
        },
      },
    }
  )

  if (code) {
    // Handle OAuth code exchange (secure PKCE flow for Google login)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Failed to exchange code for session:', error)
      const authDomain =
        process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
        'https://auth.vanterrafoundations.com'
      return NextResponse.redirect(
        new URL(`${authDomain}/login?error=auth_failed`, request.url)
      )
    }
  } else if (access_token && refresh_token) {
    // Handle SSO token flow from auth service
    // SECURITY NOTE: Tokens are passed via URL for cross-domain SSO because
    // Supabase SSR cannot reliably share sessions via wildcard cookies.
    // We immediately call setSession() to let Supabase manage proper httpOnly cookies,
    // then redirect to clean URL to remove tokens from browser history.
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('Failed to set session from tokens:', error)
      const authDomain =
        process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
        'https://auth.vanterrafoundations.com'
      return NextResponse.redirect(
        new URL(`${authDomain}/login?error=auth_failed`, request.url)
      )
    }
  } else {
    // No auth credentials provided - redirect to auth service
    const authDomain =
      process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
      'https://auth.vanterrafoundations.com'
    return NextResponse.redirect(
      new URL(
        `${authDomain}/login?origin=${encodeURIComponent(requestUrl.origin)}`,
        request.url
      )
    )
  }

  // Validate redirect parameter against whitelist to prevent open redirects
  const redirectParam = requestUrl.searchParams.get('redirect') || '/'
  const allowedRedirects = [
    '/',
    '/dashboard',
    '/reports',
    '/settings',
  ]

  // Check if redirect starts with an allowed path
  const isAllowed = allowedRedirects.some(
    (path) => redirectParam === path || redirectParam.startsWith(`${path}/`)
  )

  // Use safe redirect or fallback to /
  const safeRedirect = isAllowed ? redirectParam : '/'

  return NextResponse.redirect(new URL(safeRedirect, request.url))
}
