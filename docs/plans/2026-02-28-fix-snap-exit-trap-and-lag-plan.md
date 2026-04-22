---
title: "fix: Snap exit trap and perceived lag in CourseDetailsSection"
type: fix
status: superseded
date: 2026-02-28
---

# fix: Snap exit trap and perceived lag in CourseDetailsSection

> Superseded by `docs/plans/2026-04-22-001-refactor-course-details-drop-scroll-driven-plan.md` — the scroll-driven sticky component was replaced with plain stacked sections, so the snap mechanism this plan tried to fix has been removed entirely.

## Problem Statement

The JS-based snap mechanism in `CourseDetailsSection` traps the user at the last section (USP, snap point 0.75). When scrolling past it, the snap fires and pulls them BACK to 0.75 because it's the nearest snap point. The exit threshold is `progress > 0.92`, requiring ~51vh of uninterrupted scrolling to escape — practically impossible without 3-4 scroll gestures.

**Root cause:** The snap logic treats the zone between the last snap point (0.75) and exit threshold (0.92) the same as zones between snap points. Any pause in this zone triggers a snap back to 0.75.

The same issue exists at entry: scrolling between 0 and 0.03 (dead zone) works, but between 0.03 and ~0.125 the snap pulls back to 0.

**Perceived lag:** The snap animation (`scrollTo({ behavior: 'smooth' })`) fighting the user's scroll intent creates a janky, unresponsive feel.

## Proposed Solution

### Fix 1: Don't snap past the last snap point or before the first

Replace the fixed boundary check with dynamic boundaries based on actual snap points:

```tsx
// src/components/CourseDetailsSection.tsx — snapToNearest()

// BEFORE:
if (progress <= 0 || progress > 0.92) return;

// AFTER: only snap BETWEEN snap points, not past the last or before the first
const firstSnap = SNAP_POINTS[0];
const lastSnap = SNAP_POINTS[SNAP_POINTS.length - 1];
if (progress <= firstSnap || progress > lastSnap + 0.03) return;
```

This means:
- At progress 0.78+ → no snap → user exits freely
- At progress 0 → no snap → user enters freely
- Between 0.03 and 0.72 → snap to nearest section (normal behavior)
- Within 0.03 of any snap point → dead zone, already there

### Fix 2: Track scroll direction to prevent fighting user intent

Add direction awareness so the snap doesn't fight the user when they're actively scrolling in one direction:

```tsx
// src/components/CourseDetailsSection.tsx

// Track last progress to detect direction
const lastProgress = useRef(0);

const snapToNearest = () => {
  const progress = scrollYProgress.get();
  const direction = progress - lastProgress.current; // positive = scrolling down
  lastProgress.current = progress;

  // If user just scrolled, don't snap in the opposite direction
  // Only snap if the nearest point is in the direction they were scrolling
  // OR if they're genuinely stopped between sections
};
```

### Fix 3: Reduce snap aggressiveness for smoother feel

- Only snap when the user has clearly stopped (not just paused)
- Increase debounce from 200ms to 300ms for non-scrollend browsers
- This gives the user more time to "complete" their scroll gesture before snap kicks in

## Acceptance Criteria

- [x] User can exit the section after the last panel (USP) with a single scroll gesture
- [x] User can enter the section without being snapped back
- [x] Snapping still works between panels (0→0.25→0.50→0.75)
- [x] No perceived lag or "fighting" with scroll
- [x] Side dots still work correctly
- [x] Lint passes

## Implementation Checklist

### Files to modify:

- [x] `src/components/CourseDetailsSection.tsx`
  - Replace fixed boundary check with snap-point-relative boundaries
  - Add scroll direction tracking to prevent fighting user intent
  - Increase fallback debounce from 200ms to 300ms
