'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, RotateCcw, Save, Check } from 'lucide-react';
import GlassCard from './GlassCard';
import type {
  SiteContent,
  SeoContent,
  BenefitsContent,
} from '@/types/content';
import {
  defaultHeader,
  defaultHero,
  defaultBenefits,
  defaultAbout,
  defaultPricing,
  defaultReviews,
  defaultCta,
  defaultFooter,
  defaultSeo,
} from '@/lib/content-defaults';

interface ContentEditorProps {
  initialContent: SiteContent;
  initialSeo: SeoContent;
}

type TabId = 'header' | 'hero' | 'benefits' | 'about' | 'pricing' | 'reviews' | 'cta' | 'footer' | 'seo';

const TABS: { id: TabId; label: string }[] = [
  { id: 'header', label: 'Header' },
  { id: 'hero', label: 'Hero' },
  { id: 'benefits', label: 'Переваги' },
  { id: 'about', label: 'Про автора' },
  { id: 'pricing', label: 'Тарифи' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'cta', label: 'CTA' },
  { id: 'footer', label: 'Footer' },
  { id: 'seo', label: 'SEO' },
];

interface FieldConfig {
  key: string;
  label: string;
  type: 'input' | 'textarea';
  maxLength: number;
}

const FIELD_CONFIGS: Record<string, FieldConfig[]> = {
  header: [
    { key: 'logoLetter', label: 'Літера логотипу', type: 'input', maxLength: 5 },
    { key: 'brandName', label: 'Назва бренду', type: 'input', maxLength: 120 },
    { key: 'navBenefits', label: 'Навігація: Переваги', type: 'input', maxLength: 40 },
    { key: 'navAbout', label: 'Навігація: Про автора', type: 'input', maxLength: 40 },
    { key: 'navPricing', label: 'Навігація: Тарифи', type: 'input', maxLength: 40 },
    { key: 'navReviews', label: 'Навігація: Відгуки', type: 'input', maxLength: 40 },
    { key: 'loginButton', label: 'Кнопка входу', type: 'input', maxLength: 40 },
    { key: 'mobileCtaButton', label: 'Мобільна CTA кнопка', type: 'input', maxLength: 40 },
  ],
  hero: [
    { key: 'badge', label: 'Бейдж (над заголовком)', type: 'input', maxLength: 120 },
    { key: 'headingPrefix', label: 'Заголовок: початок', type: 'input', maxLength: 120 },
    { key: 'headingHighlight', label: 'Заголовок: виділене слово (градієнт)', type: 'input', maxLength: 120 },
    { key: 'headingSuffix', label: 'Заголовок: кінець', type: 'input', maxLength: 120 },
    { key: 'subtitle', label: 'Підзаголовок', type: 'textarea', maxLength: 500 },
    { key: 'ctaButton', label: 'CTA кнопка', type: 'input', maxLength: 40 },
    { key: 'ratingText', label: 'Текст рейтингу', type: 'input', maxLength: 40 },
    { key: 'roiLabel', label: 'ROI - мітка', type: 'input', maxLength: 40 },
    { key: 'roiValue', label: 'ROI - значення', type: 'input', maxLength: 40 },
    { key: 'leadsLabel', label: 'Ліди - мітка', type: 'input', maxLength: 40 },
    { key: 'leadsValue', label: 'Ліди - значення', type: 'input', maxLength: 40 },
  ],
  benefits: [
    { key: 'heading', label: 'Заголовок секції', type: 'input', maxLength: 120 },
    { key: 'subtitle', label: 'Підзаголовок секції', type: 'textarea', maxLength: 500 },
  ],
  about: [
    { key: 'name', label: "Ім'я автора", type: 'input', maxLength: 120 },
    { key: 'label', label: 'Мітка секції', type: 'input', maxLength: 40 },
    { key: 'heading', label: 'Заголовок', type: 'input', maxLength: 120 },
    { key: 'bio', label: 'Біографія', type: 'textarea', maxLength: 500 },
    { key: 'achievement1', label: 'Досягнення 1', type: 'input', maxLength: 200 },
    { key: 'achievement2', label: 'Досягнення 2', type: 'input', maxLength: 200 },
    { key: 'achievement3', label: 'Досягнення 3', type: 'input', maxLength: 200 },
    { key: 'quote', label: 'Цитата', type: 'textarea', maxLength: 500 },
    { key: 'ctaButton', label: 'CTA кнопка', type: 'input', maxLength: 40 },
    { key: 'experienceYears', label: 'Досвід (число)', type: 'input', maxLength: 40 },
    { key: 'experienceLabel', label: 'Досвід (мітка)', type: 'input', maxLength: 40 },
  ],
  pricing: [
    { key: 'heading', label: 'Заголовок', type: 'input', maxLength: 120 },
    { key: 'subtitle', label: 'Підзаголовок', type: 'textarea', maxLength: 500 },
  ],
  reviews: [
    { key: 'heading', label: 'Заголовок', type: 'input', maxLength: 120 },
  ],
  cta: [
    { key: 'heading', label: 'Заголовок', type: 'input', maxLength: 120 },
    { key: 'subtitle', label: 'Підзаголовок', type: 'textarea', maxLength: 500 },
    { key: 'ctaButton', label: 'CTA кнопка', type: 'input', maxLength: 40 },
    { key: 'guaranteeLabel', label: 'Гарантія (текст)', type: 'input', maxLength: 100 },
    { key: 'guaranteeBadge', label: 'Гарантія (бейдж)', type: 'input', maxLength: 40 },
  ],
  footer: [
    { key: 'brandName', label: 'Назва бренду', type: 'input', maxLength: 120 },
    { key: 'description', label: 'Опис', type: 'textarea', maxLength: 500 },
    { key: 'navHeading', label: 'Заголовок навігації', type: 'input', maxLength: 40 },
    { key: 'navLink1', label: 'Посилання 1', type: 'input', maxLength: 40 },
    { key: 'navLink2', label: 'Посилання 2', type: 'input', maxLength: 40 },
    { key: 'navLink3', label: 'Посилання 3', type: 'input', maxLength: 40 },
    { key: 'navLink4', label: 'Посилання 4', type: 'input', maxLength: 40 },
    { key: 'contactsHeading', label: 'Заголовок контактів', type: 'input', maxLength: 40 },
    { key: 'email', label: 'Email', type: 'input', maxLength: 100 },
    { key: 'instagram', label: 'Instagram', type: 'input', maxLength: 100 },
    { key: 'facebook', label: 'Facebook', type: 'input', maxLength: 100 },
    { key: 'copyright', label: 'Копірайт', type: 'input', maxLength: 120 },
    { key: 'privacyLink', label: 'Політика конфіденційності (текст)', type: 'input', maxLength: 100 },
    { key: 'offerLink', label: 'Договір оферти (текст)', type: 'input', maxLength: 100 },
  ],
  seo: [
    { key: 'title', label: 'Заголовок сторінки', type: 'input', maxLength: 120 },
    { key: 'description', label: 'Meta опис', type: 'textarea', maxLength: 500 },
    { key: 'keywords', label: 'Ключові слова (через кому)', type: 'textarea', maxLength: 500 },
    { key: 'ogTitle', label: 'OpenGraph заголовок', type: 'input', maxLength: 120 },
    { key: 'ogDescription', label: 'OpenGraph опис', type: 'textarea', maxLength: 500 },
  ],
};

const DB_KEY_MAP: Record<TabId, string> = {
  header: 'content_header',
  hero: 'content_hero',
  benefits: 'content_benefits',
  about: 'content_about',
  pricing: 'content_pricing',
  reviews: 'content_reviews',
  cta: 'content_cta',
  footer: 'content_footer',
  seo: 'content_seo',
};

const DEFAULTS_MAP: Record<TabId, unknown> = {
  header: defaultHeader,
  hero: defaultHero,
  benefits: defaultBenefits,
  about: defaultAbout,
  pricing: defaultPricing,
  reviews: defaultReviews,
  cta: defaultCta,
  footer: defaultFooter,
  seo: defaultSeo,
};

function getSectionData(
  tab: TabId,
  content: SiteContent,
  seo: SeoContent
  ): any {
  if (tab === 'seo') return seo;
  return content[tab];
}

export default function ContentEditor({ initialContent, initialSeo }: ContentEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabId>('header');
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [seo, setSeo] = useState<SeoContent>(initialSeo);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const currentData = getSectionData(activeTab, content, seo) as Record<string, string | unknown[]>;

  const updateField = (key: string, value: string) => {
    if (activeTab === 'seo') {
      setSeo((prev) => ({ ...prev, [key]: value }));
    } else {
      setContent((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], [key]: value },
      }));
    }
    setStatus('idle');
  };

  const updateBenefitCard = (index: number, field: 'title' | 'description', value: string) => {
    setContent((prev) => {
      const newCards = [...prev.benefits.cards];
      newCards[index] = { ...newCards[index], [field]: value };
      return { ...prev, benefits: { ...prev.benefits, cards: newCards } };
    });
    setStatus('idle');
  };

  const validateFields = (): string | null => {
    const fields = FIELD_CONFIGS[activeTab];
    if (!fields) return null;

    const data = getSectionData(activeTab, content, seo);
    for (const field of fields) {
      const value = String(data[field.key] ?? '');
      if (value.length > field.maxLength) {
        return `"${field.label}" перевищує ліміт у ${field.maxLength} символів (${value.length})`;
      }
    }

    if (activeTab === 'benefits') {
      for (let i = 0; i < content.benefits.cards.length; i++) {
        const card = content.benefits.cards[i];
        if (card.title.length > 60) return `Картка ${i + 1}: заголовок перевищує ліміт у 60 символів`;
        if (card.description.length > 200) return `Картка ${i + 1}: опис перевищує ліміт у 200 символів`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setSaving(true);
    setError('');
    setStatus('idle');

    try {
      const dbKey = DB_KEY_MAP[activeTab];
      const data = getSectionData(activeTab, content, seo);

      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert(
          { key: dbKey, value: JSON.stringify(data) } as never,
          { onConflict: 'key' }
        );

      if (upsertError) throw upsertError;

      setStatus('saved');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Відновити значення за замовчуванням для цієї секції?')) return;

    setResetting(true);
    setError('');

    try {
      const dbKey = DB_KEY_MAP[activeTab];
      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', dbKey);

      if (deleteError) throw deleteError;

      const defaults = DEFAULTS_MAP[activeTab];
      if (activeTab === 'seo') {
        setSeo(defaults as SeoContent);
      } else {
        setContent((prev) => ({ ...prev, [activeTab]: defaults }));
      }

      setStatus('saved');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка відновлення');
      setStatus('error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <GlassCard className="!p-8">
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Контент сторінки</h3>
          <p className="text-sm text-gray-500">
            Редагуйте текстовий контент лендінгу та SEO метадані.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setStatus('idle'); setError(''); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-5">
          {activeTab === 'benefits' ? (
            <BenefitsEditor
              data={content.benefits}
              fields={FIELD_CONFIGS.benefits || []}
              onUpdateField={updateField}
              onUpdateCard={updateBenefitCard}
            />
          ) : (
            (FIELD_CONFIGS[activeTab] || []).map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={String(currentData[field.key] ?? '')}
                onChange={(val) => updateField(field.key, val)}
              />
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={saving || resetting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : status === 'saved' ? (
            <Check className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Збереження...' : status === 'saved' ? 'Збережено' : 'Зберегти'}
        </button>

        <button
          onClick={handleReset}
          disabled={saving || resetting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 border border-white/5"
        >
          {resetting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Відновити за замовчуванням
        </button>
        </div>
      </div>
    </GlassCard>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (val: string) => void;
}) {
  const isOverLimit = value.length > field.maxLength;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{field.label}</label>
        <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-600'}`}>
          {value.length}/{field.maxLength}
        </span>
      </div>
      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-fuchsia-500/50 focus:outline-none transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-fuchsia-500/50 focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}

function BenefitsEditor({
  data,
  fields,
  onUpdateField,
  onUpdateCard,
}: {
  data: BenefitsContent;
  fields: FieldConfig[];
  onUpdateField: (key: string, value: string) => void;
  onUpdateCard: (index: number, field: 'title' | 'description', value: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Section heading/subtitle */}
      {fields.map((field) => {
        if (field.key !== 'heading' && field.key !== 'subtitle') return null;
        return (
          <FieldInput
            key={field.key}
            field={field}
            value={String((data as unknown as Record<string, unknown>)[field.key] ?? '')}
            onChange={(val) => onUpdateField(field.key, val)}
          />
        );
      })}

      {/* Benefit cards */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Картки переваг</h4>
        {data.cards.map((card, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
            <div className="text-xs font-medium text-gray-500">Картка {i + 1}</div>
            <FieldInput
              field={{ key: `card_${i}_title`, label: 'Заголовок', type: 'input', maxLength: 60 }}
              value={card.title}
              onChange={(val) => onUpdateCard(i, 'title', val)}
            />
            <FieldInput
              field={{ key: `card_${i}_desc`, label: 'Опис', type: 'textarea', maxLength: 200 }}
              value={card.description}
              onChange={(val) => onUpdateCard(i, 'description', val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
