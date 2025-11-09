'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { fetchBrand, deleteLocationClient } from '@/lib/client-admin-api'
import type { AdminBrandConfig, AdminBrandLocation } from '@/lib/admin-types'
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  MapPin,
  Building2,
  Mail,
  Globe,
  AlertCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ shortcode: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [brand, setBrand] = useState<AdminBrandConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadBrand = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchBrand(resolvedParams.shortcode)
      setBrand(response.brand)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand')
      toast({
        title: 'Error',
        description: 'Failed to load brand',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.shortcode, toast])

  useEffect(() => {
    loadBrand()
  }, [loadBrand])

  const handleDeleteLocation = async () => {
    if (!locationToDelete || !brand) return

    try {
      setDeleting(true)
      await deleteLocationClient(brand.shortcode, locationToDelete)
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      })
      setDeleteDialogOpen(false)
      setLocationToDelete(null)
      loadBrand()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete location',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (locationId: number) => {
    setLocationToDelete(locationId)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !brand) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Brand not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin/brands">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brands
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {brand.full_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Shortcode: <code className="font-mono">{brand.shortcode}</code>
            </p>
          </div>
          <Link href={`/admin/brands/${brand.shortcode}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Brand
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domain Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Domain</p>
              <p className="font-mono text-sm">{brand.primary_domain}</p>
            </div>
            {brand.alternate_domains && brand.alternate_domains.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alternate Domains</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brand.alternate_domains.map((domain) => (
                    <Badge key={domain} variant="outline" className="font-mono text-xs">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lead Notification Email</p>
              <p className="text-sm">
                {brand.lead_notification_email || (
                  <span className="text-muted-foreground italic">Not configured</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locations
              </CardTitle>
              <CardDescription>
                {brand.locations?.length || 0} locations configured
              </CardDescription>
            </div>
            <Link href={`/admin/brands/${brand.shortcode}/locations/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!brand.locations || brand.locations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No locations configured</p>
              <p className="text-sm mt-2">Add a location to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Name</TableHead>
                    <TableHead>City, State</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Business Units</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brand.locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        {location.location_name}
                      </TableCell>
                      <TableCell>
                        {location.city && location.state
                          ? `${location.city}, ${location.state}`
                          : location.city || location.state || (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                      </TableCell>
                      <TableCell>
                        {location.market || (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {location.servicetitan_business_units ? (
                          <div className="flex flex-wrap gap-1">
                            {location.servicetitan_business_units.sales && (
                              <Badge variant="default" className="text-xs">
                                Sales: {location.servicetitan_business_units.sales}
                              </Badge>
                            )}
                            {location.servicetitan_business_units.service && (
                              <Badge variant="secondary" className="text-xs">
                                Service: {location.servicetitan_business_units.service}
                              </Badge>
                            )}
                            {location.servicetitan_business_units.production && (
                              <Badge variant="outline" className="text-xs">
                                Prod: {location.servicetitan_business_units.production}
                              </Badge>
                            )}
                          </div>
                        ) : location.servicetitan_business_unit ? (
                          <Badge variant="outline" className="text-xs font-mono">
                            {location.servicetitan_business_unit}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/brands/${brand.shortcode}/locations/${location.id}`}
                          >
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => location.id && openDeleteDialog(location.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLocation}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
