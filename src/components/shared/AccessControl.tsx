import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader2, LogOut, ShieldAlert, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

interface AccessControlProps {
    children: ReactNode;
}

export function AccessControl({ children }: AccessControlProps) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const location = useLocation();

    // Pages that don't require authentication or verification to view
    const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/about';

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // If not authenticated, or if authenticated and on a public route, let them proceed.
    // We don't block public routes like the landing page or login, even if banned.
    if (!isAuthenticated || isPublicRoute) {
        return <>{children}</>;
    }

    // User is authenticated and trying to access a protected part of the app.
    // Check their account status.
    if (user?.status === 'pending') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                    <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-4">Verification Pending</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Your account is currently under review by our administrators. You will be able to access the community features once your account has been verified.
                    </p>
                    <Button onClick={logout} variant="outline" className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </Layout>
        );
    }

    if (user?.status === 'banned') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                        <ShieldX className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-4">Account Blocked</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Your access to this application has been restricted. If you believe this is an error, please contact support.
                    </p>
                    <Button onClick={logout} variant="outline" className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </Layout>
        );
    }

    return <>{children}</>;
}
