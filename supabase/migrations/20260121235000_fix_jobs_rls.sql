-- Allow admins to update job applications (e.g. changing status)
CREATE POLICY "Admins can update applications" ON public.job_applications
  FOR UPDATE
  USING (public.is_admin(auth.uid()));
