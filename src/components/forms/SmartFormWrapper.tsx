import { ReactNode, useEffect, useState } from 'react';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useSmartDefaults } from '@/hooks/useSmartDefaults';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Trash2 } from 'lucide-react';

interface SmartFormWrapperProps<T extends Record<string, any>> {
  formKey: string;
  initialValues: T;
  context?: string;
  children: (props: {
    values: T;
    updateValues: (values: Partial<T>) => void;
    clearDraft: () => void;
  }) => ReactNode;
  onSubmit?: (values: T) => void;
  excludeFromPersistence?: string[];
}

export function SmartFormWrapper<T extends Record<string, any>>({
  formKey,
  initialValues,
  context = 'default',
  children,
  onSubmit,
  excludeFromPersistence = [],
}: SmartFormWrapperProps<T>) {
  const [showDraftNotice, setShowDraftNotice] = useState(false);

  // Form persistence
  const {
    values,
    updateValues,
    clearDraft,
    hasDraft,
  } = useFormPersistence<T>(initialValues, {
    key: formKey,
    excludeFields: excludeFromPersistence,
  });

  // Smart defaults
  const { saveDefaults } = useSmartDefaults({ context });

  // Check for draft on mount
  useEffect(() => {
    if (hasDraft()) {
      setShowDraftNotice(true);
    }
  }, [hasDraft]);

  const handleSubmit = (formValues: T) => {
    // Save as smart defaults for future use
    saveDefaults(formValues);
    
    // Clear draft after successful submit
    clearDraft();
    
    // Call parent submit handler
    onSubmit?.(formValues);
  };

  const handleClearDraft = () => {
    clearDraft();
    setShowDraftNotice(false);
  };

  return (
    <div className="space-y-4">
      {showDraftNotice && (
        <Alert className="border-info bg-info/5">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="flex items-center justify-between gap-2">
            <span className="text-sm text-info-foreground">
              Daha önce kaydedilmiş taslak bulundu ve otomatik olarak yüklendi.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDraft}
              className="h-7 gap-1 text-xs"
            >
              <Trash2 className="h-3 w-3" />
              Taslağı Sil
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {children({
        values,
        updateValues,
        clearDraft: handleClearDraft,
      })}
    </div>
  );
}
