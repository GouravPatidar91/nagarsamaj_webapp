import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, MoreHorizontal, Check, X, ShieldBan, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';

export function AdminUsersTab() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateStatus = async (userId: string, newStatus: 'pending' | 'approved' | 'banned') => {
    try {
      await updateStatusMutation.mutateAsync({ userId, status: newStatus });
      toast({ title: `User status updated to ${newStatus}` });
    } catch (error: any) {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      toast({ title: `User role updated to ${newRole.replace('_', ' ')}` });
    } catch (error: any) {
      toast({ title: 'Error updating role', description: error.message, variant: 'destructive' });
    }
  };

  const filteredUsers = users?.filter((user: any) => {
    const userStatus = user.account_status || 'pending';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    const matchesSearch = !searchQuery ||
      (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
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
        <h3 className="font-semibold">Users Management ({filteredUsers?.length || 0})</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Name</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Joined Date</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Verification Status</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Role</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!filteredUsers || filteredUsers.length === 0) ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No users found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => {
                const status = user.account_status || 'pending';

                return (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-card/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-semibold text-xs">{(user.full_name || 'U').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium max-w-[200px] truncate">{user.full_name || 'Unknown User'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        status === 'banned' ? 'bg-destructive/10 text-destructive' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                        {status === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                          status === 'banned' ? <ShieldX className="w-3.5 h-3.5" /> :
                            <ShieldAlert className="w-3.5 h-3.5" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {(user.role || 'user').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(user.user_id, 'approved')}>
                              <Check className="w-4 h-4 mr-2 text-green-500" />
                              <span>Approve User</span>
                            </DropdownMenuItem>
                          )}
                          {status !== 'banned' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(user.user_id, 'banned')} className="text-destructive focus:text-destructive">
                              <ShieldBan className="w-4 h-4 mr-2" />
                              <span>Ban User</span>
                            </DropdownMenuItem>
                          )}
                          {status === 'banned' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(user.user_id, 'pending')}>
                              <X className="w-4 h-4 mr-2" />
                              <span>Remove Ban</span>
                            </DropdownMenuItem>
                          )}

                          {isSuperAdmin && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <UserCog className="w-4 h-4 mr-2" />
                                <span>Change Role</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'user')}>
                                    User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'content_admin')}>
                                    Content Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'moderation_admin')}>
                                    Moderation Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'super_admin')}>
                                    Super Admin
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
