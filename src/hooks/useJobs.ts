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
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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
      applicantDetails,
      resumeFile,
    }: {
      jobId: string;
      userId: string;
      coverLetter?: string;
      applicantDetails: {
        name: string;
        email: string;
        phone: string;
        address: string;
      };
      resumeFile?: File;
    }) => {
      let resumeUrl = null;

      // 1. Upload Resume if provided
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      // 2. Submit job application with all details
      const { data: application, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          cover_letter: coverLetter,
          applicant_name: applicantDetails.name,
          applicant_email: applicantDetails.email,
          applicant_phone: applicantDetails.phone,
          applicant_address: applicantDetails.address,
          resume_url: resumeUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Get job details to find the job creator
      const { data: job } = await supabase
        .from('jobs')
        .select('posted_by, title')
        .eq('id', jobId)
        .single();

      // 4. Create activity log for admin/job poster
      if (job?.posted_by) {
        const logDetails = {
          job_id: jobId,
          job_title: job.title,
          applicant_id: userId,
          applicant_name: applicantDetails.name,
          applicant_email: applicantDetails.email,
          applicant_phone: applicantDetails.phone,
          applicant_address: applicantDetails.address,
          resume_link: resumeUrl,
        };

        console.log('Inserting Activity Log Details:', logDetails);

        await supabase
          .from('activity_logs')
          .insert({
            user_id: job.posted_by,
            action: 'job_application_received',
            entity_type: 'job_application',
            entity_id: application.id,
            details: logDetails,
          });
      }


      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
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

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useUpdateJobApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      userId,
      jobTitle
    }: {
      id: string;
      status: string;
      userId: string;
      jobTitle: string;
    }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Create notification for the applicant
      if (userId) {
        // Format status for display (e.g., 'accepted' -> 'Accepted')
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: `Application Update: ${displayStatus}`,
            message: `Your application for "${jobTitle}" has been moved to ${displayStatus}.`,
            type: 'job_status_update',
            link: '/jobs',
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
}
