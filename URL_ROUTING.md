# URL Routing & Advanced Date Range Picker

The dashboard now supports URL-based routing with parameters and includes an advanced date range picker with 15 preset options.

## Features

✅ **URL Parameters** - Filters sync with URL automatically
✅ **Shareable Links** - Copy and share specific dashboard views
✅ **15 Date Presets** - Quick select common date ranges
✅ **Custom Dates** - Manual date selection still available
✅ **Browser History** - Back/forward buttons work correctly
✅ **Deep Linking** - Direct navigation to filtered views

## URL Parameter Format

### Structure

```
/{page}?brand={shortcode}&start={yyyy-MM-dd}&end={yyyy-MM-dd}
```

### Parameters

| Parameter | Description | Example | Required |
|-----------|-------------|---------|----------|
| `brand` | Brand shortcode | `58`, `AW`, `SD` | Yes (defaults to '58') |
| `start` | Start date | `2025-10-01` | Yes |
| `end` | End date | `2025-10-31` | Yes |
| `preset` | Date preset value | `last-30-days` | Optional |

### Example URLs

```bash
# Dashboard with specific brand and dates
https://dashboard.com/?brand=58&start=2025-10-01&end=2025-10-31

# Leads page with last 7 days
https://dashboard.com/leads?brand=58&start=2025-10-24&end=2025-10-30

# Attribution with custom range
https://dashboard.com/attribution?brand=AW&start=2025-09-01&end=2025-09-30
```

## Date Range Picker

### 15 Built-in Presets

The new advanced date range picker includes these presets:

#### Quick Options
1. **Today** - Current day
2. **Yesterday** - Previous day
3. **Last 7 Days** - Past week including today
4. **Last 14 Days** - Past 2 weeks including today
5. **Last 30 Days** - Past month including today (default)
6. **Last 60 Days** - Past 2 months including today
7. **Last 90 Days** - Past 3 months including today

#### Weekly Options
8. **This Week** - Sunday to today
9. **Last Week** - Previous full week (Sun-Sat)

#### Monthly Options
10. **This Month** - Month to date
11. **Last Month** - Previous full month
12. **Last 3 Months** - Past 90 days
13. **Last 6 Months** - Past 180 days

#### Yearly Options
14. **This Year** - Year to date
15. **Last Year** - Previous full year

### UI Features

**Preset Column** (Left side)
- Click any preset to instantly apply
- Shows description for clarity
- Highlights selected preset with checkmark
- Closes automatically after selection

**Custom Date Column** (Right side)
- Manual date inputs
- From/To date fields
- "Apply Range" button
- Only enabled when both dates selected

### Visual Design

```
┌─────────────────────────────────────────┐
│ Quick Select      │  Custom Range       │
│                   │                     │
│ ✓ Last 30 Days    │  From Date          │
│   Last 60 Days    │  [2025-10-01]       │
│   Last 90 Days    │                     │
│   This Month      │  To Date            │
│   Last Month      │  [2025-10-31]       │
│   ...             │                     │
│                   │  [Apply Range]      │
└─────────────────────────────────────────┘
```

## Filter Bar Enhancements

### New Actions

**Reset Button** 🔄
- Resets to default filters (Brand: 58, Last 30 Days)
- Clears URL parameters
- Single click to start fresh

**Share Button** 🔗
- Copies current URL to clipboard
- Includes all active filters
- Shows confirmation alert
- Perfect for sharing reports

### Layout

```
┌────────────────────────────────────────────────────┐
│ Brand: [58 Foundations ▼]  Date Range: [Last 30 Days ▼]  [🔄] [🔗] │
└────────────────────────────────────────────────────┘
```

## How It Works

### 1. URL → Filters (Page Load)

When you load a page with URL parameters:

```typescript
// URL: /?brand=58&start=2025-10-01&end=2025-10-31

// Automatically parsed to:
{
  brand: '58',
  dateRange: {
    from: Date('2025-10-01'),
    to: Date('2025-10-31')
  }
}
```

### 2. Filters → URL (User Input)

When you change filters:

```typescript
// User selects: Brand "AW", Last 7 Days

// URL updates automatically:
/?brand=AW&start=2025-10-24&end=2025-10-30
```

### 3. URL Sync

- URL updates use `router.replace()` (no history spam)
- Changes don't trigger page reload
- Browser back/forward work correctly
- Bookmarks save current view

## Usage Examples

### Share a Dashboard View

1. Set your desired filters (brand + date range)
2. Click the Share button (🔗)
3. Link copied to clipboard
4. Paste and send to colleague
5. They see exact same view

### Bookmark a Report

1. Configure filters for weekly review
2. Click browser bookmark button
3. Name it (e.g., "Weekly 58 Report")
4. Return anytime with filters preserved

### Create Direct Links

```typescript
// In documentation or emails
const links = {
  monthlyReport: 'https://dashboard.com/?brand=58&start=2025-10-01&end=2025-10-31',
  lastWeek: 'https://dashboard.com/leads?brand=58&start=2025-10-24&end=2025-10-30',
  Q4Review: 'https://dashboard.com/attribution?brand=AW&start=2025-10-01&end=2025-12-31'
}
```

### Preset Detection

The picker automatically detects which preset matches current dates:

```typescript
// URL: ?start=2025-10-24&end=2025-10-30
// Shows: "Last 7 Days" (with checkmark)

// URL: ?start=2025-10-01&end=2025-10-31
// Shows: "Oct 1, 2025 - Oct 31, 2025" (custom range)
```

## Implementation Details

### Files Created

```
lib/date-presets.ts              # Preset definitions
lib/url-params.ts                # URL encoding/decoding
components/advanced-date-range-picker.tsx  # New picker UI
components/page-wrapper.tsx      # Suspense wrapper
```

### Files Modified

```
components/filter-bar.tsx        # URL sync + actions
app/page.tsx                     # Dashboard URL support
app/leads/page.tsx              # Leads URL support
app/appointments/page.tsx        # Appointments URL support
app/attribution/page.tsx         # Attribution URL support
```

### Technical Implementation

**URL Parameter Utilities**:
```typescript
// Encode filters to URL
filtersToURLParams(filters)
// → URLSearchParams('brand=58&start=2025-10-01&end=2025-10-31')

// Decode URL to filters
urlParamsToFilters(searchParams, defaultBrand)
// → { brand, dateRange }

// Update URL without reload
updateURL(filters, router)
```

**Date Presets**:
```typescript
const DATE_PRESETS = [
  {
    label: 'Last 30 Days',
    value: 'last-30-days',
    description: 'Including today',
    getRange: () => ({
      from: subDays(today, 29),
      to: today
    })
  },
  // ... 14 more presets
]
```

**Suspense Boundaries**:
```typescript
// Required for useSearchParams() in Next.js 15
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  )
}
```

## Benefits

### 1. Shareability
- Copy exact dashboard state via URL
- No need to explain filter settings
- Persistent view configuration

### 2. Productivity
- Quick date selection with presets
- No calendar clicking for common ranges
- One-click reset to defaults

### 3. User Experience
- Browser back/forward work as expected
- Bookmarks preserve context
- URLs are human-readable

### 4. Integration
- Deep linking from emails
- Embed in documentation
- Automated report links

## Configuration

### Change Default Brand

Edit default in URL parser (`lib/url-params.ts`):

```typescript
export function urlParamsToFilters(
  searchParams: URLSearchParams,
  defaultBrand: string = '58'  // Change this
): Filters
```

### Add New Presets

Edit `lib/date-presets.ts`:

```typescript
{
  label: 'Last 45 Days',
  value: 'last-45-days',
  description: 'Including today',
  getRange: () => ({
    from: startOfDay(subDays(today, 44)),
    to: endOfDay(today),
  }),
}
```

### Customize Date Format

Edit `DATE_FORMAT` in `lib/url-params.ts`:

```typescript
const DATE_FORMAT = 'yyyy-MM-dd'  // ISO format
// or
const DATE_FORMAT = 'MM-dd-yyyy'  // US format
```

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Accessibility

✅ **Keyboard Navigable** - Tab through presets and dates
✅ **Screen Reader Friendly** - Proper labels and descriptions
✅ **Clear Actions** - Reset and share buttons have tooltips
✅ **Visual Feedback** - Selected preset highlighted

## Troubleshooting

**URL not updating:**
- Check browser console for errors
- Verify `router.replace()` is available
- Ensure page is wrapped in Suspense

**Dates not parsing:**
- Check date format (yyyy-MM-dd)
- Verify dates are valid
- Check console for parse errors

**Preset not detected:**
- Dates must match exactly
- Check timezone differences
- Verify preset calculation logic

**Share button not working:**
- Check clipboard API permissions
- Verify HTTPS (required for clipboard)
- Fallback to manual copy

## Future Enhancements

### Potential Additions

1. **URL Shortening**
   - Generate short URLs for sharing
   - Track link usage

2. **Saved Filters**
   - Save favorite filter combinations
   - Quick switch between views

3. **Comparison Mode**
   - Compare two date ranges in URL
   - Side-by-side metrics

4. **Export Links**
   - Add `&export=csv` parameter
   - Trigger automatic download

5. **Email Reports**
   - Send URL in scheduled emails
   - Click to view live report

## Testing

### Test URL Parameters

1. **Manual entry**:
   ```
   http://localhost:3001/?brand=58&start=2025-10-01&end=2025-10-31
   ```
   Verify filters load correctly

2. **Share button**:
   - Set filters
   - Click share
   - Paste URL in new tab
   - Verify same view

3. **Reset button**:
   - Set custom filters
   - Click reset
   - Verify defaults restored

4. **Browser navigation**:
   - Change filters multiple times
   - Use back button
   - Verify previous state

### Test Date Presets

1. Click each preset
2. Verify correct date range applied
3. Check URL updates
4. Verify preset highlighted

### Test Custom Dates

1. Enter manual dates
2. Click Apply Range
3. Verify URL updates
4. Check data refreshes

## Migration Notes

### Before
- No URL parameters
- Simple date picker
- No sharing capability
- Lost state on page reload

### After
- ✅ Full URL parameter support
- ✅ Advanced picker with 15 presets
- ✅ One-click sharing
- ✅ State preserved in URL
- ✅ Deep linking support
- ✅ Browser history integration

---

**Status**: ✅ Complete and Production Ready

URL routing with advanced date range picker is fully implemented and tested. All pages support shareable URLs with filter preservation.
