# Changelog

## [Unreleased] - 2025-10-30

### Added

#### URL Routing & Shareable Links
- URL parameters for brand and date range filters
- Shareable dashboard links (copy button in filter bar)
- Deep linking support for all pages
- Browser back/forward navigation
- Automatic URL sync when filters change
- Human-readable URL format: `?brand=58&start=2025-10-01&end=2025-10-31`

#### Advanced Date Range Picker
- 15 preset date ranges:
  - Today, Yesterday
  - Last 7/14/30/60/90 Days
  - This Week, Last Week
  - This Month, Last Month, Last 3/6 Months
  - This Year, Last Year
- Custom date selection with manual inputs
- Preset detection and highlighting
- Visual two-column layout (presets + custom dates)
- Instant apply on preset click

#### Filter Bar Enhancements
- Reset button (🔄) - restores default filters
- Share button (🔗) - copies URL to clipboard
- Improved layout with action buttons
- Automatic URL synchronization

#### Brand API Integration
- Dynamic brand loading from `/brands` endpoint
- Client-side caching (1-hour TTL)
- Loading and error states
- Supports unlimited brands from API
- No hardcoded brand lists
- Full brand names in dropdown

#### Dark Mode
- Theme toggle button in navigation (☀️/🌙)
- Light, Dark, and System modes
- Persistent theme selection (localStorage)
- Smooth transitions
- All components styled for both themes
- No flash on page load

### Changed

#### Type System
- Updated `Brand` type from union to `string` (supports any brand)
- Added `BrandConfig`, `BrandsResponse` types
- Added `DatePreset`, `URLParams` types
- Updated `Filters` interface to use string brand

#### API Client
- Added `getBrands()`, `getBrand()`, `getBrandByDomain()` functions
- Implemented client-side caching for brands
- Fixed API response structures (removed `data` wrapper)
- Updated all type definitions to match actual API responses

#### Components
- `BrandSelector` now fetches from API dynamically
- `DateRangePicker` replaced with `AdvancedDateRangePicker`
- `FilterBar` now includes URL sync and action buttons
- All page components wrapped in Suspense boundaries

#### Pages
- All pages now read filters from URL parameters on load
- Dashboard, Leads, Appointments, Attribution support URL routing
- Removed default filter hardcoding (now reads from URL)

### Fixed

- Hydration mismatch error (added `suppressHydrationWarning`)
- API response structure mismatches
- Suspense boundary requirements for `useSearchParams()`
- Field name mismatches (timestamp vs created_at, phone vs customer_phone, etc.)
- Attribution breakdown structure (object vs array format)
- Type safety across all components

### Technical Details

#### New Files
```
lib/date-presets.ts                      # 15 date preset definitions
lib/url-params.ts                        # URL encoding/decoding utilities
components/advanced-date-range-picker.tsx # New date picker UI
components/theme-provider.tsx             # Dark mode context
components/theme-toggle.tsx               # Theme toggle button
components/page-wrapper.tsx               # Suspense wrapper utility
```

#### Modified Files
```
lib/types.ts                    # Added BrandConfig, URLParams types
lib/api-client.ts               # Added brand API functions + caching
components/brand-selector.tsx   # Dynamic API fetching
components/filter-bar.tsx       # URL sync + actions
components/navigation.tsx       # Added theme toggle
app/layout.tsx                  # Added ThemeProvider
app/page.tsx                    # URL parameter support + Suspense
app/leads/page.tsx             # URL parameter support + Suspense
app/appointments/page.tsx       # URL parameter support + Suspense
app/attribution/page.tsx        # URL parameter support + Suspense
```

#### Documentation Added
```
DARK_MODE.md              # Dark mode implementation guide
BRAND_API_INTEGRATION.md  # Brand API integration docs
URL_ROUTING.md            # URL routing & date picker guide
FIXES_APPLIED.md          # Bug fixes summary
CHANGELOG.md              # This file
```

### Build Status

```
✅ Build successful
✅ No TypeScript errors
✅ No ESLint warnings
✅ All pages compile
✅ Bundle size optimized
```

### Breaking Changes

None - all changes are backwards compatible.

### Migration Required

None - existing functionality preserved.

### Performance

- Client-side brand caching reduces API calls
- URL parameter parsing is efficient
- Suspense boundaries improve perceived performance
- Date presets calculate instantly (no API calls)

### Browser Support

All features work in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Dependencies Added

```json
{
  "next-themes": "^0.4.0"  // Dark mode support
}
```

All other features use existing dependencies (date-fns, Next.js routing).

## Summary

This release adds significant UX improvements:
1. **Shareable dashboard views** via URL parameters
2. **15 quick date presets** for common date ranges
3. **Dynamic brand loading** from centralized API
4. **Full dark mode support** with theme toggle
5. **One-click actions** (share, reset)

The dashboard is now more flexible, easier to share, and integrates with the centralized brand configuration API.

---

**Version**: Next release
**Date**: 2025-10-30
**Status**: ✅ Ready for production
