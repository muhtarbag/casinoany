import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { RotateCcw } from 'lucide-react';

interface WidgetCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WidgetCustomizer({ open, onOpenChange }: WidgetCustomizerProps) {
  const { widgets, toggleWidget, resetWidgets } = useDashboardWidgets();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard Widget'ları</DialogTitle>
          <DialogDescription>
            Görmek istediğiniz widget'ları seçin. Sürükleyerek sıralayabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {widgets.map((widget) => (
            <div key={widget.id} className="flex items-center justify-between">
              <Label htmlFor={widget.id} className="cursor-pointer">
                {widget.title}
              </Label>
              <Switch
                id={widget.id}
                checked={widget.visible}
                onCheckedChange={() => toggleWidget(widget.id)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetWidgets}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Sıfırla
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Tamam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
