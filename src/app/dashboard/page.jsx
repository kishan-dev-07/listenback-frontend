'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const { user, userProfile } = useAuth();

  // Dashboard content
  const renderDashboardContent = () => {
    if (!userProfile) {
      return (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="md" text="Loading your profile..." />
        </div>
      );
    }

    return (
      <div className="hero bg-base-200 rounded-lg">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">
              Welcome, {userProfile?.name}!
            </h1>
            <p className="py-6">
              You are logged in as a <strong>{userProfile?.role}</strong>
            </p>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Account Type</div>
                <div className="stat-value text-primary">{userProfile?.role}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Email</div>
                <div className="stat-value text-sm">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen dark:bg-[#171717] bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-8">
          {renderDashboardContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
}