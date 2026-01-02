# Frontend Environment Variables Setup

Create a `.env.local` file in the `dine-at-home` directory with the following variables:

## Required Environment Variables

```env
# Backend API Base URL
# NEXT_PUBLIC_BASE_URL is used for client-side API calls (exposed to browser)
# BASE_URL is used for server-side API calls (Next.js API routes)
NEXT_PUBLIC_BASE_URL="http://localhost:3001/api"
BASE_URL="http://localhost:3001/api"
```

**Note:** In Next.js, environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Use `NEXT_PUBLIC_BASE_URL` for client-side calls and `BASE_URL` for server-side calls.

## Optional Environment Variables

These have defaults and are only needed if you want to override them:

- `NEXT_PUBLIC_BASE_URL` - Public backend API URL for client-side requests (defaults to `http://localhost:3001/api`)
- `BASE_URL` - Backend API base URL for server-side requests (defaults to `http://localhost:3001/api`)

### Legacy Support

The following variables are still supported for backward compatibility but will fallback to `BASE_URL`:
- `BACKEND_API_URL` - Legacy server-side API URL
- `NEXT_PUBLIC_API_URL` - Legacy client-side API URL

## Setup Steps

1. Copy the template:
   ```bash
   cp final-env-template.txt .env.local
   ```

2. Update the values if needed (defaults work for local development)

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Production

For production, set these environment variables in your hosting platform (Vercel, etc.):

- `NEXT_PUBLIC_BASE_URL` - Your production backend URL (must be public, exposed to browser)
- `BASE_URL` - Your production backend URL (for server-side API routes)

## Notes

- The frontend uses JWT-based authentication with the backend
- No database connection is needed in the frontend
- All authentication is handled by the backend API
