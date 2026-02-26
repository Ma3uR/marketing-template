---
title: "feat: Sticky scroll-driven course details section"
type: feat
date: 2026-02-25
---

# feat: Sticky Scroll-Driven Course Details Section

## Overview

Replace 4 separate full-page sections (Benefits, Curriculum, Target Audience, USP) with a single sticky scroll-driven section. One viewport-height area transitions between sub-sections as the user scrolls, with animated side navigation dots. This reduces page length by ~75% for these sections and creates a cohesive, connected experience.

## Problem Statement / Motivation

The current layout stacks 4 independent sections vertically, each with ~96-128px padding, its own heading, and full card grids. This creates excessive scrolling (~4 screens worth) and each section feels disconnected. Visitors get fatigued before reaching pricing/CTA sections. The content itself is valuable — the problem is purely structural.

## Proposed Solution

A single `CourseDetailsSection` component that:

1. Creates a **400vh outer container** (100vh per sub-section)
2. Pins a **sticky inner container** at viewport height
3. Uses **Framer Motion `useScroll` + `useTransform`** to track scroll progress (0→1)
4. Maps progress ranges to opacity/translate transforms for each sub-section
5. Displays **side navigation dots** showing active sub-section

### Section Order (scroll progression)

| Progress | Section | Cards |
|----------|---------|-------|
| 0 – 0.25 | Benefits ("Що ти отримаєш на курсі") | 6 cards, 2×3 grid |
| 0.25 – 0.5 | Curriculum ("Програма курсу") | 7 modules, single column |
| 0.5 – 0.75 | Target Audience ("Для кого цей курс") | 4 cards, 2×2 grid |
| 0.75 – 1.0 | USP ("Чому обирають наш курс") | 3 cards, 3-column row |

## Technical Considerations

### Safari `overflow-x-hidden` Breaking Sticky

The root `<div>` at `MarketingCourseLanding.tsx:161` has `overflow-x-hidden`. On Safari, this implicitly creates `overflow-y: auto`, which breaks `position: sticky`. **Must replace with `overflow: clip`** (or `overflow-x: clip`) which clips overflow without creating a scroll container.

```tsx
// MarketingCourseLanding.tsx:161
// BEFORE:
<div className="... overflow-x-hidden ...">

// AFTER:
<div className="... [overflow-x:clip] ...">
```

### Content Overflow on Mobile (Critical)

Curriculum has 7 modules. At ~80px each + heading (~120px) + padding (~48px) = ~720px minimum. iPhone SE visible area after fixed header: ~600px.

**Solution:** Use `100dvh` (dynamic viewport height) for the sticky container. On mobile, compact the card layouts:
- Benefits: 2-column grid with smaller padding (`p-4` instead of `p-6`), smaller text
- Curriculum: Condensed list items with reduced spacing (`space-y-2`), smaller badges
- Audience: 2×2 grid with compact cards
- USP: Stacked with minimal padding

### Sticky Container Positioning

The fixed header is ~56-72px tall. The sticky container must account for this:

```tsx
<div className="sticky top-[72px] h-[calc(100dvh-72px)]">
```

Use a CSS variable or hardcoded value matching the header's scrolled height (`py-4` = ~56px). Safe value: `top-16` (64px) with `h-[calc(100dvh-4rem)]`.

### Anchor IDs for Navigation

Place invisible anchor `<div>` elements at calculated offsets within the 400vh container:

```tsx
// src/components/CourseDetailsSection.tsx
<div ref={outerRef} className="relative" style={{ height: '400vh' }}>
  <div id="benefits" className="absolute top-0" />
  <div id="curriculum" className="absolute top-[100vh]" />
  <div id="target-audience" className="absolute top-[200vh]" />

  <div className="sticky top-16 h-[calc(100dvh-4rem)]">
    {/* Content transitions here */}
  </div>
</div>
```

Existing `NavLink href="#benefits"` and `href="#curriculum"` continue working via `scroll-behavior: smooth`.

### Scroll Progress → Content Mapping

```tsx
// src/components/CourseDetailsSection.tsx
const outerRef = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({
  target: outerRef,
  offset: ["start start", "end end"]
});

// Each sub-section: fade in during first 15% of range, visible, fade out during last 15%
const benefitsOpacity = useTransform(scrollYProgress, [0, 0.03, 0.20, 0.25], [1, 1, 1, 0]);
const benefitsY = useTransform(scrollYProgress, [0, 0.03, 0.20, 0.25], [0, 0, 0, -30]);

const curriculumOpacity = useTransform(scrollYProgress, [0.20, 0.28, 0.45, 0.50], [0, 1, 1, 0]);
const curriculumY = useTransform(scrollYProgress, [0.20, 0.28, 0.45, 0.50], [30, 0, 0, -30]);

const audienceOpacity = useTransform(scrollYProgress, [0.45, 0.53, 0.70, 0.75], [0, 1, 1, 0]);
const audienceY = useTransform(scrollYProgress, [0.45, 0.53, 0.70, 0.75], [30, 0, 0, -30]);

const uspOpacity = useTransform(scrollYProgress, [0.70, 0.78, 1.0], [0, 1, 1]);
const uspY = useTransform(scrollYProgress, [0.70, 0.78, 1.0], [30, 0, 0]);
```

Overlapping ranges create smooth crossfade transitions (~5% overlap at each boundary).

### Active Dot Tracking

```tsx
const activeDot = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75], [0, 1, 2, 3]);
```

Dots rendered inside the sticky container (not `position: fixed`) at `z-30`. They naturally appear/disappear with the section.

### Side Dot Click → Programmatic Scroll

On dot click, calculate the target scroll position within the 400vh container and use `window.scrollTo()`. The global `scroll-behavior: smooth` handles animation:

```tsx
const handleDotClick = (index: number) => {
  if (!outerRef.current) return;
  const containerTop = outerRef.current.offsetTop;
  const containerHeight = outerRef.current.scrollHeight;
  const targetOffset = containerTop + (containerHeight * index * 0.25);
  window.scrollTo({ top: targetOffset, behavior: 'smooth' });
};
```

### URL Hash Management

Use `history.replaceState` (no history entry) to update the hash as the user scrolls through sub-sections. This allows sharing deep links without polluting the Back button:

```tsx
useMotionValueEvent(activeDot, "change", (latest) => {
  const hashes = ['#benefits', '#curriculum', '#target-audience', '#usp'];
  const rounded = Math.round(latest);
  history.replaceState(null, '', hashes[rounded]);
});
```

### Reduced Motion / Accessibility

- **`prefers-reduced-motion`:** Keep scroll-driven visibility (content swaps on scroll) but use instant opacity changes (no transition duration). User still scrolls through sections, they just swap instantly.
- **Screen readers:** All 4 sub-sections rendered in DOM simultaneously. Inactive sections get `aria-hidden="true"`. An `aria-live="polite"` region announces the active section heading.
- **Side dots:** `<nav aria-label="Course content sections">` wrapping `<button aria-label="Benefits" aria-current="true/false">` elements with visible focus rings.
- **Keyboard:** Dots are focusable `<button>` elements responding to Enter/Space.

### Performance

Animate at the **sub-section container level** (4 `motion.div` wrappers), not individual cards. Each sub-section's cards are static children — only the parent opacity/translateY is scroll-driven. This means 4 composited layers, not 20+.

## Acceptance Criteria

- [x] All 4 sections (Benefits, Curriculum, Audience, USP) consolidated into one `CourseDetailsSection` component
- [x] Sticky container pins to viewport while scrolling through 400vh outer container
- [x] Content transitions smoothly between sub-sections based on scroll progress
- [x] Side navigation dots show active sub-section, are clickable, and show labels on hover
- [x] `#benefits` and `#curriculum` header nav links still work correctly
- [x] Mobile layout fits within viewport height without content clipping (test on 375×667)
- [x] `overflow-x-hidden` replaced with `overflow-x: clip` on root div to fix Safari sticky
- [x] `prefers-reduced-motion` users get instant swaps (no animation) but scroll-driven behavior preserved
- [x] Screen reader accessible: `aria-hidden` on inactive sections, dots have `aria-label`
- [x] Admin editing continues to work — same content types, same data shape
- [x] 60fps scroll performance (4 composited layers, not per-card)
- [x] Lint passes after all changes

## Implementation Checklist

### Files to create:
- [x] `src/components/CourseDetailsSection.tsx` — new sticky scroll-driven component

### Files to modify:
- [x] `src/components/MarketingCourseLanding.tsx`
  - Replace `overflow-x-hidden` with `[overflow-x:clip]` on root div (line 161)
  - Remove 4 section blocks (lines ~357-501)
  - Remove `BenefitCardComponent` inline function (lines 57-81) — move to new component
  - Move icon arrays (`BENEFIT_ICONS`, `PERSONA_ICONS`, `USP_ICONS`) to new component
  - Add `<CourseDetailsSection>` in place of removed sections, passing content props

### Files unchanged:
- `src/types/content.ts` — all content types stay the same
- `src/lib/content.ts` — data fetching unchanged
- `src/lib/content-defaults.ts` — defaults unchanged
- `src/app/admin/settings/` — admin editing unchanged

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Safari `overflow-x-hidden` breaks sticky | Section doesn't pin at all | Replace with `overflow-x: clip` — test first |
| Content overflow on short mobile viewports | Cards clipped/invisible | Use `dvh`, compact mobile layout, test on iPhone SE |
| `scroll-behavior: smooth` conflicts with programmatic scroll | Janky double-animation | Use native `window.scrollTo({ behavior: 'smooth' })`, don't mix with Framer Motion scroll animation |
| Screen reader reads all 4 sections at once | Confusing for blind users | `aria-hidden` on inactive sections |
| Fast scroll causing transition "flicker" | Multiple sections briefly visible | Overlap zones in `useTransform` ranges handle this gracefully |

## References & Research

### Internal References
- Existing `useScroll` usage: `src/components/BackgroundEffects.tsx:17-18`
- Section blocks to replace: `src/components/MarketingCourseLanding.tsx:357-501`
- Content types: `src/types/content.ts:27-124`
- Icon arrays: `src/components/MarketingCourseLanding.tsx:83-85`
- Root div with overflow-x-hidden: `src/components/MarketingCourseLanding.tsx:161`
- Header nav anchors: `src/components/MarketingCourseLanding.tsx:183-187`
- Mobile menu anchors: `src/components/MarketingCourseLanding.tsx:213-217`
- Footer anchors: `src/components/MarketingCourseLanding.tsx:764`

### Brainstorm
- `docs/brainstorms/2026-02-25-sticky-scroll-sections-brainstorm.md`

### External References
- Framer Motion `useScroll` API: https://motion.dev/docs/react-use-scroll
- Framer Motion `useTransform` API: https://motion.dev/docs/react-use-transform
- CSS `overflow: clip` vs `hidden`: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
- Dynamic viewport units (`dvh`): https://developer.mozilla.org/en-US/docs/Web/CSS/length#dynamic
