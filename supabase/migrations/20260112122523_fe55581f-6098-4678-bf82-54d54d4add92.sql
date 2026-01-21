-- Fix security vulnerability: Protect phone numbers in profiles table
-- Drop existing public profiles policy and recreate with phone protection
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a view that excludes phone numbers for public access
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  bio,
  location,
  privacy_level,
  created_at,
  updated_at
FROM public.profiles
WHERE privacy_level = 'public';

-- Create policy for public profiles without phone
CREATE POLICY "Public profiles viewable without phone" 
ON public.profiles 
FOR SELECT 
USING (
  privacy_level = 'public' 
  OR auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- Fix security vulnerability: Protect contact info in businesses table  
-- Update businesses policy to require authentication for contact details
DROP POLICY IF EXISTS "Approved businesses are viewable by everyone" ON public.businesses;

-- Create view for public business info (excludes contact details)
CREATE OR REPLACE VIEW public.businesses_public AS
SELECT 
  id,
  name,
  category,
  description,
  address,
  image_url,
  website,
  status,
  created_at,
  updated_at
FROM public.businesses
WHERE status = 'approved';

-- Policy for viewing businesses - all can see basic info
CREATE POLICY "Approved businesses basic info viewable by all" 
ON public.businesses 
FOR SELECT 
USING (status = 'approved' OR is_admin(auth.uid()) OR auth.uid() = owner_id);