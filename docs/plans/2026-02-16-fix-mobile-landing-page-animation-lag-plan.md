---
title: Fix Mobile Landing Page Animation Lag
type: fix
date: 2026-02-16
---

# Fix Mobile Landing Page Animation Lag

## Overview

The landing page is laggy on mobile devices due to heavy always-running animations that are not optimized for mobile GPUs. The fix targets the four root causes while keeping all section entrance animations intact (they're already performant with `viewport={{ once: true }}`).

## Problem Statement

`src/components/MarketingCourseLanding.tsx` runs identical animations on all devices. Four specific animations cause mobile lag:

| # | Animation | Lines | Why It's Expensive |
|---|---|---|---|
| 1 | Figure-eight radial gradient overlay | 268-285 | Infinite 13-keyframe loop on `position: fixed` full-viewport element |
| 2 | Two `blur-[120px]` background blobs with parallax | 289-298 | `useScroll` + `useTransform` firing every scroll frame + massive GPU blur kernel |
| 3 | Floating ROI/Leads cards | 456-492 | Two `repeat: Infinity` bounce loops always running |
| 4 | Unthrottled scroll listener | 93-97 | `setIsScrolled()` called on every scroll event without `passive: true` or guard |

**Not the problem:** Section entrance animations (`whileInView` + `once: true`) fire once and stop — these stay unchanged.

## Proposed Solution

Create a `useIsMobile()` hook and conditionally disable/simplify the four offenders on mobile (< 768px) and when `prefers-reduced-motion: reduce` is active.

## Acceptance Criteria

- [ ] No infinite/continuous animations run on mobile (< 768px)
- [ ] No infinite/continuous animations run when `prefers-reduced-motion: reduce` is set
- [ ] Background visual tone is preserved on mobile (static gradient + blobs without blur/parallax)
- [ ] Section entrance animations (`whileInView`) remain unchanged on all devices
- [ ] No React hydration mismatch warnings
- [ ] Scroll listener uses `{ passive: true }` and guards against redundant state updates

## Technical Approach

### 1. Create `useIsMobile` hook

**File:** `src/hooks/useIsMobile.ts`

```typescript
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
```

- Returns `false` during SSR (safe default — server renders desktop version)
- Listens for resize/orientation changes dynamically
- Uses 768px to match existing Tailwind `md:` breakpoint used for nav toggle

### 2. Create `usePrefersReducedMotion` hook

**File:** `src/hooks/usePrefersReducedMotion.ts`

```typescript
import { useState, useEffect } from 'react';

export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

### 3. Extract `BackgroundEffects` component

**File:** `src/components/BackgroundEffects.tsx`

Extracting to a separate component solves the conditional `useScroll()` / `useTransform()` hooks problem (React prohibits conditional hook calls, but we can conditionally render different components).

```
<BackgroundEffects shouldAnimate={boolean} />
  ├── if shouldAnimate=true:  motion.div with figureEightPath + parallax blobs with blur-[120px]
  └── if shouldAnimate=false: static div with gradient at (0%, 0%) + blobs without blur/parallax
```

- **Figure-eight gradient:** Render as static `div` at initial position on mobile (preserves color warmth)
- **Blobs:** Render as plain `div` without `blur-[120px]` and without parallax `style={{ y: backgroundY }}`
- `useScroll()` and `useTransform()` only called inside the animated branch

### 4. Conditionally disable floating cards bounce

In `MarketingCourseLanding.tsx`, for the ROI and Leads floating cards:

```tsx
// Before (always bouncing)
<motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} />

// After (static on mobile)
<motion.div animate={shouldAnimate ? { y: [0, -10, 0] } : undefined}
  transition={shouldAnimate ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined} />
```

### 5. Fix scroll listener

```typescript
// Before
const handleScroll = () => setIsScrolled(window.scrollY > 20);
window.addEventListener('scroll', handleScroll);

// After
const handleScroll = () => {
  const scrolled = window.scrollY > 20;
  setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
};
window.addEventListener('scroll', handleScroll, { passive: true });
```

## Implementation Checklist

- [ ] Create `src/hooks/useIsMobile.ts`
- [ ] Create `src/hooks/usePrefersReducedMotion.ts`
- [ ] Extract `src/components/BackgroundEffects.tsx` from lines 250-300 of `MarketingCourseLanding.tsx`
- [ ] Wire `shouldAnimate = !isMobile && !prefersReducedMotion` in `MarketingCourseLanding.tsx`
- [ ] Conditionally disable floating card bounce animations
- [ ] Fix scroll listener with `passive: true` + state guard
- [ ] Verify no hydration mismatch warnings in console
- [ ] Manual test on mobile viewport (Chrome DevTools + 4x CPU throttle)

## References

- Framer Motion `useScroll`: https://www.framer.com/motion/use-scroll/
- `prefers-reduced-motion` MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- WCAG 2.1 SC 2.3.3 (Animation from Interactions)
- Main file: `src/components/MarketingCourseLanding.tsx`
