import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const SystemHealthDashboard = lazy(() => import('@/components/SystemHealthDashboard').then(m => ({ default: m.SystemHealthDashboard })));

export default function SystemHealth() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SystemHealthDashboard />
    </Suspense>
  );
}
