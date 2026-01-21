import { useState } from 'react';
import { Activity, User, FileText, Calendar, Briefcase, Heart, Building2, MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Skeleton } from '@/components/ui/skeleton';

const entityIcons: Record<string, typeof Activity> = {
  user: User,
  article: FileText,
  event: Calendar,
  job: Briefcase,
  matrimony: Heart,
  business: Building2,
  chat: MessageSquare,
};

export function AdminActivityLogsTab() {
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: logs, isLoading } = useActivityLogs(entityFilter);

  const getEntityIcon = (entityType: string | null) => {
    const Icon = entityIcons[entityType || ''] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-accent/20 text-accent';
    if (action.includes('update') || action.includes('edit')) return 'bg-primary/20 text-primary';
    if (action.includes('delete') || action.includes('remove')) return 'bg-destructive/20 text-destructive';
    if (action.includes('approve')) return 'bg-accent/20 text-accent';
    if (action.includes('reject')) return 'bg-destructive/20 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  const filteredLogs = logs?.filter(log => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.entity_type?.toLowerCase().includes(search) ||
      JSON.stringify(log.details)?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold">Activity Logs ({filteredLogs?.length || 0})</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-48"
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="matrimony">Matrimony</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {filteredLogs?.map((log) => {
          // Parse details to extract user-friendly information
          const details = typeof log.details === 'object' ? (log.details as any) : null;
          const getDetailText = () => {
            if (log.action === 'job_application_received') console.log('Job App Details:', log.details);
            if (log.action === 'job_application_received' && details) {
              return (
                <div className="flex flex-col gap-1 items-start">
                  <span>
                    <span className="font-medium">{details.applicant_name || 'Unknown User'}</span> applied for "<span className="font-medium">{details.job_title}</span>"
                  </span>
                  <div className="text-sm text-muted-foreground grid grid-cols-1 gap-y-1 mt-1 w-full">
                    {details.applicant_email && (
                      <span className="flex items-center gap-2">
                        📧 {details.applicant_email}
                      </span>
                    )}
                    {details.applicant_phone && (
                      <span className="flex items-center gap-2">
                        📱 {details.applicant_phone}
                      </span>
                    )}
                    {details.applicant_address && (
                      <span className="flex items-center gap-2">
                        📍 {details.applicant_address}
                      </span>
                    )}
                    {details.resume_link && (
                      <a
                        href={details.resume_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2 mt-1 font-medium w-fit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📄 View Resume / CV
                      </a>
                    )}
                  </div>
                </div>
              );
            }
            if (log.action === 'matrimony_interest_received' && details) {
              return `${details.from_user_name || 'Unknown User'} expressed interest in ${details.profile_name || 'a profile'}`;
            }
            // Fallback to JSON stringify for other types
            return typeof log.details === 'object'
              ? JSON.stringify(log.details).slice(0, 100) + '...'
              : String(log.details);
          };

          return (
            <div key={log.id} className="p-4 hover:bg-card/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  {getEntityIcon(log.entity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.entity_type && (
                      <span className="text-xs text-muted-foreground capitalize">
                        on {log.entity_type.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {getDetailText()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {(!filteredLogs || filteredLogs.length === 0) && (
          <div className="py-12 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity logs found</p>
            <p className="text-sm mt-1">Admin actions will appear here</p>
          </div>
        )}
      </div>
    </>
  );
}
