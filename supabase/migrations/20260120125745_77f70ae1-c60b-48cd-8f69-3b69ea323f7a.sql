-- Create storage bucket for matrimony photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('matrimony-photos', 'matrimony-photos', true);

-- Policy: Anyone can view matrimony photos (public bucket)
CREATE POLICY "Matrimony photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'matrimony-photos');

-- Policy: Authenticated users can upload their own photos
CREATE POLICY "Users can upload matrimony photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'matrimony-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their own matrimony photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'matrimony-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own matrimony photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'matrimony-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);