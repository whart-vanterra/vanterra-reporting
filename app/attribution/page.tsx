'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, subDays } from 'date-fns'
import { FilterBar } from '@/components/filter-bar'
import { urlParamsToFilters } from '@/lib/url-params'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAttributionBreakdown } from '@/lib/api-client'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { Filters, AttributionBreakdownResponse } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

type GroupBy = 'channel' | 'source' | 'campaign' | 'location' | 'click_id_type'

function AttributionContent() {
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<Filters>(() => {
    return urlParamsToFilters(searchParams, '58')
  })

  const [groupBy, setGroupBy] = useState<GroupBy>('channel')
  const [data, setData] = useState<AttributionBreakdownResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.dateRange.from || !filters.dateRange.to) return

      setLoading(true)
      setError(null)

      try {
        const response = await getAttributionBreakdown({
          brand: filters.brand,
          start: format(filters.dateRange.from, 'yyyy-MM-dd'),
          end: format(filters.dateRange.to, 'yyyy-MM-dd'),
          group_by: groupBy,
        })

        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch attribution data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, groupBy])

  const getAttributionData = () => {
    if (!data?.breakdown) return []

    const breakdownKey = (() => {
      switch (groupBy) {
        case 'channel':
          return 'by_channel'
        case 'source':
          return 'by_source'
        case 'campaign':
          return 'by_utm_campaign'
        case 'location':
          return 'by_location'
        case 'click_id_type':
          return 'by_click_id'
        default:
          return 'by_channel'
      }
    })()

    const breakdownData = data.breakdown[breakdownKey as keyof typeof data.breakdown]
    if (!breakdownData) return []

    // Convert object to array of items
    return Object.entries(breakdownData).map(([name, leads]) => ({
      name: name || 'Unknown',
      leads: leads as number,
    }))
  }

  const attributionData = getAttributionData()

  const chartData = attributionData.map((item) => ({
    name: item.name.substring(0, 30),
    leads: item.leads,
  }))

  const pieData = attributionData.map((item, index) => ({
    name: item.name.substring(0, 20),
    value: item.leads,
    color: COLORS[index % COLORS.length],
  }))

  const getColumnName = () => {
    switch (groupBy) {
      case 'channel':
        return 'Channel'
      case 'source':
        return 'Source'
      case 'campaign':
        return 'Campaign'
      case 'location':
        return 'Location'
      case 'click_id_type':
        return 'Click ID Type'
      default:
        return 'Name'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attribution Breakdown</h1>
        <p className="text-muted-foreground">
          Analyze lead and appointment attribution by different dimensions
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Group By:</span>
          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="channel">Channel</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="click_id_type">Click ID Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading attribution data...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && attributionData.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No attribution data found for the selected filters
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && attributionData.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leads by {getColumnName()}</CardTitle>
                <CardDescription>
                  Lead volume comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill={COLORS[0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Distribution</CardTitle>
                <CardDescription>
                  Breakdown of total leads by {getColumnName().toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attribution Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getColumnName()}</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributionData.map((item, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.leads)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercent((item.leads / (data?.total_leads || 1)) * 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function AttributionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AttributionContent />
    </Suspense>
  )
}
