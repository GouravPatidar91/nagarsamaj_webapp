import { useState } from 'react';
import { Plus, Trash2, Edit, MoreHorizontal, Lock, Unlock, MessageSquare } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel } from '@/hooks/useChat';
import { Skeleton } from '@/components/ui/skeleton';

interface ChannelForm {
  name: string;
  description: string;
  is_private: boolean;
}

const defaultForm: ChannelForm = {
  name: '',
  description: '',
  is_private: false,
};

export function AdminChatTab() {
  const { toast } = useToast();
  const { data: channels, isLoading } = useChannels();
  const createMutation = useCreateChannel();
  const updateMutation = useUpdateChannel();
  const deleteMutation = useDeleteChannel();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChannelForm>(defaultForm);

  const handleSubmit = async () => {
    if (!form.name) {
      toast({ title: 'Error', description: 'Please enter a channel name', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: form.name,
          description: form.description || null,
          is_private: form.is_private,
        });
        toast({ title: 'Channel updated' });
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          description: form.description || null,
          is_private: form.is_private,
        });
        toast({ title: 'Channel created' });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (channel: any) => {
    setEditingId(channel.id);
    setForm({
      name: channel.name,
      description: channel.description || '',
      is_private: channel.is_private || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this channel? All messages will be lost.')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Channel deleted' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

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
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h3 className="font-semibold">Chat Channels ({channels?.length || 0})</h3>
        <Button onClick={() => { setForm(defaultForm); setEditingId(null); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Channel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Channel</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Description</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Visibility</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Created</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {channels?.map((channel) => (
              <tr key={channel.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground max-w-xs truncate">
                  {channel.description || '-'}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    channel.is_private ? 'bg-yellow-500/20 text-yellow-500' : 'bg-accent/20 text-accent'
                  }`}>
                    {channel.is_private ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {channel.is_private ? 'Private' : 'Public'}
                  </span>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(channel.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => handleEdit(channel)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(channel.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!channels || channels.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No chat channels found. Create your first channel!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Channel' : 'Create Channel'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the channel details below.' : 'Create a new chat channel for your community.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Channel Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. General Discussion"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What's this channel about?"
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Private Channel</Label>
                <p className="text-sm text-muted-foreground">Only invited members can see this channel</p>
              </div>
              <Switch
                checked={form.is_private}
                onCheckedChange={(checked) => setForm({ ...form, is_private: checked })}
              />
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
