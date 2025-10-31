'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, subDays } from 'date-fns'
import { FilterBar } from '@/components/filter-bar'
import { urlParamsToFilters } from '@/lib/url-params'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getLeads } from '@/lib/api-client'
import { formatDateTime } from '@/lib/utils'
import type { Filters, LeadsResponse, Lead } from '@/lib/types'
import { ChevronLeft, ChevronRight, Phone, FileText, ExternalLink } from 'lucide-react'

function LeadsContent() {
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<Filters>(() => {
    return urlParamsToFilters(searchParams, '58')
  })

  const [leadType, setLeadType] = useState<'all' | 'call' | 'form'>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.dateRange.from || !filters.dateRange.to) return

      setLoading(true)
      setError(null)

      try {
        const response = await getLeads({
          brand: filters.brand,
          start: format(filters.dateRange.from, 'yyyy-MM-dd'),
          end: format(filters.dateRange.to, 'yyyy-MM-dd'),
          type: leadType === 'all' ? undefined : leadType,
          limit: pageSize,
          offset: currentPage * pageSize,
        })

        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, leadType, currentPage, pageSize])

  const leads = data?.leads || []
  const pagination = data?.pagination
  const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 0

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.has_more) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">
          All marketing leads from calls and forms
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Lead Type:</span>
          <Select
            value={leadType}
            onValueChange={(value) => {
              setLeadType(value as typeof leadType)
              setCurrentPage(0)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="call">Calls Only</SelectItem>
              <SelectItem value="form">Forms Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Per Page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(0)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {pagination
              ? `${pagination.total.toLocaleString()} Total Leads`
              : 'Leads'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading leads...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Error: {error}</p>
            </div>
          )}

          {!loading && !error && leads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          )}

          {!loading && !error && leads.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Click ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: Lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {lead.type === 'call' ? (
                            <Phone className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-green-500" />
                          )}
                          <span className="capitalize">{lead.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(lead.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.name && (
                            <div className="font-medium">{lead.name}</div>
                          )}
                          {lead.phone && (
                            <div className="text-sm text-muted-foreground">
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.utm_source && (
                            <div className="text-sm">{lead.utm_source}</div>
                          )}
                          {lead.utm_medium && (
                            <div className="text-xs text-muted-foreground">
                              {lead.utm_medium}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.utm_campaign || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.location || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {lead.gclid && (
                            <div className="text-blue-600">GCLID</div>
                          )}
                          {lead.fbclid && (
                            <div className="text-blue-700">FBCLID</div>
                          )}
                          {lead.msclkid && (
                            <div className="text-orange-600">MSCLKID</div>
                          )}
                          {!lead.gclid && !lead.fbclid && !lead.msclkid && '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to{' '}
                  {Math.min((currentPage + 1) * pageSize, pagination?.total || 0)} of{' '}
                  {pagination?.total.toLocaleString()} leads
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!pagination?.has_more}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LeadsContent />
    </Suspense>
  )
}
