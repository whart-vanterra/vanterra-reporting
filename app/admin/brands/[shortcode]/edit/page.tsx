'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandForm } from '@/components/admin/brand-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchBrand } from '@/lib/client-admin-api'
import type { AdminBrandConfig } from '@/lib/admin-types'
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react'

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ shortcode: string }>
}) {
  const resolvedParams = use(params)
  const [brand, setBrand] = useState<AdminBrandConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBrand = async () => {
      try {
        setLoading(true)
        const response = await fetchBrand(resolvedParams.shortcode)
        setBrand(response.brand)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load brand')
      } finally {
        setLoading(false)
      }
    }

    loadBrand()
  }, [resolvedParams.shortcode])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error || !brand) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Brand not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href={`/admin/brands/${brand.shortcode}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Brand
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Edit {brand.full_name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Update brand configuration and settings
        </p>
      </div>

      <BrandForm brand={brand} mode="edit" />
    </div>
  )
}
