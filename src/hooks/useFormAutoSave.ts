import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseFormAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number; // ms
  enabled?: boolean;
  storageKey?: string;
}

export function useFormAutoSave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
  storageKey
}: UseFormAutoSaveOptions<T>) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>();
  const isSavingRef = useRef(false);
  const saveOperationRef = useRef<Promise<void> | null>(null);

  // Save draft to localStorage
  const saveDraft = useCallback((draft: T) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [storageKey]);

  // Load draft from localStorage
  const loadDraft = useCallback((): T | null => {
    if (!storageKey) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [storageKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [storageKey]);

  // Auto-save logic
  useEffect(() => {
    if (!enabled || !data) return;

    const dataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (dataString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save draft immediately to localStorage
    saveDraft(data);

    // ✅ FIX: Prevent race condition with operation tracking
    timeoutRef.current = setTimeout(async () => {
      // Skip if already saving
      if (isSavingRef.current || saveOperationRef.current) return;
      
      try {
        isSavingRef.current = true;
        saveOperationRef.current = onSave(data);
        await saveOperationRef.current;
        lastSavedRef.current = dataString;
        clearDraft();
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: 'Otomatik kaydetme başarısız',
          description: 'Değişiklikleriniz taslak olarak kaydedildi',
          variant: 'destructive'
        });
      } finally {
        isSavingRef.current = false;
        saveOperationRef.current = null;
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, onSave, saveDraft, clearDraft, toast]);

  return {
    loadDraft,
    clearDraft,
    saveDraft
  };
}
