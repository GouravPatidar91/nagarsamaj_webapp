-- Create a simple direct_messages table for one-on-one chats
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure users can't message themselves
  CONSTRAINT different_users CHECK (from_user_id != to_user_id)
);

-- Index for fast queries
CREATE INDEX idx_direct_messages_from_user ON public.direct_messages(from_user_id, created_at DESC);
CREATE INDEX idx_direct_messages_to_user ON public.direct_messages(to_user_id, created_at DESC);
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(
  LEAST(from_user_id, to_user_id),
  GREATEST(from_user_id, to_user_id),
  created_at DESC
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their direct messages"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

-- Users can send direct messages
CREATE POLICY "Users can send direct messages"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = from_user_id
);

-- Users can mark their received messages as read
CREATE POLICY "Users can update received messages"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = to_user_id)
WITH CHECK (auth.uid() = to_user_id);

-- Create a view to get conversation threads with latest message info
CREATE OR REPLACE VIEW public.direct_message_threads AS
WITH latest_messages AS (
  SELECT DISTINCT ON (
    LEAST(from_user_id, to_user_id),
    GREATEST(from_user_id, to_user_id)
  )
    id,
    from_user_id,
    to_user_id,
    content,
    created_at,
    LEAST(from_user_id, to_user_id) as user1_id,
    GREATEST(from_user_id, to_user_id) as user2_id
  FROM public.direct_messages
  ORDER BY
    LEAST(from_user_id, to_user_id),
    GREATEST(from_user_id, to_user_id),
    created_at DESC
)
SELECT
  user1_id,
  user2_id,
  content as last_message,
  created_at as last_message_at,
  from_user_id as last_sender_id,
  to_user_id as last_recipient_id
FROM latest_messages;

-- Grant permissions
GRANT SELECT ON public.direct_message_threads TO authenticated;
