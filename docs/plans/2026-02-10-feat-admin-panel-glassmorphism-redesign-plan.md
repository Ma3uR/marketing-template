---
title: "feat: Admin Panel Glassmorphism UI Redesign"
type: feat
date: 2026-02-10
---

# Admin Panel Glassmorphism UI Redesign

## Overview

Full visual redesign of the admin panel from the current gray-800 sidebar layout to a modern glassmorphism design with floating top navbar, animated charts, KPI cards with trends, and a rose/purple color scheme. All existing Supabase backend logic, auth flow, and data queries are preserved — this is a UI-layer replacement.

## Problem Statement / Motivation

The current admin panel uses a basic dark theme with simple stats cards and a sidebar. The new design elevates the UI with:
- Glassmorphism cards with blur and gradient overlays
- Floating top navbar (replacing sidebar) with animated active tab
- Real-time sales charts via recharts
- Richer KPI cards with trend indicators and progress bars
- Mobile bottom navigation bar
- More polished tables, filters, and status badges

## Current State

| Area | Current Implementation |
|------|----------------------|
| **Layout** | Sidebar (`Sidebar.tsx`) + `flex` main content |
| **Navigation** | Sidebar with links, mobile hamburger slide-in |
| **Dashboard** | 4 StatsCards (server-rendered), recent orders table |
| **Orders** | Table with pagination (bug: uses `onPageChange` callback, never wired), search + status filter |
| **Email Templates** | List layout with links to editor |
| **Email Editor** | Side-by-side editor + preview, client-side Supabase CRUD |
| **Login** | Single OTP input field, Supabase auth |
| **Styling** | `bg-gray-800/50`, `border-gray-700`, purple accents |

## Proposed Solution

Replace all admin UI components with the new glassmorphism design while keeping:
- Server components for data fetching (dashboard page, orders page, emails page)
- Client components for interactivity (login, navbar, email editor, orders filter)
- Supabase queries unchanged
- Auth middleware unchanged

### Key Changes

1. **Install `recharts`** — new dependency for dashboard charts
2. **Replace sidebar with floating top navbar** — animated tab indicator via framer-motion `layoutId`
3. **Create shared `GlassCard` component** — reusable glassmorphism container
4. **Create `StatusPill` component** — status badges with icons (replacing inline status spans)
5. **Create `KPICard` component** — dashboard cards with trends, animated progress bars
6. **Add `SalesChart` client component** — AreaChart with real Supabase order data aggregated by day
7. **Redesign all pages** — apply glassmorphism styling throughout
8. **Fix pagination** — convert to URL-based `<Link>` navigation (fixing existing bug)
9. **Add mobile bottom nav bar** — fixed bottom navigation for mobile

## Technical Approach

### Architecture

The Next.js App Router server/client component split stays the same:

```
Server Components (data fetching):
├── src/app/admin/layout.tsx         — auth check + new navbar layout
├── src/app/admin/page.tsx           — dashboard with stats + chart data
├── src/app/admin/orders/page.tsx    — orders with pagination
├── src/app/admin/emails/page.tsx    — email templates list
└── src/app/admin/emails/[slug]/page.tsx — single template

Client Components (interactivity):
├── src/components/admin/AdminNavbar.tsx    — NEW: floating top navbar
├── src/components/admin/MobileBottomNav.tsx — NEW: mobile bottom bar
├── src/components/admin/GlassCard.tsx      — NEW: reusable glass card
├── src/components/admin/StatusPill.tsx     — NEW: status badge with icon
├── src/components/admin/KPICard.tsx        — REPLACE: StatsCard.tsx
├── src/components/admin/SalesChart.tsx     — NEW: recharts AreaChart
├── src/components/admin/TrafficSources.tsx — NEW: static traffic sources
├── src/components/admin/OrdersTable.tsx    — REDESIGN: glassmorphism + fix pagination
├── src/components/admin/OrdersFilter.tsx   — REDESIGN: glassmorphism styling
├── src/components/admin/EmailEditor.tsx    — REDESIGN: glassmorphism + mobile preview toggle
└── src/app/admin/login/page.tsx           — REDESIGN: glassmorphism + OTP digit inputs
```

### Files to DELETE

- `src/components/admin/Sidebar.tsx` — replaced by `AdminNavbar.tsx`
- `src/components/admin/StatsCard.tsx` — replaced by `KPICard.tsx`

### New Supabase Query: Chart Data

The dashboard needs order data aggregated by day for the sales chart. Add to `src/app/admin/page.tsx`:

```typescript
// Aggregate approved orders by day (last 7 days)
const { data: chartData } = await supabase
  .from('orders')
  .select('amount, created_at')
  .eq('status', 'Approved')
  .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: true });
```

Then group client-side by day using `date-fns` `format()` and sum amounts per day.

### Implementation Phases

#### Phase 1: Foundation (shared components + dependencies)

- [x] Install `recharts` dependency
- [x] Create `src/components/admin/GlassCard.tsx` — reusable glassmorphism card with optional `hover` prop
- [x] Create `src/components/admin/StatusPill.tsx` — status badge with icon, color, and Ukrainian label
- [x] Create `src/components/admin/KPICard.tsx` — metric card with title, value, trend arrow, icon, gradient color, animated progress bar

**Files:**
- `src/components/admin/GlassCard.tsx` (new)
- `src/components/admin/StatusPill.tsx` (new)
- `src/components/admin/KPICard.tsx` (new, replaces StatsCard.tsx)

#### Phase 2: Navigation Overhaul

- [x] Create `src/components/admin/AdminNavbar.tsx` — floating top navbar with:
  - Logo section (STUDIO.ADMIN branding)
  - Desktop tabs with framer-motion `layoutId` animated indicator
  - User info section (email, avatar via dicebear)
  - Logout button using Supabase `signOut()`
  - Mobile hamburger menu toggle
- [x] Create `src/components/admin/MobileBottomNav.tsx` — fixed bottom bar with icon buttons for Dashboard, Orders, Email Templates
- [x] Update `src/app/admin/layout.tsx`:
  - Remove `AdminSidebar` import
  - Add `AdminNavbar` + `MobileBottomNav`
  - Change layout from `flex` (sidebar) to vertical with `pt-32 pb-20` content spacing
  - Add decorative background gradient blobs (fixed, pointer-events-none)
  - Pass `userEmail` to navbar
- [x] Delete `src/components/admin/Sidebar.tsx`

**Files:**
- `src/components/admin/AdminNavbar.tsx` (new)
- `src/components/admin/MobileBottomNav.tsx` (new)
- `src/app/admin/layout.tsx` (edit)
- `src/components/admin/Sidebar.tsx` (delete)

#### Phase 3: Dashboard Redesign

- [x] Create `src/components/admin/SalesChart.tsx` — client component wrapping recharts `AreaChart`:
  - Accepts `data: { name: string; value: number }[]`
  - Rose gradient fill, custom tooltip with glassmorphism style
  - Week/Month toggle (visual only for now)
- [x] Create `src/components/admin/TrafficSources.tsx` — static traffic sources display with progress bars
- [x] Update `src/app/admin/page.tsx`:
  - Add chart data query (aggregate orders by day, last 7 days)
  - Replace `StatsCard` with `KPICard` (4 cards: revenue, orders, approved, conversion)
  - Add `SalesChart` in 2/3 width `GlassCard`
  - Add `TrafficSources` in 1/3 width `GlassCard`
  - Redesign recent orders section with glassmorphism table (avatar initials, StatusPill)
- [x] Delete `src/components/admin/StatsCard.tsx`

**Files:**
- `src/components/admin/SalesChart.tsx` (new)
- `src/components/admin/TrafficSources.tsx` (new)
- `src/app/admin/page.tsx` (edit)
- `src/components/admin/StatsCard.tsx` (delete)

#### Phase 4: Orders Page Redesign

- [x] Update `src/components/admin/OrdersFilter.tsx`:
  - Glassmorphism input styling (`bg-white/5 border-white/10 rounded-2xl`)
  - Larger search input with rose focus ring
  - Replace `<select>` with styled filter button (or keep select with new styling)
  - Add "Export CSV" button (visual only)
- [x] Update `src/components/admin/OrdersTable.tsx`:
  - Use `GlassCard` wrapper with `p-0`
  - Use `StatusPill` component for status display
  - Fix pagination: replace `onPageChange` callback with `<Link>` elements using URL params
  - Add header row showing "Показано X-Y з Z замовлень"
  - Add order reference column with monospace rose-colored text
  - Add email column
  - Glassmorphism row hover states

**Files:**
- `src/components/admin/OrdersFilter.tsx` (edit)
- `src/components/admin/OrdersTable.tsx` (edit)
- `src/app/admin/orders/page.tsx` (minor styling edits)

#### Phase 5: Email Templates Redesign

- [x] Update `src/app/admin/emails/page.tsx`:
  - Switch from list layout to grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  - Add "create new" dashed border card as first grid item
  - Each template card: `GlassCard` with mail icon, active/draft badge, variable tags, edit/delete buttons
  - Update header with gradient "Створити шаблон" button
- [x] Update `src/components/admin/EmailEditor.tsx`:
  - Apply glassmorphism to all form inputs and containers
  - Add desktop/mobile preview toggle (width constraint toggle)
  - Add browser chrome to preview (traffic light dots, "Email Preview Mode" label)
  - Rose/fuchsia gradient save button
  - Variable buttons with glassmorphism styling
- [x] Update `src/app/admin/emails/[slug]/page.tsx`:
  - Minor layout adjustments to match new design

**Files:**
- `src/app/admin/emails/page.tsx` (edit)
- `src/components/admin/EmailEditor.tsx` (edit)
- `src/app/admin/emails/[slug]/page.tsx` (edit)

#### Phase 6: Login Page Redesign

- [x] Update `src/app/admin/login/page.tsx`:
  - Background: `bg-[#0f0a1f]` with large blurred gradient circles
  - `GlassCard` container (`max-w-md`, `py-12 px-10`)
  - Rose/fuchsia gradient icon block at top
  - Individual OTP digit inputs (6 separate inputs with auto-focus-next)
  - Rose-to-fuchsia gradient submit button
  - AnimatePresence for step transitions (email → OTP)
  - Keep all Supabase auth logic unchanged

**Files:**
- `src/app/admin/login/page.tsx` (edit)

## Acceptance Criteria

### Functional Requirements

- [ ] All admin pages render with new glassmorphism design
- [ ] Navigation uses floating top navbar on desktop, bottom bar + hamburger on mobile
- [ ] Dashboard shows real sales chart data from Supabase orders
- [ ] KPI cards display real stats with trend indicators
- [ ] Orders pagination works via URL params (no broken callbacks)
- [ ] Email templates display in grid card layout
- [ ] Email editor has desktop/mobile preview toggle
- [ ] Login OTP flow works with individual digit inputs
- [ ] Logout works from navbar
- [ ] All existing Supabase queries return same data
- [ ] Auth middleware unchanged — protected routes still work

### Non-Functional Requirements

- [ ] No layout shift on page transitions (framer-motion animations)
- [ ] Mobile responsive on all pages (tested at 375px, 768px, 1024px, 1440px)
- [x] No TypeScript errors (`npm run build` passes)
- [x] No ESLint errors (`npm run lint` passes)

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| `recharts` SSR — recharts doesn't support server rendering | Use `'use client'` directive on `SalesChart.tsx`; keep data fetching in server component, pass as props |
| framer-motion `layoutId` across routes | The `layoutId` for active tab works within the client navbar component — it doesn't cross route boundaries |
| Large client bundle from recharts | recharts is tree-shakeable; only import `AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer` |
| Traffic sources has no real data | Use static/mock data with a note for future analytics integration |
| OTP individual inputs — paste handling | Implement paste handler that splits pasted code across all 6 inputs |

## Success Metrics

- All pages visually match the provided design reference
- Build succeeds without errors
- Auth flow works end-to-end (login → dashboard → logout)
- Charts render with real order data from Supabase

## References

### Internal References

- Current dashboard page: `src/app/admin/page.tsx`
- Current layout: `src/app/admin/layout.tsx`
- Current sidebar: `src/components/admin/Sidebar.tsx`
- Current orders table: `src/components/admin/OrdersTable.tsx`
- Current email editor: `src/components/admin/EmailEditor.tsx`
- Current login: `src/app/admin/login/page.tsx`
- Database types: `src/types/database.ts`
- Supabase server client: `src/lib/supabase/server.ts`
- Supabase browser client: `src/lib/supabase/client.ts`
- Auth middleware: `src/middleware.ts`
- Tailwind config (already has matching colors): `tailwind.config.ts`

### Design Reference

- The user-provided `MarketingDashboard` React component serves as the visual reference for all pages
