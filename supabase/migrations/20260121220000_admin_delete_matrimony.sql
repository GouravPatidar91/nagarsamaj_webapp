-- Fix foreign key constraint to allow cascading deletes
-- Drop existing constraint
ALTER TABLE public.matrimony_interests 
DROP CONSTRAINT IF EXISTS matrimony_interests_to_profile_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE public.matrimony_interests
ADD CONSTRAINT matrimony_interests_to_profile_id_fkey 
FOREIGN KEY (to_profile_id) 
REFERENCES public.matrimony_profiles(id) 
ON DELETE CASCADE;
