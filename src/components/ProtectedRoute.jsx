'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
        return;
      }

      if (requireRole && userProfile?.role !== requireRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, userProfile, loading, router, requireRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <LoadingSpinner size="lg" text="Verifying access..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireRole && userProfile?.role !== requireRole) {
    return null;
  }

  return children;
}