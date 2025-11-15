import { useState } from 'react';
import { logger } from '@/lib/errorHandling';

interface UseDataFetchOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseDataFetchReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retryCount: number;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions<T> = {}
): UseDataFetchReturn<T> {
  const {
    initialData,
    onSuccess,
    onError,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    let attempt = 0;
    const maxAttempts = retry ? maxRetries + 1 : 1;

    while (attempt < maxAttempts) {
      try {
        const result = await fetchFn();
        setData(result);
        onSuccess?.(result);
        setIsLoading(false);
        return;
      } catch (err) {
        attempt++;
        setRetryCount(attempt);
        
        if (attempt >= maxAttempts) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          setIsError(true);
          onError?.(error);
          logger.logError('Data fetch failed:', error);
          setIsLoading(false);
          return;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        logger.logInfo(`Retry attempt ${attempt}/${maxRetries}`);
      }
    }
  };

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchData,
    retryCount
  };
}
