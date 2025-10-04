// API client for PDF Parser backend
// Base URL - update this based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface PDFUploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    file_size: string;
    page_count: number;
    text: string;
    word_count: number;
  };
  error?: string;
}

export interface PDFInfoResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    file_size: string;
    page_count: number;
  };
  error?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  time: string;
}

/**
 * Check if the API server is healthy
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  
  if (!response.ok) {
    throw new Error('API health check failed');
  }
  
  return response.json();
}

/**
 * Upload a PDF file and extract text content
 * @param file - The PDF file to upload
 * @returns Promise with extracted text and metadata
 */
export async function uploadAndExtractPDF(file: File): Promise<PDFUploadResponse> {
  // Validate file type
  if (!file.name.endsWith('.pdf')) {
    throw new Error('Only PDF files are allowed');
  }

  // Validate file size (100MB max)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 100MB limit');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
    method: 'POST',
    body: formData,
  });

  const data: PDFUploadResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload PDF');
  }

  return data;
}

/**
 * Get PDF information without extracting full text
 * @param file - The PDF file to analyze
 * @returns Promise with PDF metadata
 */
export async function getPDFInfo(file: File): Promise<PDFInfoResponse> {
  // Validate file type
  if (!file.name.endsWith('.pdf')) {
    throw new Error('Only PDF files are allowed');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/pdf/info`, {
    method: 'POST',
    body: formData,
  });

  const data: PDFInfoResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get PDF info');
  }

  return data;
}

/**
 * Upload PDF with progress tracking (for larger files)
 * @param file - The PDF file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with extracted text and metadata
 */
export async function uploadPDFWithProgress(
  file: File,
  onProgress?: (progress: number) => void
): Promise<PDFUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data: PDFUploadResponse = JSON.parse(xhr.responseText);
        resolve(data);
      } else {
        try {
          const error: PDFUploadResponse = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred'));
    });

    xhr.open('POST', `${API_BASE_URL}/api/pdf/upload`);
    xhr.send(formData);
  });
}
