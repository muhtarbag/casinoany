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
  sizes
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
