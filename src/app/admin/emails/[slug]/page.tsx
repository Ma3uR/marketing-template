import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EmailEditor from '@/components/admin/EmailEditor';
import type { EmailTemplate } from '@/types/database';

async function getTemplate(slug: string): Promise<EmailTemplate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as EmailTemplate;
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Handle "new" template case
  if (slug === 'new') {
    const newTemplate: Partial<EmailTemplate> = {
      slug: '',
      name: '',
      subject: '',
      body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Заголовок</h1>
    </div>
    <div class="content">
      <p>Привіт, {{customer_name}}!</p>
      <p>Ваш контент тут...</p>
    </div>
    <div class="footer">
      <p>© 2024 Курс Маркетингу. Всі права захищені.</p>
    </div>
  </div>
</body>
</html>`,
      variables: ['customer_name'],
      is_active: true,
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Новий шаблон</h1>
          <p className="text-gray-400 mt-1">
            Створення нового email шаблону
          </p>
        </div>
        <EmailEditor template={newTemplate as EmailTemplate} isNew />
      </div>
    );
  }

  const template = await getTemplate(slug);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{template.name}</h1>
        <p className="text-gray-400 mt-1">
          Редагування шаблону &quot;{template.slug}&quot;
        </p>
      </div>
      <EmailEditor template={template} />
    </div>
  );
}
