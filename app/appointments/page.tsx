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
import { getAppointments } from '@/lib/api-client'
import { formatDateTime } from '@/lib/utils'
import type { Filters, AppointmentsResponse, Appointment } from '@/lib/types'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

function AppointmentsContent() {
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<Filters>(() => {
    return urlParamsToFilters(searchParams, '58')
  })

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [data, setData] = useState<AppointmentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.dateRange.from || !filters.dateRange.to) return

      setLoading(true)
      setError(null)

      try {
        const response = await getAppointments({
          brand: filters.brand,
          start: format(filters.dateRange.from, 'yyyy-MM-dd'),
          end: format(filters.dateRange.to, 'yyyy-MM-dd'),
          limit: pageSize,
          offset: currentPage * pageSize,
        })

        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, currentPage, pageSize])

  const appointments = data?.appointments || []
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
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">
          ServiceTitan appointments scheduled
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="flex items-center gap-4">
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
              ? `${pagination.total.toLocaleString()} Total Appointments`
              : 'Appointments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading appointments...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Error: {error}</p>
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job #</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead>Job Status</TableHead>
                    <TableHead>Location ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt: Appointment) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-mono text-sm">
                        {appt.job_number}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(appt.created_on)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {appt.customer_name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {appt.phone && (
                            <div className="text-sm">{appt.phone}</div>
                          )}
                          {appt.email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {appt.email}
                            </div>
                          )}
                          {!appt.phone && !appt.email && '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {appt.address && (
                            <div className="text-sm">{appt.address}</div>
                          )}
                          {(appt.city || appt.state || appt.zip) && (
                            <div className="text-xs text-muted-foreground">
                              {[appt.city, appt.state, appt.zip]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                          {!appt.address && !appt.city && '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {appt.business_unit_id || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {appt.job_status || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {appt.location_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to{' '}
                  {Math.min((currentPage + 1) * pageSize, pagination?.total || 0)} of{' '}
                  {pagination?.total.toLocaleString()} appointments
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

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  )
}
