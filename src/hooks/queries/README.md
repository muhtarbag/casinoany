# React Query Optimizasyonları - Kullanım Kılavuzu

## 📚 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Custom Hooks](#custom-hooks)
3. [Kullanım Örnekleri](#kullanım-örnekleri)
4. [Cache Stratejileri](#cache-stratejileri)
5. [Best Practices](#best-practices)

## Genel Bakış

Bu proje, React Query ile optimize edilmiş cache yönetimi ve veri fetching stratejisi kullanır.

### Avantajlar
- ✅ Merkezi query key yönetimi
- ✅ Otomatik cache invalidation
- ✅ Optimized refetch strategies
- ✅ Type-safe queries
- ✅ Paralel data fetching
- ✅ Automatic error handling

## Custom Hooks

### News Queries (`useNewsQueries.ts`)

```tsx
import { useNewsArticles, useNewsArticle, useIncrementNewsView } from '@/hooks/queries/useNewsQueries';

// Tüm haberler
const { data: news, isLoading } = useNewsArticles({
  isPublished: true,
  category: 'iGaming Genel',
  limit: 10
});

// Tek haber
const { data: article } = useNewsArticle('haber-slug');

// View count artırma
const incrementView = useIncrementNewsView();
incrementView.mutate(articleId);
```

### Blog Queries (`useBlogQueries.ts`)

```tsx
import { useBlogPosts, useBlogPost, useBlogComments, useBlogStats } from '@/hooks/queries/useBlogQueries';

// Blog posts
const { data: posts } = useBlogPosts({ 
  isPublished: true 
});

// Blog stats (with comments)
const { data: stats } = useBlogStats();

// Yorum ekleme
const addComment = useAddBlogComment();
addComment.mutate({
  post_id: postId,
  comment: 'Harika bir yazı!',
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Site Queries (`useSiteQueries.ts`)

```tsx
import { useSites, useSite, useFeaturedSites, useSiteStats } from '@/hooks/queries/useSiteQueries';

// Aktif siteler
const { data: sites } = useSites({ 
  isActive: true,
  limit: 20 
});

// Featured siteler
const { data: featured } = useFeaturedSites();

// Site istatistikleri güncelleme
const updateStats = useUpdateSiteStats();
updateStats.mutate({ 
  siteId: 'site-uuid', 
  type: 'click' 
});
```

### Analytics Queries (`useAnalyticsQueries.ts`)

```tsx
import { useAnalyticsDashboard, useCasinoTopSites } from '@/hooks/queries/useAnalyticsQueries';

// Tüm analytics verileri (paralel fetch)
const { data: analytics } = useAnalyticsDashboard({
  start: new Date('2025-01-01'),
  end: new Date()
});

// analytics.pageViews
// analytics.events
// analytics.conversions
// analytics.sessions

// Top casino sites
const { data: topSites } = useCasinoTopSites();
```

## Cache Stratejileri

### Cache Süreleri

```ts
import { CACHE_TIMES, REFETCH_INTERVALS } from '@/lib/queryClient';

// Kullanılabilir süreler:
CACHE_TIMES.SHORT        // 1 dakika
CACHE_TIMES.MEDIUM       // 5 dakika
CACHE_TIMES.LONG         // 15 dakika
CACHE_TIMES.VERY_LONG    // 1 saat

// Refetch interval'leri:
REFETCH_INTERVALS.FAST    // 30 saniye
REFETCH_INTERVALS.NORMAL  // 2 dakika
REFETCH_INTERVALS.SLOW    // 5 dakika
REFETCH_INTERVALS.NEVER   // false
```

### Query Keys

```ts
import { queryKeys } from '@/lib/queryClient';

// Merkezi query key factory
queryKeys.news.all              // ['news']
queryKeys.news.lists()          // ['news', 'list']
queryKeys.news.list({ isPublished: true })  // ['news', 'list', { isPublished: true }]
queryKeys.news.detail('slug')   // ['news', 'detail', 'slug']
```

### Cache Invalidation

```ts
import { invalidateQueries } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Tüm news cache'ini temizle
invalidateQueries.news(queryClient);

// Tüm blog cache'ini temizle
invalidateQueries.blog(queryClient);

// Tüm cache'i temizle
invalidateQueries.all(queryClient);
```

## Best Practices

### 1. Component'lerde Kullanım

```tsx
// ❌ YANLIŞ - Her seferinde yeni query
function NewsComponent() {
  const { data } = (supabase as any).from('news_articles').select('*');
  // ...
}

// ✅ DOĞRU - Custom hook kullan
function NewsComponent() {
  const { data, isLoading, error } = useNewsArticles({ isPublished: true });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <NewsList news={data} />;
}
```

### 2. Mutations İle Cache Update

```tsx
const deleteMutation = useDeleteNews();

const handleDelete = async (id: string) => {
  try {
    await deleteMutation.mutateAsync(id);
    // Cache otomatik olarak güncellenir
  } catch (error) {
    // Error handling
  }
};
```

### 3. Optimistic Updates

```tsx
const updateMutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.news.all });
    
    // Snapshot previous value
    const previousData = queryClient.getQueryData(queryKeys.news.all);
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.news.all, newData);
    
    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.news.all, context?.previousData);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
  },
});
```

### 4. Prefetching

```tsx
import { prefetchHelpers } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Sayfa mount olmadan önce data'yı prefetch et
useEffect(() => {
  prefetchHelpers.news(queryClient, fetchNewsFunction);
}, []);
```

### 5. Paralel Queries

```tsx
// ✅ DOĞRU - useQueries ile paralel fetch
const results = useQueries({
  queries: [
    { queryKey: queryKeys.news.lists(), queryFn: fetchNews },
    { queryKey: queryKeys.blog.lists(), queryFn: fetchBlog },
    { queryKey: queryKeys.sites.lists(), queryFn: fetchSites },
  ]
});

const [newsQuery, blogQuery, sitesQuery] = results;
```

## Performans İpuçları

### 1. Background Refetch
- `refetchOnWindowFocus: true` - Window focus'ta otomatik refetch
- `refetchOnReconnect: true` - Network reconnect'te refetch

### 2. Stale Time
- Kısa (1dk): Sık değişen veriler (analytics, real-time data)
- Orta (5dk): Normal güncellik (blog posts, news)
- Uzun (15dk): Nadiren değişen (site listings)
- Çok Uzun (1saat): Statik veriler (site details, about pages)

### 3. GC Time (Garbage Collection)
- Varsayılan: 10 dakika
- Cache'den kaldırılmadan önce inactive query'lerin bekleyeceği süre

### 4. Retry Strategy
- 404 hatalarında retry yapma
- Auth hatalarında (401, 403) retry yapma
- Diğer hatalar için max 2 retry (exponential backoff ile)

## Migration Guide

Mevcut kodunuzu yeni sisteme taşımak için:

```tsx
// ESKI KOD
const { data: news } = useQuery({
  queryKey: ['news-articles'],
  queryFn: async () => {
    const { data } = await supabase.from('news_articles').select('*');
    return data;
  }
});

// YENİ KOD
const { data: news } = useNewsArticles({ isPublished: true });
```

Tüm avantajlardan yararlanmak için custom hook'ları kullanın!
