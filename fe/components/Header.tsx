"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left: Brand + Nav */}
          <div className="flex items-center space-x-12">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              QuizLit
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/create" className="text-gray-300 hover:text-white transition-colors">
                Create
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                My Quizzes
              </Link>
              <Link href="/history" className="text-gray-300 hover:text-white transition-colors">
                History
              </Link>
            </nav>
          </div>

          {/* Right: User */}
          <div className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              JD
            </div>
            <span>John Doe</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}