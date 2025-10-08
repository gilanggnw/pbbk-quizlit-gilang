# PDF Parser REST API Documentation

## Base URL
```
http://localhost:8080
```

## Endpoints

### 1. Health Check
Check if the API is running and healthy.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "message": "PDF Parser API is running",
  "time": "2025-10-05T01:30:57+07:00"
}
```

**Status Codes:**
- `200 OK` - API is healthy

---

### 2. Upload and Extract Text from PDF
Upload a PDF file and extract all text content.

**Endpoint:** `POST /api/pdf/upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with a file field named `file`

**Example using cURL:**
```bash
curl -X POST http://localhost:8080/api/pdf/upload \
  -F "file=@document.pdf"
```

**Example using JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('file', pdfFile); // pdfFile is a File object

const response = await fetch('http://localhost:8080/api/pdf/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data);
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF processed successfully",
  "data": {
    "filename": "document.pdf",
    "file_size": "2.3 MB",
    "page_count": 15,
    "text": "Extracted text content from all pages...",
    "word_count": 5420
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid file type. Only PDF files are allowed"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to extract text: ..."
}
```

**Status Codes:**
- `200 OK` - PDF processed successfully
- `400 Bad Request` - Invalid file, missing file, or validation error
- `405 Method Not Allowed` - Wrong HTTP method used
- `500 Internal Server Error` - Server error during processing

---

### 3. Get PDF Information
Upload a PDF file and get metadata without extracting full text.

**Endpoint:** `POST /api/pdf/info`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with a file field named `file`

**Example using cURL:**
```bash
curl -X POST http://localhost:8080/api/pdf/info \
  -F "file=@document.pdf"
```

**Example using JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://localhost:8080/api/pdf/info', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data);
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF info retrieved successfully",
  "data": {
    "filename": "document.pdf",
    "file_size": "2.3 MB",
    "page_count": 15
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid file type. Only PDF files are allowed"
}
```

**Status Codes:**
- `200 OK` - PDF info retrieved successfully
- `400 Bad Request` - Invalid file or validation error
- `405 Method Not Allowed` - Wrong HTTP method used
- `500 Internal Server Error` - Server error during processing

---

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common errors:
- **File not found**: "Failed to get file from request"
- **Invalid file type**: "Invalid file type. Only PDF files are allowed"
- **File too large**: "File validation failed: file too large"
- **Corrupted PDF**: "Failed to extract text: ..."
- **Empty file**: "File validation failed: file is empty"

---

## File Validation

The API validates uploaded files with the following rules:
- **File extension**: Must be `.pdf`
- **File size**: Maximum 100 MB
- **File content**: Must not be empty
- **File format**: Must be a valid PDF file

---

## CORS Policy

The API allows cross-origin requests from any origin (`*`). This enables frontend applications to call the API directly.

**Allowed methods:** GET, POST, PUT, DELETE, OPTIONS
**Allowed headers:** Content-Type, Authorization

---

## Running the Server

### Start the server:
```bash
go run *.go -server
```

### Start with custom port:
```bash
go run *.go -server -port 3001
```

### Start with custom upload directory:
```bash
go run *.go -server -upload-dir ./temp
```

---

## Integration with Frontend

### React/Next.js Example:

```typescript
// Upload PDF and extract text
async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8080/api/pdf/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('Extracted text:', data.data.text);
      console.log('Page count:', data.data.page_count);
      return data.data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}

// Get PDF info only
async function getPDFInfo(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8080/api/pdf/info', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting PDF info:', error);
    throw error;
  }
}
```

---

## Notes

- Files are temporarily saved during processing and automatically deleted after extraction
- The upload directory (`./uploads`) is created automatically if it doesn't exist
- All responses use JSON format
- The server uses standard HTTP status codes for different scenarios
