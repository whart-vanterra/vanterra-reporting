'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { AdvancedDateRangePicker } from './advanced-date-range-picker'
import { BrandSelector } from './brand-selector'
import { Filters } from '@/lib/types'
import { updateURL } from '@/lib/url-params'
import { Button } from './ui/button'
import { Share2, RotateCcw } from 'lucide-react'
import { subDays } from 'date-fns'

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Update URL when filters change
  useEffect(() => {
    updateURL(filters, router)
  }, [filters, router])

  const handleReset = () => {
    onChange({
      brand: '58',
      dateRange: {
        from: subDays(new Date(), 30),
        to: new Date(),
      },
    })
  }

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`
    try {
      await navigator.clipboard.writeText(url)
      // Could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Brand:</span>
          <BrandSelector
            value={filters.brand}
            onChange={(brand) => onChange({ ...filters, brand })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Date Range:</span>
          <AdvancedDateRangePicker
            value={filters.dateRange}
            onChange={(dateRange) => onChange({ ...filters, dateRange })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          title="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          title="Copy shareable link"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
