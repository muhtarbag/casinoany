import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SiteBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  isLoading?: boolean;
}

export function SiteBulkActions({
  selectedCount,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  isLoading = false,
}: SiteBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex gap-2 p-3 bg-muted/50 rounded-lg border">
      <div className="flex-1 flex items-center text-sm font-medium">
        {selectedCount} site seçildi
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Toplu Sil
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount} siteyi silmek üzeresiniz. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkDelete}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        size="sm"
        variant="outline"
        onClick={onBulkActivate}
        disabled={isLoading}
      >
        Aktif Yap
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onBulkDeactivate}
        disabled={isLoading}
      >
        Pasif Yap
      </Button>
    </div>
  );
}
