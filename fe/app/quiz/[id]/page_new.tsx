"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuizForTaking, submitQuizAttempt } from '@/app/lib/quizApi';
import { getCurrentUser } from '@/app/lib/auth';

interface Question {
  id: string;
  text: string;  // Backend returns 'text', not 'question_text'
  options: string[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  totalQuestions?: number;
  difficulty?: string;
}

export default function StartQuiz({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [selectedMode, setSelectedMode] = useState<'practice' | 'challenge' | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Load quiz data from backend
  useEffect(() => {
    loadQuiz();
  }, [resolvedParams.id]);

  // Handle redirect to results when quiz is completed
  useEffect(() => {
    if (showResults && attemptId) {
      router.push(`/quiz/results/${attemptId}`);
    }
  }, [showResults, attemptId, router]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const quizData = await getQuizForTaking(resolvedParams.id);
      setQuiz(quizData);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (mode: 'practice' | 'challenge') => {
    setSelectedMode(mode);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer
    });
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      await handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      if (!quiz) return;

      // Convert answers to backend format
      const answers: { [key: string]: string } = {};
      quiz.questions.forEach((q, idx) => {
        answers[q.id] = selectedAnswers[idx] || '';
      });

      const result = await submitQuizAttempt({
        quiz_id: resolvedParams.id,
        answers: answers
      });

      setAttemptId(result.attempt_id);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (showResults && attemptId) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to results...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-white">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Quiz not found</h2>
          <Link 
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                QuizLit
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-white">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-gray-800 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-8">
              {currentQuestion.text}
            </h2>
            
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedAnswers[currentQuestionIndex] === option
                      ? 'border-blue-500 bg-blue-900/20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[currentQuestionIndex] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-300 mb-8">{quiz.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Questions</div>
              <div className="text-white text-2xl font-bold">{quiz.questions.length}</div>
            </div>
            {quiz.difficulty && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Difficulty</div>
                <div className="text-white text-2xl font-bold capitalize">{quiz.difficulty}</div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleStartQuiz}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors"
          >
            Start Quiz
          </button>
          
          <Link
            href="/dashboard"
            className="block mt-4 text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
