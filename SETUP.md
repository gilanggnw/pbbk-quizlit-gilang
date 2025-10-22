# QuizLit AI Setup Instructions

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd be
   ```

2. **Install Go dependencies:**
   ```bash
   go mod download
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Add your OpenAI API key to `.env`:**
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```
   You can get an API key from: https://platform.openai.com/api-keys

5. **Run the backend server:**
   ```bash
   go run main.go
   ```
   The server will start on http://localhost:8080

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The frontend will start on http://localhost:3000

## Testing the AI Integration

1. **Make sure both backend and frontend are running**

2. **Open http://localhost:3000 in your browser**

3. **Create a new quiz:**
   - Go to the "Create" page
   - Upload a PDF or TXT file OR create manually
   - Fill in quiz details (title, description, difficulty)
   - Click "Generate Quiz"

4. **The AI will:**
   - Process your uploaded file (extract text from PDF/TXT)
   - Send the content to OpenAI GPT-3.5
   - Generate multiple choice questions
   - Return a complete quiz with explanations

## API Endpoints

- `POST /api/v1/quizzes/upload` - Upload file and generate quiz
- `POST /api/v1/quizzes/generate` - Generate quiz from text
- `GET /api/v1/quizzes` - Get all quizzes
- `GET /api/v1/quizzes/:id` - Get specific quiz
- `PUT /api/v1/quizzes/:id` - Update quiz
- `DELETE /api/v1/quizzes/:id` - Delete quiz

## Features Implemented

✅ File upload processing (PDF, TXT)
✅ OpenAI GPT integration for quiz generation
✅ RESTful API with proper error handling
✅ CORS configuration for frontend
✅ Multiple difficulty levels
✅ Automatic question generation with explanations
✅ Fallback mechanisms if AI fails

## Notes

- The backend uses in-memory storage for simplicity (quizzes will be lost on restart)
- For production, you'd want to add a database
- The frontend has some TypeScript configuration issues that don't affect functionality
- File upload supports PDF and TXT files (DOCX support can be added)

## Troubleshooting

1. **"Cannot find module 'react'" errors**: These are TypeScript configuration issues and don't affect the runtime functionality

2. **OpenAI API errors**: Make sure your API key is valid and has credits

3. **CORS errors**: The backend is configured to allow requests from localhost:3000

4. **File processing errors**: Make sure uploaded files are valid PDF or TXT files