import { useState } from 'react';
import { Check, X, Eye, MoreHorizontal, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useReports, useResolveReport, useUpdateReport, Report } from '@/hooks/useReports';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

export function AdminReportsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: reports, isLoading } = useReports(statusFilter);
  const resolveMutation = useResolveReport();
  const updateMutation = useUpdateReport();

  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const handleResolve = async () => {
    if (!viewingReport || !user) return;
    
    try {
      await resolveMutation.mutateAsync({
        id: viewingReport.id,
        resolution_note: resolutionNote,
        resolved_by: user.id,
      });
      toast({ title: 'Report resolved' });
      setViewingReport(null);
      setResolutionNote('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: 'dismissed' });
      toast({ title: 'Report dismissed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'dismissed':
        return <X className="w-4 h-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-accent/20 text-accent';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'dismissed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-destructive/20 text-destructive';
    }
  };

  const filteredReports = reports?.filter(report => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      report.reason.toLowerCase().includes(search) ||
      report.details?.toLowerCase().includes(search) ||
      report.reported_content_type?.toLowerCase().includes(search)
    );
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
        <h3 className="font-semibold">Reports ({filteredReports?.length || 0})</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Reason</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Type</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Date</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports?.map((report) => (
              <tr key={report.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4 font-medium max-w-xs truncate">{report.reason}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary capitalize">
                    {report.reported_content_type || 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs capitalize ${getStatusColor(report.status || 'pending')}`}>
                    {getStatusIcon(report.status || 'pending')}
                    {report.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => setViewingReport(report)}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      {report.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => setViewingReport(report)}>
                            <Check className="w-4 h-4 mr-2" /> Resolve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDismiss(report.id)}>
                            <X className="w-4 h-4 mr-2" /> Dismiss
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!filteredReports || filteredReports.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewingReport} onOpenChange={() => { setViewingReport(null); setResolutionNote(''); }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Review and take action on this report</DialogDescription>
          </DialogHeader>
          {viewingReport && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="capitalize">{viewingReport.reported_content_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs capitalize ${getStatusColor(viewingReport.status || 'pending')}`}>
                    {viewingReport.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Reason</p>
                  <p className="font-medium">{viewingReport.reason}</p>
                </div>
                {viewingReport.details && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Details</p>
                    <p>{viewingReport.details}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Reported On</p>
                  <p>{new Date(viewingReport.created_at).toLocaleString()}</p>
                </div>
                {viewingReport.resolution_note && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Resolution Note</p>
                    <p>{viewingReport.resolution_note}</p>
                  </div>
                )}
              </div>
              
              {viewingReport.status === 'pending' && (
                <div className="pt-4 border-t border-border">
                  <Label>Resolution Note</Label>
                  <Textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Add a note about how this was resolved..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setViewingReport(null); setResolutionNote(''); }}>
              Close
            </Button>
            {viewingReport?.status === 'pending' && (
              <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
                {resolveMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
