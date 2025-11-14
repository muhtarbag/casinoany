import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => Promise<void>;
  onBulkActivate: () => Promise<void>;
  onBulkDeactivate: () => Promise<void>;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate
}: BulkActionsToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      await onBulkDelete();
      setProgress(100);
      setShowDeleteDialog(false);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsDeleting(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleBulkActivate = async () => {
    setIsActivating(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      await onBulkActivate();
      setProgress(100);
      setShowActivateDialog(false);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsActivating(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsActivating(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      await onBulkDeactivate();
      setProgress(100);
      setShowDeactivateDialog(false);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsActivating(false);
        setProgress(0);
      }, 500);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedCount === totalCount}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectAll();
                } else {
                  onDeselectAll();
                }
              }}
            />
            <Badge variant="secondary" className="text-sm">
              {selectedCount} / {totalCount} seçildi
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivateDialog(true)}
              disabled={isDeleting || isActivating}
              className="h-8"
            >
              <Eye className="w-4 h-4 mr-1" />
              Aktif Yap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivateDialog(true)}
              disabled={isDeleting || isActivating}
              className="h-8"
            >
              <EyeOff className="w-4 h-4 mr-1" />
              Pasif Yap
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting || isActivating}
              className="h-8"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Toplu Sil
            </Button>
          </div>
        </div>

        {(isDeleting || isActivating) && progress > 0 && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              İşlem devam ediyor... {progress}%
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Silme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCount} adet</strong> siteyi silmek üzeresiniz. 
              Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                'Evet, Sil'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Aktifleştirme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCount} adet</strong> siteyi aktif yapmak üzeresiniz. 
              Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkActivate}
              disabled={isActivating}
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Evet, Aktif Yap'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Pasifleştirme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCount} adet</strong> siteyi pasif yapmak üzeresiniz. 
              Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeactivate}
              disabled={isActivating}
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Evet, Pasif Yap'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
