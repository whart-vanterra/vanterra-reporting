'use client'

import * as React from 'react'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [localRange, setLocalRange] = React.useState(value)

  const handleApply = () => {
    onChange(localRange)
    setIsOpen(false)
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    setLocalRange({ ...localRange, from: date })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    setLocalRange({ ...localRange, to: date })
  }

  const displayText = () => {
    if (value.from) {
      if (value.to) {
        return `${format(value.from, 'LLL dd, y')} - ${format(value.to, 'LLL dd, y')}`
      }
      return format(value.from, 'LLL dd, y')
    }
    return 'Pick a date range'
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !value.from && 'text-muted-foreground'
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {displayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="from" className="text-sm font-medium">
                From
              </label>
              <input
                type="date"
                id="from"
                value={localRange.from ? format(localRange.from, 'yyyy-MM-dd') : ''}
                onChange={handleFromChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="to" className="text-sm font-medium">
                To
              </label>
              <input
                type="date"
                id="to"
                value={localRange.to ? format(localRange.to, 'yyyy-MM-dd') : ''}
                onChange={handleToChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
            <Button onClick={handleApply} size="sm">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
