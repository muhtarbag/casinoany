import { Component, ReactNode } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { logger } from '@/lib/errorHandling';

interface RetryBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface RetryBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

export class RetryBoundary extends Component<RetryBoundaryProps, RetryBoundaryState> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: RetryBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RetryBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.logError('RetryBoundary caught error:', error);
    console.error('Error details:', errorInfo);
    
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      logger.logError(`Max retries (${maxRetries}) reached`);
      return;
    }

    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        retryCount: retryCount + 1,
        isRetrying: false
      });
    }, retryDelay);
  };

  render() {
    const { hasError, error, isRetrying, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorState
          title="Component Hatası"
          message={error?.message || 'Beklenmeyen bir hata oluştu'}
          onRetry={retryCount < maxRetries ? this.handleRetry : undefined}
          retrying={isRetrying}
        />
      );
    }

    return children;
  }
}
