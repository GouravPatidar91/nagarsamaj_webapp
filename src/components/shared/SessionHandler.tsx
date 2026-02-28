import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export function SessionHandler() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();

    // Use a ref to ensure we only trigger the welcome back once per app load
    const hasHandledSession = useRef(false);

    useEffect(() => {
        if (!isLoading && !hasHandledSession.current) {
            hasHandledSession.current = true;

            if (isAuthenticated) {
                // Determine if they are on a public auth page that should redirect 
                // We no longer redirect from '/' so users can stay on the homepage
                const shouldRedirect = location.pathname === '/login' || location.pathname === '/signup';

                if (shouldRedirect) {
                    toast({
                        title: t('toast_login_success') || 'Welcome back!',
                        description: t('toast_login_success_desc') || 'You have successfully logged in.',
                    });
                    navigate(user?.isAdmin ? '/admin' : '/', { replace: true });
                }
            }
        }
    }, [isLoading, isAuthenticated, user, location.pathname, navigate, toast, t]);

    return null;
}
