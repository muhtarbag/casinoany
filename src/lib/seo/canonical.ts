/**
 * Canonical URL Engine
 * Eliminates duplicate content risk with intelligent URL normalization
 */

/**
 * Build canonical URL from current path
 * - Removes tracking parameters (UTM, fbclid, gclid)
 * - Normalizes trailing slashes
 * - Handles pagination and filters
 */
export function buildCanonical(path: string, options?: {
  removeParams?: boolean;
  baseUrl?: string;
}): string {
  // Always use https://casinoany.com as the primary canonical domain
  const baseUrl = options?.baseUrl || 'https://casinoany.com';
  
  // Remove query parameters if specified (default: true)
  const removeParams = options?.removeParams !== false;
  
  let cleanPath = path;
  
  if (removeParams) {
    // Remove all query parameters
    cleanPath = path.split('?')[0];
  }
  
  // Remove trailing slash (except for root)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Always return absolute URL with https protocol
  return `${baseUrl}${cleanPath}`;
}

/**
 * Check if current page should be noindexed
 * Returns true for:
 * - Paginated pages (page > 1)
 * - Filtered pages (with query params)
 * - Search results
 * - Login/Signup pages
 */
export function shouldNoIndex(path: string): boolean {
  // Check for pagination
  if (path.includes('?page=') && !path.includes('?page=1')) {
    return true;
  }
  
  // Check for filters
  if (path.includes('?') && !path.includes('?page=1')) {
    return true;
  }
  
  // Check for specific paths
  const noIndexPaths = [
    '/login',
    '/signup',
    '/search',
    '/admin',
    '/panel'
  ];
  
  return noIndexPaths.some(p => path.startsWith(p));
}

/**
 * Clean tracking parameters from URL
 */
export function cleanTrackingParams(url: string): string {
  const trackingParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
    'msclkid',
    'ref',
    'source'
  ];
  
  const urlObj = new URL(url);
  
  trackingParams.forEach(param => {
    urlObj.searchParams.delete(param);
  });
  
  return urlObj.toString();
}

/**
 * Get robots meta tag value based on page context
 */
export function getRobotsMetaTag(path: string): string {
  if (shouldNoIndex(path)) {
    return 'noindex, follow';
  }
  
  return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
}
