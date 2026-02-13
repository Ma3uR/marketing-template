CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  business TEXT,
  result TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON reviews
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public read visible" ON reviews
  FOR SELECT USING (is_visible = true);
