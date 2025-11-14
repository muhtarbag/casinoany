import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const CasinoContentManagement = lazy(() => import('@/components/CasinoContentManagement').then(m => ({ default: m.CasinoContentManagement })));

export default function CasinoContent() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CasinoContentManagement />
    </Suspense>
  );
}
