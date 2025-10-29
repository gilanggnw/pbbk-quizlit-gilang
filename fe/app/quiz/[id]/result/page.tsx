"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import { formatDate, getDifficultyLabel } from "../../../lib/quiz-service";
import { getQuizAttempt } from "../../../lib/quizApi";

interface AttemptResult {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  completed_at: string;
  results: Array<{
    question_id: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    options?: string[];
  }>;
}

export default function QuizResult({ params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = use(params);
  const router = useRouter();
  const [attemptData, setAttemptData] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        setLoading(true);
        const data: any = await getQuizAttempt(attemptId);
        // The backend returns the attempt data directly
        setAttemptData(data);
      } catch (err) {
        console.error('Failed to load attempt:', err);
        setError('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };
    
    loadAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Quiz results not found'}</div>
          <Link href="/history" className="text-blue-400 hover:text-blue-300">
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const percentDeg = Math.min(100, Math.max(0, attemptData.score)) * 3.6; // 0..360

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Quiz Result</h1>
        <p className="text-gray-400 mb-6">{attemptData.quiz_title}</p>

        {/* Summary Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {/* Left: title and stats */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl md:text-2xl font-bold text-white">{attemptData.quiz_title}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Image src="/calendar.png" alt="Date" width={20} height={20} className="w-5 h-5" />
                  <span>{new Date(attemptData.completed_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/question_mark.png" alt="Questions" width={20} height={20} className="w-5 h-5" />
                  <span>{attemptData.total_questions} Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/check.png" alt="Correct" width={20} height={20} className="w-5 h-5" />
                  <span>{attemptData.correct_answers} Correct</span>
                </div>
              </div>
            </div>

            {/* Right: score ring */}
            <div className="ml-6">
              <div className="relative w-24 h-24">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundImage: `conic-gradient(#625FFF ${percentDeg}deg, #2d2b2b ${percentDeg}deg)`,
                  }}
                />
                <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(attemptData.score)}%</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {attemptData.results.map((result, idx) => {
            // Extract options from the result if available, otherwise show user and correct answers
            const hasOptions = result.options && result.options.length > 0;
            
            return (
              <div key={result.question_id} className="bg-gray-800 rounded-lg p-6 relative">
                {/* correctness badge */}
                <div className="absolute top-4 right-4">
                  {result.is_correct ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="text-white font-semibold">{idx + 1}. {result.question_text}</h3>
                </div>

                {hasOptions ? (
                  <div className="space-y-3">
                    {result.options!.map((opt, i) => {
                      const isSelected = opt === result.user_answer;
                      const isAnswer = opt === result.correct_answer;
                      const base = "w-full text-left px-4 py-3 rounded-lg transition-colors";
                      let classes = "bg-gray-700 text-gray-300";
                      if (isAnswer && isSelected) {
                        classes = "bg-green-600 text-white";
                      } else if (isAnswer) {
                        classes = "bg-green-700 text-white";
                      } else if (isSelected && !isAnswer) {
                        classes = "bg-red-600 text-white";
                      }
                      return (
                        <button key={i} className={`${base} ${classes}`} disabled>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className={`p-3 rounded-lg ${result.is_correct ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                      <p className="text-gray-400 mb-1">Your answer:</p>
                      <p className="text-white">{result.user_answer || '(No answer)'}</p>
                    </div>
                    {!result.is_correct && (
                      <div className="p-3 rounded-lg bg-green-900/30 border border-green-700">
                        <p className="text-gray-400 mb-1">Correct answer:</p>
                        <p className="text-white">{result.correct_answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/history" className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 font-medium transition-colors">
            Back to History
          </Link>
          <Link href={`/quiz/${attemptData.quiz_id}`} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors">
            Retake Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}