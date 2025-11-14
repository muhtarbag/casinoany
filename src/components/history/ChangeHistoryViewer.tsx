import { useState } from 'react';
import { useChangeHistory, useUndoChange } from '@/hooks/useChangeHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Undo2, Trash2, Edit, PlusCircle, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AnimatedLoader } from '@/components/feedback/AnimatedLoader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const actionIcons = {
  create: PlusCircle,
  update: Edit,
  delete: Trash2,
  bulk_delete: Layers,
  bulk_update: Layers,
};

const actionColors = {
  create: 'text-success',
  update: 'text-info',
  delete: 'text-destructive',
  bulk_delete: 'text-destructive',
  bulk_update: 'text-warning',
};

const actionLabels = {
  create: 'Oluşturuldu',
  update: 'Güncellendi',
  delete: 'Silindi',
  bulk_delete: 'Toplu Silme',
  bulk_update: 'Toplu Güncelleme',
};

interface ChangeHistoryViewerProps {
  tableFilter?: string;
  limit?: number;
}

export function ChangeHistoryViewer({ tableFilter, limit = 20 }: ChangeHistoryViewerProps) {
  const { data: changes, isLoading } = useChangeHistory({ limit, tableFilter });
  const undoMutation = useUndoChange();
  const [selectedChange, setSelectedChange] = useState<string | null>(null);

  const handleUndo = (changeId: string) => {
    undoMutation.mutate(changeId);
    setSelectedChange(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Değişiklik Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedLoader text="Geçmiş yükleniyor..." />
        </CardContent>
      </Card>
    );
  }

  if (!changes || changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Değişiklik Geçmişi</CardTitle>
          <CardDescription>Henüz kayıtlı değişiklik bulunmuyor</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Undo2 className="w-5 h-5" />
          Değişiklik Geçmişi
        </CardTitle>
        <CardDescription>
          Son {changes.length} değişiklik - Geri alınabilir işlemler
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {changes.map((change) => {
              const Icon = actionIcons[change.action_type];
              const colorClass = actionColors[change.action_type];
              const label = actionLabels[change.action_type];

              return (
                <div
                  key={change.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`mt-1 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-xs">
                        {label}
                      </Badge>
                      <span className="text-sm font-medium">{change.table_name}</span>
                      {change.record_ids && change.record_ids.length > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {change.record_ids.length} kayıt
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(change.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>

                    {change.metadata?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {change.metadata.description}
                      </p>
                    )}
                  </div>

                  {(change.action_type === 'delete' || change.action_type === 'bulk_delete') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={undoMutation.isPending}
                          onClick={() => setSelectedChange(change.id)}
                        >
                          <Undo2 className="w-4 h-4 mr-1" />
                          Geri Al
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Değişikliği Geri Al</AlertDialogTitle>
                          <AlertDialogDescription>
                            {change.action_type === 'bulk_delete'
                              ? `${change.record_ids?.length || 0} silinen kaydı geri yüklemek istediğinizden emin misiniz?`
                              : 'Bu silme işlemini geri almak istediğinizden emin misiniz?'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUndo(change.id)}>
                            Geri Al
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
