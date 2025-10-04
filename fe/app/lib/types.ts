export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: number[];
  score: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}