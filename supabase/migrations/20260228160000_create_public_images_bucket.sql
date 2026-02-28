-- Create the public-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public-images bucket

-- 1. Allow public read access to anyone
CREATE POLICY "Public access to public-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-images');

-- 2. Allow authenticated users to upload images
-- (We use authenticated so any logged-in admin can upload)
CREATE POLICY "Authenticated users can upload images to public-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public-images');

-- 3. Allow authenticated users to update their own uploads (optional, but good)
CREATE POLICY "Authenticated users can update their own images in public-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'public-images' AND auth.uid() = owner);

-- 4. Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their own images in public-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'public-images' AND auth.uid() = owner);
