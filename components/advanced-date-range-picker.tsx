'use client'

import * as React from 'react'
import { format } from 'date-fns'
import Datepicker from 'react-tailwindcss-datepicker'
import { DateRange } from '@/lib/types'
import { DATE_PRESETS, findMatchingPreset } from '@/lib/date-presets'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AdvancedDateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function AdvancedDateRangePicker({
  value,
  onChange,
  className
}: AdvancedDateRangePickerProps) {
  const [dateValue, setDateValue] = React.useState({
    startDate: value.from || null,
    endDate: value.to || null,
  })

  React.useEffect(() => {
    setDateValue({
      startDate: value.from || null,
      endDate: value.to || null,
    })
  }, [value])

  const handlePresetClick = (presetValue: string) => {
    const preset = DATE_PRESETS.find(p => p.value === presetValue)
    if (preset) {
      const range = preset.getRange()
      onChange(range)
    }
  }

  const handleValueChange = (newValue: any) => {
    if (newValue?.startDate && newValue?.endDate) {
      setDateValue(newValue)
      onChange({
        from: new Date(newValue.startDate),
        to: new Date(newValue.endDate),
      })
    }
  }

  const matchedPreset = findMatchingPreset(value)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Date Picker */}
      <div className="w-[280px]">
        <Datepicker
          value={dateValue}
          onChange={handleValueChange}
          showShortcuts={false}
          primaryColor="blue"
          displayFormat="MMM DD, YYYY"
          placeholder="Select date range"
          useRange={true}
          separator="to"
        />
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-1">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant={matchedPreset?.value === preset.value ? 'default' : 'outline'}
            size="sm"
            className="h-9 text-xs"
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
