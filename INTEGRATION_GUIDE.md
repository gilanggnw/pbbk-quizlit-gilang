# PDF Upload and Text Extraction - Integration Guide

This guide shows how to integrate PDF upload and text extraction functionality between the Go backend and Next.js frontend.

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd be
go run main.go pdf_parser.go utils.go api_server.go -server -port 8080
```

The server will start on `http://localhost:8080`

### 2. Start the Frontend

```bash
cd fe
npm install  # if not already installed
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Test the PDF Upload

Open your browser and navigate to:
```
http://localhost:3000/pdf-test
```

## 📁 Project Structure

### Backend (`/be`)
```
be/
├── main.go           # CLI and server entry point
├── api_server.go     # REST API server implementation
├── pdf_parser.go     # PDF text extraction logic
├── utils.go          # File validation and error handling
├── go.mod            # Go dependencies
├── API_DOCUMENTATION.md  # API documentation
└── uploads/          # Temporary upload directory (auto-created)
```

### Frontend (`/fe`)
```
fe/
├── app/
│   ├── lib/
│   │   └── pdfApi.ts           # API client functions
│   ├── components/
│   │   └── PDFUploader.tsx     # Reusable PDF upload component
│   └── pdf-test/
│       └── page.tsx            # Demo page for testing
└── .env.local                  # Environment variables
```

## 🔌 API Endpoints

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Upload PDF and Extract Text
```bash
curl -X POST http://localhost:8080/api/pdf/upload \
  -F "file=@document.pdf"
```

### Get PDF Info Only
```bash
curl -X POST http://localhost:8080/api/pdf/info \
  -F "file=@document.pdf"
```

## 💻 Usage in Your Frontend Code

### Import the API Client

```typescript
import { uploadAndExtractPDF, getPDFInfo } from '@/app/lib/pdfApi';
```

### Upload and Extract Text

```typescript
async function handleUpload(file: File) {
  try {
    const response = await uploadAndExtractPDF(file);
    
    if (response.success && response.data) {
      console.log('Extracted text:', response.data.text);
      console.log('Page count:', response.data.page_count);
      console.log('File size:', response.data.file_size);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Use the PDFUploader Component

```typescript
import PDFUploader from '@/app/components/PDFUploader';

export default function MyPage() {
  const handleTextExtracted = (text: string, metadata: any) => {
    console.log('Extracted text:', text);
    // Do something with the extracted text
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
  };

  return (
    <PDFUploader
      onTextExtracted={handleTextExtracted}
      onError={handleError}
    />
  );
}
```

## 🔧 Configuration

### Backend Configuration

The backend can be configured via command-line flags:

```bash
# Custom port
go run *.go -server -port 3001

# Custom upload directory
go run *.go -server -upload-dir ./temp

# Both
go run *.go -server -port 3001 -upload-dir ./temp
```

### Frontend Configuration

Edit `.env.local` to change the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

For production, update this to your production API URL.

## 🔒 Security Features

- ✅ File type validation (only PDFs allowed)
- ✅ File size limit (100MB max)
- ✅ Empty file detection
- ✅ Automatic file cleanup after processing
- ✅ CORS enabled for cross-origin requests
- ✅ Comprehensive error handling

## 📝 Example: Integrating into Dashboard

Here's how to add PDF upload to your dashboard:

```typescript
// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import PDFUploader from "@/app/components/PDFUploader";

export default function Dashboard() {
  const [extractedText, setExtractedText] = useState("");

  const handleTextExtracted = (text: string, metadata: any) => {
    // Save extracted text
    setExtractedText(text);
    
    // You can also save to localStorage or send to your backend
    localStorage.setItem('lastPDFText', text);
    
    // Create a quiz from the text
    // createQuizFromText(text);
  };

  return (
    <div>
      <h1>Create Quiz from PDF</h1>
      <PDFUploader onTextExtracted={handleTextExtracted} />
      
      {extractedText && (
        <div>
          <h2>Preview</h2>
          <p>{extractedText.substring(0, 200)}...</p>
          <button onClick={() => createQuiz(extractedText)}>
            Generate Quiz
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:8080/api/health

# Upload a PDF
curl -X POST http://localhost:8080/api/pdf/upload \
  -F "file=@test.pdf" \
  | jq .

# Get PDF info only
curl -X POST http://localhost:8080/api/pdf/info \
  -F "file=@test.pdf" \
  | jq .
```

### Test with the Browser

1. Navigate to `http://localhost:3000/pdf-test`
2. Click "Choose File" and select a PDF
3. Click "Upload and Extract Text"
4. View the extracted text

## 🐛 Troubleshooting

### Backend not starting
- Make sure no other process is using port 8080
- Check if Go is installed: `go version`
- Install dependencies: `go mod tidy`

### CORS errors
- Make sure the backend server is running
- Check the API URL in `.env.local`
- Verify CORS headers are set correctly in `api_server.go`

### File upload fails
- Check file size (must be < 100MB)
- Verify file is a valid PDF
- Check backend logs for error messages

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:8080/api/health`
- Check `.env.local` has correct API URL
- Restart the Next.js dev server after changing `.env.local`

## 📦 Dependencies

### Backend
- `github.com/ledongthuc/pdf` - PDF parsing
- `github.com/google/uuid` - Unique file naming

### Frontend
- Next.js (already installed)
- React (already installed)

## 🚢 Production Deployment

### Backend
```bash
# Build the binary
cd be
go build -o pdf-api

# Run the binary
./pdf-api -server -port 8080
```

### Frontend
Update `.env.local` with your production API URL:
```env
NEXT_PUBLIC_API_URL=https://api.yourquizlit.com
```

## 📚 Additional Resources

- [API Documentation](./be/API_DOCUMENTATION.md) - Detailed API reference
- [Backend README](./be/README.md) - Backend setup guide

## 🤝 Integration with Quiz Generation

Once you have the extracted text, you can use it to:

1. **Generate quiz questions automatically** using AI/LLM
2. **Store the text** in a database for future reference
3. **Create flashcards** from key concepts
4. **Build study materials** from the document content

Example flow:
```
PDF Upload → Extract Text → Generate Questions → Create Quiz → Save to Database
```

## 📞 Support

If you encounter any issues:
1. Check the backend logs in the terminal
2. Check the browser console for frontend errors
3. Refer to the API documentation
4. Test endpoints with cURL to isolate the issue
