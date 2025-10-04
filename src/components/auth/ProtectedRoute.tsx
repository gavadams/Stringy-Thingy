"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          console.log('ProtectedRoute: No user found, redirecting to login');
          router.push('/login');
          return;
        }

        if (requireAdmin && user.profile?.role !== 'admin') {
          console.log('ProtectedRoute: User is not admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('ProtectedRoute: Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
