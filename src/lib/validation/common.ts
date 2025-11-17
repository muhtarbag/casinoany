/**
 * Common validation utilities and schemas
 * Provides reusable validation patterns for the entire application
 */

import { z } from 'zod';

/**
 * Email validation with Turkish domain support
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'E-posta adresi gereklidir' })
  .email({ message: 'Geçerli bir e-posta adresi giriniz' })
  .max(255, { message: 'E-posta adresi en fazla 255 karakter olabilir' })
  .toLowerCase();

/**
 * Phone validation (Turkish format)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+90|0)?[0-9]{10}$/, { 
    message: 'Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)' 
  })
  .optional()
  .or(z.literal(''));

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'Geçerli bir URL giriniz' })
  .max(2048, { message: 'URL en fazla 2048 karakter olabilir' })
  .optional()
  .or(z.literal(''));

/**
 * Social media URL validation factory
 */
export const createSocialUrlSchema = (platform: string, domain: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val === '' || val.includes(domain) || !val.includes('http'),
      { message: `Geçerli bir ${platform} linki giriniz` }
    );

/**
 * Text validation with HTML sanitization check
 */
export const safeTextSchema = (
  minLength: number = 1,
  maxLength: number = 1000,
  fieldName: string = 'Alan'
) =>
  z
    .string()
    .trim()
    .min(minLength, { message: `${fieldName} en az ${minLength} karakter olmalıdır` })
    .max(maxLength, { message: `${fieldName} en fazla ${maxLength} karakter olabilir` })
    .refine(
      (val) => !/<script|javascript:|onerror=/i.test(val),
      { message: 'Güvenlik nedeniyle bu içerik kullanılamaz' }
    );

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  .max(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  .regex(/[A-Z]/, { message: 'Şifre en az bir büyük harf içermelidir' })
  .regex(/[a-z]/, { message: 'Şifre en az bir küçük harf içermelidir' })
  .regex(/[0-9]/, { message: 'Şifre en az bir rakam içermelidir' })
  .regex(/[^A-Za-z0-9]/, { message: 'Şifre en az bir özel karakter içermelidir' });

/**
 * Slug validation (URL-friendly)
 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, { message: 'Slug gereklidir' })
  .max(100, { message: 'Slug en fazla 100 karakter olabilir' })
  .regex(/^[a-z0-9-]+$/, { 
    message: 'Slug sadece küçük harf, rakam ve tire içerebilir' 
  });

/**
 * Rating validation (1-5 stars)
 */
export const ratingSchema = z
  .number()
  .int({ message: 'Puan tam sayı olmalıdır' })
  .min(1, { message: 'Puan en az 1 olmalıdır' })
  .max(5, { message: 'Puan en fazla 5 olabilir' });

/**
 * UUID validation
 */
export const uuidSchema = z
  .string()
  .uuid({ message: 'Geçersiz ID formatı' });

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Doğrulama hatası'] };
  }
}

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Dosya boyutu en fazla 5MB olabilir'
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type),
      { message: 'Sadece JPG, PNG, WebP ve SVG dosyaları kabul edilir' }
    )
});

/**
 * Bulk validation helper
 */
export function validateBatch<T extends z.ZodType>(
  schema: T,
  items: unknown[]
): { 
  valid: z.infer<T>[]; 
  invalid: { index: number; errors: string[] }[] 
} {
  const valid: z.infer<T>[] = [];
  const invalid: { index: number; errors: string[] }[] = [];

  items.forEach((item, index) => {
    const result = validateAndSanitize(schema, item);
    if (result.success === true) {
      valid.push(result.data);
    } else if (result.success === false) {
      // Type narrowed: result must have errors property
      invalid.push({ index, errors: result.errors });
    }
  });

  return { valid, invalid };
}
