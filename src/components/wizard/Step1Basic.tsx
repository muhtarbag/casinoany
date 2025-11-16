import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';

interface Step1BasicProps {
  selectedSite: string;
  setSelectedSite: (value: string) => void;
  newSiteName: string;
  setNewSiteName: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  sites: any[];
  disabled?: boolean;
}

export const Step1Basic = ({
  selectedSite,
  setSelectedSite,
  newSiteName,
  setNewSiteName,
  companyName,
  setCompanyName,
  description,
  setDescription,
  logoUrl,
  setLogoUrl,
  sites,
  disabled
}: Step1BasicProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Geçersiz dosya tipi', description: 'Sadece JPG, PNG, WEBP veya SVG formatlarında logo yükleyebilirsiniz', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Dosya çok büyük', description: 'Logo boyutu maksimum 5MB olmalıdır', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `temp/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('site-logos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('site-logos').getPublicUrl(filePath);
      setLogoUrl(publicUrl);
      setPreviewUrl(publicUrl);
      toast({ title: 'Başarılı', description: 'Logo yüklendi' });
    } catch (error: any) {
      toast({ title: 'Yükleme hatası', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setLogoUrl('');
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Site ve Şirket Bilgileri</h3>
      <div className="space-y-2">
        <Label htmlFor="site">Site Seçimi *</Label>
        <Select value={selectedSite} onValueChange={setSelectedSite} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Sitenizi seçin veya yeni site ekleyin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_site" className="font-semibold text-primary">
              ➕ Yeni Site Ekle
            </SelectItem>
            {sites && sites.length > 0 ? (
              sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no_sites" disabled>
                Sistemde kayıtlı site bulunmuyor
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {(!sites || sites.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Sistemde henüz site yok. Yeni site ekleyebilirsiniz.
          </p>
        )}
      </div>

      {selectedSite === 'new_site' && (
        <div className="space-y-2">
          <Label htmlFor="newSiteName">Yeni Site Adı *</Label>
          <Input
            id="newSiteName"
            type="text"
            placeholder="Örn: Sahabet, Betboo"
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Site admin onayından sonra aktif hale gelecektir
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="companyName">Şirket Adı</Label>
        <Input
          id="companyName"
          type="text"
          placeholder="Şirket adınız"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          placeholder="Site hakkında kısa açıklama..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Logo (Opsiyonel)</Label>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Desteklenen formatlar: JPG, PNG, WEBP, SVG • Maksimum boyut: 5MB
          </AlertDescription>
        </Alert>
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative w-32 h-32 border-2 border-dashed rounded-lg p-2 flex items-center justify-center bg-muted/20">
              <img src={previewUrl} alt="Logo önizleme" className="max-w-full max-h-full object-contain" />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleRemove} disabled={disabled || uploading}>
              <X className="w-4 h-4 mr-2" />Kaldır
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input id="logo" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFileChange} disabled={disabled || uploading} className="hidden" />
            <Button type="button" variant="outline" onClick={() => document.getElementById('logo')?.click()} disabled={disabled || uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Yükleniyor...</> : <><Upload className="w-4 h-4 mr-2" />Logo Seç</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
