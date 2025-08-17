'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { useState, useEffect, useRef } from 'react';
import { questionsAPI, lectureAPI, classroomAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Send, 
  MessageSquare, 
  ArrowLeft, 
  BookOpen, 
  Bot, 
  User, 
  AlertCircle,
  Clock,
  FileText,
  Trash2,
  Copy,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function LectureChat() {
  const { user, userProfile } = useAuth();
  const params = useParams();
  const lectureId = params.id;
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [lecture, setLecture] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (lectureId && user?.uid) {
      // For now, we'll show a placeholder since we need classroom_id to fetch lecture data
      // In a real implementation, you'd want to either:
      // 1. Include classroom_id in the URL structure
      // 2. Fetch all user's classrooms to find the one containing this lecture
      // 3. Store the context in local storage or state management
      
      setError('Chat functionality requires proper navigation from classroom page.');
      setLoading(false);
    }
  }, [lectureId, user?.uid]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || sendingMessage) return;

    const messageText = currentMessage.trim();
    setCurrentMessage('');
    setSendingMessage(true);

    // Add user message to chat immediately
    const userMessage = {
      role: 'user',
      parts: [messageText],
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // This would be the actual API call
      // const response = await questionsAPI.askQuestion(user.uid, lectureId, lecture.rag_file_id, messageText);
      
      // For now, show a placeholder response
      setTimeout(() => {
        const botMessage = {
          role: 'model',
          parts: ['I apologize, but the chat functionality is not fully connected. Please ensure you navigate to this page from a classroom with a properly loaded lecture.'],
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setSendingMessage(false);
      }, 1000);
      
    } catch (err) {
      showNotification(err.message, 'error');
      setSendingMessage(false);
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Message copied to clipboard!');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sample messages for demonstration
  const sampleMessages = [
    {
      role: 'user',
      parts: ['What is the main topic of this lecture?'],
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
      role: 'model',
      parts: ['Based on the lecture content, the main topic appears to be introductory concepts in algebra, covering basic equations and problem-solving techniques.'],
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString()
    },
    {
      role: 'user',
      parts: ['Can you explain the quadratic formula mentioned at minute 15?'],
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    },
    {
      role: 'model',
      parts: ['The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. It\'s used to solve quadratic equations of the form ax² + bx + c = 0. In the lecture, the instructor demonstrated this with the example equation x² - 5x + 6 = 0.'],
      timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString()
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        
        <div className="flex-1 container mx-auto px-4 pt-24 pb-8 flex flex-col">
          {/* Header */}
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
              <Link href={`/lectures/${lectureId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                {lecture?.title || 'Lecture'}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">Chat</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href={`/lectures/${lectureId}`}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Ask Questions
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Chat with AI about: {lecture?.title || 'Sample Lecture Title'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                    <Bot size={14} />
                    AI Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {notification.message}
            </div>
          )}

          {error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 max-w-2xl mx-auto text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Chat Not Available
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                  {error}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            <>
              {/* Chat Container */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Chat Assistant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ask questions about the lecture content</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(messages.length || sampleMessages.length)} messages
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="md" text="Loading chat history..." />
                    </div>
                  ) : (
                    <>
                      {/* Welcome message */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 p-2 rounded-full">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                              <strong>Welcome to the lecture chat!</strong> I'm here to help you understand the content. 
                              Ask me anything about the lecture, specific timestamps, concepts, or clarifications you need.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sample messages for demonstration */}
                      {sampleMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-3xl flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`p-2 rounded-full ${
                              message.role === 'user' 
                                ? 'bg-blue-500' 
                                : 'bg-gray-500 dark:bg-gray-600'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            
                            <div className={`p-3 rounded-lg relative group ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
                                  {message.parts[0]}
                                </p>
                                <button
                                  onClick={() => copyMessage(message.parts[0])}
                                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                    message.role === 'user'
                                      ? 'hover:bg-blue-600'
                                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                  title="Copy message"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                              <div className={`text-xs mt-2 ${
                                message.role === 'user'
                                  ? 'text-blue-100'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* User's new messages */}
                      {messages.map((message, index) => (
                        <div key={`new-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-3xl flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`p-2 rounded-full ${
                              message.role === 'user' 
                                ? 'bg-blue-500' 
                                : 'bg-gray-500 dark:bg-gray-600'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            
                            <div className={`p-3 rounded-lg relative group ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
                                  {message.parts[0]}
                                </p>
                                <button
                                  onClick={() => copyMessage(message.parts[0])}
                                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                    message.role === 'user'
                                      ? 'hover:bg-blue-600'
                                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                  title="Copy message"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                              <div className={`text-xs mt-2 ${
                                message.role === 'user'
                                  ? 'text-blue-100'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {sendingMessage && (
                        <div className="flex justify-start">
                          <div className="max-w-3xl flex gap-3">
                            <div className="bg-gray-500 dark:bg-gray-600 p-2 rounded-full">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask a question about the lecture..."
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!currentMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <p>Press Enter to send • Shift+Enter for new line</p>
                    <p>{currentMessage.length}/500</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}