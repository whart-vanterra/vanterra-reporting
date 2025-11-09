# Brand Admin System - Setup Complete

A complete admin interface for managing brands and locations has been created for your Vanterra Reporting dashboard.

## What Was Built

### 1. API Infrastructure

#### Server-Side API Client (`lib/admin-api-client.ts`)
- Direct connection to webhook admin API
- Uses `ADMIN_API_TOKEN` for authentication
- **Server-side only** - never exposed to browser

#### Next.js API Routes (Proxy Layer)
All API routes created in `/app/api/admin/`:
- `GET /api/admin/brands` - List all brands
- `POST /api/admin/brands` - Create new brand
- `GET /api/admin/brands/[shortcode]` - Get brand details
- `PUT /api/admin/brands/[shortcode]` - Update brand
- `DELETE /api/admin/brands/[shortcode]` - Delete brand
- `GET /api/admin/brands/[shortcode]/locations` - List locations
- `POST /api/admin/brands/[shortcode]/locations` - Create location
- `PUT /api/admin/brands/[shortcode]/locations/[id]` - Update location
- `DELETE /api/admin/brands/[shortcode]/locations/[id]` - Delete location
- `POST /api/admin/cache` - Refresh config cache

#### Client-Side API (`lib/client-admin-api.ts`)
- Safe browser-side API that calls Next.js routes
- No token exposure to client

### 2. User Interface

#### Pages Created
1. **`/admin/brands`** - Brand list with search and actions
2. **`/admin/brands/new`** - Create new brand
3. **`/admin/brands/[shortcode]`** - Brand detail with locations
4. **`/admin/brands/[shortcode]/edit`** - Edit brand
5. **`/admin/brands/[shortcode]/locations/new`** - Add location
6. **`/admin/brands/[shortcode]/locations/[id]`** - Edit location

#### Components
- **BrandForm** - Comprehensive brand creation/editing form
- **LocationForm** - Location management with all integrations
- **Navigation** - Updated with "Admin" link

### 3. Features Implemented

✅ **Brand Management**
- Create, read, update, delete brands
- Configure domains (primary + alternates)
- Set notification emails
- Brand-level integration fallbacks

✅ **Location Management**
- Add/edit/delete locations per brand
- ServiceTitan business units (Sales, Service, Production)
- Google Ads configuration
- Facebook integration
- Microsoft Ads setup
- Yelp tracking
- HomeAdvisor integration

✅ **User Experience**
- Loading states with skeletons
- Toast notifications for actions
- Confirmation dialogs for deletions
- Form validation
- Error handling with clear messages
- Responsive design

✅ **Security**
- Server-side token management
- API route proxying
- No token exposure to browser

## Setup Instructions

### 1. Configure Environment Variables

Edit your `.env.local` file (create from `.env.local.example`):

```bash
# Your existing config
NEXT_PUBLIC_API_BASE_URL=https://api.vanterrafoundations.com

# NEW: Add your admin API token
ADMIN_API_TOKEN=your_admin_token_here
```

To generate a secure token:
```bash
openssl rand -hex 32
```

This token must match the `ADMIN_API_TOKEN` configured in your webhook service.

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Admin Interface

Navigate to: **http://localhost:3000/admin/brands**

Or click "Admin" in the top navigation bar.

## Usage Guide

### Creating a New Brand

1. Go to `/admin/brands`
2. Click "New Brand" button
3. Fill in required fields:
   - **Shortcode** - Unique identifier (e.g., "58", "AW")
   - **Full Name** - Display name
   - **Primary Domain** - Main website domain
4. Optionally configure:
   - Alternate domains (one per line)
   - Lead notification email
   - Brand-level integration IDs (Google, Facebook, etc.)
5. Click "Create Brand"

### Adding Locations to a Brand

1. Go to brand detail page: `/admin/brands/[shortcode]`
2. Click "Add Location" button
3. Fill in location details:
   - **Location Name** - Required (e.g., "Knoxville")
   - City, State, Market - Optional
4. Configure ServiceTitan business units:
   - **Sales** - Sent to ad partners ✅
   - **Service** - Tracked only (not sent to ads)
   - **Production** - Not tracked at all
5. Add integration IDs as needed
6. Click "Create Location"

### Editing Brands/Locations

1. Navigate to the brand or location
2. Click "Edit" button
3. Modify fields as needed
4. Click "Update"

**Note:** Shortcode cannot be changed after brand creation.

### Deleting Brands/Locations

1. Click the trash icon next to the item
2. Confirm deletion in the dialog
3. **Warning:** Deleting a brand deletes all its locations!

### Refreshing Cache

After bulk changes, click "Refresh Cache" to force immediate update of the config cache.

## Important Notes

### Business Unit Types

The new system supports multiple business unit types per location:

- **Sales** (`servicetitan_business_units.sales`)
  - Sent to Google Ads, Facebook, Microsoft Ads, Yelp
  - Used for lead conversion tracking

- **Service** (`servicetitan_business_units.service`)
  - Tracked in database
  - **NOT** sent to advertising partners

- **Production** (`servicetitan_business_units.production`)
  - Filtered out entirely
  - Not tracked as leads

### Legacy Support

Old `servicetitan_business_unit` (single string) is still supported and treated as a Sales business unit.

### Security

- ⚠️ **NEVER commit `.env.local` to git**
- Keep `ADMIN_API_TOKEN` secret
- Rotate tokens every 90 days
- Only share with authorized admins
- Token works in both webhook service and this Next.js app

### API Rate Limiting

Currently no rate limiting is implemented. Consider adding if needed:
- Vercel edge functions have built-in limits
- Cloudflare provides rate limiting
- Can add custom middleware

## Architecture

```
Browser
  ↓
Next.js Client Component (uses client-admin-api.ts)
  ↓
Next.js API Route (/app/api/admin/*)
  ↓ (adds ADMIN_API_TOKEN header)
Webhook Admin API (api.vanterrafoundations.com/admin/*)
  ↓
Supabase Database
```

**Why this architecture?**
- Keeps `ADMIN_API_TOKEN` server-side only
- Prevents token exposure in browser
- Enables server-side validation/transformation
- Easy to add caching or rate limiting later

## TypeScript Types

All types are defined in:
- `lib/admin-types.ts` - Admin API types
- `lib/types.ts` - General app types

Types are fully documented with JSDoc comments.

## Components

### Brand Form
**Location:** `components/admin/brand-form.tsx`

Comprehensive form for creating/editing brands with:
- Basic info (shortcode, name, domains)
- Email notifications
- Google Ads integration
- Facebook integration
- Microsoft Ads integration
- HomeAdvisor integration

### Location Form
**Location:** `components/admin/location-form.tsx`

Detailed location form with:
- Location details (name, city, state, market)
- ServiceTitan business units (3 types)
- All advertising platform integrations
- Yelp and HomeAdvisor tracking

## Troubleshooting

### "Invalid authentication token" error

**Solution:** Check that `ADMIN_API_TOKEN` in `.env.local` matches the token configured in your webhook service.

### Changes not reflecting immediately

**Solution:** Click "Refresh Cache" button in the admin interface.

### Can't create brand with existing shortcode

**Solution:** Shortcodes must be unique. Use a different shortcode or delete the existing brand first.

### API calls failing

**Checklist:**
1. Is `ADMIN_API_TOKEN` set in `.env.local`?
2. Is the webhook API URL correct in `NEXT_PUBLIC_API_BASE_URL`?
3. Is the webhook service running and accessible?
4. Check browser console for detailed errors
5. Check Next.js server logs

### Prettier hook errors

The prettier hook errors you're seeing are cosmetic and don't affect functionality. To fix:

```bash
# Option 1: Run prettier manually
npx prettier --write "**/*.{ts,tsx}"

# Option 2: Disable the hook temporarily in your git config
```

## Next Steps

### Recommended Enhancements

1. **Add search/filtering** to brands list
2. **Add sorting** to tables
3. **Add pagination** for large brand lists
4. **Add bulk operations** (import/export)
5. **Add audit logging** to track changes
6. **Add role-based access** control
7. **Add validation** for domain formats, IDs, etc.
8. **Add testing** with Vitest/Playwright

### Integration Testing

Test the full flow:

1. Create a test brand
2. Add test location with ServiceTitan business units
3. Verify brand appears in reporting dashboard
4. Send a test webhook
5. Verify lead attribution works
6. Check ad partner API calls

## File Structure

```
/app/admin/brands/
  ├── page.tsx                          # Brand list
  ├── new/page.tsx                      # Create brand
  └── [shortcode]/
      ├── page.tsx                      # Brand detail
      ├── edit/page.tsx                 # Edit brand
      └── locations/
          ├── new/page.tsx              # Create location
          └── [locationId]/page.tsx     # Edit location

/app/api/admin/
  ├── brands/
  │   ├── route.ts                      # GET, POST brands
  │   └── [shortcode]/
  │       ├── route.ts                  # GET, PUT, DELETE brand
  │       └── locations/
  │           ├── route.ts              # GET, POST locations
  │           └── [locationId]/route.ts # PUT, DELETE location
  └── cache/route.ts                    # POST refresh cache

/components/admin/
  ├── brand-form.tsx                    # Brand create/edit form
  └── location-form.tsx                 # Location create/edit form

/lib/
  ├── admin-api-client.ts               # Server-side API client
  ├── client-admin-api.ts               # Client-side API wrapper
  └── admin-types.ts                    # TypeScript types
```

## Support

For issues or questions:
1. Check this documentation
2. Review webhook admin API docs
3. Check Next.js server logs
4. Check browser console for errors

## Summary

You now have a fully functional admin interface for managing brands and locations! The system is secure, user-friendly, and follows Next.js 15 best practices with:

- ✅ Server Components where possible
- ✅ Client Components for interactivity
- ✅ Proper authentication handling
- ✅ Type-safe API calls
- ✅ Responsive shadcn/ui components
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

Happy brand managing! 🎉
