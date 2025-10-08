# Quizlit Backend API

A Go-based backend server for the Quizlit application with PDF text extraction and user authentication capabilities.

## 🚀 Features

### PDF Processing
- ✅ Extract text from PDF files via REST API
- ✅ Get PDF metadata (file size, page count, etc.)
- ✅ File upload with validation (up to 100MB)
- ✅ Automatic cleanup after processing

### User Authentication
- ✅ User registration with secure password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ Protected API endpoints
- ✅ Supabase PostgreSQL integration

### CLI Tools
- ✅ Command-line PDF text extraction
- ✅ Multiple server modes
- ✅ Cross-platform compatibility

## 📋 Prerequisites

- Go 1.19 or higher
- PostgreSQL database (Supabase recommended)
- Git

## 🔧 Installation & Setup

1. Navigate to the backend directory:

   ```bash
   cd be
   ```

2. Install dependencies:

   ```bash
   go mod tidy
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

## 🎯 Server Modes

This application can run in three different modes:

### 1. Authentication Server

Start the authentication API server:

```bash
go run *.go -auth
```

Endpoints available at `http://localhost:8080`:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/health` - Health check

📚 **Full documentation:** [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)

### 2. PDF Server

Start the PDF processing API server:

```bash
go run *.go -server
```

Endpoints available at `http://localhost:8080`:
- `POST /api/pdf/upload` - Upload and extract text from PDF
- `POST /api/pdf/info` - Get PDF metadata
- `GET /health` - Health check

### 3. CLI Mode (PDF Extraction)

Extract text from PDF files directly:

```bash
# Extract text
go run *.go -file "path/to/document.pdf"

# Show PDF info only
go run *.go -file "path/to/document.pdf" -info

# Show help
go run *.go -help
```

## 📝 Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-auth` | Run as authentication server | - |
| `-server` | Run as PDF processing server | - |
| `-port` | Server port | `8080` |
| `-file` | Path to PDF file (CLI mode) | - |
| `-info` | Show PDF info only (CLI mode) | `false` |
| `-upload-dir` | Upload directory for PDF server | `./uploads` |
| `-help` | Show help message | - |

## 🏗️ Project Structure

```text
be/
├── main.go                   # Application entry point
├── config.go                 # Configuration and database
├── models.go                 # Data models
├── errors.go                 # Error definitions
│
├── auth.go                   # JWT authentication & middleware
├── auth_server.go            # Auth HTTP server
├── auth_handlers.go          # Auth endpoint handlers
│
├── pdf_parser.go             # PDF text extraction
├── api_server.go             # PDF API server
├── utils.go                  # File validation utilities
│
├── docs/                     # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── AUTH_API_DOCUMENTATION.md
│   └── AUTH_SETUP.md
│
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── go.mod                    # Go module file
└── README.md                 # This file
```

## 📚 Documentation

- **[Authentication Setup Guide](docs/AUTH_SETUP.md)** - Complete auth setup with Supabase
- **[Auth API Documentation](docs/AUTH_API_DOCUMENTATION.md)** - Authentication endpoints reference
- **[PDF API Documentation](docs/API_DOCUMENTATION.md)** - PDF processing endpoints reference

## 🔒 Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens with 24-hour expiry
- CORS enabled for frontend integration
- Environment-based configuration
- SQL injection protection via prepared statements

## 🚀 Production Deployment

1. Build the binary:

   ```bash
   go build -o quizlit-backend
   ```

2. Run in production:

   ```bash
   # Authentication server
   ./quizlit-backend -auth -port 8080

   # PDF server
   ./quizlit-backend -server -port 8081
   ```

3. Use a process manager (systemd, PM2, etc.)
4. Set up reverse proxy (nginx, Caddy) with HTTPS
5. Configure proper CORS for your domain

## 🧪 Testing

```bash
# Test auth server
go run *.go -auth

# Test PDF server
go run *.go -server

# Test CLI
go run *.go -file "test.pdf"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Quizlit application.

## 🆘 Support

For setup help and troubleshooting, see the documentation in the `docs/` folder.
