import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ActivityLog = Tables<'activity_logs'>;

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
