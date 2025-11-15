import { useState, useEffect, useCallback } from 'react';

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
      console.error('Failed to load form draft:', error);
    }
    return initialValues;
  });

  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced save to localStorage
  const saveToStorage = useCallback((newValues: T) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
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
        console.error('Failed to save form draft:', error);
      }
    }, debounceMs);

    setSaveTimeout(timeout);
  }, [storageKey, excludeFields, debounceMs, saveTimeout]);

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
      console.error('Failed to clear form draft:', error);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    values,
    updateValues,
    clearDraft,
    hasDraft,
    setValues,
  };
}
