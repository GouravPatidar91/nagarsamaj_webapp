import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
    id: string; // The UUID from profiles table
    user_id: string; // The UUID from auth.users
    full_name: string;
    email: string;
    avatar_url: string | null;
    account_status: 'pending' | 'approved' | 'banned';
    created_at: string;
}

// Ensure proper return type depending on whether email is included
export function useAllUsers() {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const [{ data: profiles, error: pError }, { data: roles, error: rError }] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('user_roles').select('*')
            ]);

            if (pError) throw pError;
            if (rError) throw rError;

            return profiles.map(p => ({
                ...p,
                role: roles?.find(r => r.user_id === p.user_id)?.role || 'user'
            })) as any[];
        },
    });
}

export function useUpdateUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, status }: { userId: string, status: 'pending' | 'approved' | 'banned' }) => {
            const { data, error } = await supabase
                .from('profiles')
                .update({ account_status: status } as any)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            const { data, error } = await supabase
                .from('user_roles')
                .update({ role } as any)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });
}
