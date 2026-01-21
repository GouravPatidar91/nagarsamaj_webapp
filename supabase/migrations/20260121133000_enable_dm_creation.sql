-- Allow authenticated users to create private chat channels (DMs)
CREATE OR REPLACE POLICY "Users can create private channels" 
ON public.chat_channels 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = created_by 
  AND is_private = true
);

-- Allow channel creators to add members (for DMs)
CREATE POLICY "Creators can add members" 
ON public.channel_members 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.chat_channels 
    WHERE id = channel_id 
    AND created_by = auth.uid()
  )
);

-- Allow users to view channels they are a member of (including private ones)
DROP POLICY IF EXISTS "Public channels viewable by authenticated users" ON public.chat_channels;

CREATE POLICY "Channels viewable by members or public" 
ON public.chat_channels 
FOR SELECT 
TO authenticated 
USING (
  NOT is_private 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.channel_members 
    WHERE channel_id = id 
    AND user_id = auth.uid()
  )
  OR
  created_by = auth.uid()
);
