import { z } from 'zod';
import { createSocialUrlSchema, safeTextSchema } from './common';

// Social media URL validation with domain check
const socialUrlSchema = (platform: string, domain: string) => createSocialUrlSchema(platform, domain);

export const siteBasicInfoSchema = z.object({
  bonus: safeTextSchema(1, 500, 'Bonus bilgisi'),
  
  features: z.array(
    safeTextSchema(1, 100, 'Özellik')
  ).max(20, { message: 'En fazla 20 özellik ekleyebilirsiniz' }),
  
  email: z.string()
    .trim()
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .max(255, { message: 'E-posta en fazla 255 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  whatsapp: z.string()
    .trim()
    .max(50, { message: 'WhatsApp numarası en fazla 50 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  telegram: socialUrlSchema('Telegram', 't.me'),
  
  twitter: socialUrlSchema('Twitter/X', 'twitter.com')
    .or(socialUrlSchema('Twitter/X', 'x.com')),
  
  instagram: socialUrlSchema('Instagram', 'instagram.com'),
  
  facebook: socialUrlSchema('Facebook', 'facebook.com'),
  
  youtube: socialUrlSchema('YouTube', 'youtube.com'),
  
  linkedin: socialUrlSchema('LinkedIn', 'linkedin.com'),
  
  telegram_channel: socialUrlSchema('Telegram Kanalı', 't.me'),
  
  kick: socialUrlSchema('Kick', 'kick.com'),
  
  discord: z.string()
    .trim()
    .max(500, { message: 'Discord linki en fazla 500 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  pinterest: socialUrlSchema('Pinterest', 'pinterest.com'),
});

export type SiteBasicInfoFormData = z.infer<typeof siteBasicInfoSchema>;
