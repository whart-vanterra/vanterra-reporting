import { NextResponse } from 'next/server'
import { refreshConfigCache } from '@/lib/admin-api-client'

/**
 * POST /api/admin/cache
 * Force refresh the config cache
 */
export async function POST() {
  try {
    const data = await refreshConfigCache()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error refreshing cache:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to refresh cache',
      },
      { status: 500 }
    )
  }
}
