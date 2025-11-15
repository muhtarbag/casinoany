/**
 * Hook to preload critical images for LCP optimization
 * Use for hero images, logos, and above-the-fold content
 */

import { useEffect } from 'react';

interface PreloadImageOptions {
  priority?: 'high' | 'low';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const preloadedImages = new Set<string>();

export const useCriticalImagePreload = (
  imageUrls: string[],
  options: PreloadImageOptions = { priority: 'high', fetchPriority: 'high' }
) => {
  useEffect(() => {
    imageUrls.forEach(url => {
      // Skip if already preloaded
      if (preloadedImages.has(url)) return;
      
      // Create link element
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      
      // Set priority hints
      if (options.fetchPriority) {
        link.setAttribute('fetchpriority', options.fetchPriority);
      }
      
      // Determine image type
      if (url.endsWith('.svg')) {
        link.type = 'image/svg+xml';
      } else if (url.endsWith('.webp')) {
        link.type = 'image/webp';
      } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
        link.type = 'image/jpeg';
      } else if (url.endsWith('.png')) {
        link.type = 'image/png';
      }
      
      document.head.appendChild(link);
      preloadedImages.add(url);
    });
  }, [imageUrls, options.fetchPriority]);
};

/**
 * Preload multiple images on component mount
 */
export const preloadImages = (urls: string[], priority: 'high' | 'low' = 'low') => {
  urls.forEach(url => {
    if (preloadedImages.has(url)) return;
    
    const img = new Image();
    if (priority === 'high') {
      img.fetchPriority = 'high';
    }
    img.src = url;
    preloadedImages.add(url);
  });
};
