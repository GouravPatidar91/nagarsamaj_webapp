import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Job = Tables<'jobs'>;
export type JobInsert = TablesInsert<'jobs'>;
export type JobUpdate = TablesUpdate<'jobs'>;

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useAllJobs() {
  return useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useSavedJobs(userId?: string) {
  return useQuery({
    queryKey: ['saved-jobs', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map((item) => item.job_id);
    },
    enabled: !!userId,
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          job_id: jobId,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      userId,
      coverLetter,
    }: {
      jobId: string;
      userId: string;
      coverLetter?: string;
    }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          cover_letter: coverLetter,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: JobInsert) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: JobUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
