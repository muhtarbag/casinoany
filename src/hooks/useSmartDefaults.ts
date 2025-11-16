import { useMemo } from 'react';
import { logger } from '@/lib/logger';

interface SmartDefaultsOptions {
  context?: string;
  previousValues?: Record<string, any>;
  userPreferences?: Record<string, any>;
}

/**
 * Smart defaults hook that learns from user behavior
 * and pre-fills forms with intelligent defaults
 */
export function useSmartDefaults(options: SmartDefaultsOptions = {}) {
  const { context = 'default', previousValues = {}, userPreferences = {} } = options;

  // Get last used values from localStorage
  const getLastUsedValues = (fields: string[]) => {
    try {
      const key = `smart-defaults-${context}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return fields.reduce((acc, field) => {
          if (parsed[field] !== undefined) {
            acc[field] = parsed[field];
          }
          return acc;
        }, {} as Record<string, any>);
      }
    } catch (error) {
      logger.error('Failed to load smart defaults:', error);
    }
    return {};
  };

  // Save values for future use
  const saveDefaults = (values: Record<string, any>) => {
    try {
      const key = `smart-defaults-${context}`;
      const existing = localStorage.getItem(key);
      const parsed = existing ? JSON.parse(existing) : {};
      
      // Merge with existing, prioritizing new values
      const merged = { ...parsed, ...values };
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (error) {
      logger.error('Failed to save smart defaults:', error);
    }
  };

  // Smart sorting defaults based on usage frequency
  const getSmartSortDefault = (availableFields: string[]) => {
    try {
      const key = `sort-frequency-${context}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const frequency: Record<string, number> = JSON.parse(stored);
        
        // Find most used field
        const mostUsed = availableFields.reduce((best, field) => {
          const count = frequency[field] || 0;
          const bestCount = frequency[best] || 0;
          return count > bestCount ? field : best;
        }, availableFields[0]);
        
        return mostUsed;
      }
    } catch (error) {
      logger.error('Failed to get smart sort default:', error);
    }
    return availableFields[0];
  };

  // Track sort field usage
  const trackSortUsage = (field: string) => {
    try {
      const key = `sort-frequency-${context}`;
      const stored = localStorage.getItem(key);
      const frequency: Record<string, number> = stored ? JSON.parse(stored) : {};
      
      frequency[field] = (frequency[field] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(frequency));
    } catch (error) {
      logger.error('Failed to track sort usage:', error);
    }
  };

  // Smart filter defaults based on common patterns
  const getSmartFilterDefaults = () => {
    try {
      const key = `filter-patterns-${context}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const patterns: Record<string, any> = JSON.parse(stored);
        return patterns.mostRecent || {};
      }
    } catch (error) {
      logger.error('Failed to get smart filter defaults:', error);
    }
    return {};
  };

  // Save filter pattern
  const saveFilterPattern = (filters: Record<string, any>) => {
    try {
      const key = `filter-patterns-${context}`;
      const stored = localStorage.getItem(key);
      const patterns: Record<string, any> = stored ? JSON.parse(stored) : {};
      
      patterns.mostRecent = filters;
      patterns.history = patterns.history || [];
      patterns.history.unshift(filters);
      patterns.history = patterns.history.slice(0, 5); // Keep last 5
      
      localStorage.setItem(key, JSON.stringify(patterns));
    } catch (error) {
      logger.error('Failed to save filter pattern:', error);
    }
  };

  // Clear all smart defaults for context
  const clearSmartDefaults = () => {
    try {
      localStorage.removeItem(`smart-defaults-${context}`);
      localStorage.removeItem(`sort-frequency-${context}`);
      localStorage.removeItem(`filter-patterns-${context}`);
    } catch (error) {
      logger.error('Failed to clear smart defaults:', error);
    }
  };

  return {
    getLastUsedValues,
    saveDefaults,
    getSmartSortDefault,
    trackSortUsage,
    getSmartFilterDefaults,
    saveFilterPattern,
    clearSmartDefaults,
  };
}
