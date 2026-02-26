---
title: "feat: Add admin-editable competitive landing page sections"
type: feat
date: 2026-02-24
---

# feat: Add Admin-Editable Competitive Landing Page Sections

## Overview

Based on competitive analysis (see `analitics.md`), add three new content sections to the marketing landing page — all fully editable from the admin panel so Tanya can fill in the real content:

1. **Course Curriculum** — module/lesson listing (missing vs all competitors)
2. **Enhanced About Author** — case studies, client logos, video introduction
3. **USP Highlights** — 14-day format, money-back guarantee, VIP mentoring

The "Who is this course for" section is already implemented and just needs Tanya to update the text via admin.

## Problem Statement

The competitive analysis identified critical content gaps vs 5 Ukrainian competitors:
- No course curriculum shown (every competitor has one)
- No career/salary outcomes or case studies in About section
- No FAQ or USP differentiation section
- The unique 14-day format, money-back guarantee, and VIP mentoring are undermarketed

All new content must be admin-editable so Tanya can write the real Ukrainian text herself.

## Proposed Solution

Follow the established 4-step content section pattern:
1. TypeScript interfaces in `src/types/content.ts`
2. Default values (Ukrainian placeholder) in `src/lib/content-defaults.ts`
3. Fetch + deep-merge in `src/lib/content.ts`
4. Admin ContentEditor tab + Landing page rendering

### Section Placement (page order)

```
Header
Hero
  → NEW: USP Highlights (3 cards: 14-day, guarantee, VIP)
Benefits
Target Audience (already exists)
  → NEW: Course Curriculum (7 modules)
About Author (ENHANCED: case studies, client logos, video)
Pricing
Reviews
CTA
Footer
```

### Navigation Update

Add "Програма" nav link to header (competitors Karabin.pro, Promodo, Lemon School all have it).

---

## Technical Approach

### Phase 1: USP Highlights Section

**New types** (`src/types/content.ts`):

```typescript
export interface UspCard {
  title: string;
  description: string;
}

export interface UspContent {
  heading: string;
  subtitle: string;
  cards: UspCard[];
}
```

Add `usp: UspContent` to `SiteContent`.

**Default content** (`src/lib/content-defaults.ts`):

```typescript
export const defaultUsp: UspContent = {
  heading: 'Чому обирають наш курс',
  subtitle: 'Унікальні переваги, яких немає в жодного конкурента',
  cards: [
    {
      title: '14 днів інтенсиву',
      description: 'Те, що інші розтягують на 2-2.5 місяці, ми конденсуємо в 14 інтенсивних днів практичного навчання.',
    },
    {
      title: 'Гарантія повернення коштів',
      description: 'Якщо перший урок не виправдає твоїх очікувань — ми повернемо кошти без зайвих питань.',
    },
    {
      title: 'VIP персональне менторство',
      description: 'Персональний доступ до інструктора, ексклюзивна підтримка та індивідуальна стратегія для твого бізнесу.',
    },
  ],
};
```

**Content fetch** (`src/lib/content.ts`):
- Add `'content_usp'` to `CONTENT_KEYS`
- Add to `defaultsMap` and `fetchSiteContent()` return

**Admin editor** (`src/components/admin/ContentEditor.tsx`):
- Add `'usp'` to `TabId`, tab label: `'USP'`
- Add field configs for heading + subtitle
- Add `UspEditor` component (mirrors `BenefitsEditor` pattern)
- Add `updateUspCard` handler
- Add card validation (title: 60 chars, description: 200 chars)

**Landing page** (`src/components/MarketingCourseLanding.tsx`):
- Insert between Hero and Benefits sections
- Icons: `Zap` (14-day), `ShieldCheck` (guarantee), `Crown` (VIP) — fixed by position
- 3-column grid on desktop, single column on mobile
- Dark background variant (`bg-[#1a0d2e]/30`) to contrast with Hero
- Framer Motion stagger animation

**Files modified:**
| File | Change |
|------|--------|
| `src/types/content.ts` | Add `UspCard`, `UspContent` interfaces; update `SiteContent` |
| `src/lib/content-defaults.ts` | Add `defaultUsp`; update `defaultSiteContent` |
| `src/lib/content.ts` | Add key, default, merge call |
| `src/components/admin/ContentEditor.tsx` | Add tab, field configs, `UspEditor`, card handler, validation |
| `src/components/MarketingCourseLanding.tsx` | Add USP section between Hero and Benefits |

---

### Phase 2: Course Curriculum Section

**New types** (`src/types/content.ts`):

```typescript
export interface CurriculumModule {
  title: string;
  description: string;
}

export interface CurriculumContent {
  heading: string;
  subtitle: string;
  modules: CurriculumModule[];
}
```

Add `curriculum: CurriculumContent` to `SiteContent`.

**Default content** (`src/lib/content-defaults.ts`):

7 modules with Ukrainian placeholder text (Tanya will replace):

```typescript
export const defaultCurriculum: CurriculumContent = {
  heading: 'Програма курсу',
  subtitle: 'Покрокова програма з 7 модулів — від основ до запуску прибуткових кампаній',
  modules: [
    {
      title: 'Модуль 1: Основи таргетованої реклами',
      description: 'Як працює рекламний аукціон, структура кабінету, типи кампаній та їх цілі.',
    },
    {
      title: 'Модуль 2: Аналіз цільової аудиторії',
      description: 'Сегментація аудиторії, створення портрета клієнта, інструменти дослідження.',
    },
    {
      title: 'Модуль 3: Створення рекламних креативів',
      description: 'Формули заголовків, дизайн банерів, A/B тестування візуалів та текстів.',
    },
    {
      title: 'Модуль 4: Налаштування Facebook Ads Manager',
      description: 'Піксель, конверсії, каталог, ретаргетинг та lookalike аудиторії.',
    },
    {
      title: 'Модуль 5: Бюджетування та оптимізація',
      description: 'Розподіл бюджету, ставки, масштабування успішних кампаній.',
    },
    {
      title: 'Модуль 6: Аналітика та звітність',
      description: 'Ключові метрики, UTM-мітки, Google Analytics та оцінка ROI.',
    },
    {
      title: 'Модуль 7: Запуск реальної кампанії',
      description: 'Практичне завдання: створення та запуск рекламної кампанії для свого бізнесу.',
    },
  ],
};
```

**Content fetch** (`src/lib/content.ts`):
- Add `'content_curriculum'` to `CONTENT_KEYS`
- Add to `defaultsMap` and `fetchSiteContent()` return

**Admin editor** (`src/components/admin/ContentEditor.tsx`):
- Add `'curriculum'` to `TabId`, tab label: `'Програма'`
- Add field configs for heading + subtitle
- Add `CurriculumEditor` component (same pattern as `BenefitsEditor` but for modules array)
- Add `updateCurriculumModule` handler
- Add module validation (title: 80 chars, description: 300 chars)

**Landing page** (`src/components/MarketingCourseLanding.tsx`):
- Insert between Target Audience and About sections
- Numbered timeline design: each module shows number badge + title + description
- Alternating layout or vertical timeline with numbered steps
- Section id: `curriculum`
- Dark background (`bg-[#1a0d2e]/30`)
- Framer Motion stagger with `whileInView`

**Navigation update**:
- Add `navCurriculum: string` to `HeaderContent` in types
- Default: `'Програма'`
- Add to header field configs in ContentEditor
- Render between `navBenefits` and `navAbout` in landing page header and mobile menu

**Files modified:**
| File | Change |
|------|--------|
| `src/types/content.ts` | Add `CurriculumModule`, `CurriculumContent`; update `SiteContent`, `HeaderContent` |
| `src/lib/content-defaults.ts` | Add `defaultCurriculum`; update `defaultHeader`, `defaultSiteContent` |
| `src/lib/content.ts` | Add key, default, merge call |
| `src/components/admin/ContentEditor.tsx` | Add tab, configs, `CurriculumEditor`, handler, validation; update header configs |
| `src/components/MarketingCourseLanding.tsx` | Add Curriculum section; update header nav links |

---

### Phase 3: Enhanced About Author Section

**Extend `AboutContent`** (`src/types/content.ts`):

```typescript
export interface AboutContent {
  // ... existing fields stay unchanged ...
  name: string;
  label: string;
  heading: string;
  bio: string;
  achievement1: string;
  achievement2: string;
  achievement3: string;
  quote: string;
  ctaButton: string;
  experienceYears: string;
  experienceLabel: string;
  // NEW fields:
  caseStudy1Client: string;
  caseStudy1Result: string;
  caseStudy2Client: string;
  caseStudy2Result: string;
  caseStudy3Client: string;
  caseStudy3Result: string;
  videoUrl: string;
}
```

**Why flat fields instead of array?** Case studies are fixed at 3 (not dynamic). Flat fields are simpler — no need for a dedicated array editor sub-component. They use the existing `FieldInput` rendering path.

**Client logos** — separate from `AboutContent`, handled via `ImageUploader`:
- 4 new `site_settings` keys: `client_logo_1_url` through `client_logo_4_url`
- 4 `ImageUploader` instances in settings page (grouped in a "Логотипи клієнтів" section)
- Storage paths: `logos/client-1.webp` through `logos/client-4.webp`
- Fetched in `page.tsx` and passed as `clientLogoUrls: (string | null)[]` prop

**Updated defaults** (`src/lib/content-defaults.ts`):

```typescript
export const defaultAbout: AboutContent = {
  // ... existing defaults unchanged ...
  caseStudy1Client: 'Інтернет-магазин одягу',
  caseStudy1Result: 'Зменшили вартість ліда з 25₴ до 8₴ за 3 тижні',
  caseStudy2Client: 'Стоматологічна клініка',
  caseStudy2Result: 'Збільшили кількість записів на 180% за місяць',
  caseStudy3Client: 'Онлайн-школа англійської',
  caseStudy3Result: 'ROI рекламних кампаній зріс до 340%',
  videoUrl: '',
};
```

**Admin editor** (`src/components/admin/ContentEditor.tsx`):
- Extend `about` field configs with 7 new fields:
  - `caseStudy1Client` (input, 120 chars): "Кейс 1: Клієнт"
  - `caseStudy1Result` (input, 200 chars): "Кейс 1: Результат"
  - `caseStudy2Client`, `caseStudy2Result`, `caseStudy3Client`, `caseStudy3Result`
  - `videoUrl` (input, 500 chars): "URL відео-знайомства (YouTube/Vimeo)"

**Settings page** (`src/app/admin/settings/page.tsx`):
- Add 4 `ImageUploader` instances for client logos in a dedicated grid section
- Fetch `client_logo_1_url` through `client_logo_4_url` from `site_settings`

**Landing page** (`src/components/MarketingCourseLanding.tsx`):
- After existing achievements list, add:
  - **Case studies block**: 3 mini-cards with client name + result (gradient border accent)
  - **Client logos row**: horizontal logo strip (grayscale, hover to color)
  - **Video embed**: if `videoUrl` is set, show responsive YouTube/Vimeo iframe
- New prop: `clientLogoUrls: (string | null)[]`

**Page data fetching** (`src/app/page.tsx`):
- Add 4 queries for `client_logo_*_url` keys (batch via `.in()`)

**Files modified:**
| File | Change |
|------|--------|
| `src/types/content.ts` | Extend `AboutContent` with case study + video fields |
| `src/lib/content-defaults.ts` | Add new field defaults to `defaultAbout` |
| `src/components/admin/ContentEditor.tsx` | Extend `about` field configs |
| `src/app/admin/settings/page.tsx` | Add 4 client logo `ImageUploader` instances + data fetch |
| `src/app/page.tsx` | Fetch client logo URLs, pass as prop |
| `src/components/MarketingCourseLanding.tsx` | Add case studies, logos, video to About section; add prop |

---

### Phase 4: Lint & Cleanup

- Run `pnpm lint` and fix any TypeScript/ESLint errors
- Verify all new content sections render with defaults
- Verify admin tabs save/reset correctly
- Test deep-merge fallback behavior (partial overrides)

---

## Acceptance Criteria

### USP Highlights Section
- [ ] 3 USP cards displayed in responsive grid (1-col mobile, 3-col desktop)
- [ ] Each card has: fixed Lucide icon, editable title, editable description
- [ ] Section heading and subtitle editable from admin "USP" tab
- [ ] Cards have glassmorphism styling matching existing sections
- [ ] Framer Motion stagger animation

### Course Curriculum Section
- [ ] 7 modules displayed in numbered timeline/list layout
- [ ] Each module has: number badge, editable title, editable description
- [ ] Section heading and subtitle editable from admin "Програма" tab
- [ ] Module validation: title max 80 chars, description max 300 chars
- [ ] "Програма" nav link added to header (desktop + mobile menu)
- [ ] Header nav link text editable from admin "Header" tab

### Enhanced About Section
- [ ] 3 case studies displayed as mini-cards with client name + result
- [ ] Case study fields editable from admin "Про автора" tab (6 new text fields)
- [ ] Video URL field in admin; if filled, renders responsive iframe embed on landing page
- [ ] If `videoUrl` is empty, video section is hidden
- [ ] 4 client logo image upload slots in admin settings page
- [ ] Client logos displayed as grayscale row on landing page
- [ ] Logos hidden if none uploaded

### General
- [ ] All new content stored in `site_settings` as JSON (existing pattern)
- [ ] Deep-merge with defaults works for all new sections
- [ ] "Restore defaults" works for all new tabs
- [ ] No lint errors
- [ ] Mobile-responsive for all new sections
- [ ] Ukrainian default text for all placeholder content

---

## Design Decisions & Edge Cases

### Video URL Security
- **Only allow YouTube and Vimeo URLs.** Parse the URL to extract video ID, then construct a safe embed URL:
  - YouTube: `https://www.youtube.com/embed/{videoId}`
  - Vimeo: `https://player.vimeo.com/video/{videoId}`
- Create a `parseVideoUrl(url: string): string | null` utility that returns the safe embed URL or `null` for invalid URLs
- Add `loading="lazy"` to the iframe for performance
- Use `sandbox="allow-scripts allow-same-origin"` on the iframe
- If URL is invalid/unsupported, don't render the video section (fail silently on landing page, show warning in admin)

### Empty State Handling
- **Case studies**: if all 6 fields are empty, hide the case studies block entirely
- **Client logos**: if no logos uploaded (all 4 URLs are null), hide the logos row
- **Video**: if `videoUrl` is empty or invalid, hide the video embed
- **Curriculum modules**: always show all 7 (they have default text)
- **USP cards**: always show all 3 (they have default text)

### DRY: Generic Card Array Editor
The codebase already has `BenefitsEditor` and `TargetAudienceEditor` with ~90% identical code. Adding `UspEditor` and `CurriculumEditor` would create 4 near-identical components. **Extract a reusable `CardArrayEditor`** that accepts:
- `data: { cards/modules: T[] }` — the array data
- `arrayKey: string` — the key name in the section object (`'cards'` or `'modules'`)
- `cardLabels: string[]` — display labels per card position
- `titleMaxLength / descriptionMaxLength` — validation limits
- `sectionTitle: string` — header above cards
- Refactor existing `BenefitsEditor` and `TargetAudienceEditor` to use it

### Curriculum Layout: Numbered Steps (not grid)
Use a **vertical numbered list** layout (not a card grid) because:
- 7 items don't divide evenly into grid columns
- Competitors show programs as sequential lists, not grids
- A numbered step layout communicates progression (day 1 → day 14)
- On mobile: simple stacked list with number badges
- On desktop: alternating left/right or single column with step indicators

### Client Logos: Batch Fetch
Instead of 4 separate `.single()` queries, use a single `.in()` query:
```typescript
const { data: logoSettings } = await supabase
  .from('site_settings')
  .select('key, value')
  .in('key', ['client_logo_1_url', 'client_logo_2_url', 'client_logo_3_url', 'client_logo_4_url']);
```
This reduces DB round trips from 4 to 1.

### About Tab Field Grouping
With 18+ fields in the "Про автора" tab, group them visually using section dividers:
- **Basic Info** (existing 11 fields)
- **Case Studies** (6 new fields) — with a visual separator and sub-heading
- **Video** (1 new field) — with a sub-heading
This keeps everything in one tab but organizes it for scanning.

---

## Implementation Order

1. **Phase 1: USP** — smallest scope, establishes the new-section pattern for this PR
2. **Phase 2: Curriculum** — new section + header nav update
3. **Phase 3: About Enhancement** — extends existing section + image uploaders
4. **Phase 4: Lint & cleanup**

Each phase is independently shippable but they build on each other naturally.

---

## Admin Tab Order (after all phases)

```
Header | Hero | USP | Переваги | Програма | Для кого | Про автора | Тарифи | Відгуки | CTA | Footer | SEO
```

12 tabs total — the existing `flex-wrap` layout handles this cleanly.

---

## Files Modified Summary

| File | Phases |
|------|--------|
| `src/types/content.ts` | 1, 2, 3 |
| `src/lib/content-defaults.ts` | 1, 2, 3 |
| `src/lib/content.ts` | 1, 2 |
| `src/components/admin/ContentEditor.tsx` | 1, 2, 3 |
| `src/components/MarketingCourseLanding.tsx` | 1, 2, 3 |
| `src/app/page.tsx` | 3 |
| `src/app/admin/settings/page.tsx` | 3 |

No new database migrations needed — all content uses existing `site_settings` key-value store.

## References

- Competitive analysis: `analitics.md`
- Existing content pattern: `docs/plans/2026-02-17-feat-admin-editable-landing-page-content-plan.md`
- Target Audience plan (already implemented): `docs/plans/2026-02-20-feat-who-is-this-course-for-persona-cards-plan.md`
- Content merge logic: `src/lib/content.ts:59-79`
- Array editor pattern: `src/components/admin/ContentEditor.tsx:462-509` (BenefitsEditor)
- ImageUploader pattern: `src/components/admin/ImageUploader.tsx`
