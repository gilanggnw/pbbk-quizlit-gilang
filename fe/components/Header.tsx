"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, getUserDisplayName, getUserInitials, signOut, User } from "../app/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get current user on mount
    getCurrentUser().then((u) => setUser(u));
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

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

          {/* Right: User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {initials}
              </div>
              <span>{displayName}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-600">
                  <p className="text-sm text-white font-medium">{displayName}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  onClick={() => setShowDropdown(false)}
                >
                  History
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}