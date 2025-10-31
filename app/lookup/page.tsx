'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { lookupCallRail } from '@/lib/api-client'
import { formatDateTime } from '@/lib/utils'
import type { CallRailLookupResponse } from '@/lib/types'
import { Phone, Search, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

export default function LookupPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CallRailLookupResponse | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await lookupCallRail({ phoneNumber: phoneNumber.trim() })
      setResult(response)
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to lookup phone number',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Phone Number Lookup</h1>
        <p className="text-muted-foreground">
          Search for call attribution data from CallRail
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lookup Phone Number</CardTitle>
          <CardDescription>
            Enter a phone number to find associated call data and attribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="678-327-6619 or 6783276619"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter phone number in any format
                </p>
              </div>
            </div>
            <Button type="submit" disabled={loading || !phoneNumber.trim()}>
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.success ? 'border-green-500' : 'border-destructive'}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <CardTitle>
                {result.success ? 'Call Found' : 'No Results'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {result.success && result.data ? (
              <div className="space-y-6">
                {/* Call Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Call Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Call ID</p>
                      <p className="font-mono text-sm">{result.data.call.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="text-sm">
                        {formatDateTime(result.data.call.created_at)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Customer Phone</p>
                      <p className="font-mono text-sm">
                        {formatPhoneNumber(result.data.call.customer_phone_number)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-mono text-sm">
                        {formatPhoneNumber(result.data.call.tracking_phone_number)}
                      </p>
                    </div>
                    {result.data.call.customer_name && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Customer Name</p>
                        <p className="text-sm">{result.data.call.customer_name}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Direction</p>
                      <p className="text-sm capitalize">{result.data.call.direction}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-sm">
                        {result.data.call.answered ? (
                          <span className="text-green-600">Answered</span>
                        ) : (
                          <span className="text-red-600">Not Answered</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-sm">{result.data.call.duration}s</p>
                    </div>
                    {result.data.call.formatted_tracking_source && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm text-muted-foreground">
                          Tracking Source
                        </p>
                        <p className="text-sm">
                          {result.data.call.formatted_tracking_source}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attribution Data */}
                {result.data.attribution && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      Attribution Data
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.data.attribution.utm_source && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">UTM Source</p>
                          <p className="text-sm">{result.data.attribution.utm_source}</p>
                        </div>
                      )}
                      {result.data.attribution.utm_medium && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">UTM Medium</p>
                          <p className="text-sm">{result.data.attribution.utm_medium}</p>
                        </div>
                      )}
                      {result.data.attribution.utm_campaign && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            UTM Campaign
                          </p>
                          <p className="text-sm">
                            {result.data.attribution.utm_campaign}
                          </p>
                        </div>
                      )}
                      {result.data.attribution.utm_content && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">UTM Content</p>
                          <p className="text-sm">{result.data.attribution.utm_content}</p>
                        </div>
                      )}
                      {result.data.attribution.utm_term && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">UTM Term</p>
                          <p className="text-sm">{result.data.attribution.utm_term}</p>
                        </div>
                      )}
                      {result.data.attribution.gclid && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Google Click ID</p>
                          <p className="font-mono text-xs break-all">
                            {result.data.attribution.gclid}
                          </p>
                        </div>
                      )}
                      {result.data.attribution.fbclid && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Facebook Click ID
                          </p>
                          <p className="font-mono text-xs break-all">
                            {result.data.attribution.fbclid}
                          </p>
                        </div>
                      )}
                      {result.data.attribution.msclkid && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Microsoft Click ID
                          </p>
                          <p className="font-mono text-xs break-all">
                            {result.data.attribution.msclkid}
                          </p>
                        </div>
                      )}
                      {result.data.attribution.landing_page_url && (
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-sm text-muted-foreground">Landing Page</p>
                          <a
                            href={result.data.attribution.landing_page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {result.data.attribution.landing_page_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {result.data.attribution.referring_url && (
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-sm text-muted-foreground">Referrer</p>
                          <a
                            href={result.data.attribution.referring_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {result.data.attribution.referring_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {result.error || result.message || 'No call found for this phone number'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
