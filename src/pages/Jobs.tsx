import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useJobs, useSavedJobs, useSaveJob, useUnsaveJob, useApplyToJob } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { data: jobs, isLoading } = useJobs();
  const { data: savedJobIds } = useSavedJobs(user?.id);
  const { mutate: saveJob } = useSaveJob();
  const { mutate: unsaveJob } = useUnsaveJob();
  const { mutateAsync: applyToJob } = useApplyToJob();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const { toast } = useToast();

  // Set first job as selected when jobs load
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

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
              <h2 className="text-2xl font-display font-bold mb-2">No Jobs Available</h2>
              <p className="text-muted-foreground">Check back soon for new opportunities!</p>
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
            <h1 className="heading-display mb-4">Job Board</h1>
            <p className="text-xl text-muted-foreground">
              Exclusive career opportunities from our trusted network of employers.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Job List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-4"
            >
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  onClick={() => setSelectedJob(job)}
                  className={`card-elevated cursor-pointer transition-all ${selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(job.id);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {savedJobIds?.includes(job.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">{job.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="bg-secondary px-2 py-0.5 rounded">{job.job_type}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Job Detail */}
            {selectedJob && (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                <div className="card-elevated sticky top-28">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-display font-bold mb-2">{selectedJob.title}</h2>
                      <p className="text-lg text-muted-foreground">{selectedJob.company}</p>
                    </div>
                    <button
                      onClick={() => toggleSave(selectedJob.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
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
                      <span>Posted {new Date(selectedJob.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedJob.salary_range && (
                    <div className="mb-8">
                      <h3 className="font-display font-semibold text-lg mb-3">Salary Range</h3>
                      <p className="text-2xl font-semibold gradient-text">{selectedJob.salary_range}</p>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="font-display font-semibold text-lg mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {selectedJob.requirements && (
                    <div className="mb-8">
                      <h3 className="font-display font-semibold text-lg mb-3">Requirements</h3>
                      <div
                        className="text-muted-foreground space-y-2 [&>ul]:ml-6 [&>ul>li]:list-disc"
                        dangerouslySetInnerHTML={{ __html: selectedJob.requirements }}
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button className="btn-gold flex-1" onClick={handleApplyClick}>
                      Apply Now
                    </Button>
                    <Button variant="outline" onClick={() => toggleSave(selectedJob.id)}>
                      {savedJobIds?.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                    </Button>
                  </div>

                  {selectedJob.application_deadline && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Application deadline: {new Date(selectedJob.application_deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
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