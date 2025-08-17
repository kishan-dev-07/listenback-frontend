// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(errorData.detail || 'An error occurred');
  }
  return response.json();
};

// Test API connection
export const testAPI = {
  // Test CORS and basic connectivity
  testConnection: async () => {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    return handleResponse(response);
  },

  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  }
};

// Classroom API functions
export const classroomAPI = {
  // Get all classrooms for a user
  getUserClassrooms: async (uid) => {
    const response = await fetch(`${API_BASE_URL}/classrooms?uid=${encodeURIComponent(uid)}`);
    return handleResponse(response);
  },

  // Get classroom IDs only
  getUserClassroomIds: async (uid) => {
    const response = await fetch(`${API_BASE_URL}/classrooms/list?uid=${encodeURIComponent(uid)}`);
    return handleResponse(response);
  },

  // Create a new classroom
  createClassroom: async (uid, subject, description) => {
    const formData = new FormData();
    formData.append('uid', uid);
    formData.append('subject', subject);
    formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/classrooms`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Join a classroom
  joinClassroom: async (uid, code) => {
    const formData = new FormData();
    formData.append('uid', uid);
    formData.append('code', code);

    const response = await fetch(`${API_BASE_URL}/classrooms/join`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Get classroom details
  getClassroomDetails: async (classroomId) => {
    const response = await fetch(`${API_BASE_URL}/classrooms/details?classroom_id=${encodeURIComponent(classroomId)}`);
    return handleResponse(response);
  },

  // Get all lectures for a classroom
  getClassroomLectures: async (classroomId) => {
    const response = await fetch(`${API_BASE_URL}/classrooms/lectures?classroom_id=${encodeURIComponent(classroomId)}`);
    return handleResponse(response);
  },
};

// Lecture API functions
export const lectureAPI = {
  // Upload a lecture
  uploadLecture: async (classroomId, title, file) => {
    const formData = new FormData();
    formData.append('classroom_id', classroomId);
    formData.append('title', title);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/lectures/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Get lecture status
  getLectureStatus: async (classroomId, lectureId) => {
    const response = await fetch(`${API_BASE_URL}/lectures/status?classroom_id=${encodeURIComponent(classroomId)}&lecture_id=${encodeURIComponent(lectureId)}`);
    return handleResponse(response);
  },

  // Get lecture data
  getLectureData: async (classroomId, lectureId) => {
    const response = await fetch(`${API_BASE_URL}/lectures?classroom_id=${encodeURIComponent(classroomId)}&lecture_id=${encodeURIComponent(lectureId)}`);
    return handleResponse(response);
  },
};

// Questions API functions
export const questionsAPI = {
  // Ask a question about a lecture
  askQuestion: async (uid, lectureId, ragFileId, question) => {
    const params = new URLSearchParams({
      uid: uid,
      lecture_id: lectureId,
      rag_file_id: ragFileId,
      question: question,
    });

    const response = await fetch(`${API_BASE_URL}/ask?${params}`);
    return handleResponse(response);
  },

  // Get chat history for a user and lecture
  getChatHistory: async (uid, lectureId) => {
    const response = await fetch(`${API_BASE_URL}/ask/history?uid=${encodeURIComponent(uid)}&lecture_id=${encodeURIComponent(lectureId)}`);
    return handleResponse(response);
  },
};

export default {
  testAPI,
  classroomAPI,
  lectureAPI,
  questionsAPI,
};