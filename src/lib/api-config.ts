/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 * 
 * Environment variables used:
 * - BASE_URL: Server-side API URL (used for Next.js API routes and SSR)
 * - NEXT_PUBLIC_BASE_URL: Client-side API URL (required for browser access, should match BASE_URL)
 * 
 * Note: In Next.js, client-side code can only access variables prefixed with NEXT_PUBLIC_.
 * Both BASE_URL and NEXT_PUBLIC_BASE_URL should be set to the same value.
 */

// Get base URL for client-side (browser) - must use NEXT_PUBLIC_ prefix
const getClientBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3001/api'
  );
};

// Get base URL for server-side (Next.js API routes and SSR)
// Uses BASE_URL as the primary variable
const getServerBaseUrl = (): string => {
  return (
    process.env.BASE_URL ||
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

