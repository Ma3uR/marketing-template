import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Mail, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { EmailTemplate } from '@/types/database';

async function getTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data as EmailTemplate[];
}

export default async function EmailTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Шаблони листів</h1>
          <p className="text-gray-400 mt-1">
            Редагування email шаблонів для автоматичних повідомлень
          </p>
        </div>
        <Link
          href="/admin/emails/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Новий шаблон
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 text-center">
          <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Шаблонів поки немає</p>
          <p className="text-sm text-gray-500 mt-2">
            Створіть перший шаблон для автоматичних листів
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/admin/emails/${template.slug}`}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {template.subject}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          template.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {template.is_active ? 'Активний' : 'Неактивний'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Оновлено:{' '}
                        {format(new Date(template.updated_at), 'dd MMM yyyy', {
                          locale: uk,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
