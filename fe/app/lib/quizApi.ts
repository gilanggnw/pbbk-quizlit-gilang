// Quiz API client for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface QuizListItem {
  id: string;
  created_at: string;
  pdf_filename?: string;
  user_id: string;
  title: string;
  question_count: number;
}

export interface QuestionForTaking {
  id: string;
  question_text: string;
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
  const response = await fetch(`${API_BASE_URL}/api/quiz/create`, {
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

// List all quizzes (public)
export async function listQuizzes(limit: number = 20, offset: number = 0): Promise<{ quizzes: QuizListItem[]; limit: number; offset: number }> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/list?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch quizzes');
  }

  return response.json();
}

// Get quiz for taking (public, no correct answers)
export async function getQuizForTaking(quizId: string): Promise<QuizForTaking> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/take/${quizId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch quiz');
  }

  return response.json();
}

// Submit quiz attempt (requires auth)
export async function submitQuizAttempt(token: string, submission: SubmitQuizRequest): Promise<{
  attempt_id: string;
  score: number;
  total_questions: number;
  percentage: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to submit quiz');
  }

  return response.json();
}

// Get quiz attempt details (requires auth)
export async function getQuizAttempt(token: string, attemptId: string): Promise<QuizAttempt> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/attempt/${attemptId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attempt');
  }

  return response.json();
}

// List user's attempts (requires auth)
export async function listUserAttempts(token: string): Promise<{ attempts: AttemptListItem[] }> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/attempts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attempts');
  }

  return response.json();
}
