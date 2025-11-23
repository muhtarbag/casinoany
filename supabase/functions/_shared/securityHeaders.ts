/**
 * Phase 3C: Security Headers Middleware
 * 
 * Applies comprehensive security headers to all edge function responses
 * following OWASP best practices and industry standards.
 */

export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking attacks
  'X-Frame-Options': 'SAMEORIGIN',
  
  // Enable XSS filter in older browsers
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Feature Policy / Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // HSTS - Force HTTPS (1 year)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Basic CSP for API responses
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

/**
 * Apply security headers to a Response object
 */
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create a new Response with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit
): Response {
  const response = new Response(body, init);
  return addSecurityHeaders(response);
}

/**
 * CORS headers with security considerations
 */
export const secureCorsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust per environment
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400', // 24 hours
  ...securityHeaders,
};

/**
 * Handle CORS preflight with security headers
 */
export function handleCorsPrelight(): Response {
  return new Response(null, {
    status: 204,
    headers: secureCorsHeaders,
  });
}
