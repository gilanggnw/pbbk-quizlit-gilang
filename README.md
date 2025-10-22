# Quizlit - Smart Quiz Generator

A modern quiz application that allows users to upload PDF files and generate quizzes from the content. Built with Next.js frontend and Go backend, powered by Supabase Auth.

## Features

### PDF Processing
- Upload PDF files (up to 100MB)
- Automatic text extraction
- PDF metadata retrieval
- Fast and efficient processing

### User Authentication
- Secure user registration and login
- Email confirmation
- JWT-based authentication via Supabase Auth
- Protected user profiles
- Password reset (coming soon)

### Quiz Generation (Coming Soon)
- Generate quizzes from PDF content
- Multiple question types
- Real-time quiz taking
- Progress tracking

### Modern UI
- Responsive design for all devices
- Dark mode support
- Clean and intuitive interface
- Built with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Supabase Client** - Authentication SDK

### Backend
- **Go 1.19+** - High-performance backend
- **Supabase Auth** - User authentication
- **PostgreSQL** - Database (via Supabase)
- **JWT** - Token validation
- **PDF Parser** - Text extraction from PDFs

## Quick Start

### Prerequisites
- Node.js v18 or higher
- Go v1.19 or higher

### Quick Start

#### 1. Start the Frontend (Next.js)
```bash
# Navigate to frontend directory
cd fe

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will be available at: **http://localhost:3000**

#### 2. Start the Backend (Go)
```bash
# Navigate to backend directory
cd be

# Run the pre-built executable
.\pbkk-quizlit-backend.exe

# OR build and run from source
go run main.go
```
The backend will be available at: **http://localhost:8080**

### 🚀 Application URLs
- **Main App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Sample Quiz**: http://localhost:3000/quiz/1
- **Backend API**: http://localhost:8080/api/v1/quizzes/
- Supabase Account (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/SingSopan/pbkk-quizlit.git
cd pbkk-quizlit
```

### 2. Setup Backend

```bash
cd be

# Install Go dependencies
go mod tidy

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the authentication server
go run main.go config.go models.go errors.go auth.go auth_handlers.go auth_server.go pdf_parser.go api_server.go utils.go -auth
```

The server will start on `http://localhost:8080`

### 3. Setup Frontend

```bash
cd fe

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Configuration

### Backend Environment Variables (`be/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://...
SERVER_PORT=8080
```

Get these from your Supabase Dashboard:
- **Settings** → **API** for URL and anon key
- **Settings** → **API** → **JWT Settings** for JWT secret

### Frontend Environment Variables (`fe/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Server Modes

The backend supports multiple server modes:

### Authentication Server
```bash
go run *.go -auth
```
Handles user authentication via Supabase Auth

**Endpoints:**
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/health` - Health check

### PDF Processing Server
```bash
go run *.go -server
```
Handles PDF upload and text extraction

**Endpoints:**
- `POST /api/pdf/upload` - Upload and extract text
- `POST /api/pdf/info` - Get PDF metadata
- `GET /health` - Health check

### CLI Mode
```bash
go run *.go -file "document.pdf"
```
Extract text from PDF files directly

## Documentation

### Getting Started
- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running quickly
- [Setup Summary](docs/SETUP_SUMMARY.md) - Overview of the setup
- [Integration Guide](docs/INTEGRATION_GUIDE.md) - Frontend-Backend integration

### Backend Documentation
- [Backend README](be/README.md) - Backend overview
- [Project Structure](be/docs/PROJECT_STRUCTURE.md) - Architecture details
- [PDF API Documentation](be/docs/API_DOCUMENTATION.md) - PDF endpoints
- [Auth API Documentation](be/docs/AUTH_API_DOCUMENTATION.md) - Auth endpoints (deprecated)

### Authentication
- [Supabase Auth Guide](be/docs/SUPABASE_AUTH_GUIDE.md) - Complete auth integration guide
- [Supabase Migration](docs/SUPABASE_AUTH_MIGRATION.md) - Migration from custom auth
- [Auth Setup](be/docs/AUTH_SETUP.md) - Old custom auth setup (deprecated)

## Project Structure

```
pbkk-quizlit/
├── be/                          # Go Backend
│   ├── docs/                    # Backend documentation
│   ├── main.go                  # Entry point
│   ├── config.go                # Configuration
│   ├── auth.go                  # JWT validation
│   ├── auth_server.go           # Auth HTTP server
│   ├── auth_handlers.go         # Auth endpoints
│   ├── pdf_parser.go            # PDF processing
│   ├── api_server.go            # PDF API server
│   ├── models.go                # Data models
│   ├── errors.go                # Error definitions
│   ├── utils.go                 # Helper functions
│   ├── .env                     # Backend config
│   └── README.md                # Backend docs
│
├── fe/                          # Next.js Frontend
│   ├── app/                     # App Router
│   │   ├── lib/                 # Utilities
│   │   │   ├── supabaseClient.ts   # Supabase client
│   │   │   ├── auth.ts             # Auth functions
│   │   │   └── pdfApi.ts           # PDF API client
│   │   ├── components/          # React components
│   │   ├── login/               # Login page
│   │   ├── register/            # Register page
│   │   ├── dashboard/           # Dashboard (protected)
│   │   └── layout.tsx           # Root layout
│   ├── .env.local               # Frontend config
│   └── package.json             # Dependencies
│
├── docs/                        # Project documentation
│   ├── QUICKSTART.md
│   ├── SETUP_SUMMARY.md
│   ├── INTEGRATION_GUIDE.md
│   └── SUPABASE_AUTH_MIGRATION.md
│
└── README.md                    # This file
```

## Security Features

- Secure password hashing (handled by Supabase)
- JWT token authentication
- Email verification required
- HTTPS support (in production)
- CORS configured
- SQL injection protection
- Environment-based configuration

## Testing

### Test Backend

```bash
cd be

# Test auth server
go run *.go -auth

# Test PDF server
go run *.go -server

# Test CLI
go run *.go -file "test.pdf"
```

### Test Frontend

```bash
cd fe
npm run dev
```

Visit:
- http://localhost:3000 - Home page
- http://localhost:3000/register - Create account
- http://localhost:3000/login - Sign in
- http://localhost:3000/dashboard - Protected page

## Deployment

### Backend

```bash
# Build
cd be
go build -o quizlit-backend

# Run
./quizlit-backend -auth
```

### Frontend

```bash
# Build
cd fe
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## License

This project is part of a university course (PBKK - Pemrograman Berbasis Kerangka Kerja).