'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { fetchBrands, deleteBrandClient, refreshCacheClient } from '@/lib/client-admin-api'
import type { AdminBrandConfig } from '@/lib/admin-types'
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Building2,
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

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<AdminBrandConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchBrands()
      setBrands(response.brands || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands')
      toast({
        title: 'Error',
        description: 'Failed to load brands',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  const handleDelete = async () => {
    if (!brandToDelete) return

    try {
      setDeleting(true)
      await deleteBrandClient(brandToDelete)
      toast({
        title: 'Success',
        description: 'Brand deleted successfully',
      })
      setDeleteDialogOpen(false)
      setBrandToDelete(null)
      loadBrands()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete brand',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleRefreshCache = async () => {
    try {
      setRefreshing(true)
      await refreshCacheClient()
      toast({
        title: 'Success',
        description: 'Cache refreshed successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to refresh cache',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const openDeleteDialog = (shortcode: string) => {
    setBrandToDelete(shortcode)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Brand Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage brands and their configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshCache}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Cache
          </Button>
          <Link href="/admin/brands/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Brand
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${brands.length} brands configured`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No brands found</p>
              <p className="text-sm mt-2">Create your first brand to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shortcode</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.shortcode}>
                      <TableCell className="font-mono font-medium">
                        {brand.shortcode}
                      </TableCell>
                      <TableCell>{brand.full_name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {brand.primary_domain}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {brand.locations?.length || 0} locations
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/brands/${brand.shortcode}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(brand.shortcode)}
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
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete brand &quot;{brandToDelete}&quot;? This will also
              delete all associated locations. This action cannot be undone.
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
              onClick={handleDelete}
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
