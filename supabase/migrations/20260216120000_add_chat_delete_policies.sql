-- Allow users to delete their own channel messages
CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own direct messages
CREATE POLICY "Users can delete their own direct messages"
ON public.direct_messages
FOR DELETE
TO authenticated
USING (auth.uid() = from_user_id);
