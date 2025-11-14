import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const ChangeHistoryViewer = lazy(() => import('@/components/history/ChangeHistoryViewer').then(m => ({ default: m.ChangeHistoryViewer })));

export default function ChangeHistory() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChangeHistoryViewer />
    </Suspense>
  );
}
