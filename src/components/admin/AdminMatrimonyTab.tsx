import { useState } from 'react';
import { Trash2, Edit, MoreHorizontal, Check, X, Eye } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAllMatrimonyProfiles, useUpdateMatrimonyProfile, useDeleteMatrimonyProfile } from '@/hooks/useMatrimony';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AdminMatrimonyTab() {
  const { toast } = useToast();
  const { data: profiles, isLoading } = useAllMatrimonyProfiles();
  const updateMutation = useUpdateMatrimonyProfile();
  const deleteMutation = useDeleteMatrimonyProfile();

  const [viewingProfile, setViewingProfile] = useState<any>(null);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast({ title: `Profile ${status}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Profile deleted' });
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
        <h3 className="font-semibold">Matrimony Profiles ({profiles?.length || 0})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Profile</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Age</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Occupation</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Location</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr key={profile.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={profile.photo_url || ''} />
                      <AvatarFallback>{profile.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{profile.gender || 'Not specified'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground">{profile.age || '-'}</td>
                <td className="py-4 px-4 text-muted-foreground">{profile.occupation || '-'}</td>
                <td className="py-4 px-4 text-muted-foreground">{profile.location || '-'}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(profile.status || 'pending')}`}>
                    {profile.status}
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
                      <DropdownMenuItem onClick={() => setViewingProfile(profile)}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      {profile.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(profile.id, 'approved')}>
                            <Check className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(profile.id, 'rejected')}>
                            <X className="w-4 h-4 mr-2" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleDelete(profile.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No matrimony profiles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>View complete profile information</DialogDescription>
          </DialogHeader>
          {viewingProfile && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={viewingProfile.photo_url || ''} />
                  <AvatarFallback className="text-2xl">{viewingProfile.full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewingProfile.full_name}</h3>
                  <p className="text-muted-foreground capitalize">{viewingProfile.gender}, {viewingProfile.age} years</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Occupation</p>
                  <p>{viewingProfile.occupation || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Education</p>
                  <p>{viewingProfile.education || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{viewingProfile.location || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(viewingProfile.status || 'pending')}`}>
                    {viewingProfile.status}
                  </span>
                </div>
              </div>
              {viewingProfile.about && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">About</p>
                  <p className="text-sm">{viewingProfile.about}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
