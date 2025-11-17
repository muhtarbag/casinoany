import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExportDialogProps {
  siteId: string;
  siteName: string;
  availableData?: ExportDataType[];
}

export interface ExportDataType {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
}

const defaultDataTypes: ExportDataType[] = [
  {
    id: 'analytics',
    label: 'Analytics Verileri',
    description: 'Görüntüleme, tıklama ve dönüşüm metrikleri',
    enabled: true,
  },
  {
    id: 'reviews',
    label: 'Değerlendirmeler',
    description: 'Kullanıcı yorumları ve puanları',
    enabled: true,
  },
  {
    id: 'complaints',
    label: 'Şikayetler',
    description: 'Tüm şikayet kayıtları',
    enabled: false,
  },
  {
    id: 'social',
    label: 'Sosyal Medya',
    description: 'Sosyal medya etkileşimleri',
    enabled: false,
  },
];

export function ExportDialog({
  siteId,
  siteName,
  availableData = defaultDataTypes,
}: ExportDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [selectedData, setSelectedData] = useState<string[]>(
    availableData.filter((d) => d.enabled).map((d) => d.id)
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleDataType = (id: string) => {
    setSelectedData((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen en az bir veri türü seçin',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      // Simulated export - replace with actual export logic
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const filename = `${siteName.replace(/\s+/g, '_')}_rapor_${new Date().toISOString().split('T')[0]}.${format}`;

      toast({
        title: 'Rapor Hazırlandı',
        description: `${filename} başarıyla oluşturuldu`,
      });

      setIsOpen(false);
      setSelectedData(availableData.filter((d) => d.enabled).map((d) => d.id));
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Rapor oluşturulurken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case 'pdf':
        return FileText;
      case 'excel':
        return FileSpreadsheet;
      case 'csv':
        return Table;
      default:
        return Download;
    }
  };

  const FormatIcon = getFormatIcon();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {!isMobile && 'Rapor İndir'}
        </Button>
      </DialogTrigger>
      <DialogContent className={isMobile ? 'max-w-[95vw]' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>Rapor İndir</DialogTitle>
          <DialogDescription>
            İndirmek istediğiniz veri türlerini ve formatı seçin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Dosya Formatı</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF - Yazdırılabilir rapor
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel - Düzenlenebilir tablo
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV - Ham veri
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Type Selection */}
          <div className="space-y-3">
            <Label>Dahil Edilecek Veriler</Label>
            <div className="space-y-3">
              {availableData.map((data) => (
                <div key={data.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={data.id}
                    checked={selectedData.includes(data.id)}
                    onCheckedChange={() => toggleDataType(data.id)}
                  />
                  <div className="grid gap-1 leading-none">
                    <Label
                      htmlFor={data.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {data.label}
                    </Label>
                    {data.description && (
                      <p className="text-xs text-muted-foreground">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Count */}
          {selectedData.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              {selectedData.length} veri türü seçildi
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            İptal
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Hazırlanıyor...
              </>
            ) : (
              <>
                <FormatIcon className="h-4 w-4 mr-2" />
                İndir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
