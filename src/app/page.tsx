import { MarketingCourseLanding } from '@/components/MarketingCourseLanding';
import { createClient } from '@/lib/supabase/server';
import type { Review } from '@/types/database';

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order')
    .order('created_at', { ascending: false });

  return <MarketingCourseLanding reviews={(data as Review[]) || []} />;
}
