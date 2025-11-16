import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Step3LogoProps {
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  userId: string;
  disabled?: boolean;
}

export const Step3Logo = ({ logoUrl, setLogoUrl, userId, disabled }: Step3LogoProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(logoUrl);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Geçersiz dosya tipi',
        description: 'Sadece JPG, PNG, WEBP ve SVG formatları desteklenmektedir',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Dosya çok büyük',
        description: 'Logo dosyası maksimum 5MB olabilir',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('site-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      setPreviewUrl(publicUrl);

      toast({
        title: 'Başarılı',
        description: 'Logo yüklendi',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Yükleme hatası',
        description: error.message || 'Logo yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setPreviewUrl('');
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Logo Gereksinimleri:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Desteklenen formatlar: JPG, PNG, WEBP, SVG</li>
            <li>Maksimum dosya boyutu: 5MB</li>
            <li>Önerilen boyut: 500x500 piksel (kare format)</li>
            <li>Şeffaf arka plan önerilir (PNG/SVG)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Logo Yükle</Label>
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative w-40 h-40 border-2 border-dashed rounded-lg p-4 flex items-center justify-center bg-muted/20">
              <img
                src={previewUrl}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Logo yüklendi</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={disabled || uploading}
              >
                <X className="w-4 h-4 mr-1" />
                Kaldır
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Logo dosyanızı yüklemek için tıklayın veya sürükleyin
              </p>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileChange}
                disabled={disabled || uploading}
                className="cursor-pointer"
              />
            </div>
            {uploading && (
              <p className="text-sm text-center text-muted-foreground">
                Yükleniyor...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
