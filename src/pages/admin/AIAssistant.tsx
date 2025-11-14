import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const AIAssistantComponent = lazy(() => import('@/components/AIAssistant').then(m => ({ default: m.AIAssistant })));

export default function AIAssistant() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AIAssistantComponent />
    </Suspense>
  );
}
