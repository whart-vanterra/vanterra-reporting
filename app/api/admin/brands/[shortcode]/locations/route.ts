import { NextResponse } from 'next/server'
import { getAdminLocations, createLocation } from '@/lib/admin-api-client'
import type { CreateLocationInput } from '@/lib/admin-types'

type RouteParams = {
  params: Promise<{
    shortcode: string
  }>
}

/**
 * GET /api/admin/brands/[shortcode]/locations
 * List all locations for a brand
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { shortcode } = await params
    const data = await getAdminLocations(shortcode)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch locations',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/brands/[shortcode]/locations
 * Create a new location
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { shortcode } = await params
    const body = (await request.json()) as CreateLocationInput

    // Basic validation
    if (!body.location_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: ['location_name is required'],
        },
        { status: 400 }
      )
    }

    const data = await createLocation(shortcode, body)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create location',
      },
      { status: 500 }
    )
  }
}
