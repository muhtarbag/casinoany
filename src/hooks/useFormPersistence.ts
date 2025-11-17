import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface FormPersistenceOptions {
  key: string;
  debounceMs?: number;
  excludeFields?: string[];
}

export function useFormPersistence<T extends Record<string, any>>(
  initialValues: T,
  options: FormPersistenceOptions
) {
  const { key, debounceMs = 500, excludeFields = [] } = options;
  const storageKey = `form-draft-${key}`;

  // Load saved draft on mount
  const [values, setValues] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialValues, ...parsed };
      }
    } catch (error) {
      logger.error('system', 'Failed to load form draft', error as Error);
    }
    return initialValues;
  });

  // ✅ FIX: Use ref instead of state to prevent memory leak
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ FIX: Remove saveTimeout from deps to prevent stale closures
  const saveToStorage = useCallback((newValues: T) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Filter out excluded fields
        const filtered = Object.keys(newValues).reduce((acc, field) => {
          if (!excludeFields.includes(field)) {
            acc[field] = newValues[field];
          }
          return acc;
        }, {} as Record<string, any>);

        localStorage.setItem(storageKey, JSON.stringify(filtered));
      } catch (error) {
        logger.error('system', 'Failed to save form draft', error as Error);
      }
    }, debounceMs);
  }, [storageKey, excludeFields, debounceMs]);

  // Update values and trigger save
  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => {
      const updated = { ...prev, ...newValues };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setValues(initialValues);
    } catch (error) {
      logger.error('system', 'Failed to clear form draft', error as Error);
    }
  }, [storageKey, initialValues]);

  // Check if draft exists
  const hasDraft = useCallback(() => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  // ✅ FIX: Proper cleanup with ref
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    values,
    updateValues,
    clearDraft,
    hasDraft,
    setValues,
  };
}
