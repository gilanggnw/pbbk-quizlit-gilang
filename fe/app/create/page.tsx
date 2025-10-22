"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { generateQuizFromFile, generateQuizFromContent } from '../lib/quiz-service';
import Header from "../../components/Header";
// Removed import as we're using direct implementation

export default function CreateQuiz() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    description: "",
    difficulty: "easy" as "easy" | "medium" | "hard"
  });
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.type)) {
      setUploadedFile(file);
      setShowQuizDetails(true);
    } else {
      alert('Please upload a PDF, DOCX, or TXT file');
    }
  };

  const generateQuiz = async () => {
    console.log('generateQuiz called');
    console.log('uploadedFile:', uploadedFile);
    console.log('quizDetails:', quizDetails);

    if (!quizDetails.title || !quizDetails.description) {
      alert('Please fill in all quiz details');
      return;
    }

    setIsGenerating(true);

    try {
      let quiz;
      
      if (uploadedFile) {
        // Use file upload API
        quiz = await generateQuizFromFile(uploadedFile, {
          title: quizDetails.title,
          description: quizDetails.description,
          difficulty: quizDetails.difficulty,
          questionCount: 10,
        });
      } else {
        // Use text generation API with placeholder content
        quiz = await generateQuizFromContent(
          "Please generate a general knowledge quiz about " + quizDetails.title,
          {
            title: quizDetails.title,
            description: quizDetails.description,
            difficulty: quizDetails.difficulty,
            questionCount: 10,
          }
        );
      }

      console.log('Quiz generated successfully:', quiz);
      alert('Quiz created successfully!');
      
      // Redirect to dashboard
      console.log('Redirecting to dashboard');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upload <span className="text-blue-400">Your File</span>
          </h1>
          <p className="text-gray-300">
            Turn your PDFs, Docs, or Notes into Interactive quizzes instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Area */}
          <div>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-800'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
              />
              
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                Drag & drop your file here
              </h3>
              <p className="text-gray-400 mb-4">
                or click to browse your files
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Choose File
                </button>
                <div className="text-gray-400 text-sm">or</div>
                <button
                  onClick={() => setShowQuizDetails(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Quiz Manually
                </button>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="mt-4">
              <p className="text-gray-400 text-sm text-center">Supported formats:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded">
                  <span className="text-red-400 text-sm">📄</span>
                  <span className="text-gray-300 text-sm">PDF</span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded">
                  <span className="text-blue-400 text-sm">📘</span>
                  <span className="text-gray-300 text-sm">DOCX</span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded">
                  <span className="text-green-400 text-sm">📄</span>
                  <span className="text-gray-300 text-sm">TXT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center">
            <div className="bg-blue-600/20 rounded-lg p-8 w-full">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-600/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-300">
                  Upload your study materials and we'll create engaging quizzes automatically
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Details Form */}
        {showQuizDetails && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quiz Details</h2>
            <p className="text-gray-400 mb-6">Give your quiz a name and description</p>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizDetails.title}
                  onChange={(e) => setQuizDetails({...quizDetails, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Quiz Description
                </label>
                <textarea
                  value={quizDetails.description}
                  onChange={(e) => setQuizDetails({...quizDetails, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Enter quiz description"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Choose Difficulty Level
                </label>
                <p className="text-gray-400 text-sm mb-4">
                  Select the complexity level for your quiz questions
                </p>
                <div className="flex space-x-4">
                  {[
                    { value: 'easy', label: 'Beginner', color: 'green' },
                    { value: 'medium', label: 'Intermediate', color: 'yellow' },
                    { value: 'hard', label: 'Expert', color: 'red' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setQuizDetails({...quizDetails, difficulty: level.value as "easy" | "medium" | "hard"})}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        quizDetails.difficulty === level.value
                          ? `bg-${level.color}-600 text-white`
                          : `bg-gray-700 text-gray-300 hover:bg-${level.color}-600/20`
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={generateQuiz}
              disabled={!quizDetails.title || !quizDetails.description || isGenerating}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
          </div>
        )}

        {/* Sample Quizzes */}
        {!showQuizDetails && (
          <div className="mt-12">
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: "World Geography",
                  description: "Explore your knowledge of world geography",
                  questions: 15,
                  difficulty: "Easy Difficulty"
                },
                {
                  id: 2,
                  title: "World Geography", 
                  description: "Explore your knowledge of world geography",
                  questions: 15,
                  difficulty: "Medium Difficulty"
                },
                {
                  id: 3,
                  title: "World Geography",
                  description: "Explore your knowledge of world geography", 
                  questions: 15,
                  difficulty: "Hard Difficulty"
                }
              ].map((quiz, index) => (
                <div key={quiz.id} className="bg-blue-600 rounded-lg p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{quiz.id}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{quiz.title}</h3>
                      <p className="text-blue-100 text-sm">{quiz.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-blue-100 text-sm">🗣️ {quiz.questions} questions</span>
                        <span className="text-blue-100 text-sm">🎯 {quiz.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}