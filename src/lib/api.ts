/**
 * API Layer - Base configuration and HTTP utilities
 * Handles authentication, error handling, and JSON serialization
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Retrieve JWT token from localStorage
 * @returns JWT token or null if not found
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('erp_user');
}

/**
 * Construct full URL from relative path
 * @param path - Relative API path (e.g., '/api/v1/inquiries')
 * @returns Full URL
 */
export function buildUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/**
 * Check if endpoint is public (doesn't require authentication)
 * @param path - API path
 * @returns true if public endpoint
 */
function isPublicEndpoint(path: string): boolean {
  const publicPaths = ['/health', '/api/v1/auth/login', '/api/v1/auth/register'];
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

/**
 * Execute fetch request with JWT authentication, error handling, and JSON parsing
 * @param path - API path
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws Error on non-2xx responses
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  // Get auth token
  const token = getAuthToken();

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header for protected endpoints
  if (token && !isPublicEndpoint(path)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Execute fetch
  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle 401 Unauthorized - session expired
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  // Handle 403 Forbidden - insufficient permissions
  if (response.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }

  // Handle other non-2xx responses
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  // Parse and return JSON
  return response.json();
}
