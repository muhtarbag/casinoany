/**
 * Image Optimization Utilities for iGaming Platform
 * Handles WebP conversion, compression, and CDN integration
 */

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
}

/**
 * Generate optimized image URL (for future CDN integration)
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  const { quality = 85, format = 'webp', width, height } = options;

  // If already WebP, return as-is
  if (originalUrl.endsWith('.webp')) {
    return originalUrl;
  }

  // For future CDN integration (Cloudflare Images, Imgix, etc.)
  // Example: https://cdn.domain.com/image.jpg?w=800&q=85&f=webp
  
  // Currently return original URL (will be enhanced when CDN is added)
  return originalUrl;
};

/**
 * Preload critical images for LCP optimization
 */
export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.type = 'image/webp';
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before image enters viewport
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }
};

/**
 * Convert image to WebP (client-side conversion for uploads)
 */
export const convertToWebP = async (
  file: File,
  quality: number = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * Calculate optimal image dimensions based on viewport
 */
export const getResponsiveImageSize = (
  originalWidth: number,
  originalHeight: number,
  containerWidth: number
): { width: number; height: number } => {
  const aspectRatio = originalHeight / originalWidth;
  const width = Math.min(containerWidth, originalWidth);
  const height = Math.round(width * aspectRatio);
  
  return { width, height };
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string => {
  return widths
    .map(width => `${getOptimizedImageUrl(baseUrl, { width })} ${width}w`)
    .join(', ');
};

/**
 * Casino logo optimization presets
 */
export const CASINO_LOGO_PRESETS = {
  thumbnail: { width: 48, height: 48, quality: 85 },
  card: { width: 80, height: 80, quality: 90 },
  detail: { width: 120, height: 120, quality: 95 },
  hero: { width: 200, height: 200, quality: 95 }
} as const;

/**
 * Prefetch images for better UX (casino logos, bonus banners)
 */
export const prefetchImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};
