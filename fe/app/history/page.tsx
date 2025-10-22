"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Link from "next/link";
import Image from "next/image";
import { QuizService, formatDate } from "../lib/quiz-service";

export default function HistoryPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await QuizService.getAllQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to load quizzes:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  // Dummy scores based on difficulty to match screenshot style
  const scoreForDifficulty = (difficulty: "easy" | "medium" | "hard") => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading history...</div>
      </div>
    );
  }

  const totalQuizzes = quizzes.length;
  const scores = quizzes.map((q) => scoreForDifficulty(q.difficulty));
  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const recentActivity = "Today";

  // Build a list of history entries by repeating existing quizzes with mock scores
  const historyEntries = Array.from({ length: 8 }).map((_, i) => {
    const quiz = quizzes[i % quizzes.length];
    const score = scoreForDifficulty(quiz.difficulty);
    const correct = Math.round((quiz.totalQuestions * score) / 100);
    return {
      id: `${quiz.id}-${i}`,
      quiz,
      score,
      correct,
      total: quiz.totalQuestions,
      createdAt: quiz.createdAt,
      timeSpent: `${15 + (i % 4) * 5} minutes`,
    };
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#625FFF] mb-6">Quiz History</h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                 <Image src="/document.png" alt="Total Quizzes" width={48} height={48} className="w-12 h-12" />
               </div>
              <div>
                <p className="text-gray-400 text-sm">Total Quizzes</p>
                <p className="text-3xl font-bold text-white">{totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                 <Image src="/question_mark.png" alt="Average Score" width={48} height={48} className="w-12 h-12" />
               </div>
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-white">{averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
             <div className="flex items-center space-x-4">
               <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                 <Image src="/time.png" alt="Recent Activity" width={48} height={48} className="w-12 h-12" />
               </div>
               <div>
                 <p className="text-gray-400 text-sm">Recent Activity</p>
                 <p className="text-3xl font-bold text-white">{recentActivity}</p>
               </div>
             </div>
           </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
             <div className="flex items-center space-x-4">
               <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                 <Image src="/time.png" alt="Recent Activity" width={48} height={48} className="w-12 h-12" />
               </div>
               <div>
                 <p className="text-gray-400 text-sm">Recent Activity</p>
                 <p className="text-3xl font-bold text-white">{recentActivity}</p>
               </div>
             </div>
           </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-300">
            <span className="text-sm">Filter & Sort:</span>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm">All Categories</button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Sort by:</span>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm">Most Recent</button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {historyEntries.map(({ id, quiz, score, correct, total, createdAt, timeSpent }) => (
            <div key={id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
              {/* Left: icon + title + meta */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                   <Image src="/bookmark.png" alt="Quiz" width={32} height={32} className="w-8 h-8" />
                 </div>
                <div>
                  <div>
                     <h3 className="text-white font-semibold text-sm md:text-base">{quiz.title}</h3>
                     <span
                       className={`text-xs inline-block px-2 py-0.5 rounded-md font-medium mt-1 ${
                         quiz.difficulty === "easy"
                           ? "bg-[#2ECC71] text-black"
                           : quiz.difficulty === "hard"
                           ? "bg-[#E74C3C] text-white"
                           : "bg-[#F1C40F] text-black"
                       }`}
                     >
                       {quiz.difficulty === "medium"
                         ? "Normal"
                         : quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                     </span>
                   </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18m-2 9H5a2 2 0 01-2-2V7h18v11a2 2 0 01-2 2z" />
                      </svg>
                      <span>Created {formatDate(createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Image src="/calendar.png" alt="Questions" width={20} height={20} className="w-5 h-5" />
                      <span>{quiz.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{timeSpent}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: score + button */}
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-white text-xl font-bold">{score}</div>
                  <div className="text-gray-400 text-xs">{correct}/{total}</div>
                </div>
                <Link
                  href={`/quiz/${quiz.id}/result`}
                  className="bg-[#625FFF] hover:bg-[#544FFE] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}