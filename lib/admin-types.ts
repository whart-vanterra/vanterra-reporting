// ============================================================================
// ADMIN API TYPES
// ============================================================================
// Types for the Admin API endpoints for brand and location management

/**
 * ServiceTitan business unit type
 * - sales: Sales business units (sent to ad partners)
 * - service: Service business units (tracked but not sent to ad partners)
 * - production: Production business units (not tracked as leads)
 */
export type BusinessUnitType = 'sales' | 'service' | 'production'

/**
 * Multiple ServiceTitan business unit IDs per location
 */
export interface ServiceTitanBusinessUnits {
  sales?: string
  service?: string
  production?: string
}

/**
 * Brand Location Configuration (Admin API version)
 */
export interface AdminBrandLocation {
  id?: number
  brand_id?: number

  // Location details
  location_name: string
  city?: string
  state?: string
  market?: string

  // ServiceTitan Integration
  servicetitan_business_unit?: string // @deprecated - use servicetitan_business_units
  servicetitan_business_units?: ServiceTitanBusinessUnits

  // Yelp Integration
  yelp_business_id?: string
  yelp_action?: 'database' | 'email'

  // HomeAdvisor Integration
  homeadvisor_sp_entity_id?: number

  // Google Ads
  google_cid?: string
  google_conversion_action_appointment?: string
  google_conversion_action_sold?: string

  // Facebook
  facebook_pixel_id?: string
  facebook_dataset_id?: string

  // Microsoft Ads
  microsoft_ads_customer_account_id?: string
  microsoft_ads_customer_id?: string
  microsoft_ads_conversion_goal_appointment?: string
  microsoft_ads_conversion_goal_sold?: string

  // Timestamps
  created_at?: string
  updated_at?: string
}

/**
 * Brand Configuration (Admin API version)
 */
export interface AdminBrandConfig {
  id?: number

  // Basic Info
  shortcode: string // e.g., "58", "AW", "SD"
  full_name: string
  primary_domain: string
  alternate_domains?: string[]

  // Locations
  locations?: AdminBrandLocation[]

  // Email
  lead_notification_email?: string

  // Brand-level fallback integration IDs
  google_cid?: string
  google_conversion_action_appointment?: string
  google_conversion_action_sold?: string

  facebook_dataset_id?: string

  microsoft_ads_customer_account_id?: string
  microsoft_ads_customer_id?: string
  microsoft_ads_conversion_goal_appointment?: string
  microsoft_ads_conversion_goal_sold?: string

  homeadvisor_sp_entity_id?: number
  servicetitan_business_unit?: string // @deprecated

  // Timestamps
  created_at?: string
  updated_at?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface AdminApiResponse<T = any> {
  success: boolean
  error?: string
  message?: string
  errors?: string[]
  data?: T
}

export interface AdminBrandsListResponse extends AdminApiResponse {
  brands: AdminBrandConfig[]
}

export interface AdminBrandDetailResponse extends AdminApiResponse {
  brand: AdminBrandConfig
}

export interface AdminLocationsListResponse extends AdminApiResponse {
  locations: AdminBrandLocation[]
}

export interface AdminLocationDetailResponse extends AdminApiResponse {
  location: AdminBrandLocation
}

// ============================================================================
// FORM DATA TYPES (for create/update)
// ============================================================================

export interface CreateBrandInput {
  shortcode: string
  full_name: string
  primary_domain: string
  alternate_domains?: string[]
  lead_notification_email?: string

  // Optional brand-level fallbacks
  google_cid?: string
  google_conversion_action_appointment?: string
  google_conversion_action_sold?: string
  facebook_dataset_id?: string
  microsoft_ads_customer_account_id?: string
  microsoft_ads_customer_id?: string
  microsoft_ads_conversion_goal_appointment?: string
  microsoft_ads_conversion_goal_sold?: string
  homeadvisor_sp_entity_id?: number

  // Optional: Create locations at same time
  locations?: CreateLocationInput[]
}

export interface UpdateBrandInput {
  full_name?: string
  alternate_domains?: string[]
  lead_notification_email?: string
  google_cid?: string
  google_conversion_action_appointment?: string
  google_conversion_action_sold?: string
  facebook_dataset_id?: string
  microsoft_ads_customer_account_id?: string
  microsoft_ads_customer_id?: string
  microsoft_ads_conversion_goal_appointment?: string
  microsoft_ads_conversion_goal_sold?: string
  homeadvisor_sp_entity_id?: number
}

export interface CreateLocationInput {
  location_name: string
  city?: string
  state?: string
  market?: string

  // ServiceTitan (use new format)
  servicetitan_business_units?: ServiceTitanBusinessUnits
  // Or legacy format
  servicetitan_business_unit?: string

  // Integrations
  yelp_business_id?: string
  yelp_action?: 'database' | 'email'
  homeadvisor_sp_entity_id?: number

  // Google Ads
  google_cid?: string
  google_conversion_action_appointment?: string
  google_conversion_action_sold?: string

  // Facebook
  facebook_pixel_id?: string
  facebook_dataset_id?: string

  // Microsoft Ads
  microsoft_ads_customer_account_id?: string
  microsoft_ads_customer_id?: string
  microsoft_ads_conversion_goal_appointment?: string
  microsoft_ads_conversion_goal_sold?: string
}

export interface UpdateLocationInput {
  location_name?: string
  city?: string
  state?: string
  market?: string
  servicetitan_business_units?: ServiceTitanBusinessUnits
  servicetitan_business_unit?: string
  yelp_business_id?: string
  yelp_action?: 'database' | 'email'
  homeadvisor_sp_entity_id?: number
  google_cid?: string
  google_conversion_action_appointment?: string
  google_conversion_action_sold?: string
  facebook_pixel_id?: string
  facebook_dataset_id?: string
  microsoft_ads_customer_account_id?: string
  microsoft_ads_customer_id?: string
  microsoft_ads_conversion_goal_appointment?: string
  microsoft_ads_conversion_goal_sold?: string
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}
