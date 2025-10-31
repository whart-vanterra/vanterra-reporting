# Brand API Integration

The dashboard now dynamically fetches brands from the `/brands` API endpoint instead of using hardcoded values.

## Overview

The brand selector component automatically loads all available brands from your brand configuration API and displays them in the dropdown. This ensures the dashboard always shows current brands without requiring code updates.

## Features

✅ **Dynamic Brand Loading** - Fetches brands from API on mount
✅ **Client-Side Caching** - Brands cached for 1 hour (matches API cache TTL)
✅ **Loading States** - Shows spinner while fetching brands
✅ **Error Handling** - Displays error message if brands fail to load
✅ **Full Names** - Displays brand full names (not just shortcodes)
✅ **No Hardcoding** - All brands managed centrally via API

## How It Works

### 1. API Client Functions

**File**: `lib/api-client.ts`

Three new functions added:

```typescript
// Get all brands (with caching)
export async function getBrands(useCache: boolean = true): Promise<BrandsResponse>

// Get specific brand by shortcode
export async function getBrand(shortcode: string): Promise<BrandResponse>

// Get brand by domain
export async function getBrandByDomain(domain: string): Promise<BrandResponse>
```

**Caching Strategy:**
- Brands cached in memory for 1 hour (3600 seconds)
- Matches API cache headers (`Cache-Control: max-age=3600`)
- Cache automatically refreshes after expiration
- Can bypass cache with `getBrands(false)`

### 2. TypeScript Types

**File**: `lib/types.ts`

New types added:

```typescript
interface BrandConfig {
  shortcode: string              // "58", "AW", etc.
  full_name: string             // "58 Foundations & Waterproofing"
  primary_domain: string        // "58foundations.com"
  alternate_domains?: string[]  // Alternative domains
  locations: BrandLocation[]    // Array of locations
  // Internal fields (if authenticated)
  facebook_dataset_id?: string
  google_cid?: string
  // ... other tracking IDs
}

interface BrandsResponse {
  access: 'public' | 'internal'
  brands: BrandConfig[]
}
```

### 3. Brand Selector Component

**File**: `components/brand-selector.tsx`

**Before** (Hardcoded):
```typescript
const BRANDS = [
  { value: '58', label: 'Valu Home Centers' },
  { value: '64', label: 'The Patch Boys' },
  { value: '65', label: 'Budget Blinds' },
]
```

**After** (Dynamic):
```typescript
const [brands, setBrands] = useState<BrandConfig[]>([])

useEffect(() => {
  const response = await getBrands()
  setBrands(response.brands)
}, [])
```

**UI States:**

1. **Loading State**:
   ```
   [Loading brands... ⟳]
   ```

2. **Loaded State**:
   ```
   [58 Foundations & Waterproofing ▼]
   [Advantage Waterproofing ▼]
   [SharkShield Solutions ▼]
   ...
   ```

3. **Error State**:
   ```
   ⚠️ Failed to load brands
   ```

### 4. Filter Type Update

**Before**:
```typescript
type Brand = '58' | '64' | '65'  // Limited to 3 brands

interface Filters {
  brand: Brand
  // ...
}
```

**After**:
```typescript
interface Filters {
  brand: string  // Any brand shortcode
  // ...
}
```

This allows the dashboard to work with any number of brands dynamically.

## API Endpoints Used

### GET /brands

Returns all brands with public access level (safe for frontend).

**Request**:
```bash
curl https://api.vanterrafoundations.com/brands
```

**Response**:
```json
{
  "access": "public",
  "brands": [
    {
      "shortcode": "58",
      "full_name": "58 Foundations & Waterproofing",
      "primary_domain": "58foundations.com",
      "alternate_domains": [],
      "locations": [
        {
          "location_name": "Knoxville",
          "city": "Knoxville",
          "state": "TN",
          "market": "Tennessee"
        }
      ]
    }
  ]
}
```

### GET /brands/:shortcode

Get specific brand details (useful for future features).

**Example**:
```bash
curl https://api.vanterrafoundations.com/brands/58
```

## Benefits

### 1. Centralized Management
- Add new brands to API configuration
- Dashboard automatically picks them up
- No code changes required

### 2. Consistent Naming
- Brand full names pulled from single source of truth
- No naming inconsistencies between systems

### 3. Scalability
- Works with any number of brands
- No hardcoded limits

### 4. Performance
- Client-side caching reduces API calls
- 1-hour TTL minimizes refresh frequency
- Brands rarely change, so caching is effective

### 5. Error Resilience
- Graceful error handling
- User-friendly error messages
- Doesn't break the entire dashboard

## Usage in Code

### Accessing Brand Data

```typescript
import { getBrands } from '@/lib/api-client'

// In a component
const response = await getBrands()
const brands = response.brands

// Find specific brand
const brand58 = brands.find(b => b.shortcode === '58')
console.log(brand58?.full_name) // "58 Foundations & Waterproofing"
```

### Using in Filters

```typescript
const [filters, setFilters] = useState<Filters>({
  brand: '58',  // Any valid brand shortcode
  dateRange: { from: ..., to: ... }
})
```

### Accessing Location Data

```typescript
const brand = await getBrand('58')

// Access locations
brand.brand.locations.forEach(location => {
  console.log(location.location_name)  // "Knoxville"
  console.log(location.city)           // "Knoxville"
  console.log(location.state)          // "TN"
})
```

## Future Enhancements

### 1. Location Filtering
Could add location selector based on brand's locations:

```typescript
// Get selected brand's locations
const selectedBrand = brands.find(b => b.shortcode === filters.brand)
const locations = selectedBrand?.locations || []

// Add location filter
<Select>
  {locations.map(loc => (
    <SelectItem value={loc.location_name}>
      {loc.city}, {loc.state}
    </SelectItem>
  ))}
</Select>
```

### 2. Brand Details Page
Could create a brand management/details view:
- Show all locations
- Display tracking IDs (with authentication)
- View domain configuration

### 3. Multi-Brand Selection
Allow comparing metrics across multiple brands:
```typescript
interface Filters {
  brands: string[]  // Array of shortcodes
  // ...
}
```

### 4. Brand-Specific Theming
Could customize colors/logos per brand:
```typescript
const brand = await getBrand(filters.brand)
// Apply brand-specific theme
```

## Testing

### Test Brand Selector

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open dashboard**:
   ```
   http://localhost:3001
   ```

3. **Verify**:
   - Brands load automatically
   - Shows "Loading brands..." spinner initially
   - Dropdown displays full brand names
   - Selecting a brand updates the filter
   - Data refreshes with new brand

### Test Error Handling

1. **Stop API server** (to simulate error)
2. **Reload dashboard**
3. **Verify**:
   - Shows "Failed to load brands" error
   - Error message is clear and user-friendly
   - Dashboard doesn't crash

### Test Caching

1. **Open Network tab** in browser DevTools
2. **Load dashboard**
3. **Verify**:
   - `/brands` API called once on mount
   - Not called again on subsequent page loads (within 1 hour)
   - Cached response used

## Configuration

### Change Cache Duration

Edit `lib/api-client.ts`:

```typescript
// Current: 1 hour
const CACHE_TTL = 60 * 60 * 1000

// Change to 30 minutes
const CACHE_TTL = 30 * 60 * 1000

// Change to 5 minutes (for development)
const CACHE_TTL = 5 * 60 * 1000
```

### Disable Caching

For development/testing:

```typescript
// Force fresh fetch every time
const response = await getBrands(false)
```

### Change Default Brand

Update page components:

```typescript
// Before
const [filters, setFilters] = useState({
  brand: '58',  // Change this
  // ...
})

// Could also fetch from localStorage or URL params
const defaultBrand = localStorage.getItem('selectedBrand') || '58'
```

## Troubleshooting

**Brands not loading:**
1. Check API URL in `.env.local`
2. Verify `/brands` endpoint is accessible
3. Check browser console for errors
4. Verify API is returning expected format

**Wrong brand names:**
- Brands pulled from API configuration
- Update brand full names in API config source
- Clear cache: wait 1 hour or restart server

**Dropdown empty:**
- Check API response has `brands` array
- Verify brands array is not empty
- Check browser console for errors

**Type errors:**
- Ensure `brand` field in filters is `string` (not union type)
- Update any hardcoded brand references

## Files Modified

```
✅ lib/types.ts (new types)
✅ lib/api-client.ts (new functions + caching)
✅ components/brand-selector.tsx (fetch from API)
```

## Migration Notes

### Before
- 3 hardcoded brands only
- Required code changes to add brands
- Brand names could be inconsistent

### After
- ✅ Dynamic brand loading from API
- ✅ No code changes to add brands
- ✅ Single source of truth for brand names
- ✅ Scales to any number of brands
- ✅ Client-side caching for performance
- ✅ Graceful error handling

---

**Status**: ✅ Complete and Production Ready

The brand selector now integrates with your centralized brand configuration API, making the dashboard more maintainable and scalable.
