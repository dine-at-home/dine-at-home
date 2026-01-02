/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 * 
 * Uses BASE_URL from .env.local:
 * - NEXT_PUBLIC_BASE_URL for client-side calls (exposed to browser)
 * - BASE_URL for server-side calls (Next.js API routes)
 * 
 * Falls back to NEXT_PUBLIC_API_URL, BACKEND_API_URL, or default localhost
 */

// Get base URL for client-side (browser) - must be NEXT_PUBLIC_* to be accessible
const getClientBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api'
  );
};

// Get base URL for server-side (Next.js API routes)
const getServerBaseUrl = (): string => {
  return (
    process.env.BASE_URL ||
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api'
  );
};

// Get the appropriate base URL based on context (client or server)
const getBaseUrl = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return getClientBaseUrl();
  }
  // Server-side
  return getServerBaseUrl();
};

export const API_CONFIG = {
  get BASE_URL() {
    return getBaseUrl();
  },
  TIMEOUT: 30000, // 30 seconds
} as const;

// Helper function to get full API URL (works for both client and server)
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Helper function to get backend API URL (for server-side - always uses server base URL)
export const getBackendUrl = (endpoint: string): string => {
  const baseUrl = getServerBaseUrl().replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

