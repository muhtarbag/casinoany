# SEO Snippets Kurulum Rehberi

Bu proje kapsamlı SEO snippet'leri içermektedir. Aşağıdaki adımları takip ederek ayarlarınızı yapabilirsiniz.

## 📋 Neler Eklendi?

### 1. **SEO Konfigürasyonu** (`src/lib/seo-config.ts`)
- Site genelinde kullanılacak SEO ayarları
- Meta tag şablonları
- Structured data şemaları
- Analytics snippet'leri

### 2. **SEO Snippets Bileşeni** (`src/components/seo/SEOSnippets.tsx`)
- Google Analytics entegrasyonu
- Google Tag Manager desteği
- Facebook Pixel entegrasyonu
- Organization ve WebSite şemaları
- Site doğrulama meta tag'leri

### 3. **Otomatik Entegrasyon**
- Tüm sayfalarda otomatik olarak yüklenir
- App.tsx'e entegre edilmiştir

## 🚀 Hızlı Başlangıç

### 1. Google Analytics Kurulumu

`src/lib/seo-config.ts` dosyasını açın:

```typescript
export const seoConfig = {
  // ...
  gaTrackingId: 'G-XXXXXXXXXX', // Buraya kendi tracking ID'nizi yazın
  // ...
};
```

Tracking ID'nizi [Google Analytics](https://analytics.google.com/) panelinden alabilirsiniz.

### 2. Google Tag Manager Kurulumu (Opsiyonel)

```typescript
export const seoConfig = {
  // ...
  gtmId: 'GTM-XXXXXXX', // GTM ID'nizi yazın
  // ...
};
```

`src/App.tsx` dosyasında GTM'i aktif edin:

```typescript
<SEOSnippets 
  includeAnalytics={true}
  includeGTM={true}  // ← true yapın
  includeFacebookPixel={false}
  includeSchemas={true}
/>
```

### 3. Facebook Pixel Kurulumu (Opsiyonel)

```typescript
export const seoConfig = {
  // ...
  fbPixelId: '1234567890', // Facebook Pixel ID'nizi yazın
  // ...
};
```

`src/App.tsx` dosyasında Facebook Pixel'i aktif edin:

```typescript
<SEOSnippets 
  includeAnalytics={true}
  includeGTM={false}
  includeFacebookPixel={true}  // ← true yapın
  includeSchemas={true}
/>
```

### 4. Site Doğrulama

Google Search Console ve Yandex doğrulama kodlarınızı ekleyin:

```typescript
export const seoConfig = {
  // ...
  googleSiteVerification: 'your-verification-code',
  yandexVerification: 'your-verification-code',
  // ...
};
```

## 📊 Structured Data Kullanımı

### Casino Site Sayfaları

```tsx
import { getCasinoSiteSchema } from '@/lib/seo-config';
import { StructuredData } from '@/components/StructuredData';

const schema = getCasinoSiteSchema({
  name: site.name,
  slug: site.slug,
  description: site.description,
  rating: site.rating,
  reviewCount: site.review_count,
  bonus: site.bonus,
  logo: site.logo_url,
  features: site.features,
});

return (
  <>
    <StructuredData data={schema} />
    {/* Sayfa içeriği */}
  </>
);
```

### Blog Sayfaları

```tsx
import { getArticleSchema } from '@/lib/seo-config';
import { StructuredData } from '@/components/StructuredData';

const schema = getArticleSchema({
  title: post.title,
  description: post.excerpt,
  author: post.author,
  publishedDate: post.published_at,
  modifiedDate: post.updated_at,
  image: post.featured_image,
  url: window.location.href,
});

return (
  <>
    <StructuredData data={schema} />
    {/* Blog içeriği */}
  </>
);
```

### FAQ Sayfaları

```tsx
import { getFAQSchema } from '@/lib/seo-config';
import { StructuredData } from '@/components/StructuredData';

const schema = getFAQSchema([
  {
    question: 'Soru 1',
    answer: 'Cevap 1',
  },
  {
    question: 'Soru 2',
    answer: 'Cevap 2',
  },
]);

return (
  <>
    <StructuredData data={schema} />
    {/* FAQ içeriği */}
  </>
);
```

### Breadcrumb Kullanımı

```tsx
import { getBreadcrumbSchema } from '@/lib/seo-config';
import { StructuredData } from '@/components/StructuredData';

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://yoursite.com' },
  { name: 'Casino', url: 'https://yoursite.com/casino' },
  { name: 'Kingbetting', url: 'https://yoursite.com/casino/kingbetting' },
];

const schema = getBreadcrumbSchema(breadcrumbItems);

return (
  <>
    <StructuredData data={schema} />
    <Breadcrumb items={breadcrumbItems} />
  </>
);
```

## 🎯 Meta Tag Oluşturma

```tsx
import { generateMetaTags } from '@/lib/seo-config';
import { SEO } from '@/components/SEO';

const metaTags = generateMetaTags({
  title: 'Sayfa Başlığı',
  description: 'Sayfa açıklaması burada',
  keywords: ['keyword1', 'keyword2'],
  canonical: 'https://yoursite.com/page',
  image: 'https://yoursite.com/image.jpg',
  type: 'article',
  noindex: false,
});

return (
  <SEO {...metaTags} />
);
```

## 🔧 Özelleştirme

### Site Bilgilerini Güncelleyin

`src/lib/seo-config.ts`:

```typescript
export const seoConfig = {
  siteName: 'CasinoAny',  // Site adınız
  siteUrl: 'https://casinoany.com',  // Site URL'iniz
  defaultTitle: 'Ana Sayfa Başlığı',
  defaultDescription: 'Site açıklaması',
  defaultKeywords: ['keyword1', 'keyword2'],
  twitterHandle: '@yourhandle',
  // ...
};
```

### Sosyal Medya Linklerini Ekleyin

Organization schema'da sosyal medya linklerinizi güncelleyin:

```typescript
export const getOrganizationSchema = () => ({
  // ...
  sameAs: [
    'https://twitter.com/yourhandle',
    'https://facebook.com/yourpage',
    'https://instagram.com/yourprofile',
  ],
  // ...
});
```

## ✅ Test Etme

### Google Rich Results Test
- URL: https://search.google.com/test/rich-results
- Structured data'nızı test edin

### Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- Open Graph tag'lerinizi test edin

### Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Twitter card'larınızı test edin

### Schema.org Validator
- URL: https://validator.schema.org/
- Tüm structured data'larınızı doğrulayın

## 📈 Performans İpuçları

1. **Analytics sadece production'da kullanın**
2. **Gereksiz snippet'leri devre dışı bırakın**
3. **Structured data'yı sadece ilgili sayfalarda kullanın**
4. **Canonical URL'leri doğru ayarlayın**
5. **Robots meta tag'lerini kontrol edin**

## 🐛 Sorun Giderme

### Analytics çalışmıyor
- Tracking ID'yi kontrol edin
- Browser console'da hata var mı bakın
- Network sekmesinde Google Analytics isteklerini kontrol edin

### Structured Data görünmüyor
- Browser'da "view source" yapın
- `<script type="application/ld+json">` tag'lerini arayın
- JSON syntax hatası olup olmadığını kontrol edin

### Meta tag'ler yanlış
- React Helmet async doğru kurulu mu kontrol edin
- Sayfa component'inde SEO component'i var mı bakın
- Canonical URL doğru mu kontrol edin

## 📚 Daha Fazla Bilgi

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

---

**Not:** Tüm tracking ID'leri ve doğrulama kodlarını değiştirmeyi unutmayın!
