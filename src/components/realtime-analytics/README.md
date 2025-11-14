# Real-time Analytics Dashboard

WebSocket tabanlı canlı analytics dashboard'u. Supabase Realtime kullanarak site istatistiklerini gerçek zamanlı olarak takip eder.

## Özellikler

### 🔴 Canlı Metrikler
- **Toplam Görüntüleme**: Her page view anında güncellenir
- **Toplam Tıklama**: Affiliate link tıklamaları canlı takip
- **Aktif Kullanıcılar**: Son 5 dakika içindeki aktif kullanıcı sayısı
- **Dönüşüm Oranı**: Gerçek zamanlı CTR hesaplaması

### 📊 Canlı Aktivite Akışı
- Page view'lar
- Affiliate link tıklamaları
- Kullanıcı etkileşimleri
- Conversion olayları

### ⚡ WebSocket Channels
4 farklı Supabase Realtime channel kullanılır:

1. **page_views**: Her sayfa görüntülemesinde tetiklenir
2. **user_events**: Kullanıcı etkileşimlerinde tetiklenir
3. **site_stats**: Site istatistikleri güncellendiğinde tetiklenir
4. **conversions**: Conversion olaylarında tetiklenir

## Teknik Detaylar

### Database Setup
```sql
-- Realtime için tablolar yayınlandı
ALTER PUBLICATION supabase_realtime ADD TABLE page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE user_events;
ALTER PUBLICATION supabase_realtime ADD TABLE site_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE conversions;

-- Full replica identity
ALTER TABLE page_views REPLICA IDENTITY FULL;
ALTER TABLE user_events REPLICA IDENTITY FULL;
ALTER TABLE site_stats REPLICA IDENTITY FULL;
ALTER TABLE conversions REPLICA IDENTITY FULL;
```

### Hook Kullanımı
```typescript
const { metrics, isConnected } = useRealtimeAnalytics();

// metrics.totalViews - Toplam görüntüleme
// metrics.totalClicks - Toplam tıklama
// metrics.activeUsers - Aktif kullanıcı sayısı
// metrics.recentActivities - Son 10 aktivite
// isConnected - WebSocket bağlantı durumu
```

### Animasyonlar
- Framer Motion kullanılarak smooth geçişler
- Yeni veriler scale animasyonuyla vurgulanır
- Aktivite feed'i için enter/exit animasyonlar
- Bağlantı durumu için pulse animasyon

## Performans

### Optimizasyonlar
- ✅ WebSocket bağlantıları cleanup ile otomatik kapatılır
- ✅ Aktivite listesi max 10 item ile sınırlı
- ✅ İlk yükleme için tek seferlik data fetch
- ✅ Gereksiz re-render'lar engellenmiş
- ✅ AnimatePresence ile optimize edilmiş list rendering

### Cache Stratejisi
- İlk veriler component mount'ta yüklenir
- WebSocket event'leri local state'i günceller
- Query invalidation yapılmaz (real-time data)

## Component Yapısı

```
RealtimeAnalyticsDashboard/
├── useRealtimeAnalytics.ts    # WebSocket logic
└── RealtimeAnalyticsDashboard.tsx  # UI component
```

## Kullanım

Admin panelinde "Analitik & Raporlar" dropdown menüsünden "🔴 Canlı Analytics" seçeneğini kullanın.

### Özellikleri Test Etme
1. Bir tarayıcıda dashboard'u açın
2. Başka bir tarayıcıda siteyi kullanın
3. Dashboard'da aktivitelerin gerçek zamanlı görünmesini izleyin

## Sorun Giderme

### WebSocket Bağlanamıyor
- Browser console'da "[Realtime Analytics]" log'larını kontrol edin
- Supabase project settings'de Realtime API enabled olmalı
- Database tables publication'a eklenmiş olmalı

### Veriler Güncellenmiyor
- RLS policies kontrolü yapın
- `REPLICA IDENTITY FULL` ayarlarını kontrol edin
- Channel subscription status'u kontrol edin

### Performans Sorunları
- Aktivite listesi limit artırılmışsa düşürün
- Animation duration'ları optimize edin
- Multiple channel subscription yerine tek channel kullanmayı deneyin
