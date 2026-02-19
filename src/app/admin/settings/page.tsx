import { createClient } from '@/lib/supabase/server';
import { fetchSiteContent, fetchSeoContent } from '@/lib/content';
import type { SiteSetting } from '@/types/database';
import ImageUploader from '@/components/admin/ImageUploader';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: heroSetting }, { data: instructorSetting }, content, seo] = await Promise.all([
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
    fetchSiteContent(supabase),
    fetchSeoContent(supabase),
  ]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Налаштування</h2>
        <p className="text-gray-500">Загальні налаштування сайту</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploader
          currentImageUrl={heroSetting?.value || null}
          fallbackImage="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop"
          storagePath="hero.webp"
          settingsKey="hero_image_url"
          title="Фото героя (Hero Section)"
          description="Зображення відображається у верхній секції лендінгу. Максимум 5MB."
        />
        <ImageUploader
          currentImageUrl={instructorSetting?.value || null}
          fallbackImage="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop"
          storagePath="instructor.webp"
          settingsKey="instructor_image_url"
          title="Фото інструктора (Про мене)"
          description="Зображення відображається у секції «Про мене». Максимум 5MB."
        />
      </div>
      <ContentEditor initialContent={content} initialSeo={seo} />
    </div>
  );
}
