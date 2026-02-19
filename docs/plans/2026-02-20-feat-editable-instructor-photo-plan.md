---
title: "Editable Instructor Photo (About Section)"
type: feat
date: 2026-02-20
---

# ✨ feat: Make About Section Instructor Photo Editable from Admin

## Overview

The About/Instructor section photo (`#about`) is currently hardcoded to an Unsplash URL. Make it uploadable from the admin settings page, following the same pattern as the existing hero image uploader.

## Problem Statement

The landing page has two main photos — the hero image and the instructor image. The hero image is already editable via `HeroImageUploader` in the admin panel, but the instructor photo in the About section (`MarketingCourseLanding.tsx:386`) is hardcoded:

```tsx
src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop"
```

This means changing it requires a code deployment.

## Proposed Solution

**Refactor `HeroImageUploader` into a generic `ImageUploader` component** (DRY principle per CLAUDE.md) and use it for both the hero and instructor images. Both uploaders share the same bucket (`hero-images`), differentiated by file path.

## Acceptance Criteria

- [x] Admin can upload/delete the instructor photo from `/admin/settings`
- [x] Instructor photo displays the uploaded image on the landing page, falling back to the current Unsplash URL
- [x] Existing hero image upload continues to work unchanged
- [x] No code duplication — single reusable `ImageUploader` component

## MVP

### Step 1: Refactor `HeroImageUploader` → generic `ImageUploader`

**`src/components/admin/ImageUploader.tsx`** — extract into a configurable component:

```tsx
interface ImageUploaderProps {
  currentImageUrl: string | null;
  fallbackImage: string;
  storagePath: string;        // e.g. 'hero.webp', 'instructor.webp'
  settingsKey: string;        // e.g. 'hero_image_url', 'instructor_image_url'
  title: string;
  description: string;
  bucket?: string;            // defaults to 'hero-images'
}
```

All upload/delete logic stays the same, just parameterized.

### Step 2: Replace `HeroImageUploader` usage

**`src/app/admin/settings/page.tsx`** — swap `HeroImageUploader` for `ImageUploader` with hero-specific props. Delete `HeroImageUploader.tsx`.

### Step 3: Add instructor image uploader to admin

**`src/app/admin/settings/page.tsx`**:
- Query `instructor_image_url` from `site_settings` (parallel with existing queries)
- Render second `<ImageUploader>` with instructor-specific props:
  - `storagePath: 'instructor.webp'`
  - `settingsKey: 'instructor_image_url'`
  - `title: 'Фото інструктора (Про мене)'`
  - `fallbackImage: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop'`

### Step 4: Pass instructor image to landing page

**`src/app/page.tsx`**:
- Query `instructor_image_url` from `site_settings`
- Pass as `instructorImageUrl` prop to `MarketingCourseLanding`

### Step 5: Use dynamic image in component

**`src/components/MarketingCourseLanding.tsx`**:
- Add `instructorImageUrl?: string` to `MarketingCourseLandingProps`
- Replace hardcoded `src` on line 386 with:
  ```tsx
  src={instructorImageUrl || 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop'}
  ```

## Files Changed

| File | Action |
|---|---|
| `src/components/admin/ImageUploader.tsx` | **Create** — generic image uploader |
| `src/components/admin/HeroImageUploader.tsx` | **Delete** — replaced by `ImageUploader` |
| `src/app/admin/settings/page.tsx` | **Edit** — use `ImageUploader`, add instructor query + uploader |
| `src/app/page.tsx` | **Edit** — query `instructor_image_url`, pass as prop |
| `src/components/MarketingCourseLanding.tsx` | **Edit** — add prop, use dynamic src |

## References

- Existing pattern: `src/components/admin/HeroImageUploader.tsx` (full upload/delete flow)
- Admin settings: `src/app/admin/settings/page.tsx:10-18` (parallel queries pattern)
- Landing page data flow: `src/app/page.tsx:29-47` → `MarketingCourseLanding.tsx:77-84`
- Supabase bucket: `hero-images` (reused for both images)
- DB table: `site_settings` with new key `instructor_image_url`
