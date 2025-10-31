import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(num: number | null | undefined, decimals: number = 1): string {
  if (num === null || num === undefined) return 'N/A'
  return `${num.toFixed(decimals)}%`
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}
