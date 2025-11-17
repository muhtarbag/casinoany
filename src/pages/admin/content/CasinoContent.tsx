import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyCasinoContentManagement } from '@/components/Performance/LazyAdminComponents';

export default function CasinoContent() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
      <LazyCasinoContentManagement />
    </Suspense>
  );
}
