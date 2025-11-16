import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface SiteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string | null;
  siteName: string;
  logoUrl: string | null;
  rating: number | null;
}

/**
 * DISABLED - Analytics removed for performance
 */
export function SiteDetailDialog({
  open,
  onOpenChange,
  siteName,
}: SiteDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{siteName} - Detaylı Analiz</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              Detaylı site analizi performans iyileştirmesi için devre dışı bırakıldı.
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
