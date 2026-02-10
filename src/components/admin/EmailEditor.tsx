'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { replaceTemplateVariables } from '@/lib/email-templates';
import { Save, Eye, EyeOff, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import type { EmailTemplate } from '@/types/database';

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
  const [showPreview, setShowPreview] = useState(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/emails')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до списку
        </button>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? 'Створити' : 'Зберегти'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 space-y-4">
            {isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug (ідентифікатор)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="purchase_confirmation"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Назва шаблону
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Підтвердження покупки"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Тема листа
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Дякуємо за покупку!"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  HTML контент
                </label>
                <div className="flex items-center gap-2">
                  {['customer_name', 'product_name', 'amount', 'order_reference'].map(
                    (v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        {`{{${v}}}`}
                      </button>
                    )
                  )}
                </div>
              </div>
              <textarea
                id="body_html"
                value={formData.body_html}
                onChange={(e) =>
                  setFormData({ ...formData, body_html: e.target.value })
                }
                rows={20}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                placeholder="<!DOCTYPE html>..."
              />
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
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
              <span className="text-sm text-gray-300">Активний</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Попередній перегляд</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Сховати
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Показати
                </>
              )}
            </button>
          </div>

          {showPreview && (
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 bg-gray-100 border-b text-sm text-gray-600">
                <strong>Тема:</strong>{' '}
                {replaceTemplateVariables(formData.subject, sampleVariables)}
              </div>
              <div
                className="p-0"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
