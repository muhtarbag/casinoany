import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export type ExportFormat = 'csv' | 'json' | 'excel';

interface ExportOptions {
  format: ExportFormat;
  filename: string;
  data: any[];
  columns?: string[];
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any[], filename: string, columns?: string[]) => {
    if (!data.length) return '';

    const cols = columns || Object.keys(data[0]);
    const headers = cols.join(',');
    const rows = data.map(item => 
      cols.map(col => {
        const value = item[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  };

  const exportToJSON = (data: any[], filename: string) => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportData = async ({ format, filename, data, columns }: ExportOptions) => {
    if (!data.length) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Export edilecek veri bulunamadı',
      });
      return;
    }

    setIsExporting(true);

    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case 'csv':
          content = exportToCSV(data, filename, columns);
          mimeType = 'text/csv;charset=utf-8;';
          fileExtension = 'csv';
          break;
        case 'json':
          content = exportToJSON(data, filename);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'excel':
          // Excel export uses CSV format but with .xls extension
          content = exportToCSV(data, filename, columns);
          mimeType = 'application/vnd.ms-excel';
          fileExtension = 'xls';
          break;
        default:
          throw new Error('Desteklenmeyen format');
      }

      const fullFilename = `${filename}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      downloadFile(content, fullFilename, mimeType);

      toast({
        title: 'Export Başarılı',
        description: `${data.length} kayıt ${format.toUpperCase()} formatında export edildi`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export Hatası',
        description: error.message || 'Export işlemi başarısız oldu',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
  };
}
