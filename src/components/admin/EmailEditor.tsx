'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { replaceTemplateVariables } from '@/lib/email-templates';
import { Save, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import type { EmailTemplate } from '@/types/database';
import GlassCard from './GlassCard';

interface EmailEditorProps {
  template: EmailTemplate;
  isNew?: boolean;
}

const sampleVariables = {
  customer_name: 'Олександр',
  customer_email: 'alex@example.com',
  product_name: 'Курс Преміум',
  amount: '5',
  currency: 'UAH',
  order_reference: 'premium_1234567890',
};

export default function EmailEditor({ template, isNew }: EmailEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    slug: template.slug,
    name: template.name,
    subject: template.subject,
    body_html: template.body_html,
    variables: template.variables || [],
    is_active: template.is_active,
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isNew) {
        const { error: insertError } = await supabase
          .from('email_templates')
          .insert({
            slug: formData.slug,
            name: formData.name,
            subject: formData.subject,
            body_html: formData.body_html,
            variables: formData.variables,
            is_active: formData.is_active,
          } as never);

        if (insertError) throw insertError;
        setSuccess('Шаблон створено!');
        router.push(`/admin/emails/${formData.slug}`);
      } else {
        const { error: updateError } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body_html: formData.body_html,
            variables: formData.variables,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('slug', template.slug);

        if (updateError) throw updateError;
        setSuccess('Зміни збережено!');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей шаблон?')) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('email_templates')
        .delete()
        .eq('slug', template.slug);

      if (deleteError) throw deleteError;
      router.push('/admin/emails');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення');
      setDeleting(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body_html') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body_html;
      const placeholder = `{{${variable}}}`;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData({ ...formData, body_html: newText });
    }
  };

  const previewHtml = replaceTemplateVariables(formData.body_html, sampleVariables);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/emails')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isNew ? 'Новий шаблон' : 'Редактор шаблону'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isNew ? 'Створення нового email шаблону' : formData.name}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 md:flex-none px-6 py-3 bg-white/5 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Видалити
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isNew ? 'Створити' : 'Зберегти'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <GlassCard className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={!isNew}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Назва
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Тема листа
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Вміст (HTML/Text)
            </label>
            <textarea
              id="body_html"
              value={formData.body_html}
              onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
              className="flex-1 min-h-[300px] w-full bg-black/40 border border-white/10 rounded-xl p-6 text-white font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-600">ДОСТУПНІ ЗМІННІ</p>
            <div className="flex flex-wrap gap-2">
              {['customer_name', 'product_name', 'amount', 'order_reference'].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable(tag)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {'{{' + tag + '}}'}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
            <span className="text-sm text-gray-300">Активний</span>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  previewMode === 'desktop'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  previewMode === 'mobile'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            className={`flex-1 overflow-hidden transition-all duration-300 ${
              previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
            }`}
          >
            <GlassCard className="h-full p-0 flex flex-col border-white/20">
              <div className="bg-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                  Email Preview Mode
                </div>
                <div className="w-10" />
              </div>
              <div className="bg-white px-4 py-6 h-full overflow-auto">
                <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <strong>Тема:</strong>{' '}
                  {replaceTemplateVariables(formData.subject, sampleVariables)}
                </div>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
