"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut, getUserDisplayName, getUserInitials, User } from "@/app/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              QuizLit
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/create" className="text-gray-300 hover:text-white transition-colors">
                Create
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                My Quizzes
              </Link>
              <Link href="/profile" className="text-white font-medium">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                {getUserInitials(user)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {getUserDisplayName(user)}
                </h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-8 py-6">
            <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-1/3">
                  <p className="text-gray-400 text-sm font-medium">Username</p>
                </div>
                <div className="w-2/3">
                  <p className="text-white">{getUserDisplayName(user)}</p>
                </div>
              </div>

              <div className="flex items-start border-t border-gray-700 pt-4">
                <div className="w-1/3">
                  <p className="text-gray-400 text-sm font-medium">Email</p>
                </div>
                <div className="w-2/3">
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-700 flex space-x-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
