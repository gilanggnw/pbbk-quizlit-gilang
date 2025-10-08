# Documentation Index

Welcome to the Quizlit Backend documentation! This folder contains all the technical documentation for the backend API.

## 📚 Quick Navigation

### Getting Started

1. **[../README.md](../README.md)** - Start here! Main project overview
2. **[AUTH_SETUP.md](AUTH_SETUP.md)** - Step-by-step authentication setup guide
3. **[CLEANUP.md](CLEANUP.md)** - Clean up build artifacts

### Architecture & Design

4. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete architecture overview
   - Directory structure
   - Module breakdown
   - Application flows
   - Security features
   - Database schema

### API Reference

5. **[AUTH_API_DOCUMENTATION.md](AUTH_API_DOCUMENTATION.md)** - Authentication API
   - Register endpoint
   - Login endpoint
   - Profile endpoint (protected)
   - Error responses
   - Usage examples

6. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - PDF Processing API
   - PDF upload endpoint
   - PDF info endpoint
   - Request/response formats
   - Error handling

## 🎯 Documentation by Use Case

### "I want to set up the project"
→ Start with [../README.md](../README.md), then [AUTH_SETUP.md](AUTH_SETUP.md)

### "I want to understand the codebase"
→ Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

### "I want to integrate with the API"
→ Check [AUTH_API_DOCUMENTATION.md](AUTH_API_DOCUMENTATION.md) and [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### "I want to clean up my workspace"
→ Follow [CLEANUP.md](CLEANUP.md)

## 📋 Document Summaries

### README.md (Main)
- Project overview
- Features list
- Installation steps
- Server modes (Auth, PDF, CLI)
- Command-line options
- Quick examples

### AUTH_SETUP.md
- Prerequisites
- Supabase setup
- Environment configuration
- Testing endpoints
- Troubleshooting
- Production deployment

### PROJECT_STRUCTURE.md
- Architecture overview
- Directory structure
- Module breakdown
- Application flows (startup, auth, PDF)
- Security features
- Database schema
- Dependencies
- Deployment considerations

### AUTH_API_DOCUMENTATION.md
- Complete API reference
- Endpoint specifications
- Request/response examples
- Authentication flow
- JWT token format
- Error codes
- Usage examples (cURL, TypeScript)

### API_DOCUMENTATION.md
- PDF upload endpoint
- PDF info endpoint
- File validation rules
- Response formats
- Error handling
- Integration examples

### CLEANUP.md
- Build artifacts information
- Removal instructions
- Rebuild commands
- Git ignore rules

## 🔗 External Resources

- [Go Documentation](https://golang.org/doc/)
- [Supabase Docs](https://supabase.com/docs)
- [JWT.io](https://jwt.io/) - JWT debugger
- [pgx Documentation](https://github.com/jackc/pgx)

## 🆘 Need Help?

1. Check the relevant documentation above
2. Review error messages carefully
3. Verify environment variables in `.env`
4. Test database connection
5. Check logs in the terminal

## 📝 Documentation Standards

All documentation follows these principles:
- Clear, concise language
- Step-by-step instructions
- Code examples where applicable
- Troubleshooting sections
- Security considerations

---

**Last Updated:** October 2025  
**Project:** Quizlit Backend API  
**Version:** 3.0
