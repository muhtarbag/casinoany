import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
}

/**
 * Hook for retrying failed operations with exponential backoff
 */
export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retryOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = true,
      onError
    } = options;

    setIsRetrying(true);
    let lastError: Error | null = null;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        setAttempt(i + 1);
        const result = await operation();
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (onError) {
          onError(lastError, i + 1);
        }

        // Don't delay on last attempt
        if (i < maxAttempts - 1) {
          const waitTime = backoff ? delay * Math.pow(2, i) : delay;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    setIsRetrying(false);
    setAttempt(0);
    
    toast({
      title: 'İşlem Başarısız',
      description: `${maxAttempts} deneme sonunda işlem tamamlanamadı.`,
      variant: 'destructive'
    });

    throw lastError;
  }, []);

  return {
    retryOperation,
    isRetrying,
    attempt
  };
}
