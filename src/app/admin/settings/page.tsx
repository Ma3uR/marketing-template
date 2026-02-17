import { createClient } from '@/lib/supabase/server';
import type { SiteSetting } from '@/types/database';
import HeroImageUploader from '@/components/admin/HeroImageUploader';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_image_url')
    .single<Pick<SiteSetting, 'value'>>();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Налаштування</h2>
        <p className="text-gray-500">Загальні налаштування сайту</p>
      </div>
      <HeroImageUploader currentImageUrl={data?.value || null} />
    </div>
  );
}
