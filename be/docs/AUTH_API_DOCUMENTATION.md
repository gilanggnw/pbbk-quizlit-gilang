# Authentication API Documentation

## Overview
User authentication REST API with JWT tokens, built with Go and Supabase PostgreSQL.

## Base URL
```
http://localhost:8080
```

## Authentication Flow
1. User registers or logs in
2. Server returns JWT token
3. Client includes token in `Authorization` header for protected routes
4. Format: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-08T10:30:00Z",
    "updated_at": "2025-10-08T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body or validation error
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Email is required
- Password is required (minimum 6 characters)
- Name is required

---

### 2. Login User
Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-08T10:30:00Z",
    "updated_at": "2025-10-08T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Invalid email or password
- `500 Internal Server Error` - Server error

---

### 3. Get User Profile (Protected)
Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-08T10:30:00Z",
    "updated_at": "2025-10-08T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing, invalid, or expired token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 4. Health Check
Check if the API is running.

**Endpoint:** `GET /api/auth/health`

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "Auth API is running",
  "time": "2025-10-08T10:30:00+07:00"
}
```

---

## Security Features

### Password Hashing
- Passwords are hashed using **bcrypt** (cost factor: 10)
- Passwords are never stored in plain text
- Passwords are never returned in API responses

### JWT Tokens
- Tokens expire after **24 hours**
- Tokens are signed with HS256 algorithm
- Token payload includes:
  - `user_id` - User's unique ID
  - `email` - User's email
  - `exp` - Expiration timestamp
  - `iat` - Issued at timestamp
  - `iss` - Issuer ("quizlit-api")

### CORS
- Enabled for all origins (`*`)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

---

## Example Usage

### JavaScript/TypeScript (fetch)

```typescript
// Register
const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
  }),
});

const registerData = await registerResponse.json();
const token = registerData.token;

// Login
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const loginData = await loginResponse.json();
const authToken = loginData.token;

// Get Profile (protected)
const profileResponse = await fetch('http://localhost:8080/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
});

const profileData = await profileResponse.json();
console.log(profileData.user);
```

### cURL

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Profile
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Health Check
curl http://localhost:8080/api/auth/health
```

---

## Database Schema

### users table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

The table is automatically created when the server starts.

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Environment Configuration

Required environment variables in `.env`:

```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key
SERVER_PORT=8080
```

---

## Setup Instructions

See [AUTH_SETUP.md](./AUTH_SETUP.md) for complete setup instructions.
