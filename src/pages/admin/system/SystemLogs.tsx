import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const SystemLogsViewer = lazy(() => import('@/components/SystemLogsViewer').then(m => ({ default: m.SystemLogsViewer })));

export default function SystemLogs() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SystemLogsViewer />
    </Suspense>
  );
}
