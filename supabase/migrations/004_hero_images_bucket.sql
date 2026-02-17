-- Create hero-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images', 'hero-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access (images shown on landing page)
DO $$ BEGIN
  CREATE POLICY "Public read hero images" ON storage.objects
    FOR SELECT USING (bucket_id = 'hero-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow admin upload/overwrite
DO $$ BEGIN
  CREATE POLICY "Admin insert hero images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow admin update (upsert)
DO $$ BEGIN
  CREATE POLICY "Admin update hero images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'hero-images' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow admin delete
DO $$ BEGIN
  CREATE POLICY "Admin delete hero images" ON storage.objects
    FOR DELETE USING (bucket_id = 'hero-images' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
