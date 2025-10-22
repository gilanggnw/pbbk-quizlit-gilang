"use client";

import PDFUploader from "../components/PDFUploader";
import { useState } from "react";

export default function PDFTestPage() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleTextExtracted = (text: string, metadata: any) => {
    setSuccess(`Successfully extracted text from ${metadata.filename} (${metadata.pageCount} pages)`);
    setError("");
    console.log("Extracted text:", text);
    console.log("Metadata:", metadata);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PDF Text Extractor
          </h1>
          <p className="text-gray-600">
            Upload a PDF file to extract its text content
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">
              <span className="font-semibold">Success:</span> {success}
            </p>
          </div>
        )}

        {/* PDF Uploader Component */}
        <PDFUploader
          onTextExtracted={handleTextExtracted}
          onError={handleError}
        />

        {/* Usage Instructions */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Choose File" and select a PDF document from your computer</li>
            <li>Click "Upload and Extract Text" to process the file</li>
            <li>Wait for the upload to complete (progress bar will show the status)</li>
            <li>View the extracted text in the text area below</li>
            <li>Copy the text to clipboard if needed</li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Note:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>Maximum file size: 100 MB</li>
              <li>Only PDF files are accepted</li>
              <li>Files are processed securely and not stored permanently</li>
              <li>Make sure the backend server is running on http://localhost:8080</li>
            </ul>
          </div>
        </div>

        {/* API Status */}
        <div className="max-w-4xl mx-auto mt-4 p-4 bg-gray-50 rounded text-center text-sm text-gray-600">
          Backend API: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:8080</code>
        </div>
      </div>
    </div>
  );
}
