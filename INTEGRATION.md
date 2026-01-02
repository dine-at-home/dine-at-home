# Backend Integration Guide

This document explains how the frontend integrates with the backend API.

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# Backend API Base URL
# NEXT_PUBLIC_BASE_URL is used for client-side API calls (exposed to browser)
# BASE_URL is used for server-side API calls (Next.js API routes)
NEXT_PUBLIC_BASE_URL=http://localhost:3001/api
BASE_URL=http://localhost:3001/api
```

**Note:** If not set, the frontend will automatically use `http://localhost:3001/api` as the default. The `BASE_URL` variable is used for all API calls.

### 2. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Start Frontend

```bash
cd dine-at-home
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## Authentication Flow

### Registration (Email/Password)

1. User submits registration form
2. Frontend calls backend `/api/auth/register`
3. Backend creates user and sends OTP email
4. User verifies OTP
5. Backend returns JWT token
6. Frontend stores token in localStorage

### Login

1. User submits login form
2. Frontend calls backend `/api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token
5. Frontend stores token in localStorage

### Current User

1. Frontend calls backend `/api/auth/current-user` with JWT token
2. Backend validates token and returns user data
3. Frontend updates auth context

## API Routes

All frontend API routes in `/app/api/auth/*` proxy to the backend:

- `POST /api/auth/register` → `POST http://localhost:3001/api/auth/register`
- `POST /api/auth/login` → `POST http://localhost:3001/api/auth/login`
- `POST /api/auth/verify-otp` → `POST http://localhost:3001/api/auth/verify-otp`
- `GET /api/auth/current-user` → `GET http://localhost:3001/api/auth/current-user`
- `POST /api/auth/update-role` → `POST http://localhost:3001/api/auth/update-role`

## Authentication

The frontend uses JWT tokens stored in localStorage. The token is automatically included in API requests via the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

All API errors are handled consistently:
- Network errors show user-friendly messages
- Authentication errors redirect to sign-in
- Validation errors display inline
