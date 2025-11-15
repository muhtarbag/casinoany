import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const CategoryManagementComponent = lazy(() => 
  import('@/components/admin/CategoryManagement').then(m => ({ default: m.CategoryManagement }))
);

export default function CategoryManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CategoryManagementComponent />
    </Suspense>
  );
}
