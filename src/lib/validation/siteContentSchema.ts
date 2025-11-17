import { z } from 'zod';

export const siteContentSchema = z.object({
  pros: z.array(
    z.string()
      .trim()
      .min(1, { message: 'Artı boş olamaz' })
      .max(200, { message: 'Artı en fazla 200 karakter olabilir' })
  ).max(15, { message: 'En fazla 15 artı ekleyebilirsiniz' }),
  
  cons: z.array(
    z.string()
      .trim()
      .min(1, { message: 'Eksi boş olamaz' })
      .max(200, { message: 'Eksi en fazla 200 karakter olabilir' })
  ).max(15, { message: 'En fazla 15 eksi ekleyebilirsiniz' }),
  
  verdict: z.string()
    .trim()
    .min(50, { message: 'Sonuç en az 50 karakter olmalıdır' })
    .max(2000, { message: 'Sonuç en fazla 2000 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  expertReview: z.string()
    .trim()
    .min(100, { message: 'Uzman yorumu en az 100 karakter olmalıdır' })
    .max(5000, { message: 'Uzman yorumu en fazla 5000 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  gameCategories: z.record(
    z.string(),
    z.string().trim().max(1000, { message: 'Oyun kategorisi açıklaması en fazla 1000 karakter olabilir' })
  ),
  
  loginGuide: z.string()
    .trim()
    .max(3000, { message: 'Giriş rehberi en fazla 3000 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  withdrawalGuide: z.string()
    .trim()
    .max(3000, { message: 'Para çekme rehberi en fazla 3000 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  faq: z.array(
    z.object({
      question: z.string()
        .trim()
        .min(5, { message: 'Soru en az 5 karakter olmalıdır' })
        .max(300, { message: 'Soru en fazla 300 karakter olabilir' }),
      answer: z.string()
        .trim()
        .min(10, { message: 'Cevap en az 10 karakter olmalıdır' })
        .max(1000, { message: 'Cevap en fazla 1000 karakter olabilir' })
    })
  ).max(20, { message: 'En fazla 20 SSS ekleyebilirsiniz' }),
});

export type SiteContentFormData = z.infer<typeof siteContentSchema>;
