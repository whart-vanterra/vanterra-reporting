// API Response Types based on backend endpoints

export interface FormCategoryStats {
  total: number
  with_appointment: number
  conversion_rate: string
}

export interface ChannelStats {
  total: number
  with_appointment: number
  conversion_rate: string
}

export interface MetricsSummaryResponse {
  success: boolean
  brand: string
  date_range: {
    start: string
    end: string
    lookforward_days: number
  }
  summary: {
    total_leads: number
    call_leads: number
    first_time_calls: number
    repeat_calls: number
    form_leads: number
    form_leads_by_category: {
      affiliate_forms: FormCategoryStats
      meta_leads: FormCategoryStats
      website_forms: FormCategoryStats
    }
    total_appointments_created_in_range: number
    matched_appointments_in_range: number
    unmatched_appointments: number
    total_appointments_matched_to_leads: number
    leads_with_appointments: number
    call_leads_with_appointments: number
    form_leads_with_appointments: number
    first_time_calls_with_appointments: number
    st_customer_id_matches: number
    phone_matches: number
    email_matches: number
    conversion_rates: {
      overall: string
      first_time_calls_and_forms: string
      calls_only: string
      forms_only: string
      first_time_calls_only: string
    }
    avg_days_to_appointment: string
  }
  breakdown: {
    leads_by_standard_channel: Record<string, number>
    leads_by_major_category: Record<string, number>
    by_channel: Record<string, ChannelStats>
  }
  trend: any | null
}

export interface AttributionBreakdownResponse {
  success: boolean
  brand: string
  date_range: {
    start: string
    end: string
  }
  total_leads: number
  breakdown: {
    by_channel?: Record<string, number>
    by_click_id?: Record<string, number>
    by_source?: Record<string, number>
    by_utm_source?: Record<string, number>
    by_utm_medium?: Record<string, number>
    by_utm_campaign?: Record<string, number>
    by_source_name?: Record<string, number>
    by_location?: Record<string, number>
    by_zip_code?: Record<string, number>
  }
}

export interface AttributionItem {
  name: string
  leads: number
}

export interface LeadsResponse {
  success: boolean
  brand: string
  date_range: {
    start: string
    end: string
  }
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  leads: Lead[]
}

export interface Lead {
  id: string
  type: 'call' | 'form'
  brand: string
  timestamp: string
  name?: string
  phone?: string
  email?: string
  first_call?: boolean
  gclid?: string
  fbclid?: string
  gbraid?: string
  wbraid?: string
  msclkid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  source?: string
  source_name?: string
  location?: string
  zip_code?: string
}

export interface AppointmentsResponse {
  success: boolean
  brand: string
  date_range: {
    start: string
    end: string
  }
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  appointments: Appointment[]
}

export interface Appointment {
  id: number
  job_number: string
  customer_id?: string
  customer_name?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  job_status?: string
  created_on: string
  location_id?: string
  business_unit_id?: string
}

export interface LeadWithAppointment {
  lead: Lead
  appointment?: Appointment
  matched: boolean
  match_score?: number
}

export interface LeadsWithAppointmentsResponse {
  success: boolean
  data: {
    matches: LeadWithAppointment[]
    summary: {
      total_leads: number
      total_appointments: number
      matched_leads: number
      unmatched_leads: number
      conversion_rate: number
    }
  }
}

export interface CallRailLookupRequest {
  phoneNumber: string
}

export interface CallRailLookupResponse {
  success: boolean
  data?: {
    call: {
      id: string
      direction: string
      answered: boolean
      duration: number
      customer_phone_number: string
      customer_name?: string
      tracking_phone_number: string
      created_at: string
      formatted_tracking_source?: string
    }
    attribution?: {
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      utm_content?: string
      utm_term?: string
      gclid?: string
      fbclid?: string
      msclkid?: string
      landing_page_url?: string
      referring_url?: string
    }
  }
  error?: string
  message?: string
}

// Brand Configuration API Types
export interface BrandLocation {
  location_name: string
  city: string
  state: string
  market: string
  yelp_business_id?: string
  servicetitan_business_unit?: string
  homeadvisor_sp_entity_id?: number
}

export interface BrandConfig {
  shortcode: string
  full_name: string
  primary_domain: string
  alternate_domains?: string[]
  locations: BrandLocation[]
  // Internal fields (only returned with authentication)
  facebook_dataset_id?: string
  google_cid?: string
  google_conversion_action_sold?: string
  google_conversion_action_appointment?: string
  lead_notification_email?: string
}

export interface BrandsResponse {
  access: 'public' | 'internal'
  brands: BrandConfig[]
}

export interface BrandResponse {
  access: 'public' | 'internal'
  brand: BrandConfig
  matched_domain?: string
}

// UI Component Types
export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface Filters {
  brand: string
  dateRange: DateRange
  lookforwardDays?: number
}
