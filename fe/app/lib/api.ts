// API configuration
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8080/api/v1' 
  : 'http://localhost:8080/api/v1';

// API endpoints
export const API_ENDPOINTS = {
  QUIZZES: `${API_BASE_URL}/quizzes`,
  UPLOAD_QUIZ: `${API_BASE_URL}/quizzes/upload`,
  GENERATE_QUIZ: `${API_BASE_URL}/quizzes/generate`,
  HEALTH: `${API_BASE_URL.replace('/api/v1', '')}/health`,
};

// API utility functions
export const apiClient = {
  // Generic GET request
  async get(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Generic POST request
  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Multipart form POST (for file uploads)
  async postForm(url: string, formData: FormData) {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Generic PUT request
  async put(url: string, data: any) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Generic DELETE request
  async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};