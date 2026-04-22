---
title: "refactor: Replace scroll-driven CourseDetailsSection with plain stacked sections"
type: refactor
status: active
date: 2026-04-22
---

# refactor: Replace scroll-driven CourseDetailsSection with plain stacked sections

## Overview

`CourseDetailsSection` is the only scroll-hijacking component on the landing page. Every other section (Hero, About, Pricing, Reviews, CTA) uses the same pattern: a normal `<section>` block with `whileInView` animations. The scroll-driven sticky version has been fixed twice and still misbehaves.

Rewrite the component as **4 plain stacked sections** matching the rest of the page. Delete all scroll-driven machinery. Keep all visual content, styling, icons, and anchor IDs so nothing else on the page needs to change.

## Problem Frame

The current `src/components/CourseDetailsSection.tsx` (~364 lines) carries:

- `height: 400vh` wrapper + sticky inner panel (one viewport for each of 4 sub-sections)
- `useScroll` + `useMotionValueEvent` tracking progress through the 400vh range
- `activeIndex` state driving 4 `SectionContent` overlays stacked at `absolute inset-0`
- ~80 lines of custom snap logic: direction detection, dead zones, `scrollend` vs scroll fallback, `isSnapping` ref, cooldown timers
- Side nav dots that only work inside this one section
- A scroll hint that fades out on progress

Two prior attempts tried to patch the snap logic (`docs/plans/2026-02-28-fix-course-details-section-overflow-plan.md`, `docs/plans/2026-02-28-fix-snap-exit-trap-and-lag-plan.md`). Both added more logic to tame the snap. Users still report it feels broken.

The simplest possible solution — and the one that matches the rest of the page — is to drop the scroll-driven behavior entirely.

## Requirements Trace

- R1. The four content blocks (Benefits, Curriculum, Target Audience, USP) are rendered as normal stacked sections, scrolled through with the browser's default behavior.
- R2. No custom scroll listeners, snap logic, `useScroll`, or `useMotionValueEvent` remain in this component.
- R3. Visual content is preserved: headings, subtitles, eyebrow labels, glass cards, icons, gradient colors, the "ЗАБРОНЮВАТИ МІСЦЕ" CTA block in the USP section.
- R4. Anchor IDs `#benefits`, `#curriculum`, `#target-audience`, `#usp` remain valid navigation targets — header `NavLink`s in `src/components/MarketingCourseLanding.tsx` (lines 142–143, 172–175, 585) still work.
- R5. The component's props interface (`benefits`, `curriculum`, `targetAudience`, `usp`) is unchanged so `MarketingCourseLanding.tsx` needs zero edits.
- R6. Sections animate in on enter with `whileInView`, matching the rhythm of the neighboring About section.
- R7. Lint passes.

## Scope Boundaries

- No changes to `MarketingCourseLanding.tsx`, content types, content defaults, or admin editor.
- No changes to `src/types/content.ts` or database schema — data shapes are preserved.
- No new dependencies.
- No new tests — project has no component test suite for landing sections; verification is manual in the running dev server.

### Deferred to Separate Tasks

- Marking the two prior fix plans as superseded (status flip to `superseded` and a note pointing to this plan). Can be done in the same commit or left for plan hygiene cleanup.

## Context & Research

### Relevant Code and Patterns

- `src/components/CourseDetailsSection.tsx` — the file being rewritten.
- `src/components/MarketingCourseLanding.tsx` lines 324–400 (About section) — the motion pattern to mirror: `motion.section` with `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, amount: 0.2 }}`, container spacing `py-16 sm:py-24 lg:py-32 container mx-auto px-6`.
- `src/components/MarketingCourseLanding.tsx` line 78–87 — `sectionVariants` already defined on the parent; CourseDetailsSection will define its own lightweight variants inline to avoid cross-component coupling.
- Existing glass-card look is already inlined as `GlassPanel` — keep it, it's the cleanest primitive in the file.

### Institutional Learnings

- N/A — no relevant entries in `docs/solutions/` for this component.

## Key Technical Decisions

- **Delete, don't refactor incrementally.** The logic is intertwined (useScroll → activeIndex → SectionContent overlays → snap handlers). Trying to remove pieces one at a time would leave dead references. A single rewrite is simpler and easier to review.
- **Keep `GlassPanel` and the existing icon arrays** (`BENEFIT_ICONS`, `PERSONA_ICONS`, `USP_ICONS`). They are already clean and work independently of scroll logic.
- **Each sub-section is its own top-level `<section>` with its own anchor ID.** This is the natural shape and unlocks normal browser navigation.
- **Use `whileInView` for entrance animation, not `useScroll`.** Matches the rest of the page and avoids the class of bugs the current file has.
- **Do not add section dots.** The four items already have anchor entries in the header; a duplicate in-page nav is unnecessary noise. Removing them is part of "as simple as possible."
- **Remove the `SectionContent` wrapper entirely.** Its only job was cross-fading panels at the same scroll position; it has no purpose in a stacked layout.

## Open Questions

### Resolved During Planning

- Should the one-panel-at-a-time feel be preserved via CSS scroll-snap? — **No.** User explicitly chose plain stacked sections.
- Should sections be extracted into separate files? — **No for this pass.** One file per sub-section is fine, but splitting is out of scope for "make it simple." Revisit only if the rewritten file feels too long.

### Deferred to Implementation

- Exact per-section vertical padding. The About section uses `py-16 sm:py-24 lg:py-32`; the implementer may trim this for the 4 stacked course sections to keep the page from feeling too long.

## Implementation Units

- [ ] **Unit 1: Rewrite `CourseDetailsSection` as 4 stacked sections**

**Goal:** Replace the entire component body with 4 plain `motion.section` blocks, one per content area, using `whileInView` animations and preserving anchor IDs, content, and styling.

**Requirements:** R1, R2, R3, R4, R5, R6, R7

**Dependencies:** None.

**Files:**
- Modify: `src/components/CourseDetailsSection.tsx` (rewrite)

**Approach:**
- Delete: `useRef`, `useState`, `useEffect`, `useCallback` imports; `useScroll`, `useTransform`, `useMotionValueEvent` imports (keep `motion`); `SNAP_POINTS`, `SECTIONS` constants; `SectionContent` component; `activeIndex`, `isSnapping`, `lastProgress` refs; `scrollYProgress`, `scrollHintOpacity`; hash-sync effect; snap effect; `scrollToSnapPoint`; `handleDotClick`; side nav dots block; scroll hint block; the outer 400vh wrapper and the sticky inner container.
- Keep: `GlassPanel` component, `BENEFIT_ICONS` / `PERSONA_ICONS` / `USP_ICONS`, `CourseDetailsSectionProps` interface, the four content render blocks (benefits cards grid, curriculum 2-column list, target audience grid, USP grid + CTA).
- Wrap each of the 4 content blocks in its own `motion.section` with: `id={anchorId}`, `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, amount: 0.2 }}`, a local `sectionVariants` with `hidden: { opacity: 0, y: 40 }` / `visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }`, and page spacing (`py-16 sm:py-24 container mx-auto px-6` or similar — match the About section's rhythm).
- Return a `<>` fragment containing the 4 sections in order: Benefits → Curriculum → Target Audience → USP.
- Remove the `isActive` prop from rendered content — items are always visible now, no opacity/scale toggling.
- Confirm no imports remain unused after the rewrite.

**Patterns to follow:**
- `src/components/MarketingCourseLanding.tsx` About section (lines 324–400) for the `motion.section` + `whileInView` + container spacing pattern.
- Keep the existing glassmorphism color tokens: `#fb7185`, `#d946ef`, `#a855f7`, `bg-[#1a0d2e]/50`, `border-purple-500/20`.

**Test scenarios:**
- Happy path: Load the landing page. Scroll from top to bottom. The four course-detail sections appear in order, animate in once on enter, and scroll normally with the rest of the page. No sticky behavior, no snap, no scroll hijack.
- Edge case: Fast scroll through the region — no stutter, no snap-back, no overlapping panels.
- Edge case: Very slow scroll through the region — sections stay visible after entering (no disappearing on further scroll), nothing rubber-bands.
- Anchor nav: Click header "Переваги" → jumps to `#benefits`. Click "Програма" → jumps to `#curriculum`. Hash-linked deep load (`/#usp`) lands on the USP section.
- Mobile (iPhone SE width ~375px): All 4 sections render; curriculum modules, benefit cards, and persona cards all fit without horizontal overflow; CTA button in USP section is tappable.
- Reduced motion: Users with `prefers-reduced-motion` see content without the fade/translate animation (framer-motion respects this when `useReducedMotion` is applied — confirm whether the existing `usePrefersReducedMotion` hook needs to be wired here; if animations are purely `whileInView`-driven, they're mild enough to leave as-is, matching the About section which also doesn't gate them).

**Verification:**
- `npm run lint` passes with zero warnings for this file.
- Manual: header nav links still scroll to the right sections.
- Manual: no console errors on page load, no scroll listeners left attached after unmount (DevTools → Performance → event listeners on `window` → no `scroll` or `scrollend` listeners registered by this component).
- File line count drops from ~364 to roughly ~180–220 lines.
- Grep confirms: no remaining references to `useScroll`, `useMotionValueEvent`, `SNAP_POINTS`, `scrollToSnapPoint`, `isSnapping`, `SectionContent` in the file.

- [ ] **Unit 2: Mark superseded fix plans**

**Goal:** Flip the two prior fix plans to `status: superseded` with a one-line pointer to this plan, so plan history stays honest.

**Requirements:** Plan hygiene (not tied to a functional requirement).

**Dependencies:** Unit 1 merged or at least committed.

**Files:**
- Modify: `docs/plans/2026-02-28-fix-course-details-section-overflow-plan.md` (frontmatter + note)
- Modify: `docs/plans/2026-02-28-fix-snap-exit-trap-and-lag-plan.md` (frontmatter + note)

**Approach:**
- Add `status: superseded` to the frontmatter of each file (these plans currently have no `status` field).
- Add a one-line note at the top of each body: `> Superseded by docs/plans/2026-04-22-001-refactor-course-details-drop-scroll-driven-plan.md — the scroll-driven component was replaced with plain stacked sections.`

**Test scenarios:**
- Test expectation: none — documentation-only change.

**Verification:**
- Both files contain the `status: superseded` field and the supersession note.

## System-Wide Impact

- **Interaction graph:** `MarketingCourseLanding.tsx` renders `CourseDetailsSection` once (line 317). Props unchanged, so no ripple. Header anchor links (`#benefits`, `#curriculum`) keep working because anchor IDs are preserved on the new sections.
- **Error propagation:** None — no async flows, no error-prone paths added or removed.
- **State lifecycle risks:** Removing `activeIndex`, `isSnapping`, `lastProgress` refs deletes all internal state. The component becomes effectively stateless, which is a simplification, not a risk.
- **API surface parity:** Props contract unchanged.
- **Integration coverage:** None — no backend, API, or persistence involved.
- **Unchanged invariants:** The four content props (`benefits`, `curriculum`, `targetAudience`, `usp`), their shapes, the admin editing flow, and content-defaults — all untouched.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Deep links to `#target-audience` or `#usp` break because the new sections don't have IDs | Explicitly set `id="target-audience"` and `id="usp"` on the corresponding `motion.section` elements. Test deep-load in verification step. |
| Page becomes visually too long after un-stacking — four full-viewport stacked sections feel endless | Use moderate padding (`py-16 sm:py-24`), not the aggressive `py-24 lg:py-32` from About. Verify in the running dev server after the rewrite; if it feels long, tighten padding or reduce inner spacing. Still simpler than the status quo. |
| `whileInView` with `once: true` animates once and then content stays; if user scrolls up and back the animation does not replay | Acceptable — matches the rest of the page. |

## Sources & References

- Component being rewritten: `src/components/CourseDetailsSection.tsx`
- Host page: `src/components/MarketingCourseLanding.tsx` (line 317 renders it; lines 324–400 show the pattern to mirror)
- Superseded plans:
  - `docs/plans/2026-02-28-fix-course-details-section-overflow-plan.md`
  - `docs/plans/2026-02-28-fix-snap-exit-trap-and-lag-plan.md`
- Original feature plan for the sticky version: `docs/plans/2026-02-25-feat-sticky-scroll-course-details-section-plan.md` (referenced by the fix plans; this refactor reverts its core architectural choice)
