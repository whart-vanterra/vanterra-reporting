'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocationForm } from '@/components/admin/location-form'
import { ArrowLeft, MapPin } from 'lucide-react'

export default function NewLocationPage({
  params,
}: {
  params: Promise<{ shortcode: string }>
}) {
  const resolvedParams = use(params)

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
          Add New Location
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a new location for brand: <code className="font-mono">{resolvedParams.shortcode}</code>
        </p>
      </div>

      <LocationForm brandShortcode={resolvedParams.shortcode} mode="create" />
    </div>
  )
}
