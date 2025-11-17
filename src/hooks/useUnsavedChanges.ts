import { useCallback, useRef } from 'react';
import { useBeforeUnload } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  isDirty: boolean;
  message?: string;
  onLeave?: () => void;
}

export function useUnsavedChanges({
  isDirty,
  message = 'Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?',
  onLeave
}: UseUnsavedChangesOptions) {
  const confirmedRef = useRef(false);

  // ✅ FIX: Use only useBeforeUnload - no duplicate event listeners
  // This hook already handles both browser and SPA navigation
  useBeforeUnload(
    useCallback(
      (event) => {
        if (isDirty && !confirmedRef.current) {
          event.preventDefault();
          return message;
        }
      },
      [isDirty, message]
    ),
    { capture: true }
  );

  const confirmLeave = useCallback(() => {
    if (!isDirty) return true;
    
    const confirmed = window.confirm(message);
    if (confirmed) {
      confirmedRef.current = true;
      onLeave?.();
    }
    return confirmed;
  }, [isDirty, message, onLeave]);

  const resetConfirmation = useCallback(() => {
    confirmedRef.current = false;
  }, []);

  return {
    confirmLeave,
    resetConfirmation,
    isDirty
  };
}
