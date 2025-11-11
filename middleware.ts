import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Session configuration
const SESSION_TIMEOUT = 60 * 60 * 1000 // 1 hour
const SESSION_REFRESH_THRESHOLD = 15 * 60 * 1000 // 15 minutes

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authDomain =
    process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
    'https://auth.vanterrafoundations.com'

  // Public paths that don't require authentication
  const publicPaths = ['/auth/callback', '/login', '/_next', '/api', '/favicon.ico']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // SECURITY: Use getUser() instead of getSession() for server validation
  // getUser() makes an API call to Supabase to verify the token
  // getSession() only reads the cookie without validation
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user and not on public path, redirect to auth service
  if (!user && !isPublicPath) {
    return NextResponse.redirect(
      `${authDomain}/login?origin=${encodeURIComponent(request.url)}`
    )
  }

  // Check session expiration and refresh if needed
  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session && session.expires_at) {
      const timeUntilExpiry = session.expires_at * 1000 - Date.now()

      // If session expired, force re-authentication
      if (timeUntilExpiry <= 0) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${authDomain}/login?error=session_expired&origin=${encodeURIComponent(request.url)}`
        )
      }

      // If session about to expire (< 15 minutes), refresh it
      if (timeUntilExpiry < SESSION_REFRESH_THRESHOLD) {
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          console.error('Failed to refresh session:', error)
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${authDomain}/login?error=session_refresh_failed&origin=${encodeURIComponent(request.url)}`
          )
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
