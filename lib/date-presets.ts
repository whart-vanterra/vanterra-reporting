import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear
} from 'date-fns'
import type { DateRange } from './types'

export interface DatePreset {
  label: string
  value: string
  getRange: () => DateRange
  description?: string
}

const today = new Date()

export const DATE_PRESETS: DatePreset[] = [
  {
    label: 'Last 30 Days',
    value: 'last-30-days',
    description: 'Past 30 days',
    getRange: () => ({
      from: startOfDay(subDays(today, 29)),
      to: endOfDay(today),
    }),
  },
  {
    label: 'Last Week',
    value: 'last-week',
    description: 'Previous full week',
    getRange: () => ({
      from: startOfWeek(subDays(today, 7)),
      to: endOfWeek(subDays(today, 7)),
    }),
  },
  {
    label: 'This Month',
    value: 'this-month',
    description: 'Month to date',
    getRange: () => ({
      from: startOfMonth(today),
      to: endOfDay(today),
    }),
  },
  {
    label: 'Last Month',
    value: 'last-month',
    description: 'Previous full month',
    getRange: () => ({
      from: startOfMonth(subMonths(today, 1)),
      to: endOfMonth(subMonths(today, 1)),
    }),
  },
]

export function getPresetByValue(value: string): DatePreset | undefined {
  return DATE_PRESETS.find(preset => preset.value === value)
}

export function findMatchingPreset(range: DateRange): DatePreset | undefined {
  if (!range.from || !range.to) return undefined

  return DATE_PRESETS.find(preset => {
    const presetRange = preset.getRange()
    return (
      presetRange.from?.getTime() === range.from?.getTime() &&
      presetRange.to?.getTime() === range.to?.getTime()
    )
  })
}
