# Vercel Deployment Guide

This guide will help you deploy the DineWithUs frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Backend API**: Your backend API should be deployed and accessible
3. **GitHub Account**: (Optional, but recommended for CI/CD)

## Step 1: Prepare Your Project

1. Make sure your code is committed to Git
2. Ensure all environment variables are documented
3. Test your build locally:
   ```bash
   npm run build
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dine-at-home` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd dine-at-home
vercel

# Deploy to production
vercel --prod
```

## Step 3: Set Environment Variables

In your Vercel project settings, add these environment variables:

### Required Variables

```env
BACKEND_API_URL="https://your-backend-api.com/api"
NEXT_PUBLIC_API_URL="https://your-backend-api.com/api"
```

### Optional Variables

These have defaults and are only needed if you want to override:

- `BACKEND_API_URL` - Backend API base URL
- `NEXT_PUBLIC_API_URL` - Public backend API URL for client-side requests

## Step 4: Verify Deployment

1. Visit your deployed URL
2. Test authentication flow
3. Verify API calls are working
4. Check browser console for errors

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Connection Errors**
   - Verify `BACKEND_API_URL` is set correctly
   - Check CORS settings on backend
   - Ensure backend is accessible from Vercel

3. **Environment Variables Not Loading**
   - Restart deployment after adding variables
   - Check variable names match exactly
   - Verify variables are set for production environment

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Backend API is deployed and accessible
- [ ] CORS configured on backend for your Vercel domain
- [ ] Build completes successfully
- [ ] Authentication flow works
- [ ] API calls are successful
- [ ] Error handling works correctly

## Next Steps

After deployment:
1. Set up custom domain (optional)
2. Configure analytics
3. Set up monitoring
4. Configure CI/CD for automatic deployments
