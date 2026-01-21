import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type ChatChannel = Tables<'chat_channels'> & {
  other_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};
export type ChatMessage = Tables<'chat_messages'>;
export type ChatMessageInsert = TablesInsert<'chat_messages'>;

export type ChatMessageWithProfile = ChatMessage & {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

// Direct Message Types
export type DirectMessage = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  read: boolean;
  created_at: string;
  from_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  to_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type DirectMessageThread = {
  other_user_id: string;
  other_user_name: string | null;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

export function useChatChannels(userId?: string) {
  const queryClient = useQueryClient();

  // Set up realtime subscription for new channel memberships (e.g. when someone DMs you)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-channels-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_members',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['chat-channels', userId],
    queryFn: async () => {
      // 1. Fetch all channels visible to the user
      const { data: channels, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (!channels) return [];

      // 2. Identify private channels to fetch details for
      const privateChannels = channels.filter(c => c.is_private);
      if (privateChannels.length === 0 || !userId) {
        return channels as ChatChannel[];
      }

      // 3. For private channels, we need to know the OTHER member to display their name
      const privateChannelIds = privateChannels.map(c => c.id);

      const { data: members, error: membersError } = await supabase
        .from('channel_members')
        .select('channel_id, user_id')
        .in('channel_id', privateChannelIds)
        .neq('user_id', userId); // Get the OTHER user

      if (membersError) throw membersError;

      // 4. Fetch profiles for these other users
      const otherUserIds = members?.map(m => m.user_id) || [];

      if (otherUserIds.length === 0) return channels as ChatChannel[];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', otherUserIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      const channelToMemberMap = new Map(members?.map(m => [m.channel_id, m.user_id]));

      // 5. Merge profile info into channels
      return channels.map(channel => {
        if (!channel.is_private) return channel;

        const otherUserId = channelToMemberMap.get(channel.id);
        const otherProfile = otherUserId ? profileMap.get(otherUserId) : null;

        return {
          ...channel,
          other_profile: otherProfile
        };
      }) as ChatChannel[];
    },
    enabled: true,
    refetchInterval: 5000,
  });
}

export function useChatMessages(channelId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat-messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];

      // 1. Fetch messages
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (msgError) throw msgError;
      if (!messages || messages.length === 0) return [];

      // 2. Fetch profiles for these users
      const userIds = Array.from(new Set(messages.map(m => m.user_id)));

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // 3. Map profiles to users
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // 4. Combine data
      return messages.map(m => ({
        ...m,
        profile: profileMap.get(m.user_id) || null
      })) as ChatMessageWithProfile[];
    },
    enabled: !!channelId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`chat-messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', channelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: ChatMessageInsert) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', data.channel_id] });
    },
  });
}

// ============ NEW DIRECT MESSAGE HOOKS ============

export function useDirectMessageThreads(userId?: string) {
  const queryClient = useQueryClient();

  // Set up realtime subscription for new DMs
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-dms-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `to_user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dm-threads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['dm-threads', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get all unique conversation partners
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('from_user_id, to_user_id, content, created_at, read')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      // Group by conversation partner
      const conversationMap = new Map<string, {
        lastMessage: string;
        lastMessageAt: string;
        unreadCount: number;
      }>();

      messages.forEach(msg => {
        const otherUserId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;

        if (!conversationMap.has(otherUserId)) {
          const unreadCount = messages.filter(
            m => m.to_user_id === userId && m.from_user_id === otherUserId && !m.read
          ).length;

          conversationMap.set(otherUserId, {
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unreadCount,
          });
        }
      });

      // Fetch profiles for all conversation partners
      const otherUserIds = Array.from(conversationMap.keys());
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', otherUserIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // Combine data
      return Array.from(conversationMap.entries()).map(([otherUserId, data]) => {
        const profile = profileMap.get(otherUserId);
        return {
          other_user_id: otherUserId,
          other_user_name: profile?.full_name || 'Unknown User',
          other_user_avatar: profile?.avatar_url || null,
          last_message: data.lastMessage,
          last_message_at: data.lastMessageAt,
          unread_count: data.unreadCount,
        } as DirectMessageThread;
      }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });
}

export function useDirectMessages(currentUserId?: string, otherUserId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['direct-messages', currentUserId, otherUserId],
    queryFn: async () => {
      if (!currentUserId || !otherUserId) return [];

      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(from_user_id.eq.${currentUserId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      // Fetch both user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', [currentUserId, otherUserId]);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return (messages as any[]).map(m => ({
        ...m,
        from_profile: profileMap.get(m.from_user_id) || null,
        to_profile: profileMap.get(m.to_user_id) || null,
      })) as DirectMessage[];
    },
    enabled: !!currentUserId && !!otherUserId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const channel = supabase
      .channel(`dm-${currentUserId}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload: any) => {
          // Only invalidate if this message is part of this conversation
          const msg = payload.new;
          if (
            (msg.from_user_id === currentUserId && msg.to_user_id === otherUserId) ||
            (msg.from_user_id === otherUserId && msg.to_user_id === currentUserId)
          ) {
            queryClient.invalidateQueries({ queryKey: ['direct-messages', currentUserId, otherUserId] });
            queryClient.invalidateQueries({ queryKey: ['dm-threads'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, queryClient]);

  return query;
}

export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fromUserId, toUserId, content }: { fromUserId: string; toUserId: string; content: string }) => {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dm-threads'] });
    },
  });
}

// ============ LEGACY CHANNEL HOOKS (Keep for public channels) ============

export function useJoinChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, userId }: { channelId: string; userId: string }) => {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-members'] });
    },
  });
}

export function useAllChatChannels() {
  return useQuery({
    queryKey: ['chat-channels', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ChatChannel[];
    },
  });
}

export const useChannels = useAllChatChannels;

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chat_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
    },
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channel: { name: string; description?: string | null; is_private?: boolean; created_by?: string }) => {
      const { data, error } = await supabase
        .from('chat_channels')
        .insert(channel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string | null; is_private?: boolean }) => {
      const { data, error } = await supabase
        .from('chat_channels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
    },
  });
}
