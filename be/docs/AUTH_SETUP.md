# Authentication API Setup Guide

## Prerequisites
- Go 1.19 or higher
- Supabase account
- PostgreSQL database (via Supabase)

---

## 🚀 Quick Setup

### 1. Get Supabase Database URL

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** under **Connection pooling** (URI format)
5. It should look like:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cd be
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
   JWT_SECRET=your-random-secret-key-here
   SERVER_PORT=8080
   ```

3. **Generate a secure JWT secret:**
   ```bash
   # On Linux/Mac
   openssl rand -base64 32
   
   # On Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

### 3. Install Dependencies

```bash
cd be
go mod tidy
```

### 4. Start the Authentication Server

```bash
go run *.go -auth
```

You should see:
```
🚀 Auth API Server starting on http://localhost:8080
✅ Database connection established
✅ Users table ready

📝 Available endpoints:
  POST /api/auth/register  - Register new user
  POST /api/auth/login     - Login user
  GET  /api/auth/profile   - Get user profile (protected)
  GET  /api/auth/health    - Health check
```

---

## 🧪 Test the API

### Using cURL

```bash
# Health check
curl http://localhost:8080/api/auth/health

# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace YOUR_TOKEN with the token from login)
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman or Thunder Client

1. **Register User**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }
     ```

2. **Login**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Save the `token` from the response

3. **Get Profile**
   - Method: GET
   - URL: `http://localhost:8080/api/auth/profile`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

---

## 📁 Project Structure

```
be/
├── main.go              # Entry point with server modes
├── config.go            # Database configuration
├── auth.go              # JWT authentication & middleware
├── auth_server.go       # Authentication HTTP server
├── auth_handlers.go     # Register, login, profile handlers
├── models.go            # User models and request/response structs
├── errors.go            # Error definitions
├── .env                 # Environment variables (DO NOT COMMIT)
├── .env.example         # Example environment file
└── AUTH_API_DOCUMENTATION.md  # API documentation
```

---

## 🔒 Security Notes

1. **Never commit `.env` file** to Git
   - Add `.env` to your `.gitignore`
   
2. **Use strong JWT secrets** in production
   - Generate a random 32+ character string
   
3. **Use HTTPS** in production
   - Never send tokens over HTTP
   
4. **Set proper CORS** in production
   - Change `*` to your frontend domain
   
5. **Rotate JWT secrets** periodically
   - Invalidates all existing tokens

---

## 🗄️ Database Schema

The `users` table is automatically created when you start the server. You can also create it manually in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 🐛 Troubleshooting

### Database connection fails

1. Check your `DATABASE_URL` format
2. Make sure your Supabase project is active
3. Verify your password is correct (no special characters that need escaping)
4. Use the **Connection pooling** URL, not the direct connection URL

### JWT secret error

1. Make sure `JWT_SECRET` is set in `.env`
2. JWT secret should be at least 16 characters

### Port already in use

1. Change the port in `.env`:
   ```env
   SERVER_PORT=3001
   ```

2. Or specify port via command line:
   ```bash
   go run *.go -auth -port 3001
   ```

### CORS errors

1. Check that the frontend is sending requests to the correct URL
2. Verify CORS headers are set in `auth_server.go`

---

## 🎯 Next Steps

1. ✅ Test all endpoints with cURL or Postman
2. ✅ Create API client in your frontend
3. ✅ Implement protected routes
4. ✅ Add refresh token functionality (optional)
5. ✅ Add password reset functionality (optional)
6. ✅ Add email verification (optional)

---

## 📚 Related Documentation

- [API Documentation](./AUTH_API_DOCUMENTATION.md) - Complete API reference
- [Integration Guide](../INTEGRATION_GUIDE.md) - Frontend integration
- [Supabase Docs](https://supabase.com/docs) - Database documentation

---

## 🔥 Production Deployment

For production:

1. Build the binary:
   ```bash
   go build -o auth-api
   ```

2. Set environment variables on your server

3. Run the binary:
   ```bash
   ./auth-api -auth
   ```

4. Use a process manager like **systemd** or **PM2**

5. Set up **HTTPS** with a reverse proxy (nginx, Caddy)

6. Monitor logs and errors

---

## 📞 Support

If you encounter issues:
1. Check the logs in the terminal
2. Verify your `.env` configuration
3. Test database connection separately
4. Check Supabase dashboard for errors
