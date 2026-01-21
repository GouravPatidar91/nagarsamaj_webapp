import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Business = Tables<'businesses'>;
export type BusinessInsert = TablesInsert<'businesses'>;
export type BusinessUpdate = TablesUpdate<'businesses'>;

export function useBusinesses(category?: string, searchQuery?: string, includeAll?: boolean) {
  return useQuery({
    queryKey: ['businesses', category, searchQuery, includeAll],
    queryFn: async () => {
      let query = supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeAll) {
        query = query.eq('status', 'approved');
      }

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Business[];
    },
  });
}

export function useAllBusinesses() {
  return useQuery({
    queryKey: ['businesses', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Business[];
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (business: BusinessInsert) => {
      const { data, error } = await supabase
        .from('businesses')
        .insert(business)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BusinessUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}
