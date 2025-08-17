'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { classroomAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus, Users, BookOpen, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user, userProfile, isTeacher } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const data = await classroomAPI.getUserClassrooms(user.uid);
        setClassrooms(data.classrooms || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [user?.uid]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            {getGreeting()}, {userProfile?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back to your {isTeacher ? 'teaching' : 'learning'} dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/classrooms" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <BookOpen size={20} />
            View All Classrooms
          </Link>
          {isTeacher && (
            <Link 
              href="/classrooms?action=create" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create Classroom
            </Link>
          )}
          {!isTeacher && (
            <Link 
              href="/classrooms?action=join" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Users size={20} />
              Join Classroom
            </Link>
          )}
        </div>

        {/* Recent Classrooms */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Your Classrooms
            </h2>
            <Link 
              href="/classrooms"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" text="Loading classrooms..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : classrooms.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No classrooms yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isTeacher 
                  ? "Create your first classroom to start teaching" 
                  : "Join a classroom to start learning"
                }
              </p>
              {isTeacher ? (
                <Link 
                  href="/classrooms?action=create"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Create Classroom
                </Link>
              ) : (
                <Link 
                  href="/classrooms?action=join"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Users size={16} />
                  Join Classroom
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.slice(0, 6).map((classroom) => (
                <Link 
                  key={classroom.classroom_id}
                  href={`/classrooms/${classroom.classroom_id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {classroom.code}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                    {classroom.subject}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {classroom.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{classroom.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(classroom.created_time)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-8">
          {renderDashboardContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
}