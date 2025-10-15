'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { getQuizAttempt } from '@/app/lib/quizApi';
import { getAccessToken } from '@/app/lib/auth';

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
      const token = await getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const result = await getQuizAttempt(token, resolvedParams.id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-600 mb-4">
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Results not found'}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, quiz, questions } = data;
  const userAnswers = attempt.answers ? JSON.parse(attempt.answers) : {};
  const percentage = (attempt.score / attempt.total_questions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {quiz.title || 'Quiz Results'}
            </h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {attempt.score}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {attempt.total_questions}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center ${
                percentage >= 70
                  ? 'bg-green-50'
                  : percentage >= 50
                  ? 'bg-yellow-50'
                  : 'bg-red-50'
              }`}
            >
              <div
                className={`text-3xl font-bold mb-1 ${
                  percentage >= 70
                    ? 'text-green-600'
                    : percentage >= 50
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          {/* Completion Time */}
          <div className="mt-4 text-sm text-gray-600">
            <span>Completed on: </span>
            <span className="font-medium">
              {new Date(attempt.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Question Review
          </h2>

          {questions.map((question: any, index: number) => {
            const userAnswer = userAnswers[question.id.toString()];
            const isCorrect = userAnswer === question.correct_answer;
            const options = JSON.parse(question.options);

            return (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">
                    <span className="text-gray-500 mr-2">
                      Question {index + 1}:
                    </span>
                    {question.question_text}
                  </h3>
                  <div
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
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

                    let bgColor = 'bg-gray-50';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-gray-700';
                    let icon = null;

                    if (isCorrectAnswer) {
                      bgColor = 'bg-green-50';
                      borderColor = 'border-green-500';
                      textColor = 'text-green-900';
                      icon = (
                        <svg
                          className="w-5 h-5 text-green-600"
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
                      bgColor = 'bg-red-50';
                      borderColor = 'border-red-500';
                      textColor = 'text-red-900';
                      icon = (
                        <svg
                          className="w-5 h-5 text-red-600"
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
                              <span className="text-sm text-red-600">
                                Your answer
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-sm text-green-600">
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
                  <div className="mt-4 text-sm text-gray-500 italic">
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
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 text-center font-medium"
          >
            Retake Quiz
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 text-center font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
