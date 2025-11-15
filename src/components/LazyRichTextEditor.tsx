import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RichTextEditor = lazy(() => 
  import('./RichTextEditor').then(module => ({ default: module.RichTextEditor }))
);

interface LazyRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Lazy-loaded Rich Text Editor wrapper
 * Reduces initial bundle size by ~200KB
 */
export const LazyRichTextEditor = (props: LazyRichTextEditorProps) => {
  return (
    <Suspense fallback={
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    }>
      <RichTextEditor {...props} />
    </Suspense>
  );
};
