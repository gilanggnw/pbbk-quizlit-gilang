"use client";

import { useState, useRef } from "react";
import { uploadAndExtractPDF, uploadPDFWithProgress } from "../lib/pdfApi";

interface PDFUploaderProps {
  onTextExtracted?: (text: string, metadata: {
    filename: string;
    pageCount: number;
    wordCount: number;
  }) => void;
  onError?: (error: string) => void;
}

export default function PDFUploader({ onTextExtracted, onError }: PDFUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pdfMetadata, setPdfMetadata] = useState<{
    filename: string;
    fileSize: string;
    pageCount: number;
    wordCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        onError?.('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setExtractedText("");
      setPdfMetadata(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError?.('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload with progress tracking
      const response = await uploadPDFWithProgress(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (response.success && response.data) {
        setExtractedText(response.data.text);
        setPdfMetadata({
          filename: response.data.filename,
          fileSize: response.data.file_size,
          pageCount: response.data.page_count,
          wordCount: response.data.word_count,
        });

        // Call the callback if provided
        onTextExtracted?.(response.data.text, {
          filename: response.data.filename,
          pageCount: response.data.page_count,
          wordCount: response.data.word_count,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload PDF';
      onError?.(errorMessage);
      console.error('Error uploading PDF:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setExtractedText("");
    setPdfMetadata(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Upload PDF</h2>
        
        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select PDF File
          </label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <button
                onClick={handleClear}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected:</span> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload and Extract Text'}
        </button>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              {uploadProgress.toFixed(0)}%
            </p>
          </div>
        )}

        {/* PDF Metadata */}
        {pdfMetadata && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">PDF Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Filename:</span> {pdfMetadata.filename}
              </div>
              <div>
                <span className="font-medium">File Size:</span> {pdfMetadata.fileSize}
              </div>
              <div>
                <span className="font-medium">Pages:</span> {pdfMetadata.pageCount}
              </div>
              <div>
                <span className="font-medium">Characters:</span> {pdfMetadata.wordCount}
              </div>
            </div>
          </div>
        )}

        {/* Extracted Text */}
        {extractedText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Extracted Text</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(extractedText);
                  alert('Text copied to clipboard!');
                }}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {extractedText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
