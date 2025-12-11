import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  optimizeBonusImage, 
  formatFileSize, 
  BONUS_IMAGE_CONFIG 
} from '@/lib/imageOptimization';

interface BonusImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export const BonusImageUploader = ({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved 
}: BonusImageUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Show preview immediately
      const tempPreview = URL.createObjectURL(file);
      setPreviewUrl(tempPreview);

      // Optimize image
      toast({
        title: 'Görsel optimize ediliyor...',
        description: 'Lütfen bekleyin',
      });

      const optimized = await optimizeBonusImage(file);

      toast({
        title: 'Optimizasyon tamamlandı',
        description: `${formatFileSize(optimized.originalSize)} → ${formatFileSize(optimized.optimizedSize)} (${Math.round(optimized.compressionRatio)}% küçültme)`,
      });

      // Generate unique filename
      const fileExt = 'webp'; // Always use WebP after optimization
      const fileName = `bonus-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('bonus-images')
        .upload(filePath, optimized.blob, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bonus-images')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);

      toast({
        title: 'Başarılı',
        description: 'Görsel yüklendi',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Görsel yüklenemedi',
        variant: 'destructive',
      });
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          Bonus Görseli <span className="text-muted-foreground">(Opsiyonel)</span>
        </Label>
        <div className="text-xs text-muted-foreground">
          Önerilen: {BONUS_IMAGE_CONFIG.maxWidth}x{BONUS_IMAGE_CONFIG.maxHeight}px • Maks: 5MB
        </div>
      </div>

      {previewUrl ? (
        <div className="relative rounded-lg border overflow-hidden group">
          <img 
            src={previewUrl} 
            alt="Bonus görseli" 
            className="w-full h-48 object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Kaldır
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Yükleniyor...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Görseli yüklemek için tıklayın
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG veya WebP • {BONUS_IMAGE_CONFIG.recommendedRatio} oran önerilir
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={BONUS_IMAGE_CONFIG.acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {!previewUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Görsel Yükle
        </Button>
      )}
    </div>
  );
};
