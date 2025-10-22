# Backend API - Golang

## Overview
This is a backend API service built with Go (Golang) for the QuizLit quiz generation platform.

## Features
- 🤖 AI-powered quiz generation using OpenAI GPT
- 📄 File upload support (PDF, TXT, DOCX)
- 🎯 Multiple difficulty levels (Easy, Medium, Hard)
- 🔄 RESTful API endpoints
- ⚡ Fast and lightweight backend

## Prerequisites
- Go 1.19 or higher
- OpenAI API Key
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd be
```

2. Install dependencies:
```bash
go mod download
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

### Development
```bash
go run main.go
```

### Production
```bash
go build -o app
./app
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/health` | Health check |
| POST   | `/api/v1/quizzes/upload` | Upload file and generate quiz |
| POST   | `/api/v1/quizzes/generate` | Generate quiz from text content |
| GET    | `/api/v1/quizzes` | Get all quizzes |
| GET    | `/api/v1/quizzes/:id` | Get specific quiz |
| PUT    | `/api/v1/quizzes/:id` | Update quiz |
| DELETE | `/api/v1/quizzes/:id` | Delete quiz |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `OPENAI_API_KEY` | OpenAI API key for AI generation | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Project Structure
```
be/
├── cmd/
├── internal/
│   ├── api/          # Server setup and routing
│   ├── config/       # Configuration management
│   ├── handlers/     # HTTP request handlers
│   ├── models/       # Data models
│   └── services/     # Business logic
├── main.go           # Application entry point
├── go.mod           # Go module definition
└── .env.example     # Environment variables template
```

## Usage Examples

### Upload File and Generate Quiz
```bash
curl -X POST http://localhost:8080/api/v1/quizzes/upload \
  -F "file=@your-document.pdf" \
  -F "title=My Quiz" \
  -F "description=A quiz about the uploaded content" \
  -F "difficulty=medium"
```

### Generate Quiz from Text
```bash
curl -X POST http://localhost:8080/api/v1/quizzes/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your text content here...",
    "title": "My Quiz",
    "description": "Quiz description",
    "difficulty": "easy",
    "questionCount": 10
  }'
```

### Get All Quizzes
```bash
curl http://localhost:8080/api/v1/quizzes
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request