# Site Management Feature

Bu modül, bahis sitelerinin CRUD işlemlerini yöneten feature dosyasıdır.

## Bileşenler

### SiteManagementContainer
Ana container bileşeni. Tüm state yönetimi, data fetching ve handler'ları içerir.

**Özellikler:**
- Site listesi görüntüleme
- Arama ve filtreleme
- Drag & drop sıralama
- Toplu işlemler (bulk actions)
- Site ekleme/düzenleme/silme

### SiteFormWrapper
Site ekleme ve düzenleme formu.

**Özellikler:**
- React Hook Form ile validation
- Zod schema validation
- Auto-slug generation
- Logo upload ve preview
- Field-level error messages

### SiteList
Site listesini görüntüleyen bileşen.

**Özellikler:**
- Drag & drop sıralama (@dnd-kit)
- Site seçimi (checkbox)
- Arama/filtreleme
- Pagination (sayfa başına 20 site)
- Görüntülenme ve tıklama istatistikleri

### SiteBulkActions
Toplu işlem butonları.

**Özellikler:**
- Toplu silme (confirmation dialog ile)
- Toplu aktif/pasif yapma
- Seçili site sayısı gösterimi

## Kullanım

```tsx
import { SiteManagementContainer } from '@/features/sites/SiteManagementContainer';

function AdminPage() {
  return <SiteManagementContainer />;
}
```

## Performance

- `React.memo` ile optimized components
- `useCallback` ve `useMemo` hooks
- Pagination ile büyük listeleri yönetme
- Skeleton loaders

## Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader desteği
- Semantic HTML

## Dependencies

- `@dnd-kit/core` - Drag & drop
- `@dnd-kit/sortable` - Sortable lists
- `react-hook-form` - Form yönetimi
- `zod` - Schema validation
- `@tanstack/react-query` - Data fetching
