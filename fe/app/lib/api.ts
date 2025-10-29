// API configuration
import { getAccessToken } from './auth';

const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api/v1'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api/v1';

// API endpoints
export const API_ENDPOINTS = {
  QUIZZES: `${API_BASE_URL}/quizzes`,
  UPLOAD_QUIZ: `${API_BASE_URL}/quizzes/upload`,
  GENERATE_QUIZ: `${API_BASE_URL}/quizzes/generate`,
  HEALTH: `${API_BASE_URL.replace('/api/v1', '')}/health`,
};

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// API utility functions
export const apiClient = {
  // Generic GET request
  async get(url: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Generic POST request
  async post(url: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Multipart form POST (for file uploads)
  async postForm(url: string, formData: FormData) {
    const token = await getAccessToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Generic PUT request
  async put(url: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Generic DELETE request
  async delete(url: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};