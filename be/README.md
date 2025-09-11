# Backend API - Golang

## Overview
This is a backend API service built with Go (Golang).

## Prerequisites
- Go 1.19 or higher
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
| GET    | `/api/v1/` | API root |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |

## Project Structure
```
be/
├── cmd/
├── internal/
├── pkg/
├── main.go
└── go.mod
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request