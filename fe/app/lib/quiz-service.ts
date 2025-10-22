import { Quiz, QuizQuestion } from './types';
import { apiClient, API_ENDPOINTS } from './api';

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
        type: "multiple-choice",
        text: "What is the capital of France?",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: "Paris",
        correctAnswer: 2,
        points: 1,
        explanation: "Paris is the capital and most populous city of France."
      },
      {
        id: "1-2",
        type: "multiple-choice",
        text: "Which continent is the largest by area?",
        question: "Which continent is the largest by area?",
        options: ["Africa", "Asia", "North America", "Europe"],
        correct: "Asia",
        correctAnswer: 1,
        points: 1,
        explanation: "Asia is the largest continent by both area and population."
      },
      {
        id: "1-3",
        type: "multiple-choice",
        text: "What is the longest river in the world?",
        question: "What is the longest river in the world?",
        options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
        correct: "Nile",
        correctAnswer: 1,
        points: 1,
        explanation: "The Nile River is generally considered the longest river in the world."
      }
    ]
  },
  {
    id: "2",
    title: "Probability Theory",
    description: "Test your understanding of probability concepts",
    difficulty: "medium",
    createdAt: "2024-04-24",
    updatedAt: "2024-04-24",
    totalQuestions: 9,
    questions: [
      {
        id: "2-1",
        type: "multiple-choice",
        text: "What does conditional probability represent?",
        question: "What does conditional probability represent?",
        options: [
          "The probability of an event given another event has occurred",
          "The probability of any random event",
          "The sum of all possible outcomes",
          "The average of multiple probabilities"
        ],
        correct: "The probability of an event given another event has occurred",
        correctAnswer: 0,
        points: 1,
        explanation: "Conditional probability P(A|B) is the probability of event A occurring given that event B has already occurred."
      },
      {
        id: "2-2",
        type: "multiple-choice",
        text: "In probability theory, what does 'marginal' mean?",
        question: "In probability theory, what does 'marginal' mean?",
        options: [
          "Across distribution of data points",
          "At the edge of a graph",
          "Nearly impossible events",
          "The smallest probability value"
        ],
        correct: "Across distribution of data points",
        correctAnswer: 0,
        points: 1,
        explanation: "Marginal probability refers to the probability of an event across the entire distribution of data points."
      },
      {
        id: "2-3",
        type: "multiple-choice",
        text: "What is the formula for conditional probability?",
        question: "What is the formula for conditional probability?",
        options: [
          "P(A|B) = P(A ∩ B) / P(B)",
          "P(A|B) = P(A) + P(B)",
          "P(A|B) = P(A) × P(B)",
          "P(A|B) = P(A) - P(B)"
        ],
        correct: "P(A|B) = P(A ∩ B) / P(B)",
        correctAnswer: 0,
        points: 1,
        explanation: "The conditional probability formula is P(A|B) = P(A ∩ B) / P(B), where P(A ∩ B) is the joint probability."
      },
      {
        id: "2-4",
        type: "multiple-choice",
        text: "What are probability paths?",
        question: "What are probability paths?",
        options: [
          "Sequences of events from initial to final outcomes",
          "Physical routes on a map",
          "Programming code structures",
          "Mathematical graph edges"
        ],
        correct: "Sequences of events from initial to final outcomes",
        correctAnswer: 0,
        points: 1,
        explanation: "Probability paths represent sequences of conditional probabilities from initial events to final outcomes."
      },
      {
        id: "2-5",
        type: "multiple-choice",
        text: "In the context of probability, what is a vector field?",
        question: "In the context of probability, what is a vector field?",
        options: [
          "A representation of probability distributions over multidimensional spaces",
          "A list of numbers in order",
          "A type of mathematical equation",
          "A collection of data points"
        ],
        correct: "A representation of probability distributions over multidimensional spaces",
        correctAnswer: 0,
        points: 1,
        explanation: "Vector fields in probability represent probability distributions over multidimensional spaces, showing direction and magnitude of probability flow."
      },
      {
        id: "2-6",
        type: "multiple-choice",
        text: "What does 'conditional' mean in probability terminology?",
        question: "What does 'conditional' mean in probability terminology?",
        options: [
          "Per single data point",
          "Multiple data points combined",
          "Uncertain outcomes",
          "Fixed probability values"
        ],
        correct: "Per single data point",
        correctAnswer: 0,
        points: 1,
        explanation: "In probability terminology, 'conditional' refers to per single data point, meaning the probability depends on a specific condition."
      },
      {
        id: "2-7",
        type: "multiple-choice",
        text: "What is joint probability?",
        question: "What is joint probability?",
        options: [
          "The probability of two or more events occurring together",
          "The sum of individual probabilities",
          "The difference between two probabilities",
          "The average of multiple events"
        ],
        correct: "The probability of two or more events occurring together",
        correctAnswer: 0,
        points: 1,
        explanation: "Joint probability is the probability of two or more events occurring simultaneously."
      },
      {
        id: "2-8",
        type: "multiple-choice",
        text: "How is the probability of a complete path calculated?",
        question: "How is the probability of a complete path calculated?",
        options: [
          "Product of all conditional probabilities along the path",
          "Sum of all conditional probabilities along the path",
          "Average of all conditional probabilities along the path",
          "Maximum conditional probability along the path"
        ],
        correct: "Product of all conditional probabilities along the path",
        correctAnswer: 0,
        points: 1,
        explanation: "The probability of a complete path is calculated as the product of all conditional probabilities along that path."
      },
      {
        id: "2-9",
        type: "multiple-choice",
        text: "What are score functions used for in probability?",
        question: "What are score functions used for in probability?",
        options: [
          "To evaluate the likelihood of different outcomes",
          "To count the number of events",
          "To measure time intervals",
          "To calculate geometric areas"
        ],
        correct: "To evaluate the likelihood of different outcomes",
        correctAnswer: 0,
        points: 1,
        explanation: "Score functions are used to evaluate the likelihood of different outcomes in probability and statistical models."
      }
    ]
  },
  {
    id: "3",
    title: "World Geography Advanced",
    description: "Advanced questions about world geography",
    difficulty: "hard",
    createdAt: "2024-04-24",
    updatedAt: "2024-04-24",
    totalQuestions: 20,
    questions: [
      {
        id: "3-1",
        type: "multiple-choice",
        text: "Which country has the most time zones?",
        question: "Which country has the most time zones?",
        options: ["Russia", "United States", "China", "Canada"],
        correct: "Russia",
        correctAnswer: 0,
        points: 1,
        explanation: "Russia spans 11 time zones, more than any other country."
      },
      {
        id: "3-2",
        type: "multiple-choice", 
        text: "What is the smallest country in the world?",
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        correct: "Vatican City",
        correctAnswer: 1,
        points: 1,
        explanation: "Vatican City is the smallest country in the world by both area and population."
      }
    ]
  }
];

// CRUD operations for quizzes
export class QuizService {
  // Get all quizzes from the API
  static async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.QUIZZES}/`);
      if (response.success) {
        return response.data || [];
      }
      return mockQuizzes; // Fallback to mock data
    } catch (error) {
      console.warn('Failed to fetch quizzes from API, using mock data:', error);
      return mockQuizzes;
    }
  }

  // Get quiz by ID from the API
  static async getQuizById(id: string): Promise<Quiz | undefined> {
    try {
      console.log(`Fetching quiz with ID: ${id}`);
      console.log(`API URL: ${API_ENDPOINTS.QUIZZES}/${id}`);
      
      const response = await apiClient.get(`${API_ENDPOINTS.QUIZZES}/${id}`);
      console.log('Quiz API response:', response);
      
      if (response.success) {
        console.log('Quiz found:', response.data);
        return response.data;
      }
      
      console.warn('API returned success=false, falling back to mock data');
      return mockQuizzes.find(quiz => quiz.id === id);
    } catch (error) {
      console.warn('Failed to fetch quiz from API, using mock data:', error);
      console.log('Looking for quiz in mock data with ID:', id);
      const mockQuiz = mockQuizzes.find(quiz => quiz.id === id);
      console.log('Mock quiz found:', mockQuiz);
      return mockQuiz;
    }
  }

  // Create quiz - not used directly, quizzes are created via AI generation
  static async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.QUIZZES, quiz);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create quiz');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      // Fallback to mock creation
      const newQuiz: Quiz = {
        ...quiz,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return newQuiz;
    }
  }

  // Update quiz
  static async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.QUIZZES}/${id}`, updates);
      if (response.success) {
        // Fetch updated quiz
        return await this.getQuizById(id) || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to update quiz:', error);
      return null;
    }
  }

  // Delete quiz
  static async deleteQuiz(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.QUIZZES}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      return false;
    }
  }

  // Search quizzes (client-side for now)
  static async searchQuizzes(query: string): Promise<Quiz[]> {
    const allQuizzes = await this.getAllQuizzes();
    const lowercaseQuery = query.toLowerCase();
    return allQuizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(lowercaseQuery) ||
      quiz.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get quizzes by difficulty (client-side for now)
  static async getQuizzesByDifficulty(difficulty: "easy" | "medium" | "hard"): Promise<Quiz[]> {
    const allQuizzes = await this.getAllQuizzes();
    return allQuizzes.filter(quiz => quiz.difficulty === difficulty);
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

// AI Quiz Generation - now connects to real backend
export const generateQuizFromFile = async (
  file: File,
  options: {
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    questionCount?: number;
  }
): Promise<Quiz> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', options.title);
  formData.append('description', options.description);
  formData.append('difficulty', options.difficulty);
  
  if (options.questionCount) {
    formData.append('questionCount', options.questionCount.toString());
  }

  try {
    const response = await apiClient.postForm(API_ENDPOINTS.UPLOAD_QUIZ, formData);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to generate quiz');
  } catch (error) {
    console.warn('Backend not available, processing file locally:', error);
    
    // Fallback: process file locally and generate quiz
    try {
      const content = await processUploadedFile(file);
      return await generateQuizFromContent(content, options);
    } catch (fileError) {
      console.error('Failed to process file locally:', fileError);
      throw new Error('Failed to generate quiz. Please try again or check if the file is readable.');
    }
  }
};

// AI Quiz Generation from text content
export const generateQuizFromContent = async (
  content: string,
  options: {
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    questionCount?: number;
  }
): Promise<Quiz> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.GENERATE_QUIZ, {
      content,
      title: options.title,
      description: options.description,
      difficulty: options.difficulty,
      questionCount: options.questionCount || 10,
    });
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to generate quiz');
  } catch (error) {
    console.warn('Backend not available, generating quiz locally:', error);
    
    // Enhanced fallback generation based on content
    const questionCount = options.questionCount || 10;
    const words = content.split(/\s+/).filter(word => word.length > 3);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Extract key terms and concepts
    const keyTerms = words.filter(word => 
      word.length > 5 && 
      !['which', 'where', 'these', 'those', 'their', 'there', 'would', 'should', 'could'].includes(word.toLowerCase())
    );
    
    // Check if content is mathematical/academic
    const isMathematical = content.toLowerCase().includes('probability') || 
                          content.toLowerCase().includes('formula') || 
                          content.toLowerCase().includes('equation') ||
                          content.toLowerCase().includes('theorem') ||
                          content.toLowerCase().includes('function');
    
    const mockQuestions: QuizQuestion[] = Array.from(
      { length: questionCount },
      (_, index) => {
        const correctIdx = Math.floor(Math.random() * 4);
        
        let questionText = '';
        let baseOptions = [];
        
        if (isMathematical && index < 3) {
          // Create math-specific questions
          const mathTerms = keyTerms.filter(term => 
            ['probability', 'conditional', 'marginal', 'formula', 'function', 'path', 'vector', 'field'].some(mathWord => 
              term.toLowerCase().includes(mathWord)
            )
          );
          
          const selectedTerm = mathTerms[index % mathTerms.length] || keyTerms[0] || 'probability';
          
          const mathQuestions = [
            {
              template: `What does ${selectedTerm} represent in this context?`,
              options: [
                `A statistical measure or concept`,
                `A programming variable`,
                `A geometric shape`,
                `A time measurement`
              ]
            },
            {
              template: `In probability theory, ${selectedTerm} is used to:`,
              options: [
                `Calculate likelihood of events`,
                `Measure physical distance`,
                `Count discrete objects`,
                `Determine color intensity`
              ]
            },
            {
              template: `The formula mentioned relates to:`,
              options: [
                `Mathematical probability calculations`,
                `Chemical reaction rates`,
                `Physical motion equations`,
                `Economic market trends`
              ]
            }
          ];
          
          const mathQ = mathQuestions[index % mathQuestions.length];
          questionText = mathQ.template;
          baseOptions = mathQ.options;
          
        } else {
          // Create general questions based on content analysis
          const questionTypes = [
            {
              template: `What is ${keyTerms[index % keyTerms.length] || 'the main concept'}?`,
              options: [`A key concept in the material`, `An unrelated topic`, `A minor detail`, `Background information`]
            },
            {
              template: `According to the content, which statement is most accurate?`,
              options: [`The material focuses on core principles`, `The content is purely theoretical`, `Only examples are provided`, `No clear structure exists`]
            },
            {
              template: `What is the primary focus of this material?`,
              options: [`Understanding fundamental concepts`, `Memorizing specific facts`, `Learning historical dates`, `Practicing basic skills`]
            },
            {
              template: `Which approach best describes the content?`,
              options: [`Systematic explanation of concepts`, `Random collection of facts`, `Personal opinions only`, `Outdated information`]
            }
          ];
          
          const questionType = questionTypes[index % questionTypes.length];
          questionText = questionType.template;
          baseOptions = questionType.options;
        }
        
        // Shuffle options to make them more random
        for (let i = baseOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [baseOptions[i], baseOptions[j]] = [baseOptions[j], baseOptions[i]];
        }
        
        return {
          id: `generated-${Date.now()}-${index}`,
          type: "multiple-choice",
          text: questionText,
          question: questionText,
          options: baseOptions,
          correct: baseOptions[correctIdx],
          correctAnswer: correctIdx,
          points: 1,
          explanation: `This question tests understanding of key concepts from the provided material.`
        };
      }
    );

    const newQuiz: Quiz = {
      id: `local-quiz-${Date.now()}`,
      title: options.title,
      description: options.description + " (Generated locally)",
      difficulty: options.difficulty,
      questions: mockQuestions,
      totalQuestions: mockQuestions.length,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    // Add to mock data so it appears in quiz list
    mockQuizzes.push(newQuiz);
    
    console.log('Generated quiz locally:', newQuiz);
    return newQuiz;
  }
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