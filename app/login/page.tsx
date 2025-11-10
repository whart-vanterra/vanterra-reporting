'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard } from 'lucide-react'

/**
 * Login Page - Redirects to Central Authentication Service
 *
 * This app uses SSO (Single Sign-On) with the central auth service.
 * Users are redirected to auth.vanterrafoundations.com for authentication.
 */
export default function LoginPage() {
  useEffect(() => {
    // Get the auth domain from environment or use default
    const authDomain =
      process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
      'https://auth.vanterrafoundations.com'

    // Get the current origin for redirect back after login
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''

    // Redirect to central auth service
    window.location.href = `${authDomain}/login?origin=${encodeURIComponent(currentOrigin)}`
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            <span className="font-bold text-2xl">Vanterra Reporting</span>
          </div>
          <CardTitle className="text-center">Redirecting to Sign In...</CardTitle>
          <CardDescription className="text-center">
            Please wait while we redirect you to the authentication page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    </div>
  )
}
