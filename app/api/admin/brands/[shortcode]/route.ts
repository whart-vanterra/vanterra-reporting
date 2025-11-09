import { NextResponse } from 'next/server'
import {
  getAdminBrand,
  updateBrand,
  deleteBrand,
} from '@/lib/admin-api-client'
import type { UpdateBrandInput } from '@/lib/admin-types'

type RouteParams = {
  params: Promise<{
    shortcode: string
  }>
}

/**
 * GET /api/admin/brands/[shortcode]
 * Get a specific brand
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { shortcode } = await params
    const data = await getAdminBrand(shortcode)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch brand',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/brands/[shortcode]
 * Update a brand
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { shortcode } = await params
    const body = await request.json() as UpdateBrandInput

    const data = await updateBrand(shortcode, body)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update brand',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/brands/[shortcode]
 * Delete a brand (and all its locations)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { shortcode } = await params
    const data = await deleteBrand(shortcode)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete brand',
      },
      { status: 500 }
    )
  }
}
