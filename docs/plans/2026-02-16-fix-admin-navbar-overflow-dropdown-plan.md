---
title: "Fix Admin Navbar Overflow with More Dropdown"
type: fix
date: 2026-02-16
---

# Fix Admin Navbar Overflow with More Dropdown

## Overview

The admin navbar overflows when all 6 navigation items + logo + user info are rendered in a single row. The last items (user avatar/email) get clipped on screens below ~1280px. Fix by showing only primary nav items inline and grouping secondary items behind a "More" dropdown.

## Problem Statement

Current navbar renders all 6 items inline at `md:` (768px+), but they don't fit until ~1400px+. The user info section gets pushed off-screen or overlaps, breaking the layout.

**Affected file:** `src/components/admin/AdminNavbar.tsx:56-78`

## Proposed Solution

Split `NAV_ITEMS` into two groups:

- **Primary (always visible):** Дашборд, Замовлення, Відгуки (3 most-used items)
- **Secondary (inside "More" dropdown):** Шаблони листів, Тарифи, Налаштування

Add a "More" button (`MoreHorizontal` icon from Lucide) that toggles a glassmorphic dropdown with the secondary items. Uses existing Framer Motion `AnimatePresence` pattern and click-outside-to-close.

### Breakpoint Strategy

| Screen | Behavior |
|--------|----------|
| `< md` (768px) | Hamburger menu (existing) + MobileBottomNav (existing) — no changes |
| `md` - `lg` | 3 primary items + "More" dropdown + logout button |
| `>= lg` (1024px) | 3 primary items + "More" dropdown + user info + logout |

## Acceptance Criteria

- [ ] Navbar never overflows or clips content at any screen width
- [ ] Primary items (Дашборд, Замовлення, Відгуки) always visible on `md:+`
- [ ] Secondary items (Шаблони листів, Тарифи, Налаштування) accessible via "More" dropdown
- [ ] Dropdown follows glassmorphism design: `bg-[rgba(26,13,46,0.95)] backdrop-blur-xl border-white/10 rounded-xl`
- [ ] Dropdown animates in/out with Framer Motion (fade + slide, matching existing mobile menu pattern)
- [ ] Click outside closes dropdown
- [ ] Active tab indicator (`layoutId="activeTab"`) works for both inline and dropdown items
- [ ] Active item in dropdown group shows rose highlight (matching MobileBottomNav pattern)
- [ ] "More" button shows visual indicator when a secondary item is active
- [ ] Mobile experience unchanged (hamburger + MobileBottomNav)
- [ ] No new dependencies added

## Technical Considerations

- **No external dropdown library** — build custom using existing `AnimatePresence` + `useRef` click-outside pattern
- **Active state indication on "More" button** — when user is on a secondary page (e.g., `/admin/settings`), the "More" button itself should have a subtle active indicator (e.g., dot or rose tint) so the user knows which section they're in
- **Z-index layering** — dropdown should be `z-50` or higher since navbar container is `z-50`
- **Keyboard accessibility** — dropdown should close on `Escape` key

## MVP

### `src/components/admin/AdminNavbar.tsx`

Key changes:

1. Split nav items into `PRIMARY_NAV_ITEMS` (first 3) and `SECONDARY_NAV_ITEMS` (last 3)
2. Render primary items inline (existing tab pattern)
3. Add "More" button with `MoreHorizontal` icon after primary items
4. Render `AnimatePresence` dropdown below "More" button with secondary items
5. Add `useRef` + `useEffect` for click-outside detection
6. Add `Escape` key handler

```tsx
// Split items
const PRIMARY_NAV_ITEMS = [
  { id: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { id: '/admin/orders', label: 'Замовлення', icon: ShoppingBag },
  { id: '/admin/reviews', label: 'Відгуки', icon: Star },
] as const;

const SECONDARY_NAV_ITEMS = [
  { id: '/admin/emails', label: 'Шаблони листів', icon: Mail },
  { id: '/admin/pricing', label: 'Тарифи', icon: CreditCard },
  { id: '/admin/settings', label: 'Налаштування', icon: Settings },
] as const;

// "More" dropdown with glassmorphic styling
<div className="relative" ref={moreDropdownRef}>
  <button onClick={() => setIsMoreOpen(!isMoreOpen)} ...>
    <MoreHorizontal />
  </button>
  <AnimatePresence>
    {isMoreOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full right-0 mt-2 w-56 bg-[rgba(26,13,46,0.95)] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      >
        {SECONDARY_NAV_ITEMS.map((item) => (
          <Link key={item.id} href={item.id} ...>
            <item.icon />
            {item.label}
          </Link>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

No changes needed to:
- `src/components/admin/MobileBottomNav.tsx` — keeps all 6 items as icon-only (no overflow issue)
- `src/app/admin/layout.tsx` — no structural changes

## References

- Existing mobile menu animation: `AdminNavbar.tsx:113-140`
- Glassmorphism formula: `bg-[rgba(26,13,46,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl`
- Active tab pattern: `AdminNavbar.tsx:65-71` (`layoutId="activeTab"`)
- Click-outside pattern: standard `useRef` + `mousedown` listener
