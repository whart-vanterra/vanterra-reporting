'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createBrandClient, updateBrandClient } from '@/lib/client-admin-api'
import type { AdminBrandConfig, CreateBrandInput, UpdateBrandInput } from '@/lib/admin-types'
import { Loader2 } from 'lucide-react'

interface BrandFormProps {
  brand?: AdminBrandConfig
  mode: 'create' | 'edit'
}

export function BrandForm({ brand, mode }: BrandFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shortcode: brand?.shortcode || '',
    full_name: brand?.full_name || '',
    primary_domain: brand?.primary_domain || '',
    alternate_domains: brand?.alternate_domains?.join('\n') || '',
    lead_notification_email: brand?.lead_notification_email || '',
    google_cid: brand?.google_cid || '',
    google_conversion_action_appointment: brand?.google_conversion_action_appointment || '',
    google_conversion_action_sold: brand?.google_conversion_action_sold || '',
    facebook_dataset_id: brand?.facebook_dataset_id || '',
    microsoft_ads_customer_account_id: brand?.microsoft_ads_customer_account_id || '',
    microsoft_ads_customer_id: brand?.microsoft_ads_customer_id || '',
    microsoft_ads_conversion_goal_appointment: brand?.microsoft_ads_conversion_goal_appointment || '',
    microsoft_ads_conversion_goal_sold: brand?.microsoft_ads_conversion_goal_sold || '',
    homeadvisor_sp_entity_id: brand?.homeadvisor_sp_entity_id?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.shortcode || !formData.full_name || !formData.primary_domain) {
      toast({
        title: 'Validation Error',
        description: 'Shortcode, Full Name, and Primary Domain are required',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const alternateDomains = formData.alternate_domains
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)

      if (mode === 'create') {
        const input: CreateBrandInput = {
          shortcode: formData.shortcode,
          full_name: formData.full_name,
          primary_domain: formData.primary_domain,
          alternate_domains: alternateDomains.length > 0 ? alternateDomains : undefined,
          lead_notification_email: formData.lead_notification_email || undefined,
          google_cid: formData.google_cid || undefined,
          google_conversion_action_appointment: formData.google_conversion_action_appointment || undefined,
          google_conversion_action_sold: formData.google_conversion_action_sold || undefined,
          facebook_dataset_id: formData.facebook_dataset_id || undefined,
          microsoft_ads_customer_account_id: formData.microsoft_ads_customer_account_id || undefined,
          microsoft_ads_customer_id: formData.microsoft_ads_customer_id || undefined,
          microsoft_ads_conversion_goal_appointment: formData.microsoft_ads_conversion_goal_appointment || undefined,
          microsoft_ads_conversion_goal_sold: formData.microsoft_ads_conversion_goal_sold || undefined,
          homeadvisor_sp_entity_id: formData.homeadvisor_sp_entity_id ? parseInt(formData.homeadvisor_sp_entity_id, 10) : undefined,
        }

        await createBrandClient(input)
        toast({
          title: 'Success',
          description: 'Brand created successfully',
        })
        router.push(`/admin/brands/${formData.shortcode}`)
      } else {
        const input: UpdateBrandInput = {
          full_name: formData.full_name,
          alternate_domains: alternateDomains.length > 0 ? alternateDomains : undefined,
          lead_notification_email: formData.lead_notification_email || undefined,
          google_cid: formData.google_cid || undefined,
          google_conversion_action_appointment: formData.google_conversion_action_appointment || undefined,
          google_conversion_action_sold: formData.google_conversion_action_sold || undefined,
          facebook_dataset_id: formData.facebook_dataset_id || undefined,
          microsoft_ads_customer_account_id: formData.microsoft_ads_customer_account_id || undefined,
          microsoft_ads_customer_id: formData.microsoft_ads_customer_id || undefined,
          microsoft_ads_conversion_goal_appointment: formData.microsoft_ads_conversion_goal_appointment || undefined,
          microsoft_ads_conversion_goal_sold: formData.microsoft_ads_conversion_goal_sold || undefined,
          homeadvisor_sp_entity_id: formData.homeadvisor_sp_entity_id ? parseInt(formData.homeadvisor_sp_entity_id, 10) : undefined,
        }

        await updateBrandClient(brand!.shortcode, input)
        toast({
          title: 'Success',
          description: 'Brand updated successfully',
        })
        router.push(`/admin/brands/${brand!.shortcode}`)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : `Failed to ${mode} brand`,
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core brand details and identifiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shortcode">
                Shortcode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shortcode"
                value={formData.shortcode}
                onChange={(e) => setFormData({ ...formData, shortcode: e.target.value.toUpperCase() })}
                placeholder="58"
                maxLength={10}
                disabled={mode === 'edit'}
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (cannot be changed after creation)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="58 Foundations & Waterproofing"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_domain">
              Primary Domain <span className="text-destructive">*</span>
            </Label>
            <Input
              id="primary_domain"
              value={formData.primary_domain}
              onChange={(e) => setFormData({ ...formData, primary_domain: e.target.value })}
              placeholder="58foundations.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternate_domains">Alternate Domains</Label>
            <Textarea
              id="alternate_domains"
              value={formData.alternate_domains}
              onChange={(e) => setFormData({ ...formData, alternate_domains: e.target.value })}
              placeholder="www.58foundations.com&#10;58foundation.com"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">One domain per line</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_notification_email">Lead Notification Email</Label>
            <Input
              id="lead_notification_email"
              type="email"
              value={formData.lead_notification_email}
              onChange={(e) => setFormData({ ...formData, lead_notification_email: e.target.value })}
              placeholder="leads@example.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Ads Integration</CardTitle>
          <CardDescription>Brand-level Google Ads configuration (optional)</CardDescription>
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
          <CardDescription>Brand-level Facebook configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="facebook_dataset_id">Facebook Dataset ID</Label>
            <Input
              id="facebook_dataset_id"
              value={formData.facebook_dataset_id}
              onChange={(e) => setFormData({ ...formData, facebook_dataset_id: e.target.value })}
              placeholder="1204053587152921"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Microsoft Ads Integration</CardTitle>
          <CardDescription>Brand-level Microsoft Ads configuration (optional)</CardDescription>
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
          <CardTitle>HomeAdvisor Integration</CardTitle>
          <CardDescription>Brand-level HomeAdvisor configuration (optional)</CardDescription>
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
          {mode === 'create' ? 'Create Brand' : 'Update Brand'}
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
