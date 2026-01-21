import { useState } from 'react';
import { Plus, Trash2, Edit, MoreHorizontal, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAllJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { Skeleton } from '@/components/ui/skeleton';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

interface JobForm {
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  job_type: string;
  salary_range: string;
  contact_email: string;
  status: string;
}

const defaultForm: JobForm = {
  title: '',
  company: '',
  description: '',
  requirements: '',
  location: '',
  job_type: 'Full-time',
  salary_range: '',
  contact_email: '',
  status: 'pending',
};

export function AdminJobsTab() {
  const { toast } = useToast();
  const { data: jobs, isLoading } = useAllJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const deleteMutation = useDeleteJob();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<JobForm>(defaultForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.company || !form.description) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: form.title,
          company: form.company,
          description: form.description,
          requirements: form.requirements || null,
          location: form.location || null,
          job_type: form.job_type || null,
          salary_range: form.salary_range || null,
          contact_email: form.contact_email || null,
          status: form.status,
        });
        toast({ title: 'Job updated' });
      } else {
        await createMutation.mutateAsync({
          title: form.title,
          company: form.company,
          description: form.description,
          requirements: form.requirements || null,
          location: form.location || null,
          job_type: form.job_type || null,
          salary_range: form.salary_range || null,
          contact_email: form.contact_email || null,
          status: form.status,
        });
        toast({ title: 'Job created' });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (job: any) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      salary_range: job.salary_range || '',
      contact_email: job.contact_email || '',
      status: job.status || 'pending',
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast({ title: `Job ${status}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Job deleted' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-accent/20 text-accent';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold">Jobs ({filteredJobs?.length || 0})</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setForm(defaultForm); setEditingId(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Job
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Position</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Company</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Type</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs?.map((job) => (
              <tr key={job.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4 font-medium max-w-xs truncate">{job.title}</td>
                <td className="py-4 px-4 text-muted-foreground">{job.company}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                    {job.job_type || 'Full-time'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(job.status || 'pending')}`}>
                    {job.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      {job.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'approved')}>
                            <Check className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'rejected')}>
                            <X className="w-4 h-4 mr-2" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleEdit(job)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(job.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!jobs || jobs.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Job' : 'Create Job'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the job details below.' : 'Fill in the details to post a new job.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Job Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Company *</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Company name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Job Type</Label>
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. New York, NY"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Salary Range</Label>
                <Input
                  value={form.salary_range}
                  onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                  placeholder="e.g. $80k - $100k"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="hr@company.com"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Job description..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Requirements</Label>
                <Textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Job requirements..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
