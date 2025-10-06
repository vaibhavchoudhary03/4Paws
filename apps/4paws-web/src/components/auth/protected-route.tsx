/**
 * PROTECTED ROUTE COMPONENT - Authentication guard for protected pages
 * 
 * PURPOSE:
 * Wraps protected pages to ensure only authenticated users can access them.
 * Handles loading states, authentication checks, and redirects.
 * 
 * FEATURES:
 * - Automatic redirect to login if not authenticated
 * - Loading state while checking authentication
 * - Role-based access control
 * - Organization context validation
 * 
 * USAGE:
 * Wrap any protected page component with this component:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */

import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../lib/auth-context-simple';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallback 
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user, loading, hasRole, hasPermission } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-orange-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    setLocation('/login');
    return null;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have the required role to access this page.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setLocation('/dashboard')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => setLocation('/login')} className="w-full">
                Switch Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Permission Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have the required permission to access this feature.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setLocation('/dashboard')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => setLocation('/login')} className="w-full">
                Switch Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// ============================================================================
// HOOK - Use protected route logic
// ============================================================================

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    throw new Promise(() => {}); // Suspense boundary will handle loading
  }

  if (!user) {
    setLocation('/login');
    throw new Error('Authentication required');
  }

  return user;
}

// ============================================================================
// HOOK - Check if user has specific role
// ============================================================================

export function useRequireRole(role: string) {
  const { user, hasRole } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    throw new Error('Authentication required');
  }

  if (!hasRole(role)) {
    throw new Error(`Role '${role}' required`);
  }

  return user;
}

// ============================================================================
// HOOK - Check if user has specific permission
// ============================================================================

export function useRequirePermission(permission: string) {
  const { user, hasPermission } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    throw new Error('Authentication required');
  }

  if (!hasPermission(permission)) {
    throw new Error(`Permission '${permission}' required`);
  }

  return user;
}
