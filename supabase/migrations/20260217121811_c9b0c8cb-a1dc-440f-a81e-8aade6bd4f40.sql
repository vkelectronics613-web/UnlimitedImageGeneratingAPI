
-- Add policies if they don't exist (bucket already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Generated images are publicly accessible' AND tablename = 'objects') THEN
    CREATE POLICY "Generated images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'generated-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can upload generated images' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can upload generated images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'generated-images');
  END IF;
END $$;
