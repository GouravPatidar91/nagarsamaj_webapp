import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Download, FileText, Mail, Phone, MapPin, User, Calendar, Search, Filter } from 'lucide-react';
import { useJobApplications, useUpdateJobApplicationStatus } from '@/hooks/useJobs';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface AdminJobApplicantsProps {
    jobId: string;
    jobTitle: string;
}

interface JobApplication {
    id: string;
    user_id: string;
    created_at: string;
    applicant_name?: string;
    applicant_email?: string;
    applicant_phone?: string;
    applicant_address?: string;
    resume_url?: string;
    cover_letter?: string;
    status: string;
}

export function AdminJobApplicants({ jobId, jobTitle }: AdminJobApplicantsProps) {
    const { data: rawApplications, isLoading } = useJobApplications(jobId);
    const { mutate: updateStatus } = useUpdateJobApplicationStatus();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Cast to expected type, falling back to empty array if data processing fails
    const applications = (rawApplications || []) as unknown as JobApplication[];

    const filteredApplications = applications.filter(app => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (app.applicant_name?.toLowerCase() || '').includes(query) ||
            (app.applicant_email?.toLowerCase() || '').includes(query);

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading applicants...</p>
            </div>
        );
    }

    const handleStatusChange = (id: string, newStatus: string, userId: string) => {
        updateStatus({
            id,
            status: newStatus,
            userId,
            jobTitle
        }, {
            onSuccess: () => {
                toast({ title: "Status updated & User notified" });
            },
            onError: () => {
                toast({ title: "Failed to update status", variant: "destructive" });
            }
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'accepted': return 'default';
            case 'rejected': return 'destructive';
            case 'reviewed': return 'secondary';
            default: return 'outline';
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        Applicants for <span className="text-primary">{jobTitle}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and review candidates for this position.
                    </p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {applications.length} Total
                </Badge>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content Section */}
            {filteredApplications.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <div className="bg-muted/50 p-4 rounded-full w-fit mx-auto mb-4">
                        <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No applicants found</h3>
                    <p className="text-muted-foreground mt-1">
                        {searchQuery || statusFilter !== 'all'
                            ? "Try adjusting your filters"
                            : "This job hasn't received any applications yet."}
                    </p>
                </div>
            ) : (
                <ScrollArea className="h-[500px] border rounded-xl shadow-sm bg-card">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="w-[300px]">Candidate</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Applied</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.map((app) => (
                                <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(app.applicant_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">
                                                    {app.applicant_name || 'Unknown Candidate'}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]" title={app.applicant_email}>
                                                        {app.applicant_email || 'No email'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {app.applicant_phone && (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span>{app.applicant_phone}</span>
                                                </div>
                                            )}
                                            {app.applicant_address && (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[180px]" title={app.applicant_address}>
                                                        {app.applicant_address}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={app.status || 'pending'}
                                                onValueChange={(val) => handleStatusChange(app.id, val, app.user_id)}
                                            >
                                                <SelectTrigger className="w-[130px] h-8 text-xs border-dashed">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={getStatusBadgeVariant(app.status || 'pending') as any} className="h-5 px-1.5 rounded-sm">
                                                            {(app.status || 'pending').toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">
                                                        <span className="flex items-center gap-2">🕒 Pending</span>
                                                    </SelectItem>
                                                    <SelectItem value="reviewed">
                                                        <span className="flex items-center gap-2">👀 Reviewed</span>
                                                    </SelectItem>
                                                    <SelectItem value="accepted">
                                                        <span className="flex items-center gap-2">✅ Accepted</span>
                                                    </SelectItem>
                                                    <SelectItem value="rejected">
                                                        <span className="flex items-center gap-2">❌ Rejected</span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{format(new Date(app.created_at), 'MMM d, yyyy')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {app.resume_url ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-2 text-primary hover:bg-primary/10"
                                                onClick={() => window.open(app.resume_url, '_blank')}
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                Resume
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">No Resume</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            )}
        </div>
    );
}
