CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  title TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  original_price INTEGER NOT NULL CHECK (original_price > 0),
  features TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  urgency TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON pricing_tiers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public read active" ON pricing_tiers
  FOR SELECT USING (is_active = true);

-- Seed existing tiers (production values from MarketingCourseLanding.tsx)
INSERT INTO pricing_tiers (slug, title, price, original_price, features, is_popular, urgency, sort_order)
VALUES
  ('basic', 'Базовий', 799, 1200,
   ARRAY['Доступ до 12 модулів', 'Шаблони стратегій', 'Доступ до чату учнів', 'Сертифікат про завершення'],
   false, NULL, 0),
  ('premium', 'Преміум', 7999, 12800,
   ARRAY['Все з Базового', '2 групові сесії зі мною', 'Перевірка ДЗ кураторами', 'Закритий чат з фахівцями', 'Бонус: гайд по креативах', 'Доступ на 12 місяців'],
   true, NULL, 1),
  ('vip', 'VIP', 12999, 19999,
   ARRAY['Все з Преміум', 'Особистий менторинг (3 зустрічі)', 'Аудит твоєї поточної реклами', 'Розробка стратегії під ключ', 'Пріоритетна підтримка 24/7'],
   false, 'Залишилось 3 місця', 2)
ON CONFLICT (slug) DO NOTHING;
