import { MarketingCourseLanding } from '@/components/MarketingCourseLanding';
import { createClient } from '@/lib/supabase/server';
import type { Review, SiteSetting, PricingTier } from '@/types/database';

export default async function Home() {
  const supabase = await createClient();

  const [{ data }, { data: heroSetting }, { data: pricingData }] = await Promise.all([
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
      .from('pricing_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  return (
    <MarketingCourseLanding
      reviews={(data as Review[]) || []}
      heroImageUrl={heroSetting?.value || undefined}
      pricingTiers={(pricingData as PricingTier[]) || []}
    />
  );
}
