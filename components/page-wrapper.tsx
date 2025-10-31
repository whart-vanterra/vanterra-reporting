'use client'

import { Suspense } from 'react'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      {children}
    </Suspense>
  )
}
