import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-me'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and static files
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify token
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
