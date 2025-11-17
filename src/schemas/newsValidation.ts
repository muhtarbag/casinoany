import { z } from 'zod';

/**
 * NEWS ARTICLE VALIDATION SCHEMA
 * Prevents XSS and malformed data in news management
 */

export const newsArticleSchema = z.object({
  title: z.string()
    .min(1, 'Başlık zorunludur')
    .max(200, 'Başlık çok uzun')
    .trim(),
  slug: z.string()
    .min(1, 'Slug zorunludur')
    .max(200, 'Slug çok uzun')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  content: z.string()
    .min(10, 'İçerik en az 10 karakter olmalıdır'),
  excerpt: z.string()
    .max(500, 'Özet çok uzun')
    .optional()
    .nullable(),
  category: z.string()
    .max(100, 'Kategori çok uzun')
    .optional()
    .nullable(),
  meta_title: z.string()
    .max(200, 'Meta başlık çok uzun')
    .optional()
    .nullable(),
  meta_description: z.string()
    .max(500, 'Meta açıklama çok uzun')
    .optional()
    .nullable(),
  is_published: z.boolean().default(true),
});

export type NewsArticleFormData = z.infer<typeof newsArticleSchema>;

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtmlContent(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}
