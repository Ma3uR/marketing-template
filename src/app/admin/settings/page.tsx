import { createClient } from '@/lib/supabase/server';
import { fetchSiteContent, fetchSeoContent } from '@/lib/content';
import type { SiteSetting } from '@/types/database';
import ImageUploader from '@/components/admin/ImageUploader';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: imageSettings }, content, seo] = await Promise.all([
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'hero_image_url',
        'instructor_image_url',
        'og_image_url',
        'client_logo_1_url',
        'client_logo_2_url',
        'client_logo_3_url',
        'client_logo_4_url',
      ])
      .returns<Pick<SiteSetting, 'key' | 'value'>[]>(),
    fetchSiteContent(supabase),
    fetchSeoContent(supabase),
  ]);

  const imgMap = Object.fromEntries(
    (imageSettings ?? []).map((r) => [r.key, r.value])
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Налаштування</h2>
        <p className="text-gray-500">Загальні налаштування сайту</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploader
          currentImageUrl={imgMap['hero_image_url'] || null}
          fallbackImage="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop"
          storagePath="hero.webp"
          settingsKey="hero_image_url"
          title="Фото героя (Hero Section)"
          description="Зображення відображається у верхній секції лендінгу. Максимум 5MB."
        />
        <ImageUploader
          currentImageUrl={imgMap['instructor_image_url'] || null}
          fallbackImage="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop"
          storagePath="instructor.webp"
          settingsKey="instructor_image_url"
          title="Фото інструктора (Про мене)"
          description="Зображення відображається у секції «Про мене». Максимум 5MB."
        />
      </div>

      {/* Client Logos */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Логотипи клієнтів</h3>
        <p className="text-sm text-gray-500 mb-4">Логотипи відображаються у секції «Про автора». Рекомендовано: PNG з прозорим фоном.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <ImageUploader
              key={n}
              currentImageUrl={imgMap[`client_logo_${n}_url`] || null}
              fallbackImage=""
              storagePath={`logos/client-${n}.webp`}
              settingsKey={`client_logo_${n}_url`}
              title={`Логотип ${n}`}
              description="PNG або SVG до 5MB"
            />
          ))}
        </div>
      </div>

      <ContentEditor initialContent={content} initialSeo={seo} ogImageUrl={imgMap['og_image_url'] || null} />
    </div>
  );
}
