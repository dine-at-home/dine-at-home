/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 *
 * Environment variable used:
 * - BASE_URL: API URL (used for both server-side and client-side calls)
 *
 * Note: In Next.js, client-side code cannot access BASE_URL directly.
 * For client-side calls, the URL is obtained from the server or uses a default.
 */

// Get base URL - uses BASE_URL
const getBaseUrl = (): string => {
  // Server-side: BASE_URL is available from process.env
  if (typeof window === 'undefined') {
    return process.env.BASE_URL || 'http://localhost:3001/api'
  }

  // Client-side: BASE_URL is injected from server via window.__BASE_URL__
  return typeof window !== 'undefined' && (window as any).__BASE_URL__
    ? (window as any).__BASE_URL__
    : 'http://localhost:3001/api'
}

export const API_CONFIG = {
  get BASE_URL() {
    return getBaseUrl()
  },
  TIMEOUT: 30000, // 30 seconds
} as const

// Helper function to get full API URL (works for both client and server)
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${path}`
}

// Helper function to get backend API URL (for server-side - always uses BASE_URL)
export const getBackendUrl = (endpoint: string): string => {
  const baseUrl = (process.env.BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '') // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${path}`
}
