# dine-at-home — Next.js 16 frontend

## Stack
- Next.js 16.1 App Router, React 18.3, TypeScript
- TailwindCSS, shadcn/ui (Radix), React Hook Form
- Auth: JWT in localStorage, `AuthContext` + `useAuth()`
- API: `src/lib/api-client.ts` (fetch wrapper, auto Bearer header)

## Layout
```
src/
├── app/            App Router pages (auth, dinners, booking, host, profile, search)
├── components/     ui/ (shadcn), home/, booking/, dinner/, payout/, host/, layout/, legal/
├── lib/            api-client, api-config, auth-service, payment-service, payout-service, booking-service
├── contexts/       auth-context.tsx
├── hooks/          use-google-places.ts
└── types/          shared interfaces
```

## Next.js Rules
- Server components by default — `"use client"` only for hooks/events/localStorage
- Never import server-only code in client components
- `BASE_URL` is server-side only; client calls go through API routes or `NEXT_PUBLIC_*`

## Payment UI Rules
- Amounts come from backend, never calculated client-side
- Send `bookingId` and tokens to backend, never raw money values
- Show success only after backend confirmation

## Commands
```
npm run dev          # port 3000
npm run build        # prisma generate + next build
npm run lint
```
