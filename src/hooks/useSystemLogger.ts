import { supabase } from '@/integrations/supabase/client';

type LogType = 'user_action' | 'system_error' | 'api_call' | 'admin_action' | 'performance';
type Severity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

interface LogEventParams {
  logType: LogType;
  severity: Severity;
  action: string;
  resource?: string;
  details?: Record<string, any>;
  sessionId?: string;
  durationMs?: number;
  statusCode?: number;
  errorMessage?: string;
}

export const useSystemLogger = () => {
  const logEvent = async (params: LogEventParams) => {
    try {
      const { error } = await supabase.rpc('log_system_event', {
        p_log_type: params.logType,
        p_severity: params.severity,
        p_action: params.action,
        p_resource: params.resource,
        p_details: params.details,
        p_session_id: params.sessionId,
        p_duration_ms: params.durationMs,
        p_status_code: params.statusCode,
        p_error_message: params.errorMessage,
      });

      if (error) {
        console.error('Failed to log event:', error);
      }
    } catch (err) {
      console.error('Logger error:', err);
    }
  };

  const logUserAction = (action: string, resource?: string, details?: Record<string, any>) => {
    return logEvent({
      logType: 'user_action',
      severity: 'info',
      action,
      resource,
      details,
    });
  };

  const logError = (action: string, error: Error | string, resource?: string) => {
    return logEvent({
      logType: 'system_error',
      severity: 'error',
      action,
      resource,
      errorMessage: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? { stack: error.stack } : undefined,
    });
  };

  const logCriticalError = (action: string, error: Error | string, resource?: string) => {
    return logEvent({
      logType: 'system_error',
      severity: 'critical',
      action,
      resource,
      errorMessage: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? { stack: error.stack } : undefined,
    });
  };

  const logAdminAction = (action: string, resource?: string, details?: Record<string, any>) => {
    return logEvent({
      logType: 'admin_action',
      severity: 'info',
      action,
      resource,
      details,
    });
  };

  const logPerformance = (action: string, durationMs: number, resource?: string, details?: Record<string, any>) => {
    const severity: Severity = durationMs > 3000 ? 'warning' : durationMs > 5000 ? 'error' : 'info';
    
    return logEvent({
      logType: 'performance',
      severity,
      action,
      resource,
      durationMs,
      details,
    });
  };

  const logApiCall = async (
    functionName: string,
    method: string,
    endpoint: string,
    statusCode: number,
    durationMs: number,
    requestBody?: any,
    responseBody?: any,
    errorMessage?: string
  ) => {
    try {
      const { error } = await supabase
        .from('api_call_logs')
        .insert({
          function_name: functionName,
          method,
          endpoint,
          status_code: statusCode,
          duration_ms: durationMs,
          request_body: requestBody,
          response_body: responseBody,
          error_message: errorMessage,
        });

      if (error) {
        console.error('Failed to log API call:', error);
      }
    } catch (err) {
      console.error('API logger error:', err);
    }
  };

  return {
    logEvent,
    logUserAction,
    logError,
    logCriticalError,
    logAdminAction,
    logPerformance,
    logApiCall,
  };
};
