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
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const quizData = await getQuizForTaking(resolvedParams.id);
        console.log('Loaded quiz data:', quizData);
        console.log('Questions:', quizData.questions);
        setQuiz(quizData);
      } catch (error) {
        console.error('Failed to load quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadQuiz();
  }, [resolvedParams.id, router]);

  // Handle redirect to results when quiz is completed
  useEffect(() => {
    if (showResults && attemptId) {
      router.push(`/quiz/results/${attemptId}`);
    }
  }, [showResults, attemptId, router]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <div>Quiz not found</div>
          <div className="text-sm mt-2 text-gray-400">Quiz ID: {resolvedParams.id}</div>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm block mt-4">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;

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
    // Safety check for questions
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">No questions available</h2>
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
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-blue-400 mb-2">{quiz.title}</h1>
          <p className="text-gray-300 mb-1">{quiz.description}</p>
          
          <div className="flex items-center justify-center space-x-4 mb-8 text-gray-400">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{quiz.totalQuestions} questions</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm">{quiz.difficulty} Difficulty</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleModeSelect('practice')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMode === 'practice'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">Practice Mode</h3>
                  <p className="text-gray-400 text-sm">Unlimited time to learn</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleModeSelect('challenge')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMode === 'challenge'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">Challenge Mode</h3>
                  <p className="text-gray-400 text-sm">Timed quiz</p>
                </div>
              </div>
            </button>
          </div>
          
          <button
            onClick={handleStartQuiz}
            disabled={!selectedMode}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Start Quiz
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Take your time and read each question carefully
          </p>
        </div>
      </div>
    </div>
  );
}