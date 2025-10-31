# Vanterra Reporting Dashboard

A Next.js 15 analytics dashboard for marketing attribution, lead tracking, and appointment management.

## Features

- **Overview Dashboard**: High-level metrics with trends, conversion rates, and charts
- **Leads Management**: Paginated table of all marketing leads (calls + forms) with filtering
- **Appointments Tracking**: ServiceTitan appointments with customer details
- **Attribution Analysis**: Visual breakdowns by channel, source, campaign, location, and click ID
- **Phone Lookup Tool**: Search CallRail data for call attribution
- **Dark Mode**: Full dark mode support with toggle button and system preference detection
- **Dynamic Brand Loading**: Brands fetched from centralized API with client-side caching
- **URL Routing**: Shareable links with filter parameters (brand + date range)
- **Advanced Date Picker**: 15 preset date ranges (Last 7 days, Last 30 days, This Month, etc.)
- **Share & Reset**: One-click actions to share current view or reset to defaults

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to the Vanterra Reporting API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vanterra-reporting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000  # Your API URL
# API_KEY=your-api-key  # Uncomment when auth is enabled
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
vanterra-reporting/
├── app/                          # Next.js App Router pages
│   ├── appointments/             # Appointments page
│   ├── attribution/              # Attribution breakdown page
│   ├── leads/                    # Leads page
│   ├── lookup/                   # Phone lookup page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard overview
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── brand-selector.tsx        # Brand selection dropdown
│   ├── date-range-picker.tsx    # Date range picker
│   ├── filter-bar.tsx           # Shared filter controls
│   ├── metric-card.tsx          # Metric display card
│   └── navigation.tsx           # Main navigation
├── lib/                          # Utilities and helpers
│   ├── api-client.ts            # API client functions
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Helper functions
└── public/                       # Static assets
```

## Available Pages

### Dashboard (`/`)
- Overview metrics with trend analysis
- Lead distribution charts (calls vs forms)
- Conversion funnel visualization
- Period-over-period comparisons

### Leads (`/leads`)
- Paginated lead table
- Filter by type (call/form)
- View contact information and attribution data
- Click ID tracking (Google, Facebook, Microsoft)

### Appointments (`/appointments`)
- Paginated appointment table
- Customer contact details
- Job information and scheduling
- ServiceTitan integration data

### Attribution (`/attribution`)
- Group by: Channel, Source, Campaign, Location, Click ID Type
- Interactive charts and visualizations
- Conversion rate analysis
- Detailed attribution table

### Phone Lookup (`/lookup`)
- Search by phone number
- View call details and attribution
- UTM parameter tracking
- Landing page and referrer information

## API Endpoints Used

The dashboard consumes these backend API endpoints:

- `GET /reporting/metrics/summary` - Summary metrics with trends
- `GET /reporting/leads` - Paginated leads list
- `GET /reporting/appointments` - Paginated appointments list
- `GET /reporting/attribution/breakdown` - Attribution analysis
- `POST /reporting/callrail/lookup` - Phone number lookup
- `GET /reporting/leads-with-appointments` - Full lead-to-appointment matching

See the [API Documentation](../API_DOCUMENTATION.md) for detailed endpoint specs.

## Development

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE_URL`
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Render

## Configuration

### Brands

Edit `components/brand-selector.tsx` to modify available brands:

```typescript
const BRANDS = [
  { value: '58', label: 'Valu Home Centers' },
  { value: '64', label: 'The Patch Boys' },
  { value: '65', label: 'Budget Blinds' },
]
```

### Date Range Defaults

The default date range is set to the last 30 days. Modify in each page component:

```typescript
const [filters, setFilters] = useState<Filters>({
  brand: '58',
  dateRange: {
    from: subDays(new Date(), 30),  // Change this
    to: new Date(),
  },
})
```

### Chart Colors

Customize chart colors in `app/page.tsx` and `app/attribution/page.tsx`:

```typescript
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', ...]
```

## Authentication

The dashboard currently does not include authentication. When the API implements authentication:

1. Uncomment the `API_KEY` line in `.env.local`
2. The API client (`lib/api-client.ts`) is already configured to send the key via `X-API-Key` header
3. Implement frontend auth as needed (NextAuth.js, Auth0, etc.)

## Troubleshooting

### API Connection Issues

If you see "Failed to fetch" errors:
1. Verify `NEXT_PUBLIC_API_BASE_URL` is correct in `.env.local`
2. Check that the API server is running
3. Check browser console for CORS errors
4. Verify the API endpoints are accessible

### Build Errors

If you encounter build errors:
1. Clear Next.js cache: `rm -rf .next`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

### TypeScript Errors

If TypeScript errors appear:
1. Check that all types are properly imported
2. Verify API response types match `lib/types.ts`
3. Run type checking: `npx tsc --noEmit`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - Vanterra Inc.

## Support

For issues or questions, contact the development team.
