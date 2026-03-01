import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Bookmark, BookmarkCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useJobs, useSavedJobs, useSaveJob, useUnsaveJob, useApplyToJob } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

import { JobApplicationDialog, JobApplicationFormData } from '@/components/jobs/JobApplicationDialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function JobsContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: jobs, isLoading } = useJobs();
  const { data: savedJobIds } = useSavedJobs(user?.id);
  const { mutate: saveJob } = useSaveJob();
  const { mutate: unsaveJob } = useUnsaveJob();
  const { mutateAsync: applyToJob } = useApplyToJob();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const { toast } = useToast();

  // Scroll to top when a job is selected
  useEffect(() => {
    if (selectedJob) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedJob]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Layout>
        <section className="py-12 md:py-20">
          <div className="section-container">
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-display font-bold mb-2">{t('no_jobs_title')}</h2>
              <p className="text-muted-foreground">{t('no_jobs_desc')}</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const toggleSave = (jobId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to save jobs', variant: 'destructive' });
      return;
    }

    if (savedJobIds?.includes(jobId)) {
      unsaveJob({ jobId, userId: user.id });
      toast({ title: 'Job removed from saved' });
    } else {
      saveJob({ jobId, userId: user.id });
      toast({ title: 'Job saved successfully' });
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      toast({ title: 'Please sign in to apply', variant: 'destructive' });
      return;
    }
    setIsApplicationDialogOpen(true);
  };

  const handleApplicationSubmit = async (data: JobApplicationFormData) => {
    if (!user || !selectedJob) return;

    try {
      await applyToJob({
        jobId: selectedJob.id,
        userId: user.id,
        coverLetter: data.coverLetter,
        applicantDetails: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        },
        resumeFile: data.resume || undefined
      });

      toast({
        title: 'Application submitted!',
        description: `Your application for ${selectedJob.title} has been sent successfully.`,
      });
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: 'Application failed',
        description: 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to let the dialog know it failed
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <h1 className="heading-display mb-4">{t('jobs_page_title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('jobs_page_subtitle')}
            </p>
          </motion.div>

          {!selectedJob ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  onClick={() => setSelectedJob(job)}
                  className="card-elevated cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(job.id);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                    >
                      {savedJobIds?.includes(job.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1 break-words line-clamp-2">{job.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="bg-secondary px-2 py-0.5 rounded">{job.job_type}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={selectedJob.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setSelectedJob(null)}
                className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="card-elevated">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-6 gap-4">
                  <div className="flex-1 min-w-0 w-full sm:w-auto pr-4">
                    <h2 className="text-2xl font-display font-bold mb-2 break-words [word-break:break-word]">{selectedJob.title}</h2>
                    <p className="text-lg text-muted-foreground break-words [word-break:break-word]">{selectedJob.company}</p>
                  </div>
                  <button
                    onClick={() => toggleSave(selectedJob.id)}
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-1 sm:mt-0"
                  >
                    {savedJobIds?.includes(selectedJob.id) ? (
                      <BookmarkCheck className="w-6 h-6 text-primary" />
                    ) : (
                      <Bookmark className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{selectedJob.job_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{t('job_posted')} {new Date(selectedJob.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedJob.salary_range && (
                  <div className="mb-8">
                    <h3 className="font-display font-semibold text-lg mb-3">{t('job_salary_range')}</h3>
                    <p className="text-2xl font-semibold gradient-text">{selectedJob.salary_range}</p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="font-display font-semibold text-lg mb-3">{t('job_description')}</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {selectedJob.requirements && (
                  <div className="mb-8">
                    <h3 className="font-display font-semibold text-lg mb-3">{t('job_requirements')}</h3>
                    <div
                      className="text-muted-foreground space-y-2 [&>ul]:ml-6 [&>ul>li]:list-disc"
                      dangerouslySetInnerHTML={{ __html: selectedJob.requirements }}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border/50">
                  <Button className="btn-gold w-full sm:flex-1 py-6 text-lg" onClick={handleApplyClick}>
                    {t('btn_apply')}
                  </Button>
                  <Button className="w-full sm:w-auto py-6" variant="outline" onClick={() => toggleSave(selectedJob.id)}>
                    {savedJobIds?.includes(selectedJob.id) ? t('btn_saved') : t('btn_save')}
                  </Button>
                </div>

                {selectedJob.application_deadline && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {t('job_deadline')}: {new Date(selectedJob.application_deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {selectedJob && (
        <JobApplicationDialog
          isOpen={isApplicationDialogOpen}
          onClose={() => setIsApplicationDialogOpen(false)}
          jobTitle={selectedJob.title}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </Layout>
  );
}

export default function Jobs() {
  return (
    <ProtectedRoute>
      <JobsContent />
    </ProtectedRoute>
  );
}