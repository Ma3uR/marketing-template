# Brainstorm: Sticky Scroll-Driven Course Details Section

**Date:** 2026-02-25
**Status:** Ready for planning
**Related files:** `src/components/MarketingCourseLanding.tsx`

## What We're Building

Replace 4 separate full-page sections (USP, Benefits, Target Audience, Curriculum) with a single **sticky scroll-driven section** that occupies one viewport height. As the user scrolls, the content transitions between sub-sections with smooth animations. Side navigation dots indicate progress.

### The Problem

- 4 sections each with ~96-128px vertical padding + headings + content = massive vertical scroll
- Each section feels like a disconnected island
- Too much scrolling fatigues the visitor before reaching the pricing/CTA

### The Solution

One pinned viewport-height container (~400vh scroll space) that cycles through:

1. **Benefits** ("Що ти отримаєш на курсі") — 6 cards, strongest selling point, shown first
2. **Curriculum** ("Програма курсу") — 7 numbered modules
3. **Target Audience** ("Для кого цей курс") — 4 persona cards
4. **USP** ("Чому обирають наш курс") — 3 trust-building cards, closing the sequence

## Why This Approach

- **Framer Motion `useScroll` + `useTransform`** — already in the project, no new dependencies
- GPU-accelerated, smooth on all devices
- Scroll progress maps directly to opacity/translate transforms
- Side dots update reactively based on scroll position

### Rejected alternatives:
- **CSS `scroll-timeline`** — Safari support still incomplete
- **GSAP ScrollTrigger** — new dependency (~45kb), license overhead

## Key Decisions

1. **Section order:** Benefits → Curriculum → Audience → USP (lead with value, close with trust)
2. **Animation tech:** Framer Motion `useScroll` + `useTransform` (already in stack)
3. **Mobile behavior:** Same scroll-driven experience on all devices (no fallback)
4. **Benefits is priority:** It's the strongest selling section, shown first and given visual prominence
5. **Navigation dots:** Vertical dots on the side showing which sub-section is active

## Implementation Notes

### Scroll Mechanics
- Outer container: `height: 400vh` (100vh per sub-section)
- Inner sticky container: `position: sticky; top: 0; height: 100vh`
- `useScroll({ target: outerRef })` tracks 0→1 progress
- Map progress ranges: 0-0.25 = Benefits, 0.25-0.5 = Curriculum, 0.5-0.75 = Audience, 0.75-1 = USP
- Each sub-section fades/slides in when entering its range, fades out when leaving

### Content Transitions
- Heading + subtitle crossfade between sections
- Cards animate with stagger (slide up + fade in)
- Outgoing content fades out + slides down
- Keep transitions fast (~300ms) to feel responsive

### Side Navigation Dots
- 4 dots, vertically stacked, fixed to the right side of the sticky container
- Active dot highlighted (filled), others dim (outline)
- Clickable — scroll to corresponding section range
- Labels on hover: "Benefits", "Program", "For Who", "Why Us"

### Card Layouts Per Section
- **Benefits (6 cards):** 2x3 grid on desktop, 2x3 on tablet, vertical scroll on mobile
- **Curriculum (7 modules):** Single column list, max-width, numbered badges
- **Audience (4 cards):** 2x2 grid on desktop, 2x2 on tablet, stacked on mobile
- **USP (3 cards):** 3-column row on desktop, stacked on mobile

### Existing Code Impact
- Remove 4 separate section blocks from `MarketingCourseLanding.tsx` (lines ~357-501)
- Replace with one `CourseDetailsSection` component
- All content types/interfaces remain unchanged
- Admin editing stays the same (same data shape)
- Framer Motion animations on individual cards replaced with scroll-driven transforms

## Open Questions

1. Should the section have a distinct background, or use the alternating transparent/semi-transparent pattern?
2. Exact transition style — fade only, or fade + directional slide?
3. Should mobile cards be smaller/condensed to fit viewport height, or allow internal scroll?

## Success Criteria

- All 4 sections compressed into 1 viewport-height visual area
- Smooth scroll-driven transitions at 60fps
- Side dots accurately reflect and control position
- No content loss — all cards, titles, descriptions preserved
- Works on mobile without jank
- Admin editing continues to work unchanged
