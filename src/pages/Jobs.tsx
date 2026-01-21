import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { jobs } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleSave = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast({ title: 'Job removed from saved' });
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast({ title: 'Job saved successfully' });
    }
  };

  const handleApply = () => {
    toast({
      title: 'Application submitted!',
      description: `Your application for ${selectedJob.title} has been sent.`,
    });
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
                  className={`card-elevated cursor-pointer transition-all ${
                    selectedJob.id === job.id ? 'ring-2 ring-primary' : ''
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
                      {savedJobs.includes(job.id) ? (
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
                    <span className="bg-secondary px-2 py-0.5 rounded">{job.type}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Job Detail */}
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
                    {savedJobs.includes(selectedJob.id) ? (
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
                    <span>{selectedJob.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Posted {new Date(selectedJob.posted).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-display font-semibold text-lg mb-3">Salary Range</h3>
                  <p className="text-2xl font-semibold gradient-text">{selectedJob.salary}</p>
                </div>

                <div className="mb-8">
                  <h3 className="font-display font-semibold text-lg mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="mb-8">
                  <h3 className="font-display font-semibold text-lg mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button className="btn-gold flex-1" onClick={handleApply}>
                    Apply Now
                  </Button>
                  <Button variant="outline" onClick={() => toggleSave(selectedJob.id)}>
                    {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Application deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
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