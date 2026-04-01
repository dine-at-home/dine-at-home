# Dine-at-Home Frontend

## Stack
- **Framework:** Next.js 16.1.4 (App Router)
- **UI:** React 18.3, TypeScript, TailwindCSS, shadcn/ui (Radix UI), React Hook Form 7.55
- **State:** React Context (AuthContext), local component state
- **API:** Custom fetch wrapper (`src/lib/api-client.ts`)
- **Auth:** JWT in localStorage, Authorization header injection
- **Styling:** Tailwind + Radix UI primitives + custom components
- **Other:** Prisma client (schema generation only — no DB access from frontend), Sharp (images)

## Key Directories
```
src/
├── app/                   ← Next.js App Router pages
│   ├── layout.tsx          ← Root layout
│   ├── page.tsx            ← Home page
│   ├── auth/               ← Login, register, verify, reset
│   ├── dinners/            ← Browse + detail pages
│   ├── booking/            ← Booking flow + confirmation
│   ├── host/               ← Host dashboard + onboarding
│   ├── profile/            ← User profile + settings
│   ├── search/             ← Search results
│   └── [legal, help, etc]
├── components/
│   ├── ui/                 ← 40+ shadcn/Radix UI components
│   ├── home/               ← Landing page sections
│   ├── auth/               ← Auth guards + protected route
│   ├── booking/            ← booking.tsx (500+ lines, main booking flow)
│   ├── dinner/             ← dinner-detail.tsx, dinner-card.tsx
│   ├── search/             ← search-widget, results
│   ├── payout/             ← payout-section.tsx, payment-details-section.tsx
│   ├── host/               ← host-onboarding-client.tsx
│   ├── layout/             ← main-layout, header, footer
│   ├── legal/              ← terms, privacy, liability waiver, cookie policy
│   └── cookie-consent.tsx
├── lib/
│   ├── api-client.ts       ← Core fetch wrapper with auth headers
│   ├── api-config.ts       ← BASE_URL configuration
│   ├── auth-service.ts     ← JWT auth, login/logout, token management
│   ├── auth-utils.ts       ← Auth helpers
│   ├── payment-service.ts  ← 219 lines, Airwallex/Stripe checkout calls
│   ├── payout-service.ts   ← 383 lines, host payout operations
│   ├── booking-service.ts  ← Booking API calls
│   ├── booking-events.ts   ← Booking event helpers
│   ├── access-control.ts   ← Role-based access
│   └── [dinner-utils, filters, countries, mock-data]
├── contexts/
│   └── auth-context.tsx    ← useAuth() hook, current user state
├── hooks/
│   └── use-google-places.ts
└── types/
    └── index.ts            ← TypeScript interfaces (User, Dinner, Booking, etc.)
```

## API Layer

**Base URL:** `src/lib/api-config.ts`
```typescript
getBaseUrl() // process.env.BASE_URL || 'http://localhost:3001/api'
getApiUrl(endpoint) // BASE_URL + endpoint
getBackendUrl(endpoint) // For server-side only
```

**API Client:** `src/lib/api-client.ts`
- Wraps all HTTP calls
- Auto-attaches `Authorization: Bearer <token>` from localStorage
- Returns `ApiResponse<T>` typed responses
- Methods: `get`, `post`, `put`, `patch`, `delete`

**Payment Service:** `src/lib/payment-service.ts`
- Currently calls Airwallex-era endpoints that may no longer exist
- `createCheckoutSessionForBooking()` → `POST /api/stripe/checkout/create-session`
- `getPaymentStatus(bookingId)` → `GET /api/payments/:bookingId`
- `refundPayment(bookingId, reason)` → `POST /api/payments/:bookingId/refund`
- `cancelPayment(bookingId)` → `POST /api/payments/:bookingId/cancel`
- **⚠️ Needs update** when new payment integration is built

## Payment UI Rules
- Payment forms **must never** calculate or contain final amounts
- All amounts come from the backend — frontend only displays values
- Pass booking IDs and tokens to backend — never raw amounts
- Wait for backend payment confirmation before showing success
- Handle payment errors gracefully: clear messages, don't leave bookings in limbo
- Never store payment method details in localStorage or state

## Auth Flow
1. Register/Login → JWT token → stored in localStorage
2. `auth-service.ts` manages token storage and expiry
3. `AuthContext` provides `useAuth()` — current user, loading state, login/logout
4. Protected routes wrapped in auth guard component
5. Google OAuth via backend redirect flow

## Payout UI
- `components/payout/payout-section.tsx` — withdrawal interface, balance, payout history
- `components/payout/payment-details-section.tsx` — individual payment list, 72h countdown, commission breakdown
- Calls `payout-service.ts` which hits `/api/payouts/host/:hostId/*` endpoints

## Host Onboarding
- `components/host/host-onboarding-client.tsx` — multi-step host setup including Stripe Connect
- Stripe Connect: redirects to Stripe onboarding URL from `/api/stripe/connect/create-account`
- Return URL: `/host/onboarding?step=6&success=true`

## Environment Variables
```
BASE_URL                    Backend API base URL (e.g. https://api.dineathome.com/api)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  For Google Places autocomplete
```
Note: `BASE_URL` (not `NEXT_PUBLIC_`) — only accessible server-side in Next.js. Client-side API calls use a server route or the public env var.

## Commands
```bash
npm run dev          # next dev (port 3000)
npm run build        # prisma generate + next build
npm run start:prod   # next start (production)
npm run lint         # next lint
npm run db:generate  # prisma generate (schema sync only)
npm run format       # prettier
```

## Next.js Rules (App Router)
- Server components by default — `"use client"` only when needed (event handlers, hooks, localStorage)
- Never import server-only code in client components
- Auth token is in localStorage → any auth check must be client-side or via server cookies
- Images: configured remote patterns for DigitalOcean Spaces + Google avatars + Unsplash

## State Management
- Auth: `AuthContext` + `useAuth()` hook
- UI state: local `useState` in components
- No global state library (Zustand/Redux not used)
- Server state: direct API calls via service layer (no TanStack Query)
