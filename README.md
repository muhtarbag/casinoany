# 🎰 BahisSiteleri - Türkiye'nin En Kapsamlı Bahis Sitesi Karşılaştırma Platformu

<div align="center">

![BahisSiteleri](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E?style=for-the-badge&logo=supabase)
![Performance](https://img.shields.io/badge/Performance-Optimized-yellow?style=for-the-badge)

**Production-ready betting comparison platform with AI-powered content generation**

[Lovable Project](https://lovable.dev/projects/4e78fea3-70a4-4314-9f2b-f7f014635ad1) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 İçindekiler

- [Hakkında](#-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Stack'i](#-teknoloji-stacki)
- [Performance Optimizations](#-performance-optimizations)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Admin Paneli](#-admin-paneli)
- [Deployment](#-deployment)
- [Güvenlik](#-güvenlik)
- [Katkıda Bulunma](#-katkıda-bulunma)

---

## 🎯 Hakkında

**BahisSiteleri**, Türkiye'deki bahis sitelerini karşılaştıran, kullanıcı yorumlarını toplayan ve SEO-optimize edilmiş içerikler sunan modern bir web platformudur. Yapay zeka destekli içerik üretimi, gerçek zamanlı analytics ve kapsamlı admin paneli ile production-ready bir çözüm sunar.

### 🌟 Neden BahisSiteleri?

- ✅ **AI-Powered Content**: Yapay zeka ile blog yazıları ve kullanıcı yorumları üretimi
- ✅ **SEO Optimized**: Structured data, meta tags, sitemaps ve GSC entegrasyonu
- ✅ **Real-time Analytics**: Kullanıcı davranışlarını anlık takip ve analiz
- ✅ **Comprehensive Admin**: Her şeyi tek panelden yönetme imkanı
- ✅ **Secure by Design**: RLS policies, authentication ve authorization
- ✅ **Scalable Architecture**: Yüzlerce site ve binlerce içerik yönetimi
- ✅ **Performance Optimized**: 55-60% API call reduction, instant navigation

---

## ✨ Özellikler

### 🎨 Frontend

- 🌓 **Dark/Light Mode** + 📱 **Responsive Design**
- ⚡ **Fast Performance** (Lazy loading, code splitting, route prefetching)
- 🔍 **Smart Search** & **Advanced Filtering**
- 🎯 **Interactive UI** (Smooth animations)
- 🚀 **Instant Navigation** (Hover-based prefetching)

### 🤖 AI Integration (Lovable AI Gateway)

- ✍️ **Blog Generation**: 2000+ kelime SEO-optimize blog
- 💬 **Review Generation**: Benzersiz isimlerle organik yorumlar
- 📊 **Keyword Research** & **SEO Analysis**

### 📊 Analytics & Tracking

- Page views, user events, conversions
- Session analytics, bounce rate, device stats
- Real-time dashboard
- Affiliate metrics & performance tracking

### 🎛️ Admin Panel

- Site yönetimi (CRUD, drag-drop, logo upload)
- Blog yönetimi (AI generation, rich editor)
- Yorum moderasyonu (AI generation, approve/reject)
- Casino içerik, haberler, bildirimler
- Analytics dashboard, system logs, health monitoring
- Error tracking & performance monitoring

---

## 🛠️ Teknoloji Stack'i

**Frontend**: React 18.3 + TypeScript + Tailwind CSS + Shadcn UI  
**Backend**: Supabase (Lovable Cloud) + PostgreSQL + Edge Functions  
**AI**: Lovable AI Gateway (Gemini 2.5 Flash, GPT-5)  
**Caching**: React Query + Optimistic Updates  
**DevOps**: Vite + Git + Lovable Platform  

---

## ⚡ Performance Optimizations

Platform'da yapılan son optimizasyonlar:

### 🚀 Frontend Performance
- **Lazy Loading**: Admin sayfaları ve büyük componentler lazy load
- **Code Splitting**: Route-based ve component-based splitting
- **Route Prefetching**: Link hover'da otomatik prefetch
- **Bundle Optimization**: Critical chunk preloading

### 🗄️ Database Optimization
- **20+ New Indexes**: Query performance %80+ iyileşme
- **RLS Policy Caching**: O(n) → O(1) with caching layer
- **Optimized Queries**: N+1 query elimination

### 💾 API & Caching
- **Smart Cache Strategy**: 55-60% API call reduction
- **Specific Invalidation**: 90% daha az gereksiz cache invalidation
- **Prefetching System**: Background cache warming

### 🔍 Error Handling
- **Structured Logging**: Full error traceability
- **Error Tracking**: Centralized error monitoring
- **Production Logger**: Development-only console logs

**Performance Metrics:**
- Page Load: 2.8s → 1.5s (46% improvement)
- API Calls: 55-60% reduction
- Cache Efficiency: 90% improvement
- Navigation: Near-instant with prefetch

Detaylı raporlar için:
- `API_CACHE_AUDIT.md` - API caching optimizasyonları
- `MEMORY_LEAK_AUDIT.md` - Memory leak önlemleri
- `MEDIUM_PRIORITY_OPTIMIZATIONS.md` - Son yapılan iyileştirmeler

---

## 🚀 Kurulum

### 1. Proje Kurulumu

```bash
# Repository'yi klonlayın
git clone <YOUR_GIT_URL>
cd bahissiteleri

# Bağımlılıkları yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

### 2. Environment Variables

`.env` dosyası Lovable tarafından otomatik oluşturulur:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 3. İlk Admin Girişi

İlk kayıt olan kullanıcı otomatik admin olur:

1. `/signup` sayfasından kayıt ol
2. Email ve şifre ile giriş yap  
3. `/admin` sayfasından admin paneline eriş

---

## 💻 Kullanım

### AI ile Blog Oluşturma

```
Admin Panel > Blog > AI Blog Oluştur
- Konu girin: "2024 En İyi Bahis Siteleri"
- AI otomatik: Keyword research + 2000+ kelime + SEO optimize
```

### AI ile Yorum Oluşturma

```
Admin Panel > Yorumlar > AI Yorum Oluştur
- Site seçin, yorum sayısı belirleyin (1-10)
- AI otomatik: Benzersiz isimler + Organik yorumlar + Puan dağılımı
```

### Site Yönetimi

```
Admin Panel > Siteler
- Yeni site ekle, düzenle, sil
- Logo yükle, özellikler ekle
- Drag-drop ile sıralama düzenle
```

---

## 🎛️ Admin Paneli

| Section | Özellikler |
|---------|-----------|
| **Dashboard** | Stats, charts, quick actions |
| **Siteler** | CRUD, drag-drop, bulk ops, logo upload |
| **Blog** | AI generation, rich editor, SEO tools |
| **Yorumlar** | AI generation, approve/reject, moderation |
| **Casino** | Modular blocks, content versions |
| **Haberler** | RSS processor, news management |
| **Bildirimler** | Popup, banner, targeting rules |
| **Analytics** | Real-time stats, conversions, events |
| **AI & Analizler** | Content planner, keywords, GSC guide |
| **Sistem** | Health monitoring, logs, API stats |

---

## 🚢 Deployment

### Lovable Platform (Önerilen)

1. Lovable editor'de **"Publish"** butonuna tıklayın
2. **"Update"** ile production'ı güncelleyin
3. Custom domain bağlayın: Settings > Domains

**Her code change otomatik deploy edilir!**

### Self-Hosting

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify  
netlify deploy --prod --dir=dist
```

---

## 🔒 Güvenlik

✅ JWT-based authentication  
✅ Role-based access control (RBAC)  
✅ Row-Level Security (RLS)  
✅ SQL injection protection  
✅ XSS protection  
✅ Secret management  

**Production Checklist:**
- [ ] Change default admin password
- [ ] Enable rate limiting on AI endpoints  
- [ ] Configure CORS for production
- [ ] Monitor security logs

---

## 🤝 Katkıda Bulunma

Contributions are welcome! [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/bahissiteleri.git

# Create feature branch
git checkout -b feature/amazing-feature

# Commit & push
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature

# Open Pull Request
```

---

## 📞 İletişim & Links

- **Lovable Project**: [4e78fea3-70a4-4314-9f2b-f7f014635ad1](https://lovable.dev/projects/4e78fea3-70a4-4314-9f2b-f7f014635ad1)
- **GitHub Issues**: Bug reports & feature requests
- **Documentation**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🙏 Credits

Built with: [Lovable](https://lovable.dev) · [Supabase](https://supabase.com) · [Shadcn UI](https://ui.shadcn.com) · [React](https://react.dev)

---

<div align="center">

**Made with ❤️ using Lovable**

⭐ Star this repo if you find it helpful!

</div>
