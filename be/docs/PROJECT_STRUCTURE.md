# Quizlit Backend - Project Structure

This document explains the organization and architecture of the Quizlit backend codebase.

## 🏗️ Architecture Overview

The backend is designed as a **multi-mode Go application** that can run in three different modes:

1. **Authentication Server** - Handles user registration, login, and JWT authentication
2. **PDF Server** - Processes PDF uploads and extracts text
3. **CLI Tool** - Command-line PDF text extraction

## 📁 Directory Structure

```text
be/
├── 📄 Core Application Files
│   ├── main.go                   # Entry point, handles mode selection
│   ├── config.go                 # Configuration loader & DB connection
│   ├── models.go                 # Data structures (User, Auth requests/responses)
│   └── errors.go                 # Error constants and definitions
│
├── 🔐 Authentication Module
│   ├── auth.go                   # JWT token generation & validation
│   ├── auth_server.go            # HTTP server setup for auth endpoints
│   └── auth_handlers.go          # Request handlers (register, login, profile)
│
├── 📄 PDF Processing Module
│   ├── pdf_parser.go             # Core PDF text extraction logic
│   ├── api_server.go             # HTTP server for PDF API
│   └── utils.go                  # File validation & helper functions
│
├── 📚 Documentation
│   ├── docs/
│   │   ├── API_DOCUMENTATION.md           # PDF API reference
│   │   ├── AUTH_API_DOCUMENTATION.md      # Authentication API reference
│   │   └── AUTH_SETUP.md                  # Authentication setup guide
│   ├── README.md                           # Main documentation (you are here)
│   ├── CLEANUP.md                          # Build artifacts cleanup guide
│   └── PROJECT_STRUCTURE.md                # This file
│
├── ⚙️ Configuration
│   ├── .env                      # Environment variables (DO NOT COMMIT)
│   ├── .env.example              # Environment template
│   └── .gitignore                # Git ignore rules
│
├── 📦 Go Module Files
│   ├── go.mod                    # Go module definition & dependencies
│   └── go.sum                    # Dependency checksums
│
└── 📁 Runtime Directories
    └── uploads/                  # Temporary PDF upload storage (auto-created)
```

## 🔄 Application Flow

### 1. Startup Flow

```text
main.go
  │
  ├─► Parse flags (-auth, -server, or CLI)
  │
  ├─► Authentication Mode?
  │   ├─► Load config from .env (config.go)
  │   ├─► Initialize database connection (config.go)
  │   ├─► Create users table if not exists (auth_handlers.go)
  │   └─► Start HTTP server (auth_server.go)
  │
  ├─► PDF Server Mode?
  │   ├─► Create uploads directory
  │   └─► Start HTTP server (api_server.go)
  │
  └─► CLI Mode?
      └─► Parse PDF file (pdf_parser.go)
```

### 2. Authentication Flow

```text
Client Request
  │
  ├─► POST /api/auth/register
  │   └─► auth_handlers.go → Register()
  │       ├─► Validate input (models.go)
  │       ├─► Hash password (bcrypt)
  │       ├─► Insert into database
  │       └─► Generate JWT token (auth.go)
  │
  ├─► POST /api/auth/login
  │   └─► auth_handlers.go → Login()
  │       ├─► Find user by email
  │       ├─► Compare password (bcrypt)
  │       └─► Generate JWT token (auth.go)
  │
  └─► GET /api/auth/profile (Protected)
      └─► AuthMiddleware (auth.go)
          ├─► Extract & validate JWT token
          ├─► Verify signature
          └─► auth_handlers.go → GetProfile()
```

### 3. PDF Processing Flow

```text
Client Upload
  │
  └─► POST /api/pdf/upload
      └─► api_server.go → handlePDFUpload()
          ├─► Parse multipart form
          ├─► Validate file (utils.go)
          ├─► Save to uploads/ directory
          ├─► Extract text (pdf_parser.go)
          ├─► Return extracted text
          └─► Delete temporary file
```

## 🗂️ Module Breakdown

### Core Module

**Files:** `main.go`, `config.go`, `models.go`, `errors.go`

**Responsibilities:**
- Application bootstrapping
- Configuration management
- Database connection pooling
- Shared data structures
- Error definitions

**Key Functions:**
- `main()` - Entry point and mode selector
- `LoadConfig()` - Load environment variables
- `InitDatabase()` - Create database connection pool

### Authentication Module

**Files:** `auth.go`, `auth_server.go`, `auth_handlers.go`

**Responsibilities:**
- JWT token generation and validation
- User registration with password hashing
- User login with credential verification
- Protected route middleware
- User profile retrieval

**Key Functions:**
- `GenerateToken()` - Create JWT with 24h expiry
- `ValidateToken()` - Verify JWT signature
- `AuthMiddleware()` - Protect routes
- `Register()` - Create new user
- `Login()` - Authenticate user
- `GetProfile()` - Get authenticated user info

**Database Schema:**
```sql
users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### PDF Processing Module

**Files:** `pdf_parser.go`, `api_server.go`, `utils.go`

**Responsibilities:**
- PDF file validation
- Text extraction from PDFs
- PDF metadata retrieval
- File upload handling
- Temporary file cleanup

**Key Functions:**
- `ExtractTextFromFile()` - Extract text from PDF
- `GetPDFInfo()` - Get PDF metadata
- `handlePDFUpload()` - Process file upload
- `validateFile()` - Validate file size and type

## 🔗 Dependencies

### External Libraries

```go
// PDF Processing
github.com/ledongthuc/pdf         // PDF parsing

// Authentication
github.com/golang-jwt/jwt/v5      // JWT tokens
golang.org/x/crypto/bcrypt        // Password hashing

// Database
github.com/jackc/pgx/v5           // PostgreSQL driver
github.com/jackc/pgx/v5/pgxpool   // Connection pooling

// Utilities
github.com/google/uuid            // UUID generation
github.com/joho/godotenv          // .env file loading
```

### Standard Library

- `net/http` - HTTP server
- `encoding/json` - JSON encoding/decoding
- `mime/multipart` - File upload handling
- `flag` - Command-line flags
- `context` - Request context

## 🔐 Security Features

### Authentication Security

1. **Password Hashing**: bcrypt with cost factor 10
2. **JWT Tokens**: HS256 algorithm, 24-hour expiry
3. **Token Validation**: Signature verification on protected routes
4. **SQL Injection Protection**: Prepared statements via pgx

### PDF Security

1. **File Validation**: Type checking, size limits (100MB)
2. **Temporary Storage**: Files deleted after processing
3. **Unique Filenames**: UUID-based naming to prevent collisions

### CORS

- Enabled for both servers
- Currently allows all origins (`*`) - should be restricted in production

## 🌐 API Endpoints

### Authentication Server (Port 8080)

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/profile` | Protected | Get user profile |
| GET | `/api/auth/health` | Public | Health check |

### PDF Server (Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdf/upload` | Upload PDF and extract text |
| POST | `/api/pdf/info` | Get PDF metadata |
| GET | `/health` | Health check |

## 🗄️ Database

**Type:** PostgreSQL (via Supabase)

**Connection:** pgx with connection pooling

**Tables:**
- `users` - User accounts and credentials

**Schema Management:**
- Auto-created on server startup
- `InitUsersTable()` function in `auth_handlers.go`

## 📝 Configuration

### Environment Variables

Required in `.env` file:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
SERVER_PORT=8080
```

### Command-Line Flags

```bash
-auth           # Run authentication server
-server         # Run PDF server
-port           # Server port (default: 8080)
-upload-dir     # Upload directory (default: ./uploads)
-file           # PDF file path (CLI mode)
-info           # Show PDF info only (CLI mode)
-help           # Show help
```

## 🧪 Testing Strategy

### Manual Testing

1. **Auth Server**: Use cURL or Postman
2. **PDF Server**: Upload test PDFs via API
3. **CLI**: Run with sample PDF files

### Example Tests

```bash
# Test auth registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Test PDF upload
curl -X POST http://localhost:8080/api/pdf/upload \
  -F "file=@test.pdf"
```

## 🚀 Deployment Considerations

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure proper CORS origins
- [ ] Use HTTPS (reverse proxy)
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set file size limits appropriately
- [ ] Enable rate limiting
- [ ] Add monitoring and alerts
- [ ] Use environment-specific configs

### Recommended Architecture

```text
Internet
  │
  ├─► Reverse Proxy (nginx/Caddy) with HTTPS
      │
      ├─► Auth Server (port 8080)
      │   └─► Supabase PostgreSQL
      │
      └─► PDF Server (port 8081)
          └─► File Storage
```

## 📚 Additional Resources

- [Authentication Setup Guide](docs/AUTH_SETUP.md)
- [Auth API Documentation](docs/AUTH_API_DOCUMENTATION.md)
- [PDF API Documentation](docs/API_DOCUMENTATION.md)
- [Main README](README.md)

## 🔄 Version History

- **v1.0** - Initial CLI PDF extractor
- **v2.0** - Added REST API for PDF processing
- **v3.0** - Added authentication system with Supabase

## 👥 Contributing

See the main [README.md](README.md) for contribution guidelines.

## 📞 Support

For issues and questions:
1. Check the documentation in `docs/`
2. Review this structure guide
3. Check environment configuration
4. Verify database connection
