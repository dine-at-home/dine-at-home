# DineWithUs - Social Dining Platform

A modern social dining platform built with Next.js 15, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Deployment**: Vercel-ready

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

**Important:** Create a `.env.local` file before running the app:

```bash
# Copy the template
cp final-env-template.txt .env.local

# Or create manually and add required variables:
# BACKEND_API_URL, NEXT_PUBLIC_API_URL
```

See `FRONTEND_ENV_SETUP.md` for detailed setup instructions.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
DineWithUs/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── search/            # Search page
│   ├── dinners/[id]/      # Dinner detail pages
│   └── booking/           # Booking page
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components (buttons, cards, etc.)
│   │   └── ...           # Feature components
│   └── lib/              # Utilities and mock data
└── next.config.js        # Next.js configuration
```

## Deployment

✅ **Your project is ready to deploy on Vercel!**

### Quick Setup
```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod
```

### Prerequisites
- [Vercel](https://vercel.com) account
- Backend API deployed and running

### Environment Variables
```bash
BACKEND_API_URL="https://your-backend-api.com/api"
NEXT_PUBLIC_API_URL="https://your-backend-api.com/api"
```

## Features

- 🔍 Search for dinner experiences
- 📅 Browse available dinners
- 👤 View host profiles
- 🍽️ Detailed dinner information
- 📱 Fully responsive design

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

Private project
