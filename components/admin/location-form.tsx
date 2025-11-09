'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createLocationClient, updateLocationClient } from '@/lib/client-admin-api'
import type { AdminBrandLocation, CreateLocationInput, UpdateLocationInput } from '@/lib/admin-types'
import { Loader2 } from 'lucide-react'

interface LocationFormProps {
  brandShortcode: string
  location?: AdminBrandLocation
  mode: 'create' | 'edit'
}

export function LocationForm({ brandShortcode, location, mode }: LocationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    location_name: location?.location_name || '',
    city: location?.city || '',
    state: location?.state || '',
    market: location?.market || '',

    // ServiceTitan - new format
    servicetitan_sales: location?.servicetitan_business_units?.sales || '',
    servicetitan_service: location?.servicetitan_business_units?.service || '',
    servicetitan_production: location?.servicetitan_business_units?.production || '',

    // Yelp
    yelp_business_id: location?.yelp_business_id || '',
    yelp_action: location?.yelp_action || 'database',

    // HomeAdvisor
    homeadvisor_sp_entity_id: location?.homeadvisor_sp_entity_id?.toString() || '',

    // Google Ads
    google_cid: location?.google_cid || '',
    google_conversion_action_appointment: location?.google_conversion_action_appointment || '',
    google_conversion_action_sold: location?.google_conversion_action_sold || '',

    // Facebook
    facebook_pixel_id: location?.facebook_pixel_id || '',
    facebook_dataset_id: location?.facebook_dataset_id || '',

    // Microsoft Ads
    microsoft_ads_customer_account_id: location?.microsoft_ads_customer_account_id || '',
    microsoft_ads_customer_id: location?.microsoft_ads_customer_id || '',
    microsoft_ads_conversion_goal_appointment: location?.microsoft_ads_conversion_goal_appointment || '',
    microsoft_ads_conversion_goal_sold: location?.microsoft_ads_conversion_goal_sold || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.location_name) {
      toast({
        title: 'Validation Error',
        description: 'Location name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const businessUnits: any = {}
      if (formData.servicetitan_sales) businessUnits.sales = formData.servicetitan_sales
      if (formData.servicetitan_service) businessUnits.service = formData.servicetitan_service
      if (formData.servicetitan_production) businessUnits.production = formData.servicetitan_production

      if (mode === 'create') {
        const input: CreateLocationInput = {
          location_name: formData.location_name,
          city: formData.city || undefined,
          state: formData.state || undefined,
          market: formData.market || undefined,
          servicetitan_business_units: Object.keys(businessUnits).length > 0 ? businessUnits : undefined,
          yelp_business_id: formData.yelp_business_id || undefined,
          yelp_action: formData.yelp_action as 'database' | 'email',
          homeadvisor_sp_entity_id: formData.homeadvisor_sp_entity_id ? parseInt(formData.homeadvisor_sp_entity_id, 10) : undefined,
          google_cid: formData.google_cid || undefined,
          google_conversion_action_appointment: formData.google_conversion_action_appointment || undefined,
          google_conversion_action_sold: formData.google_conversion_action_sold || undefined,
          facebook_pixel_id: formData.facebook_pixel_id || undefined,
          facebook_dataset_id: formData.facebook_dataset_id || undefined,
          microsoft_ads_customer_account_id: formData.microsoft_ads_customer_account_id || undefined,
          microsoft_ads_customer_id: formData.microsoft_ads_customer_id || undefined,
          microsoft_ads_conversion_goal_appointment: formData.microsoft_ads_conversion_goal_appointment || undefined,
          microsoft_ads_conversion_goal_sold: formData.microsoft_ads_conversion_goal_sold || undefined,
        }

        await createLocationClient(brandShortcode, input)
        toast({
          title: 'Success',
          description: 'Location created successfully',
        })
        router.push(`/admin/brands/${brandShortcode}`)
      } else {
        const input: UpdateLocationInput = {
          location_name: formData.location_name,
          city: formData.city || undefined,
          state: formData.state || undefined,
          market: formData.market || undefined,
          servicetitan_business_units: Object.keys(businessUnits).length > 0 ? businessUnits : undefined,
          yelp_business_id: formData.yelp_business_id || undefined,
          yelp_action: formData.yelp_action as 'database' | 'email',
          homeadvisor_sp_entity_id: formData.homeadvisor_sp_entity_id ? parseInt(formData.homeadvisor_sp_entity_id, 10) : undefined,
          google_cid: formData.google_cid || undefined,
          google_conversion_action_appointment: formData.google_conversion_action_appointment || undefined,
          google_conversion_action_sold: formData.google_conversion_action_sold || undefined,
          facebook_pixel_id: formData.facebook_pixel_id || undefined,
          facebook_dataset_id: formData.facebook_dataset_id || undefined,
          microsoft_ads_customer_account_id: formData.microsoft_ads_customer_account_id || undefined,
          microsoft_ads_customer_id: formData.microsoft_ads_customer_id || undefined,
          microsoft_ads_conversion_goal_appointment: formData.microsoft_ads_conversion_goal_appointment || undefined,
          microsoft_ads_conversion_goal_sold: formData.microsoft_ads_conversion_goal_sold || undefined,
        }

        await updateLocationClient(brandShortcode, location!.id!, input)
        toast({
          title: 'Success',
          description: 'Location updated successfully',
        })
        router.push(`/admin/brands/${brandShortcode}`)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : `Failed to ${mode} location`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
          <CardDescription>Basic location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_name">
              Location Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="Knoxville"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Knoxville"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="TN"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Input
                id="market"
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                placeholder="Knoxville Metro"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ServiceTitan Integration</CardTitle>
          <CardDescription>
            Business unit IDs - Sales units are sent to ad partners, Service units are tracked only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="servicetitan_sales">Sales Business Unit</Label>
              <Input
                id="servicetitan_sales"
                value={formData.servicetitan_sales}
                onChange={(e) => setFormData({ ...formData, servicetitan_sales: e.target.value })}
                placeholder="493727115"
              />
              <p className="text-xs text-muted-foreground">Sent to ad partners</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicetitan_service">Service Business Unit</Label>
              <Input
                id="servicetitan_service"
                value={formData.servicetitan_service}
                onChange={(e) => setFormData({ ...formData, servicetitan_service: e.target.value })}
                placeholder="493727200"
              />
              <p className="text-xs text-muted-foreground">Tracked only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicetitan_production">Production Business Unit</Label>
              <Input
                id="servicetitan_production"
                value={formData.servicetitan_production}
                onChange={(e) => setFormData({ ...formData, servicetitan_production: e.target.value })}
                placeholder="493727300"
              />
              <p className="text-xs text-muted-foreground">Not tracked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Ads Integration</CardTitle>
          <CardDescription>Location-specific Google Ads configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="google_cid">Google CID</Label>
              <Input
                id="google_cid"
                value={formData.google_cid}
                onChange={(e) => setFormData({ ...formData, google_cid: e.target.value })}
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_conversion_action_appointment">
                Conversion - Appointment
              </Label>
              <Input
                id="google_conversion_action_appointment"
                value={formData.google_conversion_action_appointment}
                onChange={(e) => setFormData({ ...formData, google_conversion_action_appointment: e.target.value })}
                placeholder="6851800994"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_conversion_action_sold">Conversion - Sold</Label>
              <Input
                id="google_conversion_action_sold"
                value={formData.google_conversion_action_sold}
                onChange={(e) => setFormData({ ...formData, google_conversion_action_sold: e.target.value })}
                placeholder="6851801720"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facebook Integration</CardTitle>
          <CardDescription>Location-specific Facebook configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook_dataset_id">Facebook Dataset ID</Label>
              <Input
                id="facebook_dataset_id"
                value={formData.facebook_dataset_id}
                onChange={(e) => setFormData({ ...formData, facebook_dataset_id: e.target.value })}
                placeholder="1204053587152921"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
              <Input
                id="facebook_pixel_id"
                value={formData.facebook_pixel_id}
                onChange={(e) => setFormData({ ...formData, facebook_pixel_id: e.target.value })}
                placeholder="123456789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Microsoft Ads Integration</CardTitle>
          <CardDescription>Location-specific Microsoft Ads configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="microsoft_ads_customer_account_id">
                Customer Account ID
              </Label>
              <Input
                id="microsoft_ads_customer_account_id"
                value={formData.microsoft_ads_customer_account_id}
                onChange={(e) => setFormData({ ...formData, microsoft_ads_customer_account_id: e.target.value })}
                placeholder="123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microsoft_ads_customer_id">Customer ID</Label>
              <Input
                id="microsoft_ads_customer_id"
                value={formData.microsoft_ads_customer_id}
                onChange={(e) => setFormData({ ...formData, microsoft_ads_customer_id: e.target.value })}
                placeholder="789012"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microsoft_ads_conversion_goal_appointment">
                Conversion Goal - Appointment
              </Label>
              <Input
                id="microsoft_ads_conversion_goal_appointment"
                value={formData.microsoft_ads_conversion_goal_appointment}
                onChange={(e) => setFormData({ ...formData, microsoft_ads_conversion_goal_appointment: e.target.value })}
                placeholder="12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microsoft_ads_conversion_goal_sold">
                Conversion Goal - Sold
              </Label>
              <Input
                id="microsoft_ads_conversion_goal_sold"
                value={formData.microsoft_ads_conversion_goal_sold}
                onChange={(e) => setFormData({ ...formData, microsoft_ads_conversion_goal_sold: e.target.value })}
                placeholder="67890"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yelp Integration</CardTitle>
          <CardDescription>Yelp lead tracking configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yelp_business_id">Yelp Business ID</Label>
              <Input
                id="yelp_business_id"
                value={formData.yelp_business_id}
                onChange={(e) => setFormData({ ...formData, yelp_business_id: e.target.value })}
                placeholder="MehTgAYEu8YXXNgwuaOrrw"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yelp_action">Yelp Action</Label>
              <Select
                value={formData.yelp_action}
                onValueChange={(value: string) => setFormData({ ...formData, yelp_action: value as 'database' | 'email' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HomeAdvisor Integration</CardTitle>
          <CardDescription>HomeAdvisor lead tracking configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="homeadvisor_sp_entity_id">SP Entity ID</Label>
            <Input
              id="homeadvisor_sp_entity_id"
              type="number"
              value={formData.homeadvisor_sp_entity_id}
              onChange={(e) => setFormData({ ...formData, homeadvisor_sp_entity_id: e.target.value })}
              placeholder="113565356"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Location' : 'Update Location'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
