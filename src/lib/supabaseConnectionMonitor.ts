/**
 * Supabase Connection Monitor
 * Monitors connection health and handles automatic reconnection
 * ✅ FIX: Prevents undetected network failures
 */

import { supabase } from '@/integrations/supabase/client';
import { devLogger } from './devLogger';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

type ConnectionListener = (status: ConnectionStatus) => void;

class SupabaseConnectionMonitor {
  private status: ConnectionStatus = 'connected';
  private listeners: Set<ConnectionListener> = new Set();
  private healthCheckInterval: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private healthCheckIntervalMs = 30000; // 30 seconds
  private isMonitoring = false;

  /**
   * Start monitoring connection health
   */
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.reconnectAttempts = 0;
    this.updateStatus('connected');
    
    // Start periodic health checks
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckIntervalMs);

    // Perform initial health check
    this.performHealthCheck();
    
    devLogger.log('Connection monitor started');
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isMonitoring = false;
    devLogger.log('Connection monitor stopped');
  }

  /**
   * Perform health check
   */
  private async performHealthCheck() {
    try {
      // Simple query to check connection
      const { error } = await supabase
        .from('betting_sites')
        .select('id')
        .limit(1)
        .single();

      if (error && error.message.includes('network')) {
        throw new Error('Network error');
      }

      // Connection successful
      if (this.status !== 'connected') {
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
        devLogger.log('Connection restored');
      }
    } catch (error) {
      devLogger.error('Health check failed:', error);
      this.handleConnectionFailure();
    }
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateStatus('error');
      devLogger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.updateStatus('reconnecting');
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    devLogger.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.performHealthCheck();
    }, delay);
  }

  /**
   * Update connection status and notify listeners
   */
  private updateStatus(newStatus: ConnectionStatus) {
    if (this.status === newStatus) return;
    
    this.status = newStatus;
    this.notifyListeners(newStatus);
  }

  /**
   * Add connection status listener
   */
  addListener(listener: ConnectionListener) {
    this.listeners.add(listener);
    // Immediately notify of current status
    listener(this.status);
  }

  /**
   * Remove connection status listener
   */
  removeListener(listener: ConnectionListener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: ConnectionStatus) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        devLogger.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Force reconnection attempt
   */
  forceReconnect() {
    this.reconnectAttempts = 0;
    this.updateStatus('reconnecting');
    this.performHealthCheck();
  }
}

// Singleton instance
export const connectionMonitor = new SupabaseConnectionMonitor();
