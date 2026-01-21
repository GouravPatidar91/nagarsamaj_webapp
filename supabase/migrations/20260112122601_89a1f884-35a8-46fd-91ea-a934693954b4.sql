-- Drop the security definer views
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.businesses_public;

-- Create SECURITY INVOKER views instead (safer approach)
CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
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

CREATE VIEW public.businesses_public 
WITH (security_invoker = true)
AS
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