'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { useState, useEffect, useRef } from 'react';
import { lectureAPI, classroomAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Clock,
  FileText,
  MessageSquare,
  ArrowLeft,
  BookOpen,
  Calendar,
  Eye,
  Download,
  Share,
  AlertCircle
} from 'lucide-react';

export default function LectureView() {
  const { user, userProfile } = useAuth();
  const params = useParams();
  const lectureId = params.id;
  const videoRef = useRef(null);
  
  const [lecture, setLecture] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (lectureId) {
      fetchLectureData();
    }
  }, [lectureId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleLoadedData = () => setIsVideoLoaded(true);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [lecture]);

  const fetchLectureData = async () => {
    try {
      setLoading(true);
      
      // We need to get the classroom_id first, but since it's not in the URL,
      // we'll need to modify our approach. For now, let's assume we can get it from the lecture data
      // In a real app, you might want to store this in the URL or fetch all user's classrooms to find the right one
      
      // This is a workaround - in practice, you'd want to restructure the routes
      // to include classroom ID or fetch the lecture differently
      // For now, we'll need the user to navigate here from a classroom page
      // where we can pass the classroom_id
      
      setError('Unable to fetch lecture data. Please navigate from the classroom page.');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Since we can't easily get the lecture data without classroom_id,
  // let's create a placeholder message directing users to the proper navigation
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Loading lecture..." />
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-4">
                  <AlertCircle size={20} />
                  <span className="font-medium">Navigation Required</span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  To view lectures, please navigate through the classroom page. This ensures proper context and access permissions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Go to Dashboard
                  </Link>
                  <Link 
                    href="/classrooms"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <BookOpen size={16} />
                    View Classrooms
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // This would be the actual lecture view when properly implemented
            <div className="max-w-6xl mx-auto">
              {/* Lecture Header */}
              <div className="mb-6">
                <nav className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
                  <span className="mx-2">/</span>
                  <Link href="/classrooms" className="hover:text-blue-600 dark:hover:text-blue-400">Classrooms</Link>
                  <span className="mx-2">/</span>
                  {classroom && (
                    <>
                      <Link href={`/classrooms/${classroom.classroom_id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {classroom.subject}
                      </Link>
                      <span className="mx-2">/</span>
                    </>
                  )}
                  <span className="text-gray-900 dark:text-white">{lecture?.title || 'Lecture'}</span>
                </nav>
                
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                  {lecture?.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{lecture && formatDate(lecture.upload_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{lecture && formatTime(lecture.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>Classroom: {classroom?.subject}</span>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="bg-black rounded-lg overflow-hidden mb-6 relative group">
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  src={lecture?.media_url}
                  poster="/api/placeholder/1280/720"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onMouseMove={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Custom Video Controls */}
                {isVideoLoaded && (
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlayPause} className="text-white hover:text-blue-400 transition-colors">
                          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        
                        <button onClick={() => skip(-10)} className="text-white hover:text-blue-400 transition-colors">
                          <SkipBack size={20} />
                        </button>
                        
                        <button onClick={() => skip(10)} className="text-white hover:text-blue-400 transition-colors">
                          <SkipForward size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        
                        <span className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/lectures/${lectureId}/chat`}
                          className="text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                          <MessageSquare size={20} />
                          <span className="text-sm">Chat</span>
                        </Link>
                        
                        <button className="text-white hover:text-blue-400 transition-colors">
                          <Maximize size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Loading overlay */}
                {!isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <LoadingSpinner size="lg" text="Loading video..." />
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('transcript')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'transcript'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Transcript
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {activeTab === 'overview' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        About This Lecture
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Title</h4>
                          <p className="text-gray-600 dark:text-gray-400">{lecture?.title}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Duration</h4>
                          <p className="text-gray-600 dark:text-gray-400">{lecture && formatTime(lecture.duration)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Upload Date</h4>
                          <p className="text-gray-600 dark:text-gray-400">{lecture && formatDate(lecture.upload_time)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Ready to watch
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'transcript' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Lecture Transcript
                      </h3>
                      {lecture?.transcription ? (
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {lecture.transcription}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No transcript available for this lecture.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Link
                        href={`/lectures/${lectureId}/chat`}
                        className="w-full flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquare size={16} />
                        Ask Questions
                      </Link>
                      
                      <button className="w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Download size={16} />
                        Download
                      </button>
                      
                      <button className="w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Share size={16} />
                        Share
                      </button>
                    </div>
                  </div>

                  {classroom && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Classroom
                      </h3>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{classroom.subject}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{classroom.description}</p>
                          <Link
                            href={`/classrooms/${classroom.classroom_id}`}
                            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                          >
                            View Classroom →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}