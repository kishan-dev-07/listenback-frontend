'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Profile() {
  const { user, userProfile, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: false });

  // Initialize form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus({ loading: true, error: null, success: false });
    
    try {
      const { success, error } = await updateProfile({
        name: formData.name,
        bio: formData.bio
      });
      
      if (success) {
        setUpdateStatus({ loading: false, error: null, success: true });
        setIsEditing(false);
        
        // Show success message briefly
        setTimeout(() => {
          setUpdateStatus(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setUpdateStatus({ loading: false, error: error || 'Failed to update profile', success: false });
      }
    } catch (error) {
      setUpdateStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-[#171717] transition-colors duration-300">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-8">
          {loading || !userProfile ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="md" text="Loading your profile..." />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 transition-colors duration-300">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-6 py-4 md:px-10 md:py-6 flex flex-col md:flex-row items-center md:items-end -mt-16 relative">
                  <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center overflow-hidden">
                    {userProfile.photoURL ? (
                      <img 
                        src={userProfile.photoURL} 
                        alt={userProfile.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-medium">
                        {userProfile.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 md:mt-0 md:ml-6 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      {userProfile.role}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {user.email}
                    </p>
                  </div>
                  <div className="mt-6 md:mt-0 md:ml-auto">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - User Info */}
                <div className="md:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                      <h2 className="font-medium text-gray-800 dark:text-white">User Information</h2>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h3>
                        <p className="text-gray-900 dark:text-white">{userProfile.name}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
                        <p className="text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</h3>
                        <p className="text-gray-900 dark:text-white">{userProfile.role}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Joined</h3>
                        <p className="text-gray-900 dark:text-white">
                          {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Login</h3>
                        <p className="text-gray-900 dark:text-white">
                          {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Bio/Edit Form */}
                <div className="md:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                      <h2 className="font-medium text-gray-800 dark:text-white">
                        {isEditing ? 'Edit Profile' : 'About'}
                      </h2>
                    </div>
                    <div className="p-6">
                      {isEditing ? (
                        <form onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="mb-6">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Bio
                            </label>
                            <textarea
                              id="bio"
                              name="bio"
                              rows="4"
                              value={formData.bio}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            ></textarea>
                          </div>
                          {updateStatus.error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                              {updateStatus.error}
                            </div>
                          )}
                          
                          <div className="flex justify-end items-center space-x-3">
                            {updateStatus.loading ? (
                              <div className="mr-2">
                                <LoadingSpinner size="sm" text="" />
                              </div>
                            ) : null}
                            
                            <button
                              type="submit"
                              disabled={updateStatus.loading}
                              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 ${
                                updateStatus.loading ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              {updateStatus.loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          {updateStatus.success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
                              Profile updated successfully!
                            </div>
                          )}
                          <p className="text-gray-700 dark:text-gray-300">
                            {userProfile.bio || 'No bio provided yet.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mt-6 transition-colors duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                      <h2 className="font-medium text-gray-800 dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No recent activity to display.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
