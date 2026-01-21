import { useState } from 'react';
import { Plus, Trash2, Edit, MoreHorizontal, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAllEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';

interface EventForm {
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  location: string;
  image_url: string;
  max_attendees: number | null;
  status: string;
}

const defaultForm: EventForm = {
  title: '',
  description: '',
  event_date: '',
  end_date: '',
  location: '',
  image_url: '',
  max_attendees: null,
  status: 'pending',
};

export function AdminEventsTab() {
  const { toast } = useToast();
  const { data: events, isLoading } = useAllEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.event_date) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: form.title,
          description: form.description || null,
          event_date: form.event_date,
          end_date: form.end_date || null,
          location: form.location || null,
          image_url: form.image_url || null,
          max_attendees: form.max_attendees,
          status: form.status,
        });
        toast({ title: 'Event updated' });
      } else {
        await createMutation.mutateAsync({
          title: form.title,
          description: form.description || null,
          event_date: form.event_date,
          end_date: form.end_date || null,
          location: form.location || null,
          image_url: form.image_url || null,
          max_attendees: form.max_attendees,
          status: form.status,
        });
        toast({ title: 'Event created' });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      image_url: event.image_url || '',
      max_attendees: event.max_attendees,
      status: event.status || 'pending',
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast({ title: `Event ${status}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Event deleted' });
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

  const filteredEvents = events?.filter(event => {
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h3 className="font-semibold">Events ({filteredEvents?.length || 0})</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search events..."
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
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Event</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Date</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Location</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents?.map((event) => (
              <tr key={event.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4 font-medium max-w-xs truncate">{event.title}</td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(event.event_date).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-muted-foreground max-w-xs truncate">
                  {event.location || 'TBD'}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(event.status || 'pending')}`}>
                    {event.status}
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
                      {event.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'approved')}>
                            <Check className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'rejected')}>
                            <X className="w-4 h-4 mr-2" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleEdit(event)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Event location"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Attendees</Label>
                <Input
                  type="number"
                  value={form.max_attendees || ''}
                  onChange={(e) => setForm({ ...form, max_attendees: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
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
                  placeholder="Event description..."
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
