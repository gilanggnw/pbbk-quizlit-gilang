import { Quiz, QuizQuestion } from './types';

// Mock data for development
export const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "World Geography",
    description: "Explore your knowledge of world geography",
    difficulty: "easy",
    createdAt: "2024-04-24",
    updatedAt: "2024-04-24",
    totalQuestions: 15,
    questions: [
      {
        id: "1-1",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        explanation: "Paris is the capital and most populous city of France."
      },
      {
        id: "1-2",
        question: "Which continent is the largest by area?",
        options: ["Africa", "Asia", "North America", "Europe"],
        correctAnswer: 1,
        explanation: "Asia is the largest continent by both area and population."
      },
      {
        id: "1-3",
        question: "What is the longest river in the world?",
        options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
        correctAnswer: 1,
        explanation: "The Nile River is generally considered the longest river in the world."
      }
    ]
  },
  {
    id: "2",
    title: "World Geography Advanced",
    description: "Advanced questions about world geography",
    difficulty: "hard",
    createdAt: "2024-04-24",
    updatedAt: "2024-04-24",
    totalQuestions: 20,
    questions: [
      {
        id: "2-1",
        question: "Which country has the most time zones?",
        options: ["Russia", "United States", "China", "Canada"],
        correctAnswer: 0,
        explanation: "Russia spans 11 time zones, more than any other country."
      },
      {
        id: "2-2",
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        correctAnswer: 1,
        explanation: "Vatican City is the smallest country in the world by both area and population."
      }
    ]
  }
];

// CRUD operations for quizzes
export class QuizService {
  private static quizzes: Quiz[] = [...mockQuizzes];

  static getAllQuizzes(): Quiz[] {
    return this.quizzes;
  }

  static getQuizById(id: string): Quiz | undefined {
    return this.quizzes.find(quiz => quiz.id === id);
  }

  static createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Quiz {
    const newQuiz: Quiz = {
      ...quiz,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.quizzes.unshift(newQuiz);
    return newQuiz;
  }

  static updateQuiz(id: string, updates: Partial<Quiz>): Quiz | null {
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) return null;

    this.quizzes[index] = {
      ...this.quizzes[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    return this.quizzes[index];
  }

  static deleteQuiz(id: string): boolean {
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) return false;

    this.quizzes.splice(index, 1);
    return true;
  }

  static searchQuizzes(query: string): Quiz[] {
    const lowercaseQuery = query.toLowerCase();
    return this.quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(lowercaseQuery) ||
      quiz.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getQuizzesByDifficulty(difficulty: "easy" | "medium" | "hard"): Quiz[] {
    return this.quizzes.filter(quiz => quiz.difficulty === difficulty);
  }
}

// File processing utilities
export const processUploadedFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      // In a real app, you'd use a PDF parsing library
      reader.readAsText(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};

// AI Quiz Generation (mock implementation)
export const generateQuizFromContent = async (
  content: string,
  options: {
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    questionCount?: number;
  }
): Promise<Quiz> => {
  // Mock AI generation - in real app, this would call an AI service
  const mockQuestions: QuizQuestion[] = Array.from(
    { length: options.questionCount || 10 },
    (_, index) => ({
      id: `generated-${Date.now()}-${index}`,
      question: `Generated question ${index + 1} from your content about "${content.substring(0, 50)}..."`,
      options: [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is an explanation for question ${index + 1}`
    })
  );

  return QuizService.createQuiz({
    title: options.title,
    description: options.description,
    difficulty: options.difficulty,
    questions: mockQuestions,
    totalQuestions: mockQuestions.length
  });
};

// Utility functions
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'bg-green-600';
    case 'medium': return 'bg-yellow-600';
    case 'hard': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

export const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'Easy';
    case 'medium': return 'Medium';
    case 'hard': return 'Hard';
    default: return 'Unknown';
  }
};

export const calculateQuizScore = (
  answers: number[],
  questions: QuizQuestion[]
): { score: number; percentage: number; correct: number; total: number } => {
  let correct = 0;
  
  answers.forEach((answer, index) => {
    if (questions[index] && answer === questions[index].correctAnswer) {
      correct++;
    }
  });
  
  const total = questions.length;
  const percentage = Math.round((correct / total) * 100);
  
  return {
    score: correct,
    percentage,
    correct,
    total
  };
};