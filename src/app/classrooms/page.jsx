'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { classroomAPI } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Users, 
  BookOpen, 
  Calendar, 
  Search, 
  X, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

export default function Classrooms() {
  const { user, userProfile, isTeacher } = useAuth();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    subject: '',
    description: '',
    loading: false
  });
  const [joinForm, setJoinForm] = useState({
    code: '',
    loading: false
  });

  useEffect(() => {
    if (action === 'create' && isTeacher) {
      setShowCreateModal(true);
    } else if (action === 'join' && !isTeacher) {
      setShowJoinModal(true);
    }
  }, [action, isTeacher]);

  useEffect(() => {
    fetchClassrooms();
  }, [user?.uid]);

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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    setCreateForm(prev => ({ ...prev, loading: true }));

    try {
      const newClassroom = await classroomAPI.createClassroom(
        user.uid,
        createForm.subject,
        createForm.description
      );
      
      setClassrooms(prev => [newClassroom, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ subject: '', description: '', loading: false });
      showNotification('Classroom created successfully!');
    } catch (err) {
      showNotification(err.message, 'error');
      setCreateForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    setJoinForm(prev => ({ ...prev, loading: true }));

    try {
      const classroom = await classroomAPI.joinClassroom(user.uid, joinForm.code);
      setClassrooms(prev => [classroom, ...prev]);
      setShowJoinModal(false);
      setJoinForm({ code: '', loading: false });
      showNotification('Successfully joined the classroom!');
    } catch (err) {
      showNotification(err.message, 'error');
      setJoinForm(prev => ({ ...prev, loading: false }));
    }
  };

  const copyClassroomCode = (code) => {
    navigator.clipboard.writeText(code);
    showNotification('Classroom code copied to clipboard!');
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                Your Classrooms
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and access your {isTeacher ? 'teaching' : 'learning'} spaces
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {isTeacher ? (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Create Classroom
                </button>
              ) : (
                <button 
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Users size={16} />
                  Join Classroom
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search classrooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {notification.message}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="md" text="Loading classrooms..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
                <span className="font-medium">Error loading classrooms</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
            </div>
          ) : filteredClassrooms.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No classrooms found' : 'No classrooms yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search criteria to find the classroom you\'re looking for.'
                  : isTeacher 
                    ? "Create your first classroom to start teaching and sharing knowledge with your students." 
                    : "Join a classroom using a class code from your teacher to start learning."
                }
              </p>
              {!searchTerm && (
                <div className="flex justify-center">
                  {isTeacher ? (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={18} />
                      Create Your First Classroom
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowJoinModal(true)}
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Users size={18} />
                      Join a Classroom
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredClassrooms.map((classroom) => (
                <div
                  key={classroom.classroom_id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group ${
                    viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                >
                  <Link href={`/classrooms/${classroom.classroom_id}`} className="block">
                    <div className={`flex ${viewMode === 'list' ? 'flex-row items-center gap-4' : 'flex-col'}`}>
                      {viewMode === 'grid' && (
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {classroom.code}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                copyClassroomCode(classroom.code);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                              title="Copy class code"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {viewMode === 'list' && (
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h3 className={`font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                          viewMode === 'list' ? 'text-lg mb-1' : 'text-xl mb-2'
                        }`}>
                          {classroom.subject}
                        </h3>
                        
                        <p className={`text-gray-600 dark:text-gray-400 ${
                          viewMode === 'list' ? 'text-sm line-clamp-1' : 'mb-4 line-clamp-2'
                        }`}>
                          {classroom.description}
                        </p>
                        
                        {viewMode === 'grid' && (
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
                        )}
                      </div>

                      {viewMode === 'list' && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {classroom.code}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                copyClassroomCode(classroom.code);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                              title="Copy class code"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              <span>{classroom.members?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(classroom.created_time)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Create Classroom Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Classroom</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateClassroom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.subject}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Mathematics, Biology, History"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this classroom is about..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createForm.loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {createForm.loading ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Join Classroom Modal */}
          {showJoinModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Join Classroom</h2>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleJoinClassroom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Classroom Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={joinForm.code}
                      onChange={(e) => setJoinForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="Enter 6-character class code"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ask your teacher for the class code
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={joinForm.loading}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {joinForm.loading ? <LoadingSpinner size="sm" /> : <Users size={16} />}
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}