import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useDataExport, ExportFormat } from '@/hooks/useDataExport';
import { Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  defaultFilename: string;
  title?: string;
  description?: string;
}

export function DataExportDialog({
  open,
  onOpenChange,
  data,
  defaultFilename,
  title = 'Veriyi Dışa Aktar',
  description = 'Export formatını seçin ve dosya adını belirleyin',
}: DataExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState(defaultFilename);
  const { exportData, isExporting } = useDataExport();

  const handleExport = async () => {
    await exportData({
      format,
      filename,
      data,
    });
    onOpenChange(false);
  };

  const formatIcons = {
    csv: FileText,
    json: FileJson,
    excel: FileSpreadsheet,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Dosya Adı</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="dosya-adi"
            />
          </div>

          <div className="space-y-2">
            <Label>Export Formatı</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  CSV - Virgülle Ayrılmış Değerler
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="w-4 h-4" />
                  JSON - JavaScript Object Notation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel - Microsoft Excel
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-sm text-muted-foreground">
            {data.length} kayıt export edilecek
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !filename}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Export Ediliyor...' : 'Export Et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
