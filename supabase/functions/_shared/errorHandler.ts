/**
 * Shared Error Handler for Edge Functions
 * Provides structured logging, error tracking, and consistent error responses
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

export interface ErrorContext {
  functionName: string;
  operation: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  requestId: string;
  timestamp: string;
}

/**
 * Log error to system_logs table with structured data
 */
export async function logError(
  supabase: any, // Changed to any to avoid type issues with edge functions
  error: Error,
  context: ErrorContext
): Promise<void> {
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context.metadata,
    };

    await supabase.rpc('log_system_event', {
      p_log_type: 'error',
      p_severity: 'error',
      p_action: `${context.functionName}:${context.operation}`,
      p_resource: context.functionName,
      p_details: errorData,
      p_user_id: context.userId || null,
    });
  } catch (logError) {
    // Fallback to console if logging fails
    console.error('Failed to log error:', logError);
    console.error('Original error:', error);
  }
}

/**
 * Check if error is critical (requires immediate attention)
 */
export function isCriticalError(error: Error): boolean {
  const criticalPatterns = [
    /database/i,
    /connection/i,
    /timeout/i,
    /service.*unavailable/i,
    /authentication.*failed/i,
  ];

  return criticalPatterns.some(pattern => 
    pattern.test(error.message) || pattern.test(error.name)
  );
}

/**
 * Generate consistent error response
 */
export function createErrorResponse(
  error: Error,
  context: ErrorContext
): { response: ErrorResponse; status: number } {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // Determine appropriate status code
  let status = 500;
  if (error.message.includes('not found')) status = 404;
  if (error.message.includes('unauthorized')) status = 401;
  if (error.message.includes('forbidden')) status = 403;
  if (error.message.includes('bad request')) status = 400;

  // User-friendly error message
  const userMessage = getUserFriendlyMessage(error);

  return {
    response: {
      success: false,
      error: userMessage,
      requestId,
      timestamp,
    },
    status,
  };
}

/**
 * Convert technical error to user-friendly message
 */
function getUserFriendlyMessage(error: Error): string {
  // Database errors
  if (error.message.includes('violates foreign key constraint')) {
    return 'Referenced data not found';
  }
  if (error.message.includes('duplicate key')) {
    return 'This record already exists';
  }
  if (error.message.includes('violates check constraint')) {
    return 'Invalid data provided';
  }

  // Network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'Network error occurred';
  }

  // Authentication errors
  if (error.message.includes('JWT')) {
    return 'Authentication failed';
  }

  // Default message
  return 'An unexpected error occurred';
}

/**
 * Complete error handling wrapper
 */
export async function handleError(
  supabase: any, // Changed to any to avoid type issues with edge functions
  error: Error,
  context: ErrorContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Log error with structured data
  await logError(supabase, error, context);

  // Check if critical (for future alerting integration)
  if (isCriticalError(error)) {
    console.error(`🚨 CRITICAL ERROR in ${context.functionName}:`, error);
    // TODO: Send alert to monitoring service (Slack, PagerDuty, etc.)
  }

  // Generate response
  const { response, status } = createErrorResponse(error, context);

  return new Response(
    JSON.stringify(response),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-Id': response.requestId,
      },
    }
  );
}

/**
 * Success response helper
 */
export function createSuccessResponse<T>(
  data: T,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}
