-- Migration to secure the account_status from getting updated by standard users via mass assignment/API hacking

-- Create a security definer function to prevent non-admins from altering their status
CREATE OR REPLACE FUNCTION public.protect_account_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If account_status is being changed (Mass Assignment attempt via REST API)
  IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
    -- Check if the current user is an admin
    IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderation_admin')) THEN
      -- If not an admin, deny the modification by resetting it to the old value
      NEW.account_status = OLD.account_status;
      
      -- Optionally, we could RAISE EXCEPTION 'Not authorized to change account status';
      -- But silently reverting it is less disruptive to legitimate updates 
      -- (e.g. if the frontend sends the whole object back including the status).
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply the trigger to the profiles table
DROP TRIGGER IF EXISTS protect_account_status_trigger ON public.profiles;
CREATE TRIGGER protect_account_status_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_account_status();
