/**
 * Standardized Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

import { prodLogger } from './productionLogger';
import { toast } from 'sonner';

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Standard success response structure
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Safely execute an async function with standardized error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'İşlem başarısız oldu',
  options?: {
    showToast?: boolean;
    component?: string;
    logError?: boolean;
  }
): Promise<ApiResponse<T>> {
  const { showToast = true, component = 'system', logError = true } = options || {};
  
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    if (logError) {
      prodLogger.error(errorMessage, error as Error, {
        component,
        metadata: { originalError: errorMsg }
      });
    }
    
    if (showToast) {
      toast.error(errorMessage, {
        description: import.meta.env.DEV ? errorMsg : undefined,
        duration: 5000
      });
    }
    
    return {
      success: false,
      error: errorMsg,
      details: error
    };
  }
}

/**
 * Wrap Supabase query with standardized error handling
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string = 'Veri alınamadı',
  options?: {
    showToast?: boolean;
    component?: string;
  }
): Promise<ApiResponse<T>> {
  return safeAsync(async () => {
    const { data, error } = await queryFn();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Veri bulunamadı');
    }
    
    return data;
  }, errorMessage, options);
}

/**
 * Standardized auth check with error handling
 */
export async function getAuthenticatedUser(
  supabase: any,
  errorMessage: string = 'Oturum bilgisi alınamadı'
): Promise<ApiResponse<any>> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    prodLogger.error(errorMessage, error, { component: 'auth' });
    return {
      success: false,
      error: errorMessage,
      details: error
    };
  }
  
  if (!user) {
    const noUserError = 'Oturum açmanız gerekiyor';
    prodLogger.warn(noUserError, { component: 'auth' });
    return {
      success: false,
      error: noUserError
    };
  }
  
  return {
    success: true,
    data: user
  };
}

/**
 * Check if response is successful
 */
export function isSuccess<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error
 */
export function isError(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}

/**
 * Handle mutation errors consistently
 */
export function handleMutationError(
  error: unknown,
  fallbackMessage: string = 'İşlem başarısız oldu'
): string {
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : fallbackMessage;
  
  prodLogger.error(fallbackMessage, error as Error, {
    component: 'mutation'
  });
  
  toast.error(fallbackMessage, {
    description: import.meta.env.DEV ? errorMessage : undefined,
    duration: 5000
  });
  
  return errorMessage;
}

/**
 * Handle mutation success consistently
 */
export function handleMutationSuccess(
  message: string,
  options?: {
    duration?: number;
    description?: string;
  }
): void {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration || 3000
  });
}
