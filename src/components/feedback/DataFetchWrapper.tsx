import { ReactNode } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { LucideIcon, Database } from 'lucide-react';

interface DataFetchWrapperProps<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  loadingText?: string;
  errorTitle?: string;
  isEmpty?: (data: T) => boolean;
}

export function DataFetchWrapper<T>({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  children,
  emptyState,
  loadingText,
  errorTitle,
  isEmpty
}: DataFetchWrapperProps<T>) {
  // Loading state
  if (isLoading) {
    return <LoadingState text={loadingText} variant="skeleton" />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        message={error?.message}
        onRetry={onRetry}
      />
    );
  }

  // Empty state
  if (!data || (isEmpty && isEmpty(data))) {
    if (emptyState) {
      return (
        <EmptyState
          icon={emptyState.icon || Database}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      );
    }
    return (
      <EmptyState
        icon={Database}
        title="Veri Bulunamadı"
        description="Henüz kayıt eklenmemiş."
      />
    );
  }

  // Success state - render children with data
  return <>{children(data)}</>;
}
