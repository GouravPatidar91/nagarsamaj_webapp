-- Create a secure function to get or create a DM channel
CREATE OR REPLACE FUNCTION public.get_or_create_dm(target_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Run as database owner to bypass RLS checks for channel/member existence
AS $$
DECLARE
  current_user_id UUID;
  channel_name TEXT;
  channel_id UUID;
  sorted_ids UUID[];
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create deterministic name
  IF current_user_id < target_user_id THEN
    sorted_ids := ARRAY[current_user_id, target_user_id];
  ELSE
    sorted_ids := ARRAY[target_user_id, current_user_id];
  END IF;
  
  channel_name := 'dm_' || sorted_ids[1] || '_' || sorted_ids[2];

  -- Check if channel exists
  SELECT id INTO channel_id
  FROM public.chat_channels
  WHERE name = channel_name;

  -- If exists, ensure members exist (idempotent fix for broken channels)
  IF channel_id IS NOT NULL THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    VALUES 
      (channel_id, current_user_id),
      (channel_id, target_user_id)
    ON CONFLICT (channel_id, user_id) DO NOTHING;
    
    RETURN channel_id;
  END IF;

  -- Create new channel
  INSERT INTO public.chat_channels (name, description, is_private, created_by)
  VALUES (channel_name, 'Direct message', true, current_user_id)
  RETURNING id INTO channel_id;

  -- Add members
  INSERT INTO public.channel_members (channel_id, user_id)
  VALUES 
    (channel_id, current_user_id),
    (channel_id, target_user_id);

  RETURN channel_id;
END;
$$;
