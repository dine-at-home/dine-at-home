# Environment Setup

## Frontend Environment Variables

Create a `.env.local` file in the `dine-at-home` directory:

```env
# Backend API URL
BACKEND_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## Backend Environment Variables

See `../backend/ENV_SETUP.md` for backend environment variables.

## Quick Start

1. **Frontend**: Copy `final-env-template.txt` to `.env.local`
2. **Backend**: Copy `../backend/.env.example` to `../backend/.env` and update with your MongoDB connection string

## Notes

- Frontend uses JWT authentication via backend API
- No database connection needed in frontend
- All data operations go through the backend API
