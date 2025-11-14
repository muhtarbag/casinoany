/**
 * Notification List Component
 * Displays list of notifications with actions
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { VirtualList } from '@/components/VirtualList';
import type { Notification } from './types';

interface NotificationListProps {
  notifications: Notification[];
  onEdit: (notification: Notification) => void;
  onDelete: (id: string) => void;
  onPreview?: (notification: Notification) => void;
  isDeleting: boolean;
}

const NotificationItem = memo(({ notification, onEdit, onDelete, onPreview }: {
  notification: Notification;
  onEdit: (notification: Notification) => void;
  onDelete: (id: string) => void;
  onPreview?: (notification: Notification) => void;
}) => {
  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{notification.title}</h3>
              <Badge variant={notification.is_active ? 'default' : 'secondary'}>
                {notification.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
              <Badge variant="outline">{notification.notification_type}</Badge>
            </div>
            
            {notification.content && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {notification.content}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {notification.display_pages?.includes('all') ? (
                <span>📄 Tüm sayfalar</span>
              ) : (
                <span>📄 {notification.display_pages?.length || 0} sayfa</span>
              )}
              <span>👥 {notification.user_segments?.join(', ')}</span>
              <span>🔄 {notification.display_frequency}</span>
              {notification.priority > 0 && (
                <span>⭐ Öncelik: {notification.priority}</span>
              )}
            </div>

            {(notification.start_date || notification.end_date) && (
              <div className="mt-2 text-xs text-muted-foreground">
                {notification.start_date && (
                  <span className="mr-2">
                    🗓️ Başlangıç: {new Date(notification.start_date).toLocaleString('tr-TR')}
                  </span>
                )}
                {notification.end_date && (
                  <span>
                    🏁 Bitiş: {new Date(notification.end_date).toLocaleString('tr-TR')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-1 ml-4">
            {onPreview && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPreview(notification)}
                title="Önizle"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(notification)}
              title="Düzenle"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(notification.id)}
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

NotificationItem.displayName = 'NotificationItem';

export function NotificationList({
  notifications,
  onEdit,
  onDelete,
  onPreview,
  isDeleting,
}: NotificationListProps) {
  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Henüz bildirim oluşturulmamış.</p>
          <p className="text-sm mt-2">Yeni bildirim eklemek için yukarıdaki butonu kullanın.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <VirtualList
        items={notifications}
        height={600}
        renderItem={(notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onEdit={onEdit}
            onDelete={onDelete}
            onPreview={onPreview}
          />
        )}
        estimateSize={150}
      />
    </div>
  );
}
