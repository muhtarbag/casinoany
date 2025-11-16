import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallback?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  responsive?: boolean; // Enable responsive images with srcset
  breakpoints?: number[]; // Custom breakpoints for srcset
}

/**
 * SEO-optimized image component with:
 * - Lazy loading (except priority images)
 * - WebP support with fallback
 * - Proper alt text for accessibility
 * - Aspect ratio preservation
 * - Error fallback
 */
export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  objectFit = 'contain',
  fallback = '/placeholder.svg',
  fetchPriority = 'auto',
  sizes,
  responsive = false,
  breakpoints = [320, 640, 768, 1024, 1280, 1920]
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    console.log('Image error details:', { src: imageSrc, hasError });
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallback);
    }
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageSrc);
    setIsLoaded(true);
  };

  // If error and no fallback, return null
  if (hasError && !fallback) {
    return null;
  }

  // Generate WebP URL (assumes WebP version exists with .webp extension)
  const getWebPUrl = (url: string) => {
    if (!url) return url;
    // If already webp, return as is
    if (url.endsWith('.webp')) return url;
    // Replace extension with .webp
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate srcset for responsive images
  const generateSrcSet = (url: string) => {
    if (!responsive || !url) return undefined;
    
    const baseName = url.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = url.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.webp';
    
    return breakpoints
      .map(bp => `${baseName}-${bp}w${ext} ${bp}w`)
      .join(', ');
  };

  const webpSrc = getWebPUrl(imageSrc);
  const originalSrcSet = generateSrcSet(imageSrc);
  const webpSrcSet = generateSrcSet(webpSrc);

  // If responsive, use <picture> element for better format support
  if (responsive) {
    return (
      <picture>
        {/* WebP sources with srcset */}
        {webpSrcSet && (
          <source
            type="image/webp"
            srcSet={webpSrcSet}
            sizes={sizes || '100vw'}
          />
        )}
        {/* Fallback to original format with srcset */}
        {originalSrcSet && (
          <source
            srcSet={originalSrcSet}
            sizes={sizes || '100vw'}
          />
        )}
        {/* Final fallback img */}
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-70',
            className
          )}
          style={{
            objectFit,
            ...(width && { width: `${width}px` }),
            ...(height && { height: `${height}px` })
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
        />
      </picture>
    );
  }

  // Standard img element (non-responsive)
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-70',
        className
      )}
      style={{
        objectFit,
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` })
      }}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : fetchPriority}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      width={width}
      height={height}
    />
  );
};

/**
 * Casino Logo Component (optimized for gambling sites)
 */
interface CasinoLogoProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CasinoLogo = ({ 
  src, 
  alt, 
  size = 'md',
  className 
}: CasinoLogoProps) => {
  const dimensions = {
    sm: { width: 48, height: 48 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 }
  };

  return (
    <OptimizedImage
      src={src}
      alt={`${alt} logo`}
      width={dimensions[size].width}
      height={dimensions[size].height}
      className={cn('rounded-lg', className)}
      objectFit="contain"
      fallback="/placeholder.svg"
    />
  );
};
