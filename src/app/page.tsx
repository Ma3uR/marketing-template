import type { Metadata } from 'next';
import { MarketingCourseLanding } from '@/components/MarketingCourseLanding';
import { createClient } from '@/lib/supabase/server';
import { fetchSiteContent, fetchSeoContent } from '@/lib/content';
import type { Review, SiteSetting, PricingTier } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const seo = await fetchSeoContent(supabase);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      locale: 'uk_UA',
      type: 'website',
    },
  };
}

export default async function Home() {
  const supabase = await createClient();

  const [{ data }, { data: heroSetting }, { data: instructorSetting }, { data: pricingData }, content] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_image_url')
      .single<Pick<SiteSetting, 'value'>>(),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'instructor_image_url')
      .single<Pick<SiteSetting, 'value'>>(),
    supabase
      .from('pricing_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    fetchSiteContent(supabase),
  ]);

  return (
    <MarketingCourseLanding
      reviews={(data as Review[]) || []}
      heroImageUrl={heroSetting?.value || undefined}
      instructorImageUrl={instructorSetting?.value || undefined}
      pricingTiers={(pricingData as PricingTier[]) || []}
      content={content}
    />
  );
}
