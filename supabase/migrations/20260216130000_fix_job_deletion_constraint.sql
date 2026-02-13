-- Fix foreign key constraint for saved_jobs to allow cascading deletes when a job is deleted
ALTER TABLE public.saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;

ALTER TABLE public.saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id)
  REFERENCES public.jobs(id)
  ON DELETE CASCADE;

-- Also ensure job_applications has cascading delete
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_job_id_fkey;

ALTER TABLE public.job_applications
  ADD CONSTRAINT job_applications_job_id_fkey
  FOREIGN KEY (job_id)
  REFERENCES public.jobs(id)
  ON DELETE CASCADE;
