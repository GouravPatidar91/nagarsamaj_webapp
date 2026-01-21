import { useState } from 'react';
import { Plus, Trash2, Edit, MoreHorizontal, Check, X, Eye } from 'lucide-react';
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
import { useAllBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/hooks/useBusinesses';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['Restaurant', 'Retail', 'Services', 'Healthcare', 'Education', 'Technology', 'Real Estate', 'Other'];

interface BusinessForm {
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  image_url: string;
  status: string;
}

const defaultForm: BusinessForm = {
  name: '',
  category: 'Other',
  description: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  whatsapp: '',
  image_url: '',
  status: 'pending',
};

export function AdminBusinessesTab() {
  const { toast } = useToast();
  const { data: businesses, isLoading } = useAllBusinesses();
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const deleteMutation = useDeleteBusiness();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BusinessForm>(defaultForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.category) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: form.name,
          category: form.category,
          description: form.description || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          whatsapp: form.whatsapp || null,
          image_url: form.image_url || null,
          status: form.status,
        });
        toast({ title: 'Business updated' });
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          category: form.category,
          description: form.description || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          whatsapp: form.whatsapp || null,
          image_url: form.image_url || null,
          status: form.status,
        });
        toast({ title: 'Business created' });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (business: any) => {
    setEditingId(business.id);
    setForm({
      name: business.name,
      category: business.category,
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      website: business.website || '',
      whatsapp: business.whatsapp || '',
      image_url: business.image_url || '',
      status: business.status || 'pending',
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast({ title: `Business ${status}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this business?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Business deleted' });
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

  const filteredBusinesses = businesses?.filter(business => {
    const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
    const matchesSearch = !searchQuery || 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h3 className="font-semibold">Businesses ({filteredBusinesses?.length || 0})</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search businesses..."
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
            <Plus className="w-4 h-4 mr-2" /> Add Business
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Business</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Category</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Location</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses?.map((business) => (
              <tr key={business.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4 font-medium max-w-xs truncate">{business.name}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                    {business.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-muted-foreground max-w-xs truncate">
                  {business.address || '-'}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(business.status || 'pending')}`}>
                    {business.status}
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
                      {business.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(business.id, 'approved')}>
                            <Check className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(business.id, 'rejected')}>
                            <X className="w-4 h-4 mr-2" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleEdit(business)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(business.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!businesses || businesses.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No businesses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Business' : 'Add Business'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the business details below.' : 'Fill in the details to add a new business.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Business Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Business name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Business address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@business.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Business description..."
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
