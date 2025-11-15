import { z } from 'zod';

// Site form validation schema
export const siteFormSchema = z.object({
  name: z.string()
    .min(2, 'Site adı en az 2 karakter olmalıdır')
    .max(100, 'Site adı en fazla 100 karakter olabilir')
    .trim(),
  
  slug: z.string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(100, 'Slug en fazla 100 karakter olabilir')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .trim(),
  
  rating: z.number()
    .min(1, 'Rating en az 1 olmalıdır')
    .max(5, 'Rating en fazla 5 olabilir'),
  
  bonus: z.string()
    .max(500, 'Bonus bilgisi en fazla 500 karakter olabilir')
    .optional()
    .default(''),
  
  features: z.string()
    .max(1000, 'Özellikler en fazla 1000 karakter olabilir')
    .optional()
    .default(''),
  
  affiliate_link: z.string()
    .url('Geçerli bir URL giriniz')
    .max(500, 'Link en fazla 500 karakter olabilir')
    .trim(),
  
  email: z.string()
    .email('Geçerli bir email giriniz')
    .or(z.literal(''))
    .optional()
    .default(''),
  
  whatsapp: z.string()
    .max(50, 'WhatsApp numarası en fazla 50 karakter olabilir')
    .optional()
    .default(''),
  
  telegram: z.string()
    .max(100, 'Telegram adresi en fazla 100 karakter olabilir')
    .optional()
    .default(''),
  
  twitter: z.string()
    .max(100, 'Twitter adresi en fazla 100 karakter olabilir')
    .optional()
    .default(''),
  
  instagram: z.string()
    .max(100, 'Instagram adresi en fazla 100 karakter olabilir')
    .optional()
    .default(''),
  
  facebook: z.string()
    .max(100, 'Facebook adresi en fazla 100 karakter olabilir')
    .optional()
    .default(''),
  
  youtube: z.string()
    .max(100, 'YouTube adresi en fazla 100 karakter olabilir')
    .optional()
    .default(''),
  
  // Affiliate Management Fields
  affiliate_contract_date: z.string()
    .optional()
    .default(''),
  
  affiliate_contract_terms: z.string()
    .max(2000, 'Anlaşma şartları en fazla 2000 karakter olabilir')
    .optional()
    .default(''),
  
  affiliate_has_monthly_payment: z.boolean()
    .optional()
    .default(false),
  
  affiliate_monthly_payment: z.number()
    .min(0, 'Ödeme tutarı negatif olamaz')
    .optional()
    .nullable(),
  
  affiliate_panel_url: z.string()
    .url('Geçerli bir URL giriniz')
    .or(z.literal(''))
    .optional()
    .default(''),
  
  affiliate_panel_username: z.string()
    .max(100, 'Kullanıcı adı en fazla 100 karakter olabilir')
    .optional()
    .default(''),
  
  affiliate_panel_password: z.string()
    .max(200, 'Şifre en fazla 200 karakter olabilir')
    .optional()
    .default(''),
  
  affiliate_notes: z.string()
    .max(2000, 'Notlar en fazla 2000 karakter olabilir')
    .optional()
    .default(''),
  
  affiliate_commission_percentage: z.number()
    .min(0, 'Komisyon yüzdesi negatif olamaz')
    .max(100, 'Komisyon yüzdesi 100\'den büyük olamaz')
    .optional()
    .nullable(),
  
  // Categories
  category_ids: z.array(z.string())
    .optional()
    .default([]),
});

export type SiteFormData = z.infer<typeof siteFormSchema>;

// Helper: Generate slug from Turkish text
export const generateSlug = (text: string): string => {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };
  
  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Logo validation
export const validateLogoFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return 'Logo dosyası JPG, PNG, SVG veya WebP formatında olmalıdır';
  }
  
  if (file.size > maxSize) {
    return 'Logo dosyası en fazla 5MB olabilir';
  }
  
  return null;
};
