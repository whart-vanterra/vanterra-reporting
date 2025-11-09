import { NextResponse } from 'next/server'
import { updateLocation, deleteLocation } from '@/lib/admin-api-client'
import type { UpdateLocationInput } from '@/lib/admin-types'

type RouteParams = {
  params: Promise<{
    shortcode: string
    locationId: string
  }>
}

/**
 * PUT /api/admin/brands/[shortcode]/locations/[locationId]
 * Update a location
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { shortcode, locationId } = await params
    const body = (await request.json()) as UpdateLocationInput

    const data = await updateLocation(shortcode, parseInt(locationId, 10), body)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update location',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/brands/[shortcode]/locations/[locationId]
 * Delete a location
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { shortcode, locationId } = await params
    const data = await deleteLocation(shortcode, parseInt(locationId, 10))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete location',
      },
      { status: 500 }
    )
  }
}
