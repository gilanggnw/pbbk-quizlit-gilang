'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { getQuizAttempt } from '@/app/lib/quizApi';
import { getCurrentUser } from '@/app/lib/auth';

interface QuestionResult {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  user_answer?: string;
}

export default function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [resolvedParams.id]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const result = await getQuizAttempt(resolvedParams.id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#625FFF] mb-4"></div>
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error || 'Results not found'}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#625FFF] hover:bg-[#544FFE] text-white px-6 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, quiz, questions } = data;
  const userAnswers = attempt.answers || {};
  const percentage = (attempt.score / attempt.total_questions) * 100;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">
              {quiz.title || 'Quiz Results'}
            </h1>
            <Link
              href="/dashboard"
              className="text-[#625FFF] hover:text-[#544FFE] font-medium transition-colors"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#625FFF] mb-1">
                {attempt.score}
              </div>
              <div className="text-sm text-gray-400">Correct Answers</div>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-300 mb-1">
                {attempt.total_questions}
              </div>
              <div className="text-sm text-gray-400">Total Questions</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center border ${
                percentage >= 70
                  ? 'bg-green-900 border-green-700'
                  : percentage >= 50
                  ? 'bg-yellow-900 border-yellow-700'
                  : 'bg-red-900 border-red-700'
              }`}
            >
              <div
                className={`text-3xl font-bold mb-1 ${
                  percentage >= 70
                    ? 'text-green-400'
                    : percentage >= 50
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
          </div>

          {/* Completion Time */}
          <div className="mt-4 text-sm text-gray-400">
            <span>Completed on: </span>
            <span className="font-medium text-gray-300">
              {new Date(attempt.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Question Review
          </h2>

          {questions.map((question: any, index: number) => {
            const userAnswer = userAnswers[question.id.toString()];
            const isCorrect = userAnswer === question.correct_answer;
            const options = question.options; // Already an array from backend

            return (
              <div
                key={question.id}
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex-1">
                    <span className="text-gray-400 mr-2">
                      Question {index + 1}:
                    </span>
                    {question.text}
                  </h3>
                  <div
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect
                        ? 'bg-green-900 border border-green-700 text-green-400'
                        : 'bg-red-900 border border-red-700 text-red-400'
                    }`}
                  >
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {options.map((option: string, optIndex: number) => {
                    const isUserAnswer = option === userAnswer;
                    const isCorrectAnswer = option === question.correct_answer;

                    let bgColor = 'bg-gray-700';
                    let borderColor = 'border-gray-600';
                    let textColor = 'text-gray-300';
                    let icon = null;

                    if (isCorrectAnswer) {
                      bgColor = 'bg-green-900';
                      borderColor = 'border-green-600';
                      textColor = 'text-green-300';
                      icon = (
                        <svg
                          className="w-5 h-5 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      );
                    } else if (isUserAnswer) {
                      bgColor = 'bg-red-900';
                      borderColor = 'border-red-600';
                      textColor = 'text-red-300';
                      icon = (
                        <svg
                          className="w-5 h-5 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      );
                    }

                    return (
                      <div
                        key={optIndex}
                        className={`p-4 rounded-lg border-2 ${bgColor} ${borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${textColor}`}>
                            {option}
                          </span>
                          <div className="flex items-center space-x-2">
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="text-sm text-red-400">
                                Your answer
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-sm text-green-400">
                                Correct answer
                              </span>
                            )}
                            {icon}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* No answer provided */}
                {!userAnswer && (
                  <div className="mt-4 text-sm text-gray-400 italic">
                    You did not answer this question.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href={`/quiz/${quiz.id}`}
            className="flex-1 bg-[#625FFF] hover:bg-[#544FFE] text-white py-3 px-6 rounded-md text-center font-medium transition-colors"
          >
            Retake Quiz
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white py-3 px-6 rounded-md text-center font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
