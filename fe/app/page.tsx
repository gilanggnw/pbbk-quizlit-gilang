import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                QuizLit
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Create Amazing
            <span className="text-indigo-600"> Quizzes</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Generate interactive quizzes in seconds. Perfect for educators, trainers, and anyone who wants to test knowledge in a fun way.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Everything You Need Section */}
        <div className="mt-32">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to create{" "}
              <span className="text-indigo-600">amazing quizzes</span>
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500 dark:text-gray-300">
              From document upload to detailed analytics, we've got every step
              of your quiz creation journey covered.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Generation */}
            <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Quick Generation</h3>
              <p className="text-gray-300 leading-relaxed">
                Create quizzes in minutes with our intuitive interface and smart question generation.
              </p>
            </div>

            {/* Easy to Use */}
            <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy to Use</h3>
              <p className="text-gray-300 leading-relaxed">
                Create quizzes in minutes with our intuitive interface and smart question generation.
              </p>
            </div>

            {/* Customizable */}
            <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Customizable</h3>
              <p className="text-gray-300 leading-relaxed">
                Customize your quizzes with different question types and difficulty levels.
              </p>
            </div>

            {/* Quick Generation (Second Row) */}
            <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Quick Generation</h3>
              <p className="text-gray-300 leading-relaxed">
                Create quizzes in minutes with our intuitive interface and smart question generation.
              </p>
            </div>

            {/* Easy to Use (Second Row) */}
            <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy to Use</h3>
              <p className="text-gray-300 leading-relaxed">
                Create quizzes in minutes with our intuitive interface and smart question generation.
              </p>
            </div>

            {/* Easy to Use (Third in Second Row) */}
            <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy to Use</h3>
              <p className="text-gray-300 leading-relaxed">
                Create quizzes in minutes with our intuitive interface and smart question generation.
              </p>
            </div>
          </div>
        </div>


      </main>
    </div>
  );
}
