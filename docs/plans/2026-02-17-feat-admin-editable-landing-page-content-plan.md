---
title: "feat: Admin Editable Landing Page Content"
type: feat
date: 2026-02-17
---

# Admin Editable Landing Page Content

## Overview

Make all text content on the marketing landing page editable from the admin panel. This includes ~63 text strings across 9 sections (Header, Hero, Benefits, About, Pricing heading, Reviews heading, CTA, Footer) plus SEO metadata (page title, description, keywords, OG tags). Content is stored as JSON objects per section in the existing `site_settings` key-value table, with hardcoded Ukrainian defaults as fallbacks.

## Problem Statement / Motivation

All landing page text is currently hardcoded in `MarketingCourseLanding.tsx` and `layout.tsx`. Any text change (typo fix, copy update, rebranding) requires a code deployment. The admin panel already manages reviews, pricing tiers, email templates, and the hero image -- but the actual marketing copy cannot be changed without developer intervention.

## Proposed Solution

Extend the existing `site_settings` table (key-value store) to hold JSON content objects per landing page section. Build a tabbed content editor in `/admin/settings` that lets the admin edit all text fields grouped by section. The landing page server component fetches content and deep-merges with hardcoded defaults, so the page always renders even with an empty database.

### Architecture

```
Admin Settings Page (tabs)          site_settings table
┌─────────────────────────┐        ┌──────────────────────────┐
│ [Header][Hero][Benefits]│        │ key              │ value  │
│ [About][Pricing][Reviews│  ───>  │ content_header   │ {...}  │
│ [CTA][Footer][SEO]      │  save  │ content_hero     │ {...}  │
└─────────────────────────┘        │ content_benefits │ {...}  │
                                   │ content_about    │ {...}  │
         page.tsx                  │ content_pricing  │ {...}  │
┌─────────────────────────┐        │ content_reviews  │ {...}  │
│ fetch all content_* keys│  <──── │ content_cta      │ {...}  │
│ deep-merge with defaults│  read  │ content_footer   │ {...}  │
│ pass props to landing   │        │ content_seo      │ {...}  │
└─────────────────────────┘        │ hero_image_url   │ "..."  │
                                   └──────────────────────────┘
```

### Content JSON Schema Per Section

```typescript
// src/types/content.ts

interface HeaderContent {
  logoLetter: string           // "Т"
  brandName: string            // "Таня Сідоренко"
  navBenefits: string          // "Переваги"
  navAbout: string             // "Про автора"
  navPricing: string           // "Тарифи"
  navReviews: string           // "Відгуки"
  loginButton: string          // "Увійти"
  mobileCtaButton: string      // "Почати навчання"
}

interface HeroContent {
  badge: string                // "Вже навчились 500+ підприємців"
  headingPrefix: string        // "Перестань"
  headingHighlight: string     // "переплачувати"
  headingSuffix: string        // "за рекламу"
  subtitle: string             // "Стань власним таргетологом..."
  ctaButton: string            // "Почати навчання"
  ratingText: string           // "{rating}/5 рейтинг"
  roiLabel: string             // "ROI"
  roiValue: string             // "+248%"
  leadsLabel: string           // "Нових лідів"
  leadsValue: string           // "+1,240"
}

interface BenefitCard {
  title: string
  description: string
}

interface BenefitsContent {
  heading: string              // "Що ти отримаєш на курсі"
  subtitle: string             // "Покрокова програма..."
  cards: BenefitCard[]         // 6 fixed cards (title + description only)
}

interface AboutContent {
  label: string                // "Про автора"
  heading: string              // "Ваша провідниця у світ..."
  bio: string                  // Bio paragraph
  achievement1: string         // "200+ успішних рекламних кампаній"
  achievement2: string         // "Працювала з брендами в 15 різних нішах"
  achievement3: string         // "Створила систему..."
  quote: string                // "Моя місія..."
  ctaButton: string            // "Хочу навчатись у тебе"
  experienceYears: string      // "7 років"
  experienceLabel: string      // "Досвіду в Digital"
}

interface PricingContent {
  heading: string              // "Обери свій формат навчання"
  subtitle: string             // "Гнучкі тарифи..."
}

interface ReviewsContent {
  heading: string              // "Що кажуть наші учні"
}

interface CtaContent {
  heading: string              // "Готові створити потік клієнтів..."
  subtitle: string             // "Реєструйтеся сьогодні..."
  ctaButton: string            // "Почати зараз"
  guaranteeLabel: string       // "Гарантія повернення коштів"
  guaranteeBadge: string       // "100% Безпека"
}

interface FooterContent {
  brandName: string            // "Таня Сідоренко"
  description: string          // Footer description paragraph
  navHeading: string           // "Навігація"
  navLinks: string[]           // ["Переваги", "Тарифи", "Про нас", "Контакти"]
  contactsHeading: string      // "Контакти"
  email: string                // "tanya@svidorenko.ua"
  instagram: string            // "@tanya_svidorenko"
  facebook: string             // "fb.com/tanya.svidorenko"
  copyright: string            // "2026 Таня Сідоренко. Всі права захищені."
  privacyLink: string          // "Політика конфіденційності"
  offerLink: string            // "Договір оферти"
}

interface SeoContent {
  title: string                // "Курс з таргетованої реклами | Таня Сідоренко"
  description: string          // Meta description
  keywords: string             // Comma-separated keywords
  ogTitle: string              // OpenGraph title
  ogDescription: string        // OpenGraph description
}
```

## Technical Considerations

### Data Fetching Strategy

- **Single bulk query** in `page.tsx`: fetch all `site_settings` rows where `key LIKE 'content_%'` OR specific keys in one query
- Parse JSON values and deep-merge each section with hardcoded defaults using a utility function
- Pass merged content as a `content` prop to `MarketingCourseLanding`

### Cache / Revalidation

- Use `export const dynamic = 'force-dynamic'` on `page.tsx` to ensure fresh content on every request (matches current implicit behavior -- the page already makes Supabase queries on each load)
- Admin saves use client-side Supabase SDK (existing pattern) with `router.refresh()` for the admin page

### SEO Metadata

- Move `export const metadata` from `layout.tsx` to `page.tsx` as `export async function generateMetadata()` that fetches `content_seo` from Supabase
- This scopes marketing SEO tags to the landing page only (not admin routes)
- `layout.tsx` keeps only a minimal fallback `title` template

### Fallback Behavior

- **Per-field deep merge**: if `content_hero` exists in DB but is missing `badge`, only `badge` falls back to default -- other fields use DB values
- **JSON parse safety**: wrap `JSON.parse()` in try/catch -- if a row contains invalid JSON, fall back to all defaults for that section and log a warning
- **Empty string handling**: empty strings are saved as-is. Admin can use "Reset to defaults" button to restore original text for an entire section (deletes the `site_settings` row)

### Validation

- Client-side validation before save with character limits per field type:
  - Headings: 120 chars
  - Subtitles/paragraphs: 500 chars
  - Button text: 40 chars
  - Benefit titles: 60 chars
  - Benefit descriptions: 200 chars
  - Contact info: 100 chars
- Required fields: all heading and button text fields must be non-empty
- No format validation for contact info (display-only, not functional links)

### Out of Scope

- Instructor photo editing (already handled separately by hero image uploader pattern)
- PricingCard decorative text ("Найпопулярніший", "Обрати {title}")
- Rich text / markdown editing
- Live preview panel
- Unsaved changes warnings
- Content change audit log
- Dynamic benefit card add/remove (fixed at 6)

## Acceptance Criteria

- [x] All ~63 text strings on the landing page are editable from `/admin/settings`
- [x] SEO metadata (title, description, keywords, OG tags) is editable
- [x] Content editor is organized by tabs: Header, Hero, Benefits, About, Pricing, Reviews, CTA, Footer, SEO
- [x] Each tab has its own Save button and a "Restore defaults" button
- [x] Landing page renders correctly with zero content rows in database (all defaults)
- [x] Landing page renders correctly with partial content (per-field fallback)
- [x] Invalid JSON in database does not crash the landing page (graceful fallback)
- [x] Admin form fields have character limit validation
- [x] Hero heading supports 3 separate fields (prefix, highlighted, suffix)
- [x] Benefits section edits 6 fixed cards (title + description each)
- [x] Mobile admin UI is usable for the content editor
- [x] `generateMetadata` in `page.tsx` serves dynamic SEO tags from database

## Implementation Plan

### Phase 1: Foundation (content types + defaults + data fetching)

**Files to create/modify:**

1. **`src/types/content.ts`** (new) -- TypeScript interfaces for all content sections (as defined above)
2. **`src/lib/content-defaults.ts`** (new) -- Hardcoded default values for every section, extracted from current `MarketingCourseLanding.tsx`
3. **`src/lib/content.ts`** (new) -- Utility functions:
   - `fetchSiteContent(supabase): Promise<SiteContent>` -- fetches all `content_*` keys, parses JSON, deep-merges with defaults
   - `fetchSeoContent(supabase): Promise<SeoContent>` -- fetches `content_seo` key, merges with defaults
   - Helper for safe JSON parse with fallback

### Phase 2: Landing page integration

**Files to modify:**

4. **`src/app/page.tsx`** -- Add `fetchSiteContent()` call, pass `content` prop to `MarketingCourseLanding`, add `export const dynamic = 'force-dynamic'`
5. **`src/app/page.tsx`** -- Add `generateMetadata()` export that fetches `content_seo` from database
6. **`src/app/layout.tsx`** -- Remove hardcoded `metadata` export (keep minimal title template only)
7. **`src/components/MarketingCourseLanding.tsx`** -- Accept `content` prop, replace all hardcoded strings with `content.hero.badge`, `content.benefits.heading`, etc. Keep hardcoded values as inline fallbacks where appropriate

### Phase 3: Admin content editor

**Files to create/modify:**

8. **`src/components/admin/ContentEditor.tsx`** (new) -- Main tabbed content editor component with:
   - Tab navigation (Header, Hero, Benefits, About, Pricing, Reviews, CTA, Footer, SEO)
   - Each tab renders a `SectionEditor` for its content type
9. **`src/components/admin/SectionEditor.tsx`** (new) -- Reusable section editor component:
   - Renders form fields based on content interface (text inputs, textareas)
   - Save button (upserts to `site_settings`)
   - "Restore defaults" button (deletes the `site_settings` row)
   - Loading/saving states with feedback
   - Character limit display per field
10. **`src/app/admin/settings/page.tsx`** -- Add `ContentEditor` alongside existing `HeroImageUploader`

### Phase 4: Cleanup

11. **`src/types/database.ts`** -- Ensure `SiteSetting` type is aligned with usage
12. Verify mobile admin layout works with tabbed content editor
13. Test full round-trip: empty DB → defaults render → admin saves → landing page updates → admin resets → defaults restored

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Malformed JSON in `site_settings` breaks landing page | Try/catch with per-section fallback to defaults |
| Admin enters extremely long text, breaks layout | Client-side character limit validation |
| Next.js caches page despite DB changes | `force-dynamic` export ensures fresh fetches |
| Large content prop makes page.tsx complex | Single `fetchSiteContent()` utility keeps it clean |
| 63 fields in admin UI overwhelms on mobile | Tabbed interface shows one section at a time |

## References

### Internal References
- Current hardcoded text: `src/components/MarketingCourseLanding.tsx` (all sections)
- SEO metadata: `src/app/layout.tsx:10-29`
- site_settings table: `supabase/migrations/005_site_settings.sql`
- Admin settings page: `src/app/admin/settings/page.tsx`
- HeroImageUploader pattern: `src/components/admin/HeroImageUploader.tsx`
- Existing editor pattern: `src/components/admin/ReviewEditor.tsx`, `PricingTierEditor.tsx`
- Supabase client: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Database types: `src/types/database.ts`
