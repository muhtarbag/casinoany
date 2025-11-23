import { supabase } from '@/integrations/supabase/client';

/**
 * Turkish character mapping for URL-friendly slugs
 */
const turkishCharMap: Record<string, string> = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u', 'Â': 'a', 'Î': 'i', 'Û': 'u',
};

/**
 * Generate SEO-friendly URL slug from Turkish text
 * Handles Turkish characters, removes special chars, converts to lowercase
 */
export function generateSlug(text: string): string {
  return text
    .split('')
    .map(char => turkishCharMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '') // Remove special characters
    .replace(/[\\s_-]+/g, '-') // Replace spaces and multiple dashes with single dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .slice(0, 100); // Limit to 100 chars
}

/**
 * Generate unique slug for news articles with duplicate detection
 * If slug exists, appends number (e.g., slug-2, slug-3)
 */
export async function generateUniqueNewsSlug(
  title: string, 
  excludeId?: string
): Promise<string> {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Keep checking until we find unique slug
  while (true) {
    const query = supabase
      .from('news_articles')
      .select('id')
      .eq('slug', slug);

    // Exclude current article if updating
    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    // If error or no duplicate found, we have unique slug
    if (error || !data) {
      break;
    }

    // Duplicate found, try next number
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

/**
 * Validate slug format (for manual slug entry)
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.trim().length === 0) {
    return { valid: false, error: 'Slug boş olamaz' };
  }

  if (slug.length < 3) {
    return { valid: false, error: 'Slug en az 3 karakter olmalı' };
  }

  if (slug.length > 100) {
    return { valid: false, error: 'Slug en fazla 100 karakter olabilir' };
  }

  // Only allow lowercase letters, numbers, and dashes
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Slug sadece küçük harf, rakam ve tire (-) içerebilir' };
  }

  // No leading/trailing dashes
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug tire ile başlayamaz veya bitemez' };
  }

  // No consecutive dashes
  if (slug.includes('--')) {
    return { valid: false, error: 'Slug ardışık tire içeremez' };
  }

  return { valid: true };
}

/**
 * Check if slug is available for use
 */
export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const query = supabase
    .from('news_articles')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();
  
  return !data && !error;
}
