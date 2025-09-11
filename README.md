# Quiz Generator

A modern quiz application built with Next.js frontend and Go backend.

## Features

- Interactive quiz generation and management
- Real-time quiz taking experience
- User authentication and progress tracking
- Responsive design for all devices

## Tech Stack

### Frontend
- **Next.js** - React framework for production
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Go (Golang)** - High-performance backend server
- **Gin** - Web framework for Go
- **PostgreSQL** - Database for storing quizzes and user data
- **JWT** - Authentication and authorization

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Go (v1.19 or higher)
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pbkk-quizlit.git
cd pbkk-quizlit
```

2. Setup Backend
```bash
cd backend
go mod download
go run main.go
```

3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/submit` - Submit quiz answers

## Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.