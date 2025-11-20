import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImagePlus, X, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLogoInputProps {
  logoPreview: string | null;
  onLogoChange: (file: File | null, preview?: string) => void;
  onClearLogo: () => void;
}

export const AdminLogoInput = ({ logoPreview, onLogoChange, onClearLogo }: AdminLogoInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Önce dosyayı oku ve preview oluştur
        const reader = new FileReader();
        reader.onloadend = () => {
          onLogoChange(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('🔍 AdminLogoInput - handleFileChange:', { file });
    
    if (file && file.type.startsWith('image/')) {
      // Önce dosyayı oku ve preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        console.log('✅ AdminLogoInput - FileReader completed:', { 
          fileName: file.name, 
          previewLength: preview?.length || 0,
          previewStart: preview?.substring(0, 50)
        });
        onLogoChange(file, preview);
      };
      reader.onerror = () => {
        console.error('❌ AdminLogoInput - FileReader error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="md:col-span-2 space-y-3">
      <Label className="flex items-center gap-2 text-base font-semibold">
        <ImagePlus className="w-5 h-5" />
        Site Logosu
      </Label>

      {/* Drag & Drop Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
          "hover:border-primary hover:bg-accent/50",
          isDragging ? "border-primary bg-accent border-solid scale-105" : "border-muted-foreground/25",
          logoPreview ? "bg-muted/30" : "bg-background"
        )}
      >
        <Input
          ref={fileInputRef}
          id="logo"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          {logoPreview ? (
            <>
              {/* Logo Preview */}
              <div className="relative group">
                <img
                  src={logoPreview}
                  alt="Logo önizleme"
                  className="w-40 h-40 object-contain bg-white rounded-lg border-2 border-border p-4 shadow-sm"
                  onLoad={() => console.log('✅ Logo preview loaded:', logoPreview?.substring(0, 50))}
                  onError={(e) => {
                    console.error('❌ Logo preview failed to load:', logoPreview?.substring(0, 50));
                    console.error('Error event:', e);
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🗑️ Clearing logo');
                    onClearLogo();
                  }}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Logo yüklendi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Değiştirmek için tıklayın veya yeni resmi sürükleyin
              </p>
            </>
          ) : (
            <>
              {/* Upload Icon */}
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-base font-medium">
                  Logo yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="text-sm text-muted-foreground">
                  Desteklenen formatlar: JPG, PNG, WebP, SVG
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Text */}
      <div className="flex items-start gap-2 p-3 bg-info/10 border border-info/20 rounded-lg">
        <ImagePlus className="w-4 h-4 text-info mt-0.5 shrink-0" />
        <p className="text-xs text-info">
          <strong>Otomatik Optimizasyon:</strong> Yüklenen logolar otomatik olarak 400x200px boyutuna optimize edilir ve WebP formatına çevrilir. Maksimum dosya boyutu: 5MB
        </p>
      </div>
    </div>
  );
};
