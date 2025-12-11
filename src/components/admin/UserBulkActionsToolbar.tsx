import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trash2, Shield, X } from 'lucide-react';

interface UserBulkActionsToolbarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkDelete: () => void;
  onBulkVerify?: () => void;
  showVerify?: boolean;
}

export function UserBulkActionsToolbar({
  selectedCount,
  onDeselectAll,
  onBulkApprove,
  onBulkReject,
  onBulkDelete,
  onBulkVerify,
  showVerify = false
}: UserBulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} seçildi
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
            variant="default"
            size="sm"
            onClick={onBulkApprove}
            className="h-8"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Onayla
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkReject}
            className="h-8"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reddet
          </Button>
          {showVerify && onBulkVerify && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkVerify}
              className="h-8"
            >
              <Shield className="w-4 h-4 mr-1" />
              Doğrula
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="h-8"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Sil
          </Button>
        </div>
      </div>
    </div>
  );
}
