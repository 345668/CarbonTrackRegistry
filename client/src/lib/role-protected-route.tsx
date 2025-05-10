import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type RoleType = 'admin' | 'verifier' | 'developer' | 'user';

export function RoleProtectedRoute({
  path,
  component: Component,
  allowedRoles = ['admin'], // By default, only admins can access
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: RoleType[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If authenticated but doesn't have required role, show unauthorized page
  if (!allowedRoles.includes(user.role as RoleType)) {
    return (
      <Route path={path}>
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have the necessary permissions to access this page. 
              This feature requires {allowedRoles.join(' or ')} privileges.
            </p>
            <p className="text-gray-500 text-sm">
              Please contact your administrator if you believe you should have access.
            </p>
            <div className="mt-8">
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      </Route>
    );
  }

  // If authenticated and has required role, show the component
  return <Component />
}