'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // User is not authenticated, redirect to login
      // Pass the current pathname so we can redirect back after login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      // Assuming user.role is a string (e.g., "CUSTOMER" or "SUPER_ADMIN")
      // In a real app, role might be an object, adjust accordingly based on API response
      const userRoleName = typeof user.role === 'string' ? user.role : (user as any).role?.name || '';
      
      if (!allowedRoles.includes(userRoleName)) {
        // User does not have permission
        router.push('/unauthorized'); // or redirect to their specific dashboard
        return;
      }
    }

    setIsAuthorized(true);
  }, [user, loading, router, pathname, allowedRoles]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
