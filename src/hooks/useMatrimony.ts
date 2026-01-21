import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type MatrimonyProfile = Tables<'matrimony_profiles'>;
export type MatrimonyProfileInsert = TablesInsert<'matrimony_profiles'>;
export type MatrimonyProfileUpdate = TablesUpdate<'matrimony_profiles'>;

export function useMatrimonyProfiles() {
  return useQuery({
    queryKey: ['matrimony-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matrimony_profiles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MatrimonyProfile[];
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function useAllMatrimonyProfiles() {
  return useQuery({
    queryKey: ['matrimony-profiles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matrimony_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MatrimonyProfile[];
    },
  });
}

export function useMyMatrimonyProfile(userId?: string) {
  return useQuery({
    queryKey: ['matrimony-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('matrimony_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as MatrimonyProfile | null;
    },
    enabled: !!userId,
  });
}

export function useMatrimonyInterests(userId?: string) {
  return useQuery({
    queryKey: ['matrimony-interests', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('matrimony_interests')
        .select('to_profile_id')
        .eq('from_user_id', userId);

      if (error) throw error;
      return data.map((item) => item.to_profile_id);
    },
    enabled: !!userId,
  });
}

export function useSendInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      userId,
      message,
      profileOwnerId, // Need to pass the profile owner's user_id
    }: {
      profileId: string;
      userId: string;
      message?: string;
      profileOwnerId: string;
    }) => {
      // 1. Get the interested user's profile details
      const { data: interestedUser } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();

      // 2. Get the matrimony profile details
      const { data: matrimonyProfile } = await supabase
        .from('matrimony_profiles')
        .select('full_name')
        .eq('id', profileId)
        .single();

      // 3. Insert the interest record
      const { data, error } = await supabase
        .from('matrimony_interests')
        .insert({
          to_profile_id: profileId,
          from_user_id: userId,
          message,
        })
        .select()
        .single();

      if (error) throw error;

      // 4. Create notification/activity log for the profile owner
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: profileOwnerId,
          action: 'matrimony_interest_received',
          entity_type: 'matrimony_interest',
          entity_id: data.id,
          details: {
            from_user_id: userId,
            from_user_name: interestedUser?.full_name || 'Unknown User',
            profile_id: profileId,
            profile_name: matrimonyProfile?.full_name || 'Unknown',
            message: message || null,
          },
        });

      if (logError) {
        console.error('Failed to create notification:', logError);
        // Don't throw - interest was still created successfully
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matrimony-interests'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
}

export function useCreateMatrimonyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: MatrimonyProfileInsert) => {
      const { data, error } = await supabase
        .from('matrimony_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matrimony-profiles'] });
    },
  });
}

export function useUpdateMatrimonyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: MatrimonyProfileUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('matrimony_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matrimony-profiles'] });
    },
  });
}

export function useDeleteMatrimonyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('matrimony_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matrimony-profiles'] });
    },
  });
}
