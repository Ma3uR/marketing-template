-- Orders table (store payment callbacks)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  status TEXT NOT NULL, -- 'Approved', 'Declined', 'Refunded', etc.
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  product_name TEXT,
  card_pan TEXT,
  card_type TEXT,
  payment_system TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'purchase_confirmation', 'welcome', etc.
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}', -- ['customer_name', 'product_name', 'amount']
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users (whitelist)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies: Only authenticated admins can access
CREATE POLICY "Admin access only for orders" ON orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access only for email_templates" ON email_templates
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access only for admin_users" ON admin_users
  FOR SELECT USING (public.is_admin());

-- Service role bypass for API routes (inserting orders from webhooks)
-- Note: Use service role key in server-side code for order insertion

-- Insert default email templates
INSERT INTO email_templates (slug, name, subject, body_html, variables)
VALUES
  (
    'purchase_confirmation',
    'Підтвердження покупки',
    'Дякуємо за покупку курсу!',
    '<!DOCTYPE html>
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
    </div>
    <div class="footer">
      <p>© 2024 Курс Маркетингу. Всі права захищені.</p>
    </div>
  </div>
</body>
</html>',
    ARRAY['customer_name', 'order_reference', 'product_name', 'amount', 'currency']
  ),
  (
    'welcome',
    'Вітальний лист',
    'Ласкаво просимо до курсу!',
    '<!DOCTYPE html>
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
      <p>Бажаємо вам успішного навчання!</p>
      <a href="#" class="button">Перейти до курсу</a>
    </div>
    <div class="footer">
      <p>© 2024 Курс Маркетингу. Всі права захищені.</p>
    </div>
  </div>
</body>
</html>',
    ARRAY['customer_name', 'product_name']
  )
ON CONFLICT (slug) DO NOTHING;

-- IMPORTANT: After running this migration, add your admin email:
-- INSERT INTO admin_users (email) VALUES ('your-admin-email@example.com');
