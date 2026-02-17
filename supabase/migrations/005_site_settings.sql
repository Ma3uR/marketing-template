-- Site settings key-value store (hero image URL, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (landing page needs hero image URL)
CREATE POLICY "Public read site settings" ON site_settings
  FOR SELECT USING (true);

-- Only admins can modify settings
CREATE POLICY "Admin write site settings" ON site_settings
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin update site settings" ON site_settings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin delete site settings" ON site_settings
  FOR DELETE USING (public.is_admin());
