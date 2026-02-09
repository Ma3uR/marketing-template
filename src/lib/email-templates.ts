export interface TemplateVariables {
  customer_name?: string;
  customer_email?: string;
  product_name?: string;
  amount?: string | number;
  currency?: string;
  order_reference?: string;
  [key: string]: string | number | undefined;
}

export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value ?? ''));
  }

  return result;
}

export function getDefaultTemplates() {
  return [
    {
      slug: 'purchase_confirmation',
      name: 'Підтвердження покупки',
      subject: 'Дякуємо за покупку курсу!',
      body_html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Дякуємо за покупку!</h1>
    </div>
    <div class="content">
      <p>Привіт, {{customer_name}}!</p>
      <p>Ваше замовлення <strong>#{{order_reference}}</strong> успішно оплачено.</p>
      <p><strong>Деталі замовлення:</strong></p>
      <ul>
        <li>Курс: {{product_name}}</li>
        <li>Сума: {{amount}} {{currency}}</li>
      </ul>
      <p>Найближчим часом ви отримаєте доступ до матеріалів курсу.</p>
      <p>Якщо у вас є питання, зверніться до нашої підтримки.</p>
    </div>
    <div class="footer">
      <p>© 2024 Курс Маркетингу. Всі права захищені.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
      variables: ['customer_name', 'order_reference', 'product_name', 'amount', 'currency'],
    },
    {
      slug: 'welcome',
      name: 'Вітальний лист',
      subject: 'Ласкаво просимо до курсу!',
      body_html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ласкаво просимо!</h1>
    </div>
    <div class="content">
      <p>Привіт, {{customer_name}}!</p>
      <p>Раді вітати вас у нашій спільноті!</p>
      <p>Ви отримали доступ до курсу <strong>{{product_name}}</strong>.</p>
      <p>Бажаємо вам успішного навчання та досягнення всіх поставлених цілей!</p>
      <a href="#" class="button">Перейти до курсу</a>
    </div>
    <div class="footer">
      <p>© 2024 Курс Маркетингу. Всі права захищені.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
      variables: ['customer_name', 'product_name'],
    },
  ];
}
