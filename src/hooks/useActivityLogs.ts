import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ActivityLog = Tables<'activity_logs'>;

// For admin dashboard - fetches all activity logs
export function useActivityLogs(entityType?: string) {
  return useQuery({
    queryKey: ['activity-logs', entityType],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (entityType && entityType !== 'all') {
        query = query.eq('entity_type', entityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
}

// For user notifications - fetches activity logs for a specific user
export function useUserActivityLogs(userId?: string) {
  return useQuery({
    queryKey: ['user-activity-logs', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!userId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
