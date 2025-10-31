'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/filter-bar'
import { getMetricsSummary } from '@/lib/api-client'
import { urlParamsToFilters } from '@/lib/url-params'
import type { Filters, MetricsSummaryResponse, ChannelStats } from '@/lib/types'
import { Phone, FileText, Calendar, TrendingUp, Users, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(() => urlParamsToFilters(searchParams, '58'))
  const [data, setData] = useState<MetricsSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'leads' | 'conversions' | 'rate'>('leads')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const newFilters = urlParamsToFilters(searchParams, '58')
    setFilters(newFilters)
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.dateRange.from || !filters.dateRange.to) return

      setLoading(true)
      try {
        const response = await getMetricsSummary({
          brand: filters.brand,
          start: format(filters.dateRange.from, 'yyyy-MM-dd'),
          end: format(filters.dateRange.to, 'yyyy-MM-dd'),
          include_trend: false,
        })
        setData(response)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  if (loading) {
    return (
      <div className="space-y-6">
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    )
  }

  const { summary, breakdown } = data

  // Prepare channel data for sorting and display
  const channelData = Object.entries(breakdown.by_channel).map(([name, stats]) => ({
    name,
    leads: stats.total,
    conversions: stats.with_appointment,
    rate: parseFloat(stats.conversion_rate),
    rateDisplay: stats.conversion_rate,
  }))

  // Sort channel data
  const sortedChannelData = [...channelData].sort((a, b) => {
    let comparison = 0
    if (sortBy === 'leads') comparison = a.leads - b.leads
    else if (sortBy === 'conversions') comparison = a.conversions - b.conversions
    else if (sortBy === 'rate') comparison = a.rate - b.rate
    return sortOrder === 'desc' ? -comparison : comparison
  })

  // Prepare major category data for chart
  const categoryChartData = Object.entries(breakdown.leads_by_major_category).map(([name, count]) => ({
    name,
    value: count,
  }))

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ef4444', '#84cc16', '#f97316']

  // Form category data
  const formCategories = [
    { name: 'Website Forms', ...summary.form_leads_by_category.website_forms },
    { name: 'Affiliate Forms', ...summary.form_leads_by_category.affiliate_forms },
    { name: 'Meta Leads', ...summary.form_leads_by_category.meta_leads },
  ]

  const handleSort = (column: 'leads' | 'conversions' | 'rate') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ column }: { column: 'leads' | 'conversions' | 'rate' }) => {
    if (sortBy !== column) return null
    return sortOrder === 'desc' ? <ArrowDown className="h-4 w-4 inline ml-1" /> : <ArrowUp className="h-4 w-4 inline ml-1" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Marketing performance overview
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_leads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.call_leads.toLocaleString()} calls · {summary.form_leads.toLocaleString()} forms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.leads_with_appointments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.total_appointments_created_in_range.toLocaleString()} created in range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.conversion_rates.overall}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Calls: {summary.conversion_rates.calls_only} · Forms: {summary.conversion_rates.forms_only}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Appt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avg_days_to_appointment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              First time: {summary.conversion_rates.first_time_calls_only}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Type Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Leads Breakdown</CardTitle>
            <CardDescription>{summary.call_leads.toLocaleString()} total calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">First Time Calls</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{summary.first_time_calls.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {summary.first_time_calls_with_appointments} appts ({summary.conversion_rates.first_time_calls_only})
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Repeat Calls</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{summary.repeat_calls.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {summary.call_leads_with_appointments - summary.first_time_calls_with_appointments} appts
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Leads Breakdown</CardTitle>
            <CardDescription>{summary.form_leads.toLocaleString()} total forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formCategories.map((category, idx) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${idx === 0 ? 'text-green-500' : idx === 1 ? 'text-orange-500' : 'text-pink-500'}`} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{category.total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.with_appointment} appts ({category.conversion_rate})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Major Category</CardTitle>
            <CardDescription>Distribution across marketing channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Channels by Leads</CardTitle>
            <CardDescription>Top 10 performing channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedChannelData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="leads" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Detailed breakdown of all marketing channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Channel</th>
                  <th className="text-right p-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort('leads')}>
                    Leads <SortIcon column="leads" />
                  </th>
                  <th className="text-right p-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort('conversions')}>
                    Appointments <SortIcon column="conversions" />
                  </th>
                  <th className="text-right p-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort('rate')}>
                    Conversion Rate <SortIcon column="rate" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedChannelData.map((channel) => (
                  <tr key={channel.name} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{channel.name}</td>
                    <td className="p-4 text-right">{channel.leads.toLocaleString()}</td>
                    <td className="p-4 text-right">{channel.conversions.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${channel.rate >= 30 ? 'text-green-600' : channel.rate >= 20 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                        {channel.rateDisplay}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Matching Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Matching Details</CardTitle>
          <CardDescription>How leads were matched to appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">ServiceTitan ID Matches</div>
              <div className="text-2xl font-bold">{summary.st_customer_id_matches.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone Number Matches</div>
              <div className="text-2xl font-bold">{summary.phone_matches.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email Matches</div>
              <div className="text-2xl font-bold">{summary.email_matches.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
