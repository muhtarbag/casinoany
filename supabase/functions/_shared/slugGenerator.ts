/**
 * Shared slug generator utility for Supabase Edge Functions
 * Turkish character support + SEO-friendly URL generation
 */

const turkishCharMap: Record<string, string> = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u', 'Â': 'a', 'Î': 'i', 'Û': 'u',
};

export function generateSlug(text: string): string {
  return text
    .split('')
    .map(char => turkishCharMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Generate unique slug with duplicate detection
 * Appends -2, -3, etc. if slug already exists
 */
export async function generateUniqueSlug(
  supabase: any,
  baseText: string,
  table: string = 'news_articles',
  slugColumn: string = 'slug'
): Promise<string> {
  let baseSlug = generateSlug(baseText);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq(slugColumn, slug)
      .maybeSingle();

    if (error || !data) {
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}
