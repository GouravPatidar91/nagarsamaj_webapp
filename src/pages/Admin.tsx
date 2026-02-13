import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, Calendar, Briefcase, Heart, Building2, MessageSquare,
  AlertCircle, Flag, Activity
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminArticlesTab } from '@/components/admin/AdminArticlesTab';
import { AdminEventsTab } from '@/components/admin/AdminEventsTab';
import { AdminJobsTab } from '@/components/admin/AdminJobsTab';
import { AdminMatrimonyTab } from '@/components/admin/AdminMatrimonyTab';
import { AdminBusinessesTab } from '@/components/admin/AdminBusinessesTab';
import { AdminChatTab } from '@/components/admin/AdminChatTab';
import { AdminReportsTab } from '@/components/admin/AdminReportsTab';
import { AdminActivityLogsTab } from '@/components/admin/AdminActivityLogsTab';

const tabs = [
  { id: 'users', name: 'Users', icon: Users },
  { id: 'articles', name: 'Articles', icon: FileText },
  { id: 'events', name: 'Events', icon: Calendar },
  { id: 'jobs', name: 'Jobs', icon: Briefcase },
  { id: 'matrimony', name: 'Matrimony', icon: Heart },
  { id: 'directory', name: 'Directory', icon: Building2 },
  { id: 'chat', name: 'Chat', icon: MessageSquare },
  { id: 'reports', name: 'Reports', icon: Flag },
  { id: 'activity', name: 'Activity', icon: Activity },
];

function AdminContent() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Define tab access based on roles
  const roleAccess = {
    super_admin: ['users', 'articles', 'events', 'jobs', 'matrimony', 'directory', 'chat', 'reports', 'activity'],
    content_admin: ['articles', 'events', 'jobs', 'matrimony', 'directory'],
    moderation_admin: ['users', 'chat', 'reports', 'activity'],
    user: []
  };

  // Filter tabs based on user role
  const userTabs = tabs.filter(tab =>
    user?.role && roleAccess[user.role as keyof typeof roleAccess]?.includes(tab.id)
  );

  const [activeTab, setActiveTab] = useState(userTabs[0]?.id || '');

  // Update active tab if it's not in the allowed list (e.g. on role change or initial load)
  if (userTabs.length > 0 && !userTabs.find(t => t.id === activeTab)) {
    setActiveTab(userTabs[0].id);
  }
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: articlesCount },
        { count: eventsCount },
        { count: jobsCount },
        { count: matrimonyCount },
        { count: businessesCount },
        { count: channelsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('matrimony_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('chat_channels').select('*', { count: 'exact', head: true }),
      ]);

      return {
        users: usersCount || 0,
        articles: articlesCount || 0,
        events: eventsCount || 0,
        jobs: jobsCount || 0,
        matrimony: matrimonyCount || 0,
        directory: businessesCount || 0,
        chat: channelsCount || 0,
      };
    },
  });

  // Fetch pending counts
  const { data: pendingStats } = useQuery({
    queryKey: ['admin-pending-stats'],
    queryFn: async () => {
      const [
        { count: pendingEvents },
        { count: pendingJobs },
        { count: pendingMatrimony },
        { count: pendingBusinesses },
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('matrimony_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        events: pendingEvents || 0,
        jobs: pendingJobs || 0,
        matrimony: pendingMatrimony || 0,
        businesses: pendingBusinesses || 0,
        total: (pendingEvents || 0) + (pendingJobs || 0) + (pendingMatrimony || 0) + (pendingBusinesses || 0),
      };
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUsersTab />;
      case 'articles':
        return <AdminArticlesTab />;
      case 'events':
        return <AdminEventsTab />;
      case 'jobs':
        return <AdminJobsTab />;
      case 'matrimony':
        return <AdminMatrimonyTab />;
      case 'directory':
        return <AdminBusinessesTab />;
      case 'chat':
        return <AdminChatTab />;
      case 'reports':
        return <AdminReportsTab />;
      case 'activity':
        return <AdminActivityLogsTab />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold mb-2">{t('admin_dashboard')}</h1>
            <p className="text-muted-foreground">{t('admin_subtitle')}</p>
          </motion.div>

          {/* Pending Items Alert */}
          {pendingStats && pendingStats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <p className="text-sm">
                <span className="font-semibold">{pendingStats.total} {t('pending_items')}:</span>{' '}
                {pendingStats.events > 0 && `${pendingStats.events} events`}
                {pendingStats.jobs > 0 && `, ${pendingStats.jobs} jobs`}
                {pendingStats.matrimony > 0 && `, ${pendingStats.matrimony} matrimony profiles`}
                {pendingStats.businesses > 0 && `, ${pendingStats.businesses} businesses`}
              </p>
            </motion.div>
          )}

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
          >
            {userTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`card-elevated p-4 text-left transition-all ${activeTab === tab.id ? 'ring-2 ring-primary' : ''
                  }`}
              >
                <tab.icon className="w-5 h-5 text-primary mb-2" />
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.[tab.id as keyof typeof stats] || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">{t(`tab_${tab.id}`)}</p>
              </button>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {userTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {t(`tab_${tab.id}`)}
              </button>
            ))}
          </motion.div>

          {/* Content Table */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated"
          >
            {renderContent()}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}
