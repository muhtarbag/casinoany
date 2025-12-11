/**
 * Calculate reading time for content
 * Based on average reading speed of 200 words per minute (Turkish)
 */
export function calculateReadingTime(content: string): number {
  if (!content || content.trim().length === 0) {
    return 1; // Minimum 1 minute
  }

  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace)
  const words = plainText.trim().split(/\s+/).length;
  
  // Calculate minutes (200 words per minute for Turkish)
  const minutes = Math.ceil(words / 200);
  
  // Minimum 1 minute, maximum capped at reasonable limit
  return Math.max(1, Math.min(minutes, 60));
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number, locale: 'tr' | 'en' = 'tr'): string {
  if (locale === 'tr') {
    return `${minutes} dk okuma`;
  }
  return `${minutes} min read`;
}
