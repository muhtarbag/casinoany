import { z } from 'zod';

/**
 * CMS CONTENT VALIDATION SCHEMA
 * Ensures safe and valid content updates
 */

export const cmsContentUpdateItemSchema = z.object({
  key: z.string()
    .min(1, 'Ayar anahtarı zorunludur')
    .max(100, 'Ayar anahtarı çok uzun'),
  value: z.string()
    .max(5000, 'Değer çok uzun')
    .trim(),
});

export const cmsContentUpdateSchema = z.array(cmsContentUpdateItemSchema);

export type CMSContentUpdate = z.infer<typeof cmsContentUpdateSchema>;

/**
 * Validate email addresses
 */
export const emailSchema = z.string().email('Geçersiz email adresi').optional().or(z.literal(''));

/**
 * Validate URLs
 */
export const urlSchema = z.string().url('Geçersiz URL').optional().or(z.literal(''));
