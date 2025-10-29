// Quiz API client for backend integration

import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

export interface QuizListItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
}

export interface QuestionForTaking {
  id: string;
  text: string;  // Backend returns 'text', not 'question_text'
  options: string[];
}

export interface QuizForTaking {
  id: string;
  created_at: string;
  pdf_filename?: string;
  user_id: string;
  title: string;
  questions: QuestionForTaking[];
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

export interface QuizAttempt {
  id: string;
  created_at: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  quiz_title?: string;
  pdf_filename?: string;
  questions: Question[];
  percentage: number;
}

export interface AttemptListItem {
  id: string;
  created_at: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  quiz_title?: string;
  pdf_filename?: string;
}

export interface CreateQuizRequest {
  title: string;
  pdf_filename?: string;
  questions: {
    question_text: string;
    options: string[];
    correct_answer: string;
  }[];
}

export interface SubmitQuizRequest {
  quiz_id: string;
  answers: Record<string, string>;
}

// Create a new quiz
export async function createQuiz(token: string, quiz: CreateQuizRequest): Promise<{ id: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(quiz),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create quiz');
  }

  return response.json();
}

// List all quizzes (protected)
export async function listQuizzes(limit: number = 20, offset: number = 0): Promise<{ quizzes: QuizListItem[]; limit: number; offset: number }> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch quizzes');
  }

  const result = await response.json();
  
  // Backend returns { success, message, data } format
  // Transform to expected format
  return {
    quizzes: result.data || [],
    limit,
    offset
  };
}

// Get quiz for taking (public, no correct answers)
export async function getQuizForTaking(quizId: string): Promise<QuizForTaking> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/take/${quizId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch quiz for taking');
  }

  return response.json();
}

// Submit quiz attempt (requires auth)
export async function submitQuizAttempt(submission: SubmitQuizRequest): Promise<{
  attempt_id: string;
  score: number;
  total_questions: number;
  percentage: number;
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to submit quiz');
  }

  return response.json();
}

// Get quiz attempt details (requires auth)
export async function getQuizAttempt(attemptId: string): Promise<QuizAttempt> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/attempt/${attemptId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attempt');
  }

  return response.json();
}

// List user's attempts (requires auth)
export async function listUserAttempts(): Promise<{ attempts: AttemptListItem[] }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/attempts`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attempts');
  }

  return response.json();
}

// Delete a quiz (requires auth)
export async function deleteQuiz(quizId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/${quizId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to delete quiz');
  }
}
