import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AnalyticsDashboard = lazy(() => 
  import('./AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard }))
);

/**
 * Lazy-loaded Analytics Dashboard wrapper
 * Reduces initial bundle size by loading charts on demand
 */
export const LazyAnalyticsDashboard = () => {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    }>
      <AnalyticsDashboard />
    </Suspense>
  );
};
