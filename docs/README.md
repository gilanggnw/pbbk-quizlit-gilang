# Documentation Index

Welcome to the Quizlit documentation! This directory contains comprehensive guides and references for working with the project.

## Quick Navigation

### Getting Started

1. **[Quickstart Guide](QUICKSTART.md)** - Get up and running in minutes
   - Initial setup steps
   - Running the servers
   - First-time configuration

2. **[Setup Summary](SETUP_SUMMARY.md)** - Overview of the complete setup
   - Environment configuration
   - Dependencies installation
   - Verification steps

3. **[Integration Guide](INTEGRATION_GUIDE.md)** - Frontend-Backend integration
   - API endpoints
   - Authentication flow
   - PDF processing integration

### Authentication Documentation

4. **[Supabase Auth Migration](SUPABASE_AUTH_MIGRATION.md)** - Migration from custom auth
   - What changed
   - Before and after comparison
   - Configuration updates

### Backend Documentation

Located in `../be/docs/`:

5. **[Backend README](../be/README.md)** - Backend overview and quick start

6. **[Backend Tidyup Summary](BE_TIDYUP_SUMMARY.md)** - Backend organization history

7. **[Supabase Auth Guide](../be/docs/SUPABASE_AUTH_GUIDE.md)** - Complete Supabase Auth integration
   - Architecture overview
   - Backend implementation
   - Frontend implementation
   - Testing instructions

8. **[Auth Setup (Deprecated)](../be/docs/AUTH_SETUP.md)** - Old custom authentication setup
   - Historical reference only
   - Replaced by Supabase Auth

9. **[Auth API Documentation (Deprecated)](../be/docs/AUTH_API_DOCUMENTATION.md)** - Old custom auth endpoints
   - Historical reference only
   - Replaced by Supabase Auth

10. **[PDF API Documentation](../be/docs/API_DOCUMENTATION.md)** - PDF processing endpoints
    - Upload endpoint
    - Metadata endpoint
    - CLI usage

11. **[Project Structure](../be/docs/PROJECT_STRUCTURE.md)** - Backend architecture
    - Directory layout
    - File descriptions
    - Module dependencies

### Historical References

12. **[Old README](OLD_README.md)** - Previous root README (before Supabase migration)
    - Archived for reference

## Documentation Structure

```
docs/
├── README.md                       # This file - documentation index
├── QUICKSTART.md                   # Quick start guide
├── SETUP_SUMMARY.md                # Setup overview
├── INTEGRATION_GUIDE.md            # Frontend-Backend integration
├── SUPABASE_AUTH_MIGRATION.md      # Auth migration guide
├── BE_TIDYUP_SUMMARY.md            # Backend organization history
└── OLD_README.md                   # Archived old README

be/docs/
├── SUPABASE_AUTH_GUIDE.md          # Complete Supabase Auth guide
├── API_DOCUMENTATION.md            # PDF API documentation
├── PROJECT_STRUCTURE.md            # Backend architecture
├── AUTH_SETUP.md                   # Deprecated custom auth setup
└── AUTH_API_DOCUMENTATION.md       # Deprecated custom auth API
```

## Common Tasks

### Starting the Servers

**Authentication Server:**
```bash
cd be
go run *.go -auth
```

**PDF Processing Server:**
```bash
cd be
go run *.go -server
```

**Frontend:**
```bash
cd fe
npm run dev
```

### Configuration

See [Setup Summary](SETUP_SUMMARY.md) for detailed configuration instructions.

### Authentication

See [Supabase Auth Guide](../be/docs/SUPABASE_AUTH_GUIDE.md) for complete authentication documentation.

### PDF Processing

See [PDF API Documentation](../be/docs/API_DOCUMENTATION.md) for PDF endpoint details.

## Need Help?

1. **Getting Started**: Start with [Quickstart Guide](QUICKSTART.md)
2. **Authentication Issues**: Check [Supabase Auth Guide](../be/docs/SUPABASE_AUTH_GUIDE.md)
3. **Backend Setup**: Review [Backend README](../be/README.md)
4. **API Integration**: See [Integration Guide](INTEGRATION_GUIDE.md)
5. **Project Structure**: Read [Project Structure](../be/docs/PROJECT_STRUCTURE.md)

## Contributing to Documentation

When adding new documentation:
1. Place general docs in `docs/`
2. Place backend-specific docs in `be/docs/`
3. Update this index file
4. Update the main README.md with links
5. Use clear, descriptive filenames

---

**Last Updated**: After Supabase Auth Migration
