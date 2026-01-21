-- Add new columns for detailed job applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS applicant_name TEXT,
ADD COLUMN IF NOT EXISTS applicant_email TEXT,
ADD COLUMN IF NOT EXISTS applicant_phone TEXT,
ADD COLUMN IF NOT EXISTS applicant_address TEXT;

-- Create storage bucket for resumes if it guarantees uniqueness
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'resumes' bucket
-- Allow public read access (so admins can download)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resumes' );

-- Allow authenticated users to upload their resumes
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] != 'private'
);

-- Allow users to update their own resumes (optional but good practice)
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'resumes' AND owner = auth.uid() );

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'resumes' AND owner = auth.uid() );
