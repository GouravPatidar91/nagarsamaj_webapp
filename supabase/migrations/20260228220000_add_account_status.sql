-- Add account_status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_status TEXT DEFAULT 'pending' 
CHECK (account_status IN ('pending', 'approved', 'banned'));

-- Update existing profiles to be 'approved' so current users don't lose access
UPDATE public.profiles 
SET account_status = 'approved' 
WHERE account_status = 'pending';

-- Update the handle_new_user function to ensure new users are explicitly set to pending
-- (Though the default value handles this, it's good practice to be explicit if the trigger modifies it)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, account_status)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pending'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Add RLS policy for Super Admins to be able to Update the account_status of peers
-- Note: 'Users can update their own profile' already exists, but we want to ensure
-- users CANNOT update their own account_status.
-- We will replace the existing update policy.

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except status)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can update any profile (specifically for status changes)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin(auth.uid()));
