import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Header = lazy(() => import('./Header').then(module => ({ default: module.Header })));

const HeaderFallback = () => (
  <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-16 items-center">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-1 items-center justify-end space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </header>
);

export const LazyHeader = (props: any) => (
  <Suspense fallback={<HeaderFallback />}>
    <Header {...props} />
  </Suspense>
);
