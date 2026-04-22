---
title: "fix: Course details section curriculum overflow and snap bugs"
type: fix
status: superseded
date: 2026-02-28
---

# fix: Course details section curriculum overflow and snap bugs

> Superseded by `docs/plans/2026-04-22-001-refactor-course-details-drop-scroll-driven-plan.md` — the scroll-driven sticky component was replaced with plain stacked sections, so the overflow and snap issues this plan patched no longer exist.

## Overview

The sticky scroll-driven `CourseDetailsSection` has content overflow issues (Curriculum panel's 7 modules don't fit in viewport on mobile, last items invisible) and the JS-based snap mechanism is unreliable. Fix the layout to guarantee content fits, and improve snap behavior.

## Problem Statement

1. **Curriculum overflow**: 7 modules at ~64px each + heading (~90px) + gaps (48px) + padding (32px) = ~618px. iPhone SE available height after header: ~603px. Last 1-2 modules are clipped by `overflow-hidden`.
2. **Centering clips content**: `SectionContent` uses `flex items-center justify-center` — when content exceeds container height, it centers the overflow, clipping both top and bottom equally. The bottom items become invisible.
3. **Snap unreliability**: The 150ms debounce + 1000ms cooldown causes missed snaps, double-snaps, and fights user scroll intent at section boundaries.

## Proposed Solution

### Fix 1: Curriculum layout — fit within viewport

Change curriculum from single-column list to a **2-column grid on desktop** and **more compact items on mobile**:

```tsx
// src/components/CourseDetailsSection.tsx — Curriculum panel

// BEFORE: single column, tall
<div className="space-y-2 md:space-y-4 max-w-4xl mx-auto w-full">

// AFTER: 2-column on md+, tighter mobile spacing
<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-5xl mx-auto w-full">
```

On desktop: 4 items left column, 3 items right column → ~4 rows × ~80px = ~320px + heading = well within bounds.

On mobile single-column: reduce per-item height by:
- `py-2` instead of `py-3` (saves 8px × 7 = 56px)
- Smaller number font: `text-xl` instead of `text-2xl`
- Hide descriptions on mobile with `hidden md:block`

Estimated mobile height after fix: ~90px heading + 7 × (8+8+24 content) = ~370px + 48px gaps + 32px padding = **~540px** (fits in 603px).

### Fix 2: SectionContent centering — prevent clip

Replace `items-center justify-center` with safe centering that doesn't clip overflow:

```tsx
// BEFORE:
className="absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-8"

// AFTER — use overflow-y-auto + safe centering:
className="absolute inset-0 w-full h-full flex flex-col justify-center overflow-y-auto p-4 md:p-8"
```

The `overflow-y-auto` ensures that even if content overflows, it's scrollable within the panel rather than clipped. `flex-col justify-center` centers when content fits, allows scroll when it doesn't.

Note: remove `items-center` — the inner `max-w-6xl mx-auto` handles horizontal centering already.

### Fix 3: Snap mechanism improvements

- Use `scrollend` event (supported in all modern browsers) instead of debounced scroll for more reliable snap detection
- Fallback to debounced scroll (200ms instead of 150ms) for browsers without `scrollend`
- Reduce cooldown from 1000ms to 600ms — long enough to prevent double-snap, short enough to feel responsive
- Add a larger dead zone: don't snap if within 5% of a snap point (currently 2%)

```tsx
// src/components/CourseDetailsSection.tsx

useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const snapToNearest = () => {
    if (isSnapping.current || !outerRef.current) return;
    const progress = scrollYProgress.get();
    if (progress < 0.02 || progress > 0.92) return;

    const nearest = SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
    );

    if (Math.abs(progress - nearest) < 0.05) return; // Wider dead zone

    isSnapping.current = true;
    scrollToSnapPoint(nearest);
    setTimeout(() => { isSnapping.current = false; }, 600); // Shorter cooldown
  };

  // Prefer scrollend event (more reliable)
  const supportsScrollEnd = 'onscrollend' in window;

  if (supportsScrollEnd) {
    window.addEventListener('scrollend', snapToNearest);
  } else {
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(snapToNearest, 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  return () => {
    window.removeEventListener('scrollend', snapToNearest);
    window.removeEventListener('scroll', /* handleScroll */);
    clearTimeout(timeoutId);
  };
}, [scrollYProgress, scrollToSnapPoint]);
```

## Acceptance Criteria

- [x] All 7 curriculum modules visible on mobile (iPhone SE 375×667) without clipping
- [x] Curriculum uses 2-column grid on desktop (`md:grid-cols-2`)
- [x] SectionContent panels allow internal scroll if content overflows
- [x] Snap mechanism uses `scrollend` event when available
- [x] Snap dead zone increased to 3% to reduce false snaps
- [x] All 4 section panels still transition smoothly
- [x] Side dots still work correctly
- [x] Lint passes

## Implementation Checklist

### Files to modify:

- [x] `src/components/CourseDetailsSection.tsx`
  - Fix `SectionContent` centering: `overflow-y-auto`, remove `items-center`
  - Change curriculum layout to 2-column grid
  - Make curriculum items more compact on mobile (smaller padding, hide descriptions)
  - Improve snap: use `scrollend`, wider dead zone, shorter cooldown

### Files unchanged:
- `src/types/content.ts` — data shape unchanged
- `src/lib/content-defaults.ts` — defaults unchanged
- `src/components/MarketingCourseLanding.tsx` — no changes needed

## References

- Current component: `src/components/CourseDetailsSection.tsx`
- Original plan: `docs/plans/2026-02-25-feat-sticky-scroll-course-details-section-plan.md`
- MDN `scrollend` event: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event
