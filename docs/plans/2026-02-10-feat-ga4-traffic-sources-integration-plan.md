---
title: "feat: GA4 Traffic Sources Integration"
type: feat
date: 2026-02-10
brainstorm: docs/brainstorms/2026-02-10-ga4-traffic-sources-brainstorm.md
---

# feat: GA4 Traffic Sources Integration

## Overview

Replace the hardcoded mock data in the admin "Джерела трафіку" block with real traffic source data from Google Analytics 4. Add gtag.js tracking to the public site, create a server-side API route that queries the GA4 Data API via service account, and update the `TrafficSources` component with a selectable time period (7d / 30d / 90d).

## Problem Statement / Motivation

The `TrafficSources` component (`src/components/admin/TrafficSources.tsx`) currently renders static hardcoded data — five fixed sources with fixed percentages. The glassmorphism redesign plan explicitly noted this as a placeholder: "Use static/mock data with a note for future analytics integration." This feature makes it functional.

## Proposed Solution

### Architecture

```
Public site visitors                          Admin dashboard
       │                                            │
       ▼                                            ▼
  gtag.js fires page_view ──► GA4 property    TrafficSources component
                                                    │
                                              fetch('/api/admin/traffic-sources?period=7d')
                                                    │
                                                    ▼
                                          API Route (auth + cache)
                                                    │
                                                    ▼
                                          GA4 Data API (runReport)
                                          dim: sessionDefaultChannelGroup
                                          metric: sessions
                                                    │
                                                    ▼
                                          Top 5 channels + "Others"
                                          as percentages → JSON response
```

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| GA4 dimension | `sessionDefaultChannelGroup` | Session-level attribution, standard for traffic analysis |
| GA4 metric | `sessions` | Most common metric for traffic source breakdown |
| Auth library | `google-auth-library` | Official Google package, ~500KB, lighter than full `googleapis` (~3MB) |
| Date range | `NdaysAgo` → `yesterday` | Complete days only, avoids partial-day data inconsistency |
| Caching | 5-min in-memory cache per period | GA4 data has 24-48h processing lag; avoids burning API quota (200K tokens/day) |
| Colors | Fixed map by channel group name | Stable colors across period changes (Organic Search = always blue) |
| Channel labels | English GA4 names as-is | Industry-standard terms Ukrainian marketers understand |
| SPA tracking | `usePathname()` + `useEffect()` fires `gtag('event', 'page_view')` | App Router uses soft navigations; without this, only initial hard load is tracked |

## Implementation Phases

### Phase 1: Environment & Dependencies

**Files to create/modify:**

- `package.json` — add `google-auth-library` dependency
- `.env.example` — add GA4 variables with comments

**New environment variables:**

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # GA4 Measurement ID (from GA4 > Admin > Data Streams)
GA_PROPERTY_ID=123456789                     # GA4 Property ID (numeric, from GA4 > Admin > Property Settings)
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Install:**

```bash
pnpm add google-auth-library
```

---

### Phase 2: gtag.js Tracking Setup

**Files to create/modify:**

- `src/components/GoogleAnalytics.tsx` — new client component
- `src/app/layout.tsx` — import and render GoogleAnalytics

**`src/components/GoogleAnalytics.tsx`** (new file):

A `'use client'` component that:
1. Renders the gtag.js `<Script>` tag (from `next/script`, `strategy="afterInteractive"`)
2. Initializes the `dataLayer` and `gtag('config', measurementId)`
3. Tracks SPA navigations via `usePathname()` + `useEffect()` that fires `gtag('event', 'page_view', { page_path })` on route changes
4. Only renders when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (graceful no-op otherwise)

```tsx
// src/components/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    window.gtag('event', 'page_view', { page_path: pathname });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
```

Note: `send_page_view: false` in config because we manually fire page views in the `useEffect` to properly track SPA navigations.

**`src/app/layout.tsx`** — add `<GoogleAnalytics />` inside `<body>`:

```tsx
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

// ... existing layout code ...
<body>
  <GoogleAnalytics />
  {children}
</body>
```

**Type declaration** — add `gtag` to window (in a `.d.ts` or inline):

```typescript
// src/types/gtag.d.ts
interface Window {
  gtag: (...args: unknown[]) => void;
  dataLayer: Record<string, unknown>[];
}
```

---

### Phase 3: GA4 Data API Library

**Files to create:**

- `src/lib/google-analytics.ts` — GA4 Data API client

This module:
1. Authenticates with Google using service account credentials via `google-auth-library`
2. Handles the private key newline escaping: `process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n')`
3. Calls `POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport`
4. Implements a 5-minute in-memory cache keyed by period
5. Transforms response into `{ source: string; sessions: number; percent: number }[]`

```typescript
// src/lib/google-analytics.ts
import { GoogleAuth } from 'google-auth-library';

export type TrafficSource = {
  source: string;
  sessions: number;
  percent: number;
};

type Period = '7d' | '30d' | '90d';

const PERIOD_MAP: Record<Period, string> = {
  '7d': '7daysAgo',
  '30d': '30daysAgo',
  '90d': '90daysAgo',
};

// Simple in-memory cache: { [period]: { data, timestamp } }
const cache = new Map<string, { data: TrafficSource[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getAuth() {
  return new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
}

export async function getTrafficSources(period: Period): Promise<TrafficSource[]> {
  const cached = cache.get(period);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const auth = getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const propertyId = process.env.GA_PROPERTY_ID;
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: PERIOD_MAP[period], endDate: 'yesterday' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '20',
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GA4 API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const rows = data.rows || [];

  // Calculate total sessions
  const totalSessions = rows.reduce(
    (sum: number, row: { metricValues: { value: string }[] }) =>
      sum + parseInt(row.metricValues[0].value, 10), 0
  );

  if (totalSessions === 0) return [];

  // Take top 5, aggregate rest as "Others"
  const top5 = rows.slice(0, 5).map((row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => {
    const sessions = parseInt(row.metricValues[0].value, 10);
    return {
      source: row.dimensionValues[0].value,
      sessions,
      percent: Math.round((sessions / totalSessions) * 100),
    };
  });

  const othersSum = rows.slice(5).reduce(
    (sum: number, row: { metricValues: { value: string }[] }) =>
      sum + parseInt(row.metricValues[0].value, 10), 0
  );

  const result = othersSum > 0
    ? [...top5, { source: 'Others', sessions: othersSum, percent: Math.round((othersSum / totalSessions) * 100) }]
    : top5;

  cache.set(period, { data: result, ts: Date.now() });
  return result;
}
```

---

### Phase 4: Admin API Route

**Files to create:**

- `src/app/api/admin/traffic-sources/route.ts`

**Auth pattern** — replicate from `src/app/api/send-email/route.ts`:

```typescript
// src/app/api/admin/traffic-sources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTrafficSources } from '@/lib/google-analytics';

export async function GET(request: NextRequest) {
  // 1. Auth check (same pattern as send-email route)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Parse period param
  const period = request.nextUrl.searchParams.get('period') || '7d';
  if (!['7d', '30d', '90d'].includes(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  // 3. Fetch GA4 data
  try {
    const sources = await getTrafficSources(period as '7d' | '30d' | '90d');
    return NextResponse.json({ sources });
  } catch (err) {
    console.error('GA4 API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 502 }
    );
  }
}
```

**Note:** Using `GET` instead of `POST` since this is a read-only query with a simple param. The period comes from query string (`?period=7d`).

**Important:** This route is at `/api/admin/traffic-sources` but the middleware matcher only covers `/admin/:path*`. This route must self-authenticate (which it does above).

---

### Phase 5: Update TrafficSources Component

**Files to modify:**

- `src/components/admin/TrafficSources.tsx` — convert to client component with data fetching
- `src/app/admin/page.tsx` — update the GlassCard header to include the period selector

**Color map** — stable colors per GA4 channel group:

```typescript
const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': 'bg-blue-500',
  'Paid Search': 'bg-sky-500',
  'Direct': 'bg-emerald-500',
  'Referral': 'bg-amber-500',
  'Organic Social': 'bg-violet-500',
  'Paid Social': 'bg-rose-500',
  'Email': 'bg-cyan-500',
  'Display': 'bg-orange-500',
  'Affiliates': 'bg-lime-500',
  'Cross-network': 'bg-indigo-500',
  'Others': 'bg-gray-500',
};

// Fallback for unknown channels
const FALLBACK_COLORS = ['bg-pink-500', 'bg-teal-500', 'bg-red-500'];
```

**Component states:**

| State | Display |
|---|---|
| Loading | Skeleton pulsing bars (5 rows with `animate-pulse bg-white/5`) |
| Empty (no data) | "Дані за цей період відсутні" centered message |
| Error | "Не вдалося завантажити дані" with a subtle retry link |
| Success | Progress bars with real percentages |

**Period selector** — placed in the GlassCard header row next to the "Джерела трафіку" title, matching the existing SalesChart button style:

```tsx
// In src/app/admin/page.tsx, the GlassCard header becomes:
<div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-semibold text-white">Джерела трафіку</h3>
  {/* Period selector rendered by TrafficSources via a callback or integrated */}
</div>
```

The period selector uses the same pill-button pattern as the SalesChart section:
- Active: `bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs px-3 py-1`
- Inactive: `bg-white/5 text-gray-400 rounded-full text-xs px-3 py-1`
- Labels: `7д`, `30д`, `90д`

**Race condition handling** — use `AbortController`:

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic-sources?period=${period}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setSources(json.sources);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Не вдалося завантажити дані');
      }
    } finally {
      setLoading(false);
    }
  }

  fetchData();
  return () => controller.abort();
}, [period]);
```

---

### Phase 6: Update .env.example

**File to modify:**

- `.env.example` — add Google Analytics section

```bash
# Google Analytics 4
# Get Measurement ID from: GA4 > Admin > Data Streams > your stream
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# Get Property ID from: GA4 > Admin > Property Settings (numeric ID)
GA_PROPERTY_ID=123456789
# Service account for GA4 Data API access
# Create at: Google Cloud Console > IAM > Service Accounts
# Grant "Viewer" role on the GA4 property
GOOGLE_SERVICE_ACCOUNT_EMAIL=analytics@your-project.iam.gserviceaccount.com
# Paste the full private_key value from the JSON key file (keep the \n characters)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Acceptance Criteria

- [x] `gtag.js` loads on all public pages when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- [x] SPA navigations (client-side route changes) fire `page_view` events to GA4
- [x] `GoogleAnalytics` component is a no-op when env var is missing (no errors)
- [x] API route at `/api/admin/traffic-sources` returns real GA4 channel group data
- [x] API route rejects unauthenticated (401) and non-admin (403) requests
- [x] API route validates the `period` query param (only `7d`, `30d`, `90d`)
- [x] API route returns 502 with a message on GA4 API failure (not a crash)
- [x] TrafficSources component fetches and renders real data
- [x] Period selector (7д / 30д / 90д) updates the data on click
- [x] Loading state shows skeleton bars matching glassmorphism style
- [x] Empty state shows "Дані за цей період відсутні" message
- [x] Error state shows "Не вдалося завантажити дані" message
- [x] Top 5 sources shown with stable color mapping, rest as "Others"
- [x] Rapid period switching does not cause race conditions (AbortController)
- [x] GA4 responses are cached for 5 minutes server-side
- [x] Private key newline escaping handled (`replace(/\\n/g, '\n')`)
- [x] `.env.example` updated with all 4 new environment variables
- [x] `src/types/gtag.d.ts` declares `window.gtag` and `window.dataLayer`
- [x] No lint errors after all changes

## Technical Considerations

### Security
- Service account private key never exposed to client (server-only env var)
- API route self-authenticates (not covered by admin middleware matcher at `/admin/:path*`)
- No user PII flows through the GA4 integration

### Performance
- 5-minute in-memory cache prevents excessive GA4 API calls
- gtag.js loads with `afterInteractive` strategy (non-blocking)
- GA4 Data API quota: 200K tokens/day — caching keeps usage minimal

### Known Limitations
- Admin panel page views are tracked in GA4 (same root layout). Filtering them out is a future enhancement.
- GA4 data has a 24-48 hour processing lag — the "today" data is not included (we use `yesterday` as endDate)
- GDPR/cookie consent for GA4 tracking is out of scope — should be a separate follow-up task

## Dependencies & Risks

| Risk | Mitigation |
|---|---|
| Service account key newline escaping fails in production (Vercel/hosting) | Explicit `.replace(/\\n/g, '\n')` in code |
| GA4 API quota exhaustion | 5-min cache, only fetched on admin dashboard load |
| GA4 property has no data (new setup) | Empty state with "Дані за цей період відсутні" message |
| Google API downtime | 502 error response + error UI state with retry option |
| Race condition on rapid period switching | AbortController in useEffect cleanup |

## File Summary

| Action | File |
|---|---|
| **Create** | `src/components/GoogleAnalytics.tsx` |
| **Create** | `src/types/gtag.d.ts` |
| **Create** | `src/lib/google-analytics.ts` |
| **Create** | `src/app/api/admin/traffic-sources/route.ts` |
| **Modify** | `src/app/layout.tsx` — add GoogleAnalytics component |
| **Modify** | `src/components/admin/TrafficSources.tsx` — client component with real data |
| **Modify** | `src/app/admin/page.tsx` — update GlassCard header with period selector |
| **Modify** | `.env.example` — add GA4 env vars |
| **Modify** | `package.json` — add google-auth-library |

## References

- [GA4 Data API runReport](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport)
- [gtag.js setup](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Script component](https://nextjs.org/docs/app/api-reference/components/script)
- Existing auth pattern: `src/app/api/send-email/route.ts`
- Existing design pattern: `src/components/admin/GlassCard.tsx`, `src/components/admin/SalesChart.tsx`
- Brainstorm: `docs/brainstorms/2026-02-10-ga4-traffic-sources-brainstorm.md`
