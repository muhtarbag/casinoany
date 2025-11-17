import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Footer = lazy(() => import('./Footer').then(module => ({ default: module.Footer })));

const FooterFallback = () => (
  <footer className="border-t border-border/40 bg-background/95">
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </footer>
);

export const LazyFooter = (props: any) => (
  <Suspense fallback={<FooterFallback />}>
    <Footer {...props} />
  </Suspense>
);
