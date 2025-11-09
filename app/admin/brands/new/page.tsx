'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandForm } from '@/components/admin/brand-form'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function NewBrandPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/admin/brands">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Brands
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Create New Brand
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a new brand configuration to the system
        </p>
      </div>

      <BrandForm mode="create" />
    </div>
  )
}
