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
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function LectureView() {
  const { user, userProfile } = useAuth();
  const params = useParams();
  const classroomId = params.id;
  const lectureId = params.lectureId;
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
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (classroomId && lectureId) {
      fetchData();
    }
  }, [classroomId, lectureId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleLoadedData = () => setIsVideoLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsVideoLoaded(false);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [lecture]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger shortcuts when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleDownload();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleShare();
          }
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [lecture, downloading, sharing, isPlaying]); // Added isPlaying dependency

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both classroom and lecture data
      const [lectureData, classroomData] = await Promise.all([
        lectureAPI.getLectureData(classroomId, lectureId),
        classroomAPI.getClassroomDetails(classroomId)
      ]);
      
      setLecture(lectureData.lecture);
      setClassroom(classroomData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleSeek = (time) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    
    const seekTime = Math.max(0, Math.min(time, duration));
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (!video) return;
    
    const volume = Math.max(0, Math.min(1, newVolume)); // Ensure volume is between 0 and 1
    video.volume = volume;
    setVolume(volume);
    setIsMuted(volume === 0);
    video.muted = volume === 0;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume > 0 ? volume : 0.5; // Restore previous volume or set to 50%
      video.muted = false;
      setIsMuted(false);
    } else {
      video.volume = 0;
      video.muted = true;
      setIsMuted(true);
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = async () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainer.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
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

  const handleDownload = async () => {
    if (!lecture?.media_url || downloading) return;
    
    setDownloading(true);
    try {
      // For direct video URLs, we can trigger a download
      const response = await fetch(lecture.media_url);
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${lecture.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      // Show success feedback
      alert('Download started successfully!');
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: open in new tab for user to download manually
      try {
        window.open(lecture.media_url, '_blank');
        alert('Download failed. Video opened in new tab - you can right-click and save.');
      } catch (fallbackError) {
        alert('Unable to download the lecture. Please contact support.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    
    setSharing(true);
    const shareUrl = `${window.location.origin}/classrooms/${classroomId}/lectures/${lectureId}`;
    const shareData = {
      title: `${lecture?.title} - ${classroom?.subject}`,
      text: `Check out this lecture: ${lecture?.title} from ${classroom?.subject}`,
      url: shareUrl
    };

    try {
      // Try to use the native Web Share API if available (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
        toast.textContent = 'Lecture link copied to clipboard!';
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
      }
    } catch (error) {
      console.error('Share error:', error);
      
      // Final fallback - show the URL in a prompt for manual copying
      const userChoice = prompt(
        'Share this lecture by copying the link below:', 
        shareUrl
      );
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Loading lecture..." />
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
                <span className="font-medium">Error loading lecture</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
              <div className="mt-4">
                <Link 
                  href={`/classrooms/${classroomId}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Classroom
                </Link>
              </div>
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
          <div className="max-w-6xl mx-auto">
            {/* Lecture Header */}
            <div className="mb-6">
              <nav className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
                <span className="mx-2">/</span>
                <Link href="/classrooms" className="hover:text-blue-600 dark:hover:text-blue-400">Classrooms</Link>
                <span className="mx-2">/</span>
                <Link href={`/classrooms/${classroomId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {classroom?.subject}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white">{lecture?.title}</span>
              </nav>
              
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={`/classrooms/${classroomId}`}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                    {lecture?.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{lecture && formatDate(lecture.upload_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{lecture && formatTime(lecture.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6 relative group">
              <video
                ref={videoRef}
                className="w-full aspect-video"
                src={lecture?.media_url}
              >
                Your browser does not support the video tag.
              </video>
              
              {/* Custom Video Controls */}
              {isVideoLoaded && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentTime / duration) * 100) || 0}%, rgba(255,255,255,0.3) ${((currentTime / duration) * 100) || 0}%, rgba(255,255,255,0.3) 100%)`
                      }}
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
                        href={`/classrooms/${classroomId}/lectures/${lectureId}/chat`}
                        className="text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        <MessageSquare size={20} />
                        <span className="text-sm">Chat</span>
                      </Link>
                      
                      <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
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
                      href={`/classrooms/${classroomId}/lectures/${lectureId}/chat`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare size={16} />
                      Ask Questions
                    </Link>
                    
                    <button 
                      onClick={handleDownload}
                      disabled={!lecture?.media_url || downloading}
                      title="Download lecture video (Ctrl+D)"
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      {downloading ? 'Downloading...' : 'Download'}
                    </button>
                    
                    <button 
                      onClick={handleShare}
                      disabled={sharing}
                      title="Share lecture link (Ctrl+S)"
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sharing ? <Loader2 size={16} className="animate-spin" /> : <Share size={16} />}
                      {sharing ? 'Sharing...' : 'Share'}
                    </button>
                  </div>
                  
                  {/* Keyboard Shortcuts Help */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Keyboard Shortcuts</h4>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Play/Pause</span>
                        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Space</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Download</span>
                        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl+D</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Share</span>
                        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl+S</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Classroom
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{classroom?.subject}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{classroom?.description}</p>
                      <Link
                        href={`/classrooms/${classroomId}`}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        View Classroom →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
