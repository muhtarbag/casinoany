# TİB/BTK Domain Engeli Koruma Sistemi

## 🛡️ Sistem Özellikleri

Bu sistem, ana domain'e TİB/BTK tarafından erişim engeli konulması durumunda otomatik yedek domain'e geçiş yaparak SEO ve backlink çalışmalarınızı korur.

### Özellikler:
- ✅ Çoklu domain yönetimi
- ✅ Otomatik health check
- ✅ Dinamik sitemap ve robots.txt
- ✅ SEO korumalı canonical URL
- ✅ Otomatik failover mekanizması
- ✅ Admin panel yönetimi

## 📋 Kurulum Talimatları

### 1. Yedek Domain'leri Hazırlayın

Farklı TLD'lerle birden fazla domain alın:
- domain1.com (primary)
- domain2.io (backup 1)
- domain3.online (backup 2)
- domain4.co (backup 3)

### 2. Lovable'da Domain Bağlantısı

Her domain için:
1. Lovable → Settings → Domains
2. "Connect Domain" tıklayın
3. Domain'i girin (örn: www.domain2.io)
4. DNS ayarlarını yapın:
   - **A Record** → `185.158.133.1`
   - **TXT Record** → Lovable'ın verdiği verification kodu

### 3. Sistem Kurulumu

#### Database (Otomatik Kuruldu ✅)
- `alternative_domains` tablosu oluşturuldu
- RLS policies aktif
- Health check fonksiyonları hazır

#### Edge Functions (Otomatik Deploy Edilecek ✅)
- `domain-health-check` - Düzenli kontrol
- `get-active-domain` - Aktif domain sorgulama
- `robots` - Dinamik robots.txt
- `dynamic-sitemap` - Domain-aware sitemap

### 4. Admin Panelden Domain Yönetimi

1. Admin Panel → System → Domain Management (`/admin/system/domains`)
2. Yedek domain'leri ekleyin:
   - Domain adı: `www.yedek-domain.io`
   - Öncelik: 90, 80, 70, ... (yüksek = öncelikli)
3. "Tüm Domain'leri Kontrol Et" ile health check yapın

## 🔧 Kullanım

### Manuel Health Check
```bash
# Admin panel üzerinden
Admin → System → Domain Management → "Tüm Domain'leri Kontrol Et"
```

### Otomatik İzleme Ayarlama (Opsiyonel)
Supabase Dashboard → Edge Functions → Cron Jobs:
```cron
# Her saat domain kontrolü
0 * * * * domain-health-check
```

## 📊 Domain Durumları

| Durum | Açıklama |
|-------|----------|
| `active` | Domain aktif ve erişilebilir |
| `ready` | Domain hazır ama henüz aktif değil |
| `offline` | Domain erişilemiyor (muhtemelen engellendi) |
| `blocked` | Domain TİB/BTK tarafından engellendi |

## 🚨 Acil Durum Planı

### Senaryo: Ana Domain Engellendi

1. **Otomatik Failover**: Sistem otomatik olarak bir sonraki aktif domain'i devreye alır
2. **Manuel Kontrol**: Admin panel → Domain Management
3. **Primary Değiştirme**: 
   - Engellenmiş domain'i `is_active = false` yapın
   - Yeni domain'i `is_primary = true` yapın
4. **DNS Güncellemesi**: Cloudflare kullanıyorsanız IP'yi hızla değiştirin
5. **Sitemap Güncelleme**: Otomatik güncellenecek, opsiyonel manuel trigger

### İletişim Stratejisi

Kullanıcılara yeni domain bildirimi için:
```sql
-- bonus_requests tablosundan email/telefon listesi
SELECT email, phone FROM bonus_requests;

-- Toplu bildirim gönderimi (opsiyonel)
-- Email/SMS servisinize entegre edin
```

## 🎯 SEO Koruması

### Canonical URL
Tüm sayfalarda otomatik olarak aktif domain kullanılır:
```typescript
// Sayfalarda otomatik aktif
import { useDynamicCanonical } from '@/hooks/useDynamicCanonical';

function MyPage() {
  useDynamicCanonical('/sayfa-yolu');
  // ...
}
```

### Sitemap
- `/sitemap.xml` → Dinamik olarak aktif domain kullanır
- Otomatik güncelleme
- Google Search Console'a her domain için ayrı ekleyin

### Robots.txt
- `/robots.txt` → Edge function üzerinden dinamik
- Aktif domain'in sitemap'ini gösterir

## 📈 İzleme ve Raporlama

### System Logs
```sql
-- Domain failover logları
SELECT * FROM system_logs 
WHERE log_type = 'domain_failover' 
ORDER BY created_at DESC;
```

### Health Check Sonuçları
Admin Panel → System → Domain Management
- Son kontrol zamanı
- Domain durumları
- Offline/Blocked sayısı

## 🔐 Güvenlik

- RLS policies aktif
- Sadece admin'ler domain yönetebilir
- Public'e sadece aktif domain'ler görünür
- Edge function'lar ANON key ile çalışır (güvenli)

## 💡 En İyi Pratikler

1. **Düzenli Kontrol**: Günde en az 1 kez health check
2. **Çoklu Yedekleme**: Minimum 3-4 yedek domain bulundurun
3. **CDN Kullanımı**: Cloudflare gibi CDN'ler esneklik sağlar
4. **Monitoring**: Uptime robot benzeri servislere tüm domain'leri ekleyin
5. **İletişim**: Sosyal medya ve email ile kullanıcıları bilgilendirin

## 🆘 Destek

Sistem otomatik olarak çalışacaktır. Sorun durumunda:
1. Admin panel'den domain durumlarını kontrol edin
2. Health check çalıştırın
3. Edge function loglarına bakın (Supabase Dashboard)
4. Gerekirse manuel olarak primary domain değiştirin

---

**Not**: Bu sistem TİB/BTK engellerini %100 garanti etmez ama SEO ve backlink kaybını minimuma indirir. Domain çeşitliliği ve hızlı reaksiyon en önemli faktörlerdir.
