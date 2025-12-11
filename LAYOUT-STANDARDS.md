# Global Layout Standards - World Class Implementation

Bu belge, sitenin global layout standartlarını ve spacing sistemini tanımlar.

## 🎯 Temel Prensipler

### 1. Header (Sabit Başlık)
- **Mobil yükseklik:** 64px (`h-16`)
- **Desktop yükseklik:** 72px (`md:h-[72px]`)
- **Position:** Fixed top
- **Z-index:** 50
- **Backdrop blur:** Aktif

```tsx
<header className="h-16 md:h-[72px] fixed w-full top-0 z-50">
```

### 2. Container (İçerik Genişliği)
- **Max-width:** 1280px (dünya standardı)
- **Horizontal padding:**
  - Mobil: 16px (`px-4`)
  - Tablet: 24px (`md:px-6`)
  - Desktop: 32px (`lg:px-8`)

```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px]">
```

### 3. Page Top Padding (Header için boşluk)
- **Mobil:** 64px (`pt-16`)
- **Desktop:** 72px (`md:pt-[72px]`)

```tsx
<main className="pt-16 md:pt-[72px]">
```

### 4. Section Spacing (Bölümler arası boşluk)
- **Mobil:** 48px (`space-y-12` veya `py-12`)
- **Desktop:** 80px (`md:space-y-20` veya `md:py-20`)

## 📐 CSS Değişkenleri (src/index.css)

```css
:root {
  /* Layout System - World Class Standards */
  --header-height: 64px;
  --header-height-desktop: 72px;
  --container-max-width: 1280px;
  --container-padding: 1rem;        /* 16px mobile */
  --container-padding-md: 1.5rem;   /* 24px tablet */
  --container-padding-lg: 2rem;     /* 32px desktop */
  --section-spacing: 3rem;          /* 48px between sections */
  --section-spacing-lg: 5rem;       /* 80px desktop sections */
}
```

## 🎨 Tailwind Utilities

Tailwind config'de eklenen yardımcı sınıflar:

```typescript
spacing: {
  'header': 'var(--header-height)',
  'header-desktop': 'var(--header-height-desktop)',
},
maxWidth: {
  'container': 'var(--container-max-width)',
}
```

## ✅ Doğru Kullanım Örnekleri

### Ana Sayfa Layoutu
```tsx
<div className="pt-16 md:pt-[72px]">
  <Hero />
  <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px] py-12 md:py-20">
    <FeaturedSites />
  </div>
</div>
```

### İçerik Sayfaları
```tsx
<Header />
<main className="pt-16 md:pt-[72px] min-h-screen">
  <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px] py-8 md:py-12">
    {/* İçerik */}
  </div>
</main>
<Footer />
```

### Bonus Sayfaları (Template)
```tsx
<Header />
<main className="pt-16 md:pt-[72px]">
  <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px] py-8 md:py-12">
    <BonusPageTemplate />
  </div>
</main>
<Footer />
```

## ❌ Yaygın Hatalar

### Hatalı: Farklı padding değerleri
```tsx
<main className="pt-20 md:pt-28">  {/* ❌ Tutarsız */}
```

### Doğru: Standart padding
```tsx
<main className="pt-16 md:pt-[72px]">  {/* ✅ */}
```

### Hatalı: Max-width yok
```tsx
<div className="container mx-auto px-4">  {/* ❌ Çok geniş olabilir */}
```

### Doğru: Max-width ile sınırlı
```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px]">  {/* ✅ */}
```

## 🔧 Güncellenmiş Bileşenler

1. **Header.tsx** - Sabit yükseklik eklendi
2. **Index.tsx** - Standart padding
3. **DenemeBonusu.tsx** - Standart padding
4. **Hero.tsx** - Container max-width
5. **BonusPageTemplate.tsx** - Container max-width ve padding
6. **Footer.tsx** - Container max-width ve padding

## 📱 Responsive Breakpoints

- **xs:** 475px
- **sm:** 640px
- **md:** 768px (tablet başlangıç)
- **lg:** 1024px (desktop başlangıç)
- **xl:** 1280px (geniş desktop)
- **2xl:** 1536px (ultra geniş)

## 🌍 Dünya Standartları

Bu layout sistemi şu standartları takip eder:
- **Google Material Design** - Container max-width guidelines
- **Bootstrap 5** - Responsive spacing system
- **Tailwind CSS** - Utility-first approach
- **Apple Human Interface Guidelines** - Touch target sizes (44px minimum)
- **WCAG 2.1** - Accessibility spacing requirements

## 📝 Yeni Sayfa Eklerken Checklist

- [ ] Header yüksekliği için `pt-16 md:pt-[72px]` kullanıldı mı?
- [ ] Container `max-w-[1280px]` ile sınırlandı mı?
- [ ] Responsive padding `px-4 md:px-6 lg:px-8` kullanıldı mı?
- [ ] Section spacing tutarlı mı? (`py-12 md:py-20`)
- [ ] Mobil ve desktop'ta test edildi mi?

## 🎯 Performans Notları

- Header fixed olduğu için `will-change: transform` otomatik uygulanır
- Container max-width sayesinde aşırı geniş ekranlarda okunabilirlik artar
- Responsive padding sayesinde mobil cihazlarda dokunma hedefleri uygun boyutta kalır
