import { Button } from '@/components/ui/button';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FloatingActionBarProps {
  isDirty: boolean;
  isLoading: boolean;
  lastSaved?: Date;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  variant?: 'fixed' | 'sticky';
}

export const FloatingActionBar = ({
  isDirty,
  isLoading,
  lastSaved,
  onSave,
  onCancel,
  saveLabel = 'Kaydet',
  cancelLabel = 'İptal',
  variant = 'fixed'
}: FloatingActionBarProps) => {
  if (!isDirty && !isLoading) return null;

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce kaydedildi';
    if (diffMins === 1) return '1 dakika önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 saat önce';
    return `${diffHours} saat önce`;
  };

  return (
    <div 
      className={cn(
        'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90',
        variant === 'fixed' ? 'fixed bottom-0 left-0 right-0 z-50' : 'sticky bottom-0',
        'animate-in slide-in-from-bottom-5 duration-300'
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isDirty && (
              <Badge variant="outline" className="gap-2 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                Kaydedilmemiş değişiklikler
              </Badge>
            )}
            {lastSaved && !isDirty && (
              <p className="text-sm text-muted-foreground">
                {formatLastSaved(lastSaved)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isLoading || !isDirty}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {saveLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
