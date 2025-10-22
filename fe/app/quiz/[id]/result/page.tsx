"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../../../../components/Header";
import { QuizService, calculateQuizScore, formatDate, getDifficultyLabel } from "../../../lib/quiz-service";
import { Quiz, QuizQuestion } from "../../../lib/types";

export default function QuizResult({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    const loadedQuiz = QuizService.getQuizById(id);
    if (!loadedQuiz) {
      setQuiz(null);
      return;
    }
    setQuiz(loadedQuiz);

    // Dummy scoring based on difficulty, consistent with History page
    const targetPercentage = (difficulty: "easy" | "medium" | "hard") => {
      switch (difficulty) {
        case "easy":
          return 90;
        case "medium":
          return 75;
        case "hard":
          return 50;
        default:
          return 80;
      }
    };

    const questions = loadedQuiz.questions;
    const desired = targetPercentage(loadedQuiz.difficulty);
    const correctCount = Math.max(0, Math.round((questions.length * desired) / 100));

    const dummyAnswers = questions.map((q, idx) => {
      if (idx < correctCount) return q.correctAnswer;
      // pick a wrong answer deterministically
      const wrong = (q.correctAnswer + 1) % q.options.length;
      return wrong;
    });
    setAnswers(dummyAnswers);
  }, [id]);

  const score = useMemo(() => {
    if (!quiz) return { percentage: 0, correct: 0, total: 0, score: 0 };
    return calculateQuizScore(answers, quiz.questions);
  }, [quiz, answers]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Quiz not found</div>
      </div>
    );
  }

  const difficultyColorHex = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#2ECC71"; // green
      case "medium":
        return "#F1C40F"; // yellow (Normal)
      case "hard":
        return "#E74C3C"; // red
      default:
        return "#888888";
    }
  };

  const percentDeg = Math.min(100, Math.max(0, score.percentage)) * 3.6; // 0..360

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#625FFF] mb-2">Quiz Result</h1>
        <p className="text-gray-400 mb-6">{quiz.description}</p>

        {/* Summary Card */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between">
            {/* Left: title and stats */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl md:text-2xl font-bold text-white">{quiz.title}</h2>
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-black"
                  style={{ backgroundColor: difficultyColorHex(quiz.difficulty) }}
                >
                  {quiz.difficulty === "medium" ? "Normal" : getDifficultyLabel(quiz.difficulty)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Image src="/calendar.png" alt="Date" width={20} height={20} className="w-5 h-5" />
                  <span>{formatDate(quiz.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/question_mark.png" alt="Questions" width={20} height={20} className="w-5 h-5" />
                  <span>{quiz.totalQuestions} Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/time.png" alt="Time" width={20} height={20} className="w-5 h-5" />
                  <span>10 Minutes</span>
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
                    <div className="text-2xl font-bold text-white">{score.percentage}%</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {quiz.questions.map((q: QuizQuestion, idx: number) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 relative">
                {/* correctness badge */}
                <div className="absolute top-4 right-4">
                  {isCorrect ? (
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
                  <h3 className="text-white font-semibold">{idx + 1}. {q.question}</h3>
                  <p className="text-xs text-gray-400">Options:</p>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isSelected = i === userAnswer;
                    const isAnswer = i === q.correctAnswer;
                    const base = "w-full text-left px-4 py-2.5 rounded-md border transition-colors";
                    let classes = "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750";
                    if (isAnswer && isSelected) {
                      classes = "bg-green-700 border-green-600 text-green-100";
                    } else if (isAnswer) {
                      classes = "bg-green-900 border-green-700 text-green-200";
                    } else if (isSelected && !isAnswer) {
                      classes = "bg-red-800 border-red-600 text-red-100";
                    }
                    return (
                      <button key={i} className={`${base} ${classes}`} disabled>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/history" className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">
            Back to History
          </Link>
          <Link href={`/quiz/${quiz.id}`} className="px-4 py-2 rounded-lg bg-[#625FFF] text-white hover:bg-[#544FFE]">
            Retake Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}