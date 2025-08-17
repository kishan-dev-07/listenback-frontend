'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { classroomAPI, lectureAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Upload, 
  Play, 
  Clock, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Plus,
  FileVideo,
  MoreVertical,
  Download,
  Eye,
  MessageSquare,
  X
} from 'lucide-react';

export default function ClassroomDetail() {
  const { user, userProfile, isTeacher } = useAuth();
  const params = useParams();
  const classroomId = params.id;
  
  const [classroom, setClassroom] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null,
    loading: false
  });

  useEffect(() => {
    if (classroomId) {
      fetchClassroomDetails();
      fetchLectures();
    }
  }, [classroomId]);

  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      const data = await classroomAPI.getClassroomDetails(classroomId);
      setClassroom(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    try {
      setLecturesLoading(true);
      const data = await classroomAPI.getClassroomLectures(classroomId);
      setLectures(data.lectures || []);
    } catch (err) {
      console.error('Error fetching lectures:', err);
    } finally {
      setLecturesLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const copyClassroomCode = (code) => {
    navigator.clipboard.writeText(code);
    showNotification('Classroom code copied to clipboard!');
  };

  const handleUploadLecture = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setUploadForm(prev => ({ ...prev, loading: true }));

    try {
      const result = await lectureAPI.uploadLecture(
        classroomId,
        uploadForm.title,
        uploadForm.file
      );
      
      showNotification('Lecture upload started! Processing in background...');
      setShowUploadModal(false);
      setUploadForm({ title: '', file: null, loading: false });
      
      // Refresh lectures list
      setTimeout(fetchLectures, 1000);
    } catch (err) {
      showNotification(err.message, 'error');
      setUploadForm(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'transcribing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'uploading': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <CheckCircle size={14} />;
      case 'transcribing': return <Clock size={14} className="animate-spin" />;
      case 'uploading': return <Upload size={14} className="animate-bounce" />;
      case 'error': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const filteredLectures = lectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Loading classroom..." />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
                <span className="font-medium">Error loading classroom</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-8">
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

          {/* Classroom Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                      {classroom?.subject}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {isTeacher ? 'Teaching' : 'Learning'} • Created {formatDate(classroom?.created_time)}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {classroom?.description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{classroom?.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileVideo size={16} />
                    <span>{lectures.length} lectures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Code:</span>
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {classroom?.code}
                    </span>
                    <button
                      onClick={() => copyClassroomCode(classroom?.code)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Copy class code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              {isTeacher && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload size={16} />
                  Upload Lecture
                </button>
              )}
            </div>
          </div>

          {/* Lectures Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Lectures ({lectures.length})
              </h2>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search lectures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {lecturesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="md" text="Loading lectures..." />
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No lectures found' : 'No lectures yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : isTeacher 
                      ? 'Upload your first lecture to get started.'
                      : 'Your teacher hasn\'t uploaded any lectures yet.'
                  }
                </p>
                {!searchTerm && isTeacher && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={16} />
                    Upload First Lecture
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLectures.map((lecture) => (
                  <div
                    key={lecture.lecture_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                          <FileVideo className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {lecture.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lecture.status)}`}>
                              {getStatusIcon(lecture.status)}
                              {lecture.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {lecture.duration && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{formatDuration(lecture.duration)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{formatDate(lecture.upload_time)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {lecture.status === 'ready' && (
                          <Link
                            href={`/classrooms/${classroomId}/lectures/${lecture.lecture_id}`}
                            className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            <Play size={14} />
                            Watch
                          </Link>
                        )}
                        
                        {lecture.status === 'ready' && (
                          <Link
                            href={`/classrooms/${classroomId}/lectures/${lecture.lecture_id}/chat`}
                            className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <MessageSquare size={14} />
                            Chat
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Lecture Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Lecture</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleUploadLecture} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lecture Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Introduction to Algebra"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video File *
                    </label>
                    <input
                      type="file"
                      required
                      accept="video/*"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files[0] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Supported formats: MP4, AVI, MOV, WMV
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadForm.loading || !uploadForm.file}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {uploadForm.loading ? <LoadingSpinner size="sm" /> : <Upload size={16} />}
                      Upload
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