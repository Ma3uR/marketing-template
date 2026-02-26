import type { Metadata } from 'next';
import { MarketingCourseLanding } from '@/components/MarketingCourseLanding';
import { createClient } from '@/lib/supabase/server';
import { fetchSiteContent, fetchSeoContent } from '@/lib/content';
import type { Review, SiteSetting, PricingTier } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const [seo, { data: imageSettings }] = await Promise.all([
    fetchSeoContent(supabase),
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['og_image_url', 'hero_image_url'])
      .returns<Pick<SiteSetting, 'key' | 'value'>[]>(),
  ]);

  const imageMap = Object.fromEntries(
    (imageSettings ?? []).map((r) => [r.key, r.value])
  );
  const ogImageUrl = imageMap['og_image_url'] || imageMap['hero_image_url'] || null;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      locale: 'uk_UA',
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    ...(ogImageUrl
      ? {
          twitter: {
            card: 'summary_large_image',
            title: seo.ogTitle,
            description: seo.ogDescription,
            images: [ogImageUrl],
          },
        }
      : {}),
  };
}

export default async function Home() {
  const supabase = await createClient();

  const [{ data }, { data: imageSettings }, { data: pricingData }, content] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'hero_image_url',
        'instructor_image_url',
        'client_logo_1_url',
        'client_logo_2_url',
        'client_logo_3_url',
        'client_logo_4_url',
      ])
      .returns<Pick<SiteSetting, 'key' | 'value'>[]>(),
    supabase
      .from('pricing_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    fetchSiteContent(supabase),
  ]);

  const imgMap = Object.fromEntries(
    (imageSettings ?? []).map((r) => [r.key, r.value])
  );

  const clientLogoUrls = [
    imgMap['client_logo_1_url'] || null,
    imgMap['client_logo_2_url'] || null,
    imgMap['client_logo_3_url'] || null,
    imgMap['client_logo_4_url'] || null,
  ];

  return (
    <MarketingCourseLanding
      reviews={(data as Review[]) || []}
      heroImageUrl={imgMap['hero_image_url'] || undefined}
      instructorImageUrl={imgMap['instructor_image_url'] || undefined}
      pricingTiers={(pricingData as PricingTier[]) || []}
      content={content}
      clientLogoUrls={clientLogoUrls}
    />
  );
}
