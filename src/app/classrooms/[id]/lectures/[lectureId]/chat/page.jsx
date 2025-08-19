'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { useState, useEffect, useRef } from 'react';
import { lectureAPI, classroomAPI, questionsAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Send, 
  ArrowLeft, 
  Clock, 
  User, 
  Bot,
  MessageSquare,
  AlertCircle,
  BookOpen,
  FileText,
  Video,
  Loader2,
  RotateCcw,
  History,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

export default function LectureChat() {
  const { user, userProfile } = useAuth();
  const params = useParams();
  const classroomId = params.id;
  const lectureId = params.lectureId;
  const messagesEndRef = useRef(null);
  
  const [lecture, setLecture] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {

    console.log(userProfile);

    if (classroomId && lectureId) {
      fetchData();
    }
  }, [classroomId, lectureId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // Load chat history
      await loadChatHistory(lectureData.lecture);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (lectureData) => {
    try {
      const historyResponse = await questionsAPI.getChatHistory(userProfile.uid, lectureId);
      
      // Convert backend history format to frontend message format
      const historyMessages = [];
      
      // Add welcome message first
      historyMessages.push({
        id: 'welcome',
        type: 'system',
        content: `Welcome back to the chat for "${lectureData.title}". Your previous conversation has been restored. Ask me questions about the lecture content and I'll help you understand better!`,
        timestamp: new Date().toISOString()
      });

      // Convert history to messages
      if (historyResponse.history && historyResponse.history.length > 0) {
        let messageId = 1;
        
        for (let i = 0; i < historyResponse.history.length; i += 2) {
          const userMessage = historyResponse.history[i];
          const botMessage = historyResponse.history[i + 1];
          
          if (userMessage && userMessage.role === 'user') {
            historyMessages.push({
              id: `history-user-${messageId}`,
              type: 'user',
              content: userMessage.parts[0],
              timestamp: new Date(Date.now() - (historyResponse.history.length - i) * 60000).toISOString(), // Approximate timestamps
              isHistory: true
            });
          }
          
          if (botMessage && botMessage.role === 'model') {
            historyMessages.push({
              id: `history-bot-${messageId}`,
              type: 'bot',
              content: botMessage.parts[0],
              timestamp: new Date(Date.now() - (historyResponse.history.length - i - 1) * 60000).toISOString(),
              isHistory: true
            });
          }
          
          messageId++;
        }
      } else {
        // No previous history, show first-time welcome message
        historyMessages[0].content = `Welcome to the chat for "${lectureData.title}". Ask me questions about the lecture content and I'll help you understand better!`;
      }
      
      setMessages(historyMessages);
      setHistoryLoaded(true);
      
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Fallback to welcome message if history loading fails
      setMessages([{
        id: 'welcome',
        type: 'system',
        content: `Welcome to the chat for "${lectureData.title}". Ask me questions about the lecture content and I'll help you understand better!`,
        timestamp: new Date().toISOString()
      }]);
      setHistoryLoaded(true);
    }
  };

  const clearChatHistory = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to start a fresh conversation? This will only clear the current view - your chat history is safely stored.'
    );
    
    if (confirmClear) {
      setMessages([{
        id: 'welcome-fresh',
        type: 'system',
        content: `Starting a fresh conversation for "${lecture?.title}". Ask me questions about the lecture content and I'll help you understand better!`,
        timestamp: new Date().toISOString()
      }]);
      setHistoryLoaded(false);
    }
  };

  const refreshChatHistory = async () => {
    if (lecture) {
      await loadChatHistory(lecture);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isHistory: false // Mark as new message
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setChatLoading(true);
    setIsTyping(true);

    try {
      const response = await questionsAPI.askQuestion(userProfile.uid, lectureId, lecture.rag_file_id, userMessage.content);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        sources: response.sources,
        isHistory: false // Mark as new message
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date().toISOString(),
        isHistory: false // Mark as new message
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Loading lecture chat..." />
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
                <span className="font-medium">Error loading lecture chat</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
              <div className="mt-4">
                <Link 
                  href={`/classrooms/${classroomId}/lectures/${lectureId}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Lecture
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
            {/* Header */}
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
                <Link href={`/classrooms/${classroomId}/lectures/${lectureId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {lecture?.title}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white">Chat</span>
              </nav>
              
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={`/classrooms/${classroomId}/lectures/${lectureId}`}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                    Chat with Lecture Assistant
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ask questions about "{lecture?.title}"
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Lecture Info Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Lecture Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Title</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{lecture?.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Classroom</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{classroom?.subject}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Date</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lecture && formatDate(lecture.upload_time)}
                        </p>
                      </div>
                    </div>

                    {lecture?.transcription && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Transcript</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {lecture.transcription.length > 50 
                                ? `${lecture.transcription.substring(0, 50)}...` 
                                : lecture.transcription
                              }
                            </p>
                            <button
                              onClick={() => setShowTranscript(true)}
                              className="text-blue-600 cursor-pointer dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 rounded transition-colors"
                              title="View full transcript"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/classrooms/${classroomId}/lectures/${lectureId}`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Video size={16} />
                      Watch Lecture
                    </Link>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Chat Tips
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>• Ask specific questions about the lecture content</p>
                    <p>• Request explanations of concepts</p>
                    <p>• Ask for examples or clarifications</p>
                    <p>• Get help with related topics</p>
                  </div>
                  
                  {historyLoaded && messages.some(m => m.isHistory) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-3">
                        <History size={16} />
                        <span>Previous conversation restored</span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={refreshChatHistory}
                          className="w-full flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                        >
                          <RefreshCw size={16} />
                          Refresh History
                        </button>
                        <button
                          onClick={clearChatHistory}
                          className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          <RotateCcw size={16} />
                          Start Fresh Conversation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[calc(100vh-320px)] flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!historyLoaded && messages.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Loader2 size={20} className="animate-spin" />
                          <span>Loading chat history...</span>
                        </div>
                      </div>
                    )}
                    
                    {messages.map((message, index) => {
                      // Check if this is the first non-history message after history messages
                      const isFirstNewMessage = !message.isHistory && 
                        index > 0 && 
                        messages[index - 1]?.isHistory && 
                        historyLoaded;

                      return (
                        <div key={message.id}>
                          {/* Show separator for new session messages */}
                          {isFirstNewMessage && (
                            <div className="flex items-center gap-3 my-6">
                              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border">
                                New messages
                              </span>
                              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                          )}

                          <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md xl:max-w-lg flex gap-3 ${
                              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              {/* Avatar */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium relative ${
                                message.type === 'user' 
                                  ? 'bg-blue-600' 
                                  : message.type === 'system'
                                  ? 'bg-purple-600'
                                  : message.type === 'error'
                                  ? 'bg-red-600'
                                  : 'bg-green-600'
                              }`}>
                                {message.type === 'user' ? (
                                  <User size={16} />
                                ) : message.type === 'system' ? (
                                  <MessageSquare size={16} />
                                ) : message.type === 'error' ? (
                                  <AlertCircle size={16} />
                                ) : (
                                  <Bot size={16} />
                                )}
                                
                                {/* History indicator */}
                                {message.isHistory && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full border-2 border-white dark:border-gray-800" 
                                       title="Previous conversation"></div>
                                )}
                              </div>
                              
                              {/* Message Content */}
                              <div className={`rounded-lg px-4 py-2 ${
                                message.type === 'user'
                                  ? message.isHistory 
                                    ? 'bg-blue-500 text-white opacity-80' 
                                    : 'bg-blue-600 text-white'
                                  : message.type === 'system'
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200'
                                  : message.type === 'error'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200'
                                  : message.isHistory
                                  ? 'bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white opacity-80'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}>
                                <div className="text-sm leading-relaxed">
                                  {message.content}
                                </div>
                                
                                {/* Confidence and Sources for bot messages */}
                                {message.type === 'bot' && (message.confidence || message.sources) && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    {message.confidence && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Confidence: {Math.round(message.confidence * 100)}%
                                      </div>
                                    )}
                                    {message.sources && message.sources.length > 0 && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Sources: {message.sources.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className={`text-xs mt-1 flex items-center gap-1 ${
                                  message.type === 'user' 
                                    ? 'text-blue-200' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  <span>{formatTime(message.timestamp)}</span>
                                  {message.isHistory && (
                                    <span className="text-xs opacity-70">• Previous</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                            <Bot size={16} />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                            <div className="flex items-center gap-1">
                              <Loader2 size={16} className="animate-spin text-gray-600 dark:text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask a question about the lecture..."
                        disabled={chatLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || chatLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {chatLoading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Modal */}
        {showTranscript && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Lecture Transcript - {lecture?.title}
                </h2>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                      {lecture?.transcription || 'No transcript available for this lecture.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(lecture?.transcription || '');
                    alert('Transcript copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Transcript
                </button>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
