# Supabase Authentication Integration Guide

This guide explains how the Quizlit application uses Supabase Auth for user authentication.

## 🏗️ Architecture Overview

The application uses **Supabase Auth** for user management and authentication:

- **Frontend**: Next.js with Supabase Client SDK handles registration and login
- **Backend**: Go API validates Supabase JWT tokens to protect routes
- **Database**: Supabase PostgreSQL stores user data in `auth.users` table

## 📦 What's Configured

### Backend (`be/`)

1. **JWT Validation** (`auth.go`):
   - Validates JWT tokens issued by Supabase
   - Extracts user ID and email from token claims
   - No custom token generation needed

2. **Protected Endpoints** (`auth_server.go`):
   - `/api/auth/profile` - Returns user info from JWT token
   - `/api/auth/health` - Health check endpoint

3. **Environment Variables** (`.env`):
   ```env
   SUPABASE_URL=https://ooqhdxlltfejeeojfmly.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_JWT_SECRET=your-jwt-secret  # Get from Supabase Dashboard
   SERVER_PORT=8080
   ```

### Frontend (`fe/`)

1. **Supabase Client** (`app/lib/supabaseClient.ts`):
   - Initializes Supabase client with URL and anon key

2. **Auth Functions** (`app/lib/auth.ts`):
   - `signUp()` - Register new user
   - `signIn()` - Login user
   - `signOut()` - Logout user
   - `getCurrentUser()` - Get current user
   - `getAccessToken()` - Get JWT token for API requests

3. **Pages**:
   - `/login` - Login page with Supabase authentication
   - `/register` - Registration page with email confirmation
   - `/dashboard` - Protected dashboard (coming soon)

4. **Environment Variables** (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ooqhdxlltfejeeojfmly.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

## 🔑 Get Your Supabase JWT Secret

**Important**: You need to add your Supabase JWT secret to `be/.env`:

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **JWT Settings**
5. Copy the **JWT Secret**
6. Update `be/.env`:
   ```env
   SUPABASE_JWT_SECRET=your-actual-jwt-secret-here
   ```

## 🚀 How It Works

### 1. User Registration Flow

```
User → Frontend (Register Page)
  ↓
Supabase Client SDK → signUp({email, password})
  ↓
Supabase Auth → Create user in auth.users
  ↓
Send confirmation email
  ↓
User confirms email → Account activated
```

### 2. User Login Flow

```
User → Frontend (Login Page)
  ↓
Supabase Client SDK → signInWithPassword({email, password})
  ↓
Supabase Auth → Validate credentials
  ↓
Return JWT token (access_token)
  ↓
Store in Supabase session
```

### 3. Protected API Request Flow

```
Frontend → Get access_token from Supabase session
  ↓
Make API request with Authorization: Bearer <token>
  ↓
Backend (Go) → Validate JWT token with SUPABASE_JWT_SECRET
  ↓
Extract user ID and email from token
  ↓
Return user data or protected resource
```

## 📝 Code Examples

### Frontend: Login

```typescript
import { signIn } from './lib/auth'

const handleLogin = async () => {
  try {
    const data = await signIn({
      email: 'user@example.com',
      password: 'password123'
    })
    console.log('Logged in:', data.user)
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error.message)
  }
}
```

### Frontend: Get Access Token for API Call

```typescript
import { getAccessToken } from './lib/auth'

const fetchProfile = async () => {
  const token = await getAccessToken()
  
  const response = await fetch('http://localhost:8080/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  console.log('Profile:', data)
}
```

### Backend: Validate Token (Automatic)

The `AuthMiddleware` in `auth.go` automatically:
1. Extracts token from `Authorization` header
2. Validates with `SUPABASE_JWT_SECRET`
3. Adds user info to request context
4. Calls next handler

## 🧪 Testing

### 1. Start Backend Server

```bash
cd be
go run *.go -auth
```

### 2. Start Frontend Server

```bash
cd fe
npm run dev
```

### 3. Test Registration

1. Go to http://localhost:3000/register
2. Enter email, password
3. Click "Create account"
4. Check email for confirmation link
5. Click confirmation link

### 4. Test Login

1. Go to http://localhost:3000/login
2. Enter confirmed email and password
3. Click "Sign in"
4. Should redirect to dashboard

### 5. Test Protected API

```bash
# Get token from browser console after login:
# const session = await supabase.auth.getSession()
# console.log(session.data.session.access_token)

curl http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Security Features

1. **Email Confirmation**: Users must confirm email before login (default)
2. **JWT Tokens**: Tokens expire after 1 hour (configurable in Supabase)
3. **Secure Password Hashing**: Bcrypt hashing handled by Supabase
4. **HTTPS Required**: In production, always use HTTPS
5. **Token Validation**: Backend validates every request

## ⚙️ Supabase Dashboard Settings

### Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### Email Confirmation

By default, Supabase requires email confirmation:
- **Enabled**: Users must confirm email before login
- **Disabled**: Users can login immediately after signup

To disable (development only):
1. Go to **Authentication** → **Settings**
2. Uncheck "Enable email confirmations"

### JWT Expiry

Configure token expiry time:
1. Go to **Settings** → **API**
2. Find **JWT expiry limit**
3. Default: 3600 seconds (1 hour)

## 🐛 Troubleshooting

### "Invalid JWT secret"

- Make sure `SUPABASE_JWT_SECRET` in `be/.env` matches your Supabase project
- Get it from **Settings** → **API** → **JWT Settings**

### "Email not confirmed"

- Check your email for confirmation link
- Or disable email confirmation in Supabase settings (dev only)

### "CORS error"

- Backend has CORS enabled for all origins (`*`)
- In production, change to your frontend domain

### "Invalid token"

- Token might be expired (1 hour default)
- Call `supabase.auth.getSession()` to refresh
- Supabase automatically refreshes tokens

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [JWT.io](https://jwt.io/) - Debug JWT tokens

## 🎯 Next Steps

1. ✅ Configure `SUPABASE_JWT_SECRET` in backend
2. ✅ Test registration and login
3. ✅ Implement protected dashboard page
4. ✅ Add password reset functionality (optional)
5. ✅ Add OAuth providers (Google, GitHub, etc.) (optional)
6. ✅ Set up email templates in Supabase

## 📞 Support

If you encounter issues:
1. Check that both `.env` files are configured
2. Verify Supabase project is active
3. Check browser console for errors
4. Check backend logs for token validation errors
