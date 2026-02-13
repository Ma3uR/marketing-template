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
    .header { background: linear-gradient(135deg, #fb7185, #d946ef); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
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
      <p>&copy; 2026 Курс Маркетингу. Всі права захищені.</p>
    </div>
  </div>
</body>
</html>`,
      variables: ['customer_name'],
      is_active: true,
    };

    return <EmailEditor template={newTemplate as EmailTemplate} isNew />;
  }

  const template = await getTemplate(slug);

  if (!template) {
    notFound();
  }

  return <EmailEditor template={template} />;
}
