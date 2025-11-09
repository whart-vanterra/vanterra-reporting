import { NextResponse } from 'next/server'
import { getAdminBrands, createBrand } from '@/lib/admin-api-client'
import type { CreateBrandInput } from '@/lib/admin-types'

/**
 * GET /api/admin/brands
 * List all brands
 */
export async function GET() {
  try {
    const data = await getAdminBrands()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch brands',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/brands
 * Create a new brand
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateBrandInput

    // Basic validation
    if (!body.shortcode || !body.full_name || !body.primary_domain) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: [
            'shortcode, full_name, and primary_domain are required',
          ],
        },
        { status: 400 }
      )
    }

    const data = await createBrand(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create brand',
      },
      { status: 500 }
    )
  }
}
