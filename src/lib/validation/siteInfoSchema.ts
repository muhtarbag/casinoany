import { z } from 'zod';

// URL validation helper
const urlSchema = z.string().url({ message: 'Geçerli bir URL giriniz' }).or(z.literal(''));

// Social media URL validation with domain check
const socialUrlSchema = (domain: string) => 
  z.string()
    .optional()
    .refine(
      (val) => !val || val === '' || val.includes(domain) || !val.includes('http'),
      { message: `Geçerli bir ${domain} linki giriniz` }
    );

export const siteBasicInfoSchema = z.object({
  bonus: z.string()
    .trim()
    .min(1, { message: 'Bonus bilgisi gereklidir' })
    .max(500, { message: 'Bonus bilgisi en fazla 500 karakter olabilir' }),
  
  features: z.array(z.string().trim().max(100, { message: 'Özellik en fazla 100 karakter olabilir' }))
    .max(20, { message: 'En fazla 20 özellik ekleyebilirsiniz' }),
  
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
  
  telegram: socialUrlSchema('t.me'),
  
  twitter: socialUrlSchema('twitter.com')
    .or(socialUrlSchema('x.com')),
  
  instagram: socialUrlSchema('instagram.com'),
  
  facebook: socialUrlSchema('facebook.com'),
  
  youtube: socialUrlSchema('youtube.com'),
});

export type SiteBasicInfoFormData = z.infer<typeof siteBasicInfoSchema>;
