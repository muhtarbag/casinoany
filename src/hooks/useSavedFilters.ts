import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = 'admin-saved-filters';

export function useSavedFilters(context: string = 'default') {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    loadFilters();
  }, [context]);

  const loadFilters = () => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${context}`);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      logger.error('system', 'Failed to load saved filters', error as Error);
    }
  };

  const saveFilter = (name: string, filters: Record<string, any>) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(`${STORAGE_KEY}-${context}`, JSON.stringify(updated));
    return newFilter;
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(`${STORAGE_KEY}-${context}`, JSON.stringify(updated));
  };

  const updateFilter = (id: string, name: string, filters: Record<string, any>) => {
    const updated = savedFilters.map(f =>
      f.id === id ? { ...f, name, filters } : f
    );
    setSavedFilters(updated);
    localStorage.setItem(`${STORAGE_KEY}-${context}`, JSON.stringify(updated));
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    updateFilter,
  };
}
