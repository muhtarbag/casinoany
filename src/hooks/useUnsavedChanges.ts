import { useEffect, useCallback, useRef } from 'react';
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

  // Browser navigation (refresh, close tab)
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

  // SPA navigation (react-router)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !confirmedRef.current) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

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
