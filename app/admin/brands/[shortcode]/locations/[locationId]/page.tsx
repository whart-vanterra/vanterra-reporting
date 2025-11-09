'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocationForm } from '@/components/admin/location-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchBrand } from '@/lib/client-admin-api'
import type { AdminBrandLocation } from '@/lib/admin-types'
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react'

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ shortcode: string; locationId: string }>
}) {
  const resolvedParams = use(params)
  const [location, setLocation] = useState<AdminBrandLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLocation = async () => {
      try {
        setLoading(true)
        const response = await fetchBrand(resolvedParams.shortcode)
        const loc = response.brand.locations?.find(
          (l) => l.id === parseInt(resolvedParams.locationId, 10)
        )
        if (loc) {
          setLocation(loc)
        } else {
          setError('Location not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load location')
      } finally {
        setLoading(false)
      }
    }

    loadLocation()
  }, [resolvedParams.shortcode, resolvedParams.locationId])

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

  if (error || !location) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Location not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href={`/admin/brands/${resolvedParams.shortcode}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Brand
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Edit {location.location_name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Update location configuration and integrations
        </p>
      </div>

      <LocationForm
        brandShortcode={resolvedParams.shortcode}
        location={location}
        mode="edit"
      />
    </div>
  )
}
