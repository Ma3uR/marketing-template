import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Mail, Plus, Code, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { EmailTemplate } from '@/types/database';
import GlassCard from '@/components/admin/GlassCard';

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
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Шаблони листів</h2>
          <p className="text-gray-500">
            Керуйте автоматичними розсилками для ваших клієнтів
          </p>
        </div>
        <Link
          href="/admin/emails/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Створити шаблон
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/emails/new"
          className="group border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-rose-500/50 hover:bg-rose-500/5 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-gray-500 group-hover:text-rose-500" />
          </div>
          <span className="text-gray-500 font-medium group-hover:text-rose-500">
            Створити новий шаблон
          </span>
        </Link>

        {templates.map((template) => (
          <GlassCard key={template.id} hover className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 text-rose-500">
                <Mail className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded-full ${
                  template.is_active
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                }`}
              >
                {template.is_active ? 'АКТИВНИЙ' : 'ЧЕРНЕТКА'}
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-1">{template.name}</h4>
            <p className="text-sm text-gray-500 mb-6 truncate">{template.subject}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {(template.variables || []).map((v) => (
                <span
                  key={v}
                  className="text-[10px] font-mono bg-white/5 text-gray-400 px-2 py-1 rounded"
                >
                  {'{{' + v + '}}'}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-gray-600 italic">
                Оновлено{' '}
                {format(new Date(template.updated_at), 'dd MMM yyyy', {
                  locale: uk,
                })}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/admin/emails/${template.slug}`}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Code className="w-4 h-4" />
                </Link>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
