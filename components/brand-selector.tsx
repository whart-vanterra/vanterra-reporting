'use client'

import { useEffect, useState } from 'react'
import { getBrands } from '@/lib/api-client'
import type { BrandConfig } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2 } from 'lucide-react'

interface BrandSelectorProps {
  value: string
  onChange: (brand: string) => void
}

export function BrandSelector({ value, onChange }: BrandSelectorProps) {
  const [brands, setBrands] = useState<BrandConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getBrands()
        setBrands(response.brands)
      } catch (err) {
        setError('Failed to load brands')
        console.error('Error fetching brands:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-[250px]">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading brands...</span>
          </div>
        ) : (
          <SelectValue placeholder="Select brand" />
        )}
      </SelectTrigger>
      <SelectContent>
        {brands.map((brand) => (
          <SelectItem key={brand.shortcode} value={brand.shortcode}>
            {brand.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
