import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { SiteContent, SeoContent } from '@/types/content';
import {
  defaultSiteContent,
  defaultSeo,
  defaultHeader,
  defaultHero,
  defaultBenefits,
  defaultAbout,
  defaultPricing,
  defaultReviews,
  defaultCta,
  defaultFooter,
} from './content-defaults';

type SupabaseInstance = SupabaseClient<Database>;

const CONTENT_KEYS = [
  'content_header',
  'content_hero',
  'content_benefits',
  'content_about',
  'content_pricing',
  'content_reviews',
  'content_cta',
  'content_footer',
] as const;

type ContentKey = (typeof CONTENT_KEYS)[number];

const defaultsMap: Record<ContentKey, unknown> = {
  content_header: defaultHeader,
  content_hero: defaultHero,
  content_benefits: defaultBenefits,
  content_about: defaultAbout,
  content_pricing: defaultPricing,
  content_reviews: defaultReviews,
  content_cta: defaultCta,
  content_footer: defaultFooter,
};

function safeJsonParse(value: string, fallback: unknown): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return fallback as Record<string, unknown>;
    }
    return parsed;
  } catch {
    console.warn('[content] Failed to parse JSON from site_settings, using defaults');
    return fallback as Record<string, unknown>;
  }
}

function mergeWithDefaults<T>(defaults: T, overrides: Record<string, unknown>): T {
  const result = { ...(defaults as Record<string, unknown>) };
  for (const key of Object.keys(result)) {
    if (key in overrides && overrides[key] !== undefined && overrides[key] !== null) {
      const defaultVal = result[key];
      const overrideVal = overrides[key];
      if (Array.isArray(defaultVal) && Array.isArray(overrideVal)) {
        // Use override array length: merge each item with its default counterpart
        result[key] = overrideVal.map((item, i) => {
          if (i < defaultVal.length && typeof defaultVal[i] === 'object' && defaultVal[i] !== null && typeof item === 'object' && item !== null) {
            return { ...defaultVal[i], ...item };
          }
          return item;
        });
      } else {
        result[key] = overrideVal;
      }
    }
  }
  return result as T;
}

export async function fetchSiteContent(supabase: SupabaseInstance): Promise<SiteContent> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [...CONTENT_KEYS]);

  if (error) {
    console.error('[content] Failed to fetch site content:', error.message);
    return defaultSiteContent;
  }

  if (!data || data.length === 0) return defaultSiteContent;

  const rows = data as { key: string; value: string }[];
  const contentMap = new Map(rows.map((row) => [row.key, row.value]));

  function mergeSection<T>(key: ContentKey): T {
    const raw = contentMap.get(key);
    const defaults = defaultsMap[key] as T;
    if (!raw) return defaults;
    const parsed = safeJsonParse(raw, defaults);
    return mergeWithDefaults(defaults, parsed);
  }

  return {
    header: mergeSection('content_header'),
    hero: mergeSection('content_hero'),
    benefits: mergeSection('content_benefits'),
    about: mergeSection('content_about'),
    pricing: mergeSection('content_pricing'),
    reviews: mergeSection('content_reviews'),
    cta: mergeSection('content_cta'),
    footer: mergeSection('content_footer'),
  };
}

export async function fetchSeoContent(supabase: SupabaseInstance): Promise<SeoContent> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'content_seo')
    .single();

  if (error) {
    // PGRST116 = no rows found, which is expected on fresh installs
    if (error.code !== 'PGRST116') {
      console.error('[content] Failed to fetch SEO content:', error.message);
    }
    return defaultSeo;
  }

  if (!data) return defaultSeo;

  const row = data as { value: string };
  const parsed = safeJsonParse(row.value, defaultSeo);
  return mergeWithDefaults(defaultSeo, parsed);
}
