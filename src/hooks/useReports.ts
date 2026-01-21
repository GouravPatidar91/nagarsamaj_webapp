import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Report = Tables<'reports'>;
export type ReportUpdate = TablesUpdate<'reports'>;

export function useReports(status?: string) {
  return useQuery({
    queryKey: ['reports', status],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Report[];
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ReportUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, resolution_note, resolved_by }: { id: string; resolution_note: string; resolved_by: string }) => {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolution_note,
          resolved_by,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
