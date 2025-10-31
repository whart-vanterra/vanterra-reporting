# Dark Mode Implementation

## Overview

The dashboard now includes full dark mode support with a toggle button in the navigation bar. Users can switch between light mode, dark mode, or system preference.

## Features

✅ **Light Mode** - Clean, bright interface
✅ **Dark Mode** - Easy on the eyes for low-light environments
✅ **System Mode** - Automatically matches user's OS preference
✅ **Persistent** - Theme preference saved in localStorage
✅ **Smooth Transitions** - No flash on page load
✅ **Complete Coverage** - All components styled for both themes

## How It Works

### 1. Theme Provider
Uses `next-themes` package to manage theme state across the application.

**File**: `components/theme-provider.tsx`
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

**Options:**
- `attribute="class"` - Adds `dark` class to HTML element
- `defaultTheme="system"` - Uses system preference by default
- `enableSystem` - Allows system theme detection
- `disableTransitionOnChange` - Prevents color flash during theme switch

### 2. Theme Toggle Button
Animated sun/moon icon button in the navigation bar.

**File**: `components/theme-toggle.tsx`

**Features:**
- Click to toggle between light and dark
- Smooth icon rotation animation
- Accessible (screen reader friendly)
- Handles SSR properly (no hydration issues)

### 3. CSS Variables
Complete color system for both themes defined in `app/globals.css`

**Light Mode Colors:**
```css
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 221.2 83.2% 53.3%
--muted: 210 40% 96.1%
/* ... and more */
```

**Dark Mode Colors:**
```css
.dark {
  --background: 222.2 84% 4.9%
  --foreground: 210 40% 98%
  --primary: 217.2 91.2% 59.8%
  --muted: 217.2 32.6% 17.5%
  /* ... and more */
}
```

## Theme Toggle Location

The theme toggle button is located in the **top-right corner** of the navigation bar:

```
┌─────────────────────────────────────────────────────┐
│ 🏠 Vanterra    Dashboard  Leads  ... [☀️/🌙]       │
└─────────────────────────────────────────────────────┘
```

## Usage

### For Users
1. **Click** the sun/moon icon in the top-right
2. **Toggle** between light and dark modes
3. **Preference saved** automatically

### For Developers

**Access theme in components:**
```tsx
'use client'

import { useTheme } from 'next-themes'

export function MyComponent() {
  const { theme, setTheme } = useTheme()

  // Get current theme
  console.log(theme) // 'light' | 'dark' | 'system'

  // Set theme
  setTheme('dark')

  return <div>Current theme: {theme}</div>
}
```

**Style components for dark mode:**
```tsx
// Using Tailwind dark: variant
<div className="bg-white dark:bg-gray-900">
  <p className="text-black dark:text-white">
    Adapts to theme
  </p>
</div>
```

**Use CSS variables (recommended):**
```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">
    Automatically adapts to theme
  </p>
</div>
```

## Component Styling

All components use CSS variables that automatically adapt:

**Colors Available:**
- `bg-background` / `text-foreground` - Main background/text
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary elements
- `bg-muted` / `text-muted-foreground` - Subtle backgrounds
- `bg-accent` / `text-accent-foreground` - Hover states
- `border-border` - All borders
- `ring-ring` - Focus rings

## Chart Colors

Charts (Recharts) automatically adapt using CSS variables:

```tsx
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
```

## Testing

**Test dark mode:**
```bash
npm run dev
```

1. Open http://localhost:3001
2. Click sun/moon icon in top-right
3. Verify all pages look good in both modes:
   - ✅ Dashboard
   - ✅ Leads page
   - ✅ Appointments page
   - ✅ Attribution page
   - ✅ Phone lookup page

**Test system preference:**
1. Set OS to dark mode
2. Load dashboard
3. Should automatically be in dark mode
4. Toggle to light mode
5. Refresh page
6. Should stay in light mode (preference saved)

## Accessibility

✅ **Keyboard accessible** - Tab to button, Enter/Space to toggle
✅ **Screen reader support** - "Toggle theme" label
✅ **High contrast** - Meets WCAG AA standards in both modes
✅ **Focus indicators** - Visible keyboard focus
✅ **No color-only indicators** - Information not conveyed by color alone

## Browser Support

Works in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Troubleshooting

**Theme not persisting:**
- Check localStorage is enabled
- Key is `theme` (managed by next-themes)

**Flash on page load:**
- Already prevented with `suppressHydrationWarning`
- Script runs before page render

**Charts not adapting:**
- Ensure using `hsl(var(--chart-X))` format
- Check CSS variables are defined

**Custom components not working:**
- Use CSS variables instead of hardcoded colors
- Or use `dark:` Tailwind variants

## Customization

### Change Default Theme

Edit `app/layout.tsx`:
```tsx
<ThemeProvider
  defaultTheme="dark"  // Change to 'dark' or 'light'
  // ...
>
```

### Add Third Theme

1. Add CSS variables in `app/globals.css`:
```css
[data-theme="blue"] {
  --background: 200 100% 95%;
  /* ... */
}
```

2. Update ThemeProvider:
```tsx
<ThemeProvider
  attribute="data-theme"
  themes={['light', 'dark', 'blue']}
>
```

### Customize Colors

Edit colors in `app/globals.css`:
```css
.dark {
  --background: 240 10% 3.9%;  /* Change these values */
  --foreground: 0 0% 98%;
  /* ... */
}
```

## Package Details

**Installed**: `next-themes@^0.4.0`

**Why next-themes?**
- ✅ Zero flash on page load
- ✅ Automatic SSR/SSG support
- ✅ System preference detection
- ✅ localStorage persistence
- ✅ TypeScript support
- ✅ Lightweight (~3KB)

## Files Modified

```
✅ components/theme-provider.tsx (new)
✅ components/theme-toggle.tsx (new)
✅ app/layout.tsx (updated)
✅ components/navigation.tsx (updated)
✅ package.json (next-themes added)
```

## Before/After

**Before:**
- Only light mode
- No theme toggle
- System preference ignored

**After:**
- ✅ Full dark mode support
- ✅ Toggle button in navigation
- ✅ System preference detection
- ✅ Persistent theme choice
- ✅ Smooth transitions
- ✅ All components styled

---

**Status**: ✅ Production Ready

Dark mode is fully implemented and tested. All pages, components, and charts adapt seamlessly to the selected theme.
