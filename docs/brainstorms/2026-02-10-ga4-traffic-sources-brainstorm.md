# GA4 Traffic Sources Integration

**Date:** 2026-02-10
**Status:** Brainstorm complete
**Component:** `src/components/admin/TrafficSources.tsx`

## What We're Building

Replace the hardcoded mock data in the "Джерела трафіку" admin block with real traffic source data from Google Analytics 4. Keep the existing glassmorphism progress-bar design, add a selectable time period (7d / 30d / 90d).

## Why This Approach

**Architecture:** Next.js API Route (`/api/admin/traffic-sources`) + GA4 Data API with service account authentication.

Chosen over:
- **Server component direct query** — doesn't support the period selector without refactoring to client component + API anyway
- **Looker Studio embed** — can't match the existing glassmorphism design

Reasons:
- Full control over data transformation and display
- Service account credentials stay server-side (secure)
- Period selector works naturally via query params (`?period=7d`)
- Follows existing admin data-fetching patterns (Supabase queries in server components / API routes)

## Key Decisions

1. **GA4 tracking setup:** Add `gtag.js` to the Next.js root layout via `<Script>` component. Track page views automatically.
2. **Data source:** GA4 Data API v1 (`@google-analytics/data` npm package) with service account authentication.
3. **API route:** `POST /api/admin/traffic-sources` — accepts `{ period: "7d" | "30d" | "90d" }`, returns traffic source breakdown as percentages.
4. **GA4 dimensions/metrics:**
   - Dimension: `sessionDefaultChannelGroup` (gives: Organic Search, Paid Search, Direct, Referral, Social, Email, etc.)
   - Metric: `sessions` (count of sessions per channel)
   - Date range: dynamic based on selected period
5. **Component update:** `TrafficSources` becomes a client component that fetches from the API route, displays a period selector dropdown, and renders the existing progress-bar list with real data.
6. **Color mapping:** Map GA4 channel groups to the existing color scheme (blue, rose, emerald, amber, gray). Top 5 sources shown, rest grouped as "Others".
7. **Auth protection:** API route checks admin session via Supabase auth (same pattern as other admin routes).
8. **Env variables needed:**
   - `GA_PROPERTY_ID` — GA4 property ID (e.g., `properties/123456789`)
   - `GA_SERVICE_ACCOUNT_KEY` — JSON service account key (base64 encoded) or path to credentials file

## Setup Steps (Google Side)

1. Create a Google Analytics 4 property at analytics.google.com
2. Add the GA4 measurement ID (G-XXXXXXXXXX) to the site
3. Create a Google Cloud project
4. Enable the Google Analytics Data API
5. Create a service account and download JSON key
6. Grant the service account "Viewer" role on the GA4 property
7. Add credentials to `.env.local`

## Open Questions

- **Caching:** Should we cache GA4 responses? (e.g., 5-minute ISR or in-memory cache to avoid hitting API quotas)
- **Fallback:** What to show when GA4 has no data yet (first few days after setup)? Suggestion: show "Дані збираються..." message
- **Loading state:** Show skeleton/shimmer while fetching, or keep static until data loads?

## Data Flow

```
User visits site → gtag.js sends page_view to GA4
                                    ↓
Admin opens dashboard → TrafficSources component
                                    ↓
                    fetch('/api/admin/traffic-sources?period=7d')
                                    ↓
                    API route → GA4 Data API (service account)
                                    ↓
                    Returns: [{ source: "Organic Search", sessions: 450, percent: 45 }, ...]
                                    ↓
                    Renders progress bars with real percentages
```

## Scope

**In scope:**
- gtag.js setup in Next.js layout
- GA4 Data API integration via API route
- Updated TrafficSources component with real data
- Period selector (7d / 30d / 90d)
- Admin auth protection on the API route

**Out of scope:**
- UTM parameter tracking/custom dimensions
- Real-time analytics
- Other GA4 reports (geography, devices, etc.)
- Custom event tracking beyond page views
